const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
const DEFAULT_BASE_URL = 'http://localhost:5173';

const inputBaseUrl = document.getElementById('baseUrl');
const form = document.getElementById('options-form');
const btnReset = document.getElementById('btn-reset');
const statusDiv = document.getElementById('status');

function showStatus(text, isError = false) {
  statusDiv.textContent = text;
  statusDiv.className = isError ? 'status error' : 'status success';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 4000);
}

// Chargement initial
const storageArea = browserAPI.storage?.sync || browserAPI.storage?.local;

if (storageArea) {
  storageArea.get({ baseUrl: DEFAULT_BASE_URL }, (items) => {
    inputBaseUrl.value = items.baseUrl || DEFAULT_BASE_URL;
  });
} else {
  inputBaseUrl.value = DEFAULT_BASE_URL;
}

// Enregistrement
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let val = inputBaseUrl.value.trim().replace(/\/+$/, '');
  if (!val) {
    val = DEFAULT_BASE_URL;
  }

  try {
    const parsed = new URL(val);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      showStatus('Protocole non supporté (http:// ou https:// requis)', true);
      return;
    }
  } catch {
    showStatus('Format d\'URL invalide', true);
    return;
  }

  if (storageArea) {
    storageArea.set({ baseUrl: val }, () => {
      showStatus('Configuration enregistrée avec succès !');
    });
  } else {
    showStatus('Erreur de stockage du navigateur', true);
  }
});

// Réinitialisation
btnReset.addEventListener('click', () => {
  inputBaseUrl.value = DEFAULT_BASE_URL;
  if (storageArea) {
    storageArea.set({ baseUrl: DEFAULT_BASE_URL }, () => {
      showStatus('Réinitialisé à l\'adresse par défaut (http://localhost:5173).');
    });
  }
});
