const mysql = require('mysql');
require("dotenv").config()

const { DB_HOST, DB_USER, DB_PASS, DB_DATABASE } = process.env;


module.exports = class Mysql {
  static connect() {
    // establish connection
    const db = mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      database: DB_DATABASE,
    });
    // connect to database
    db.connect((err) => {
      if (err) {
        throw err;
      }
      console.log('Mysql Connected');
    });
    return db;
  }
};
