/* Shared bookmark-list renderer for the list views (Home + filtered views).
   Colors use standard/literal classes so the Play CDN reliably generates them
   even for this injected markup. Usage:
     <script src="_data.js"></script>
     <script src="_list.js"></script>
     <script>renderList({ filter: it => it.p, empty: 'No private bookmarks.' })</script> */
(function () {
  const PRIVATE = [
    { t: 'Tax documents 2025 — Dropbox', u: 'https://www.dropbox.com/home/Taxes', n: '', d: '2026-02-10', g: ['finance'], p: true },
    { t: 'Home network admin — UniFi', u: 'https://unifi.ui.com', n: '', d: '2025-11-03', g: ['home', 'IT'], p: true },
  ];
  const ALL = [...PRIVATE, ...(window.DATA || [])].sort((a, b) => b.d.localeCompare(a.d));
  const STARRED = new Set([1, 3, 6, 11, 17, 22, 28]);
  ALL.forEach((it, i) => { it.s = it.s || STARRED.has(i); it.id = 5021 - i; });

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = d => { const [y, m, day] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${day}, ${y}`; };
  const domain = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const EDIT = '<a href="edit.html" class="p-1 rounded text-ink-soft hover:text-ink hover:bg-border-soft" title="Edit"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linecap="round" stroke-linejoin="round"/></svg></a>';
  const DEL = '<button class="p-1 rounded text-ink-soft hover:text-red-600 hover:bg-border-soft" title="Delete"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  const MAKE_PRIVATE = '<button class="p-1 rounded text-ink-soft hover:text-ink hover:bg-border-soft" title="Make Private"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></button>';
  const MAKE_PUBLIC = '<button class="p-1 rounded text-red-700 hover:text-ink hover:bg-border-soft" title="Make Public"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-1.5" stroke-linecap="round"/></svg></button>';
  const LOCK = '<svg class="w-3.5 h-3.5 text-red-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const STAR_OFF = '<button class="p-1 rounded text-ink-soft hover:text-amber-500 hover:bg-border-soft" title="Star"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 17.3-6.16 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.48 4.73 1.64 7.03z" stroke-linejoin="round"/></svg></button>';
  const STAR_ON = '<button class="p-1 rounded text-amber-500 hover:bg-border-soft" title="Unstar"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="m12 17.3-6.16 3.7 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.48 4.73 1.64 7.03z"/></svg></button>';

  function row(it) {
    const dom = domain(it.u);
    const note = it.n ? ` <span class="text-ink-faint">· ${esc(it.n)}</span>` : '';
    const tags = (it.g || []).map(t => `<a href="#" class="rounded px-1.5 py-0.5 text-[11px] font-medium text-ink bg-border hover:bg-indigo-600 hover:text-white">${esc(t)}</a>`).join('');
    const pill = it.p ? '<span class="rounded px-1.5 py-0.5 text-[11px] font-medium text-white bg-red-800">Private</span>' : '';
    const liClass = it.p ? 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700' : 'hover:bg-border-soft';
    const toggle = it.p ? MAKE_PUBLIC : MAKE_PRIVATE;
    const star = it.s ? STAR_ON : STAR_OFF;
    return `<li class="group px-4 sm:px-6 lg:px-8 py-3 ${liClass} transition-colors">
      <div class="min-w-0 flex items-center gap-1.5">
        <a href="${esc(it.u)}" class="truncate-1 text-[15px] font-medium leading-snug text-indigo-600 dark:text-indigo-400 hover:text-ink">${esc(it.t)}</a>
        ${it.p ? LOCK : ''}
      </div>
      <div class="mt-0.5 truncate-1 text-[13px] text-ink-soft">${esc(dom)}${note}</div>
      <div class="mt-1.5 flex items-center gap-2">
        <div class="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">${pill}${tags}<span class="text-[11px] text-ink-faint tabular-nums whitespace-nowrap">${fmt(it.d)}</span></div>
        <div class="shrink-0 flex items-center gap-2">
          <a href="bookmark.html" class="text-[11px] text-ink-soft hover:text-indigo-600 dark:hover:text-indigo-400 tabular-nums" title="Permalink">#${it.id}</a>
          <div class="flex items-center gap-0.5">${star}${EDIT}${toggle}${DEL}</div>
        </div>
      </div>
    </li>`;
  }

  window.renderList = function (opts) {
    opts = opts || {};
    let items = ALL.slice();
    if (opts.filter) items = items.filter(opts.filter);
    if (opts.limit) items = items.slice(0, opts.limit);
    const el = document.getElementById('list');
    if (!el) return;
    el.innerHTML = items.length
      ? items.map(row).join('')
      : `<li class="px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-ink-faint">${opts.empty || 'Nothing here yet.'}</li>`;
    const c = document.getElementById('list-count');
    if (c) c.textContent = items.length.toLocaleString();
  };
})();
