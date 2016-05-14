var local = {
    shows: {},
    ready: false,
    load: function() {
        template.construct("local", local.shows, function(html) {
            $('.local>.showlist').eq(0).html(html);
        });
    },
    sync: function() {
        local.shows = {};

        var parseTorrentedFolder = function(filepath) {
            var showregex = /[Ss]{1}[0-9]{2}[Ee]{1}[0-9]{2}/ig;
            var match = showregex.exec(filepath);
            if (match) {
                var show = filepath.substr(0, match.index);
                var parts = show.split('.');
                if (parts[parts.length - 1] === "")
                    parts.pop();
                show = parts.join(" ");
                show = titleCase(show).trim();
                var name = filepath.substr(match.index, match[0].length).trim();
                return {
                    name: name,
                    show: show
                };
            } else {
                return undefined;
            }
        };

        var callbackcount = 0;
        var readTorrentFolderCallback = function(torrentfolder) {
            return function(err, files) {
                if (err) {
                    console.log(err);
                } else {
                    for (var item in files) {
                        var obj = parseTorrentedFolder(files[item]);
                        if (obj !== undefined) {
                            var shownames = Object.keys(local.shows);
                            var show = obj.show;
                            if (shownames.length === 0 || getSimilarity(shownames[shownames.length - 1], show) < 75) {
                                local.shows[show] = {
                                    torrentfolder: torrentfolder,
                                    torrents: []
                                };
                            }
                            local.shows[show].torrents.push({
                                name: obj.name,
                                path: files[item]
                            });
                        }
                    }
                    callbackcount--;
                    if(callbackcount===0) {
                        local.ready=true;
                        //favourites.sync();
                    }
                    local.load();
                }
            };
        };

        database.local.folders.get(function(data) {
            callbackcount = data.length;
            for (var item in data) {
                var torrentfolder = data[item].path.trim();
                fs.readdir(torrentfolder, readTorrentFolderCallback(torrentfolder));
            }
        });
    }
};
local.sync();