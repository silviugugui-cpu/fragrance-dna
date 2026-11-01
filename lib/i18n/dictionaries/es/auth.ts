import type { Dictionary } from '../en';

const auth: Dictionary['auth'] = {
  signIn: {
    kicker: 'Autenticación',
    title: 'Bienvenido de nuevo',
    subtitle: 'Inicia sesión en tu cuenta para continuar tu viaje olfativo',
    submit: 'Iniciar sesión',
    noAccount: '¿No tienes una cuenta?',
    createOne: 'Crea una',
    forgotPassword: '¿Olvidaste tu contraseña?',
    securityNote: 'Tu seguridad es nuestra prioridad. Todos los datos están cifrados y protegidos.',
    profileNote: 'Inicia sesión para acceder a tu perfil de ADN olfativo personal y a tus recomendaciones.',
    genericError: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
  },
  signUp: {
    kicker: 'Únete',
    title: 'Crea tu cuenta',
    subtitle: 'Comienza tu descubrimiento olfativo con OlfactiveDNA',
    submit: 'Crear cuenta',
    termsPrefix: 'Al crear una cuenta, aceptas nuestros',
    termsOfService: 'Términos de servicio',
    termsAnd: 'y nuestra',
    privacyPolicy: 'Política de privacidad',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signInLink: 'Inicia sesión',
    benefitsTitle: 'Lo que obtendrás:',
    benefit1: 'Recomendaciones de fragancias personalizadas según tu ADN olfativo',
    benefit2: 'Acceso a territorios exclusivos y colecciones de fragancias',
    benefit3: 'Tu perfil personal de identidad olfativa y sus análisis',
    benefit4: 'Una experiencia de descubrimiento curada con puntuación de compatibilidad en tiempo real',
    genericError: 'No se pudo crear la cuenta. Inténtalo de nuevo.',
  },
  forgotPassword: {
    kicker: 'Recuperación de contraseña',
    title: 'Restablecimiento no disponible',
    subtitle: 'El envío de correos aún no está configurado para este proyecto.',
    body: 'Contacta con el administrador de la plataforma para restablecer esta cuenta. El enlace de restablecimiento por correo estará disponible cuando se configuren un proveedor de correo verificado y un flujo de tokens de restablecimiento.',
    backToSignIn: 'Volver a iniciar sesión',
  },
  form: {
    labels: {
      usernameOrEmail: 'Nombre de usuario o correo',
      email: 'Correo electrónico',
      fullName: 'Nombre completo',
      password: 'Contraseña',
      createPassword: 'Crea una contraseña',
      confirmPassword: 'Confirmar contraseña',
    },
    placeholders: {
      email: 'tu@ejemplo.com',
      name: 'Tu nombre',
    },
    errors: {
      usernameOrEmailRequired: 'El nombre de usuario o el correo es obligatorio',
      emailRequired: 'El correo es obligatorio',
      emailInvalid: 'Introduce un correo válido',
      passwordRequired: 'La contraseña es obligatoria',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
      confirmPasswordRequired: 'Confirma tu contraseña',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      nameRequired: 'El nombre es obligatorio',
      nameTooShort: 'El nombre debe tener al menos 2 caracteres',
    },
    passwordHint: 'Al menos 8 caracteres, combinando letras, números y símbolos',
    processing: 'Procesando...',
    defaultSubmit: {
      signin: 'Iniciar sesión',
      signup: 'Crear cuenta',
      reset: 'Restablecer contraseña',
    },
  },
  oauth: {
    orContinueWith: 'o continúa con',
    continueWith: (provider: string) => `Continuar con ${provider}`,
    connecting: 'Conectando...',
  },
  loginButton: {
    label: 'Entra en tu ADN',
  },
};

export default auth;
