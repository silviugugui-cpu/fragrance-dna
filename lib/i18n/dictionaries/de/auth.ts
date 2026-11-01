import type { Dictionary } from '../en';

const auth: Dictionary['auth'] = {
  signIn: {
    kicker: 'Anmeldung',
    title: 'Willkommen zurück',
    subtitle: 'Melden Sie sich an, um Ihre olfaktorische Reise fortzusetzen',
    submit: 'Anmelden',
    noAccount: 'Sie haben noch kein Konto?',
    createOne: 'Jetzt erstellen',
    forgotPassword: 'Passwort vergessen?',
    securityNote: 'Ihre Sicherheit hat für uns Priorität. Alle Daten werden verschlüsselt und geschützt.',
    profileNote: 'Melden Sie sich an, um auf Ihr persönliches olfaktorisches DNA-Profil und Ihre Empfehlungen zuzugreifen.',
    genericError: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
  },
  signUp: {
    kicker: 'Werden Sie Mitglied',
    title: 'Erstellen Sie Ihr Konto',
    subtitle: 'Beginnen Sie Ihre olfaktorische Entdeckungsreise mit OlfactiveDNA',
    submit: 'Konto erstellen',
    termsPrefix: 'Mit der Erstellung eines Kontos akzeptieren Sie unsere',
    termsOfService: 'Nutzungsbedingungen',
    termsAnd: 'und unsere',
    privacyPolicy: 'Datenschutzerklärung',
    alreadyHaveAccount: 'Sie haben bereits ein Konto?',
    signInLink: 'Anmelden',
    benefitsTitle: 'Das erwartet Sie:',
    benefit1: 'Personalisierte Duftempfehlungen auf Basis Ihrer olfaktorischen DNA',
    benefit2: 'Zugang zu exklusiven Territorien und Duftkollektionen',
    benefit3: 'Ihr persönliches olfaktorisches Identitätsprofil mit Einblicken',
    benefit4: 'Kuratiertes Entdeckungserlebnis mit Kompatibilitätsbewertung in Echtzeit',
    genericError: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
  },
  forgotPassword: {
    kicker: 'Passwort-Wiederherstellung',
    title: 'Passwort-Zurücksetzung nicht verfügbar',
    subtitle: 'Der E-Mail-Versand ist für dieses Projekt noch nicht eingerichtet.',
    body: 'Kontaktieren Sie den Plattform-Administrator, um dieses Konto zurückzusetzen. Ein Zurücksetzungslink per E-Mail wird verfügbar sein, sobald ein verifizierter E-Mail-Anbieter und ein Ablauf mit Zurücksetzungs-Token eingerichtet sind.',
    backToSignIn: 'Zurück zur Anmeldung',
  },
  form: {
    labels: {
      usernameOrEmail: 'Benutzername oder E-Mail',
      email: 'E-Mail-Adresse',
      fullName: 'Vollständiger Name',
      password: 'Passwort',
      createPassword: 'Passwort erstellen',
      confirmPassword: 'Passwort bestätigen',
    },
    placeholders: {
      email: 'sie@beispiel.com',
      name: 'Ihr Name',
    },
    errors: {
      usernameOrEmailRequired: 'Benutzername oder E-Mail ist erforderlich',
      emailRequired: 'E-Mail ist erforderlich',
      emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      passwordRequired: 'Passwort ist erforderlich',
      passwordTooShort: 'Das Passwort muss mindestens 8 Zeichen lang sein',
      confirmPasswordRequired: 'Bitte bestätigen Sie Ihr Passwort',
      passwordsDoNotMatch: 'Die Passwörter stimmen nicht überein',
      nameRequired: 'Name ist erforderlich',
      nameTooShort: 'Der Name muss mindestens 2 Zeichen lang sein',
    },
    passwordHint: 'Mindestens 8 Zeichen, mit Buchstaben, Zahlen und Symbolen',
    processing: 'Wird verarbeitet...',
    defaultSubmit: {
      signin: 'Anmelden',
      signup: 'Konto erstellen',
      reset: 'Passwort zurücksetzen',
    },
  },
  oauth: {
    orContinueWith: 'oder fortfahren mit',
    continueWith: (provider: string) => `Mit ${provider} fortfahren`,
    connecting: 'Verbindung wird hergestellt...',
  },
  loginButton: {
    label: 'Bei Ihrer DNA anmelden',
  },
};

export default auth;
