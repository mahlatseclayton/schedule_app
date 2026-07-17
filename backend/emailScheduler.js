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

    db.all('SELECT * FROM events WHERE date = ? AND reminderEnabled = 1 AND reminded = 0', [currentDate], async (err, events) => {
        if (err) {
            console.error('Error fetching events for cron:', err.message);
            return;
        }

        for (const event of events) {
            const startMinutes = timeToMinutes(event.startTime);
            // Check if event is starting in exactly 30 minutes
            if (startMinutes - currentMinutes === 30) {
                let motivation = "Have a great session!";
                try {
                    // Randomly choose between ZenQuotes (Motivational) and OurManna (Bible)
                    if (Math.random() > 0.5) {
                        const res = await fetch('https://zenquotes.io/api/random');
                        const data = await res.json();
                        if (data && data.length > 0) {
                            motivation = `"${data[0].q}"<br/><br/>— <strong>${data[0].a}</strong>`;
                        }
                    } else {
                        const res = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json');
                        const data = await res.json();
                        if (data && data.verse && data.verse.details) {
                            motivation = `"${data.verse.details.text}"<br/><br/>— <strong>${data.verse.details.reference}</strong>`;
                        }
                    }
                } catch (e) {
                    console.error('API fetch failed, falling back to default.', e.message);
                }

                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1f2937; color: #f3f4f6; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #60a5fa; border-bottom: 1px solid #374151; padding-bottom: 15px; margin-top: 0;">📅 Reminder: ${event.title}</h2>
                        <p style="font-size: 16px;">Hello,</p>
                        <p style="font-size: 16px;">This is a reminder that you have a <strong>${event.type}</strong> for <strong>${event.title}</strong> starting at <strong>${event.startTime}</strong>.</p>
                        <p style="font-size: 16px; background: #111827; padding: 12px; border-radius: 8px;"><strong>📍 Location:</strong> ${event.location || 'N/A'}</p>
                        
                        <div style="margin-top: 30px; padding: 20px; background: #374151; border-left: 5px solid #3b82f6; border-radius: 4px;">
                            <p style="font-size: 16px; font-style: italic; margin: 0; color: #d1d5db; line-height: 1.5;">${motivation}</p>
                        </div>
                    </div>
                `;

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_USER, // Send reminder to yourself
                    subject: `Reminder: ${event.title} starts in 30 minutes!`,
                    html: htmlContent
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
        }
    });
});

console.log('Email scheduler started.');
