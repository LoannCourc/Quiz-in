# Tester les notifications depuis un terminal

**État (novembre 2026) : l'app n'envoie aucune notification.** Ni `expo-notifications`, ni jeton, ni canal, ni
serveur dans la version livrée. Les rappels du vendredi (spec 22, branche `feat/rappels`, non intégrée) ne
contiennent encore que leur logique pure.

Les commandes ci-dessous ne testent donc pas Quiz'in aujourd'hui, seulement le téléphone. Elles serviront quand
les rappels seront branchés. Aucun jeton ni secret ne va dans le dépôt : le jeton se passe dans le terminal.

## Android (appareil branché en USB ou émulateur)

`adb` est dans `platform-tools` du SDK Android. S'il n'est pas dans le `PATH`, le rendre disponible pour le terminal :

```powershell
$env:PATH += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
adb devices
adb shell cmd notification post -S bigtext -t "Quiz'in" test-quizin "C'est vendredi ! Un petit quiz ce soir ?"
```

La notification vient du « shell Android », pas de l'app : elle vérifie le téléphone, pas le canal ni le code de
Quiz'in. Sur certains téléphones (Android 13 et plus), le shell peut avoir besoin de la permission :

```powershell
adb shell pm grant com.android.shell android.permission.POST_NOTIFICATIONS
```

Notifications programmées par l'app (une fois les rappels branchés) :

```powershell
adb shell dumpsys notification --noredact | Select-String quizin
adb shell dumpsys alarm | Select-String quizin
```

## Simulateur iOS (Mac avec Xcode seulement)

Fichier `payload.json`, hors du dépôt :

```json
{ "aps": { "alert": { "title": "Quiz'in", "body": "C'est vendredi ! Un petit quiz ce soir ?" }, "sound": "default" } }
```

```bash
xcrun simctl push booted com.herocorp.quizin payload.json
```

Inutilisable sous Windows, et sans build de simulateur : le profil EAS `production` vise un vrai iPhone.

## Push distant (seulement si l'app adopte Expo Push un jour)

Les rappels prévus sont **locaux** (spec 22) : aucun push distant n'est prévu. Si cela change, avec le jeton
`ExponentPushToken[…]` affiché par l'app :

```powershell
$body = @{ to = 'ExponentPushToken[A_COLLER]'; title = "Quiz'in"; body = 'Test' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'https://exp.host/--/api/v2/push/send' -ContentType 'application/json' -Body $body
```
