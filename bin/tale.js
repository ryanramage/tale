#!/usr/bin/env node

var path = require('path'),
    levelup = require('level'),
    packager = require('../lib/packager'),
    dir = process.argv[2] || __dirname,
    db = levelup('./mydb');

packager( path.normalize(dir), db, function(err, graph){
  if (err) return console.log("error uploading");
  console.log("Story ID: ", graph.id);
})