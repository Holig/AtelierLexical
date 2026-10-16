# Atelier Lexical — Documentation des Prompts et Services d'Intelligence Artificielle

Ce document récapitule l'architecture, la configuration multi-fournisseur (Google Gemini et OpenAI / ChatGPT) ainsi que l'ensemble des prompts utilisés pour chaque bouton d'enrichissement de l'application.

---

## 1. Architecture Multi-Fournisseur (Gemini & ChatGPT / OpenAI)

L'application supporte de manière native et interchangeable les deux grands fournisseurs d'IA générative :

### Sélection et persistance
- **Priorité utilisateur** : Le fournisseur actif est défini via la variable `ACTIVE_AI_PROVIDER` (`gemini` ou `openai`), persistée automatiquement dans le fichier `.env` lorsque vous choisissez un fournisseur dans la modale de configuration IA.
- **Cascade croisée de secours** : Si le fournisseur principal sélectionné est temporairement indisponible (ex: erreur 503 chez Google en cas de pic de charge ou quota 429), le système bascule automatiquement sur le second fournisseur s'il est configuré.
- **Timeouts resserrés** : Chaque appel d'API est encadré par un `AbortController` (5s pour Gemini, 7s pour OpenAI) pour éviter tout blocage ou freeze de l'interface utilisateur.
- **Parseur JSON universel (`extraireTableauJSON`)** : OpenAI avec l'option `response_format: { type: "json_object" }` impose de renvoyer un objet (`{ "synonymes": [...] }`), tandis que Gemini renvoie directement un tableau (`[ ... ]`). Le parseur est conçu pour extraire de manière transparente et robuste les listes dans les deux formats.
- **Repli universel hors-ligne** : Si aucun service IA distant ne répond ou si aucune clé n'est renseignée, un générateur heuristique littéraire de secours prend le relais pour garantir qu'aucun widget ne reste vide.

---

## 2. Inventaire des Boutons « Compléter avec l'IA »

| # | Composant | Bouton / Action | Rôle |
|---|---|---|---|
| **1** | `LexicalCard.tsx` | **Cartouche du mot (En-tête)** | Analyse philologique de la racine étymologique, évolution sémantique et prononciation phonétique API. |
| **2** | `SynonymsNuanceSection.tsx` | **Synonymes Intelligents & Nuances** | Génération de synonymes littéraires exclusifs avec degré d'intensité (1-4), registre, connotation, conseil d'écriture et exemple. |
| **3** | `AntonymsSection.tsx` | **Antonymes & Oppositions** | Identification d'oppositions sémantiques et stylistiques fortes (directes ou contextuelles). |
| **4** | `SemanticFieldSection.tsx` | **Champ Lexical & Associations** | Exploration de 8 à 10 termes évocateurs sensoriels, thématiques et symboliques pour nourrir le récit. |
| **5** | `ExamplesWorkshopSection.tsx` | **Exemples d'Usage Stylistiques** | Rédaction de 4 phrases originales selon 4 genres littéraires : narrative, descriptive, dialoguée et poétique. |
| **6** | `StylisticStudio.tsx` | **Atelier de Nuances (Intention)** | Analyse d'intention narrative libre pour recommander le mot exact selon l'émotion et le contexte. |

---

## 3. Liste Exhaustive des Prompts par Widget

### 🔹 Bouton 1 : Étymologie & Origine
- **Endpoint API** : `POST /api/stylistique/enrichir-etymologie`
- **Méthode** : `aiService.enrichirEtymologieIA(mot)`
- **Variables interpolées** : `${mot}`

```text
Tu es un éminent philologue et lexicographe français.
Pour le mot « ${mot} », donne une notice étymologique précise, noble et détaillée.
Indique la racine linguistique exacte (latin, grec, francique, ancien français, arabe, etc.), le mot source avec sa signification entre guillemets et son évolution sémantique jusqu'au français moderne.
Format d'écriture recommandé : « Du latin silentium (« action de se taire, silence »), dérivé de silere (« se taire, être tranquille »)... »
Sois précis, scientifique et concis (2 à 3 phrases claires).
Réponds UNIQUEMENT sous la forme d'un objet JSON strict :
{
  "etymologie": "Du latin...",
  "prononciation": "..." (optionnel, notation en Alphabet Phonétique International ex: \si.lɑ̃s\)
}
```

---

### 🔹 Bouton 2 : Synonymes Intelligents & Nuances
- **Endpoint API** : `POST /api/stylistique/enrichir-synonymes`
- **Méthode** : `aiService.enrichirSynonymesIA(mot, existants)`
- **Variables interpolées** : `${mot}`, `${existants.join(', ')}`

```text
Tu es un maître de style et lexicographe littéraire français.
Pour le mot « ${mot} », propose 6 synonymes ou équivalents nuancés de haute tenue stylistique, qui ne figurent PAS dans cette liste existante : [${existants.join(', ')}].

Pour chaque synonyme :
- "mot" : le mot ou locution
- "nuance" : explication précise de sa nuance sémantique et de son atmosphère
- "intensite" : entier entre 1 (légère), 2 (modérée), 3 (intense), 4 (extrême)
- "registre" : "littéraire" | "soutenu" | "courant" | "familier"
- "connotation" : "positive" | "neutre" | "sombre" | "méliorative" | "péjorative"
- "contexteConseille" : conseil d'écriture concret pour l'auteur
- "exemple" : une belle phrase littéraire originale illustrant son usage

Réponds UNIQUEMENT sous forme d'un objet JSON contenant la clé "synonymes" :
{
  "synonymes": [
    {
      "mot": "...",
      "nuance": "...",
      "intensite": 2,
      "registre": "littéraire",
      "connotation": "positive",
      "contexteConseille": "...",
      "exemple": "..."
    }
  ]
}
```

---

### 🔹 Bouton 3 : Antonymes & Oppositions
- **Endpoint API** : `POST /api/stylistique/enrichir-antonymes`
- **Méthode** : `aiService.enrichirAntonymesIA(mot, existants)`
- **Variables interpolées** : `${mot}`, `${existants.join(', ')}`

```text
Tu es un linguiste et auteur littéraire francophone.
Pour le mot « ${mot} », propose 6 antonymes ou oppositions dramatiques/stylistiques fortes, qui ne figurent PAS dans : [${existants.join(', ')}].

Pour chaque antonyme :
- "mot" : le mot ou la locution opposée
- "sensAssocie" : explication courte de la rupture ou du contraste
- "type" : "direct" ou "contextuel"

Réponds UNIQUEMENT sous forme d'un objet JSON contenant la clé "antonymes" :
{
  "antonymes": [
    {
      "mot": "...",
      "sensAssocie": "...",
      "type": "direct"
    }
  ]
}
```

---

### 🔹 Bouton 4 : Champ Lexical & Associations d'Idées
- **Endpoint API** : `POST /api/stylistique/enrichir-champ-lexical`
- **Méthode** : `aiService.enrichirChampLexicalIA(mot, existants)`
- **Variables interpolées** : `${mot}`, `${existants.join(', ')}`

```text
Tu es un poète et styliste pour auteurs de fiction.
Pour le mot « ${mot} », propose 8 à 10 termes évocateurs de son champ lexical, sensoriel et symbolique, qui ne figurent PAS dans : [${existants.join(', ')}].

Pour chaque terme :
- "mot" : le terme évocateur
- "theme" : univers ou ambiance
- "relationType" : "thématique" | "sensoriel" | "association_libre"
- "note" : brève suggestion d'écriture

Réponds UNIQUEMENT sous forme d'un objet JSON contenant la clé "champLexical" :
{
  "champLexical": [
    {
      "mot": "...",
      "theme": "...",
      "relationType": "sensoriel",
      "note": "..."
    }
  ]
}
```

---

### 🔹 Bouton 5 : Exemples d'Usage & Tournures Stylistiques
- **Endpoint API** : `POST /api/stylistique/generer-exemples`
- **Méthode** : `aiService.genererExemplesStylistiques(mot, categorie, registre)`
- **Variables interpolées** : `${mot}`, `${registre}`

```text
Tu es un maître de style littéraire français de haute volée. Pour le mot "${mot}", génère 4 phrases d'exemple distinctes et inspirantes (1 narrative, 1 descriptive, 1 de dialogue, 1 poétique) dans un registre ${registre}.
Respecte scrupuleusement le sens du mot sans contresens.
Réponds uniquement au format JSON valide contenant la clé "exemples" :
{
  "exemples": [
    {"texte": "phrase narrative...", "type": "narratif"},
    {"texte": "phrase descriptive...", "type": "descriptif"},
    {"texte": "phrase dialoguée...", "type": "dialogue"},
    {"texte": "phrase poétique...", "type": "poétique"}
  ]
}
```

---

### 🔹 Bouton 6 : Recherche par Intention Narratrice (Atelier de Nuances)
- **Endpoint API** : `POST /api/stylistique/intention`
- **Méthode** : `aiService.analyserIntentionStylistique(intention)`
- **Variables interpolées** : `${intention.idee}`, `${intention.emotion}`, `${intention.contexteNarratif}`, `${intention.registre}`

```text
Tu es un assistant de style pour écrivains de langue française.
L'auteur a pour intention d'écriture : "${intention.idee}".
Émotion : "${intention.emotion || 'non spécifiée'}". Contexte : "${intention.contexteNarratif || 'général'}". Registre : "${intention.registre || 'littéraire'}".
Propose 4 mots ou locutions en français parfaitement ciblés avec nuance distinctive, registre, intensité (1 à 4) et un exemple littéraire marquant.
Réponds uniquement en JSON valide conforme à cette structure :
{
  "intentionReformulee": "...",
  "conseilStylistique": "...",
  "motsProposes": [
    {
      "mot": "...",
      "categorie": "nom|verbe|adjectif",
      "pourquoiCeMot": "...",
      "nuanceDistinctive": "...",
      "intensite": 1,
      "registre": "littéraire|soutenu|courant",
      "exemplePhrase": "..."
    }
  ]
}
```
