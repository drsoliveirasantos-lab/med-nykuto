import React from 'react';

function Navigation({ subjects, onSubjectSelect, onViewChange, currentView }) {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>🎓 med nykuto</h1>
      </div>

      <div className="nav-buttons">
        <button
          className={`nav-btn ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => onViewChange('calendar')}
        >
          📅 Calendar
        </button>
      </div>

      <div className="nav-subjects">
        <div className="subjects-label">Subjects:</div>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            className="subject-btn"
            style={{ backgroundColor: subject.color }}
            onClick={() => onSubjectSelect(subject)}
            title={subject.name}
          >
            {subject.name.substring(0, 3)}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;
