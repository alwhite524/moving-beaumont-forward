const allowedHosts = new Set([
  'documents.beaumontintelligence.com',
  'pub-beaumont.escribemeetings.com',
]);

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get('url');
  let url: URL;
  try {
    url = new URL(source || '');
    if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) throw new Error('Invalid PDF source');
  } catch {
    return new Response('Invalid PDF source', { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: request.headers.has('range') ? { range: request.headers.get('range')! } : {},
      redirect: 'manual',
    });
    if (!upstream.ok && upstream.status !== 206) return new Response('PDF unavailable', { status: 502 });
    const headers = new Headers({ 'content-type': 'application/pdf', 'cache-control': 'public, max-age=300' });
    for (const name of ['accept-ranges', 'content-length', 'content-range']) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return new Response('PDF unavailable', { status: 502 });
  }
}
