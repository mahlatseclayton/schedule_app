const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('./database');
require('dotenv').config();

// Create a transporter using Gmail App Passwords
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to get current day name (e.g. "MO", "TU")
const getDayString = () => {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return days[new Date().getDay()];
};

// Helper function to calculate minutes from midnight
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Run cron job every minute
cron.schedule('* * * * *', () => {
    const now = new Date();
    // format YYYY-MM-DD
    const currentDate = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    db.all('SELECT * FROM events WHERE date = ? AND reminderEnabled = 1 AND reminded = 0', [currentDate], (err, events) => {
        if (err) {
            console.error('Error fetching events for cron:', err.message);
            return;
        }

        events.forEach(event => {
            const startMinutes = timeToMinutes(event.startTime);
            // Check if event is starting in exactly 15 minutes
            if (startMinutes - currentMinutes === 15) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_USER, // Send reminder to yourself
                    subject: `Reminder: ${event.title} starts in 15 minutes!`,
                    text: `Hello!\n\nThis is a reminder that you have ${event.type} for ${event.title} at ${event.startTime}.\n\nLocation: ${event.location || 'N/A'}\n\nHave a great session!`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        // Mark as reminded
                        db.run('UPDATE events SET reminded = 1 WHERE id = ?', [event.id]);
                    }
                });
            }
        });
    });
});

console.log('Email scheduler started.');
