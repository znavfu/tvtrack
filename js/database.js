var gui = require('nw.gui');
var Datastore = require('nedb');
var path = require('path');

var database = {
    db: {
        torrentfolders: new Datastore({
            filename: path.join(gui.App.dataPath, 'torrentfolders.db'),
            autoload: true
        }),
        favourites: new Datastore({
            filename: path.join(gui.App.dataPath, 'favourites.db'),
            autoload: true
        }),
        shows: new Datastore({
            filename: path.join(gui.App.dataPath, 'shows.db'),
            autoload: true
        }),
    },
    local: {
        folders: {
            add: function(folder, callback) {
                database.db.torrentfolders.remove({ path: folder.path }, { multi: true }, function(err, numRemoved) {
                    database.db.torrentfolders.insert(folder, function(err) {
                        return callback();
                    });
                });
            },
            get: function(callback) {
                database.db.torrentfolders.find({}, function(err, docs) {
                    return callback(docs);
                });
            },
            remove: function(folder, callback) {
                database.db.torrentfolders.remove(folder, { multi: true }, function(err, numRemoved) {
                    return callback();
                });
            },
        }
    },
    favourites: {
        add: function(show, callback) {
            database.db.favourites.find({ id: show.id }, function(err, docs) {
                if (docs.length > 0) {
                    database.db.favourites.update({id: show.id}, show, function(err) {                        
                        return callback();
                    });
                } else {
                    database.db.favourites.insert(show, function(err) {
                        return callback();
                    });
                }
            });
        },
        get: function(partial, callback) {
            database.db.favourites.find(partial, function(err, docs) {
                return callback(docs);
            });
        },
        remove: function(partial, callback) {
            database.db.favourites.remove(partial, function(err, numRemoved) {
                return callback();
            });
        },
        nuke: function(callback) {
            database.db.favourites.remove({}, function(err, numRemoved) {
                return callback();
            });
        },
    },
    shows: {
        add: function(show, callback) {
            database.db.shows.find({ id: show.id }, function(err, docs) {
                if (docs.length > 0) {
                    database.db.shows.update({id: show.id}, show, function(err) {
                        return callback();
                    });
                } else {
                    database.db.shows.insert(show, function(err) {
                        return callback();
                    });
                }
            });
        },
        get: function(partial, callback) {
            database.db.shows.find(partial, function(err, docs) {
                return callback(docs);
            });
        },
        nuke: function(callback) {
            database.db.shows.remove({}, function(err) {
                return callback();
            });
        }
    }
};
