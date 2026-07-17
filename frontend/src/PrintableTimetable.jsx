import React from 'react';
import { addDays, format } from 'date-fns';

const PrintableTimetable = React.forwardRef(({ events, weekStart, viewMode }, ref) => {
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  // Find min and max hours dynamically based on events
  let minHour = 8;
  let maxHour = 18;

  events.forEach(e => {
    const sh = parseInt(e.startTime.split(':')[0], 10);
    const eh = parseInt(e.endTime.split(':')[0], 10) + (parseInt(e.endTime.split(':')[1], 10) > 0 ? 1 : 0);
    if (sh < minHour) minHour = sh;
    if (eh > maxHour) maxHour = eh;
  });
  
  if (minHour < 5) minHour = 5;
  if (maxHour > 23) maxHour = 23;

  const hoursCount = maxHour - minHour;
  const hours = Array.from({ length: hoursCount + 1 }).map((_, i) => i + minHour); 

  const PIXELS_PER_HOUR = 70;
  const HEADER_HEIGHT = 40;

  // Helper to calculate position and height for an event
  const getEventStyle = (startTime, endTime) => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    
    const startOffsetMins = (sh - minHour) * 60 + sm;
    const durationMins = (eh * 60 + em) - (sh * 60 + sm);
    
    return {
      top: `${(startOffsetMins / 60) * PIXELS_PER_HOUR + HEADER_HEIGHT}px`, 
      height: `${(durationMins / 60) * PIXELS_PER_HOUR}px`,
      position: 'absolute',
      left: '4px',
      right: '4px',
      zIndex: 10
    };
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Lecture': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'Lab': return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'Study': return 'bg-green-50 border-green-200 text-green-900';
      case 'Work': return 'bg-orange-50 border-orange-200 text-orange-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  return (
    <div ref={ref} className="bg-white text-black p-10 w-[1400px]" style={{ fontFamily: 'sans-serif' }}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Schedule ({viewMode} View)</h1>
        <p className="text-lg text-gray-500">Week of {format(weekStart, 'MMMM d, yyyy')}</p>
      </div>

      <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex shadow-sm">
        {/* Time Column */}
        <div className="w-20 border-r-2 border-gray-300 bg-white shrink-0 relative" style={{ height: `${hoursCount * PIXELS_PER_HOUR + HEADER_HEIGHT}px` }}>
          <div className="border-b-2 border-gray-300 bg-gray-100" style={{ height: `${HEADER_HEIGHT}px` }}></div>
          {hours.slice(0, -1).map(h => (
            <div key={h} className="border-b border-gray-200 text-xs font-medium text-gray-400 text-right pr-2 pt-1 relative -top-3" style={{ height: `${PIXELS_PER_HOUR}px` }}>
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Days Columns */}
        <div className="flex-1 flex">
          {weekDays.map((dayObj) => {
            const dateStr = format(dayObj, 'yyyy-MM-dd');
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

            return (
              <div key={dateStr} className={`flex-1 border-r border-gray-300 last:border-r-0 relative ${isToday ? 'bg-blue-50/30' : ''}`} style={{ height: `${hoursCount * PIXELS_PER_HOUR + HEADER_HEIGHT}px` }}>
                {/* Day Header */}
                <div className={`border-b-2 border-gray-300 flex flex-col items-center justify-center ${isToday ? 'bg-blue-100/50' : 'bg-gray-100'}`} style={{ height: `${HEADER_HEIGHT}px` }}>
                  <span className={`font-bold text-sm ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{format(dayObj, 'EEEE')}</span>
                  <span className={`text-xs ${isToday ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>{format(dayObj, 'MMM d')}</span>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none" style={{ top: `${HEADER_HEIGHT}px` }}>
                  {hours.slice(0, -1).map(h => (
                    <div key={h} className="border-b border-gray-200" style={{ height: `${PIXELS_PER_HOUR}px` }}></div>
                  ))}
                </div>

                {/* Events */}
                {dayEvents.map(event => {
                  const style = getEventStyle(event.startTime, event.endTime);
                  return (
                    <div 
                      key={event.id} 
                      className={`border rounded-lg p-2 shadow-sm overflow-hidden flex flex-col ${getTypeColor(event.type)}`}
                      style={style}
                    >
                      <div className="text-[11px] font-bold opacity-60 leading-none mb-1">
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className="font-bold text-sm leading-tight mb-1 break-words">
                        {event.title}
                      </div>
                      {event.location && (
                        <div className="text-xs opacity-75 leading-tight flex items-center gap-1 mt-auto">
                          {event.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm font-medium">
        Generated on {format(new Date(), 'MMMM d, yyyy HH:mm')}
      </div>
    </div>
  );
});

PrintableTimetable.displayName = 'PrintableTimetable';

export default PrintableTimetable;
