const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const path = require('path');
const cors = require('cors');



dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Insert user
app.post('/users', async (req, res) => {
  try {
    const { name, email, password, city, state, country, mobile_number } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, city, state, country, mobile_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, city, state, country, mobile_number]
    );
    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, city, state, country, mobile_number } = req.body;
    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, password = ?, city = ?, state = ?, country = ?, mobile_number = ? WHERE id = ?',
      [name, email, password, city, state, country, mobile_number, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.json({ message: 'User updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});