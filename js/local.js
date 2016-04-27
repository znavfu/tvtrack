var loadLocalShows = function() {
    var source = $("#locallist-template").html();
    var template = Handlebars.compile(source);
    var panel1 = {};
    var panel2 = {};
    for(var i=0; i<Object.keys(myshows).length; i++) {
        if(i%2===0) {
            panel1[Object.keys(myshows)[i]] = myshows[Object.keys(myshows)[i]];
        }
        else {
            panel2[Object.keys(myshows)[i]] = myshows[Object.keys(myshows)[i]];
        }
    }
    var panel1html = template(panel1);
    var panel2html = template(panel2);
    $('.locallist>.panel').eq(0).html(panel1html);
    $('.locallist>.panel').eq(1).html(panel2html);
    $('.locallist-show-episodes').slideUp(10);
};

var getMyShows = function() {
    myshows = {};

    var parseTorrentedFolder = function(filepath) {
        var showregex = /[Ss]{1}[0-9]{2}[Ee]{1}[0-9]{2}/ig;
        var match = showregex.exec(filepath);
        if (match) {
            var show = filepath.substr(0, match.index);
            var parts = show.split('.');
            if (parts[parts.length - 1] === "")
                parts.pop();
            show = parts.join(" ");
            show = titleCase(show);
            var name = filepath.substr(0, match.index+match[0].length);
            return {
                name: name,
                show: show
            };
        } else {
            return undefined;
        }
    };

    var readTorrentFolderCallback = function(torrentfolder) {
        return function(err, files) {
            if (err) {
                console.log(err);
            } else {
                for (var item in files) {
                    var obj = parseTorrentedFolder(files[item]);
                    if (obj !== undefined) {
                        var shownames = Object.keys(myshows);
                        var show = obj.show;
                        if (shownames.length === 0 || getSimilarity(shownames[shownames.length - 1], show) < 75) {                            
                            myshows[show] = {
                                torrentfolder: torrentfolder,
                                torrents: []
                            };
                        }
                        myshows[show].torrents.push({
                            name: obj.name,
                            path: files[item]
                        });
                    }
                }
                loadLocalShows();
            }
        };
    };

    database.getTorrentFolders(function(data) {
        for (var item in data) {
            var torrentfolder = data[item].path;
            fs.readdir(torrentfolder, readTorrentFolderCallback(torrentfolder));
        }
    });
};
