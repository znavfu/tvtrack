var settings = {
    torrentfolders: {
        load: function() {
            database.local.folders.get(function(data) {
                template.construct("torrentfolder", data, function(html) {
                    $('.torrentfolders').html(html);
                });
            });
        }
    }
};
var loadAllTorrentFolders = function() {

};
settings.torrentfolders.load();

$(document).on('change', '#torrentfolderinput', function(e) {
    torrentfolder = $(this).val().trim();
    database.local.folders.add({ path: torrentfolder }, function() {
        settings.torrentfolders.load();
    });
});

$(document).on('click', '.removetorrentfolder', function(e) {
    var path = $(this).parent().parent().children('.torrentfolder-path').attr('data-path');
    var folder = {
        path: path
    };
    database.local.folders.remove(folder, function() {
        settings.torrentfolders.load();
    });
});
