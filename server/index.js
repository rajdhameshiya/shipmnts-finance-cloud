import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processUploadedBill } from './processor.js';

dotenv.config();

const app = express();
const uploadDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads');
mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3003' }));
app.use(express.json());
app.use('/api/files', express.static(uploadDirectory, { fallthrough: false }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    openAIEnabled: Boolean(process.env.OPENAI_API_KEY),
    extraction: process.env.OPENAI_API_KEY
      ? 'Text PDFs parsed locally; images and scanned PDFs use OpenAI OCR/extraction.'
      : 'Text PDFs parsed locally; configure OPENAI_API_KEY for image/scanned PDF OCR.',
  });
});

app.post('/api/bills/upload', upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No bill file uploaded.' });
      return;
    }

    const result = await processUploadedBill(req.file);
    const extension = path.extname(req.file.originalname).toLowerCase() || (req.file.mimetype === 'application/pdf' ? '.pdf' : '.bin');
    const storedName = `${result.bill.id}${extension}`;
    await writeFile(path.join(uploadDirectory, storedName), req.file.buffer);
    result.bill.sourceUrl = `/api/files/${storedName}`;
    result.bill.sourceMimeType = req.file.mimetype;
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Unable to process uploaded bill.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

const port = Number(process.env.PORT || 3002);
app.listen(port, () => {
  console.log(`AP automation backend listening on http://localhost:${port}`);
});
