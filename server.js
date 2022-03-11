// require needed packages
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

// create connection to SQL database
const db = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    console.log("Connected to the workplace_db database.\n\n")
);

// let user know if database connection errors
db.connect((err) => {
    if (err) throw err;
});

// main menu function, asks user what they wish to do
function init() {
    // inquires user to pick an event to execute
    inquirer
        .prompt({
            name: "choice",
            message: "What would you like to do?",
            type: "list",
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Delete a department", "Delete a role", "Delete an employee", "Quit"],
            pageSize: 11,
            loop: false,
        })
        .then((answer) => {
            // function to handle user's choice
            handleChosen(answer.choice);
        })
        .catch((err) => {
            console.log(err);
        });
}

// handles user's choice of event
function handleChosen(chosen) {
    // conditional switch, calls the relevant function when a matching event is chosen
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

// displays all existing departments in departments table
function viewAllDepartments() {
    // queries database for departments table and displays to console
    db.query("SELECT * FROM departments", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
        // returns user to main menu function
        init();
    });
}

// displays all existing roles in roles table
function viewAllRoles() {
    // queries database for roles table and displays to console
    db.query("SELECT * FROM roles", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
        // returns user to main menu function
        init();
    });
}

// displays all existing employees in employees table
function viewAllEmployees() {
    // queries database for employees table and displays to console
    db.query("SELECT * FROM employees", (err, res) => {
        console.log("\n");
        console.table(res);
        console.log("\n");
        // returns user to main menu function
        init();
    });
}

// adds a new department to the departments table
function addDepartment() {
    // prompts user for new department's name
    inquirer
        .prompt({
            name: "newDepartment",
            message: "What is the new department called?",
            type: "input",
        })
        .then((answer) => {
            // queries the database to add new department into the departments table
            db.query("INSERT INTO departments (name) VALUES (?)", answer.newDepartment, function (err, row) {
                if (err) throw err;
                console.log("Successfully added a department!");
            });

            // display newly updated table
            db.query("SELECT * FROM departments", (err, res) => {
                console.log("\n");
                console.table(res);
                console.log("\n");
                // returns user to main menu function
                init();
            });
        });
}

// adds a new role to the roles table
function addRole() {
    // store multiple questions in array to clean up prompt syntax
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

    // prompts user for title and salary
    inquirer.prompt(questions).then((answers) => {
        // queries database for all existing departments
        db.query("SELECT * FROM departments", function (err, res) {
            // deconstructs each existing department into id & name, allowing use as list items below
            const departments = res.map(({ id, name }) => ({
                name: name,
                value: id,
            }));

            // prompts user for department, user chooses from the list of existing departments
            inquirer
                .prompt({
                    name: "id",
                    message: "To which department does this role belong?",
                    type: "list",
                    choices: departments,
                })
                .then((department) => {
                    // queries database to add new role into the roles table
                    db.query("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", [answers.newRoleTitle, answers.newRoleSalary, department.id], function (err, row) {
                        if (err) throw err;
                        console.log("Successfully added a role!");
                    });

                    // displays newly updated table to console
                    db.query("SELECT * FROM roles", (err, res) => {
                        console.log("\n");
                        console.table(res);
                        console.log("\n");
                        // returns user to main menu function
                        init();
                    });
                });
            if (err) throw err;
        });
    });
}

// adds a new employee to the employees table
function addEmployee() {
    // assign multiple questions to variable to clean up prompt syntax
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

    // prompts user for first and last name
    inquirer.prompt(questions).then((answers) => {
        // queries database for all existing roles
        db.query("SELECT * FROM roles", function (err, res) {
            // deconstructs each existing role into id & title, allowing use as list items below
            const roles = res.map(({ id, title }) => ({
                name: title,
                value: id,
            }));

            // assign multiple questions to variable to clean up prompt syntax
            // user chooses if new employee is a manager
            // user chooses new role from list of existing roles
            const askRole = [
                { name: "askManager", message: "Is this employee a manager?", type: "confirm" },
                {
                    name: "id",
                    message: "What is the new employee's role?",
                    type: "list",
                    choices: roles,
                },
            ];

            // prompts user for manager status and role
            inquirer.prompt(askRole).then((roleData) => {
                // switch condition to determine which INSERT INTO query the user needs, determined by manager status of new employee
                switch (roleData.askManager) {
                    // if new employee is a manager, do not pass manager_id into VALUES, causing it to be NULL
                    case true:
                        // queries database to add new employee to employees table
                        db.query("INSERT INTO employees (first_name, last_name, role_id) VALUES (?, ?, ?)", [answers.newFirstName, answers.newLastName, roleData.id], function (err, row) {
                            if (err) throw err;
                            console.log("Successfully added an employee!");
                        });

                        // display newly updated table to console
                        db.query("SELECT * FROM employees", (err, res) => {
                            console.log("\n");
                            console.table(res);
                            console.log("\n");
                            // returns user to main menu function
                            init();
                        });
                        break;
                    // if new employee is not a manager, pass manager_id into VALUES and choose from existing managers
                    case false:
                        // queries database for existing employees that are managers
                        db.query("SELECT * FROM employees WHERE manager_id IS NULL", function (err, res) {
                            // deconstructs each existing manager into id & last_name, allowing use as list items below
                            const managers = res.map(({ id, last_name }) => ({
                                name: last_name,
                                value: id,
                            }));

                            // prompt user to choose manager
                            inquirer
                                .prompt({
                                    name: "id",
                                    message: "Who is the new employee's manager?",
                                    type: "list",
                                    choices: managers,
                                })
                                .then((manager) => {
                                    // queries database to add new employee into the employees table
                                    db.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [answers.newFirstName, answers.newLastName, roleData.id, manager.id], function (err, row) {
                                        if (err) throw err;
                                        console.log("Successfully added an employee!");
                                    });

                                    db.query("SELECT * FROM employees", (err, res) => {
                                        console.log("\n");
                                        console.table(res);
                                        console.log("\n");
                                        // returns user to main menu function
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

// updates the role_id of an existing employee in the employees table
function updateEmployee() {
    // queries database for all existing employees
    db.query("SELECT * FROM employees", (err, res) => {
        // deconstructs each existing employee into id & last_name, allowing use as list items below
        const employees = res.map(({ id, last_name }) => ({
            name: last_name,
            value: id,
        }));

        // prompt user to choose an employee
        inquirer
            .prompt({
                name: "id",
                message: "Which employee's role do you want to update?",
                type: "list",
                choices: employees,
            })
            .then((employee) => {
                // queries database for all existing roles
                db.query("SELECT * FROM roles", function (err, res) {
                    // deconstructs each existing role into id & title, allowing use as list items below
                    const roles = res.map(({ id, title }) => ({
                        name: title,
                        value: id,
                    }));

                    // prompts user to choose a new role
                    inquirer
                        .prompt({
                            name: "id",
                            message: "What will this employee's new role be?",
                            type: "list",
                            choices: roles,
                        })
                        .then((role) => {
                            // queries database to update the role_id of chosen employee
                            db.query("UPDATE employees SET role_id = ? WHERE id = ?", [role.id, employee.id], function (err, row) {
                                if (err) throw err;
                                console.log("Successfully updated an employee's role!");
                            });

                            db.query("SELECT * FROM employees", (err, res) => {
                                console.log("\n");
                                console.table(res);
                                console.log("\n");
                                // returns user to main menu function
                                init();
                            });
                        });
                    if (err) throw err;
                });
            });
        if (err) throw err;
    });
}

// deletes a department from the departments table
function deleteDepartment() {
    // queries database for all existing departments
    db.query("SELECT * FROM departments", function (err, res) {
        // deconstructs each existing department into id & name, allowing use as list items below
        const departments = res.map(({ id, name }) => ({
            name: name,
            value: id,
        }));

        // prompts user to choose a department
        inquirer
            .prompt({
                name: "id",
                message: "Which department do you want to delete?",
                type: "list",
                choices: departments,
            })
            .then((department) => {
                // queries database to remove the chosen department from the departments table
                db.query("DELETE FROM departments WHERE id = ?", department.id, function (err, row) {
                    if (err) throw err;
                    console.log("Successfully deleted a department!");
                });

                db.query("SELECT * FROM departments", (err, res) => {
                    console.log("\n");
                    console.table(res);
                    console.log("\n");
                    // returns user to main menu function
                    init();
                });
            });
    });
}

// deletes a role from the roles table
function deleteRole() {
    // queries database for all existing roles
    db.query("SELECT * FROM roles", function (err, res) {
        // deconstructs each existing role into id & title, allowing use as list items below
        const roles = res.map(({ id, title }) => ({
            name: title,
            value: id,
        }));

        // prompts user to choose a role
        inquirer
            .prompt({
                name: "id",
                message: "Which role would you like to delete?",
                type: "list",
                choices: roles,
            })
            .then((role) => {
                // queries database to remove chosen role from the roles table
                db.query("DELETE FROM roles WHERE id = ?", role.id, function (err, row) {
                    if (err) throw err;
                    console.log("Successfully deleted a role!");
                });

                db.query("SELECT * FROM roles", (err, res) => {
                    console.log("\n");
                    console.table(res);
                    console.log("\n");
                    // returns user to main menu function
                    init();
                });
            });
    });
}

// delete an employee from the employees table
function deleteEmployee() {
    // queries database for all existing employees
    db.query("SELECT * FROM employees", (err, res) => {
        // deconstructs each existing employee into id & last_name, allowing use as list items below
        const employees = res.map(({ id, last_name }) => ({
            name: last_name,
            value: id,
        }));

        // prompts user to choose an employee
        inquirer
            .prompt({
                name: "id",
                message: "Which employee would you like to delete?",
                type: "list",
                choices: employees,
            })
            .then((employee) => {
                // queries database to remove chosen employee from the employees table
                db.query("DELETE FROM employees WHERE id = ?", employee.id, function (err, row) {
                    if (err) throw err;
                    console.log("Successfully deleted an employee!");
                });

                db.query("SELECT * FROM employees", (err, res) => {
                    console.log("\n");
                    console.table(res);
                    console.log("\n");
                    // returns user to main menu function
                    init();
                });
            });
    });
}

// initialize the command line interface
init();
