const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      try {
        const result = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ).first();

        return json({
          ok: true,
          app: 'matrix-year4',
          database: 'connected',
          tables: Number(result?.count || 0),
          time: new Date().toISOString(),
        });
      } catch (error) {
        return json(
          {
            ok: false,
            app: 'matrix-year4',
            database: 'error',
            error: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'API route not found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
