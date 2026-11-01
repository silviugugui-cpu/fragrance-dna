import type { Dictionary } from '../en';

const auth: Dictionary['auth'] = {
  signIn: {
    kicker: 'Autenticação',
    title: 'Bem-vindo de volta',
    subtitle: 'Inicie sessão na sua conta para continuar a sua viagem olfativa',
    submit: 'Iniciar sessão',
    noAccount: 'Não tem conta?',
    createOne: 'Crie uma',
    forgotPassword: 'Esqueceu-se da palavra-passe?',
    securityNote: 'A sua segurança é a nossa prioridade. Todos os dados são encriptados e protegidos.',
    profileNote: 'Inicie sessão para aceder ao seu perfil de ADN olfativo pessoal e às suas recomendações.',
    genericError: 'Não foi possível iniciar sessão. Tente novamente.',
  },
  signUp: {
    kicker: 'Junte-se a nós',
    title: 'Crie a sua conta',
    subtitle: 'Comece a sua descoberta olfativa com a FragranceDNA',
    submit: 'Criar conta',
    termsPrefix: 'Ao criar uma conta, aceita os nossos',
    termsOfService: 'Termos de Serviço',
    termsAnd: 'e a nossa',
    privacyPolicy: 'Política de Privacidade',
    alreadyHaveAccount: 'Já tem conta?',
    signInLink: 'Inicie sessão',
    benefitsTitle: 'O que vai obter:',
    benefit1: 'Recomendações de fragrâncias personalizadas com base no seu ADN olfativo',
    benefit2: 'Acesso a territórios exclusivos e coleções de fragrâncias',
    benefit3: 'O seu perfil pessoal de identidade olfativa com análises',
    benefit4: 'Uma experiência de descoberta selecionada com pontuação de compatibilidade em tempo real',
    genericError: 'Não foi possível criar a conta. Tente novamente.',
  },
  forgotPassword: {
    kicker: 'Recuperação de palavra-passe',
    title: 'Reposição indisponível',
    subtitle: 'O envio de emails ainda não está configurado para este projeto.',
    body: 'Contacte o administrador da plataforma para repor esta conta. A ligação de reposição por email ficará disponível depois de configurados um fornecedor de email verificado e um fluxo de tokens de reposição.',
    backToSignIn: 'Voltar ao início de sessão',
  },
  form: {
    labels: {
      usernameOrEmail: 'Nome de utilizador ou email',
      email: 'Endereço de email',
      fullName: 'Nome completo',
      password: 'Palavra-passe',
      createPassword: 'Crie uma palavra-passe',
      confirmPassword: 'Confirmar palavra-passe',
    },
    placeholders: {
      email: 'nome@exemplo.com',
      name: 'O seu nome',
    },
    errors: {
      usernameOrEmailRequired: 'O nome de utilizador ou o email é obrigatório',
      emailRequired: 'O email é obrigatório',
      emailInvalid: 'Introduza um email válido',
      passwordRequired: 'A palavra-passe é obrigatória',
      passwordTooShort: 'A palavra-passe deve ter pelo menos 8 caracteres',
      confirmPasswordRequired: 'Confirme a sua palavra-passe',
      passwordsDoNotMatch: 'As palavras-passe não coincidem',
      nameRequired: 'O nome é obrigatório',
      nameTooShort: 'O nome deve ter pelo menos 2 caracteres',
    },
    passwordHint: 'Pelo menos 8 caracteres, com letras, números e símbolos',
    processing: 'A processar...',
    defaultSubmit: {
      signin: 'Iniciar sessão',
      signup: 'Criar conta',
      reset: 'Repor palavra-passe',
    },
  },
  oauth: {
    orContinueWith: 'ou continue com',
    continueWith: (provider: string) => `Continuar com ${provider}`,
    connecting: 'A ligar...',
  },
  loginButton: {
    label: 'Entre no seu ADN',
  },
};

export default auth;
