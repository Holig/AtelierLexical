import { FicheConjugaison } from '../../../shared/types';

interface VerbeIrregulierData {
  groupe: 1 | 2 | 3;
  auxiliaire: 'avoir' | 'être' | 'avoir ou être';
  radicaux?: Record<string, string>;
  formes?: Partial<FicheConjugaison['temps']>;
}

/**
 * Base de conjugaison des verbes irréguliers fréquents de la littérature française
 */
const VERBES_IRREGULIERS: Record<string, FicheConjugaison> = {
  être: {
    verbe: 'être',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['je suis', 'tu es', 'il/elle est', 'nous sommes', 'vous êtes', 'ils/elles sont'],
      indicatifImparfait: ['j’étais', 'tu étais', 'il/elle était', 'nous étions', 'vous étiez', 'ils/elles étaient'],
      indicatifPasseSimple: ['je fus', 'tu fus', 'il/elle fut', 'nous fûmes', 'vous fûtes', 'ils/elles furent'],
      indicatifFuturSimple: ['je serai', 'tu seras', 'il/elle sera', 'nous serons', 'vous serez', 'ils/elles seront'],
      indicatifPasseCompose: ['j’ai été', 'tu as été', 'il/elle a été', 'nous avons été', 'vous avez été', 'ils/elles ont été'],
      subjonctifPresent: ['que je sois', 'que tu sois', 'qu’il/elle soit', 'que nous soyons', 'que vous soyez', 'qu’ils/elles soient'],
      subjonctifImparfait: ['que je fusse', 'que tu fusses', 'qu’il/elle fût', 'que nous fussions', 'que vous fussiez', 'qu’ils/elles fussent'],
      conditionnelPresent: ['je serais', 'tu serais', 'il/elle serait', 'nous serions', 'vous seriez', 'ils/elles seraient'],
      imperatifPresent: ['sois', 'soyons', 'soyez'],
      participePresent: 'étant',
      participePasse: 'été'
    }
  },
  avoir: {
    verbe: 'avoir',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['j’ai', 'tu as', 'il/elle a', 'nous avons', 'vous avez', 'ils/elles ont'],
      indicatifImparfait: ['j’avais', 'tu avais', 'il/elle avait', 'nous avions', 'vous aviez', 'ils/elles avaient'],
      indicatifPasseSimple: ['j’eus', 'tu eus', 'il/elle eut', 'nous eûmes', 'vous eûtes', 'ils/elles eurent'],
      indicatifFuturSimple: ['j’aurai', 'tu auras', 'il/elle aura', 'nous aurons', 'vous aurez', 'ils/elles auront'],
      indicatifPasseCompose: ['j’ai eu', 'tu as eu', 'il/elle a eu', 'nous avons eu', 'vous avez eu', 'ils/elles ont eu'],
      subjonctifPresent: ['que j’aie', 'que tu aies', 'qu’il/elle ait', 'que nous ayons', 'que vous ayez', 'qu’ils/elles aient'],
      subjonctifImparfait: ['que j’eusse', 'que tu eusses', 'qu’il/elle eût', 'que nous eussions', 'que vous eussiez', 'qu’ils/elles eussent'],
      conditionnelPresent: ['j’aurais', 'tu aurais', 'il/elle aurait', 'nous aurions', 'vous auriez', 'ils/elles auraient'],
      imperatifPresent: ['aie', 'ayons', 'ayez'],
      participePresent: 'ayant',
      participePasse: 'eu'
    }
  },
  écrire: {
    verbe: 'écrire',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['j’écris', 'tu écris', 'il/elle écrit', 'nous écrivons', 'vous écrivez', 'ils/elles écrivent'],
      indicatifImparfait: ['j’écrivais', 'tu écrivais', 'il/elle écrivait', 'nous écrivions', 'vous écriviez', 'ils/elles écrivaient'],
      indicatifPasseSimple: ['j’écrivis', 'tu écrivis', 'il/elle écrivit', 'nous écrivîmes', 'vous écrivîtes', 'ils/elles écrivirent'],
      indicatifFuturSimple: ['j’écrirai', 'tu écriras', 'il/elle écrira', 'nous écrirons', 'vous écrirez', 'ils/elles écriront'],
      indicatifPasseCompose: ['j’ai écrit', 'tu as écrit', 'il/elle a écrit', 'nous avons écrit', 'vous avez écrit', 'ils/elles ont écrit'],
      subjonctifPresent: ['que j’écrive', 'que tu écrives', 'qu’il/elle écrive', 'que nous écrivions', 'que vous écriviez', 'qu’ils/elles écrivent'],
      subjonctifImparfait: ['que j’écrivisse', 'que tu écrivisses', 'qu’il/elle écrivît', 'que nous écrivissions', 'que vous écrivissiez', 'qu’ils/elles écrivissent'],
      conditionnelPresent: ['j’écrirais', 'tu écrirais', 'il/elle écrirait', 'nous écririons', 'vous écririez', 'ils/elles écriraient'],
      imperatifPresent: ['écris', 'écrivons', 'écrivez'],
      participePresent: 'écrivant',
      participePasse: 'écrit'
    }
  },
  faire: {
    verbe: 'faire',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['je fais', 'tu fais', 'il/elle fait', 'nous faisons', 'vous faites', 'ils/elles font'],
      indicatifImparfait: ['je faisais', 'tu faisais', 'il/elle faisait', 'nous faisions', 'vous faisiez', 'ils/elles faisaient'],
      indicatifPasseSimple: ['je fis', 'tu fis', 'il/elle fit', 'nous fîmes', 'vous fîtes', 'ils/elles firent'],
      indicatifFuturSimple: ['je ferai', 'tu feras', 'il/elle fera', 'nous ferons', 'vous ferez', 'ils/elles feront'],
      indicatifPasseCompose: ['j’ai fait', 'tu as fait', 'il/elle a fait', 'nous avons fait', 'vous avez fait', 'ils/elles ont fait'],
      subjonctifPresent: ['que je fasse', 'que tu fasses', 'qu’il/elle fasse', 'que nous fassions', 'que vous fassiez', 'qu’ils/elles fassent'],
      subjonctifImparfait: ['que je fisse', 'que tu fisses', 'qu’il/elle fît', 'que nous fissions', 'que vous fissiez', 'qu’ils/elles fissent'],
      conditionnelPresent: ['je ferais', 'tu ferais', 'il/elle ferait', 'nous ferions', 'vous feriez', 'ils/elles feraient'],
      imperatifPresent: ['fais', 'faisons', 'faites'],
      participePresent: 'faisant',
      participePasse: 'fait'
    }
  },
  dire: {
    verbe: 'dire',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['je dis', 'tu dis', 'il/elle dit', 'nous disons', 'vous dites', 'ils/elles disent'],
      indicatifImparfait: ['je disais', 'tu disais', 'il/elle disait', 'nous disions', 'vous disiez', 'ils/elles disaient'],
      indicatifPasseSimple: ['je dis', 'tu dis', 'il/elle dit', 'nous dîmes', 'vous dîtes', 'ils/elles dirent'],
      indicatifFuturSimple: ['je dirai', 'tu diras', 'il/elle dira', 'nous dirons', 'vous direz', 'ils/elles diront'],
      indicatifPasseCompose: ['j’ai dit', 'tu as dit', 'il/elle a dit', 'nous avons dit', 'vous avez dit', 'ils/elles ont dit'],
      subjonctifPresent: ['que je dise', 'que tu dises', 'qu’il/elle dise', 'que nous disions', 'que vous disiez', 'qu’ils/elles disent'],
      subjonctifImparfait: ['que je disse', 'que tu disses', 'qu’il/elle dît', 'que nous dissions', 'que vous dissiez', 'qu’ils/elles dissent'],
      conditionnelPresent: ['je dirais', 'tu dirais', 'il/elle dirait', 'nous dirions', 'vous diriez', 'ils/elles diraient'],
      imperatifPresent: ['dis', 'disons', 'dites'],
      participePresent: 'disant',
      participePasse: 'dit'
    }
  },
  aller: {
    verbe: 'aller',
    groupe: 3,
    auxiliaire: 'être',
    temps: {
      indicatifPresent: ['je vais', 'tu vas', 'il/elle va', 'nous allons', 'vous allez', 'ils/elles vont'],
      indicatifImparfait: ['j’allais', 'tu allais', 'il/elle allait', 'nous allions', 'vous alliez', 'ils/elles allaient'],
      indicatifPasseSimple: ['j’allai', 'tu allas', 'il/elle alla', 'nous allâmes', 'vous allâtes', 'ils/elles allèrent'],
      indicatifFuturSimple: ['j’irai', 'tu iras', 'il/elle ira', 'nous irons', 'vous irez', 'ils/elles iront'],
      indicatifPasseCompose: ['je suis allé(e)', 'tu es allé(e)', 'il/elle est allé(e)', 'nous sommes allé(e)s', 'vous êtes allé(e)s', 'ils/elles sont allé(e)s'],
      subjonctifPresent: ['que j’aille', 'que tu ailles', 'qu’il/elle aille', 'que nous allions', 'que vous alliez', 'qu’ils/elles aillent'],
      subjonctifImparfait: ['que j’allasse', 'que tu allasses', 'qu’il/elle allât', 'que nous allassions', 'que vous allassiez', 'qu’ils/elles allassent'],
      conditionnelPresent: ['j’irais', 'tu irais', 'il/elle irait', 'nous irions', 'vous iriez', 'ils/elles iraient'],
      imperatifPresent: ['va', 'allons', 'allez'],
      participePresent: 'allant',
      participePasse: 'allé'
    }
  },
  voir: {
    verbe: 'voir',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['je vois', 'tu vois', 'il/elle voit', 'nous voyons', 'vous voyez', 'ils/elles voient'],
      indicatifImparfait: ['je voyais', 'tu voyais', 'il/elle voyait', 'nous voyions', 'vous voyiez', 'ils/elles voyaient'],
      indicatifPasseSimple: ['je vis', 'tu vis', 'il/elle vit', 'nous vîmes', 'vous vîtes', 'ils/elles virent'],
      indicatifFuturSimple: ['je verrai', 'tu verras', 'il/elle verra', 'nous verrons', 'vous verrez', 'ils/elles verront'],
      indicatifPasseCompose: ['j’ai vu', 'tu as vu', 'il/elle a vu', 'nous avons vu', 'vous avez vu', 'ils/elles ont vu'],
      subjonctifPresent: ['que je voie', 'que tu voies', 'qu’il/elle voie', 'que nous voyions', 'que vous voyiez', 'qu’ils/elles voient'],
      subjonctifImparfait: ['que je visse', 'que tu visses', 'qu’il/elle vît', 'que nous vissions', 'que vous vissiez', 'qu’ils/elles vissent'],
      conditionnelPresent: ['je verrais', 'tu verrais', 'il/elle verrait', 'nous verrions', 'vous verriez', 'ils/elles verraient'],
      imperatifPresent: ['vois', 'voyons', 'voyez'],
      participePresent: 'voyant',
      participePasse: 'vu'
    }
  },
  prendre: {
    verbe: 'prendre',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['je prends', 'tu prends', 'il/elle prend', 'nous prenons', 'vous prenez', 'ils/elles prennent'],
      indicatifImparfait: ['je prenais', 'tu prenais', 'il/elle prenait', 'nous prenions', 'vous preniez', 'ils/elles prenaient'],
      indicatifPasseSimple: ['je pris', 'tu pris', 'il/elle prit', 'nous prîmes', 'vous prîtes', 'ils/elles prirent'],
      indicatifFuturSimple: ['je prendrai', 'tu prendras', 'il/elle prendra', 'nous prendrons', 'vous prendrez', 'ils/elles prendront'],
      indicatifPasseCompose: ['j’ai pris', 'tu as pris', 'il/elle a pris', 'nous avons pris', 'vous avez pris', 'ils/elles ont pris'],
      subjonctifPresent: ['que je prenne', 'que tu prennes', 'qu’il/elle prenne', 'que nous prenions', 'que vous preniez', 'qu’ils/elles prennent'],
      subjonctifImparfait: ['que je prisse', 'que tu prisses', 'qu’il/elle prît', 'que nous prissions', 'que vous prissiez', 'qu’ils/elles prissent'],
      conditionnelPresent: ['je prendrais', 'tu prendrais', 'il/elle prendrait', 'nous prendrions', 'vous prendriez', 'ils/elles prendraient'],
      imperatifPresent: ['prends', 'prenons', 'prenez'],
      participePresent: 'prenant',
      participePasse: 'pris'
    }
  },
  pouvoir: {
    verbe: 'pouvoir',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['je peux', 'tu peux', 'il/elle peut', 'nous pouvons', 'vous pouvez', 'ils/elles peuvent'],
      indicatifImparfait: ['je pouvais', 'tu pouvais', 'il/elle pouvait', 'nous pouvions', 'vous pouviez', 'ils/elles pouvaient'],
      indicatifPasseSimple: ['je pus', 'tu pus', 'il/elle put', 'nous pûmes', 'vous pûtes', 'ils/elles purent'],
      indicatifFuturSimple: ['je pourrai', 'tu pourras', 'il/elle pourra', 'nous pourrons', 'vous pourrez', 'ils/elles pourront'],
      indicatifPasseCompose: ['j’ai pu', 'tu as pu', 'il/elle a pu', 'nous avons pu', 'vous avez pu', 'ils/elles ont pu'],
      subjonctifPresent: ['que je puisse', 'que tu puisses', 'qu’il/elle puisse', 'que nous puissions', 'que vous puissiez', 'qu’ils/elles puissent'],
      subjonctifImparfait: ['que je pusse', 'que tu pusses', 'qu’il/elle pût', 'que nous pussions', 'que vous pussiez', 'qu’ils/elles pussent'],
      conditionnelPresent: ['je pourrais', 'tu pourrais', 'il/elle pourrait', 'nous pourrions', 'vous pourriez', 'ils/elles pourraient'],
      imperatifPresent: ['–', '–', '–'],
      participePresent: 'pouvant',
      participePasse: 'pu'
    }
  },
  vouloir: {
    verbe: 'vouloir',
    groupe: 3,
    auxiliaire: 'avoir',
    temps: {
      indicatifPresent: ['je veux', 'tu veux', 'il/elle veut', 'nous voulons', 'vous voulez', 'ils/elles veulent'],
      indicatifImparfait: ['je voulais', 'tu voulais', 'il/elle voulait', 'nous voulions', 'vous vouliez', 'ils/elles voulaient'],
      indicatifPasseSimple: ['je voulus', 'tu voulus', 'il/elle voulut', 'nous voulûmes', 'vous voulûtes', 'ils/elles voulurent'],
      indicatifFuturSimple: ['je voudrai', 'tu voudras', 'il/elle voudra', 'nous voudrons', 'vous voudrez', 'ils/elles voudront'],
      indicatifPasseCompose: ['j’ai voulu', 'tu as voulu', 'il/elle a voulu', 'nous avons voulu', 'vous avez voulu', 'ils/elles ont voulu'],
      subjonctifPresent: ['que je veuille', 'que tu veuilles', 'qu’il/elle veuille', 'que nous voulions', 'que vous vouliez', 'qu’ils/elles veuillent'],
      subjonctifImparfait: ['que je voulusse', 'que tu voulusses', 'qu’il/elle voulût', 'que nous voulussions', 'que vous voulussiez', 'qu’ils/elles voulussent'],
      conditionnelPresent: ['je voudrais', 'tu voudrais', 'il/elle voudrait', 'nous voudrions', 'vous voudriez', 'ils/elles voudraient'],
      imperatifPresent: ['veuille', 'voulons', 'veuillez'],
      participePresent: 'voulant',
      participePasse: 'voulu'
    }
  }
};

/**
 * Conjugueur automatique de verbes français
 */
export class ConjugationService {
  /**
   * Vérifie si un mot est un verbe et conjugue
   */
  public conjuguer(verbeSaisi: string): FicheConjugaison | null {
    if (!verbeSaisi) return null;
    const v = verbeSaisi.trim().toLowerCase();

    // Verbes irréguliers directs en base
    if (VERBES_IRREGULIERS[v]) {
      return VERBES_IRREGULIERS[v];
    }

    // Dérivés de prendre (apprendre, comprendre, surprendre, etc.)
    if (v.endsWith('prendre')) {
      const prefixe = v.slice(0, -7);
      const base = VERBES_IRREGULIERS['prendre'];
      return this.deriverConjugaison(base, prefixe, v);
    }

    // Dérivés de écrire (décrire, réécrire, prescrire, inscrire...)
    if (v.endsWith('crire')) {
      const base = VERBES_IRREGULIERS['écrire'];
      const prefixe = v.slice(0, -5); // ex: pour 'décrire' -> 'dé'
      return this.deriverConjugaisonEcrire(v);
    }

    // 1er Groupe (-er, sauf aller)
    if (v.endsWith('er') && v !== 'aller') {
      return this.conjuguerPremierGroupe(v);
    }

    // 2e Groupe (-ir type finir, grandir, pâlir)
    if (v.endsWith('ir') && this.estDeuxiemeGroupe(v)) {
      return this.conjuguerDeuxiemeGroupe(v);
    }

    // Verbes en -ir du 3e groupe simples (dormir, partir, sentir, servir)
    if (v.endsWith('tir') || v.endsWith('mir') || v.endsWith('vir')) {
      return this.conjuguerTroisiemeGroupeIr(v);
    }

    return null;
  }

  private estDeuxiemeGroupe(v: string): boolean {
    const exceptions3e = ['venir', 'tenir', 'courir', 'mourir', 'ouvrir', 'cueillir', 'assaillir', 'bouillir', 'dormir', 'partir', 'sentir', 'servir', 'fuir'];
    return !exceptions3e.some(ex => v.endsWith(ex));
  }

  private conjuguerPremierGroupe(verbe: string): FicheConjugaison {
    const radical = verbe.slice(0, -2);
    const voyelleInitiale = /^[aeiouyéèêh]/i.test(verbe);
    const je = voyelleInitiale ? "j’" : 'je ';
    const queJe = voyelleInitiale ? 'que j’' : 'que je ';

    // Gestion de 'manger' (nous mangeons), 'commencer' (nous commençons)
    const radG = verbe.endsWith('ger') ? radical + 'e' : radical;
    const radC = verbe.endsWith('cer') ? radical.slice(0, -1) + 'ç' : radical;

    return {
      verbe,
      groupe: 1,
      auxiliaire: 'avoir',
      temps: {
        indicatifPresent: [
          `${je}${radical}e`,
          `tu ${radical}es`,
          `il/elle ${radical}e`,
          `nous ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}ons`,
          `vous ${radical}ez`,
          `ils/elles ${radical}ent`
        ],
        indicatifImparfait: [
          `${je}${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}ais`,
          `tu ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}ais`,
          `il/elle ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}ait`,
          `nous ${radical}ions`,
          `vous ${radical}iez`,
          `ils/elles ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}aient`
        ],
        indicatifPasseSimple: [
          `${je}${verbe.endsWith('cer') ? radC : radical}ai`,
          `tu ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}as`,
          `il/elle ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}a`,
          `nous ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}âmes`,
          `vous ${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}âtes`,
          `ils/elles ${radical}èrent`
        ],
        indicatifFuturSimple: [
          `${je}${verbe}ai`,
          `tu ${verbe}as`,
          `il/elle ${verbe}a`,
          `nous ${verbe}ons`,
          `vous ${verbe}ez`,
          `ils/elles ${verbe}ont`
        ],
        indicatifPasseCompose: [
          `${voyelleInitiale ? "j’ai" : "j'ai"} ${radical}é`,
          `tu as ${radical}é`,
          `il/elle a ${radical}é`,
          `nous avons ${radical}é`,
          `vous avez ${radical}é`,
          `ils/elles ont ${radical}é`
        ],
        subjonctifPresent: [
          `${queJe}${radical}e`,
          `que tu ${radical}es`,
          `qu’il/elle ${radical}e`,
          `que nous ${radical}ions`,
          `que vous ${radical}iez`,
          `qu’ils/elles ${radical}ent`
        ],
        subjonctifImparfait: [
          `${queJe}${verbe.endsWith('cer') ? radC : radical}asse`,
          `que tu ${verbe.endsWith('cer') ? radC : radical}asses`,
          `qu’il/elle ${verbe.endsWith('cer') ? radC : radical}ât`,
          `que nous ${verbe.endsWith('cer') ? radC : radical}assions`,
          `que vous ${verbe.endsWith('cer') ? radC : radical}assiez`,
          `qu’ils/elles ${radical}assent`
        ],
        conditionnelPresent: [
          `${je}${verbe}ais`,
          `tu ${verbe}ais`,
          `il/elle ${verbe}ait`,
          `nous ${verbe}ions`,
          `vous ${verbe}iez`,
          `ils/elles ${verbe}aient`
        ],
        imperatifPresent: [
          `${radical}e`,
          `${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}ons`,
          `${radical}ez`
        ],
        participePresent: `${verbe.endsWith('ger') ? radG : verbe.endsWith('cer') ? radC : radical}ant`,
        participePasse: `${radical}é`
      }
    };
  }

  private conjuguerDeuxiemeGroupe(verbe: string): FicheConjugaison {
    const radical = verbe.slice(0, -2);
    const voyelleInitiale = /^[aeiouyéèêh]/i.test(verbe);
    const je = voyelleInitiale ? "j’" : 'je ';
    const queJe = voyelleInitiale ? 'que j’' : 'que je ';

    return {
      verbe,
      groupe: 2,
      auxiliaire: 'avoir',
      temps: {
        indicatifPresent: [
          `${je}${radical}is`,
          `tu ${radical}is`,
          `il/elle ${radical}it`,
          `nous ${radical}issons`,
          `vous ${radical}issez`,
          `ils/elles ${radical}issent`
        ],
        indicatifImparfait: [
          `${je}${radical}issais`,
          `tu ${radical}issais`,
          `il/elle ${radical}issait`,
          `nous ${radical}issions`,
          `vous ${radical}issiez`,
          `ils/elles ${radical}issaient`
        ],
        indicatifPasseSimple: [
          `${je}${radical}is`,
          `tu ${radical}is`,
          `il/elle ${radical}it`,
          `nous ${radical}îmes`,
          `vous ${radical}îtes`,
          `ils/elles ${radical}irent`
        ],
        indicatifFuturSimple: [
          `${je}${verbe}ai`,
          `tu ${verbe}as`,
          `il/elle ${verbe}a`,
          `nous ${verbe}ons`,
          `vous ${verbe}ez`,
          `ils/elles ${verbe}ont`
        ],
        indicatifPasseCompose: [
          `j’ai ${radical}i`,
          `tu as ${radical}i`,
          `il/elle a ${radical}i`,
          `nous avons ${radical}i`,
          `vous avez ${radical}i`,
          `ils/elles ont ${radical}i`
        ],
        subjonctifPresent: [
          `${queJe}${radical}isse`,
          `que tu ${radical}isses`,
          `qu’il/elle ${radical}isse`,
          `que nous ${radical}issions`,
          `que vous ${radical}issiez`,
          `qu’ils/elles ${radical}issent`
        ],
        subjonctifImparfait: [
          `${queJe}${radical}isse`,
          `que tu ${radical}isses`,
          `qu’il/elle ${radical}ît`,
          `que nous ${radical}issions`,
          `que vous ${radical}issiez`,
          `qu’ils/elles ${radical}issent`
        ],
        conditionnelPresent: [
          `${je}${verbe}ais`,
          `tu ${verbe}ais`,
          `il/elle ${verbe}ait`,
          `nous ${verbe}ions`,
          `vous ${verbe}iez`,
          `ils/elles ${verbe}aient`
        ],
        imperatifPresent: [`${radical}is`, `${radical}issons`, `${radical}issez`],
        participePresent: `${radical}issant`,
        participePasse: `${radical}i`
      }
    };
  }

  private conjuguerTroisiemeGroupeIr(verbe: string): FicheConjugaison {
    // Verbes comme partir (part- / par-), dormir (dorm- / dor-)
    const racineCourt = verbe.slice(0, -3);
    const racineLong = verbe.slice(0, -2);
    const je = /^[aeiouyéèêh]/i.test(verbe) ? "j’" : 'je ';
    const queJe = /^[aeiouyéèêh]/i.test(verbe) ? 'que j’' : 'que je ';

    return {
      verbe,
      groupe: 3,
      auxiliaire: verbe === 'partir' ? 'être' : 'avoir',
      temps: {
        indicatifPresent: [
          `${je}${racineCourt}s`,
          `tu ${racineCourt}s`,
          `il/elle ${racineCourt}t`,
          `nous ${racineLong}ons`,
          `vous ${racineLong}ez`,
          `ils/elles ${racineLong}ent`
        ],
        indicatifImparfait: [
          `${je}${racineLong}ais`,
          `tu ${racineLong}ais`,
          `il/elle ${racineLong}ait`,
          `nous ${racineLong}ions`,
          `vous ${racineLong}iez`,
          `ils/elles ${racineLong}aient`
        ],
        indicatifPasseSimple: [
          `${je}${racineLong}is`,
          `tu ${racineLong}is`,
          `il/elle ${racineLong}it`,
          `nous ${racineLong}îmes`,
          `vous ${racineLong}îtes`,
          `ils/elles ${racineLong}irent`
        ],
        indicatifFuturSimple: [
          `${je}${verbe}ai`,
          `tu ${verbe}as`,
          `il/elle ${verbe}a`,
          `nous ${verbe}ons`,
          `vous ${verbe}ez`,
          `ils/elles ${verbe}ont`
        ],
        indicatifPasseCompose: [
          verbe === 'partir' ? 'je suis parti(e)' : `j’ai ${racineLong}i`,
          verbe === 'partir' ? 'tu es parti(e)' : `tu as ${racineLong}i`,
          verbe === 'partir' ? 'il/elle est parti(e)' : `il/elle a ${racineLong}i`,
          verbe === 'partir' ? 'nous sommes parti(e)s' : `nous avons ${racineLong}i`,
          verbe === 'partir' ? 'vous êtes parti(e)s' : `vous avez ${racineLong}i`,
          verbe === 'partir' ? 'ils/elles sont parti(e)s' : `ils/elles ont ${racineLong}i`
        ],
        subjonctifPresent: [
          `${queJe}${racineLong}e`,
          `que tu ${racineLong}es`,
          `qu’il/elle ${racineLong}e`,
          `que nous ${racineLong}ions`,
          `que vous ${racineLong}iez`,
          `qu’ils/elles ${racineLong}ent`
        ],
        subjonctifImparfait: [
          `${queJe}${racineLong}isse`,
          `que tu ${racineLong}isses`,
          `qu’il/elle ${racineLong}ît`,
          `que nous ${racineLong}issions`,
          `que vous ${racineLong}issiez`,
          `qu’ils/elles ${racineLong}issent`
        ],
        conditionnelPresent: [
          `${je}${verbe}ais`,
          `tu ${verbe}ais`,
          `il/elle ${verbe}ait`,
          `nous ${verbe}ions`,
          `vous ${verbe}iez`,
          `ils/elles ${verbe}aient`
        ],
        imperatifPresent: [`${racineCourt}s`, `${racineLong}ons`, `${racineLong}ez`],
        participePresent: `${racineLong}ant`,
        participePasse: `${racineLong}i`
      }
    };
  }

  private deriverConjugaison(base: FicheConjugaison, prefixe: string, nouveauVerbe: string): FicheConjugaison {
    const adapter = (phrase: string): string => {
      return phrase.replace(/prend/g, `${prefixe}prend`).replace(/pren/g, `${prefixe}pren`).replace(/pri/g, `${prefixe}pri`);
    };

    return {
      verbe: nouveauVerbe,
      groupe: base.groupe,
      auxiliaire: base.auxiliaire,
      temps: {
        indicatifPresent: base.temps.indicatifPresent.map(adapter),
        indicatifImparfait: base.temps.indicatifImparfait.map(adapter),
        indicatifPasseSimple: base.temps.indicatifPasseSimple.map(adapter),
        indicatifFuturSimple: base.temps.indicatifFuturSimple.map(adapter),
        indicatifPasseCompose: base.temps.indicatifPasseCompose.map(adapter),
        subjonctifPresent: base.temps.subjonctifPresent.map(adapter),
        subjonctifImparfait: base.temps.subjonctifImparfait.map(adapter),
        conditionnelPresent: base.temps.conditionnelPresent.map(adapter),
        imperatifPresent: base.temps.imperatifPresent.map(adapter),
        participePresent: adapter(base.temps.participePresent),
        participePasse: adapter(base.temps.participePasse)
      }
    };
  }

  private deriverConjugaisonEcrire(nouveauVerbe: string): FicheConjugaison {
    const radical = nouveauVerbe.slice(0, -5); // pour 'décrire' -> 'dé'
    const voyelleInitiale = /^[aeiouyéèêh]/i.test(radical);
    const je = voyelleInitiale ? "j’" : 'je ';
    const queJe = voyelleInitiale ? 'que j’' : 'que je ';

    return {
      verbe: nouveauVerbe,
      groupe: 3,
      auxiliaire: 'avoir',
      temps: {
        indicatifPresent: [
          `${je}${radical}cris`,
          `tu ${radical}cris`,
          `il/elle ${radical}crit`,
          `nous ${radical}crivons`,
          `vous ${radical}crivez`,
          `ils/elles ${radical}crivent`
        ],
        indicatifImparfait: [
          `${je}${radical}crivais`,
          `tu ${radical}crivais`,
          `il/elle ${radical}crivait`,
          `nous ${radical}crivions`,
          `vous ${radical}criviez`,
          `ils/elles ${radical}crivaient`
        ],
        indicatifPasseSimple: [
          `${je}${radical}crivis`,
          `tu ${radical}crivis`,
          `il/elle ${radical}crivit`,
          `nous ${radical}crivîmes`,
          `vous ${radical}crivîtes`,
          `ils/elles ${radical}crivirent`
        ],
        indicatifFuturSimple: [
          `${je}${radical}crirai`,
          `tu ${radical}criras`,
          `il/elle ${radical}crira`,
          `nous ${radical}crirons`,
          `vous ${radical}crirez`,
          `ils/elles ${radical}criront`
        ],
        indicatifPasseCompose: [
          `j’ai ${radical}crit`,
          `tu as ${radical}crit`,
          `il/elle a ${radical}crit`,
          `nous avons ${radical}crit`,
          `vous avez ${radical}crit`,
          `ils/elles ont ${radical}crit`
        ],
        subjonctifPresent: [
          `${queJe}${radical}crive`,
          `que tu ${radical}crives`,
          `qu’il/elle ${radical}crive`,
          `que nous ${radical}crivions`,
          `que vous ${radical}criviez`,
          `qu’ils/elles ${radical}crivent`
        ],
        subjonctifImparfait: [
          `${queJe}${radical}crivisse`,
          `que tu ${radical}crivisses`,
          `qu’il/elle ${radical}crivît`,
          `que nous ${radical}crivissions`,
          `que vous ${radical}crivissiez`,
          `qu’ils/elles ${radical}crivissent`
        ],
        conditionnelPresent: [
          `${je}${radical}crirais`,
          `tu ${radical}crirais`,
          `il/elle ${radical}crirait`,
          `nous ${radical}cririons`,
          `vous ${radical}cririez`,
          `ils/elles ${radical}criraient`
        ],
        imperatifPresent: [`${radical}cris`, `${radical}crivons`, `${radical}crivez`],
        participePresent: `${radical}crivant`,
        participePasse: `${radical}crit`
      }
    };
  }
}

export const conjugationService = new ConjugationService();
