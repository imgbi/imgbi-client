#!/usr/bin/env node
var sjcl = require('sjcl'),
datauri = require('datauri'),
Passwordgen = require('passwordgen'),
needle = require('needle'),
mime = require('mime'),
fs = require('fs'),
gen = new Passwordgen().secure(),
im = require('imagemagick'),
tmp = require('tmp');

exports.upload = function(options, next) {
  if (! 'url' in options) {
    options.url = 'https://img.bi';
  }
  if (! 'expire' in options) {
    options.expire = 180;
  }
  var acceptedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'],
  maxSize = 5242880,
  mimetype = mime.lookup(options.file);
  if (acceptedTypes.indexOf(mimetype) == '-1') {
    next(new Error('Mime type ' + mimetype + ' is not supported'));
  }
  var uri = new datauri(options.file).content,
  pass = gen.chars(40),
  encrypted = sjcl.encrypt(pass, uri, {ks:256}),
  filesize = Buffer.byteLength(encrypted),
  params = {
    compressed: true,
    parse: true,
    headers: {
      'Content-length': filesize
    },
    timeout: 100000
  };
  if (filesize > maxSize) {
    next(new Error('File is too big, limit is ' + maxSize + ' bytes of encrypted text'));
  }
  tmp.file({ postfix: '.jpg' }, function _tempFileCreated(err, path, fd) {
    if (err) throw next(new Error(err));
    im.resize({
      srcPath: options.file,
      dstPath: path,
      width:   300,
      quality: 0.85,
      format: 'jpg'
    },function(err, stdout){
      if (err) throw next(new Error(err));
      ethumb = sjcl.encrypt(pass, new datauri(path).content, {ks:256});
      needle.post(options.url + '/api/upload', {encrypted: encrypted, thumb: ethumb, expire: options.expire}, params, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          if (body.status == 'OK') {
            next(null, {
              id: body.id,
              pass: pass,
              removalpass: body.pass,
              viewlink: options.url + '/#!' + body.id + '!' + pass,
              rmlink: options.url + '/rm/#!' + body.id + '!' + pass + '!' + body.pass,
              autormlink: options.url + '/autorm/#!' + body.id + '!' + pass + '!' + body.pass,
              embedcode: '<img data-imgbi="' + options.url + '/#!' + body.id + '!' + pass + '" />'
            });
          }
          else {
            next(new Error(body.status));
          }
        }
        else {
          next(new Error(error));
        }
      });
    });
  });  
}
exports.remove = function(url, next) {
  var params = url.split('!'),
  host = params[0].replace('autorm/#','').replace('rm/#',''),
  id = params[1],
  removalpass = params[3];
  rqparams = {
    compressed: true,
    parse: true
  };
  needle.get(host + 'api/remove?id=' + id + '&password=' + removalpass, rqparams, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (body.status == 'Success') {
        next(null);
      }
      else {
        next(new Error(body.status));
      }
    }
    else {
      next(new Error(error));
    }
  });
}

exports.download = function(url, path, next) {
  var params = url.split('!'),
  host = params[0].replace('autorm\/#','').replace('rm\/#','').replace('#',''),
  id = params[1],
  pass = params[2];
  rqparams = {
    compressed: true,
    parse: false
  };
  needle.get(host + 'download/' + id, rqparams, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(response.statusCode);
      var decrypted = sjcl.decrypt(pass,body.toString());
      var data = decrypted.match(/^data:image\/(.+);base64,(.*)$/);
      fs.writeFile(path + '/' + id + '.' + data[1].replace('+xml', ''), data[2], 'base64', function(err) {
        if (err) {
          next(new Error(err));
        }
        else {
          next(null,id + '.' + data[1].replace('+xml',''));
        }
      });
    }
    else if (error) {
      next(new Error(error));
    }
    else if (response.statusCode != 200) {
      next(new Error(response.statusCode));
    }
  });
}
