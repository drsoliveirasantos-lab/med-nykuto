# Homework Tracker App

An integrated homework tracking system for med nykuto students with WhatsApp Web integration.

## Features

- 📅 Calendar view for homework deadlines
- 📚 Organization by subject (Fisiología, Bioquímica, Microbiología, Genética, Inmunología)
- 📎 File attachment support
- 🌐 Web dashboard
- 📱 Mobile application
- 🤖 WhatsApp Web integration via Claude Chrome

## Project Structure

```
homework-tracker/
├── backend/       # Node.js REST API
├── web/           # React web dashboard
├── mobile/        # React Native mobile app
├── database/      # Database schema and migrations
└── docs/          # Documentation
```

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- GitHub credentials

### Installation

```bash
# Install backend
cd backend
npm install

# Install web
cd ../web
npm install

# Install mobile
cd ../mobile
npm install
```

## Development

### Backend
```bash
cd backend
npm run dev
```

### Web
```bash
cd web
npm start
```

### Mobile
```bash
cd mobile
npm start
```

## Database

The app uses Cloudflare D1 for data storage. See `database/schema.sql` for the complete schema.

## WhatsApp Integration

When the user opens WhatsApp Web in Claude Chrome and grants access, the app will:
1. Scrape homework messages
2. Parse dates and subjects
3. Store in database
4. Update all views in real-time

## 5 Subjects (Semester 4)

1. **Fisiología II** - Physiology (Dra. Giselle Vert)
2. **Bioquímica II** - Biochemistry (Dra. Andrea López)
3. **Bioética** - Bioethics (Lic. Silvia Nuarte)
4. **Epidemiología y Salud Pública** - Epidemiology & Public Health (Dra. Andrea Isasi)
5. **Nutrición** - Nutrition
