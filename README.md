Tale
=====

![Stones](https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKyKW_fKXBbqj099VOTKEplgd6UvLox8wzF6HFSScVc8SO6rMx)

Offline-first, location based story telling. The idea is that people have to physically find
clues in order to progess the story. So create tales that get people moving!

Here is a very boring example, for your reference:

http://t4.io/mrp9xw/

Also, see the wiki: https://github.com/ryanramage/tale/wiki


install
-------

    npm install tale -g

usage
-----

Enter a empty directory and run `tale init` to help you start. eg

    mkdir wibbile-wobble
    cd wibble-wobble
    tale init

This will help you scafold out a story. It has a package.json
which describes the story, and folders representing the chapters. Edit the chapters and make something fun!

To build the html5 app the will play the story, run

    tale build

and this will generate a `build` dir that is totally offline enabled, with each chapter is encrypted.

If you want to test it in a browser:

    tale serve

Publish
-------

When your story is ready, just do

    tale publish

This will publish it to http://t4.io as public story.

If you choose to host is somewhere else, just copy the build directory to any http server.


Plugins
-------

Tale is very minimal by default. Each story can be enhanced via plugins. You can find a current list of
[Tale Plugins](https://www.npmjs.org/browse/keyword/tale-plugin).

To install a plugin, do the following:

    npm install tale-plugin-submit-time

Then add the plugin to your the dist/bootstrap.js file, so it looks like:

    var plugins = {
      markdown: require('tale-plugin-markdown')({}),
      time: require('tale-plugin-submit-time')({})
    }

    var tale = require('tale-browser')({
      base_url: './build',
      plugins: plugins
    })

On the next `tale build` the plugin will be bundled into the story.



