import { describe, it, expect } from 'vitest';
import { normaliserMotRecherche, supprimerAccents, distanceLevenshtein } from '../server/src/utils/french';
import { conjugationService } from '../server/src/services/conjugation.service';
import { nuanceService } from '../server/src/services/nuance.service';
import { lexiconService } from '../server/src/services/lexicon.service';

describe('1. Normalisation et utilitaires de langue française', () => {
  it('doit normaliser les élisions et apostrophes (l\', d\', s\', qu\')', () => {
    expect(normaliserMotRecherche("l'amour")).toBe('amour');
    expect(normaliserMotRecherche("d'écrire")).toBe('écrire');
    expect(normaliserMotRecherche("s'enfuir")).toBe('enfuir');
    expect(normaliserMotRecherche("qu'importe")).toBe('importe');
    expect(normaliserMotRecherche("l’arbre")).toBe('arbre'); // apostrophe typographique
  });

  it('doit gérer les ligatures œ et æ', () => {
    expect(normaliserMotRecherche('cœur')).toBe('coeur');
    expect(normaliserMotRecherche('ex æquo')).toBe('ex aequo');
  });

  it('doit supprimer les accents correctement', () => {
    expect(supprimerAccents('colère')).toBe('colere');
    expect(supprimerAccents('forêt')).toBe('foret');
    expect(supprimerAccents('éphémère')).toBe('ephemere');
  });

  it('doit calculer la distance de Levenshtein pour les suggestions en cas de faute', () => {
    expect(distanceLevenshtein('colere', 'colère')).toBe(1); // 1 substitution d'accent
    expect(distanceLevenshtein('arbre', 'abre')).toBe(1); // 1 omission
    expect(distanceLevenshtein('chat', 'chat')).toBe(0);
  });
});

describe('2. Moteur de conjugaison française', () => {
  it('doit conjuguer un verbe du 1er groupe (ex: chanter)', () => {
    const res = conjugationService.conjuguer('chanter');
    expect(res).not.toBeNull();
    expect(res?.groupe).toBe(1);
    expect(res?.temps.indicatifPresent).toContain('je chante');
    expect(res?.temps.indicatifPresent).toContain('nous chantons');
    expect(res?.temps.indicatifPasseSimple).toContain('je chantai');
    expect(res?.temps.subjonctifPresent).toContain('que je chante');
    expect(res?.temps.participePresent).toBe('chantant');
    expect(res?.temps.participePasse).toBe('chanté');
  });

  it('doit conjuguer un verbe en -ger (ex: manger) avec le "e" euphonique', () => {
    const res = conjugationService.conjuguer('manger');
    expect(res).not.toBeNull();
    expect(res?.temps.indicatifPresent).toContain('nous mangeons');
    expect(res?.temps.indicatifImparfait).toContain('je mangeais');
    expect(res?.temps.participePresent).toBe('mangeant');
  });

  it('doit conjuguer un verbe du 2e groupe (ex: finir)', () => {
    const res = conjugationService.conjuguer('finir');
    expect(res).not.toBeNull();
    expect(res?.groupe).toBe(2);
    expect(res?.temps.indicatifPresent).toContain('je finis');
    expect(res?.temps.indicatifPresent).toContain('nous finissons');
    expect(res?.temps.participePresent).toBe('finissant');
  });

  it('doit conjuguer les verbes irréguliers littéraires fondamentaux (être, avoir, écrire, faire, dire)', () => {
    const etre = conjugationService.conjuguer('être');
    expect(etre?.temps.indicatifPresent).toContain('je suis');
    expect(etre?.temps.indicatifPasseSimple).toContain('ils/elles furent');
    expect(etre?.temps.subjonctifImparfait).toContain('qu’il/elle fût');

    const ecrire = conjugationService.conjuguer('écrire');
    expect(ecrire?.temps.indicatifPresent).toContain('j’écris');
    expect(ecrire?.temps.indicatifPasseSimple).toContain('j’écrivis');
    expect(ecrire?.temps.participePasse).toBe('écrit');

    const faire = conjugationService.conjuguer('faire');
    expect(faire?.temps.indicatifPresent).toContain('nous faisons');
    expect(faire?.temps.indicatifPresent).toContain('vous faites');
    expect(faire?.temps.indicatifPresent).toContain('ils/elles font');
  });
});

describe('3. Moteur de nuances et recherche par intention', () => {
  it('doit enrichir les synonymes avec intensité, registre et nuance pour des synonymes réels', () => {
    const syns = nuanceService.enrichirSynonymes('colère', ['fureur', 'courroux', 'rage', 'irritation', 'emportement']);
    expect(syns.length).toBeGreaterThanOrEqual(5);

    // Vérifier présence de fureur avec intensité 4
    const fureur = syns.find(s => s.mot === 'fureur');
    expect(fureur).toBeDefined();
    expect(fureur?.intensite).toBe(4);

    // Vérifier présence d'irritation avec intensité 1
    const irritation = syns.find(s => s.mot === 'irritation');
    expect(irritation).toBeDefined();
    expect(irritation?.intensite).toBe(1);
  });

  it('doit répondre pertinemment à une intention d\'écriture sur la peur soudaine et paralysante', () => {
    const reponse = nuanceService.chercherParIntention({
      idee: 'peur soudaine qui paralyse un personnage',
      emotion: 'angoisse',
      contexteNarratif: 'psychologique'
    });

    expect(reponse.motsProposes.length).toBeGreaterThanOrEqual(3);
    const mots = reponse.motsProposes.map(p => p.mot);
    expect(mots.some(m => ['sidération', 'effroi', 'pétrifier', 'stupeur'].includes(m))).toBe(true);

    const sideration = reponse.motsProposes.find(p => p.mot === 'sidération');
    expect(sideration?.intensite).toBe(4);
    expect(sideration?.exemplePhrase).toBeTruthy();
  });

  it('doit répondre pertinemment pour remplacer le verbe dire dans un dialogue', () => {
    const reponse = nuanceService.chercherParIntention({
      idee: 'remplacer le verbe dire dans un dialogue tendu',
      contexteNarratif: 'dialogue'
    });

    const mots = reponse.motsProposes.map(p => p.mot);
    expect(mots.some(m => ['rétorquer', 'asséner', 'chuchoter', 'bredouiller'].includes(m))).toBe(true);
  });
});

describe('4. Service lexical & sources vérifiables', () => {
  it('doit fournir une fiche complète avec sources CC BY-SA pour un terme réel (colère)', async () => {
    const fiche = await lexiconService.getFicheLexicale('colère');
    expect(fiche).not.toBeNull();
    expect(fiche?.mot).toBe('colère');
    expect(fiche?.definitions.length).toBeGreaterThan(0);
    expect(fiche?.synonymes.length).toBeGreaterThan(0);
    expect(fiche?.exemplesLitteraires.length).toBeGreaterThan(0);

    // Vérifier attributions et licences réelles
    const sourceWiktionnaire = fiche?.sources.find(s => s.nom.includes('Wiktionnaire'));
    expect(sourceWiktionnaire).toBeDefined();
    expect(sourceWiktionnaire?.licence).toContain('CC BY-SA 4.0');
  });

  it('doit résoudre automatiquement une forme fléchie (ex: écrivait -> écrire)', async () => {
    const fiche = await lexiconService.getFicheLexicale('écrivait');
    expect(fiche).not.toBeNull();
    expect(fiche?.mot.toLowerCase()).toBe('écrire');
    expect(fiche?.explicationForme).toContain('écrire');
    expect(fiche?.motSaisiOriginal).toBe('écrivait');
  });

  it('doit corriger automatiquement une faute de frappe proche (ex: labyrynthe -> labyrinthe)', async () => {
    const fiche = await lexiconService.getFicheLexicale('labyrynthe');
    expect(fiche).not.toBeNull();
    expect(fiche?.mot.toLowerCase()).toBe('labyrinthe');
    expect(fiche?.explicationForme).toContain('labyrynthe');
  });

  it('doit renvoyer null pour un terme inexistant afin de ne jamais inventer de fausses données', async () => {
    const fiche = await lexiconService.getFicheLexicale('chronosensible');
    expect(fiche).toBeNull();
  });
});

describe('5. Configuration du don & Sécurité de l\'administration', () => {
  it('doit valider strictement les URLs HTTPS et rejeter les protocoles dangereux', async () => {
    const { configService } = await import('../server/src/services/config.service');

    // Valide : URL HTTPS absolue
    expect(configService.validateDonationUrl('https://ko-fi.com/monprojet').isValid).toBe(true);
    expect(configService.validateDonationUrl('https://fr.tipeee.com/monprojet').isValid).toBe(true);

    // Valide : URL vide ou null (permet de désactiver)
    expect(configService.validateDonationUrl('').isValid).toBe(true);
    expect(configService.validateDonationUrl(null).isValid).toBe(true);

    // Invalide : protocoles dangereux
    expect(configService.validateDonationUrl('javascript:alert(1)').isValid).toBe(false);
    expect(configService.validateDonationUrl('data:text/html,hack').isValid).toBe(false);

    // Invalide : HTTP non sécurisé externe
    expect(configService.validateDonationUrl('http://insecure-site.com/don').isValid).toBe(false);

    // Invalide : chaîne quelconque sans protocole
    expect(configService.validateDonationUrl('ko-fi.com/monprojet').isValid).toBe(false);
    expect(configService.validateDonationUrl('not a url').isValid).toBe(false);
  });

  it('doit authentifier l\'administrateur et rejeter les mauvais mots de passe', async () => {
    const { configService } = await import('../server/src/services/config.service');

    // Mauvais mot de passe
    const failRes = configService.authenticateAdmin('mauvais_mot_de_passe');
    expect(failRes.success).toBe(false);
    expect(failRes.token).toBeUndefined();

    // Bon mot de passe
    const validPassword = process.env.ADMIN_PASSWORD || 'atelier-lexical-admin-2026';
    const successRes = configService.authenticateAdmin(validPassword);
    expect(successRes.success).toBe(true);
    expect(successRes.token).toBeDefined();

    // Validation du token émis
    expect(configService.verifyAdminToken(successRes.token)).toBe(true);
    expect(configService.verifyAdminToken('faux-token')).toBe(false);

    // Révocation de session
    if (successRes.token) {
      configService.revokeToken(successRes.token);
      expect(configService.verifyAdminToken(successRes.token)).toBe(false);
    }
  });

  it('doit mettre à jour, persister et réinitialiser la configuration de don', async () => {
    const { configService } = await import('../server/src/services/config.service');

    // Mise à jour avec URL valide
    const updateRes = configService.updateDonationConfig({
      enabled: true,
      url: 'https://ko-fi.com/atelierlexical',
      label: 'Offrir un café à l\'Atelier'
    });
    expect(updateRes.success).toBe(true);
    expect(updateRes.config?.enabled).toBe(true);
    expect(updateRes.config?.url).toBe('https://ko-fi.com/atelierlexical');
    expect(updateRes.config?.label).toBe('Offrir un café à l\'Atelier');

    // Configuration publique (visible sur la landing page)
    const pub = configService.getPublicDonationConfig();
    expect(pub.enabled).toBe(true);
    expect(pub.url).toBe('https://ko-fi.com/atelierlexical');
    expect(pub.label).toBe('Offrir un café à l\'Atelier');

    // Réinitialisation
    const resetRes = configService.resetDonationConfig();
    expect(resetRes.enabled).toBe(false);
    expect(resetRes.url).toBeNull();

    const pubAfterReset = configService.getPublicDonationConfig();
    expect(pubAfterReset.enabled).toBe(false);
    expect(pubAfterReset.url).toBeNull();
  });
});

describe('6. Extension pour navigateur : Normalisation du texte sélectionné', () => {
  // Teste la logique de normalisation de l'extension
  function nettoyerSelectionExtension(texte: string): string {
    if (!texte || typeof texte !== 'string') return '';
    let propre = texte.trim();
    if (!propre) return '';
    propre = propre.replace(/^[«"'({\[\s]+|[»"')}\]\s.,;:!?]+$/g, '');
    const regexElision = /^(?:[ldscnjmLDSCNJM]|qu|QU)['’](.+)$/i;
    const matchElision = propre.match(regexElision);
    if (matchElision && matchElision[1] && matchElision[1].trim().length > 1) {
      propre = matchElision[1].trim();
    }
    if (propre.length > 60) {
      propre = propre.slice(0, 60).replace(/\s+\S*$/, '');
    }
    return propre.trim();
  }

  it('doit nettoyer la ponctuation et guillemets encadrants', () => {
    expect(nettoyerSelectionExtension('« clair-obscur »')).toBe('clair-obscur');
    expect(nettoyerSelectionExtension('"silence",')).toBe('silence');
    expect(nettoyerSelectionExtension('(mélancolie)...')).toBe('mélancolie');
  });

  it('doit extraire le mot d\'une élision française avec apostrophe droite ou typographique', () => {
    expect(nettoyerSelectionExtension("l'aventure")).toBe('aventure');
    expect(nettoyerSelectionExtension("d’écriture")).toBe('écriture');
    expect(nettoyerSelectionExtension("s'enfuir")).toBe('enfuir');
    expect(nettoyerSelectionExtension("qu'importe")).toBe('importe');
  });

  it('doit préserver les accents, les ligatures et les tirets de mots composés', () => {
    expect(nettoyerSelectionExtension('clair-obscur')).toBe('clair-obscur');
    expect(nettoyerSelectionExtension('cœur')).toBe('cœur');
    expect(nettoyerSelectionExtension('éphémère')).toBe('éphémère');
  });
});

