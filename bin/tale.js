#!/usr/bin/env node

var path = require('path'),
    levelup = require('level'),
    packager = require('../lib/packager'),
    FileStore = require('../lib/file-store'),
    dir = process.argv[2] || __dirname,
    out_dir = process.argv[3] || __dirname + '/out';

var fs = FileStore(out_dir, {
  js_in_manifest: true,
  write_index_html: true,
  write_tale_js: true
})

packager( path.normalize(dir), fs, function(err, graph){
  if (err) return console.log("error uploading");
  console.log("Story ID: ", graph.id);
})