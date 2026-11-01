import type { Dictionary } from '../en';

const auth: Dictionary['auth'] = {
  signIn: {
    kicker: 'Autenticazione',
    title: 'Bentornato',
    subtitle: 'Accedi al tuo account per continuare il tuo viaggio olfattivo',
    submit: 'Accedi',
    noAccount: 'Non hai un account?',
    createOne: 'Creane uno',
    forgotPassword: 'Hai dimenticato la password?',
    securityNote: 'La tua sicurezza è la nostra priorità. Tutti i dati sono crittografati e protetti.',
    profileNote: 'Accedi per consultare il tuo profilo DNA olfattivo personale e i tuoi consigli.',
    genericError: 'Accesso non riuscito. Riprova.',
  },
  signUp: {
    kicker: 'Unisciti a noi',
    title: 'Crea il tuo account',
    subtitle: 'Inizia la tua scoperta olfattiva con OlfactiveDNA',
    submit: 'Crea account',
    termsPrefix: 'Creando un account, accetti i nostri',
    termsOfService: 'Termini di servizio',
    termsAnd: 'e la nostra',
    privacyPolicy: 'Informativa sulla privacy',
    alreadyHaveAccount: 'Hai già un account?',
    signInLink: 'Accedi',
    benefitsTitle: 'Cosa otterrai:',
    benefit1: 'Consigli di fragranze personalizzati in base al tuo DNA olfattivo',
    benefit2: 'Accesso a territori esclusivi e collezioni di fragranze',
    benefit3: 'Il tuo profilo personale di identità olfattiva con analisi dedicate',
    benefit4: "Un'esperienza di scoperta curata con punteggio di compatibilità in tempo reale",
    genericError: 'Registrazione non riuscita. Riprova.',
  },
  forgotPassword: {
    kicker: 'Recupero password',
    title: 'Reimpostazione non disponibile',
    subtitle: "L'invio di email non è ancora configurato per questo progetto.",
    body: "Contatta l'amministratore della piattaforma per reimpostare questo account. Il link di reimpostazione via email sarà disponibile dopo la configurazione di un provider email verificato e di un flusso di token di reimpostazione.",
    backToSignIn: "Torna all'accesso",
  },
  form: {
    labels: {
      usernameOrEmail: 'Nome utente o email',
      email: 'Indirizzo email',
      fullName: 'Nome completo',
      password: 'Password',
      createPassword: 'Crea una password',
      confirmPassword: 'Conferma password',
    },
    placeholders: {
      email: 'tu@esempio.com',
      name: 'Il tuo nome',
    },
    errors: {
      usernameOrEmailRequired: "Il nome utente o l'email è obbligatorio",
      emailRequired: "L'email è obbligatoria",
      emailInvalid: "Inserisci un'email valida",
      passwordRequired: 'La password è obbligatoria',
      passwordTooShort: 'La password deve contenere almeno 8 caratteri',
      confirmPasswordRequired: 'Conferma la tua password',
      passwordsDoNotMatch: 'Le password non coincidono',
      nameRequired: 'Il nome è obbligatorio',
      nameTooShort: 'Il nome deve contenere almeno 2 caratteri',
    },
    passwordHint: 'Almeno 8 caratteri, con lettere, numeri e simboli',
    processing: 'Elaborazione in corso...',
    defaultSubmit: {
      signin: 'Accedi',
      signup: 'Crea account',
      reset: 'Reimposta password',
    },
  },
  oauth: {
    orContinueWith: 'oppure continua con',
    continueWith: (provider: string) => `Continua con ${provider}`,
    connecting: 'Connessione in corso...',
  },
  loginButton: {
    label: 'Accedi al tuo DNA',
  },
};

export default auth;
