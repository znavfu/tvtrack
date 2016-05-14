var template = {
    construct: function(name, obj, callback) {
        fs.readFile("templates/" + name + ".html", function(err, bytes) {
            if(err)
            	return callback("");
            var source = bytes.toString();
            var template = Handlebars.compile(source);
            var html = template(obj);
            return callback(html);
        });
    }
};
