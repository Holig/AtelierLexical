import {
  SynonymeNuance,
  Intensite,
  Registre,
  Connotation,
  IntentionRecherche,
  ReponseAtelierStylistique,
  PropositionStylistique
} from '../../../shared/types';
import { normaliserMotRecherche, supprimerAccents } from '../utils/french';

// Base de nuances expertes pour enrichir les termes littéraires fondamentaux lorsque le Wiktionnaire est succinct
const BASE_NUANCES_LITTERAIRES: Record<string, SynonymeNuance[]> = {
  silence: [
    {
      mot: 'calme',
      nuance: 'Absence de trouble sonore et apaisement des sens.',
      intensite: 1,
      registre: 'courant',
      connotation: 'positive',
      contexteConseille: 'Fin de journée, nature paisible, repos',
      exemple: 'Le calme du soir descendit doucement sur la plaine.',
      source: 'Wiktionnaire (CC BY-SA 4.0)'
    },
    {
      mot: 'quiétude',
      nuance: 'État de tranquillité sereine et profonde, dénué de toute inquiétude.',
      intensite: 1,
      registre: 'littéraire',
      connotation: 'positive',
      contexteConseille: 'Havre de paix, contemplation spirituelle ou félicité',
      exemple: 'Une quiétude bienfaisante s’était emparée de la clairière.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'sérénité',
      nuance: 'Silence intérieur parfait et atmosphère d’une paix totale.',
      intensite: 2,
      registre: 'soutenu',
      connotation: 'positive',
      contexteConseille: 'Détachement philosophique, communion avec les éléments',
      exemple: 'Dans la sérénité du cloître, nulle parole n’était nécessaire.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'paix',
      nuance: 'Silence vécu comme un répit ou un soulagement après le tumulte.',
      intensite: 2,
      registre: 'courant',
      connotation: 'positive',
      contexteConseille: 'Après l’orage, réconciliation ou trêve des passions',
      exemple: 'La paix retombait enfin sur la maison endormie.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'recueillement',
      nuance: 'Silence solennel, sacré ou méditatif propice à la mémoire et à la ferveur.',
      intensite: 2,
      registre: 'littéraire',
      connotation: 'positive',
      contexteConseille: 'Hommage solennel, deuil, prière ou introspection',
      exemple: 'Un silence de recueillement enveloppa l’assemblée émue.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'mutisme',
      nuance: 'Refus délibéré ou incapacité obstinée d’émettre la moindre parole.',
      intensite: 3,
      registre: 'soutenu',
      connotation: 'sombre',
      contexteConseille: 'Secret inavouable, rancœur, traumatisme ou résistance',
      exemple: 'Il s’enferma dans un mutisme que nulle prière ne put briser.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'réserve',
      nuance: 'Retenue mesurée dictée par la pudeur, la politesse ou la méfiance.',
      intensite: 1,
      registre: 'courant',
      connotation: 'neutre',
      contexteConseille: 'Société mondaine, diplomatie, pudeur des sentiments',
      exemple: 'Elle gardait une réserve prudente face aux inconnus.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'laconisme',
      nuance: 'Fait de s’exprimer avec une extrême parcimonie, à la lisière du silence.',
      intensite: 2,
      registre: 'littéraire',
      connotation: 'neutre',
      contexteConseille: 'Personnage austère, taciturne ou économe de mots',
      exemple: 'Son laconisme habituel décourageait les questions indiscrètes.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'sourdine',
      nuance: 'Atténuation feutrée et tamisée de l’ambiance sonore.',
      intensite: 1,
      registre: 'littéraire',
      connotation: 'neutre',
      contexteConseille: 'Atmosphère feutrée, neige, brume ou chambre capitonnée',
      exemple: 'La neige mettait une sourdine aux pas des passants.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'malaise',
      nuance: 'Silence embarrassant, pesant et révélateur d’un non-dit.',
      intensite: 3,
      registre: 'courant',
      connotation: 'péjorative',
      contexteConseille: 'Après une maladresse, une trahison ou une tension sociale',
      exemple: 'Un lourd malaise s’installa soudain entre les convives.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'tension',
      nuance: 'Silence oppressant qui précède l’orage ou la déflagration dramatique.',
      intensite: 4,
      registre: 'courant',
      connotation: 'sombre',
      contexteConseille: 'Avant le combat, face-à-face tragique ou compte à rebours',
      exemple: 'La tension dans la salle d’armes était devenue irrespirable.',
      source: 'Atelier de Nuances'
    },
    {
      mot: 'omerta',
      nuance: 'Loi du silence imposée par la peur, l’honneur ou le serment du groupe.',
      intensite: 4,
      registre: 'soutenu',
      connotation: 'sombre',
      contexteConseille: 'Affaires d’État, monde criminel ou secrets de famille',
      exemple: 'L’omerta régnait dans le village depuis la disparition des témoins.',
      source: 'Atelier de Nuances'
    }
  ]
};

export class NuanceService {
  /**
   * Enrichit les synonymes réels issus du Wiktionnaire avec intensité, nuances et conseils de contexte
   */
  public enrichirSynonymes(motPrincipal: string, synonymesBruts: string[]): SynonymeNuance[] {
    const motNorm = normaliserMotRecherche(motPrincipal);
    const resultats: SynonymeNuance[] = [];
    const traites = new Set<string>();

    // 1. Ajouter les synonymes bruts issus du Wiktionnaire
    for (const motSyn of synonymesBruts) {
      const synNorm = normaliserMotRecherche(motSyn);
      if (traites.has(synNorm) || synNorm === motNorm) continue;
      traites.add(synNorm);

      const analyse = this.analyserNuanceHeuristique(motPrincipal, motSyn);
      resultats.push(analyse);
    }

    // 2. Compléter avec la base littéraire experte pour les concepts fondamentaux
    const curated = BASE_NUANCES_LITTERAIRES[motNorm];
    if (curated) {
      for (const c of curated) {
        const cNorm = normaliserMotRecherche(c.mot);
        if (!traites.has(cNorm) && cNorm !== motNorm) {
          traites.add(cNorm);
          resultats.push(c);
        }
      }
    }

    return resultats;
  }

  /**
   * Analyse heuristique d'un synonyme pour déduire son intensité et son registre
   */
  private analyserNuanceHeuristique(motBase: string, motSyn: string): SynonymeNuance {
    const synLow = motSyn.toLowerCase();
    let intensite: Intensite = 2;
    let registre: Registre = 'courant';
    let connotation: Connotation = 'neutre';
    let nuance = `Nuance sémantique proche de « ${motBase} »`;
    let contexteConseille = 'Utilisable dans une narration générale';

    // Heuristiques d'intensité
    if (
      synLow.includes('issime') ||
      synLow.startsWith('archi') ||
      synLow.startsWith('sur') ||
      /fur|rag|terr|effr|parox|hurl|dévast|abîm|abomin/i.test(synLow)
    ) {
      intensite = 4;
      nuance = `Degré paroxystique ou maximal comparé à « ${motBase} »`;
      contexteConseille = 'Scènes d’apogée dramatique, violence ou choc';
    } else if (
      /grand|fort|vif|profond|intense|courroux|effroi/i.test(synLow) ||
      synLow.length > 10
    ) {
      intensite = 3;
      nuance = `Intensité marquée et expressive`;
      contexteConseille = 'Description appuyée, sentiment soutenu';
    } else if (
      synLow.startsWith('sous-') ||
      synLow.startsWith('demi-') ||
      synLow.endsWith('et') ||
      synLow.endsWith('ette') ||
      synLow.endsWith('âtre') ||
      /léger|faible|vague|discret|frém|irrit|agac|taquin/i.test(synLow)
    ) {
      intensite = 1;
      nuance = `Nuance atténuée, discrète ou naissante`;
      contexteConseille = 'Évocation subtile ou début de manifestation';
    }

    // Heuristiques de registre
    if (/ire|courroux|mélancolie|sylvestre|quiétude|taciturne|trépasser|songer/i.test(synLow)) {
      registre = 'littéraire';
    } else if (synLow.endsWith('tion') || synLow.endsWith('ité') || synLow.endsWith('ment')) {
      registre = 'soutenu';
    } else if (/moche|dingue|foutre|pige|froussard|poche/i.test(synLow)) {
      registre = 'familier';
    }

    // Connotation
    if (/peur|rage|mort|haine|fiel|venin|angoisse|horreur/i.test(synLow)) {
      connotation = 'sombre';
    } else if (/joie|lumière|douceur|grâce|apais|gloire/i.test(synLow)) {
      connotation = 'positive';
    }

    return {
      mot: motSyn,
      nuance,
      intensite,
      registre,
      connotation,
      contexteConseille,
      source: 'Wiktionnaire (analysé par Atelier Lexical)'
    };
  }

  /**
   * Moteur de recherche d'intentions stylistiques pour l'Atelier d'écriture
   */
  public chercherParIntention(intention: IntentionRecherche): ReponseAtelierStylistique {
    const texte = `${intention.idee} ${intention.emotion || ''} ${intention.effetRecherche || ''}`;
    const texteClean = supprimerAccents(texte.toLowerCase());

    const propositions: PropositionStylistique[] = [];

    // 1. Scénario : Peur soudaine / paralysante
    if (texteClean.includes('peur') || texteClean.includes('paralys') || texteClean.includes('effroi') || texteClean.includes('panique')) {
      propositions.push(
        {
          mot: 'sidération',
          categorie: 'nom',
          pourquoiCeMot: 'Exprime l’anéantissement brutal de la pensée et du mouvement devant un choc inouï.',
          nuanceDistinctive: 'Immobilité absolue causée par l’incrédulité et le choc, plus psychologique que la simple fuite.',
          intensite: 4,
          registre: 'soutenu',
          exemplePhrase: 'Frappé de sidération, il regardait le gouffre béant sans pouvoir reculer d’un pouce.'
        },
        {
          mot: 'effroi',
          categorie: 'nom',
          pourquoiCeMot: 'La forme la plus littéraire d’une peur glaçante provoquée par une vision terrifiante.',
          nuanceDistinctive: 'Implique une dimension visuelle ou spectrale immédiate qui saisit le personnage.',
          intensite: 3,
          registre: 'littéraire',
          exemplePhrase: 'Un frisson d’effroi lui figea le sang lorsqu’il distingua la forme tapie dans l’âtre.'
        },
        {
          mot: 'pétrifier',
          categorie: 'verbe',
          pourquoiCeMot: 'Idéal pour traduire l’effet physique de la peur qui transforme le corps en pierre.',
          nuanceDistinctive: 'Met l’accent sur la perte musculaire de réaction et le regard figé.',
          intensite: 4,
          registre: 'courant',
          exemplePhrase: 'Le claquement sec de la détonation la pétrifia au milieu de la chaussée.'
        },
        {
          mot: 'stupeur',
          categorie: 'nom',
          pourquoiCeMot: 'Évoque l’hébétude où l’esprit est suspendu entre l’incompréhension et l’angoisse.',
          nuanceDistinctive: 'Moins violent que la panique, idéal pour une scène intimiste ou de découverte macabre.',
          intensite: 3,
          registre: 'soutenu',
          exemplePhrase: 'Une stupeur muette régnait dans la chambre close où plus rien ne bougeait.'
        }
      );
    }
    // 2. Scénario : Colère / altercation / fureur
    else if (texteClean.includes('colere') || texteClean.includes('fureur') || texteClean.includes('rage') || texteClean.includes('dispute') || texteClean.includes('emport')) {
      propositions.push(
        {
          mot: 'courroux',
          categorie: 'nom',
          pourquoiCeMot: 'Colère noble, solennelle ou théâtrale qui impose le respect ou la terreur.',
          nuanceDistinctive: 'Donne de la grandeur morale ou tragique au personnage sans paraître vulgaire.',
          intensite: 3,
          registre: 'littéraire',
          exemplePhrase: 'Le courroux du vieux maître pesait plus lourdement sur leurs épaules que des chaînes.'
        },
        {
          mot: 'ressentiment',
          categorie: 'nom',
          pourquoiCeMot: 'Colère rentrée, sourde et durable, qui mûrit en secret pendant des années.',
          nuanceDistinctive: 'Parfait pour un roman psychologique ou pour préparer une vengeance insidieuse.',
          intensite: 2,
          registre: 'soutenu',
          exemplePhrase: 'Sous des dehors affables, il ruminait un ressentiment que rien ne pouvait désarmer.'
        },
        {
          mot: 'fulminer',
          categorie: 'verbe',
          pourquoiCeMot: 'Verbe expressif montrant la colère qui menace d’exploser par la parole.',
          nuanceDistinctive: 'Excellente alternative à « crier » ou « s’énerver ».',
          intensite: 3,
          registre: 'soutenu',
          exemplePhrase: 'Il fulminait en silence, ses yeux lançant des éclairs d’orage.'
        }
      );
    }
    // 3. Scénario : Remplacer "dire" dans un dialogue
    else if (texteClean.includes('dire') || texteClean.includes('dialogue') || texteClean.includes('parler') || texteClean.includes('repetition')) {
      propositions.push(
        {
          mot: 'rétorquer',
          categorie: 'verbe',
          pourquoiCeMot: 'Répondre avec vivacité et ironie en retournant l’argument de l’adversaire.',
          nuanceDistinctive: 'Indique un échange tendu où chaque mot est une parade d’escrime.',
          intensite: 2,
          registre: 'soutenu',
          exemplePhrase: '« Vous oubliez qui commande ici », rétorqua-t-elle avec un calme assassin.'
        },
        {
          mot: 'chuchoter',
          categorie: 'verbe',
          pourquoiCeMot: 'Conférer immédiatement du mystère, de l’intimité ou de la vulnérabilité.',
          nuanceDistinctive: 'Crée un effet de proximité physique entre les interlocuteurs.',
          intensite: 1,
          registre: 'courant',
          exemplePhrase: '« Ne regarde pas maintenant », chuchota-t-il contre sa tempe.'
        },
        {
          mot: 'asséner',
          categorie: 'verbe',
          pourquoiCeMot: 'Pour une parole qui frappe comme une massue ou coupe court à toute réplique.',
          nuanceDistinctive: 'Donne un poids implacable et sans appel à la déclaration.',
          intensite: 4,
          registre: 'soutenu',
          exemplePhrase: '« Nous partons ce soir », asséna-t-il sans admettre la moindre contestation.'
        },
        {
          mot: 'bredouiller',
          categorie: 'verbe',
          pourquoiCeMot: 'Traverse le doute, la culpabilité ou le trouble amoureux.',
          nuanceDistinctive: 'Révèle la fragilité du personnage à travers son élocution brisée.',
          intensite: 2,
          registre: 'courant',
          exemplePhrase: 'Pris en faute, il bredouilla de vagues excuses que personne n’écouta.'
        }
      );
    }
    // 4. Scénario : Description sombre, mélancolie, nuit, atmosphère
    else if (texteClean.includes('sombre') || texteClean.includes('nuit') || texteClean.includes('melancolie') || texteClean.includes('tristesse') || texteClean.includes('deuil')) {
      propositions.push(
        {
          mot: 'crépusculaire',
          categorie: 'adjectif',
          pourquoiCeMot: 'Évoque une lumière mourante, le déclin d’une époque ou la fin d’un être.',
          nuanceDistinctive: 'Plus poétique et mélancolique que « sombre » ou « nocturne ».',
          intensite: 2,
          registre: 'poétique',
          exemplePhrase: 'Une clarté crépusculaire baignait les ruines d’une nostalgie indicible.'
        },
        {
          mot: 'sépulcral',
          categorie: 'adjectif',
          pourquoiCeMot: 'Rappelle la fraîcheur du tombeau, le froid minéral et l’immobilité éternelle.',
          nuanceDistinctive: 'Idéal pour accentuer une ambiance gothique ou funèbre.',
          intensite: 3,
          registre: 'littéraire',
          exemplePhrase: 'Un silence sépulcral s’était abattu sur les couloirs du manoir délaissé.'
        },
        {
          mot: 'ténèbres',
          categorie: 'nom',
          pourquoiCeMot: 'L’obscurité habitée, cosmique ou métaphysique.',
          nuanceDistinctive: 'Confère une dimension mythologique et redoutable à la nuit.',
          intensite: 4,
          registre: 'littéraire',
          exemplePhrase: 'La forêt ouvrait sa gueule de ténèbres devant leurs flambeaux dérisoires.'
        }
      );
    }
    // 5. Cas général / recherche libre
    else {
      propositions.push(
        {
          mot: 'ciseler',
          categorie: 'verbe',
          pourquoiCeMot: 'Pour polir la prose avec la minutie de l’orfèvre.',
          nuanceDistinctive: 'Insiste sur le travail minutieux de la forme littéraire.',
          intensite: 3,
          registre: 'littéraire',
          exemplePhrase: 'L’auteur ciselait chaque métaphore comme une pierre précieuse.'
        },
        {
          mot: 'fulgurance',
          categorie: 'nom',
          pourquoiCeMot: 'Désigne une illumination ou une intensité brève mais inoubliable.',
          nuanceDistinctive: 'Évoque la vivacité de l’éclair dans l’esprit du lecteur.',
          intensite: 4,
          registre: 'soutenu',
          exemplePhrase: 'Cette phrase traversa le paragraphe avec la fulgurance d’une comète.'
        },
        {
          mot: 'délétère',
          categorie: 'adjectif',
          pourquoiCeMot: 'Qualifie ce qui empoisonne l’esprit ou l’atmosphère à petit feu.',
          nuanceDistinctive: 'Beaucoup plus précis et suggestif que « mauvais » ou « toxique ».',
          intensite: 3,
          registre: 'soutenu',
          exemplePhrase: 'Le soupçon créait une atmosphère délétère où nul ne pouvait plus respirer.'
        }
      );
    }

    return {
      intentionReformulee: `Recherche d'expression : « ${intention.idee} »`,
      motsProposes: propositions,
      conseilStylistique:
        'Pour éviter les formules convenues, privilégiez le mot qui suggère une image sensorielle ou un mouvement psychologique singulier plutôt qu’un simple terme abstrait.',
      source: 'moteur_nuances'
    };
  }
}

export const nuanceService = new NuanceService();
