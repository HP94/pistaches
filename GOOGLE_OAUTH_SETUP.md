# Configuration Google OAuth - Guide étape par étape

## Étape 1 : Créer un projet dans Google Cloud Console

1. Allez sur https://console.cloud.google.com/
2. Connectez-vous avec votre compte Google
3. Cliquez sur le sélecteur de projet en haut (à côté de "Google Cloud")
4. Cliquez sur **"Nouveau projet"** (ou "New Project")
5. Donnez un nom à votre projet (ex: "Equal Housing")
6. Cliquez sur **"Créer"** (ou "Create")
7. Attendez quelques secondes que le projet soit créé
8. Sélectionnez votre nouveau projet dans le sélecteur

## Étape 2 : Configurer l'écran de consentement OAuth

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"OAuth consent screen"**
2. Choisissez **"External"** (pour commencer, vous pouvez passer à "Internal" plus tard si vous avez un Google Workspace)
3. Cliquez sur **"Create"**
4. Remplissez le formulaire :
   - **App name** : "Equal Housing" (ou le nom de votre choix)
   - **User support email** : Votre email
   - **Developer contact information** : Votre email
5. Cliquez sur **"Save and Continue"**
6. Sur la page "Scopes", cliquez sur **"Save and Continue"** (pas besoin de modifier pour l'instant)
7. Sur la page "Test users", vous pouvez ajouter votre email pour tester, puis **"Save and Continue"**
8. Sur la page "Summary", cliquez sur **"Back to Dashboard"**

## Étape 3 : Créer les credentials OAuth 2.0

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"** en haut
3. Sélectionnez **"OAuth client ID"**
4. Si c'est la première fois, vous devrez configurer l'écran de consentement (référez-vous à l'étape 2)
5. Dans le formulaire :
   - **Application type** : Sélectionnez **"Web application"**
   - **Name** : "Equal Housing Web Client" (ou le nom de votre choix)
6. Cliquez sur **"Create"**

## Étape 4 : Configurer les URLs de redirection

1. Après avoir créé les credentials, une popup s'affiche avec votre **Client ID** et **Client Secret**
   - ⚠️ **IMPORTANT** : Copiez ces deux valeurs, vous en aurez besoin !
   - Vous pouvez aussi les retrouver plus tard dans "Credentials"

2. Dans la section **"Authorized redirect URIs"**, ajoutez :
   ```
   https://[VOTRE-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   
   **Comment trouver votre Project Ref ?**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet "Equal Housing"
   - Regardez l'URL dans votre navigateur : `https://supabase.com/dashboard/project/[VOTRE-PROJECT-REF]`
   - Ou allez dans Settings → API, votre Project URL est : `https://[VOTRE-PROJECT-REF].supabase.co`

3. **Exemple** : Si votre Project Ref est `abcdefghijklmnop`, ajoutez :
   ```
   https://abcdefghijklmnop.supabase.co/auth/v1/callback
   ```

4. Cliquez sur **"Save"**

## Étape 5 : Configurer dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet "Equal Housing"
3. Dans le menu de gauche, allez dans **"Authentication"** → **"Providers"**
4. Trouvez **"Google"** dans la liste
5. Activez le toggle **"Enable Google provider"**
6. Remplissez les champs :
   - **Client ID (for OAuth)** : Collez le Client ID copié à l'étape 3
   - **Client Secret (for OAuth)** : Collez le Client Secret copié à l'étape 3
7. Cliquez sur **"Save"**

## Étape 6 : Tester la configuration

1. Allez sur votre app : `http://localhost:3000/login`
2. Cliquez sur **"Connexion avec Google"**
3. Une popup Google devrait s'ouvrir
4. Connectez-vous avec votre compte Google
5. Autorisez l'application
6. Vous devriez être redirigé vers votre app et être connecté !

## Dépannage

### Erreur : "redirect_uri_mismatch"
- Vérifiez que l'URL dans Google Cloud Console correspond exactement à celle de Supabase
- Format : `https://[PROJECT-REF].supabase.co/auth/v1/callback`
- Pas de slash à la fin !

### Erreur : "Access blocked"
- Vérifiez que votre email est dans la liste des "Test users" (étape 2)
- Ou publiez l'application (dans OAuth consent screen)

### La popup ne s'ouvre pas
- Vérifiez que les credentials sont corrects dans Supabase
- Vérifiez que Google OAuth est bien activé dans Supabase

## Notes importantes

- **Client Secret** : Ne le partagez JAMAIS publiquement
- **URLs de redirection** : Ajoutez uniquement les domaines que vous contrôlez
- **Test users** : Pour tester, ajoutez votre email dans "Test users"
- **Production** : Quand vous déployez, ajoutez aussi votre URL de production dans les redirect URIs

## Prochaines étapes

Une fois Google OAuth configuré, vous pouvez :
1. Tester la connexion
2. Configurer Email/Password (si pas encore fait)
3. Continuer à développer votre app !

