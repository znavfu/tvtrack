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
        fs.writeFile('data/showlist.json', JSON.stringify({ shows: showlist }), function(err) {
            if (err)
                console.log(err);
        });
    });
};

var loadShows = function() {
    fs.readFile('data/showlist.json', function(err, data) {
        if (!err) {
            showlist = JSON.parse(data);
        }
    });
};
loadShows();