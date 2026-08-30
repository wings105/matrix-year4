export async function onRequestGet() {
  return Response.json({
    ok: true,
    app: 'MATRIX Tahun 4',
    backend: 'Cloudflare Pages Functions',
    time: new Date().toISOString()
  });
}