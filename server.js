/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: __Pushparaj Bhattarai__ Student ID: _159658210___ Date: _____2023/02/03___________
 *
 *  Online (Cyclic) Link: https://defiant-dove-tutu.cyclic.app
 *
 ********************************************************************************/

// server.js: start from week 2 example
var express = require("express");
var app = express();
const path = require("path");
const dataService = require("./data-service.js");
const students = require("./data/students.json");
const programs = require("./data/programs.json");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
// Adding the express.urlencoded middleware
app.use(express.urlencoded({ extended: true }));

var HTTP_PORT = process.env.PORT || 8088;

//config:
cloudinary.config({
  cloud_name: "dhufqu7is",
  api_key: "554885395163495",
  api_secret: "dShbbMbD1YOFcIiosDaEe0F7QZY",
  secure: true,
});

const expressHandlebars = require('express-handlebars');

// configure express-handlebars
app.set('view engine', 'hbs');
app.engine('hbs', expressHandlebars.engine({
  extname: 'hbs',
  helpers: {
    navLink: function(url, options){
      return '<li' +
      ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
      '><a href="' + url + '">' + options.fn(this) + '</a></li>';
     },

     equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
      return options.inverse(this);
      } else {
      return options.fn(this);
      }
     },

     safeHTML: function(context){
      return stripJs(context);
     }
  },
  layoutsDir: __dirname + "/views/layout",
  defaultLayout: 'main'}));

//multer
const upload = multer(); //no { storage: storage } since we are not using disk storage

app.locals.title = "WEB322-APP";

// use middleware: Express built-in "bodyParser" - to access form data in http body
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));

// setup the static folder that static resources can load from
// like images, css files, etc.
app.use(express.static("public"));

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(function(req, res, next){
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});


// setup the "root" 'route' to listen on the default url path (http://localhost)
app.get("/", (req, res) => {
  res.render('home');
});

app.get("/about", function (request, res) {
  // res.send("<h2>About</h2><p>This is the about page</p>")
  res.render('about');
});
//new route to listen on /students/add
app.get("/students/add", function (req, res) {
  res.render('addStudent');
}); //new route to listen on /images/add
app.get("/images/add", function (req, res) {
  res.render('addImage');
});
// IE: http://localhost:8080/headers
app.get("/headers", (req, res) => {
  var userAgent = req.get("user-agent");

  console.log("userAgent in route /headers: ", userAgent);

  const headers = req.headers;
  console.log("headers: ", headers);

  res.send(headers);
});

app.get("/download", function (req, res) {
  res.download("./public/images/Express.js.png");
});

app.get("/redirect", function (req, res) {
  res.redirect("/");
});

// Create - Add new user
// define a route (using http GET method) to show a page with html form
app.get("/newuser", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/newUser.html"));
});

// define a route (using http POST method) to process html from submission
app.post("/newuser", (req, res) => {
  res.send(`<h2>Data received from the Add New user form</h2>
              <ol>
                <li>req.body.name: ${req.body.name} </li>
                <li>req.body.age: ${req.body.age} </li>
                <li>req.body.occupation: ${req.body.occupation} </li>
                <li>...</li>
              </ol>
              <ul>
                <li>req.body (all in one obj): ${JSON.stringify(req.body)} </li>
              </ul>
            `);
});

// Read/retrieve - Get All users
// define a route to get/show all users
app.get("/users", (req, res) => {
  if (!req.query.json4api) {
    res.send(`<h2>Data received from query string (or query parameters)</h2>
            <ol>
               <li>req.query.occupation: ${req.query.occupation} </li>
               <li>req.query.page: ${req.query.page} </li>
               <li>req.query.perPage: ${req.query.perPage} </li>
            </ol>
            <ul>
               <li>req.query: <mark>${JSON.stringify(req.query)}</mark> </li>
            </ul>`);
  } else {
    res.json(req.query);
  }
});

app.get("/posts", (req, res) => {
  if (req.query.category) {
    // res.json( {"message": req.qery.category})
  } else if (req.query.minData) {
    // res.json( {"message": req.qery.minData})
  } else {
    // res.json( {"message": "All members"})
  }
});

// //route to add a "post"
app.post("/images/add", upload.single("imageFile"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processForm(uploaded.url);
    });
  } else {
    processForm("");
  }

  function processForm(imageUrl) {
    cloudinary.uploader.upload(imageUrl, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        const image = {
          id: dataService.getNextImageId(),
          url: result.secure_url,
          created_at: result.created_at,
        };
        dataService.addImage(image);
        res.redirect("/images");
      }
    });
  }
});

// GET route to return the URLs of images stored on Cloudinary
app.get("/images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources();
    const urls = result.resources.map((image) => image.url);
    res.render("images", { images: urls });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Read/retrieve - Get One user
// define a route to get/show a specific user
app.get("/users/:id", (req, res) => {
  var parameters = req.params;
  res.send(`<h2>Data received from parameter(s) in route</h2>
    <ul>
      <li>req.params.id: ${req.params.id} </li>
      <li>req.params (all in one obj): ${JSON.stringify(req.params)} </li>
    </ul>
  `);
});

app.get("/students", (req, res) => {
  if (req.query.status) {
  dataService
  .getStudentsByStatus(req.query.status)
  .then((students) => {
  res.render("students", { students: students });
  })
  .catch((err) => {
  res.render("students", { message: "no results" });
  });
  } else if (req.query.program) {
  dataService
  .getStudentsByProgramCode(req.query.program)
  .then((students) => {
  res.render("students", { students: students });
  })
  .catch((err) => {
  res.render("students", { message: "no results" });
  });
  } else if (req.query.credential) {
  dataService
  .getStudentsByExpectedCredential(req.query.credential)
  .then((students) => {
  res.render("students", { students: students });
  })
  .catch((err) => {
  res.render("students", { message: "no results" });
  });
  } else {
  dataService
  .getAllStudents()
  .then((students) => {
  res.render("students", { students: students });
  })
  .catch((err) => {
  res.render("students", { message: "no results" });
  });
  }
  });

  app.post("/student/update", (req, res) => {
    updateStudent(req.body)
      .then(() => {
        res.redirect("/students");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error updating student");
      });
  });
  


  app.get("/student/:id", (req, res) => {
    const studentId = req.params.id;
    dataService
      .getStudentById(studentId)
      .then((student) => {
        if (student) {
          res.render("student", { student: student });
        } else {
          res.render("student", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("student", { message: "no results" });
      });
  });
  

app.get("/intlstudents", (req, res) => {
  dataService
    .getInternationalStudents()
    .then((students) => {
      const internationalStudents = students.filter(
        (student) => student.isInternationalStudent === true
      );
      res.json(internationalStudents);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/programs", (req, res) => {
  dataService
    .getPrograms()
    .then((programs) => {
      res.render("programs", { programs: programs });
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Adding the "Post" route
app.post("/students/add", (req, res) => {
  dataService
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error adding student");
    });
});

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
  res.status(404).send("<h2>404</h2><p>Page Not Found</p>");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart, dataService.initialize);
