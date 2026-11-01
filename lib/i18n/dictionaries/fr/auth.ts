import type { Dictionary } from '../en';

const auth: Dictionary['auth'] = {
  signIn: {
    kicker: 'Authentification',
    title: 'Bon retour parmi nous',
    subtitle: 'Connectez-vous à votre compte pour poursuivre votre voyage olfactif',
    submit: 'Se connecter',
    noAccount: "Vous n'avez pas encore de compte ?",
    createOne: 'Créez-en un',
    forgotPassword: 'Mot de passe oublié ?',
    securityNote: 'Votre sécurité est notre priorité. Toutes les données sont chiffrées et protégées.',
    profileNote: 'Connectez-vous pour accéder à votre profil ADN olfactif personnel et à vos recommandations.',
    genericError: 'Échec de la connexion. Veuillez réessayer.',
  },
  signUp: {
    kicker: 'Rejoignez-nous',
    title: 'Créez votre compte',
    subtitle: 'Commencez votre découverte olfactive avec FragranceDNA',
    submit: 'Créer un compte',
    termsPrefix: 'En créant un compte, vous acceptez nos',
    termsOfService: "Conditions d'utilisation",
    termsAnd: 'et notre',
    privacyPolicy: 'Politique de confidentialité',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signInLink: 'Connectez-vous',
    benefitsTitle: 'Ce que vous obtiendrez :',
    benefit1: 'Des recommandations de parfums personnalisées selon votre ADN olfactif',
    benefit2: "L'accès à des territoires exclusifs et à des collections de parfums",
    benefit3: "Votre profil d'identité olfactive personnel et ses analyses",
    benefit4: 'Une expérience de découverte sur mesure avec un score de compatibilité en temps réel',
    genericError: "Échec de l'inscription. Veuillez réessayer.",
  },
  forgotPassword: {
    kicker: 'Récupération du mot de passe',
    title: 'Réinitialisation indisponible',
    subtitle: "L'envoi d'e-mails n'est pas encore configuré pour ce projet.",
    body: "Contactez l'administrateur de la plateforme pour réinitialiser ce compte. Un lien de réinitialisation par e-mail sera disponible une fois qu'un fournisseur d'e-mail vérifié et un flux de jetons de réinitialisation auront été configurés.",
    backToSignIn: 'Retour à la connexion',
  },
  form: {
    labels: {
      usernameOrEmail: "Nom d'utilisateur ou e-mail",
      email: 'Adresse e-mail',
      fullName: 'Nom complet',
      password: 'Mot de passe',
      createPassword: 'Créez un mot de passe',
      confirmPassword: 'Confirmez le mot de passe',
    },
    placeholders: {
      email: 'vous@exemple.com',
      name: 'Votre nom',
    },
    errors: {
      usernameOrEmailRequired: "Le nom d'utilisateur ou l'e-mail est requis",
      emailRequired: "L'e-mail est requis",
      emailInvalid: 'Veuillez saisir un e-mail valide',
      passwordRequired: 'Le mot de passe est requis',
      passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
      confirmPasswordRequired: 'Veuillez confirmer votre mot de passe',
      passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
      nameRequired: 'Le nom est requis',
      nameTooShort: 'Le nom doit contenir au moins 2 caractères',
    },
    passwordHint: 'Au moins 8 caractères, avec lettres, chiffres et symboles',
    processing: 'Traitement en cours...',
    defaultSubmit: {
      signin: 'Se connecter',
      signup: 'Créer un compte',
      reset: 'Réinitialiser le mot de passe',
    },
  },
  oauth: {
    orContinueWith: 'ou continuer avec',
    continueWith: (provider: string) => `Continuer avec ${provider}`,
    connecting: 'Connexion...',
  },
  loginButton: {
    label: 'Accéder à votre ADN',
  },
};

export default auth;
