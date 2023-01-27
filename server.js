var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/home", function (req, res) {
  res.send(
    "Pushparaj Bhattarai<br /><a href='/about'>Go to the about page</a>"
  );
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.send("<h3>About Pushparaj Bhattarai <br></h3>");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
// setup the static folder that static resources can load from
// like images, css files, etc.
app.use(express.static("public"));
