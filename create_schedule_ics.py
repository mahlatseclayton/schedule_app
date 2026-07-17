import datetime

def format_dt(dt):
    return dt.strftime("%Y%m%dT%H%M%S")

def add_event(uid_suffix, title, start_time, end_time, days_of_week, until_date, location=None):
    """
    days_of_week: list of strings like 'MO', 'TU', 'WE'
    start_time/end_time: datetime objects for the FIRST occurrence
    """
    dtstart = format_dt(start_time)
    dtend = format_dt(end_time)
    until = format_dt(until_date) + "Z"
    byday = ",".join(days_of_week)
    
    event = f"""BEGIN:VEVENT
UID:event_{uid_suffix}@wits.schedule
DTSTAMP:{format_dt(datetime.datetime.now(datetime.timezone.utc))}Z
DTSTART;TZID=Africa/Johannesburg:{dtstart}
DTEND;TZID=Africa/Johannesburg:{dtend}
SUMMARY:{title}
RRULE:FREQ=WEEKLY;BYDAY={byday};UNTIL={until}"""

    if location:
        event += f"\nLOCATION:{location}"
        
    event += f"""
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder for {title}
TRIGGER:-PT15M
END:VALARM
END:VEVENT
"""
    return event

def main():
    # Semester 2 start week (e.g. starting Monday July 20, 2026)
    base_date = datetime.datetime(2026, 7, 20) # A Monday
    until_date = datetime.datetime(2026, 11, 30) # Approximate end of semester
    
    events = []
    
    # --- MONDAY ---
    events.append(add_event("mon_work", "QA Work from Office", 
                            base_date.replace(hour=8, minute=0), 
                            base_date.replace(hour=14, minute=0), ["MO"], until_date))
    events.append(add_event("mon_lab", "[LAB] AAA / OS (COMS3005A/3010A)", 
                            base_date.replace(hour=14, minute=15), 
                            base_date.replace(hour=17, minute=0), ["MO"], until_date, location="MSL6.8,9,110,111"))
    events.append(add_event("mon_study", "Study: AAA/OS Theory", 
                            base_date.replace(hour=19, minute=0), 
                            base_date.replace(hour=23, minute=59), ["MO"], until_date))
                            
    # --- TUESDAY ---
    tue = base_date + datetime.timedelta(days=1)
    events.append(add_event("tue_work", "QA Work from Office", 
                            tue.replace(hour=8, minute=0), 
                            tue.replace(hour=14, minute=0), ["TU"], until_date))
    events.append(add_event("tue_lab", "[LAB] CGV / SDP Sprint (COMS3006A/3011A)", 
                            tue.replace(hour=14, minute=15), 
                            tue.replace(hour=17, minute=0), ["TU"], until_date, location="MSL004,5"))
    events.append(add_event("tue_study", "Study: CGV/SDP", 
                            tue.replace(hour=19, minute=0), 
                            tue.replace(hour=23, minute=59), ["TU"], until_date))

    # --- WEDNESDAY ---
    wed = base_date + datetime.timedelta(days=2)
    events.append(add_event("wed_lect", "[LECTURE] AAA (COMS3005A)", 
                            wed.replace(hour=8, minute=0), 
                            wed.replace(hour=9, minute=45), ["WE"], until_date, location="C9 - Humphrey Raikes (School of Chemistry)"))
    events.append(add_event("wed_work", "QA Work from Office", 
                            wed.replace(hour=10, minute=0), 
                            wed.replace(hour=18, minute=0), ["WE"], until_date))
    events.append(add_event("wed_study", "Study: SDP Project Work", 
                            wed.replace(hour=19, minute=30), 
                            wed.replace(hour=23, minute=59), ["WE"], until_date))

    # --- THURSDAY ---
    thu = base_date + datetime.timedelta(days=3)
    events.append(add_event("thu_lect1", "[LECTURE] SDP (COMS3011A)", 
                            thu.replace(hour=8, minute=0), 
                            thu.replace(hour=9, minute=45), ["TH"], until_date, location="RS38"))
    events.append(add_event("thu_lect2", "[LECTURE] OS (COMS3010A)", 
                            thu.replace(hour=10, minute=15), 
                            thu.replace(hour=12, minute=0), ["TH"], until_date, location="WSS5"))
    events.append(add_event("thu_work", "QA Work from Office", 
                            thu.replace(hour=12, minute=0), 
                            thu.replace(hour=20, minute=0), ["TH"], until_date))
    events.append(add_event("thu_study", "Study: OS Theory", 
                            thu.replace(hour=21, minute=30), 
                            thu.replace(hour=23, minute=59), ["TH"], until_date))

    # --- FRIDAY ---
    fri = base_date + datetime.timedelta(days=4)
    events.append(add_event("fri_wfh", "QA WFH (Morning)", 
                            fri.replace(hour=7, minute=30), 
                            fri.replace(hour=9, minute=30), ["FR"], until_date))
    events.append(add_event("fri_lect", "[LECTURE] CGV (COMS3006A)", 
                            fri.replace(hour=10, minute=15), 
                            fri.replace(hour=12, minute=0), ["FR"], until_date, location="FNB47"))
    events.append(add_event("fri_tut", "[TUTORIAL] AAA (COMS3005A)", 
                            fri.replace(hour=12, minute=30), 
                            fri.replace(hour=13, minute=15), ["FR"], until_date, location="WSS5"))
    events.append(add_event("fri_work", "QA Work from Office", 
                            fri.replace(hour=13, minute=30), 
                            fri.replace(hour=18, minute=0), ["FR"], until_date))

    # --- SUNDAY ---
    sun = base_date + datetime.timedelta(days=6)
    events.append(add_event("sun_study", "Deep Work (School Projects)", 
                            sun.replace(hour=10, minute=0), 
                            sun.replace(hour=16, minute=0), ["SU"], until_date))
    events.append(add_event("sun_prep", "QA Work Prep for next week", 
                            sun.replace(hour=16, minute=0), 
                            sun.replace(hour=18, minute=0), ["SU"], until_date))

    # Compile the ICS file
    ics_content = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//My Schedule//EN\n"
    for e in events:
        ics_content += e
    ics_content += "END:VCALENDAR\n"

    with open("semester_schedule.ics", "w") as f:
        f.write(ics_content)
        
    print("Successfully generated semester_schedule.ics")

if __name__ == "__main__":
    main()
