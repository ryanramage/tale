var jam = {
    "packages": [
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        },
        {
            "name": "sjcl",
            "location": "jam/sjcl",
            "main": "sjcl.js"
        }
    ],
    "version": "0.2.17",
    "shim": {
        "sjcl": {
            "exports": "sjcl"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        },
        {
            "name": "sjcl",
            "location": "jam/sjcl",
            "main": "sjcl.js"
        }
    ],
    "shim": {
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
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        },
        {
            "name": "sjcl",
            "location": "jam/sjcl",
            "main": "sjcl.js"
        }
    ],
    "shim": {
        "sjcl": {
            "exports": "sjcl"
        }
    }
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}