# imgbi-client
Simple command-line client and Node.js library for use [img.bi](https://img.bi).

## Install

    npm install imgbi -g

## Usage

~~~ sh
$ imgbi-client -i image.png
https://img.bi/#!XqL4IVp!jxJccrgkodebbxlaplteabgtbkllab5tberiWkam
https://img.bi/rm/#!XqL4IVp!jxJccrgkodebbxlaplteabgtbkllab5tberiWkam!Rl80pmqeXIgRhZz9TQvCrYLAIAi

$ imgbi-client -d 'https://img.bi/#!XqL4IVp!jxJccrgkodebbxlaplteabgtbkllab5tberiWkam' -o images
OK: Saved to XqL4IVp.png

$ imgbi-client -r 'https://img.bi/rm/#!XqL4IVp!jxJccrgkodebbxlaplteabgtbkllab5tberiWkam!Rl80pmqeXIgRhZz9TQvCrYLAIAi'
OK: Removed

~~~

## --help

    Usage:
      imgbi-client [OPTIONS] [ARGS]

    Options: 
      -i, --image FILE       Image location
      -r, --remove URL       URL of file to be removed
      -d, --download URL     URL of file to be downloaded and decrypted
      -e, --expire [NUMBER]  Set expire time in days for image, 0 for store forever  (Default is 180)
      -o, --output [PATH]    Location to save file (Default is .)
      -u, --url [URL]        URL of img.bi instance (Default is https://img.bi)
      -n, --norm             Don't print removal link
      -l, --nolink           Don't print link to show image
      -a, --autorm           Print autoremove link
      -em, --embed           Print embed code
      -k, --no-color         Omit color from output
          --debug            Show debug information
      -h, --help             Display help and usage details


## Programmatic usage
### Uploading

~~~ js
var imgbi = require('imgbi');
var options = {};
options.image = 'image.jpg'; // image location
options.expire = '180'; // time to expire in days, default 180
options.url = 'https://img.bi'; // url of img.bi server, https://img.bi by default

imgbi.upload(options, function(err, result) {
  if (err) {
    new Error(err); // if there any error during the upload
  }
  else {
    console.log(result.id); // id of file
    console.log(result.pass); // pass used for encryption
    console.log(result.removalpass); // pass for remove file
    console.log(result.viewlink); // link to view image
    console.log(result.rmlink); // link to remove image
    console.log(result.autormlink); // link to autoremove image after first view
    console.log(result.embedcode); // code to embed image using img.bi.js script
  }
});
~~~

### Removing

~~~ js
imgbi = require('imgbi');

var url = 'https://img.bi/rm/#!XqL4IVp!jxJccrgkodebbxlaplteabgtbkllab5tberiWkam!Rl80pmqeXIgRhZz9TQvCrYLAIAi'; // link to remove image

imgbi.remove(url, function(err) {
  if (err) {
    new Error(err); // if there any error during the remove
  }
  else {
    console.log('Removed');
  }
});
~~~

### Downloading

~~~ js
imgbi = require('imgbi');

var url = 'https://img.bi/#!XqL4IVp!jxJccrgkodebbxlaplteabgtbkllab5tberiWkam'; // link to view image
var path = '~/images'; // path to save image

imgbi.download(url, path, function(err, result) {
  if (err) {
    new Error(err); // if there any error during the download
  }
  else {
    console.log(result); // filename
  }
});
~~~
