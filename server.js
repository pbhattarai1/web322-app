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
//const students = require("./data/students.json");
//const programs = require("./data/programs.json");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
// Adding the express.urlencoded middleware
app.use(express.urlencoded({ extended: true }));
//sequel


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
processForm(uploaded);
});
} else {
  processForm("");
  }
  
  function processForm(uploaded) {
  const imageData = {
  imageID: uploaded.public_id,
  imageUrl: uploaded.secure_url,
  version: uploaded.version,
  width: uploaded.width,
  height: uploaded.height,
  format: uploaded.format,
  resourceType: uploaded.resource_type,
  uploadedAt: uploaded.created_at,
  originalFileName: req.file.originalname,
  mimeType: req.file.mimetype,
  };
  dataService.addImage(imageData);
res.redirect("/images");
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
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  } else if (req.query.program) {
    dataService
      .getStudentsByProgramCode(req.query.program)
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  } else if (req.query.credential) {
    dataService
      .getStudentsByExpectedCredential(req.query.credential)
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  } else {
    dataService
      .getAllStudents()
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  }
});

app.get("/students/add", (req, res) => {
  dataService.getPrograms()
    .then((data) => {
      res.render("addStudent", { programs: data });
    })
    .catch((err) => {
      console.log(err);
      res.render("addStudent", { programs: [] });
    });
});

app.post("/students/add", (req, res) => {
  dataService
    .addStudent(req.body)
    .then((data) => {
      res.redirect("/students");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error adding student");
    });
});


  app.post("/student/update", (req, res) => {
    updateStudent(req.body)
      .then((data) => {
        res.redirect("/students");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error updating student");
      });
  });
  


  app.get("/student/:id", (req, res) => {
    
    // initialize an empty object to store the values
    let viewData = {};

    dataService.getStudentByNum(req.params.studentId).then((data) => {
        if (data) {
            viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error 
    }).then(dataService.getPrograms)
    .then((data) => {
        viewData.programs = data; // store program data in the "viewData" object as "programs"

        // loop through viewData.programs and once we have found the programCode that matches
        // the student's "program" value, add a "selected" property to the matching 
        // viewData.programs object

        for (let i = 0; i < viewData.programs.length; i++) {
            if (viewData.programs[i].programCode == viewData.student.program) {
                viewData.programs[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.programs = []; // set programs to empty if there was an error
    }).then(() => {
        if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // render the "student" view
        }
    }).catch((err)=>{
        res.status(500).send("Unable to Show Students");
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

// GET route to return the URLs of images stored on Cloudinary
app.get("/images", async (req, res) => {
  try {
  const result = await cloudinary.api.resources();
  const urls = result.resources.map((image) => image.url);
  if (urls.length > 0) {
  res.render("images", { images: urls });
  } else {
  res.render("images", { message: "no results" });
  }
  } catch (err) {
  console.log(err);
  res.status(500).json({ error: "Internal server error" });
  }
  });
  
  // Updated /programs route to render "no results" message if no programs are found
  app.get("/programs", (req, res) => {
  dataService
  .getPrograms()
  .then((programs) => {
  if (programs.length > 0) {
  res.render("programs", { programs: programs });
  } else {
  res.render("programs", { message: "no results" });
  }
  })
  .catch((err) => {
  res.json({ message: err });
  });
  });
  
  app.get('/students/delete/:studentID', (req, res) => {
    const id = req.params.studentID;
  
    dataService.deleteStudentById(id)
      .then(() => {
        res.redirect('/students');
      })
      .catch((err) => {
        res.status(500).send('Unable to Remove Student / Student not found');
      });
  });
  
  

// handle POST requests to /programs/add
app.post('/programs/add', (req, res) => {
  // call addProgram function with POST data
  dataService.addProgram(req.body)
    .then(() => {
      // redirect to /programs
      res.redirect('/programs');
    })
    .catch(err => {
      // render error page if error occurs
      res.status(500).send(err);
    });
});

// handle GET requests to /programs/add
app.get('/programs/add', (req, res) => {
  // render addProgram view
  res.render('addProgram');
});

// Define routes(programUpdate)
app.post('/program/update', (req, res) => {
  dataService.updateProgram(req.body)
    .then(() => {
      res.redirect('/programs');
    })
    .catch(() => {
      res.redirect('/programs');
    });
});

// GET /program/:programCode
app.get('/program/:programCode', (req, res) => {
  dataService.getProgramByCode(req.params.programCode)
    .then(program => {
      if (program) {
        res.render('program', { program });
      } else {
        res.status(404).send("Program Not Found");
      }
    })
    .catch(error => {
      res.status(500).send("Program Not Found");
    });
});

//programs/delect/:programCode
app.get('/programs/delete/:programCode', (req, res) => {
  dataService.deleteProgramByCode(req.params.programCode)
    .then(() => {
      res.redirect('/programs');
    })
    .catch(() => {
      res.status(500).send('Unable to Remove Program / Program not found)');
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
