#!/usr/bin/env python3
"""
patch-history-card.py - إضافة بطاقة "سجل البحث" في صفحة حاسبات سريرية وأدوات.
  python3 patch-history-card.py            # تجربة معزولة فقط
  python3 patch-history-card.py --apply    # نسخة احتياطية ثم تعديل المشروع
"""
import sys, os, re, shutil, tempfile, datetime

ANCHOR = '<span class="native-status" id="clipboardStatus">جاهز</span></button>'
CARD = ('\n                <button class="native-btn" onclick="openSearchHistory()">'
        '<span class="native-icon">&#x1F558;</span>'
        '<span class="native-label">سجل البحث</span>'
        '<span class="native-status" id="historyStatus">جاهز</span></button>')

def fail(msg):
    print("❌", msg); sys.exit(1)

def main():
    apply = '--apply' in sys.argv
    for f in ('index.html', 'sw.js'):
        if not os.path.exists(f): fail("شغّل السكربت داخل ~/medsearch (ينقص " + f + ")")

    sbx = tempfile.mkdtemp(prefix='medsearch-hcard-')
    print("🧪 البيئة المعزولة:", sbx)
    for f in ('index.html', 'sw.js'):
        shutil.copy(f, sbx)

    hp = os.path.join(sbx, 'index.html')
    h = open(hp, encoding='utf-8').read()
    if 'id="historyStatus"' in h: fail("البطاقة مضافة مسبقاً")
    if h.count(ANCHOR) != 1: fail("موضع بطاقة النسخ غير موجود أو متكرر (%d)" % h.count(ANCHOR))
    h = h.replace(ANCHOR, ANCHOR + CARD)
    open(hp, 'w', encoding='utf-8').write(h)

    sp = os.path.join(sbx, 'sw.js')
    s = open(sp, encoding='utf-8').read()
    m = re.search(r"const SW_VERSION = 'v(\d+)'", s)
    if not m: fail("لم أجد SW_VERSION في sw.js")
    new_v = int(m.group(1)) + 1
    s = s.replace(m.group(0), "const SW_VERSION = 'v%d'" % new_v)
    open(sp, 'w', encoding='utf-8').write(s)
    print("✅ البطاقة أُدرجت | SW_VERSION: v%s → v%d" % (m.group(1), new_v))

    if not apply:
        print("لم يُعدَّل مشروعك. للتطبيق: python3 patch-history-card.py --apply")
        return

    ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    for f in ('index.html', 'sw.js'):
        shutil.copy(f, "%s.bak-hcard-%s" % (f, ts))
        shutil.copy(os.path.join(sbx, f), f)
    print("💾 نسخ احتياطية .bak-hcard-" + ts)
    print("""
الآن:
  git add index.html sw.js patch-history-card.py
  git commit -m "إضافة بطاقة سجل البحث في صفحة الأدوات"
  git push""")

main()
