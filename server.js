var express = require('express')
    path = require('path'),
    levelup = require('level'),
    packager = require('./lib/packager'),
    db = levelup('./mydb');

var app = express();


app.use('/cryptids', require('./lib/web')(db) );

app.listen(3000);
console.log("Express server listening on port " + 3000);
