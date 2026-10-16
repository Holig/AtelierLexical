import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const extensionDir = path.join(rootDir, 'extension');
const distDir = path.join(rootDir, 'dist');
const zipOutput = path.join(distDir, 'atelier-lexical-extension.zip');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('📦 Création de l\'archive de l\'extension...');

try {
  // Utilisation de PowerShell Compress-Archive sous Windows
  if (process.platform === 'win32') {
    const cmd = `powershell -Command "Compress-Archive -Path '${extensionDir}\\*' -DestinationPath '${zipOutput}' -Force"`;
    execSync(cmd, { stdio: 'inherit' });
  } else {
    // Unix/Linux fallback
    execSync(`cd "${extensionDir}" && zip -r "${zipOutput}" ./*`, { stdio: 'inherit' });
  }

  const stat = fs.statSync(zipOutput);
  console.log(`✓ Extension packagée avec succès : dist/atelier-lexical-extension.zip (${(stat.size / 1024).toFixed(1)} Ko)`);

  // Copie dans public/ pour servir le téléchargement direct
  const publicDir = path.join(rootDir, 'public');
  if (fs.existsSync(publicDir)) {
    fs.copyFileSync(zipOutput, path.join(publicDir, 'atelier-lexical-extension.zip'));
    console.log('✓ Archive copiée dans public/atelier-lexical-extension.zip');
  }
} catch (err) {
  console.error('Erreur lors de la création du zip:', err);
}
