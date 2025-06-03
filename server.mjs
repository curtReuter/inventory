// server.mjs
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchInventory, recordSale } from './notion/notionClient.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Support __dirname with ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

// ✅ Serve index.html when user accesses "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/inventory', async (req, res) => {
  try {
    const items = await fetchInventory();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching inventory');
  }
});

app.post('/api/sale', async (req, res) => {
  const { sku, quantity, donated } = req.body;
  if (!sku || !quantity) return res.status(400).send('Missing SKU or quantity');
  try {
    const result = await recordSale(sku, quantity, donated);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error recording sale');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
