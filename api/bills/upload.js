import multer from 'multer';
import { processUploadedBill } from '../../server/processor.js';

// Server uploads must fit within Vercel's function request-body limit.
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const PROCESSOR_REVISION = '2026-07-29-invoice-key-v4';
const acceptedTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/tiff',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_request, file, callback) => {
    callback(acceptedTypes.has(file.mimetype) ? null : new Error('Unsupported file type'), acceptedTypes.has(file.mimetype));
  },
});

function parseUpload(request, response) {
  return new Promise((resolve, reject) => {
    upload.single('bill')(request, response, (error) => (error ? reject(error) : resolve()));
  });
}

function safeFilename(filename = 'invoice') {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export default async function handler(request, response) {
  response.setHeader('X-Shipmnts-Processor', PROCESSOR_REVISION);

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await parseUpload(request, response);

    if (!request.file) {
      return response.status(400).json({ error: 'Choose a PDF or image invoice to process.' });
    }

    const { put } = await import('@vercel/blob');

    const [result, blob] = await Promise.all([
      processUploadedBill(request.file),
      put(`invoices/${safeFilename(request.file.originalname)}`, request.file.buffer, {
        access: 'private',
        addRandomSuffix: true,
        contentType: request.file.mimetype,
      }),
    ]);

    result.bill.sourceUrl = `/api/files?pathname=${encodeURIComponent(blob.pathname)}`;
    result.bill.sourceMimeType = request.file.mimetype;

    return response.status(200).json({ ...result, processorRevision: PROCESSOR_REVISION });
  } catch (error) {
    console.error('Invoice upload failed:', error);
    const status = error?.code === 'LIMIT_FILE_SIZE' ? 413 : 500;
    const message = error?.code === 'LIMIT_FILE_SIZE'
      ? 'The invoice is larger than the 4 MB upload limit.'
      : error?.message || 'Invoice processing failed.';
    return response.status(status).json({ error: message });
  }
}

export const config = {
  api: { bodyParser: false },
  maxDuration: 120,
};
