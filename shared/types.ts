/**
 * Types partagés pour l'Atelier Lexical
 */

export type Registre =
  | 'littéraire'
  | 'soutenu'
  | 'courant'
  | 'familier'
  | 'poétique'
  | 'archaïque'
  | 'technique'
  | 'argotique';

export type Connotation = 'positive' | 'neutre' | 'péjorative' | 'sombre';

export type Intensite = 1 | 2 | 3 | 4; // 1: Légère/Atténuée, 2: Modérée, 3: Intense, 4: Paroxystique

export type CategorieGrammaticale =
  | 'nom'
  | 'verbe'
  | 'adjectif'
  | 'adverbe'
  | 'interjection'
  | 'locution'
  | 'autre';

export interface ExempleUsage {
  texte: string;
  auteur?: string;
  source?: string;
  annee?: string;
  type?: 'narratif' | 'descriptif' | 'dialogue' | 'poétique' | 'classique' | 'ia';
  estGenereIA?: boolean;
}

export interface DefinitionSens {
  id: string;
  numero: number;
  categorie: CategorieGrammaticale;
  genre?: 'masculin' | 'féminin' | 'invariable';
  definition: string;
  exemples: ExempleUsage[];
  registre?: Registre;
  domaine?: string;
  connotation?: Connotation;
  remarques?: string;
}

export interface SynonymeNuance {
  mot: string;
  sensAssocie?: string;
  nuance: string;
  intensite: Intensite;
  registre: Registre;
  connotation: Connotation;
  contexteConseille: string;
  definitionCourte?: string;
  exemple?: string;
  source: string;
  estGenereIA?: boolean;
}

export interface Antonyme {
  mot: string;
  sensAssocie?: string;
  type: 'direct' | 'contextuel';
  source: string;
  estGenereIA?: boolean;
}

export interface MotMorphologique {
  mot: string;
  categorie?: CategorieGrammaticale;
  definitionCourte?: string;
  relation: string; // ex: "nom dérivé", "verbe associé", "adjectif"
}

export interface ElementChampLexical {
  mot: string;
  theme?: string;
  relationType: 'thématique' | 'sensoriel' | 'association_libre';
  note?: string;
  estGenereIA?: boolean;
}

export interface ExpressionLocution {
  expression: string;
  sens: string;
  registre?: Registre;
  origine?: string;
  exemple?: string;
  variantes?: string[];
  source: string;
}

export interface FicheConjugaison {
  verbe: string;
  groupe: 1 | 2 | 3;
  auxiliaire: 'avoir' | 'être' | 'avoir ou être';
  temps: {
    indicatifPresent: string[];
    indicatifImparfait: string[];
    indicatifPasseSimple: string[];
    indicatifFuturSimple: string[];
    indicatifPasseCompose: string[];
    subjonctifPresent: string[];
    subjonctifImparfait: string[];
    conditionnelPresent: string[];
    imperatifPresent: string[];
    participePresent: string;
    participePasse: string;
  };
}

export interface SourceAttribution {
  nom: string;
  licence: string;
  url: string;
  disclaimer: string;
}

export interface FicheLexicale {
  mot: string;
  motNormalise: string;
  prononciationApi?: string;
  etymologie?: string;
  categories: CategorieGrammaticale[];
  genres?: ('masculin' | 'féminin')[];
  formesPluriel?: string[];
  formesFeminin?: string[];
  definitions: DefinitionSens[];
  synonymes: SynonymeNuance[];
  antonymes: Antonyme[];
  familleLexicale: MotMorphologique[];
  champLexical: ElementChampLexical[];
  expressions: ExpressionLocution[];
  exemplesLitteraires: ExempleUsage[];
  conjugaison?: FicheConjugaison;
  sources: SourceAttribution[];
  estVerbe: boolean;
  motSaisiOriginal?: string;
  explicationForme?: string;
  dateMaj: string;
}

/**
 * Atelier de Nuances Stylistiques & Intentions
 */
export interface IntentionRecherche {
  idee: string;
  emotion?: string;
  intensite?: Intensite;
  registre?: Registre;
  contexteNarratif?: 'description' | 'action' | 'dialogue' | 'poésie' | 'psychologique';
  effetRecherche?: string;
}

export interface PropositionStylistique {
  mot: string;
  categorie: CategorieGrammaticale;
  pourquoiCeMot: string;
  nuanceDistinctive: string;
  intensite: Intensite;
  registre: Registre;
  exemplePhrase: string;
  estGenereIA?: boolean;
}

export interface ReponseAtelierStylistique {
  intentionReformulee: string;
  motsProposes: PropositionStylistique[];
  conseilStylistique: string;
  source: 'moteur_nuances' | 'ia_assistee';
}

/**
 * Carnet d'Écrivain (Favoris & Collections)
 */
export interface MotSauvegarde {
  mot: string;
  dateAjout: string;
  notes?: string;
  collectionId?: string;
  tags?: string[];
  synonymeFavori?: string;
}

export interface CollectionEcriture {
  id: string;
  nom: string;
  description?: string;
  couleur?: string;
  dateCreation: string;
}

/**
 * Configuration du Don & Soutien
 */
export interface DonationPublicConfig {
  enabled: boolean;
  url: string | null;
  label: string;
}

export interface DonationAdminConfig extends DonationPublicConfig {
  updatedAt?: string;
  notes?: string;
}

export interface AdminAuthResponse {
  success: boolean;
  token?: string;
  expiresIn?: string;
  message?: string;
}

/**
 * Configuration & Édition des Prompts IA
 */
export type PromptKey =
  | 'etymologie'
  | 'synonymes'
  | 'antonymes'
  | 'champLexical'
  | 'exemples'
  | 'intention';

export interface PromptDefinition {
  key: PromptKey;
  titre: string;
  description: string;
  variablesDisponibles: string[];
  template: string;
  templateDefaut: string;
  estPersonnalise: boolean;
}

export type PromptsConfigMap = Partial<Record<PromptKey, string>>;

