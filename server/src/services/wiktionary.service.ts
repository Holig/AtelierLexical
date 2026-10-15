import { LRUCache } from 'lru-cache';
import {
  FicheLexicale,
  DefinitionSens,
  CategorieGrammaticale,
  ExempleUsage,
  Registre,
  Connotation
} from '../../../shared/types';
import { nettoyerWikitext, normaliserMotRecherche, distanceLevenshtein } from '../utils/french';

export interface WiktionaryParsedData {
  mot: string;
  prononciationApi?: string;
  etymologie?: string;
  categories: CategorieGrammaticale[];
  genres: ('masculin' | 'féminin')[];
  definitions: DefinitionSens[];
  synonymesMots: string[];
  antonymesMots: string[];
  familleMots: string[];
  vocabulaireMots: string[];
  expressions: Array<{ expression: string; sens: string; exemple?: string }>;
  sourceUrl: string;
  estFlexion?: boolean;
  lemmeCible?: string;
  explicationFlexion?: string;
}

export class WiktionaryService {
  private cache: LRUCache<string, WiktionaryParsedData>;
  private userAgent = 'AtelierLexical/1.0 (https://github.com/atelier-lexical; contact@atelierlexical.fr)';

  constructor() {
    this.cache = new LRUCache<string, WiktionaryParsedData>({
      max: 500,
      ttl: 1000 * 60 * 60 * 24 // 24 heures
    });
  }

  /**
   * Récupère des suggestions d'autocomplétion en temps réel via OpenSearch Wiktionnaire
   */
  public async getSuggestions(query: string): Promise<string[]> {
    const q = normaliserMotRecherche(query);
    if (!q || q.length < 1) return [];

    try {
      const url = `https://fr.wiktionary.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=8&format=json`;
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (!response.ok) return [];

      const data = (await response.json()) as [string, string[]];
      if (Array.isArray(data) && Array.isArray(data[1])) {
        return data[1].filter(mot => !mot.includes(':') && mot.trim().length > 0);
      }
      return [];
    } catch (err) {
      console.warn('Erreur lors de la récupération des suggestions Wiktionnaire:', err);
      return [];
    }
  }

  /**
   * Trouve le mot orthographiquement le plus proche en cas de faute de frappe
   */
  public async trouverMotProche(motErrone: string): Promise<string | null> {
    const q = normaliserMotRecherche(motErrone);
    if (!q || q.length < 2) return null;

    try {
      // 1. Essayer d'abord l'autocomplétion
      const suggestions = await this.getSuggestions(q);
      if (suggestions.length > 0) {
        // Trouver la suggestion avec la plus petite distance
        let meilleurMot = suggestions[0];
        let minDistance = distanceLevenshtein(q, normaliserMotRecherche(meilleurMot));

        for (const sug of suggestions) {
          const d = distanceLevenshtein(q, normaliserMotRecherche(sug));
          if (d < minDistance) {
            minDistance = d;
            meilleurMot = sug;
          }
        }

        if (minDistance <= 2) {
          return meilleurMot;
        }
      }

      // 2. Recherche plein texte MediaWiki si rien de concluant
      const searchUrl = `https://fr.wiktionary.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=5`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const searchResults: any[] = searchData?.query?.search || [];
        for (const item of searchResults) {
          const titre = item.title;
          if (titre && !titre.includes(':')) {
            const d = distanceLevenshtein(q, normaliserMotRecherche(titre));
            if (d <= 2) {
              return titre;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Erreur recherche de mot proche:', err);
    }

    return null;
  }

  /**
   * Récupère et extrait les données lexicales réelles depuis fr.wiktionary.org
   * avec suivi automatique des redirections (&redirects=1)
   */
  public async fetchWordData(motRecherche: string): Promise<WiktionaryParsedData | null> {
    const mot = normaliserMotRecherche(motRecherche);
    if (!mot) return null;

    // Vérification dans le cache
    const cached = this.cache.get(mot);
    if (cached) return cached;

    try {
      // &redirects=1 permet de résoudre automatiquement les redirections MediaWiki (#REDIRECTION [[...]])
      const url = `https://fr.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(mot)}&format=json&prop=wikitext&redirects=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent }
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      if (!json.parse || !json.parse.wikitext || !json.parse.wikitext['*']) {
        return null;
      }

      const wikitext: string = json.parse.wikitext['*'];
      const titreReel = json.parse.title || mot;
      const parsed = this.parseWikitext(mot, titreReel, wikitext);
      if (parsed) {
        this.cache.set(mot, parsed);
      }
      return parsed;
    } catch (err) {
      console.error(`Erreur réseau Wiktionnaire pour "${mot}":`, err);
      return null;
    }
  }

  /**
   * Analyse et structure le wikitext de fr.wiktionary.org
   */
  private parseWikitext(motRecherche: string, titreReel: string, wikitext: string): WiktionaryParsedData | null {
    // 1. Isoler la section de langue française : == {{langue|fr}} ==
    const matchFr = wikitext.match(/(?:^|\n)\s*==\s*\{\{langue\|fr\}\}\s*==([\s\S]*?)(?=(?:\n\s*==\s*\{\{langue\|)|$)/i);
    if (!matchFr) {
      return null;
    }
    const texteFr = matchFr[1];

    // 2. Détecter si la page est principalement une forme fléchie (verbe conjugué, pluriel, féminin)
    let estFlexion = false;
    let lemmeCible: string | undefined;
    let explicationFlexion: string | undefined;

    // Détection verbe fléchi : {{fr-verbe-flexion|grp=3|écrire|...}} ou {{fr-verbe-flexion|chanter|...}}
    const matchVerbeFlex = texteFr.match(/\{\{fr-verbe-flexion\|([^}]+)\}\}/i);
    if (matchVerbeFlex) {
      const args = matchVerbeFlex[1].split('|').map(a => a.trim());
      const verbArg = args.find(a => !a.includes('=') && a.length > 1);
      if (verbArg) {
        estFlexion = true;
        lemmeCible = verbArg;
        explicationFlexion = `Forme conjuguée du verbe « ${lemmeCible} »`;
      }
    }

    // Détection alternative flexion : ''... du verbe'' [[chanter]] ou ''Pluriel de'' [[œil]]
    if (!lemmeCible) {
      const matchLienLemme = texteFr.match(/(?:du verbe|de l[’']infinitif|Pluriel de|Féminin de|forme de)\s*\'*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/i);
      if (matchLienLemme && matchLienLemme[1]) {
        estFlexion = true;
        lemmeCible = matchLienLemme[1].trim();
        explicationFlexion = `Forme fléchie associée à « ${lemmeCible} »`;
      }
    }

    // 3. Prononciation API
    let prononciationApi: string | undefined;
    const matchPron = texteFr.match(/\{\{pron\|([^}|]+)\|fr\}\}/);
    if (matchPron && matchPron[1]) {
      prononciationApi = matchPron[1].trim();
    }

    // 4. Étymologie
    let etymologie: string | undefined;
    const matchEtym = texteFr.match(/===\s*\{\{S\|[ée]tymologie\}\}\s*===([\s\S]*?)(?=\n\s*===|$)/i);
    if (matchEtym) {
      etymologie = nettoyerWikitext(matchEtym[1]).replace(/^:\s*/, '').trim();
      if (etymologie.length > 500) {
        etymologie = etymologie.slice(0, 500) + '...';
      }
    }

    // 5. Définitions et catégories grammaticales
    const definitions: DefinitionSens[] = [];
    const categoriesSet = new Set<CategorieGrammaticale>();
    const genresSet = new Set<'masculin' | 'féminin'>();

    // Découper par sous-sections de niveau 3 (ex: === {{S|nom|fr}} ===, === {{S|adjectif|fr}} ===)
    const sectionsCatRegex = /===\s*\{\{S\|([^|}]+)\|fr(?:\|[^}]*)?\}\}\s*===([\s\S]*?)(?=\n\s*===\s*\{\{S\||$)/gi;
    let matchSection;

    let sensCounter = 1;

    while ((matchSection = sectionsCatRegex.exec(texteFr)) !== null) {
      const headerRaw = matchSection[0].toLowerCase();
      if (headerRaw.includes('flexion')) continue;

      const typeRaw = matchSection[1].toLowerCase().trim();
      const contenuSection = matchSection[2];

      const categorie = this.mapperCategorie(typeRaw);
      if (!categorie) continue;

      categoriesSet.add(categorie);

      // Détecter genre
      if (contenuSection.includes('{{m}}') || contenuSection.includes('{{masculin}}')) {
        genresSet.add('masculin');
      }
      if (contenuSection.includes('{{f}}') || contenuSection.includes('{{féminin}}')) {
        genresSet.add('féminin');
      }

      // Extraire les lignes de définitions (# ...) et les exemples (#* ...)
      const lignes = contenuSection.split('\n');
      let definitionCourante: DefinitionSens | null = null;

      for (let i = 0; i < lignes.length; i++) {
        const ligne = lignes[i].trim();

        // Si on atteint une sous-section de niveau 4, stopper
        if (ligne.startsWith('====')) break;

        // Nouvelle définition principale : commence par # mais PAS #*
        if (ligne.startsWith('#') && !ligne.startsWith('#*') && !ligne.startsWith('#:')) {
          const texteBrut = ligne.substring(1).trim();
          if (texteBrut.length > 2) {
            const registre = this.detecterRegistre(texteBrut);
            const connotation = this.detecterConnotation(texteBrut);
            const domaine = this.detecterDomaine(texteBrut);
            const texteNettoye = nettoyerWikitext(texteBrut);

            if (texteNettoye.length > 5) {
              definitionCourante = {
                id: `sens-${sensCounter}`,
                numero: sensCounter++,
                categorie,
                genre: genresSet.has('féminin') ? 'féminin' : genresSet.has('masculin') ? 'masculin' : undefined,
                definition: texteNettoye,
                exemples: [],
                registre,
                connotation,
                domaine
              };
              definitions.push(definitionCourante);
            }
          }
        }
        // Exemple associé (#*) pouvant s'étendre sur plusieurs lignes (ex: modèle {{exemple|...}})
        else if (ligne.startsWith('#*') && definitionCourante) {
          let blocExemple = ligne.substring(2).trim();
          let j = i + 1;
          while (j < lignes.length) {
            const nextL = lignes[j].trim();
            // Si on commence une nouvelle puce Wiktionnaire (#) ou section (==), stopper
            if (nextL.startsWith('#') || nextL.startsWith('==')) {
              // si c'est une ligne de source #: qui suit immédiatement
              if (nextL.startsWith('#:')) {
                blocExemple += '\n' + nextL;
                j++;
                continue;
              }
              break;
            }
            blocExemple += '\n' + nextL;
            j++;
          }
          i = j - 1;

          const parsed = this.parseExempleTemplate(blocExemple);
          if (parsed && parsed.text) {
            definitionCourante.exemples.push({
              texte: parsed.text,
              source: parsed.source || 'Wiktionnaire (corpus attesté)',
              type: 'classique'
            });
          }
        }
      }
    }

    // 6. Synonymes, Antonymes, Famille, Vocabulaire, Expressions
    const synonymesMots = this.extraireMotsListe(texteFr, /====\s*\{\{S\|(?:quasi-)?synonymes(?:\|[^}]*)?\}\}\s*====([\s\S]*?)(?=\n\s*===|$)/gi, 35);
    const antonymesMots = this.extraireMotsListe(texteFr, /====\s*\{\{S\|antonymes(?:\|[^}]*)?\}\}\s*====([\s\S]*?)(?=\n\s*===|$)/gi, 35);
    const familleMots = this.extraireMotsListe(texteFr, /====\s*\{\{S\|(?:d[ée]riv[ée]s|apparent[ée]s|compos[ée]s)(?:\|[^}]*)?\}\}\s*====([\s\S]*?)(?=\n\s*===|$)/gi, 50);
    const vocabulaireMots = this.extraireMotsListe(texteFr, /====\s*\{\{S\|vocabulaire(?:\|[^}]*)?\}\}\s*====([\s\S]*?)(?=\n\s*===|$)/gi, 35);
    const expressions = this.extraireExpressions(texteFr);

    return {
      mot: titreReel,
      prononciationApi,
      etymologie,
      categories: Array.from(categoriesSet),
      genres: Array.from(genresSet),
      definitions: definitions.slice(0, 10),
      synonymesMots,
      antonymesMots,
      familleMots,
      vocabulaireMots,
      expressions,
      sourceUrl: `https://fr.wiktionary.org/wiki/${encodeURIComponent(titreReel)}`,
      estFlexion,
      lemmeCible,
      explicationFlexion
    };
  }

  private mapperCategorie(raw: string): CategorieGrammaticale | null {
    if (raw.includes('flexion')) return null;
    if (raw.includes('nom')) return 'nom';
    if (raw.includes('verbe')) return 'verbe';
    if (raw.includes('adjectif')) return 'adjectif';
    if (raw.includes('adverbe')) return 'adverbe';
    if (raw.includes('interjection')) return 'interjection';
    if (raw.includes('locution')) return 'locution';
    return null;
  }

  private detecterRegistre(texte: string): Registre | undefined {
    const t = texte.toLowerCase();
    if (t.includes('littéraire') || t.includes('{{littéraire')) return 'littéraire';
    if (t.includes('soutenu') || t.includes('{{soutenu')) return 'soutenu';
    if (t.includes('familier') || t.includes('{{familier')) return 'familier';
    if (t.includes('poétique') || t.includes('{{poétique')) return 'poétique';
    if (t.includes('archaïque') || t.includes('vieilli') || t.includes('désuet')) return 'archaïque';
    if (t.includes('technique') || t.includes('didactique')) return 'technique';
    if (t.includes('argot') || t.includes('{{argot')) return 'argotique';
    return 'courant';
  }

  private detecterConnotation(texte: string): Connotation | undefined {
    const t = texte.toLowerCase();
    if (t.includes('péjoratif') || t.includes('dénigrant') || t.includes('injurieux')) return 'péjorative';
    if (t.includes('sombre') || t.includes('funèbre') || t.includes('mortel') || t.includes('terrible')) return 'sombre';
    if (t.includes('mélioratif') || t.includes('élogieux') || t.includes('noble')) return 'positive';
    return 'neutre';
  }

  private detecterDomaine(texte: string): string | undefined {
    const match = texte.match(/\{\{territoire\|([^}]+)\}\}|\{\{lexique\|([^}]+)\|fr\}\}/i);
    if (match) {
      return match[1] || match[2];
    }
    return undefined;
  }

  private extraireMotsListe(texte: string, regexSection: RegExp, limite = 30): string[] {
    const matchesSections = Array.from(texte.matchAll(regexSection));
    if (matchesSections.length === 0) return [];

    const mots: string[] = [];
    const seen = new Set<string>();

    // Supporte la syntaxe moderne et classique du Wiktionnaire :
    // 1. [[target|display]] ou [[mot]]
    // 2. {{lien|mot|fr...}} ou {{lien|mot}}
    // 3. {{m|fr|mot}} ou {{l|fr|mot}}
    // 4. {{l|mot|fr}}
    const pattern = /(?:\[\[(?:[^|\]]*\|)?([^\]#]+)(?:#[^\]]*)?\]\]|\{\{lien\|([^|}]+)(?:\|(?:fr|fra|fre)?(?:\|[^}]*)?)?\}\}|\{\{(?:m|l)\|fr\|([^|}]+)(?:\|[^}]*)?\}\}|\{\{l\|([^|}]+)\|fr\}\})/gi;

    for (const secMatch of matchesSections) {
      const section = secMatch[1] || '';
      const matches = Array.from(section.matchAll(pattern));

      for (const m of matches) {
        const mot = (m[1] || m[2] || m[3] || m[4] || '').trim();
        if (
          mot &&
          !mot.includes(':') &&
          !mot.includes('Annexe') &&
          !mot.includes('{') &&
          !mot.startsWith('(') &&
          !seen.has(mot.toLowerCase())
        ) {
          seen.add(mot.toLowerCase());
          mots.push(mot);
        }
      }
    }

    return mots.slice(0, limite);
  }

  private extraireExpressions(texte: string): Array<{ expression: string; sens: string; exemple?: string }> {
    const regex = /====\s*\{\{S\|(?:locutions|expressions|dérivés autres|proverbes)(?:\|[^}]*)?\}\}\s*====([\s\S]*?)(?=\n\s*===|$)/gi;
    const matchesSections = Array.from(texte.matchAll(regex));
    if (matchesSections.length === 0) return [];

    const resultats: Array<{ expression: string; sens: string; exemple?: string }> = [];
    const seen = new Set<string>();
    const patternLien = /(?:\[\[(?:[^|\]]*\|)?([^\]#]+)(?:#[^\]]*)?\]\]|\{\{lien\|([^|}]+)(?:\|(?:fr|fra|fre)?(?:\|[^}]*)?)?\}\}|\{\{(?:m|l)\|fr\|([^|}]+)(?:\|[^}]*)?\}\}|\{\{l\|([^|}]+)\|fr\}\})/i;

    for (const secMatch of matchesSections) {
      const section = secMatch[1] || '';
      const lignes = section.split('\n');

      for (const ligne of lignes) {
        if (ligne.startsWith('*') || ligne.startsWith('#')) {
          const matchLien = ligne.match(patternLien);
          if (matchLien) {
            const expression = (matchLien[1] || matchLien[2] || matchLien[3] || matchLien[4] || '').trim();
            if (expression.length > 2 && !seen.has(expression.toLowerCase())) {
              seen.add(expression.toLowerCase());
              const sensNettoye = nettoyerWikitext(
                ligne
                  .replace(/\[\[[^\]]+\]\]/g, '')
                  .replace(/\{\{[^}]+\}\}/g, '')
              ).replace(/^[:\-–—\s]+/, '').trim();

              resultats.push({
                expression,
                sens: sensNettoye || 'Locution ou expression consacrée par l’usage.'
              });
            }
          }
        }
      }
    }

    return resultats.slice(0, 20);
  }

  /**
   * Analyse robuste et équilibrée d'un modèle {{exemple|...}} sur une ou plusieurs lignes
   */
  private parseExempleTemplate(raw: string): { text: string; source?: string } | null {
    const idx = raw.toLowerCase().indexOf('{{exemple');
    if (idx === -1) {
      const textClean = nettoyerWikitext(raw);
      return textClean.length > 10 ? { text: textClean } : null;
    }

    let depth = 0;
    let endIdx = -1;
    for (let i = idx; i < raw.length - 1; i++) {
      if (raw[i] === '{' && raw[i + 1] === '{') {
        depth++;
        i++;
      } else if (raw[i] === '}' && raw[i + 1] === '}') {
        depth--;
        i++;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx === -1) endIdx = raw.length;
    const content = raw.substring(idx + 9, endIdx - 1);

    const args: string[] = [];
    let currentArg = '';
    let subDepth = 0;
    let bracketDepth = 0;

    for (let i = 0; i < content.length; i++) {
      const c = content[i];
      const nextC = content[i + 1] || '';
      if (c === '{' && nextC === '{') {
        subDepth++;
        currentArg += '{{';
        i++;
      } else if (c === '}' && nextC === '}') {
        subDepth--;
        currentArg += '}}';
        i++;
      } else if (c === '[' && nextC === '[') {
        bracketDepth++;
        currentArg += '[[';
        i++;
      } else if (c === ']' && nextC === ']') {
        bracketDepth--;
        currentArg += ']]';
        i++;
      } else if (c === '|' && subDepth === 0 && bracketDepth === 0) {
        args.push(currentArg.trim());
        currentArg = '';
      } else {
        currentArg += c;
      }
    }
    if (currentArg.trim()) args.push(currentArg.trim());

    let rawText = '';
    let rawSource = '';

    for (const a of args) {
      const aLower = a.toLowerCase();
      if (aLower.startsWith('lang=')) continue;
      if (aLower.startsWith('source=')) {
        rawSource = a.substring(7).trim();
      } else if (aLower.startsWith('1=')) {
        rawText = a.substring(2).trim();
      } else if (!a.includes('=') && !rawText && a.length > 5) {
        rawText = a.trim();
      }
    }

    const text = nettoyerWikitext(rawText);
    const source = rawSource ? nettoyerWikitext(rawSource) : undefined;

    if (text.length > 10 && !text.startsWith('{')) {
      return { text, source };
    }
    return null;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const wiktionaryService = new WiktionaryService();
