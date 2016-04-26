var loadLocalShows = function() {
    var source = $("#locallist-template").html();
    var template = Handlebars.compile(source);
    var wrapper = myshows;
    var locallisthtml = template(wrapper);
    $('.locallist').html(locallisthtml);
    $('.locallist-show-episodes').slideUp(10);
};

var getMyShows = function() {
    myshows = {};
    fs.readdir(torrentfolder, function(err, files) {
        if (err) {
            console.log(err);
        } else {
            for (var item in files) {
                var showregex = /[Ss]{1}[0-9]{2}[Ee]{1}[0-9]{2}/ig;
                var match = showregex.exec(files[item]);
                if (match) {
                    var name = files[item].substr(0, match.index);
                    var parts = name.split('.');
                    if (parts[parts.length - 1] === "")
                        parts.pop();
                    name = parts.join(" ");
                    name = titleCase(name);
                    var shownames = Object.keys(myshows);
                    if (shownames.length === 0 || getSimilarity(shownames[shownames.length - 1], name) < 75) {
                        myshows[name] = [];
                    }
                    myshows[name].push(files[item]);
                }
            }
            loadLocalShows();
        }
    });
};
