--seeded information for department, roles, and employee
INSERT INTO department (department_name)
VALUES ("Engineering"),
    ("Human Resources"),
    ("Sales"),
    ("Executives"),
    ("Marketing"),
    ("Legal");

INSERT INTO roles (title, salary, department_id)
VALUES ("Engineering Manager", 140000, 1),
    ("HR Generalist", 100000, 2),
    ("Account Executive", 120000, 3),
    ("CEO", 300000, 4),
    ("Program Manager", 120000, 5),
    ("Paralegal", 100000, 6);

INSERT INTO employee (role_id, first_name, last_name, manager_id)
VALUES (1, "Michael", "Scott", NULL),
       (2, "Dwight", "Schrute", 1),
       (3, "Meredith", "Palmer", 2),
       (4, "Stanley", "Hudson", 3),
       (5, "Toby", "Flenderson", 4),
       (6, "Creed", "Bratton", 5);