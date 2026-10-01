import React from 'react';

function SubjectView({ subject, homework, subjects }) {
  if (!subject) {
    return <div className="empty">Select a subject to view details</div>;
  }

  const sortedHomework = [...homework].sort((a, b) =>
    new Date(a.due_date) - new Date(b.due_date)
  );

  return (
    <div className="subject-view">
      <div className="subject-header" style={{ backgroundColor: subject.color }}>
        <h2>{subject.name}</h2>
        <p>{homework.length} assignments</p>
      </div>

      <div className="homework-list">
        {sortedHomework.length > 0 ? (
          sortedHomework.map((hw) => (
            <div key={hw.id} className="homework-card">
              <div className="hw-title">{hw.title}</div>
              <div className="hw-date">
                📅 {new Date(hw.due_date).toLocaleDateString('es-ES')}
              </div>
              {hw.description && (
                <div className="hw-description">{hw.description}</div>
              )}
              {hw.attachments && hw.attachments.length > 0 && (
                <div className="hw-files">
                  <strong>📎 Files:</strong>
                  <ul>
                    {hw.attachments.map((file) => (
                      <li key={file.id}>
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          {file.file_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty">No assignments for this subject yet</div>
        )}
      </div>
    </div>
  );
}

export default SubjectView;
