/**
 * Atelier Lexical — Extension pour navigateur (Chrome & Firefox)
 * Script d'arrière-plan (Service Worker / Background Script)
 */

// Utilitaire d'abstraction cross-browser pour Chrome et Firefox
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const DEFAULT_BASE_URL = 'http://localhost:5173';
const CONTEXT_MENU_ID = 'rechercher-atelier-lexical';

/**
 * Nettoyage et normalisation du texte sélectionné :
 * - Retire les espaces, tabulations et sauts de ligne superflus
 * - Retire la ponctuation encadrante (« » " ' . , ; : ! ? ( ) [ ] { })
 * - Retire les élisions initiales fréquentes si l'utilisateur a sélectionné l'article (l', d', s', c', qu', etc.)
 * - Limite la longueur maximale pour éviter d'envoyer un paragraphe entier
 */
function nettoyerSelection(texte) {
  if (!texte || typeof texte !== 'string') return '';

  let propre = texte.trim();
  if (!propre) return '';

  // Suppression des guillemets et parenthèses encadrantes
  propre = propre.replace(/^[«"'({\[\s]+|[»"')}\]\s.,;:!?]+$/g, '');

  // Si l'utilisateur a sélectionné avec l'article élidé au début (ex: "l'aventure", "d’écriture")
  const regexElision = /^(?:[ldscnjmLDSCNJM]|qu|QU)['’](.+)$/i;
  const matchElision = propre.match(regexElision);
  if (matchElision && matchElision[1] && matchElision[1].trim().length > 1) {
    propre = matchElision[1].trim();
  }

  // Si la sélection est une phrase longue ou un paragraphe, on garde les premiers mots (max 60 caractères)
  if (propre.length > 60) {
    propre = propre.slice(0, 60).replace(/\s+\S*$/, '');
  }

  return propre.trim();
}

/**
 * Initialisation du menu contextuel
 */
function setupContextMenu() {
  try {
    browserAPI.contextMenus.removeAll(() => {
      browserAPI.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: "Rechercher « %s » dans l'Atelier Lexical",
        contexts: ["selection"]
      }, () => {
        if (browserAPI.runtime.lastError) {
          console.debug('Context menu notice:', browserAPI.runtime.lastError.message);
        }
      });
    });
  } catch (e) {
    console.error('Erreur initialisation contextMenus:', e);
  }
}

// Enregistrement au chargement / installation
browserAPI.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

// Écoute du clic sur le menu contextuel
browserAPI.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    const rawText = info.selectionText || '';
    const motNettoye = nettoyerSelection(rawText);

    if (!motNettoye) {
      console.warn('Sélection vide ou invalide pour l\'Atelier Lexical.');
      return;
    }

    // Récupération de l'URL du serveur configurée dans les options
    const storageArea = browserAPI.storage?.sync || browserAPI.storage?.local;

    if (storageArea) {
      storageArea.get({ baseUrl: DEFAULT_BASE_URL }, (items) => {
        const rawBase = (items && items.baseUrl) ? items.baseUrl : DEFAULT_BASE_URL;
        const baseUrl = rawBase.trim().replace(/\/+$/, '');
        const targetUrl = `${baseUrl}/?q=${encodeURIComponent(motNettoye)}`;

        browserAPI.tabs.create({ url: targetUrl });
      });
    } else {
      const targetUrl = `${DEFAULT_BASE_URL}/?q=${encodeURIComponent(motNettoye)}`;
      browserAPI.tabs.create({ url: targetUrl });
    }
  }
});
