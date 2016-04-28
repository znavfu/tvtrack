var loadAllTorrentFolders = function() {
    database.getTorrentFolders(function(data) {
        var source = $("#torrentfolder-template").html();
        var template = Handlebars.compile(source);
        var wrapper = data;
        var torrentfoldershtml = template(wrapper);
        $('.torrentfolders').html(torrentfoldershtml);
    });
};
loadAllTorrentFolders();

$(document).on('change', '#torrentfolderinput', function(e) {
    torrentfolder = $(this).val().trim();
    database.addTorrentFolder({ path: torrentfolder }, function() {
        loadAllTorrentFolders();
    });
});

$(document).on('click', '.removetorrentfolder', function(e) {
    var path = $(this).parent().parent().children('.torrentfolder-path').attr('data-path');
    var folder = {
        path: path
    };
    database.removeTorrentFolder(folder, function() {
        loadAllTorrentFolders();
    });
});
