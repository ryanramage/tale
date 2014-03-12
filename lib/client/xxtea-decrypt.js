var tea = require('xxtea-stream'),
    concat = require('concat-stream'),
    createReadStream = require('filereader-stream'),
    bops = require('bops');

module.exports = function(url, pass, cb){

  var oReq = new XMLHttpRequest();
  oReq.open("GET", url, true);
  oReq.responseType = "blob";

  oReq.onload = function (oEvent) {

    createReadStream(oReq.response)
      .pipe(new tea.Decrypt(bops.from(pass, 'base64')))
      .pipe(concat(function(contents) {
        cb(null, bops.to(contents));
      }))
  };
  oReq.send(null);
}