var favourites = {
    shows: [],
    recommended: [],
    tempshowdata: [],
    ready: false,
    save: function(show) {
        show.refreshed = new Date().getTime();
        database.favourites.add(show);
    },
    remove: function(id) {
        database.favourites.remove({ "id": parseInt(id) }, function() {
            favourites.load();
        });
    },
    load: function() {
        database.favourites.get({}, function(data) {
            favourites.shows = data;
            favourites.shows.sort(function(a, b) {
                if (a.title < b.title)
                    return -1;
                if (a.title > b.title)
                    return 1;
                return 0;
            });
            favourites.ready = true;
            favourites.display();
            favourites.sync();
        });
    },
    display: function() {
        template.construct("favourite", favourites.shows, function(html) {
            $('.favourites>.favouriteshows').html(html);
        });
    },
    recommend: function() {
        template.construct("recommended", favourites.recommended, function(html) {
            $('.favourites>.favouriterecommended').html(html);
        });
    },
    sync: function() {
        if (!local.ready) {
            setTimeout(function() { favourites.sync(); }, 500);
        } else {
            var getAllEpisodesCallback = function(lastepisode) {
                return function(error, data) {
                    var latesttorrent = getEpisodeDetailsFromName(data.episodes[0].title);
                    var favobj = {
                        id: data.id,
                        title: data.episodes[0].show,
                        latesttorrent: latesttorrent,
                        lasttorrent: lastepisode,
                        refreshed: new Date().getTime()
                    };
                    favourites.recommended.push(favobj);
                    favourites.tempshowdata.push(data);
                    favourites.recommend();
                };
            };

            for (var show in local.shows) {
                var found = -1;
                if (localStorage[show] !== undefined) {
                    found = localStorage[show];
                } else {
                    for (var item in showlist.data) {
                        var d = compareShowNames(show, showlist.data[item].title);
                        if (d) {
                            found = item;
                            localStorage[show] = item;
                            break;
                        }
                    }
                }

                var allepisodes = [];
                for (var i in local.shows[show].torrents) {
                    var episode = local.shows[show].torrents[i].name;
                    var details = getEpisodeDetailsFromName(episode);
                    allepisodes.push(details);
                }
                var lastepisode = allepisodes[allepisodes.length - 1];

                if (found !== -1) {
                    var showID = showlist.data[found].id;
                    var showadded = false;
                    for (var favshow in favourites.shows) {
                        if (favourites.shows[favshow].id === showID) {
                            showadded = true;
                            break;
                        }
                    }
                    for (var recommendedshow in favourites.recommended) {
                        if (favourites.recommended[recommendedshow].id === showID) {
                            showadded = true;
                            break;
                        }
                    }
                    if (!showadded) {
                        eztv.getShowEpisodes(showID, getAllEpisodesCallback(lastepisode));
                    }
                }
            }
        }
    }
};
favourites.load();

$(document).on('click', '.removefavourite', function(e) {
    var showID = $(this).parent().parent().attr('data-id');
    favourites.remove(showID);
});

$(document).on('click', '.addfavourite', function(e) {
    var showID = $(this).parent().parent().attr('data-id');
    for (var item in favourites.recommended) {
        if (favourites.recommended[item].id == showID) {
            favourites.save(favourites.recommended[item]);
            shows.save(favourites.tempshowdata[item]);
            favourites.recommended.splice(item, 1);
            favourites.recommend();
            break;
        }
    }
    favourites.remove(showID);
    setTimeout(function() {
        favourites.load();
    }, 1000);
});
