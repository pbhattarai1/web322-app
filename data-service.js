const fs = require("fs");

let students = [];
let programs = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/students.json", "utf8", (err, data) => {
      console.log("h");
      if (err) {
        reject("unable to read file");
      }
      students = JSON.parse(data);
      console.log(students);
      fs.readFile("./data/programs.json", "utf8", (err, data) => {
        if (err) {
          reject("unable to read file");
        }
        programs = JSON.parse(data);
        console.log(programs);
        resolve();
      });
    });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    console.log("pass01");
    if (students.length === 0) {
      reject("no results returned");
    }
    resolve(students);
  });
}

function getInternationalStudents() {
  return new Promise((resolve, reject) => {
    const internationalStudents = students.filter(
      (student) => student.isInternationalStudent
    );
    if (internationalStudents.length === 0) {
      reject("no results returned");
    }
    resolve(internationalStudents);
  });
}

function getPrograms() {
  return new Promise((resolve, reject) => {
    if (programs.length === 0) {
      reject("no results returned");
    }
    resolve(programs);
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getInternationalStudents,
  getPrograms,
};
