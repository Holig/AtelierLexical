import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { lexiqueRouter } from './routes/lexique.routes';
import { donationRouter } from './routes/donation.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares fondamentaux
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Journalisation légère des requêtes
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString('fr-FR')}] ${req.method} ${req.path}`);
  }
  next();
});

// Montage de l'API
app.use('/api', lexiqueRouter);
app.use('/api', donationRouter);

// Servir le client en production si le dossier dist existe
const clientDistPath = path.resolve(__dirname, '../../dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send('Atelier Lexical API opérationnelle sur le port ' + PORT);
    }
  });
});

app.listen(PORT, () => {
  console.log(`✨ Serveur Atelier Lexical démarré sur http://localhost:${PORT}`);
  console.log(`📚 API prête : http://localhost:${PORT}/api/health`);
});
