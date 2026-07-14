# Signer le launcher (Windows)

Signer l'exécutable **supprime l'avertissement « application non vérifiée / éditeur inconnu »**
et réduit fortement les **faux positifs des antivirus**. Ce guide est **optionnel** :
le launcher fonctionne sans signature, mais les utilisateurs verront un avertissement au
premier lancement.

> À jour : 2026. La signature coûte de l'argent (abonnement annuel) et demande une
> vérification d'identité par le fournisseur. Rien n'est facturé tant que tu ne crées pas de compte.

---

## 1. Ce que la signature règle (et ne règle pas)

| | Effet |
|---|---|
| ✅ | Supprime l'avertissement **« éditeur inconnu / application non vérifiée »** |
| ✅ | Réduit fortement les **faux positifs antivirus** (Windows Defender, etc.) |
| ⚠️ | **SmartScreen** (« Windows a protégé votre PC ») peut encore apparaître sur un fichier **neuf** tant qu'il n'a pas assez de téléchargements. La réputation se construit avec le temps, **quel que soit le certificat**. |
| ❌ | Le certificat **EV ne contourne plus SmartScreen** (Microsoft a retiré ce privilège). Inutile de payer un EV juste pour ça. |

---

## 2. Les options

### Option A — Azure Artifact Signing (ex « Trusted Signing ») — **recommandé**

- **~10 $ US / mois** (≈ 120 $/an) — l'option la moins chère.
- **Aucune clé USB physique** requise (contrairement aux certificats classiques depuis 2023).
- S'intègre nativement à **electron-builder** (et aux pipelines CI/CD).
- Microsoft **vérifie l'identité** (compter quelques jours ouvrés).
- **Éligibilité** : organisations aux USA, Canada, UE, UK ; **particuliers : USA et Canada uniquement**.
  (Hors de ces pays en tant que particulier → voir l'option B.)

### Option B — Certificat OV (Sectigo, Certum, DigiCert…)

- ~100–300 $/an. **Nécessite un token USB matériel** (ou un HSM cloud) depuis 2023.
- Équivalent à Azure pour SmartScreen, mais plus cher et plus contraignant.
- Certum propose une offre « Open Source / individuelle » moins chère (mais toujours avec carte/token).

### Option C — Certificat auto-signé

- Gratuit, mais **inutile pour distribuer** : chaque utilisateur devrait l'approuver manuellement.
- À réserver aux tests internes.

---

## 3. Mettre en place Azure Artifact Signing (option A)

### 3.1 Côté Azure (une seule fois)

1. Crée un compte sur [portal.azure.com](https://portal.azure.com) (abonnement Pay-As-You-Go).
2. Recherche **« Subscriptions » → Settings → Resource providers**, filtre `Microsoft.CodeSigning`
   et clique **Register**.
3. Crée une ressource **Trusted Signing / Artifact Signing** (plan **Basic**, ~10 $/mois).
4. Lance la **vérification d'identité** (Identity Validation) et attends l'approbation.
5. Crée un **Certificate Profile** (type *Public Trust*).
6. Note ces valeurs, tu en auras besoin :
   - `endpoint` (ex. `https://eus.codesigning.azure.net/`)
   - `codeSigningAccountName` (nom du compte Artifact Signing)
   - `certificateProfileName` (nom du profil créé)
   - `publisherName` (le nom validé qui apparaîtra comme éditeur)

### 3.2 Identifiants d'application (App Registration)

Crée une **App Registration** dans Microsoft Entra ID et donne-lui le rôle
**Trusted Signing Certificate Profile Signer** sur la ressource. Récupère :

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`

> Ces 3 valeurs sont **secrètes** : ne JAMAIS les mettre dans le code ni les committer.
> On les passe en **variables d'environnement** au moment du build.

### 3.3 Configurer electron-builder

Dans `Launcher/package.json`, section `"build"`, ajoute un bloc `win.azureSignOptions` :

```json
"win": {
  "icon": "build/icon.ico",
  "azureSignOptions": {
    "publisherName": "Ton Nom Ou Studio",
    "endpoint": "https://eus.codesigning.azure.net/",
    "codeSigningAccountName": "ton-compte-artifact-signing",
    "certificateProfileName": "ton-profil"
  }
}
```

### 3.4 Lancer un build signé

Définis les variables d'environnement puis lance la génération de l'installateur.

PowerShell (Windows) :

```powershell
$env:AZURE_TENANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$env:AZURE_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$env:AZURE_CLIENT_SECRET="ton-secret"
npm run dist:win
```

electron-builder détecte `azureSignOptions` et signe automatiquement l'exécutable + l'installateur.

---

## 4. Vérifier que c'est signé

Clic droit sur le `.exe` généré (dans `Launcher/release/`) → **Propriétés** →
onglet **Signatures numériques**. Tu dois y voir ton `publisherName`.

---

## 5. Bon à savoir

- **Pas de signature = pas bloquant** : le launcher marche, mais l'utilisateur voit
  un avertissement au 1er lancement (il peut cliquer « Informations complémentaires → Exécuter quand même »).
- **SmartScreen sur un fichier neuf** : normal au début, ça s'estompe avec les téléchargements.
- **CI/CD** : Azure Artifact Signing s'intègre à GitHub Actions / Azure DevOps si tu automatises les releases plus tard.
- Ne stocke jamais les secrets Azure dans le dépôt : `.env` et variables d'environnement uniquement.
