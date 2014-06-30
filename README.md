Tale
=====

![Stones](https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKyKW_fKXBbqj099VOTKEplgd6UvLox8wzF6HFSScVc8SO6rMx)

Offline-first, location based story telling. Create tales that get people moving.

Here is a very boring example, gfor your reference:

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

    tale package

and this will generate a `build` dir that is totally offline enabled, with each chapter is encrypted.

If you want to test it in a browser:

    tale serve

Publish
-------

When your story is ready, just do

    tale publish

This will publish it to http://t4.io as public story.

If you choose to host is somewhere else, just copy the build directory to any http server.



