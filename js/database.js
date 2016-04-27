var gui = require('nw.gui');
var Datastore = require('nedb');
var path = require('path');

var database = {
    db: {
        torrentfolders: new Datastore({
            filename: path.join(gui.App.dataPath, 'torrentfolders.db'),
            autoload: true
        }),
    },
    addTorrentFolder: function(folder, callback) {
        database.db.torrentfolders.remove({ path: folder.path }, { multi: true }, function(err, numRemoved) {
            database.db.torrentfolders.insert(folder, function(err) {
                return callback();
            });
        });
    },
    getTorrentFolders: function(callback) {
        database.db.torrentfolders.find({}, function(err, docs) {
            return callback(docs);
        });
    },
    removeTorrentFolder: function(folder, callback) {
        database.db.torrentfolders.remove(folder, { multi: true }, function(err, numRemoved) {
           return callback();
        });
    },
};