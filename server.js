const express = require("express");
const sql = require("mssql");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

app.get("/api/students", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool
            .request()
            .query("SELECT * FROM students ORDER BY id");

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database connection failed"
        });
    }
});

app.post("/api/students", async (req, res) => {
    try {
        const { name, email, course } = req.body;

        const pool = await sql.connect(dbConfig);

        await pool
            .request()
            .input("name", sql.NVarChar(100), name)
            .input("email", sql.NVarChar(150), email)
            .input("course", sql.NVarChar(100), course)
            .query(`
                INSERT INTO students (name, email, course)
                VALUES (@name, @email, @course)
            `);

        res.json({
            message: "Student added successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to add student"
        });
    }
});

app.delete("/api/students/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const pool = await sql.connect(dbConfig);

        await pool
            .request()
            .input("id", sql.Int, id)
            .query("DELETE FROM students WHERE id = @id");

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete student"
        });
    }
});

app.put("/api/students/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, email, course } = req.body;

        const pool = await sql.connect(dbConfig);

        const result = await pool
            .request()
            .input("id", sql.Int, id)
            .input("name", sql.NVarChar(100), name)
            .input("email", sql.NVarChar(150), email)
            .input("course", sql.NVarChar(100), course)
            .query(`
                UPDATE students
                SET name = @name,
                    email = @email,
                    course = @course
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({
            message: "Student updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update student"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});