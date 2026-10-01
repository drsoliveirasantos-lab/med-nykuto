const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory storage (will be replaced with D1)
const homeworkDB = {
  homework: [],
  attachments: []
};

const subjects = [
  { id: 1, name: 'Fisiología II', color: '#FF6B6B' },
  { id: 2, name: 'Bioquímica II', color: '#4ECDC4' },
  { id: 3, name: 'Bioética', color: '#95E1D3' },
  { id: 4, name: 'Epidemiología y Salud Pública', color: '#F9CA24' },
  { id: 5, name: 'Nutrición', color: '#6C5CE7' }
];

// Routes

// Get all homework
app.get('/api/homework', (req, res) => {
  res.json(homeworkDB.homework);
});

// Get homework by subject
app.get('/api/homework/subject/:subjectId', (req, res) => {
  const { subjectId } = req.params;
  const filtered = homeworkDB.homework.filter(h => h.subject_id === parseInt(subjectId));
  res.json(filtered);
});

// Create homework
app.post('/api/homework', (req, res) => {
  const { title, description, subject_id, due_date, attachments } = req.body;

  if (!title || !subject_id || !due_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const homework = {
    id: homeworkDB.homework.length + 1,
    title,
    description,
    subject_id,
    due_date,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attachments: attachments || []
  };

  homeworkDB.homework.push(homework);
  res.status(201).json(homework);
});

// Import from WhatsApp (placeholder)
app.post('/api/import-whatsapp', (req, res) => {
  // This will be implemented with Claude Chrome integration
  // For now, return empty result
  res.json({
    success: true,
    count: 0,
    homework: homeworkDB.homework,
    message: 'Ready to import from WhatsApp. Open Claude Chrome and grant access.'
  });
});

// Get subjects
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Homework Tracker API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎓 Homework Tracker API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
