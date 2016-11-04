var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    request = require('request'),
    download = require('download-file'),
    http = require('http'),
    cheerio = require('cheerio');

var app = express();
var date = require('./getdate.js');
var wordList = require('./blackList');
var colors = require('colors');
var Q = require('q');
var _ = require('underscore');
var sizeOf = require('image-size');
var now = require('sleep');
var filenameBuild = "";
var reg = new RegExp();
var size = require('request-image-size');


// LIST HANDLING

list = [];
var titleList = [];
var descList = [];
var linkList = [];
var imgList = [];
var dimList = [];


// EXAMPLE URL
var url = "http://www.straitstimes.com/asia/se-asia/philippines-president-duterte-dares-us-cia-to-oust-him";




request(url, function(err, res, body) {
    var $ = cheerio.load(body);

				// TITLES
        if ($('meta[property="og:title"]').length > 0) {
          $('meta[property="og:title"]').each(function() {
            console.log($(this).attr().content);
          });
        } else if($('title').length > 0) {
          $('title').each(function() {
          	console.log($(this).text());
          });
        }

				// DESCRIPTIONS
        if (("*[name='description']").length > 0) {
          console.log($("meta[name='description']").attr().content);
        }


// ------------- --------------- -------------- ---------------- ----------------------
//                                 GET IMAGES
//  IN WHICH OUR HERO SEARCHES THROUGH EACH AND EVERY IMG TAG LOOKING FOR THE BIGGEST
//  IMAGE HOPING THAT IT WILL BE THE ONE RELATED TO THE STORY IN SCOPE
//
// ------------- --------------- -------------- ---------------- ----------------------

        var imgs = [];

        Q.fcall(function(){
        return $('img').each(function(index, value){
          var url = $(value).attr('src');
          var dataurl = $(value).attr('data-src');
          if (url !== undefined) {
            if (url.substring(0,4) === "http") {
              imgs.push(url);
            }
          }
          if (dataurl !== undefined) {
            if (dataurl.substring(0,4) === "http") {
              imgs.push(dataurl);
            }
          }
        });
      })
      .then(function(){
          var o = {};
          imgs.forEach(function(object){
            size(object, function(err, dimensions, length) {
              dimList.push(dimensions.height);
              o = {
                url: object,
                w: dimensions.height
              };
              imgList.push(o);
            });
          });
        }).then(function(){
          setTimeout(function(){
            var largest = Math.max.apply(Math, dimList);
            var found = _.find(imgList, function(obj){ return obj.w === largest; });
            // BELOW IS THE RETURN VALUE OF EVERY IMG TAG ON THE PAGE. AGAIN.
            // NOT GUARANTEED, BUT MOST LIKELY AN IMAGE RELATED TO THE STORY.
            if (found === undefined) {
              console.log('NO IMAGE URL FOUND');
            } else {
              console.log(found.url);
            }
          }, 1000);
        });


});
