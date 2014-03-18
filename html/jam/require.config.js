var jam = {
    "packages": [
        {
            "name": "Ractive",
            "location": "jam/Ractive",
            "main": "Ractive.js"
        },
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "jscss",
            "location": "jam/jscss",
            "main": "lib/index.js"
        },
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "dist/lodash.compat.js"
        },
        {
            "name": "marked",
            "location": "jam/marked",
            "main": "./lib/marked.js"
        },
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        },
        {
            "name": "ractive-events-keys",
            "location": "jam/ractive-events-keys",
            "main": "Ractive-events-keys.js"
        },
        {
            "name": "ractive-events-tap",
            "location": "jam/ractive-events-tap",
            "main": "Ractive-events-tap.js"
        },
        {
            "name": "sjcl",
            "location": "jam/sjcl",
            "main": "sjcl.js"
        },
        {
            "name": "store",
            "location": "jam/store",
            "main": "store"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        }
    ],
    "version": "0.2.17",
    "shim": {
        "director": {
            "exports": "Router"
        },
        "sjcl": {
            "exports": "sjcl"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "Ractive",
            "location": "jam/Ractive",
            "main": "Ractive.js"
        },
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "jscss",
            "location": "jam/jscss",
            "main": "lib/index.js"
        },
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "dist/lodash.compat.js"
        },
        {
            "name": "marked",
            "location": "jam/marked",
            "main": "./lib/marked.js"
        },
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        },
        {
            "name": "ractive-events-keys",
            "location": "jam/ractive-events-keys",
            "main": "Ractive-events-keys.js"
        },
        {
            "name": "ractive-events-tap",
            "location": "jam/ractive-events-tap",
            "main": "Ractive-events-tap.js"
        },
        {
            "name": "sjcl",
            "location": "jam/sjcl",
            "main": "sjcl.js"
        },
        {
            "name": "store",
            "location": "jam/store",
            "main": "store"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        }
    ],
    "shim": {
        "director": {
            "exports": "Router"
        },
        "sjcl": {
            "exports": "sjcl"
        }
    }
});
}
else {
    var require = {
    "packages": [
        {
            "name": "Ractive",
            "location": "jam/Ractive",
            "main": "Ractive.js"
        },
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "jscss",
            "location": "jam/jscss",
            "main": "lib/index.js"
        },
        {
            "name": "lodash",
            "location": "jam/lodash",
            "main": "dist/lodash.compat.js"
        },
        {
            "name": "marked",
            "location": "jam/marked",
            "main": "./lib/marked.js"
        },
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        },
        {
            "name": "ractive-events-keys",
            "location": "jam/ractive-events-keys",
            "main": "Ractive-events-keys.js"
        },
        {
            "name": "ractive-events-tap",
            "location": "jam/ractive-events-tap",
            "main": "Ractive-events-tap.js"
        },
        {
            "name": "sjcl",
            "location": "jam/sjcl",
            "main": "sjcl.js"
        },
        {
            "name": "store",
            "location": "jam/store",
            "main": "store"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        }
    ],
    "shim": {
        "director": {
            "exports": "Router"
        },
        "sjcl": {
            "exports": "sjcl"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}