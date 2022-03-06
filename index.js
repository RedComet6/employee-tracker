const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
    {
        host: "localhost",
        port: PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    console.log(`Connected to the books_db database.`)
);
