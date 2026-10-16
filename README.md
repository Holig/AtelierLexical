# Atelier Lexical — Assistant de vocabulaire pour les écrivains

> *L'art du mot juste, des nuances stylistiques et de la résonance littéraire.*

[![Licence: MIT](https://img.shields.io/badge/Licence-MIT-amber.svg)](LICENSE)
[![Données: Wiktionnaire CC BY-SA 4.0](https://img.shields.io/badge/Donn%C3%A9es-Wiktionnaire%20(CC%20BY--SA%204.0)-blue.svg)](https://fr.wiktionary.org)
[![Tests: Vitest](https://img.shields.io/badge/Tests-21%2F21%20passing-success.svg)](https://vitest.dev)
[![Extension Navigateur](https://img.shields.io/badge/Extension-Chrome%20%26%20Firefox-orange.svg)](extension/README.md)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Holig%2FAtelier--Lexical-181717.svg?logo=github)](https://github.com/Holig/Atelier-Lexical)

L'**Atelier Lexical** est une application web conçue spécialement pour les écrivains, romanciers, poètes, traducteurs et passionnés de langue française. Loin d'un simple dictionnaire de définitions ou de synonymes génériques, il s'agit d'un véritable établi d'artisan des mots permettant d'explorer le vocabulaire dans toute sa profondeur sémantique, stylistique et narrative.

L'application comprend désormais :
1. Une **Page d'Accueil immersive** orientée vers la découverte et la recherche immédiate.
2. Une **Extension pour navigateur (Chrome & Firefox)** pour rechercher n'importe quel mot d'un simple clic droit.
3. Un **Bouton de Soutien & Don** configurable côté serveur via une interface d'administration protégée.


---

## 1. Fonctionnalités Principales

### 📖 Exploration Lexicale Haute Précision
- **Recherche centrale unifiée** : Tolérante aux erreurs de frappe (distance de Levenshtein), insensible aux accents, aux ligatures (*cœur* $\rightarrow$ *coeur*), aux élisions (*l'amour* $\rightarrow$ *amour*) et complétée par une autocomplétion dynamique en temps réel via l'API OpenSearch du Wiktionnaire.
- **Prononciation & Phonétique** : Transcription phonétique internationale (API) et synthèse vocale française native directement dans le navigateur.
- **Définitions & Sens compacts** : Acceptions numérotées, catégories grammaticales, genres, domaines d'emploi, registres et connotations.
- **Consultation des exemples à la demande** : Mode compact avec bouton de déploiement des citations attestées et infobulle fluide au survol sans encombrer la vue.
- **Synonymes Intelligents & Nuances** :
  - Graduation par échelle d'intensité : *Légère / Atténuée (1)*, *Modérée / Usuelle (2)*, *Intense / Marquée (3)*, *Paroxystique / Extrême (4)*.
  - Filtres par registre stylistique (*littéraire*, *soutenu*, *courant*, *familier*, *poétique*, *archaïque*).
  - Conseils d'emploi narratif et explications précises des différences de sens.
- **Antonymes & Oppositions** : Oppositions directes et contextuelles pour sculpter des contrastes et des oxymores saisissants.
- **Empilement vertical optimisé** : Les tuiles *Synonymes Intelligents* et *Antonymes & Oppositions* sont empilées à 50% de hauteur chacune dans une colonne unique pour une compacité visuelle maximale.
- **Famille Lexicale Morphologique Étendue** :
  - Détection exhaustive des dérivés par préfixes et suffixes via le parseur moderne du Wiktionnaire (support des modèles `{{lien|mot|fr}}`).
  - Priorisation en tête de liste des **dérivés directs** (*adjectifs dérivés*, *adverbes dérivés*, *verbes associés*, *noms dérivés*) devant les locutions composées.
  - **Infobulle interactive au survol** : aperçu instantané des définitions et exemples du mot survolé avec gestion de l'ascenseur à la molette.
  - **Fil d'Ariane de navigation** (`Mot1 > Mot2 > Mot3`) permettant de remonter la généalogie des recherches en un clic.
- **Champ Lexical & Évocations** : Associations d'idées, résonances thématiques et sensorielles (visuelles, auditives, tactiles, olfactives).
- **Expressions & Locutions** : Formules idiomatiques consacrées par l'usage avec origines attestées et explications sémantiques.
- **Moteur de Conjugaison Française** : Tableaux exhaustifs pour tous les verbes (Indicatif, Subjonctif, Conditionnel, Impératif, Participe, e-euphonique).

### ✍️ Atelier de Nuances Stylistiques (Recherche par intention)
- **Partir d'une intention d'écriture** : « *Je cherche un mot pour décrire une peur soudaine qui paralyse un personnage.* »
- **Sélection multi-critères** : Émotion, intensité souhaitée (1 à 4), registre, contexte narratif (*description*, *action*, *dialogue*, *psychologie*).
- **Suggestions comparatives** : Chaque proposition explique son adéquation à votre intention, sa nuance distinctive et fournit un exemple de phrase romanesque.

### 📚 Carnet d'Écrivain & Collections
- **Organisation par projet** : Classez vos trouvailles par dossier (*« Roman fantastique »*, *« Scène de tempête »*, *« Portrait de l'antagoniste »*).
- **Annotations personnelles** : Ajoutez vos remarques et réflexions de travail sur n'importe quel mot.
- **Export Markdown (`.md`)** : Téléchargez vos fiches pour les réutiliser directement dans votre logiciel d'écriture (*Obsidian*, *Scrivener*, *Notion*, *Word*).
- **Confidentialité & Persistance locale** : Aucune création de compte requise, toutes vos notes restent stockées localement dans votre navigateur (`LocalStorage`).

### 🎛️ Ergonomie & Affichage sur Mesure
- **Sélecteur de colonnes flexible** : Basculez en 1 clic entre **1 colonne** (vue linéaire), **2 colonnes** (atelier bicolonne), **3 colonnes** (vue panoramique) ou **4 colonnes** (vue ultra-large pour moniteurs haute résolution).
- **Modes Thématiques** : Thème sombre (*Bibliothèque nocturne*) et thème clair (*Papier vélin*) avec transitions fluides.
- **Modale « À Propos »** : Accessible directement depuis l'en-tête (bouton information à côté du thème) présentant la vocation et le fonctionnement de l'application sous 2 volets interactifs (*Fonctionnel* et *Technique*).
- **Module IA Hybride Optionnel** : Compatible Google Gemini et OpenAI pour enrichir les exemples stylistiques, avec persistance sécurisée des clés API et indicateur de statut en temps réel. Fonctionne à 100% sans clé IA requise.

### 🌟 Page d'Accueil Immersive & Découverte
- **Première page d'entrée** : Accessible directement à la racine `/`.
- **Hero orienté action** : Titre accrocheur, courte présentation et barre de recherche intégrée immédiatement active pour amener le visiteur en un clic vers la fiche lexicale d'un mot.
- **Pépites et suggestions d'exploration** (*clair-obscur*, *silence*, *labyrinthe*, *crépuscule*, *mélancolie*, *chimère*).
- **Présentation ciblée des publics** (Écrivains, Étudiants & Enseignants, Rédacteurs & Professionnels).
- **Section dédiée à l'extension navigateur** avec démonstration visuelle du clic droit et lien de téléchargement direct.
- **Section Soutien & Don** pilotée en temps réel par la configuration serveur (masquage propre si aucun lien n'est configuré).
- **Navigation préservée** : L'Atelier reste accessible à tout instant via le bouton « Ouvrir l'Atelier », la route `/app` ou la recherche directe `/?q=...`.

### 🧩 Extension Navigateur (Chrome & Firefox)
- **Recherche par clic droit** : Sur n'importe quelle page web, sélectionnez un mot, effectuez un clic droit et choisissez « *Rechercher « ... » dans l'Atelier Lexical* ». Un nouvel onglet s'ouvre directement sur la fiche du mot.
- **Nettoyage automatique intelligent** : Suppression de la ponctuation, prise en charge des élisions françaises (*l'aventure* $\rightarrow$ *aventure*, *d’écriture* $\rightarrow$ *écriture*), préservation stricte des accents (`é`, `è`, `ê`, `à`, `ç`, `ô`, `î`, `ù`), des ligatures (`œ`, `æ`) et des tirets de mots composés (*clair-obscur*).
- **Popup rapide & Options** : Mini-barre de recherche dans la popup et page d'options pour configurer l'URL de l'Atelier Lexical (local `http://localhost:5173` ou distant).
- **Génération du package** : `npm run package:extension` pour créer le fichier `dist/atelier-lexical-extension.zip`.
- **Guide complet d'installation** : Disponible dans [extension/README.md](file:///extension/README.md).

### 🛡️ Administration du Lien de Don & Sécurité Serveur
- **Route dédiée `/admin`** : Protégée par mot de passe administrateur (`ADMIN_PASSWORD` dans `.env`).
- **Sécurité côté serveur** : Émission d'un token cryptographique de session (durée 24h) ; rejet strict (401 Unauthorized) de tout accès non autorisé à l'API `/api/admin/*`.
- **Validation stricte des URLs** : Obligation d'une URL absolue débutant par `https://` ; rejet systématique des protocoles malveillants (`javascript:`, `data:`).
- **Persistance immédiate** : Les modifications sont enregistrées dans `server/src/data/app-config.json`, survivent aux redémarrages et sont immédiatement prises en compte par la page d'accueil sans aucun redéploiement.
- **Gestion du statut** : Activation, désactivation ou suppression du lien en 1 clic.

---

## 2. Architecture Technique

Le projet adopte une séparation nette entre interface utilisateur, services linguistiques déterministes et données ouvertes :

```
├── client/                     # Interface React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # Composants d'interface modulaires
│   │   │   ├── Header.tsx      # Navigation, toggle thème & bouton À Propos
│   │   │   ├── AboutModal.tsx  # Modale À Propos (sous-onglets Fonctionnel & Technique)
│   │   │   ├── AIConfigModal.tsx # Configuration & test des clés IA (Gemini / OpenAI)
│   │   │   ├── SearchBar.tsx   # Barre de recherche avec autocomplétion OpenSearch
│   │   │   ├── LexicalCard.tsx # Fiche lexicale unifiée & grille multi-colonnes
│   │   │   ├── DefinitionsSection.tsx    # Définitions compactes & exemples déployables
│   │   │   ├── SynonymsNuanceSection.tsx # Synonymes, filtres d'intensité (1-4) & registre
│   │   │   ├── AntonymsSection.tsx       # Nuances d'opposition & antonymes
│   │   │   ├── LexicalFamilySection.tsx  # Famille morphologique, infobulles & fil d'Ariane
│   │   │   ├── SemanticFieldSection.tsx  # Champ lexical & associations
│   │   │   ├── ExpressionsSection.tsx    # Locutions & expressions consacrées
│   │   │   ├── ExamplesWorkshopSection.tsx # Atelier d'exemples & génération stylistique
│   │   │   ├── StylisticStudio.tsx       # Recherche par intention stylistique
│   │   │   ├── WriterNotebook.tsx        # Carnet d'écrivain, favoris & export Markdown
│   │   │   └── ConjugationModal.tsx      # Tableaux de conjugaison française
│   │   ├── services/           # ApiClient (fetch backend) & StorageService (LocalStorage)
│   │   └── styles/             # Design System Vanilla CSS (tokens typographiques et chromatiques)
│   └── index.html
├── server/                     # Serveur Node.js / Express + TypeScript
│   └── src/
│       ├── routes/             # Routes REST (/api/lexique, /api/stylistique, /api/config)
│       ├── services/
│       │   ├── lexicon.service.ts      # Orchestrateur lexical unifié
│       │   ├── wiktionary.service.ts   # Parseur MediaWiki wikitexte & cache LRU
│       │   ├── nuance.service.ts       # Moteur de nuances & recherche par intention
│       │   ├── conjugation.service.ts  # Moteur de conjugaison déterministe autonome
│       │   └── ai.service.ts           # Connecteur IA optionnel (Gemini / OpenAI)
│       ├── data/
│       │   └── curatedNuances.ts       # Base de nuances stylistiques expertes
│       └── utils/                      # Normalisation française & Levenshtein
├── shared/                     # Types TypeScript partagés (FicheLexicale, SynonymeNuance...)
└── tests/                      # Suite de tests automatisés avec Vitest
```

---

## 3. Sources de Données Lexicales & Licences

| Source | Licence | Utilisation | Remarques |
|---|---|---|---|
| **Wiktionnaire francophone (fr.wiktionary.org)** | **CC BY-SA 4.0 & GFDL** | Définitions, transcription phonétique (API), morphologie, vocabulaire, citations attestées. | Requêtes officielles MediaWiki avec User-Agent identifié et cache serveur LRU. Lien de provenance vers l'article source sur chaque fiche. Gratuit et ouvert. |
| **Base stylistique & nuances de l'Atelier** | **Domaine public / Création propre** | Échelles d'intensité (1 à 4), filtres stylistiques, distinctions lexicales et contextes narratifs. | Moteur déterministe sans dépendance externe. |
| **Moteur linguistique de conjugaison** | **Création propre / Règles académiques** | Tableaux de conjugaison complets pour l'ensemble des verbes français. | Moteur algorithmique autonome. |
| **Module IA facultatif (Gemini / OpenAI)** | **Optionnel** | Suggestions de tournures stylistiques supplémentaires. | Strictement optionnel et étiqueté `[Généré par IA]`. N'invente aucune définition factuelle. |

---

## 4. Guide d'Installation et Lancement

### Prérequis
- **Node.js** v20+ et **npm** v10+
- **Git**

### Installation
```bash
# 1. Cloner le dépôt
git clone https://github.com/Holig/Atelier-Lexical.git
cd Atelier-Lexical

# 2. Installer les dépendances
npm install
```

### Configuration (Optionnelle)
L'application fonctionne à 100% de ses capacités lexicales sans aucune clé. Si vous souhaitez tester les enrichissements IA supplémentaires :
```bash
cp .env.example .env
# Renseignez votre GEMINI_API_KEY ou OPENAI_API_KEY si souhaité
```
*Note : Vous pouvez aussi saisir directement votre clé dans l'interface graphique via le bouton « Connecter IA » dans l'en-tête.*

### Lancement en mode développement
Cette commande démarre simultanément l'API Express (`http://localhost:3001`) et le serveur Vite (`http://localhost:5173`) :
```bash
npm run dev
```
Rendez-vous sur **`http://localhost:5173`** dans votre navigateur.

### Lancement des tests automatisés
```bash
npm test
```

### Compilation de production
```bash
npm run build
npm start
```

---

## 5. Dépôt GitHub

Le projet est hébergé publiquement à l'adresse suivante :
👉 **[https://github.com/Holig/Atelier-Lexical](https://github.com/Holig/Atelier-Lexical)**

---

## 6. Licence

Ce projet est sous licence **MIT**.
Les données lexicales et citations proviennent du **Wiktionnaire francophone** et sont partagées sous licence libre **CC BY-SA 4.0** et **GFDL**.
