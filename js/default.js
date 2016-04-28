var request = require('request');
var querystring = require('querystring');
var eztv = require('eztv');
var cheerio = require('cheerio');
var fs = require('fs');
var levenshtein = require('levenshtein');
var Handlebars = require('handlebars');
var he = require('he');

var showlist = [];
var myshows = {};
var availabletorrents = {};
var torrentfolder = '';

var getSimilarity = function(str1, str2) {
    var l = new levenshtein(str1, str2);
    return (1 - (l.distance / Math.max(str1.length, str2.length))) * 100;
};

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

var internet = {
    cookieJar: undefined,
    makeRequest: function(url, formdata, callback) {
        request.get({
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.110 Safari/537.36',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                jar: internet.cookieJar,
                body: querystring.stringify(formdata)
            },
            function(error, response, data) {
                if (error)
                    console.log(error);
                callback(data);
            });
    },
};

var pages = {
    goToPage: function(page) {
        $('.page').not('.'+page).animate({opacity: 0}, 200, function() {
            $('.page').not('.'+page).css({width: '0', top: '100%'});
        });
        $('.'+page).css({width: '100%', top: 0});
        $('.'+page).animate({opacity: 1}, 200, function() {
            
        });
    }
};

$(document).ready(function() {
    pages.goToPage('availabletorrents');
    getMyShows();
});

$(document).on('click', '.locallist-show-title', function(e) {
    var elements = $(this).parent().children('.locallist-show-episodes').children("div").length;
    $(this).parent().children('.locallist-show-episodes').stop();
    elements = Math.max(elements,4);
    elements = Math.min(elements,10);
    $(this).parent().children('.locallist-show-episodes').slideToggle(50*elements);
});

$(document).on('click', '.availabletorrents-show-title', function(e) {
    var elements = $(this).parent().children('.availabletorrents-show-episodes').children("div").length;
    $(this).parent().children('.availabletorrents-show-episodes').stop();
    elements = Math.max(elements,4);
    elements = Math.min(elements,10);
    $(this).parent().children('.availabletorrents-show-episodes').slideToggle(50*elements);
});

$(document).on('click', '.pagelink', function(e) {
    var page = $(this).attr('data-page');
    pages.goToPage(page);
    if(page==="locallist" || page==="availabletorrents") {
        getMyShows();
    }
});

var getEpisodeDetailsFromName = function(name) {
    var showregex = /[Ss]{1}[0-9]{2}[Ee]{1}[0-9]{2}/ig;
    var match = showregex.exec(name);
    var obj = {
        season: 0,
        episode: 0
    };
    if(match!==null) {
        obj.season = parseInt(match[0].substr(1,2));
        obj.episode = parseInt(match[0].substr(4,2));
    }
    return obj;
};