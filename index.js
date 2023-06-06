const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const db = require('./db/connection.js');

// connecting to database in db/connection

// connecting the employee database
db.connect((err) => {
    if (err) {
        console.error(err);
    }
    console.log('Successfully connected to database');
    employee_log()
})

const employee_log = () => {
    inquirer.prompt(
        [{
            type: 'list',
            name: 'initialAsk',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Roles',
                'View All Departments',
                'Add Employee',
                'Update Employee',
                'Add Role',
                'Add Department',
                'Exit'
            ]
        }]
    ).then((answers) => {
        const { initialAsk } = answers;
        if (initialAsk === 'View All Employees') {
            viewAllEmployees();
        }
        if (initialAsk === 'View All Roles') {
            viewAllRoles();
        }
        if (initialAsk === 'View All Departments') {
            viewAllDepartments();
        }
        if (initialAsk === 'Add Employee') {
            addEmployee();
        }
        if (initialAsk === 'Update Employee') {
            updateEmployee();
        }
        if (initialAsk === 'Add Role') {
            addRole();
        }
        if (initialAsk == 'Add Department') {
            addDepartment();
        }
        if (initialAsk === 'Exit') {
            db.end();
            console.log("Exit")
        }
    });
};

// function to view all employees
const viewAllEmployees = () => {
    const sql = `
        SELECT
            employee.id,
            employee.first_name,
            employee.last_name,
            roles.title,
            department.name AS Department,
            roles.salary,
            CONCAT(manager.first_name, '', manager.last_name) AS manager
        FROM
            employee AS employee
            LEFT JOIN role on employee.role_id = role_id
            LEFT JOIN role on role.department_id = department_id
            LEFT JOIN role employee as manager ON employee.manager_id = manager.id
        `;

    db.query(sql, (err, results) => {
        if (err) throw err;

        console.table('All Employees', results);

        employee_log();
    });
};

// function to view all roles
const viewAllRoles = () => {
    const rolesql = `
      SELECT
        role.id,
        role.title,
        department.name AS department,
        role.salary
      FROM
        role
      LEFT JOIN department ON role.department_id = department.id
    `;

    db.query(rolesql, (err, results) => {
        if (err) throw err;

        console.table('All Roles', results);

        employee_log();
    });
};

// function to view all departments
const viewAllDepartments = () => {
    const sql = `
      SELECT
        id,
        name AS department
      FROM
        department
    `;

    db.query(sql, (err, results) => {
        if (err) throw err;

        console.table('All Departments', results);

        employee_log();
    });
};

// function to add an employee to the database
const addEmployee = () => {

    const roleSQL = `SELECT id, title FROM roles`;
    const managerSQL = `SELECT id, CONCAT(first_name," ", last_name) as name FROM employees WHERE manager_id IS NOT NULL`

    db.query(roleSQL, (err, roles) => {
        if (err) throw err;

        db.query(managerSQL, (err, managers) => {
            if (err) throw err;
        })

        const roleChoice = roles.map((role) => ({
            name: role.title,
            value: role.id,
        }));

        const managerChoice = managers.map((manager) => ({
            name: manager.name,
            value: manager.id,
        }));

        inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "Enter employee's first name"
            },
            {
                type: 'input',
                name: 'last_name',
                message: "Enter employee's last name"
            },
            {
                type: 'list',
                name: 'role_id',
                message: "Select employee role",
                choices: roleChoice
            },
            {
                type: 'list',
                name: 'manager_id',
                message: "Selct employee manager",
                choices: managerChoice
            },
        ]).then((answers) => {
            const { first_name, last_name, role_id, manager_id } = answers;

            const sql =
                `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
            db.query(sql, [first_name, last_name, role_id, manager_id], (err, result) => {
                if (err) throw err;
                console.log('Added employee to the database.');
                employee_log();
            });
        });
    });
};

// function to update an employee's information in the database
const updateEmployee = () => {
    const employeeSql = `SELECT id, first_name, last_name, FROM employee`;
    const roleSql = 'SELECT id, title FROM roles';

    db.query(employeeSql, (err, employeeList) => {
        if (err) throw err;

        db.query(roleSql, (err, roleList) => {
            if (err) throw err;

            const employees = employeeList.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            }));

            const roleChoices = roleList.map((roles) => ({
                name: roles.title,
                value: roles.id,
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: "Select the employee you would like to update.",
                    choices: employees,
                },
                {
                    type: 'list',
                    name: 'assignRole',
                    message: "Which role would you like to assign to the selected employee?",
                    choices: roleChoices
                },
            ]).then((answers) => {
                const { employeeId, assignRole } = answers;
                const sql = 'UPDATE employee SET role_id = ? WHERE id = ?';
                db.query(sql, [assignRole, employeeId], (err, result) => {
                    if (err) throw err;
                    console.log("Successfully updated employee's role.")
                    employee_log();
                });
            });
        });
    });
};

//function for adding a role
const addRole = () => {

    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: "Enter the title of the new role:"
        },
        {
            type: 'input',
            name: 'salary',
            message: "Enter the salary for the new role:"
        },
        {
            type: 'input',
            name: 'departmentId',
            message: "Enter the department ID for the new role:"
        }
    ]).then((answers) => {
        const { title, salary, departmentId } = answers;

        const sql = `
        INSERT INTO roles (title, salary, department_id)
        VALUES (?, ?, ?)
      `;
        const params = [title, salary, departmentId];

        db.query(sql, params, (err, result) => {
            if (err) throw err;

            console.log('Successfully added a new role.');

            employee_log();
        });
    });
};

const addDepartment = () => {
    
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the new department:'
        }
    ]).then((answers) => {
        const { departmentName } = answers;

        const sql = `
        INSERT INTO department (department_name)
        VALUES (?)
      `;
        const params = [departmentName];

        db.query(sql, params, (err, result) => {
            if (err) throw err;

            console.log('Successfully added a new department.');

            employee_log();
        });
    });
};



