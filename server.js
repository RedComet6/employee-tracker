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
    const choice = {
        name: "choice",
        message: "What would you like to do?",
        type: "list",
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Delete a department", "Delete a role", "Delete an employee", "Quit"],
        pageSize: 11,
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
            addRole();
            break;
        case "Add an employee":
            addEmployee();
            break;
        case "Update an employee role":
            updateEmployee();
            break;
        case "Delete a department":
            deleteDepartment();
            break;
        case "Delete a role":
            deleteRole();
            break;
        case "Delete an employee":
            deleteEmployee();
            break;
        case "Quit":
            console.log("You have Quit\n\n");
            break;
    }
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
    inquirer
        .prompt({
            name: "newDepartment",
            message: "What is the new department called?",
            type: "input",
        })
        .then((answer) => {
            db.query("INSERT INTO departments (name) VALUES (?)", answer.newDepartment, function (err, row) {
                if (err) throw err;
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

function addRole() {
    const questions = [
        {
            name: "newRoleTitle",
            message: "What is the new role's title?",
            type: "input",
        },
        {
            name: "newRoleSalary",
            message: "What is the new role's salary?",
            type: "number",
        },
    ];

    inquirer.prompt(questions).then((answers) => {
        db.query("SELECT * FROM departments", function (err, res) {
            const departments = res.map(({ id, name }) => ({
                name: name,
                value: id,
            }));

            inquirer
                .prompt({
                    name: "id",
                    message: "To which department does this role belong?",
                    type: "list",
                    choices: departments,
                })
                .then((department) => {
                    db.query("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", [answers.newRoleTitle, answers.newRoleSalary, department.id], function (err, row) {
                        if (err) throw err;
                        console.log("Successfully added a role!");
                    });

                    db.query("SELECT * FROM roles", (err, res) => {
                        console.log("\n");
                        console.table(res);
                        console.log("\n");
                        init();
                    });
                });
            if (err) throw err;
        });
    });
}

function addEmployee() {
    const questions = [
        {
            name: "newFirstName",
            message: "What is the new employee's first name?",
            type: "input",
        },
        {
            name: "newLastName",
            message: "What is the new employee's last name?",
            type: "input",
        },
    ];

    inquirer.prompt(questions).then((answers) => {
        db.query("SELECT * FROM roles", function (err, res) {
            const roles = res.map(({ id, title }) => ({
                name: title,
                value: id,
            }));

            const askRole = [
                { name: "askManager", message: "Is this employee a manager?", type: "confirm" },
                {
                    name: "id",
                    message: "What is the new employee's role?",
                    type: "list",
                    choices: roles,
                },
            ];

            inquirer.prompt(askRole).then((roleData) => {
                switch (roleData.askManager) {
                    case true:
                        db.query("INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?)", [answers.newFirstName, answers.newLastName, roleData.id], function (err, row) {
                            if (err) throw err;
                            console.log("Successfully added an employee!");
                        });

                        db.query("SELECT * FROM employees", (err, res) => {
                            console.log("\n");
                            console.table(res);
                            console.log("\n");
                            init();
                        });
                        break;
                    case false:
                        db.query("SELECT * FROM employees WHERE manager_id IS NULL", function (err, res) {
                            const managers = res.map(({ id, last_name }) => ({
                                name: last_name,
                                value: id,
                            }));

                            inquirer
                                .prompt({
                                    name: "id",
                                    message: "Who is the new employee's manager?",
                                    type: "list",
                                    choices: managers,
                                })
                                .then((manager) => {
                                    db.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [answers.newFirstName, answers.newLastName, roleData.id, manager.id], function (err, row) {
                                        if (err) throw err;
                                        console.log("Successfully added an employee!");
                                    });

                                    db.query("SELECT * FROM employees", (err, res) => {
                                        console.log("\n");
                                        console.table(res);
                                        console.log("\n");
                                        init();
                                    });
                                });
                            if (err) throw err;
                        });
                        break;
                }
            });
            if (err) throw err;
        });
    });
}

function updateEmployee() {
    db.query("SELECT * FROM employees", (err, res) => {
        const employees = res.map(({ id, last_name }) => ({
            name: last_name,
            value: id,
        }));

        inquirer
            .prompt({
                name: "id",
                message: "Which employee's role do you want to update?",
                type: "list",
                choices: employees,
            })
            .then((employee) => {
                db.query("SELECT * FROM roles", function (err, res) {
                    const roles = res.map(({ id, title }) => ({
                        name: title,
                        value: id,
                    }));

                    inquirer
                        .prompt({
                            name: "id",
                            message: "What will this employee's new role be?",
                            type: "list",
                            choices: roles,
                        })
                        .then((role) => {
                            db.query("UPDATE employees SET role_id = ? WHERE id = ?", [role.id, employee.id], function (err, row) {
                                if (err) throw err;
                                console.log("Successfully updated an employee's role!");
                            });

                            db.query("SELECT * FROM employees", (err, res) => {
                                console.log("\n");
                                console.table(res);
                                console.log("\n");
                                init();
                            });
                        });
                    if (err) throw err;
                });
            });
        if (err) throw err;
    });
}

function deleteDepartment() {
    db.query("SELECT * FROM departments", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
    });

    inquirer
        .prompt({
            name: "deletedDepartment",
            message: "What is the ID number of the department to be deleted?",
            type: "number",
        })
        .then((answer) => {
            db.query("DELETE FROM departments WHERE id = ?", answer.deletedDepartment, function (err, row) {
                if (err) throw err;
                console.log("Successfully deleted a department!");
            });

            db.query("SELECT * FROM departments", (err, res) => {
                console.log("\n");
                console.table(res);
                console.log("\n");
                init();
            });
        });
}

function deleteRole() {
    db.query("SELECT * FROM roles", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
    });

    inquirer
        .prompt({
            name: "deletedRole",
            message: "What is the ID number of the role to be deleted?",
            type: "number",
        })
        .then((answer) => {
            db.query("DELETE FROM roles WHERE id = ?", answer.deletedRole, function (err, row) {
                if (err) throw err;
                console.log("Successfully deleted a role!");
            });

            db.query("SELECT * FROM roles", (err, res) => {
                console.log("\n");
                console.table(res);
                console.log("\n");
                init();
            });
        });
}

function deleteEmployee() {
    db.query("SELECT * FROM employees", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
    });

    inquirer
        .prompt({
            name: "deletedEmployee",
            message: "What is the ID number of the employee to be deleted?",
            type: "number",
        })
        .then((answer) => {
            db.query("DELETE FROM employees WHERE id = ?", answer.deletedEmployee, function (err, row) {
                if (err) throw err;
                console.log("Successfully deleted an employee!");
            });

            db.query("SELECT * FROM employees", (err, res) => {
                console.log("\n");
                console.table(res);
                console.log("\n");
                init();
            });
        });
}

init();
