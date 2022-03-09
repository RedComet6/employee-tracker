const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

const db = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    console.log("Connected to the workplace_db database.\n\n")
);

db.connect((err) => {
    if (err) throw err;
});

function init() {
    // {
    //     name: "choice",
    //     message: "What would you like to do?",
    //     type: "list",
    //     choices: [
    //         { name: "View all departments", value: "viewDepartments" },
    //         { name: "View all roles", value: "viewRoles" },
    //         { name: "View all employees", value: "viewEmployees" },
    //         { name: "Add a department", value: "addDepartment" },
    //         { name: "Add a role", value: "addRole" },
    //         { name: "Add an employee", value: "addEmployee" },
    //         { name: "Update an employee role", value: "updateEmployee" },
    //         { name: "Quit", value: "quit" },
    //     ],
    // },

    const choice = {
        name: "choice",
        message: "What would you like to do?",
        type: "list",
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Quit"],
        pageSize: 8,
        loop: false,
    };

    inquirer
        .prompt(choice)
        .then((answer) => {
            handleChosen(answer.choice);
        })
        .catch((err) => {
            console.log(err);
        });
}

function handleChosen(chosen) {
    let output;

    switch (chosen) {
        case "View all departments":
            viewAllDepartments();
            break;
        case "View all roles":
            viewAllRoles();
            break;
        case "View all employees":
            viewAllEmployees();
            break;
        case "Add a department":
            addDepartment();
            break;
        case "Add a role":
            break;
        case "Add an employee":
            break;
        case "Update an employee role":
            break;
        case "Quit":
            console.log("You have Quit\n\n");
            break;
    }

    // if (chosen !== "Quit") {
    //     setTimeout(() => {
    //         init();
    //     }, 1000);
    // }
}

function viewAllDepartments() {
    db.query("SELECT * FROM departments", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
        init();
    });
}

function viewAllRoles() {
    db.query("SELECT * FROM roles", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
        init();
    });
}

function viewAllEmployees() {
    db.query("SELECT * FROM employees", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
        init();
    });
}

function addDepartment() {
    const question = {
        name: "newDepartment",
        message: "What is the new department called?",
        type: "input",
    };

    inquirer.prompt(question).then((answer) => {
        db.query("INSERT INTO departments (name) VALUES (?)", answer.newDepartment, function (err, row) {
            console.log("Successfully added a department!");
        });

        db.query("SELECT * FROM departments", (err, res) => {
            console.log("\n");
            console.table(res);
            console.log("\n");
            init();
        });
    });
}

init();
