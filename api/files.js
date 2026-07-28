import { Readable } from 'node:stream';
import { get } from '@vercel/blob';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const pathname = Array.isArray(request.query.pathname)
    ? request.query.pathname[0]
    : request.query.pathname;

  if (!pathname || !pathname.startsWith('invoices/')) {
    return response.status(400).json({ error: 'Invalid invoice file reference.' });
  }

  try {
    const result = await get(pathname, { access: 'private' });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return response.status(result?.statusCode || 404).json({ error: 'Invoice file not found.' });
    }

    response.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream');
    response.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(result.blob.pathname.split('/').pop())}"`);
    response.setHeader('Cache-Control', 'private, max-age=300');
    Readable.fromWeb(result.stream).pipe(response);
  } catch (error) {
    console.error('Invoice file read failed:', error);
    return response.status(500).json({ error: 'Unable to open the invoice file.' });
  }
}
