const express = require('express');
const cors = require('cors');
const db = require('./database');
require('./emailScheduler'); // Start cron job

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const checkPin = (req, res, next) => {
    const pin = req.headers['x-admin-pin'];
    if (!pin || pin !== process.env.ADMIN_PIN) {
        return res.status(401).json({ error: "Unauthorized. Invalid Admin PIN." });
    }
    next();
};

// Get all events
app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create an event
app.post('/api/events', checkPin, (req, res) => {
    const { title, date, startTime, endTime, location, type, reminderEnabled } = req.body;
    
    // Prevent adding passed events (in the past)
    const eventDateTime = new Date(`${date}T${endTime}`);
    if (eventDateTime < new Date()) {
        return res.status(400).json({ error: "Cannot add events in the past." });
    }

    const sql = `INSERT INTO events (title, date, startTime, endTime, location, type, reminderEnabled, reminded) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
    const params = [title, date, startTime, endTime, location, type, reminderEnabled ? 1 : 0];
    
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// Update an event
app.put('/api/events/:id', checkPin, (req, res) => {
    const { title, date, startTime, endTime, location, type, reminderEnabled } = req.body;
    const sql = `UPDATE events SET title = ?, date = ?, startTime = ?, endTime = ?, location = ?, type = ?, reminderEnabled = ?, reminded = 0 WHERE id = ?`;
    const params = [title, date, startTime, endTime, location, type, reminderEnabled ? 1 : 0, req.params.id];
    
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

// Delete an event
app.delete('/api/events/:id', checkPin, (req, res) => {
    db.run(`DELETE FROM events WHERE id = ?`, req.params.id, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
