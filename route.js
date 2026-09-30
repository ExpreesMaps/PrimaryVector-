export const dynamic = 'force-dynamic';

const blocked = (h) =>
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[)/.test(h) || h.endsWith('.local') || h.endsWith('.internal');

const inject = (base) => `<base href="${base}"><script>(function(){
var P=function(m){parent.postMessage(m,'*')};
P({type:'pv-loaded',url:${JSON.stringify(base)},title:document.title});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');
if(!a||/^(javascript:|#|mailto:|tel:)/i.test(a.getAttribute('href')))return;
e.preventDefault();P({type:'pv-nav',url:a.href})},true);
document.addEventListener('submit',function(e){var f=e.target;if((f.method||'get').toLowerCase()!=='get')return;
e.preventDefault();var u=new URL(f.action||location.href);new FormData(f).forEach(function(v,k){u.searchParams.set(k,v)});
P({type:'pv-nav',url:u.href})},true);
})();</script>`;

export async function GET(req) {
  const raw = new URL(req.url).searchParams.get('url');
  let t;
  try { t = new URL(raw); } catch { return new Response('URL tidak valid.', { status: 400 }); }
  if (!/^https?:$/.test(t.protocol) || blocked(t.hostname)) return new Response('Alamat ini diblokir.', { status: 403 });

  try {
    const r = await fetch(t, {
      headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) PrimaryVector/1.0', 'accept-language': 'id,en;q=0.8' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const ct = r.headers.get('content-type') || 'text/plain';
    if (!ct.includes('text/html')) return new Response(r.body, { headers: { 'content-type': ct, 'cache-control': 'no-store' } });
    let html = await r.text();
    const tag = inject(r.url);
    html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + tag) : tag + html;
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  } catch {
    return new Response(
      '<body style="font-family:sans-serif;background:#0b0d17;color:#e7e9f5;display:grid;place-items:center;height:100vh;margin:0"><div><h2>Halaman tidak dapat dimuat</h2><p>Situs tidak merespons. Periksa alamat lalu muat ulang.</p></div></body>',
      { status: 502, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }
}
