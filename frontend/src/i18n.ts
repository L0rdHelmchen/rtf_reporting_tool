// RTF Reporting Tool - Internationalization Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// German translations
const deTranslations = {
  common: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    create: 'Erstellen',
    update: 'Aktualisieren',
    submit: 'Einreichen',
    close: 'Schließen',
    loading: 'Wird geladen...',
    error: 'Fehler',
    success: 'Erfolgreich',
    warning: 'Warnung',
    info: 'Information',
    yes: 'Ja',
    no: 'Nein',
    required: 'Erforderlich',
    optional: 'Optional',
    search: 'Suchen',
    filter: 'Filtern',
    clear: 'Löschen',
    reset: 'Zurücksetzen',
    download: 'Herunterladen',
    upload: 'Hochladen',
    print: 'Drucken',
    export: 'Exportieren',
    import: 'Importieren',
    help: 'Hilfe',
    settings: 'Einstellungen'
  },
  auth: {
    login: 'Anmelden',
    logout: 'Abmelden',
    username: 'Benutzername',
    password: 'Passwort',
    email: 'E-Mail',
    rememberMe: 'Angemeldet bleiben',
    forgotPassword: 'Passwort vergessen?',
    loginSuccess: 'Erfolgreich angemeldet',
    loginError: 'Anmeldung fehlgeschlagen',
    invalidCredentials: 'Ungültige Anmeldedaten',
    sessionExpired: 'Sitzung abgelaufen'
  },
  navigation: {
    dashboard: 'Dashboard',
    forms: 'Formulare',
    xbrl: 'XBRL Export',
    institution: 'Institution',
    users: 'Benutzer',
    settings: 'Einstellungen',
    logout: 'Abmelden'
  },
  forms: {
    title: 'RTF Formulare',
    overview: 'Übersicht',
    create: 'Neues Formular erstellen',
    edit: 'Formular bearbeiten',
    delete: 'Formular löschen',
    submit: 'Formular einreichen',
    validate: 'Validieren',
    save: 'Entwurf speichern',
    status: {
      draft: 'Entwurf',
      inReview: 'In Prüfung',
      submitted: 'Eingereicht',
      accepted: 'Akzeptiert',
      rejected: 'Abgelehnt'
    },
    categories: {
      GRP: 'Gruppenangaben',
      RSK: 'Risiken',
      RDP: 'Risikodeckungspotenzial',
      ILAAP: 'Interne Liquiditätsbewertung',
      KPL: 'Kapitalplanung',
      STA: 'Stammdaten',
      STKK: 'Steuerungskreis-Konzeption',
      RTFK: 'Risikotragfähigkeits-Konzeption',
      STG: 'Stresstests',
      DBL: 'Deckblatt',
      OTHER: 'Sonstige'
    },
    validation: {
      required: 'Dieses Feld ist erforderlich',
      invalidFormat: 'Ungültiges Format',
      invalidDate: 'Ungültiges Datum',
      invalidNumber: 'Ungültige Zahl',
      invalidEmail: 'Ungültige E-Mail-Adresse',
      tooShort: 'Zu kurz',
      tooLong: 'Zu lang',
      outOfRange: 'Außerhalb des gültigen Bereichs'
    }
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Willkommen',
    overview: 'Übersicht',
    recentForms: 'Aktuelle Formulare',
    pendingTasks: 'Ausstehende Aufgaben',
    deadlines: 'Fristen',
    statistics: 'Statistiken',
    quickActions: 'Schnellaktionen'
  },
  xbrl: {
    title: 'XBRL Export',
    generate: 'XBRL generieren',
    validate: 'XBRL validieren',
    download: 'XBRL herunterladen',
    upload: 'XBRL hochladen',
    status: 'Status',
    lastGenerated: 'Zuletzt generiert',
    fileSize: 'Dateigröße',
    validation: {
      valid: 'Gültig',
      invalid: 'Ungültig',
      errors: 'Fehler',
      warnings: 'Warnungen'
    }
  },
  institution: {
    title: 'Institution',
    details: 'Institutsdaten',
    name: 'Name',
    bik: 'Bankleitzahl',
    type: 'Typ',
    address: 'Adresse',
    contact: 'Kontakt',
    settings: 'Einstellungen',
    exemptions: 'Befreiungen'
  },
  users: {
    title: 'Benutzerverwaltung',
    create: 'Neuen Benutzer erstellen',
    edit: 'Benutzer bearbeiten',
    delete: 'Benutzer löschen',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    role: 'Rolle',
    status: 'Status',
    lastLogin: 'Letzte Anmeldung',
    roles: {
      admin: 'Administrator',
      complianceOfficer: 'Compliance-Beauftragter',
      riskManager: 'Risikomanager',
      dataEntry: 'Dateneingabe',
      reviewer: 'Prüfer',
      viewer: 'Betrachter'
    }
  },
  settings: {
    title: 'Einstellungen',
    general: 'Allgemein',
    appearance: 'Erscheinungsbild',
    language: 'Sprache',
    theme: 'Theme',
    dateFormat: 'Datumsformat',
    numberFormat: 'Zahlenformat',
    autoSave: 'Automatisch speichern',
    notifications: 'Benachrichtigungen',
    security: 'Sicherheit',
    changePassword: 'Passwort ändern'
  },
  errors: {
    pageNotFound: 'Seite nicht gefunden',
    accessDenied: 'Zugriff verweigert',
    serverError: 'Serverfehler',
    networkError: 'Netzwerkfehler',
    unknownError: 'Unbekannter Fehler',
    tryAgain: 'Erneut versuchen',
    goBack: 'Zurück',
    contactSupport: 'Support kontaktieren'
  }
};

// English translations (basic set)
const enTranslations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No'
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    email: 'Email'
  },
  navigation: {
    dashboard: 'Dashboard',
    forms: 'Forms',
    xbrl: 'XBRL Export',
    institution: 'Institution',
    users: 'Users',
    settings: 'Settings'
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: {
        translation: deTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    lng: 'de', // Default language
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false // React already escapes by default
    },
    keySeparator: '.',
    returnNull: false,
    returnEmptyString: false,
    debug: import.meta.env.DEV
  });

export default i18n;