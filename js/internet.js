var getShows = function() {
    internet.makeRequest("https://eztv.ag/search/zxy", {}, function(data) {
        var $ = cheerio.load(data);

        $('select[name="SearchString"]>option').each(function(e) {
            if ($(this).attr('value') !== "") {
                var tvshow = {
                    id: $(this).attr('value'),
                    name: $(this).html()
                };
                showlist.push(tvshow);
            }
        });
        /*fs.writeFile('data/showlist.json', JSON.stringify({ shows: showlist }), function(err) {
            if (err)
                console.log(err);
        });*/
    });
};

var nukeString = function(str) {
    str = str.replace("The ", "");
    str = str.replace(", The", "");
    return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
};

var compareShowNames = function(name, show) {
    var stra = nukeString(name);
    var strb = nukeString(show);
    var sim = getSimilarity(stra, strb);
    /*if (sim > 80) {
        console.log(stra, "<>", strb);
        console.log(sim);
    }*/
    if (sim > 80) {
        return true;
    } else {
        return false;
    }
};

// doesnt work properly
var searchInShowlist = function(name, start, end) {
    if (start === undefined) {
        return searchInShowlist(name, 0, showlist.shows.length - 1);
    } else {
        var middle = parseInt((start + end) / 2);
        var d = compareShowNames(name, he.decode(showlist.shows[middle].name));
        if (d === 0) {
            return middle;
        } else if (start > end) {
            return -1;
        } else if (d === 1) {
            return searchInShowlist(name, middle + 1, end);
        } else if (d === -1) {
            return searchInShowlist(name, start, middle - 1);
        }
    }
};

var loadAvailableTorrents = function() {
    console.log("Starting load");
    var source = $("#availabletorrents-template").html();
    var template = Handlebars.compile(source);
    var panel1 = {};
    var panel2 = {};

    /* Not adding all */

    for (var i = 0, cnt = 0; i < Object.keys(availabletorrents).length; i++) {
        if (availabletorrents[Object.keys(availabletorrents)[i]].torrents.length > 0) {
            if (cnt % 2 === 0) {
                panel1[Object.keys(availabletorrents)[i]] = availabletorrents[Object.keys(availabletorrents)[i]];
            } else {
                panel2[Object.keys(availabletorrents)[i]] = availabletorrents[Object.keys(availabletorrents)[i]];
            }
            cnt++;
        }
    }
    var panel1html = template(panel1);
    var panel2html = template(panel2);
    $('.availabletorrents>.panel').eq(0).html(panel1html);
    $('.availabletorrents>.panel').eq(1).html(panel2html);
    $('.availabletorrents-show-episodes').slideUp(10);
};

var findMyShows = function() {
    console.log("Internet searching for torrents");
    availabletorrents = {};

    var getAllEpisodesCallback = function(lastepisode) {
        return function(error, data) {
            for (var i in data.episodes) {
                var torrent = data.episodes[i];
                var torrentname = torrent.title;
                var show = torrent.show;
                var shownames = Object.keys(availabletorrents);
                if (shownames.indexOf(show) === -1) {
                    availabletorrents[show] = {
                        torrents: []
                    };
                }
                if (torrent.seasonNumber > lastepisode.season || (torrent.seasonNumber === lastepisode.season && torrent.episodeNumber > lastepisode.episode)) {
                    var alreadythere = false;
                    for (var j in availabletorrents[show].torrents) {
                        if (availabletorrents[show].torrents[j].season === torrent.seasonNumber && availabletorrents[show].torrents[j].episode === torrent.episodeNumber) {
                            alreadythere = true;
                            if (torrentname.indexOf("720p") === -1) {
                                availabletorrents[show].torrents[j].magnet = torrent.magnet;
                            } else {
                                availabletorrents[show].torrents[j].magnet720p = torrent.magnet;
                            }
                            break;
                        }
                    }
                    if (alreadythere === false) {
                        var obj = {
                            season: torrent.seasonNumber,
                            episode: torrent.episodeNumber,
                            magnet: "",
                            magnet720p: ""
                        };
                        if (torrentname.indexOf("720p") === -1) {
                            obj.magnet = torrent.magnet;
                        } else {
                            obj.magnet720p = torrent.magnet;
                        }
                        availabletorrents[show].torrents.push(obj);
                    }
                }
            }
            if (Object.keys(myshows).length === Object.keys(availabletorrents).length) {
                loadAvailableTorrents();
            }
        };
    };

    for (var show in myshows) {
        var found = -1;
        if (localStorage[show] !== undefined) {
            found = localStorage[show];
        } else {
            for (var item in showlist.shows) {
                var d = compareShowNames(show, he.decode(showlist.shows[item].name));
                if (d) {
                    found = item;
                    localStorage[show] = item;
                    break;
                }
            }
        }

        var allepisodes = [];
        for (var i in myshows[show].torrents) {
            var episode = myshows[show].torrents[i].name;
            var details = getEpisodeDetailsFromName(episode);
            allepisodes.push(details);
        }
        var lastepisode = allepisodes[allepisodes.length - 1];

        if (found !== -1) {
            var showID = showlist.shows[found].id;
            eztv.getShowEpisodes(showID, getAllEpisodesCallback(lastepisode));
        }
    }
};

var loadShows = function() {
    fs.readFile('data/showlist.json', function(err, data) {
        if (!err) {
            showlist = JSON.parse(data);
        }
    });
};
loadShows();
