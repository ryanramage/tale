module.exports = {
    "name" : prompt('story name', basename),
    "version" : "0.0.0",
    "description" : (function (cb) {
        var fs = require('fs');
        var value;
        try {
            var src = fs.readFileSync('README.md', 'utf8');
            value = src.split('\n').filter(function (line) {
                return /\s+/.test(line)
                    && line.trim() !== basename.replace(/^node-/, '')
                ;
            })[0]
                .trim()
                .replace(/^./, function (c) { return c.toLowerCase() })
                .replace(/\.$/, '')
            ;
        }
        catch (e) {}

        return prompt('description', value);
    })(),
    "author" : prompt('author'),
    "start_folder" : 'chapter1',
    "requiredItems" : {},
    "requiredStories" : {},
    "license" : "MIT"
}
