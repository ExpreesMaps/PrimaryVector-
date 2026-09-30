'use client';
import { useState, useEffect, useRef } from 'react';

const P = (u) => '/api/proxy?url=' + encodeURIComponent(u);
const norm = (q) => {
  q = q.trim();
  if (!q) return '';
  if (/^https?:\/\//i.test(q)) return q;
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(q)) return 'https://' + q;
  return 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q);
};

const ICONS = {
  back: 'M15 5l-7 7 7 7',
  fwd: 'M9 5l7 7-7 7',
  reload: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
};
const Icon = ({ n, s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[n]} />
  </svg>
);

const Logo = ({ s = 28 }) => (
  <svg className="logo" width={s} height={s} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="pvg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8b6bff" />
        <stop offset="1" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <path className="lv" d="M7 9 L24 41 L41 9" stroke="url(#pvg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle className="ld" cx="24" cy="9" r="4" fill="#22d3ee" />
  </svg>
);

const QUICK = [
  ['Wikipedia', 'https://id.wikipedia.org'],
  ['GitHub', 'https://github.com'],
  ['Hacker News', 'https://news.ycombinator.com'],
  ['MDN', 'https://developer.mozilla.org'],
  ['Vercel', 'https://vercel.com'],
  ['Next.js', 'https://nextjs.org'],
];

export default function Browser() {
  const [tabs, setTabs] = useState([{ id: 1, h: [], i: -1, t: 'Tab baru' }]);
  const [act, setAct] = useState(1);
  const [load, setLoad] = useState(false);
  const [q, setQ] = useState('');
  const [rk, setRk] = useState(0);
  const nid = useRef(2);

  const tab = tabs.find((x) => x.id === act) || tabs[0];
  const url = tab.h[tab.i] || '';
  const upd = (fn, id = act) => setTabs((ts) => ts.map((x) => (x.id === id ? fn(x) : x)));

  const go = (raw) => {
    const u = norm(raw);
    if (!u) return;
    upd((x) => ({ ...x, h: [...x.h.slice(0, x.i + 1), u], i: x.i + 1, t: new URL(u).hostname.replace('www.', '') }));
    setLoad(true);
  };

  useEffect(() => setQ(url), [url, act]);

  useEffect(() => {
    const on = (e) => {
      const d = e.data || {};
      if (d.type === 'pv-nav') go(d.url);
      if (d.type === 'pv-loaded') {
        setLoad(false);
        if (d.title) upd((x) => ({ ...x, t: d.title.slice(0, 28) }));
      }
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  });

  const addTab = () => {
    const id = nid.current++;
    setTabs((ts) => [...ts, { id, h: [], i: -1, t: 'Tab baru' }]);
    setAct(id);
  };
  const closeTab = (id) => {
    if (tabs.length === 1) return upd(() => ({ id, h: [], i: -1, t: 'Tab baru' }), id);
    const rest = tabs.filter((x) => x.id !== id);
    setTabs(rest);
    if (act === id) setAct(rest[rest.length - 1].id);
  };
  const back = () => tab.i > 0 && (upd((x) => ({ ...x, i: x.i - 1 })), setLoad(true));
  const fwd = () => tab.i < tab.h.length - 1 && (upd((x) => ({ ...x, i: x.i + 1 })), setLoad(true));

  return (
    <div className="app">
      <div className="bg"><i /><i /><i /></div>

      <header className="top">
        <div className="brand"><Logo /><span>PrimaryVector</span></div>
        <div className="tabs">
          {tabs.map((x) => (
            <div key={x.id} className={'tab' + (x.id === act ? ' on' : '')} onClick={() => setAct(x.id)}>
              <span>{x.t}</span>
              <button aria-label="Tutup tab" onClick={(e) => { e.stopPropagation(); closeTab(x.id); }}><Icon n="close" s={13} /></button>
            </div>
          ))}
          <button className="add" aria-label="Tab baru" onClick={addTab}><Icon n="plus" /></button>
        </div>
      </header>

      <nav className="bar">
        <button className="nb" aria-label="Kembali" onClick={back} disabled={tab.i < 1}><Icon n="back" /></button>
        <button className="nb" aria-label="Maju" onClick={fwd} disabled={tab.i >= tab.h.length - 1}><Icon n="fwd" /></button>
        <button className="nb" aria-label="Muat ulang" onClick={() => { setRk((k) => k + 1); url && setLoad(true); }}><Icon n="reload" /></button>
        <button className="nb" aria-label="Beranda" onClick={() => upd((x) => ({ ...x, h: [], i: -1, t: 'Tab baru' }))}><Icon n="home" /></button>
        <div className="omni">
          <Icon n="search" s={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && go(q)}
            onFocus={(e) => e.target.select()}
            placeholder="Cari atau ketik alamat web"
            spellCheck="false"
          />
        </div>
        <div className={'progress' + (load ? ' run' : '')} />
      </nav>

      <main className="view">
        {url ? (
          <iframe key={act + url + rk} src={P(url)} title="Halaman" onLoad={() => setLoad(false)} sandbox="allow-scripts allow-forms allow-same-origin allow-popups" />
        ) : (
          <section className="home" key={'h' + act}>
            <Logo s={84} />
            <h1>PrimaryVector</h1>
            <p>Cari apa saja. Jelajahi web dengan cepat.</p>
            <form onSubmit={(e) => { e.preventDefault(); go(q); }}>
              <Icon n="search" s={20} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari atau ketik alamat web" autoFocus />
              <button type="submit">Cari</button>
            </form>
            <div className="quick">
              {QUICK.map(([n, u], i) => (
                <button key={n} style={{ animationDelay: 0.5 + i * 0.07 + 's' }} onClick={() => go(u)}>
                  <b>{n[0]}</b>
                  <span>{n}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
