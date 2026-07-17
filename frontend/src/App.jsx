import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, startOfWeek, isBefore, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, BookOpen, Briefcase, Trash2, Bell, Filter } from 'lucide-react';

const API_URL = 'http://localhost:3001/api/events';

function App() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('Combined'); // Combined, Work, School
  
  // Week tracking
  const [currentDate, setCurrentDate] = useState(new Date());
  // Start week on Monday (1) or Sunday (0). Assuming Monday for schedule.
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Generate 7 days for the current week view
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: format(new Date(), 'yyyy-MM-dd'), 
    startTime: '09:00', 
    endTime: '10:00', 
    type: 'Lecture', 
    location: '', 
    reminderEnabled: true 
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(API_URL);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const pin = window.prompt("Enter Admin PIN to add this event:");
    if (!pin) return;

    try {
      await axios.post(API_URL, newEvent, { headers: { 'x-admin-pin': pin } });
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.error || "Error adding event");
      console.error('Error adding event:', error);
    }
  };

  const handleDelete = async (id) => {
    const pin = window.prompt("Enter Admin PIN to delete this event:");
    if (!pin) return;

    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { 'x-admin-pin': pin } });
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.error || "Error deleting event");
      console.error('Error deleting event:', error);
    }
  };

  // Navigate weeks
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const goToToday = () => setCurrentDate(new Date());

  // Analytics for the currently viewed week
  const weekDatesStr = weekDays.map(d => format(d, 'yyyy-MM-dd'));
  const currentWeekEvents = events.filter(e => weekDatesStr.includes(e.date));

  // Analytics removed as per request

  return (
    <div className="min-h-screen bg-dark-900 text-gray-200 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-dark-800 border-r border-dark-700 p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="text-primary-500" />
            Schedule
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your time</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white py-3 px-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add Event
        </button>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </h2>
            <button onClick={goToToday} className="px-3 py-1 bg-dark-800 hover:bg-dark-700 text-sm rounded-lg border border-dark-700 transition-colors">
              Today
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-dark-800 p-1 rounded-xl border border-dark-700">
              {['Combined', 'School', 'Work'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${viewMode === mode ? 'bg-primary-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={prevWeek} className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextWeek} className="p-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
          {weekDays.map((dayObj) => {
            const dateStr = format(dayObj, 'yyyy-MM-dd');
            const isToday = isSameDay(dayObj, new Date());
            
            // Filter events for this day AND view mode
            const dayEvents = events.filter(e => {
              if (e.date !== dateStr) return false;
              if (viewMode === 'Work') return e.type === 'Work';
              if (viewMode === 'School') return e.type === 'Lecture' || e.type === 'Lab' || e.type === 'Study';
              return true; // Combined
            }).sort((a,b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={dateStr} className="flex flex-col gap-3">
                <div className={`text-center pb-2 border-b-2 ${isToday ? 'border-primary-500' : 'border-dark-700'}`}>
                  <p className={`text-sm font-bold ${isToday ? 'text-primary-400' : 'text-gray-400'}`}>{format(dayObj, 'EEEE')}</p>
                  <p className={`text-xs ${isToday ? 'text-primary-300 font-semibold' : 'text-gray-500'}`}>{format(dayObj, 'MMM d')}</p>
                </div>
                
                <div className="flex flex-col gap-3 min-h-[10rem]">
                  {dayEvents.map(event => {
                    // Check if event has passed
                    const eventEndDateTime = parseISO(`${event.date}T${event.endTime}`);
                    const hasPassed = isBefore(eventEndDateTime, new Date());
                    
                    // Calculate hours
                    let durationHours = null;
                    const [sh, sm] = event.startTime.split(':').map(Number);
                    const [eh, em] = event.endTime.split(':').map(Number);
                    const diffMins = (eh * 60 + em) - (sh * 60 + sm);
                    if (diffMins > 0) {
                      durationHours = (diffMins / 60).toFixed(1).replace('.0', '');
                    }

                    return (
                      <div key={event.id} className={`bg-dark-800 border ${isToday && !hasPassed ? 'border-primary-500/30' : 'border-dark-700'} p-4 rounded-xl transition-all group relative ${hasPassed ? 'border-red-500/30 bg-red-950/10 opacity-75' : 'hover:border-primary-500/50'}`}>
                        {!hasPassed && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleDelete(event.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-xs font-semibold ${hasPassed ? 'text-red-400/70' : 'text-primary-400'}`}>
                            {event.startTime} - {event.endTime} 
                            {event.type === 'Work' && durationHours && <span className="ml-1 opacity-80 text-green-400">({durationHours}h)</span>}
                          </p>
                          {hasPassed && <span className="text-[9px] text-red-500/70 uppercase font-bold tracking-wider">Passed</span>}
                        </div>
                        <h3 className={`text-sm font-bold mb-1 ${hasPassed ? 'text-gray-400 line-through decoration-red-500/30' : 'text-white'}`}>{event.title}</h3>
                        {event.location && <p className="text-[10px] text-gray-500 leading-tight">{event.location}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-md ${hasPassed ? 'bg-red-900/20 text-red-400/50' : 'bg-dark-700 text-gray-300'}`}>
                            {event.type}
                          </span>
                          {event.reminderEnabled === 1 && !hasPassed && <Bell size={12} className="text-primary-500" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Add New Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500" placeholder="e.g. QA Work from Office" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                  <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500">
                    <option>Lecture</option>
                    <option>Lab</option>
                    <option>Study</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
                  <input required type="time" value={newEvent.startTime} onChange={e => setNewEvent({...newEvent, startTime: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
                  <input required type="time" value={newEvent.endTime} onChange={e => setNewEvent({...newEvent, endTime: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <input type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500" placeholder="e.g. C9 - Humphrey Raikes" />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="reminder" checked={newEvent.reminderEnabled} onChange={e => setNewEvent({...newEvent, reminderEnabled: e.target.checked})} className="w-4 h-4 rounded border-dark-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-800 bg-dark-900" />
                <label htmlFor="reminder" className="text-sm font-medium text-gray-300">Enable Email Reminder (15 mins before)</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 px-4 rounded-lg font-medium bg-dark-700 hover:bg-dark-600 text-white transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 px-4 rounded-lg font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
