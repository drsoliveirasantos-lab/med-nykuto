import React, { useState } from 'react';

function Calendar({ homework, subjects }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const subjectMap = {};
  subjects.forEach(s => {
    subjectMap[s.id] = s;
  });

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getHomeworkForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return homework.filter(h => h.due_date.startsWith(dateStr));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days.map((day, idx) => (
      <div key={idx} className="calendar-day">
        {day && (
          <>
            <div className="day-number">{day}</div>
            <div className="day-homework">
              {getHomeworkForDate(day).map((hw) => (
                <div
                  key={hw.id}
                  className="hw-item"
                  style={{ borderLeft: `4px solid ${subjectMap[hw.subject_id]?.color || '#999'}` }}
                  title={hw.title}
                >
                  {hw.title.substring(0, 15)}...
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    ));
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
          ← Prev
        </button>
        <h2>
          {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
          Next →
        </button>
      </div>

      <div className="calendar-grid">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
}

export default Calendar;
