Tale
=====

Offline-first story based games, that gets the crowd moving.

install
-------

    npm install tale -g

usage
-----

create a folder layout like the one in `tests/assets/story1`. It has a package.json
which describes the story, and folders representing the chapters. When ready run

    tale

and this will generate a `build` dir that is totally offline enabled, and each chapter is encrypted/

options
-------

You can pass in options to the tale command

   tale -i inputdir -o output dir

Also you can control some of the output

 - Dont add the js file in the story.manifest file

    --no_js_in_manifest

 - Dont generate the index.html file

    --no_index_html

 - Done generate the tale.min.js file

    --no_tale_js


This is really early and a lot will be in flux. But watch this space.

