# Atelier Lexical — Extension Navigateur (Chrome & Firefox)

L'extension **Atelier Lexical** permet de sélectionner n'importe quel mot ou locution sur une page Web, puis d'effectuer un clic droit pour ouvrir instantanément sa fiche lexicale complète (définitions, synonymes par intensité, nuances stylistiques, famille morphologique et tournures) dans votre Atelier Lexical.

---

## 🚀 Fonctionnalités

1. **Recherche contextuelle par clic droit** :
   - Sélectionnez un mot sur un article de presse, un blog littéraire ou un document en ligne.
   - Clic droit > **« Rechercher « ... » dans l'Atelier Lexical »**.
   - Un nouvel onglet s'ouvre directement sur la fiche du mot recherché.
2. **Nettoyage automatique intelligent de la sélection** :
   - Élimination de la ponctuation résiduelle (`« », " ' . , ; : ! ?`).
   - Prise en charge des élisions françaises courantes (`l'arbre` ➔ `arbre`, `d'écrire` ➔ `écrire`, `s'enfuir` ➔ `enfuir`, etc.).
   - Préservation stricte des caractères accentués (`é`, `è`, `ê`, `à`, `ç`, `ô`, `î`, `ù`) et des ligatures (`œ`, `æ`).
   - Gestion des mots composés avec tirets (`clair-obscur`, `peut-être`).
   - Tronquage sécurisé si l'utilisateur sélectionne accidentellement un paragraphe entier.
3. **Popup rapide intégrée** :
   - Cliquez sur l'icône de l'extension pour effectuer une recherche rapide ou ouvrir l'Atelier en 1 clic.
4. **Configuration de l'URL cible (Options)** :
   - Par défaut : `http://localhost:5173` (environnement local de développement).
   - Configurable vers `http://localhost:3001` ou votre nom de domaine en ligne hébergé.

---

## 🛠️ Guide d'installation en mode Développeur

### Dans Google Chrome / Brave / Edge / Chromium

1. Ouvrez votre navigateur et accédez à l'adresse : `chrome://extensions/` (ou `edge://extensions/` sur Edge).
2. Activez l'interrupteur **« Mode développeur »** (situé en haut à droite).
3. Cliquez sur le bouton **« Charger le dossier non empaqueté »** (ou *Load unpacked*).
4. Sélectionnez le dossier `extension/` situé à la racine du projet Atelier Lexical.
5. L'extension *« Atelier Lexical — Recherche Contextuelle »* apparaît alors dans votre liste d'extensions !
6. Vous pouvez épingler l'icône de la plume dorée dans votre barre d'outils.

### Dans Mozilla Firefox

1. Ouvrez Firefox et accédez à l'adresse : `about:debugging#/runtime/this-firefox`.
2. Cliquez sur le bouton **« Charger un module complémentaire temporaire... »**.
3. Parcourez votre disque jusqu'au dossier `extension/` et sélectionnez le fichier **`manifest.json`**.
4. L'extension est immédiatement chargée et active dans Firefox.

---

## ⚙️ Configuration de l'URL cible

1. Faites un clic droit sur l'icône de l'extension > **Options** (ou ouvrez la popup et cliquez sur **Options**).
2. Vérifiez ou modifiez l'adresse de votre Atelier (ex: `http://localhost:5173` ou `https://votre-domaine.fr`).
3. Cliquez sur **Enregistrer**.

---

## 📦 Génération du package distribuable (.zip)

Pour créer une archive distribuable prête à être partagée ou installée :
```bash
npm run package:extension
```
L'archive est automatiquement générée dans `dist/atelier-lexical-extension.zip`.
