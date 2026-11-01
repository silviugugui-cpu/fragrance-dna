import type { Dictionary } from '../en';

const auth: Dictionary['auth'] = {
  signIn: {
    kicker: 'Autentificare',
    title: 'Bine ai revenit',
    subtitle: 'Conectează-te la contul tău pentru a-ți continua călătoria olfactivă',
    submit: 'Conectează-te',
    noAccount: 'Nu ai cont?',
    createOne: 'Creează unul',
    forgotPassword: 'Ți-ai uitat parola?',
    securityNote: 'Siguranța ta este prioritatea noastră. Toate datele sunt criptate și protejate.',
    profileNote: 'Conectează-te pentru a accesa profilul tău personal de ADN olfactiv și recomandările tale.',
    genericError: 'Conectarea a eșuat. Te rugăm să încerci din nou.',
  },
  signUp: {
    kicker: 'Alătură-te nouă',
    title: 'Creează-ți contul',
    subtitle: 'Începe-ți descoperirea olfactivă cu OlfactiveDNA',
    submit: 'Creează cont',
    termsPrefix: 'Prin crearea unui cont, ești de acord cu',
    termsOfService: 'Termenii serviciului',
    termsAnd: 'și cu',
    privacyPolicy: 'Politica de confidențialitate',
    alreadyHaveAccount: 'Ai deja un cont?',
    signInLink: 'Conectează-te',
    benefitsTitle: 'Ce vei primi:',
    benefit1: 'Recomandări de parfumuri personalizate pe baza ADN-ului tău olfactiv',
    benefit2: 'Acces la teritorii exclusive și colecții de parfumuri',
    benefit3: 'Profilul tău personal de identitate olfactivă și analizele sale',
    benefit4: 'O experiență de descoperire atent selecționată, cu scor de compatibilitate în timp real',
    genericError: 'Crearea contului a eșuat. Te rugăm să încerci din nou.',
  },
  forgotPassword: {
    kicker: 'Recuperarea parolei',
    title: 'Resetarea parolei nu este disponibilă',
    subtitle: 'Trimiterea de emailuri nu este încă configurată pentru acest proiect.',
    body: 'Contactează administratorul platformei pentru a reseta acest cont. Un link de resetare prin email va fi disponibil după configurarea unui furnizor de email verificat și a unui flux de tokenuri de resetare.',
    backToSignIn: 'Înapoi la conectare',
  },
  form: {
    labels: {
      usernameOrEmail: 'Nume de utilizator sau email',
      email: 'Adresă de email',
      fullName: 'Nume complet',
      password: 'Parolă',
      createPassword: 'Creează o parolă',
      confirmPassword: 'Confirmă parola',
    },
    placeholders: {
      email: 'tu@exemplu.com',
      name: 'Numele tău',
    },
    errors: {
      usernameOrEmailRequired: 'Numele de utilizator sau emailul este obligatoriu',
      emailRequired: 'Emailul este obligatoriu',
      emailInvalid: 'Introdu un email valid',
      passwordRequired: 'Parola este obligatorie',
      passwordTooShort: 'Parola trebuie să aibă cel puțin 8 caractere',
      confirmPasswordRequired: 'Te rugăm să confirmi parola',
      passwordsDoNotMatch: 'Parolele nu coincid',
      nameRequired: 'Numele este obligatoriu',
      nameTooShort: 'Numele trebuie să aibă cel puțin 2 caractere',
    },
    passwordHint: 'Cel puțin 8 caractere, cu litere, cifre și simboluri',
    processing: 'Se procesează...',
    defaultSubmit: {
      signin: 'Conectează-te',
      signup: 'Creează cont',
      reset: 'Resetează parola',
    },
  },
  oauth: {
    orContinueWith: 'sau continuă cu',
    continueWith: (provider: string) => `Continuă cu ${provider}`,
    connecting: 'Se conectează...',
  },
  loginButton: {
    label: 'Intră în ADN-ul tău',
  },
};

export default auth;
