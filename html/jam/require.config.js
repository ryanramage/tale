var jam = {
    "packages": [
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        }
    ],
    "version": "0.2.17",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        }
    ],
    "shim": {}
});
}
else {
    var require = {
    "packages": [
        {
            "name": "oboe",
            "location": "jam/oboe",
            "main": "dist/oboe-browser.js"
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}