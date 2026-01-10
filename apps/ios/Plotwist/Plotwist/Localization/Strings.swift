//
//  Strings.swift
//  Plotwist
//

import Foundation

enum L10n {
    static var current: Strings { strings[Language.current] ?? strings[.enUS]! }
    
    private static let strings: [Language: Strings] = [
        .enUS: Strings(
            accessPlotwist: "Welcome back 👋",
            loginLabel: "Email or username",
            loginPlaceholder: "Email or username",
            passwordLabel: "Password",
            passwordPlaceholder: "*********",
            accessButton: "Access",
            doNotHaveAccount: "Don't have an account?",
            createNow: "Create now",
            loginRequired: "Please enter your email or username.",
            passwordRequired: "Please enter your password.",
            passwordLength: "Your password must be at least 8 characters long.",
            invalidCredentials: "Invalid login credentials.",
            continueWithGoogle: "Continue with Google",
            continueWithApple: "Continue with Apple",
            or: "or"
        ),
        .ptBR: Strings(
            accessPlotwist: "Bem-vindo de volta 👋",
            loginLabel: "E-mail ou nome de usuário",
            loginPlaceholder: "E-mail ou nome de usuário",
            passwordLabel: "Senha",
            passwordPlaceholder: "*********",
            accessButton: "Acessar",
            doNotHaveAccount: "Não tem uma conta?",
            createNow: "Crie agora",
            loginRequired: "Por favor, insira seu e-mail ou nome de usuário.",
            passwordRequired: "Por favor, insira sua senha.",
            passwordLength: "Sua senha deve ter pelo menos 8 caracteres.",
            invalidCredentials: "Credenciais de login inválidas.",
            continueWithGoogle: "Continuar com Google",
            continueWithApple: "Continuar com Apple",
            or: "ou"
        ),
        .esES: Strings(
            accessPlotwist: "Bienvenido de nuevo 👋",
            loginLabel: "Correo electrónico o nombre de usuario",
            loginPlaceholder: "Correo electrónico o nombre de usuario",
            passwordLabel: "Contraseña",
            passwordPlaceholder: "*********",
            accessButton: "Acceder",
            doNotHaveAccount: "¿No tienes una cuenta?",
            createNow: "Crea una ahora",
            loginRequired: "Por favor, introduce tu correo electrónico o nombre de usuario.",
            passwordRequired: "Por favor, introduce tu contraseña.",
            passwordLength: "Tu contraseña debe tener al menos 8 caracteres.",
            invalidCredentials: "Credenciales de inicio de sesión no válidas.",
            continueWithGoogle: "Continuar con Google",
            continueWithApple: "Continuar con Apple",
            or: "o"
        ),
        .frFR: Strings(
            accessPlotwist: "Bon retour 👋",
            loginLabel: "E-mail ou nom d'utilisateur",
            loginPlaceholder: "E-mail ou nom d'utilisateur",
            passwordLabel: "Mot de passe",
            passwordPlaceholder: "*********",
            accessButton: "Accéder",
            doNotHaveAccount: "Vous n'avez pas de compte?",
            createNow: "Créez-en un maintenant",
            loginRequired: "Veuillez entrer votre e-mail ou nom d'utilisateur.",
            passwordRequired: "Veuillez entrer votre mot de passe.",
            passwordLength: "Votre mot de passe doit contenir au moins 8 caractères.",
            invalidCredentials: "Identifiants de connexion invalides.",
            continueWithGoogle: "Continuer avec Google",
            continueWithApple: "Continuer avec Apple",
            or: "ou"
        ),
        .deDE: Strings(
            accessPlotwist: "Willkommen zurück 👋",
            loginLabel: "E-Mail oder Benutzername",
            loginPlaceholder: "E-Mail oder Benutzername",
            passwordLabel: "Passwort",
            passwordPlaceholder: "*********",
            accessButton: "Zugreifen",
            doNotHaveAccount: "Haben Sie kein Konto?",
            createNow: "Jetzt erstellen",
            loginRequired: "Bitte geben Sie Ihre E-Mail-Adresse oder Ihren Benutzernamen ein.",
            passwordRequired: "Bitte geben Sie Ihr Passwort ein.",
            passwordLength: "Ihr Passwort muss mindestens 8 Zeichen lang sein.",
            invalidCredentials: "Ungültige Anmeldeinformationen.",
            continueWithGoogle: "Weiter mit Google",
            continueWithApple: "Weiter mit Apple",
            or: "oder"
        ),
        .itIT: Strings(
            accessPlotwist: "Bentornato 👋",
            loginLabel: "E-mail o nome utente",
            loginPlaceholder: "E-mail o nome utente",
            passwordLabel: "Password",
            passwordPlaceholder: "*********",
            accessButton: "Accedi",
            doNotHaveAccount: "Non hai un account?",
            createNow: "Crea ora",
            loginRequired: "Inserisci il tuo indirizzo e-mail o nome utente.",
            passwordRequired: "Inserisci la tua password.",
            passwordLength: "La tua password deve contenere almeno 8 caratteri.",
            invalidCredentials: "Credenziali di accesso non valide.",
            continueWithGoogle: "Continua con Google",
            continueWithApple: "Continua con Apple",
            or: "o"
        ),
        .jaJP: Strings(
            accessPlotwist: "おかえりなさい 👋",
            loginLabel: "メールアドレスまたはユーザー名",
            loginPlaceholder: "メールアドレスまたはユーザー名",
            passwordLabel: "パスワード",
            passwordPlaceholder: "*********",
            accessButton: "アクセス",
            doNotHaveAccount: "アカウントをお持ちではありませんか？",
            createNow: "今すぐ作成",
            loginRequired: "メールアドレスまたはユーザー名を入力してください。",
            passwordRequired: "パスワードを入力してください。",
            passwordLength: "パスワードは8文字以上でなければなりません。",
            invalidCredentials: "ログイン認証情報が無効です。",
            continueWithGoogle: "Googleで続ける",
            continueWithApple: "Appleで続ける",
            or: "または"
        )
    ]
}

struct Strings {
    let accessPlotwist: String
    let loginLabel: String
    let loginPlaceholder: String
    let passwordLabel: String
    let passwordPlaceholder: String
    let accessButton: String
    let doNotHaveAccount: String
    let createNow: String
    let loginRequired: String
    let passwordRequired: String
    let passwordLength: String
    let invalidCredentials: String
    let continueWithGoogle: String
    let continueWithApple: String
    let or: String
}
