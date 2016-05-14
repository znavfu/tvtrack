var torrents = {
    unwatched: {},
    display: function() {
        template.construct("torrents", torrents.unwatched, function(html) {
            $('.torrents').html(html);
        });
    },
    find: function() {
        var isnewshow = function(cur, last) {
            if (cur.season > last.season)
                return true;
            if (cur.season == last.season)
                if (cur.episode > last.episode)
                    return true;
            return false;
        };

        if (favourites.ready === false || shows.ready === false) {
            setTimeout(function() { torrents.find(); }, 500);
        } else {
            for (var item in favourites.shows) {
                var show = favourites.shows[item];
                var latesttorrent = show.latesttorrent;
                var lasttorrent = show.lasttorrent;
                var data = shows.getlocal(show.id);
                for (var i in data.episodes) {
                    var torrent = data.episodes[i];
                    var torrentname = torrent.title;
                    var showname = torrent.show;
                    var curepisode = {
                        season: torrent.seasonNumber,
                        episode: torrent.episodeNumber
                    };
                    if (isnewshow(curepisode, lasttorrent)) {
                        var shownames = Object.keys(torrents.unwatched);
                        if (shownames.indexOf(showname) === -1) {
                            torrents.unwatched[showname] = {
                                torrents: []
                            };
                        }
                        var alreadythere = false;
                        for (var j in torrents.unwatched[showname].torrents) {
                            if (torrents.unwatched[showname].torrents[j].season === torrent.seasonNumber && torrents.unwatched[showname].torrents[j].episode === torrent.episodeNumber) {
                                alreadythere = true;
                                if (torrentname.indexOf("720p") === -1) {
                                    torrents.unwatched[showname].torrents[j].magnet = torrent.magnet;
                                } else {
                                    torrents.unwatched[showname].torrents[j].magnet720p = torrent.magnet;
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
                            torrents.unwatched[showname].torrents.push(obj);
                        }
                    } else {
                        break;
                    }
                }
            }
            torrents.display();
        }
    }
};
torrents.find();

var shows = {
    data: [],
    ready: false,
    load: function() {
        database.shows.get({}, function(data) {
            shows.data = data;
            shows.ready = true;
        });
    },
    save: function(show) {
        show.refreshed = new Date().getTime();
        database.shows.add(show);
    },
    get: function(id, callback) {
        database.shows.get({ id: id }, function(data) {
            return callback(data);
        });
    },
    getlocal: function(id) {
        for (var item in shows.data) {
            if (id == shows.data[item].id)
                return shows.data[item];
        }
        return {};
    },
    update: function() {
        var getShowEpisodesCallback = function() {
            return function(err, data) {
                shows.save(data);
                console.log("Updated: " + data.title);
            };
        };

        database.shows.get({}, function(data) {
            for (var item in data) {
                var showID = data[item].id;
                eztv.getShowEpisodes(showID, getShowEpisodesCallback());
            }
        });
    }
};
shows.load();
//shows.update();

var showlist = {
    data: [],
    ready: false,
    load: function() {
        fs.readFile('data/showlist.json', function(err, data) {
            data=data.toString();
            if(!err) {
                showlist.data = JSON.parse(data);
                showlist.ready = true;    
            }
        });
    },
    update: function() {
        internet.makeRequest("https://eztv.ag/showlist/", {}, function(data) {
            var $ = cheerio.load(data);

            $("table.forum_header_border tr[name=hover]").each(function(i, e) {
                var show = {};

                show.url = $(e).find("td").eq(0).find("a").attr("href");

                var regex = show.url.match(/\/shows\/(\d+)\/([^\/]+)/);
                show.id = parseInt(regex[1]);
                show.slug = regex[2];

                var title = $(e).find("td").eq(0).find("a").html();
                title = he.decode(title);
                if (title.length >= 5 && title.indexOf(", The") === title.length - 5) {
                    title = "The " + title.substr(0, title.length - 5);
                }
                show.title = title;

                show.status = $(e).find("td").eq(1).find("font").html();

                showlist.data.push(show);
            });
            showlist.data.sort(function(a, b) {
                if (a.title.toLowerCase() > b.title.toLowerCase())
                    return 1;
                else if (a.title.toLowerCase() < b.title.toLowerCase())
                    return -1;
                return 0;
            });
            showlist.ready = true;
            fs.writeFile('data/showlist.json', JSON.stringify(showlist.data), function(err) {

            });
        });
    }
};
//showlist.update();
showlist.load();

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