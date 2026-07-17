const db = require('./database');

const eventsTemplate = [
  // Monday
  { dayOff: 0, title: "QA Work (Morning Shift)", startTime: "06:00", endTime: "14:00", type: "Work", location: "Office" },
  { dayOff: 0, title: "[LAB] AAA / OS (COMS3005A/3010A)", startTime: "14:15", endTime: "17:00", type: "Lab", location: "MSL6.8,9,110,111" },
  { dayOff: 0, title: "Study: AAA/OS Theory", startTime: "19:00", endTime: "23:59", type: "Study", location: "Home" },
  // Tuesday
  { dayOff: 1, title: "QA Work (Morning Shift)", startTime: "06:00", endTime: "14:00", type: "Work", location: "Office" },
  { dayOff: 1, title: "[LAB] CGV / SDP Sprint (COMS3006A/3011A)", startTime: "14:15", endTime: "17:00", type: "Lab", location: "MSL004,5" },
  { dayOff: 1, title: "Study: CGV/SDP", startTime: "19:00", endTime: "23:59", type: "Study", location: "Home" },
  // Wednesday
  { dayOff: 2, title: "QA Work (Early Shift)", startTime: "06:00", endTime: "07:45", type: "Work", location: "Home" },
  { dayOff: 2, title: "[LECTURE] AAA (COMS3005A)", startTime: "08:00", endTime: "09:45", type: "Lecture", location: "C9 - Humphrey Raikes" },
  { dayOff: 2, title: "QA Work (Midday Shift)", startTime: "10:00", endTime: "16:15", type: "Work", location: "Office" },
  { dayOff: 2, title: "Study: SDP Project Work", startTime: "19:30", endTime: "23:59", type: "Study", location: "Home" },
  // Thursday
  { dayOff: 3, title: "QA Work (Early Shift)", startTime: "06:00", endTime: "07:45", type: "Work", location: "Home" },
  { dayOff: 3, title: "[LECTURE] SDP (COMS3011A)", startTime: "08:00", endTime: "09:45", type: "Lecture", location: "RS38" },
  { dayOff: 3, title: "[LECTURE] OS (COMS3010A)", startTime: "10:15", endTime: "12:00", type: "Lecture", location: "WSS5" },
  { dayOff: 3, title: "QA Work (Afternoon Shift)", startTime: "12:15", endTime: "18:00", type: "Work", location: "Office" },
  { dayOff: 3, title: "QA Work (Wrap-up Shift)", startTime: "18:15", endTime: "18:45", type: "Work", location: "Home" },
  { dayOff: 3, title: "Study: OS Theory", startTime: "21:00", endTime: "23:59", type: "Study", location: "Home" },
  // Friday
  { dayOff: 4, title: "QA Work (Morning Shift)", startTime: "06:00", endTime: "10:00", type: "Work", location: "Home" },
  { dayOff: 4, title: "[LECTURE] CGV (COMS3006A)", startTime: "10:15", endTime: "12:00", type: "Lecture", location: "FNB47" },
  { dayOff: 4, title: "[TUTORIAL] AAA (COMS3005A)", startTime: "12:30", endTime: "13:15", type: "Lecture", location: "WSS5" },
  { dayOff: 4, title: "QA Work (Afternoon Shift)", startTime: "13:30", endTime: "17:30", type: "Work", location: "Office" },
  // Saturday (Wakes at 10:00)
  { dayOff: 5, title: "Deep Work (School Projects)", startTime: "11:00", endTime: "18:00", type: "Study", location: "Home" },
  { dayOff: 5, title: "QA Work Prep", startTime: "18:00", endTime: "20:00", type: "Work", location: "Home" },
  // Sunday (Sleeps at 23:00)
  { dayOff: 6, title: "Deep Work (School Projects)", startTime: "10:00", endTime: "18:00", type: "Study", location: "Home" },
  { dayOff: 6, title: "QA Work Prep for next week", startTime: "18:00", endTime: "20:00", type: "Work", location: "Home" },
  { dayOff: 6, title: "Study: Weekly Review & Catchup", startTime: "20:00", endTime: "23:00", type: "Study", location: "Home" }
];

const seedDB = () => {
  // Start Monday July 13, 2026
  let currentDate = new Date(2026, 6, 13, 12, 0, 0); // Noon to avoid timezone shifts
  const endDate = new Date(2027, 0, 15, 12, 0, 0);

  db.serialize(() => {
    db.run("DELETE FROM events"); // Clear existing events
    
    const stmt = db.prepare(`INSERT INTO events (title, date, startTime, endTime, location, type, reminderEnabled, reminded) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`);
    
    // Iterate week by week
    while (currentDate <= endDate) {
      // Create events for this week
      eventsTemplate.forEach(ev => {
        let evDate = new Date(currentDate);
        evDate.setDate(currentDate.getDate() + ev.dayOff);
        
        if (evDate <= endDate) {
            // format YYYY-MM-DD
            const year = evDate.getFullYear();
            const month = String(evDate.getMonth() + 1).padStart(2, '0');
            const day = String(evDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            // Custom Overrides for July 20 and July 21 (Free Days, No Labs, Work is 9 hours: 08:00-17:00)
            if ((formattedDate === '2026-07-20' || formattedDate === '2026-07-21')) {
                if (ev.type === 'Lab') return; // Skip lab
                if (ev.type === 'Work') {
                    stmt.run([ev.title, formattedDate, "08:00", "17:00", ev.location, ev.type, ev.reminderEnabled === false ? 0 : 1]);
                    return;
                }
            }
            
            stmt.run([ev.title, formattedDate, ev.startTime, ev.endTime, ev.location, ev.type, ev.reminderEnabled === false ? 0 : 1]);
        }
      });
      // Move to next Monday
      currentDate.setDate(currentDate.getDate() + 7);
    }
    stmt.finalize();
    console.log("Database seeded successfully until Jan 15 2027!");
  });
};

// Wait for table to be created
setTimeout(seedDB, 1000);
