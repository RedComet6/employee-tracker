const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log(`Connected to the workplace_db database.`);
    init();
});

async function init() {
    const choice = {
        name: "choice",
        message: "What would you like to do?",
        type: "list",
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role"],
    };

    await inquirer.prompt(choice).then((answer) => {
        console.log(answer);
    });
}
