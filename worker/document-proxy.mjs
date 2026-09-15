// Add only document loading; all other routes retain the supplied Worker's behavior.
export function withDocumentProxy(existingWorker) {
  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      let source;
      if (url.pathname.startsWith('/council-documents/')) {
        if (!url.pathname.endsWith('.pdf')) return new Response('Not found', { status: 404 });
        source = new URL('/official-documents/' + url.pathname.slice('/council-documents/'.length), 'https://documents.beaumontintelligence.com');
        if (!source.pathname.startsWith('/official-documents/')) return new Response('Invalid document', { status: 400 });
      } else if (url.pathname === '/documents/pdf') {
        try { source = new URL(url.searchParams.get('url')); } catch { return new Response('Invalid document', { status: 400 }); }
        if (source.origin !== 'https://pub-beaumont.escribemeetings.com' || source.pathname !== '/filestream.ashx' || source.username || source.password) {
          return new Response('Unsupported document', { status: 400 });
        }
      } else {
        return existingWorker.fetch(request, env, ctx);
      }
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      const headers = new Headers();
      for (const name of ['range', 'if-range', 'if-none-match', 'if-modified-since']) {
        if (request.headers.has(name)) headers.set(name, request.headers.get(name));
      }
      try {
        const upstream = await fetch(source, { method: request.method, headers, redirect: 'manual' });
        if (![200, 206, 304].includes(upstream.status)) {
          await upstream.body?.cancel();
          return new Response('Document unavailable. Please open the original source.', { status: upstream.status === 404 ? 404 : 502 });
        }
        const result = new Headers({ 'content-type': 'application/pdf', 'content-disposition': 'inline', 'x-content-type-options': 'nosniff' });
        for (const name of ['content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified', 'cache-control']) {
          if (upstream.headers.has(name)) result.set(name, upstream.headers.get(name));
        }
        return new Response(upstream.body, { status: upstream.status, headers: result });
      } catch (error) {
        console.error('Document source request failed', { message: error.message });
        return new Response('Document source is temporarily unavailable.', { status: 502 });
      }
    }
  };
}
