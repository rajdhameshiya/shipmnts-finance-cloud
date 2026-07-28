export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  return response.status(200).json({
    ok: true,
    service: 'shipmnts-finance-cloud',
    extraction: process.env.OPENAI_API_KEY ? 'openai-enabled' : 'local-pdf-only',
  });
}
