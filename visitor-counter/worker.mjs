const siteOrigin = 'https://honvg.github.io';
const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/visit') return new Response(null, { status: 404 });
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });

    if (request.headers.get('Origin') !== siteOrigin || request.headers.has('CF-Worker')) {
      return new Response(null, { status: 403 });
    }
    const headers = {
      'Access-Control-Allow-Origin': siteOrigin,
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    };
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip || !env.VISITOR_HASH_SECRET) return new Response(null, { status: 503, headers });

    try {
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(env.VISITOR_HASH_SECRET),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(ip)));
      const hex = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
      const [, count] = await env.VISITS.batch([
        env.VISITS.prepare('INSERT INTO visitor (fingerprint) VALUES (?) ON CONFLICT DO NOTHING').bind(hex),
        env.VISITS.prepare('SELECT total FROM visitor_count WHERE id = 1'),
      ]);
      return Response.json({ total: count.results[0].total }, { headers });
    } catch {
      return new Response(null, { status: 503, headers });
    }
  },
};
