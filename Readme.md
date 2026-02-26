🚀 RTF Reporting Tool starten                                                                                                                                                                                                                                                                      
  Du hast mehrere Optionen, um die RTF Reporting Tool App zu starten. Hier sind alle Methoden:                                                                                                            
  📋 Voraussetzungen

brew install node


  Node.js & npm:                                            
  node --version  # >= 18.0.0 erforderlich
  npm --version   # >= 9.0.0 erforderlich

  🐳 Option 1: Mit Docker (Empfohlen)

  Am einfachsten - startet automatisch PostgreSQL, Redis, Backend und Frontend:

  cd /Users/hoessm/Documents/00_Active/experiments/RTF_XBRL/rtf-reporting-tool

  # Alle Services mit einem Befehl starten
  npm run docker:up

  # Oder direkt mit docker-compose
  docker-compose up -d

  Zugriff:
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:3001
  - Swagger UI: http://localhost:3001/documentation

  Services stoppen:
  npm run docker:down
  # oder
  docker-compose down

  ⚡ Option 2: Development Mode (npm workspaces)

  Für aktive Entwicklung - mit Hot Reload:

  cd /Users/hoessm/Documents/00_Active/experiments/RTF_XBRL/rtf-reporting-tool

  # Dependencies installieren
  npm install

  # Backend und Frontend parallel starten
  npm run dev

  Dies startet automatisch:
  - Backend auf Port 3001 (mit tsx watch)
  - Frontend auf Port 3000 (mit Vite)

  🔧 Option 3: Manuell (separate Terminals)

  Für mehr Kontrolle - jeder Service in eigenem Terminal:

  Terminal 1 - Backend:

  cd /Users/hoessm/Documents/00_Active/experiments/RTF_XBRL/rtf-reporting-tool/backend
  npm install
  npm run dev

  Terminal 2 - Frontend:

  cd /Users/hoessm/Documents/00_Active/experiments/RTF_XBRL/rtf-reporting-tool/frontend
  npm install
  npm run dev

  🗄️  Datenbank Setup (für Option 2 & 3)

  Falls du nicht Docker verwendest, brauchst du PostgreSQL und Redis:

  # PostgreSQL starten (macOS mit Homebrew)
  brew services start postgresql
  createdb rtf_reporting

  # Redis starten
  brew services start redis

  # Database Migration & Seeding
  npm run db:migrate
  npm run db:seed

  🎯 Empfohlener Workflow

  Für Entwicklung:
  # 1. Projekt-Root
  cd /Users/hoessm/Documents/00_Active/experiments/RTF_XBRL/rtf-reporting-tool

  # 2. Docker starten (einfachste Option)
  npm run docker:up

  # 3. Entwickeln mit Hot Reload
  npm run dev

  # 4. Testen
  npm run test

  # 5. Build für Production
  npm run build

  🔍 URLs nach dem Start

  - 🌐 Frontend (React): http://localhost:3000
  - 🔧 Backend API: http://localhost:3001/api/v1
  - 📚 API Dokumentation: http://localhost:3001/documentation
  - 🗄️  Database: localhost:5432 (postgres/rtf_user/rtf_password)
  - ⚡ Redis: localhost:6379

  ❗ Troubleshooting

  Port bereits belegt:
  # Prüfe welche Prozesse die Ports verwenden
  lsof -i :3000  # Frontend
  lsof -i :3001  # Backend

  Dependencies Problem:
  # Clean install
  rm -rf node_modules package-lock.json
  npm install

  Docker Problem:
  # Services neu starten
  docker-compose down
  docker-compose build --no-cache
  docker-compose up

  🎉 Nach dem Start

  1. Gehe zu http://localhost:3000
  2. Das RTF Reporting Tool sollte laden
  3. Du kannst mit den RTF-Formularen arbeiten und XBRL-Dokumente generieren
  4. Die XBRL Generation Engine (Phase 3) ist vollständig funktional

  Die App ist jetzt bereit für RTF-Meldungen nach Deutsche Bundesbank Standards! 🇩🇪
