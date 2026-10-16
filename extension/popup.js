const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
const DEFAULT_BASE_URL = 'http://localhost:5173';

const form = document.getElementById('quick-search-form');
const inputWord = document.getElementById('quick-word');
const btnOpenApp = document.getElementById('open-app');
const btnOpenOptions = document.getElementById('open-options');

function getBaseUrl(callback) {
  const storageArea = browserAPI.storage?.sync || browserAPI.storage?.local;
  if (storageArea) {
    storageArea.get({ baseUrl: DEFAULT_BASE_URL }, (items) => {
      callback((items && items.baseUrl) ? items.baseUrl.replace(/\/+$/, '') : DEFAULT_BASE_URL);
    });
  } else {
    callback(DEFAULT_BASE_URL);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const mot = inputWord.value.trim();
  if (!mot) return;

  getBaseUrl((baseUrl) => {
    const targetUrl = `${baseUrl}/?q=${encodeURIComponent(mot)}`;
    browserAPI.tabs.create({ url: targetUrl });
    window.close();
  });
});

btnOpenApp.addEventListener('click', (e) => {
  e.preventDefault();
  getBaseUrl((baseUrl) => {
    browserAPI.tabs.create({ url: baseUrl });
    window.close();
  });
});

btnOpenOptions.addEventListener('click', (e) => {
  e.preventDefault();
  if (browserAPI.runtime.openOptionsPage) {
    browserAPI.runtime.openOptionsPage();
  } else {
    window.open('options.html');
  }
});
