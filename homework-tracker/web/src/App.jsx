import React, { useState, useEffect } from 'react';
import './App.css';
import Calendar from './components/Calendar';
import SubjectView from './components/SubjectView';
import Navigation from './components/Navigation';

function App() {
  const [view, setView] = useState('calendar');
  const [homework, setHomework] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);

  const subjects = [
    { id: 1, name: 'Fisiología II', color: '#FF6B6B' },
    { id: 2, name: 'Bioquímica II', color: '#4ECDC4' },
    { id: 3, name: 'Bioética', color: '#95E1D3' },
    { id: 4, name: 'Epidemiología y Salud Pública', color: '#F9CA24' },
    { id: 5, name: 'Nutrición', color: '#6C5CE7' }
  ];

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/homework');
      if (response.ok) {
        const data = await response.json();
        setHomework(data);
      }
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
    setLoading(false);
  };

  const handleImportFromWhatsApp = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/import-whatsapp', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setHomework(result.homework);
        alert(`Imported ${result.count} homework items`);
      }
    } catch (error) {
      console.error('Error importing from WhatsApp:', error);
      alert('Error importing data');
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <Navigation
        subjects={subjects}
        onSubjectSelect={(subject) => {
          setSelectedSubject(subject);
          setView('subject');
        }}
        onViewChange={setView}
        currentView={view}
      />

      <div className="content">
        <div className="header">
          <h1>📚 Homework Tracker</h1>
          <button
            onClick={handleImportFromWhatsApp}
            className="import-btn"
            disabled={loading}
          >
            {loading ? 'Importing...' : '📱 Import from WhatsApp'}
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : view === 'calendar' ? (
          <Calendar homework={homework} subjects={subjects} />
        ) : (
          <SubjectView
            subject={selectedSubject}
            homework={homework.filter(h => h.subject_id === selectedSubject?.id)}
            subjects={subjects}
          />
        )}
      </div>
    </div>
  );
}

export default App;
