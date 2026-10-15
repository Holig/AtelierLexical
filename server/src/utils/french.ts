/**
 * Utilitaires pour la langue française
 * Normalisation d'accents, apostrophes, ligatures et détection grammaticale
 */

/**
 * Normalise une chaîne de recherche :
 * - Minuscules
 * - Remplace ligatures æ -> ae, œ -> oe
 * - Supprime les apostrophes initiales d'élision (l', d', s', qu', n', j', c', m', t')
 * - Nettoie les espaces superflus
 */
export function normaliserMotRecherche(saisie: string): string {
  if (!saisie) return '';
  let mot = saisie.trim().toLowerCase();

  // Remplacement des ligatures
  mot = mot.replace(/œ/g, 'oe').replace(/æ/g, 'ae');

  // Remplacement des apostrophes typographiques par l'apostrophe standard
  mot = mot.replace(/[’']/g, "'");

  // Suppression des élisions courantes en début de recherche : l'amour -> amour, d'écrire -> écrire
  mot = mot.replace(/^(?:[ldjsnmct]'|qu'|l’|d’|s’|qu’)/i, '');

  return mot.trim();
}

/**
 * Retire les accents pour la recherche tolérante
 */
export function supprimerAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Nettoie les liens wikitext [[mot|texte]] ou [[mot]] et balises html simples
 */
export function nettoyerWikitext(texte: string): string {
  if (!texte) return '';
  let resultat = texte;

  // Traiter spécifiquement les modèles d'exemples {{exemple|...}}
  resultat = resultat.replace(/\{\{exemple\|([\s\S]*?)\}\}/gi, (_match, contenu) => {
    const parties = contenu.split('|');
    for (const p of parties) {
      const trimmed = p.trim();
      if (trimmed.startsWith('1=')) {
        return trimmed.substring(2).trim();
      }
      if (!trimmed.includes('=') && trimmed.length > 5 && !trimmed.toLowerCase().startsWith('lang')) {
        return trimmed;
      }
    }
    return '';
  });

  // Résoudre les templates imbriqués {{lien|...}}, {{w|...}} ou supprimer les métadonnées {{...}}
  while (/\{\{[^{}]*\}\}/.test(resultat)) {
    resultat = resultat.replace(/\{\{(?:lien|w|m|terme)\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1');
    resultat = resultat.replace(/\{\{[^{}]*\}\}/g, ' ');
  }

  // Liens [[cible|affichage]] -> affichage
  resultat = resultat.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1');

  // Balises HTML <...>
  resultat = resultat.replace(/<[^>]+>/g, '');

  // Gras et italique wikitext ('''mot''' ou ''mot'')
  resultat = resultat.replace(/'''?/g, '');

  // Apostrophes typographiques
  resultat = resultat.replace(/’/g, "'");

  // Espaces insécables et multiples
  resultat = resultat.replace(/&nbsp;|\u00a0/g, ' ');
  resultat = resultat.replace(/\s+/g, ' ');

  // Supprimer d'éventuels résidus d'accolades ou de crochets
  resultat = resultat.replace(/^[{}\[\]\s]+|[{}\[\]\s]+$/g, '');

  return resultat.trim();
}

/**
 * Calcule la distance de Levenshtein pour la suggestion en cas de faute de frappe
 */
export function distanceLevenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // suppression
        );
      }
    }
  }

  return matrix[bn][an];
}
