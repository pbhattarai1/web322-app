//const { Sequelize, Op } = require('sequelize');

const Sequelize = require('sequelize');
const dataServiceAuth = require('./data-service-auth.js');



var sequelize = new Sequelize('yrorypxv', 'yrorypxv', 'yLM1QNXwpb38dcZ7jAEUHa5HZEMza9dV', {
  host: 'raja.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  }
  , query: { raw: true }
});


// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: 'data/db/database.sqlite'
// });

const Student = sequelize.define('student', {
  studentID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName:Sequelize.STRING,
  lastName: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  phone: {
    type: Sequelize.STRING
  },
  addressStreet: {
    type: Sequelize.STRING
  },
  addressCity: {
    type: Sequelize.STRING
  },
  addressState: {
    type: Sequelize.STRING
  },
  addressPostal: {
    type: Sequelize.STRING
  },
  isInternationalStudent: {
    type: Sequelize.BOOLEAN
  },
  expectedCredential: {
    type: Sequelize.STRING
  },
  status: {
    type: Sequelize.STRING
  },
  registrationDate: {
    type: Sequelize.STRING
  }
});

const Image = sequelize.define('image', {
  imageID: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  imageUrl: {
    type: Sequelize.STRING
  },
  version: {
    type: Sequelize.INTEGER
  },
  width: {
    type: Sequelize.INTEGER
  },
  height: {
    type: Sequelize.INTEGER
  },
  format: {
    type: Sequelize.STRING
  },
  resourceType: {
    type: Sequelize.STRING
  },
  uploadedAt: {
    type: Sequelize.DATE
  },
  originalFileName: {
    type: Sequelize.STRING
  },
  mimeType: {
    type: Sequelize.STRING
  }
});

const Program = sequelize.define('program', {
  programCode: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  programName: {
    type: Sequelize.STRING
  }
});

Program.hasMany(Student, { foreignKey: 'program' });

function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database connected and tables synced!');
    })
    .catch(error => {
      console.error('Unable to sync the database:', error);
      //throw new Error('Unable to sync the database');
    });
}

function getAllStudents() {
  return Student.findAll()
    .then(students => {
      if (!students.length) {
        throw new Error('No results returned');
      }
      return students;
    })
    .catch(error => {
      console.error('Error while getting all students:', error);
      throw new Error('No results returned');
    });
}

function getStudentsByStatus(status) {
  return Student.findAll({
    where: {
      status: {
        [Op.eq]: status
      }
    }
  })
    .then(students => {
      if (!students.length) {
        throw new Error('No results returned');
      }
      return students;
    })
    .catch(error => {
      console.error('Error while getting students by status:', error);
      throw new Error('No results returned');
    });
}

function getStudentsByProgramCode(programCode) {
  return Student.findAll({
    where: {
      program: {
        [Op.eq]: programCode
      }
    }
  })
    .then(students => {
      if (!students.length) {
        throw new Error('No results returned');
      }
      return students;
    })
    .catch(error => {
      console.error('Error while getting students by program code:', error);
      throw new Error('No results returned');
    });
}

function getStudentsByExpectedCredential(credential) {
  return Student.findAll({
    where: {
      expectedCredential: credential
    }
  })
    .then((students) => {
      if (students.length === 0) {
        throw new Error('No students found with expected credential ' + credential);
      }
      return students;
    });
}
// getStudentById function
function getStudentById(id) {
  return Student.findAll({
    where: { studentID: id }
  })
    .then(data => {
      if (data.length > 0) {
        return Promise.resolve(data[0]);
      } else {
        return Promise.reject("no results returned");
      }
    })
    .catch(err => Promise.reject(err.message));
}

// getPrograms function
function getPrograms() {
  return Program.findAll()
    .then(data => Promise.resolve(data))
    .catch(() => Promise.reject("no results returned"));
}

// addStudent function
function addStudent(studentData) {
  studentData.isInternationalStudent =
    studentData.isInternationalStudent === true;
  for (let key in studentData) {
    if (studentData.hasOwnProperty(key) && studentData[key] === "") {
      studentData[key] = null;
    }
  }
  return Student.create(studentData)
    .then(() => Promise.resolve())
    .catch(() => Promise.reject("unable to create student"));
}

// updateStudent function
function updateStudent(studentData) {
  studentData.isInternationalStudent =
    studentData.isInternationalStudent === true;
  for (let key in studentData) {
    if (studentData.hasOwnProperty(key) && studentData[key] === "") {
      studentData[key] = null;
    }
  }
  return Student.update(studentData, {
    where: { studentID: studentData.studentID }
  })
    .then(() => Promise.resolve())
    .catch(() => Promise.reject("unable to update student"));
}

// addImage function
function addImage(imageData) {
  return Image.create(imageData)
    .then(() => Promise.resolve())
    .catch(() => Promise.reject("unable to create image"));
}

// getImages function
function getImages() {
  return Image.findAll()
    .then(data => Promise.resolve(data))
    .catch(() => Promise.reject("no results returned"));
}
//AddProgram(program Data)
function addProgram(programData) {
  // Replace empty string values with null
  for (let key in programData) {
    if (programData[key] === '') {
      programData[key] = null;
    }
  }

  return new Promise((resolve, reject) => {
    // Create program in database
    Program.create(programData)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject("Unable to create program");
      });
  });
}

// UpdateProgram(programData)
function updateProgram(programData) {
  for (let key in programData) {
    if (programData.hasOwnProperty(key) && programData[key] === '') {
      programData[key] = null;
    }
  }

  return Program.update(programData, {
    where: {
      programCode: programData.programCode
    }
  })
    .then(result => {
      if (result[0] > 0) {
        return Promise.resolve();
      } else {
        return Promise.reject('unable to update program');
      }
    })
    .catch(error => {
      return Promise.reject('unable to update program');
    });
}
//getProgramByCode(pcode)
function getProgramByCode(pcode) {
  return new Promise((resolve, reject) => {
    Program.findAll({
      where: {
        programCode: pcode
      }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("no results returned");
        }
      })
      .catch(err => {
        reject("an error occurred while processing the request");
      });
  });
}
//delectProgramByCode
function deleteProgramByCode(pcode) {
  return Program.destroy({ where: { programCode: pcode } })
    .then((rowsDeleted) => {
      if (rowsDeleted === 0) {
        throw new Error(`Program ${pcode} was not found`);
      }
      return rowsDeleted;
    })
    .catch((error) => {
      throw error;
    });
}

function deleteStudentById(id) {
  return new Promise((resolve, reject) => {
    console.log(id);
    Student.destroy({
      where: {
        studentID: id
      }
    }).then((rowsDeleted) => {
      if (rowsDeleted === 0) {
        reject(new Error('Student not found'));
      } else {
        console.log('pass');
        resolve();
      }
    }).catch((err) => {
      console.log('fail');
      reject(err);
    });
  });
}



module.exports = {
  initialize,
  getAllStudents,
  getPrograms,
  addImage,
  getImages,
  addStudent,
  getStudentsByStatus,
  getStudentsByProgramCode,
  getStudentsByExpectedCredential,
  getStudentById,
  updateStudent,
  addProgram,
  updateProgram,
  getProgramByCode,
  deleteProgramByCode,
  deleteStudentById,
  
};
