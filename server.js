var express = require("express");
var path = require("path");
var serveStatic = require("serve-static");

app = express();
app.use(serveStatic(__dirname + "/storybook-static"));
console.log('__dirname', __dirname);
var port = process.env.PORT || 5000;
app.listen(port);