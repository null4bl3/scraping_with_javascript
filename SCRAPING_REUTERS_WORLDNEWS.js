var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    request = require('request'),
    http = require('http'),
    download = require('download-file'),
    cheerio = require('cheerio');

var app = express();
var date = require('./getdate.js');
var Story = require('.././schemas/story.js');
var Q = require('q');
var wordList = require('./blackList');
var colors = require('colors');

var ASYNC = require('asyncawait/async');
var AWAIT = require('asyncawait/await');

var connection = require('./Connection');
var crypto = require('crypto');
var now = require('sleep');

// LIST HANDLING

list = [];
var titleList = [];
var discList = [];
var linkList = [];
var imgList = [];

var titleTmp = "";

var url = "http://www.reuters.com/news/archive/worldNews?view=page";

request(url, function(err, res, body){
  var $ = cheerio.load(body);
  var tmpLink = 'http://www.reuters.com' + $('.story-photo a').first().attr('href');


////////////////////////////////////////////////////////////////////////////////


var titleGet = ASYNC(function(){
  try {
    AWAIT($('.story-content .story-title').each(function(item){
          titleList.push($(this).text());
          now.sleep(1);
      }));
  } catch (err) {
    console.log(err);
  }
});

// THIS RETRIEVES AN ARTICLE DESCRIPTION IN MOST CASES

var descGet = ASYNC(function(){
  try {
    AWAIT($('.story-content p').each(function(item){
        discList.push($(this).text());
        now.sleep(1);
    }));
  } catch (err) {
    console.log(err);
  }
});

var linkGet = ASYNC(function(){
  try {
    AWAIT($('.story-photo a').each(function(item){
        linkList.push('http://www.reuters.com' + $(this).attr('href'));
        imageHandling('http://www.reuters.com' + $(this).attr('href'));
        now.sleep(1);
    }));
  } catch (err) {
    console.log(err);
  }
});

// // THIS RETRIEVES AN ARTICLE RELEVANT IMAGE IN MOST CASES

var imgGet = ASYNC(function(){
  try {
    AWAIT($('.story-photo a img').each(function(item){
        imgList.push($(this).attr('org-src'));
        now.sleep(1);
    }));
  } catch (err) {
    console.log(err);
  }
});

var saveScrape = ASYNC(function(){
  var story;
  

for (var i = 0; i < titleList.length; i++) {
  var storyElement = {
    title: String(titleList[i]),
    description: String(discList[i]),
    link: String(linkList[i]),
    image: String(imgList[i]),
    category: "news"
  };

  writeStory(storyElement);
  now.sleep(1);
  }
});

var writeStory = function(story){
  connection.query('INSERT INTO story SET ?', story, function(err, results){
    if (err) {
      // MOST LIKELY JUST A DUPLICATE TITLE / LINK THAT WILL NOT BE INSERTED
      console.log('DUPLICATE STORY. MOVING ON ..');
    }
  });
};



var imageHandling = function(fileURL){
     var hmac = crypto.createHmac('sha256', fileURL);
     var theFileName = hmac.digest('hex');

             var options = {
                 directory: "./images/",
                 filename: theFileName + ".jpg"
             };


             download(fileURL + '.jpg', options, function(err){
                 if (err) {
                   console.log('ERROR IN IMAGE DOWNLOAD');
                   console.log(err);
                 } else {
                   console.log('BEFORE RETUR');
                   console.log(options.filename);
                   return options.filename;
                 }
             });
 };



titleGet().then(descGet).then(linkGet).then(imgGet).then(function(){
  console.log('SAVING REUTERS..'.yellow);
}).then(saveScrape).then(function(story){
  console.log('REUTERS SAVED !'.green);
  process.exit(0);
});

});
