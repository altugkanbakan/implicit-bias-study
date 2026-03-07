/**
 * Cloudflare Worker — XYZ.com/subdomain
 * 
 * GET  /subdomain  → gets informed consent HTML file from n8n shows to participant
 * POST /subdomain  → sends the participant's consent data to n8n, receives the redirectUrl
 * 
 * CUSTOMIZE: Change N8N_BASE_URL down below with yout n8n adress
 */

const N8N_BASE_URL = 'https://yourworkspace.app.n8n.cloud/webhook/informedconsent';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/subdomain')) {
      return new Response('Not found', { status: 404 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }
    if (request.method === 'GET') {
      const n8nResponse = await fetch(N8N_BASE_URL, {
        method: 'GET',
        headers: { 'User-Agent': 'CloudflareWorker' }
      });

      const html = await n8nResponse.text();

      
      const cleanHtml = html.replace(
        /https:\/\/yourworkspace\.app\.n8n\.cloud\/webhook\/informedconsent/g,
        `${url.origin}/subdomain`
      );

      return new Response(cleanHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          ...corsHeaders()
        }
      });
    }
    if (request.method === 'POST') {
      const body = await request.text();

      const n8nResponse = await fetch(N8N_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': request.headers.get('Content-Type') || 'application/json',
          'User-Agent': 'CloudflareWorker'
        },
        body: body
      });

      const data = await n8nResponse.json();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
