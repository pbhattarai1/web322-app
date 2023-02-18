const fs = require("fs");

let students = [];
let programs = [];
let images = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/students.json", "utf8", (err, data) => {
      if (err) {
        reject("unable to read file");
      }
      students = JSON.parse(data);
      fs.readFile("./data/programs.json", "utf8", (err, data) => {
        if (err) {
          reject("unable to read file");
        }
        programs = JSON.parse(data);
        resolve();
      });
    });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
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

function addImage(imageUrl) {
  return new Promise((resolve, reject) => {
    images.push(imageUrl);
    resolve();
  });
}

function getImages() {
  return new Promise((resolve, reject) => {
    if (images.length === 0) {
      reject("no results returned");
    }
    resolve(images);
  });
}

function getNextImageId() {
  return new Promise((resolve, reject) => {
    if (images.length === 0) {
      reject("no results returned");
    } else {
      const nextImage = images[images.length - 1];
      const nextId = nextImage.id + 1;
      resolve(nextId);
    }
  });
}
// Function to add a new student
function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    // Set isInternationalStudent to false if it's undefined
    if (studentData.isInternationalStudent === undefined) {
      studentData.isInternationalStudent = false;
    } else {
      studentData.isInternationalStudent = true;
    }

    // Find the maximum studentID value and add 1 for the new studentID
    const maxID = students.reduce((max, student) => {
      const studentIDNum = parseInt(student.studentID, 10);
      return studentIDNum > max ? studentIDNum : max;
    }, 0);
    const newID = (maxID + 1).toString();
    studentData.studentID = newID;

    // Add the new student to the students array and save to file
    students.push(studentData);
    fs.writeFile("./data/students.json", JSON.stringify(students), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
function getStudentsByStatus(status) {
  return new Promise((resolve, reject) => {
    const studentsByStatus = students.filter(
      (student) => student.status === status
    );
    if (studentsByStatus.length === 0) {
      reject("no results returned");
    }
    resolve(studentsByStatus);
  });
}
function getStudentsByProgramCode(programCode) {
  return new Promise((resolve, reject) => {
    const filteredStudents = students.filter(
      (student) => student.program === programCode
    );
    if (filteredStudents.length === 0) {
      reject("no results returned");
    } else {
      resolve(filteredStudents);
    }
  });
}

function getStudentsByExpectedCredential(credential) {
  return new Promise((resolve, reject) => {
    const filteredStudents = students.filter(
      (student) => student.expectedCredential === credential
    );
    if (filteredStudents.length === 0) {
      reject("no results returned");
    } else {
      resolve(filteredStudents);
    }
  });
}

function getStudentById(sid) //return student by id
  return new Promise((resolve, reject) => {
    const student = students.find((student) => student.studentID === sid);
    if (!student) {
      reject("no result returned");
    } else {
      resolve(student);
    }
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getInternationalStudents,
  getPrograms,
  addImage,
  getImages,
  getNextImageId,
  addStudent,
  getStudentsByStatus,
  getStudentsByProgramCode,
  getStudentsByExpectedCredential,
  getStudentById,
};
