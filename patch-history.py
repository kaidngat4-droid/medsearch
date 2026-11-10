#!/usr/bin/env python3
"""
patch-history.py - استبدال شريحة "نسخ" بشريحة "السجل" (سجل البحث).
  python3 patch-history.py            # تجربة معزولة فقط
  python3 patch-history.py --apply    # نسخة احتياطية ثم تعديل المشروع
"""
import sys, os, re, shutil, subprocess, tempfile, datetime

OLD_CHIP = 'onclick="copyToClipboard()"><span class="chip-icon">&#x1F4CB;</span> نسخ</button>'
NEW_CHIP = 'onclick="openSearchHistory()"><span class="chip-icon">&#x1F558;</span> السجل</button>'

JS_BLOCK = r"""
// ═══════════════════════════════════════════════════════════
// MEDSEARCH_HISTORY_V1 - سجل البحث
// ═══════════════════════════════════════════════════════════
(function () {
    const HK = 'medsearch_search_history_v1';
    const MAX = 20;
    const inputEl = () => document.getElementById('globalSearchInput');

    function read() { try { const a = JSON.parse(localStorage.getItem(HK) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
    function write(l) { try { localStorage.setItem(HK, JSON.stringify(l.slice(0, MAX))); } catch (e) {} }
    function record(q, src) {
        q = (q || '').trim();
        if (q.length < 2) return;
        const l = read().filter(x => x.q.toLowerCase() !== q.toLowerCase());
        l.unshift({ q: q, src: src || '', t: Date.now() });
        write(l);
    }
    function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function when(t) {
        try { return new Date(t).toLocaleString('ar', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
        catch (e) { return ''; }
    }

    // التقاط البحث دون المساس بالدوال الأصلية
    ['searchDirect', 'openSearchSource'].forEach(function (name) {
        const orig = window[name];
        if (typeof orig !== 'function') return;
        window[name] = function (key) {
            try { const i = inputEl(); if (i) record(i.value, typeof key === 'string' ? key : ''); } catch (e) {}
            return orig.apply(this, arguments);
        };
    });
    const inp = inputEl();
    if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') record(inp.value, ''); });

    function injectStyle() {
        if (document.getElementById('mhStyle')) return;
        const s = document.createElement('style');
        s.id = 'mhStyle';
        s.textContent = `
        #mhOverlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100000;display:flex;align-items:flex-end;justify-content:center;animation:mhFade .2s ease}
        @keyframes mhFade{from{opacity:0}to{opacity:1}}
        #mhBox{background:var(--bg,#fff);color:var(--text,inherit);width:100%;max-width:560px;max-height:80vh;border-radius:20px 20px 0 0;padding:18px 16px 22px;overflow:hidden;display:flex;flex-direction:column;direction:rtl;box-shadow:0 -8px 30px rgba(0,0,0,.35)}
        @media(min-width:700px){#mhOverlay{align-items:center}#mhBox{border-radius:20px}}
        #mhHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;font-weight:700;font-size:18px}
        #mhHead button{background:none;border:none;color:inherit;font-size:22px;cursor:pointer;padding:4px 8px}
        #mhList{overflow-y:auto;display:flex;flex-direction:column;gap:8px}
        .mh-item{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;border:1px solid rgba(128,128,128,.25);background:rgba(128,128,128,.08);cursor:pointer}
        .mh-item:active{background:rgba(13,115,119,.2)}
        .mh-q{flex:1;font-size:16px;word-break:break-word}
        .mh-meta{font-size:11px;opacity:.6;display:block;margin-top:2px}
        .mh-del{background:none;border:none;color:inherit;opacity:.6;font-size:18px;cursor:pointer;padding:4px 8px}
        .mh-empty{text-align:center;opacity:.7;padding:28px 8px}
        #mhClear{margin-top:12px;padding:10px;border-radius:12px;border:1px solid rgba(198,40,40,.5);background:transparent;color:#e57373;font-size:14px;cursor:pointer}
        `;
        document.head.appendChild(s);
    }

    function closeHistory() {
        const o = document.getElementById('mhOverlay');
        if (o) o.remove();
        document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') closeHistory(); }

    function render() {
        const list = document.getElementById('mhList');
        const clr = document.getElementById('mhClear');
        if (!list) return;
        const items = read();
        if (!items.length) {
            list.innerHTML = '<div class="mh-empty">لا توجد عمليات بحث محفوظة بعد.<br>سيظهر هنا ما تبحث عنه.</div>';
            if (clr) clr.style.display = 'none';
            return;
        }
        if (clr) clr.style.display = '';
        list.innerHTML = items.map(function (x, i) {
            return '<div class="mh-item" data-i="' + i + '"><div class="mh-q">' + esc(x.q) +
                '<span class="mh-meta">' + esc(when(x.t)) + (x.src ? ' • ' + esc(x.src) : '') + '</span></div>' +
                '<button class="mh-del" data-del="' + i + '" aria-label="حذف">✕</button></div>';
        }).join('');
    }

    window.openSearchHistory = function () {
        injectStyle();
        closeHistory();
        const o = document.createElement('div');
        o.id = 'mhOverlay';
        o.innerHTML = '<div id="mhBox"><div id="mhHead"><span>\u{1F558} سجل البحث</span><button id="mhClose" aria-label="إغلاق">✕</button></div>' +
            '<div id="mhList"></div><button id="mhClear">مسح السجل كله</button></div>';
        document.body.appendChild(o);
        render();
        document.addEventListener('keydown', onKey);
        o.addEventListener('click', function (e) {
            const t = e.target;
            if (t === o || t.id === 'mhClose') return closeHistory();
            if (t.id === 'mhClear') {
                if (confirm('مسح كل سجل البحث؟')) { write([]); render(); }
                return;
            }
            const del = t.closest('[data-del]');
            if (del) {
                const l = read(); l.splice(parseInt(del.getAttribute('data-del'), 10), 1); write(l); render();
                return;
            }
            const row = t.closest('.mh-item');
            if (row) {
                const it = read()[parseInt(row.getAttribute('data-i'), 10)];
                if (!it) return;
                const i = inputEl();
                if (i) { i.value = it.q; i.dispatchEvent(new Event('input', { bubbles: true })); }
                closeHistory();
                if (it.src && typeof window.searchDirect === 'function') { try { window.searchDirect(it.src); } catch (e) {} }
                else if (i) i.focus();
            }
        });
    };
})();
"""

def fail(msg):
    print("❌", msg); sys.exit(1)

def main():
    apply = '--apply' in sys.argv
    for f in ('app.js', 'index.html', 'sw.js'):
        if not os.path.exists(f): fail("شغّل السكربت داخل ~/medsearch (ينقص " + f + ")")

    sbx = tempfile.mkdtemp(prefix='medsearch-hist-')
    print("🧪 البيئة المعزولة:", sbx)
    for f in ('app.js', 'index.html', 'sw.js'):
        shutil.copy(f, sbx)

    hp = os.path.join(sbx, 'index.html')
    h = open(hp, encoding='utf-8').read()
    if 'openSearchHistory()' in h: fail("تعديل index.html مطبّق مسبقاً")
    if h.count(OLD_CHIP) != 1: fail("شريحة نسخ غير موجودة أو متكررة (%d)" % h.count(OLD_CHIP))
    h = h.replace(OLD_CHIP, NEW_CHIP)
    open(hp, 'w', encoding='utf-8').write(h)

    jp = os.path.join(sbx, 'app.js')
    j = open(jp, encoding='utf-8').read()
    if 'MEDSEARCH_HISTORY_V1' in j: fail("كود السجل مضاف مسبقاً في app.js")
    j = j.rstrip('\n') + '\n' + JS_BLOCK
    open(jp, 'w', encoding='utf-8').write(j)

    c = subprocess.run(['node', '--check', jp], capture_output=True, text=True)
    if c.returncode: fail("node --check فشل (مشروعك لم يُمس):\n" + c.stderr)

    sp = os.path.join(sbx, 'sw.js')
    s = open(sp, encoding='utf-8').read()
    m = re.search(r"const SW_VERSION = 'v(\d+)'", s)
    if not m: fail("لم أجد SW_VERSION في sw.js")
    new_v = int(m.group(1)) + 1
    s = s.replace(m.group(0), "const SW_VERSION = 'v%d'" % new_v)
    open(sp, 'w', encoding='utf-8').write(s)
    print("✅ الصياغة سليمة | SW_VERSION: v%s → v%d" % (m.group(1), new_v))

    if not apply:
        print("لم يُعدَّل مشروعك. للتطبيق: python3 patch-history.py --apply")
        print("للتجربة: cd", sbx, "&& python3 -m http.server 8081 --bind 0.0.0.0")
        return

    ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    for f in ('app.js', 'index.html', 'sw.js'):
        shutil.copy(f, "%s.bak-history-%s" % (f, ts))
        shutil.copy(os.path.join(sbx, f), f)
    print("💾 نسخ احتياطية .bak-history-" + ts)
    print("""
الآن:
  git add index.html app.js sw.js patch-history.py
  git commit -m "استبدال زر النسخ بسجل البحث"
  git push""")

main()
