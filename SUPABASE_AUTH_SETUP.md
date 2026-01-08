# Configuration Supabase Auth - Guide étape par étape

## Étape 1 : Activer Email/Password Authentication

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet "Equal Housing"
3. Dans le menu de gauche, cliquez sur **Authentication**
4. Cliquez sur **Providers** (ou **Providers** dans le sous-menu)
5. Trouvez **Email** dans la liste
6. Activez le toggle **Enable Email provider**
7. (Optionnel) Configurez les paramètres :
   - **Confirm email** : Désactivé pour le MVP (vous pouvez l'activer plus tard)
   - **Secure email change** : Activé (recommandé)

## Étape 2 : Activer Google OAuth (Optionnel mais recommandé)

1. Toujours dans **Authentication → Providers**
2. Trouvez **Google** dans la liste
3. Activez le toggle **Enable Google provider**
4. Vous devrez créer des credentials Google OAuth :
   - Allez sur https://console.cloud.google.com/
   - Créez un projet (ou utilisez un existant)
   - Activez Google+ API
   - Créez des OAuth 2.0 credentials
   - Ajoutez l'URL de redirection : `https://[votre-project-ref].supabase.co/auth/v1/callback`
5. Copiez le **Client ID** et **Client Secret** dans Supabase

**Note** : Pour le MVP, vous pouvez sauter Google OAuth et l'ajouter plus tard. Email/Password fonctionne déjà.

## Étape 3 : Configurer les URLs de redirection

1. Dans **Authentication → URL Configuration**
2. Ajoutez ces URLs dans **Redirect URLs** :
   - `http://localhost:3000/auth/callback` (pour le développement)
   - `http://localhost:3000/login` (pour le développement)
   - `http://localhost:3000/reset-password` (pour le développement)
   - Plus tard, ajoutez votre URL de production

## Étape 4 : Configurer les emails (Optionnel)

1. Dans **Authentication → Email Templates**
2. Vous pouvez personnaliser les emails, mais les templates par défaut fonctionnent bien
3. Les emails seront envoyés depuis `noreply@mail.app.supabase.io`

## Étape 5 : Vérifier que tout fonctionne

Une fois la configuration terminée, vous pouvez tester :
- Créer un compte avec email/password
- Se connecter
- Demander une réinitialisation de mot de passe

---

## Notes importantes

- **Plan Free** : 4 emails/heure par utilisateur (suffisant pour commencer)
- **Pas besoin de SMTP** : Supabase gère l'envoi d'emails automatiquement
- **Sécurité** : Les mots de passe sont automatiquement hashés (bcrypt)

## Prochaines étapes

Une fois la configuration Supabase terminée, le code de l'application utilisera ces paramètres automatiquement via les variables d'environnement que vous avez déjà configurées.

