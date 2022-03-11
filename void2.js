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
