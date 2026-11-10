#!/usr/bin/env python3
import sys, os, re, shutil, tempfile, datetime

PAT = re.compile(r'\n[ \t]*<button class="native-btn" onclick="copyToClipboard\(\)">.*?</button>')

def fail(m):
    print("❌", m); sys.exit(1)

apply = '--apply' in sys.argv
for f in ('index.html', 'sw.js'):
    if not os.path.exists(f): fail("شغّل السكربت داخل ~/medsearch")

sbx = tempfile.mkdtemp(prefix='medsearch-rmcopy-')
print("🧪 البيئة المعزولة:", sbx)
for f in ('index.html', 'sw.js'):
    shutil.copy(f, sbx)

hp = os.path.join(sbx, 'index.html')
h = open(hp, encoding='utf-8').read()
n = len(PAT.findall(h))
if n != 1: fail("عدد بطاقات النسخ = %d (المتوقع 1)" % n)
h = PAT.sub('', h, count=1)
open(hp, 'w', encoding='utf-8').write(h)

sp = os.path.join(sbx, 'sw.js')
s = open(sp, encoding='utf-8').read()
m = re.search(r"const SW_VERSION = 'v(\d+)'", s)
if not m: fail("لم أجد SW_VERSION")
v = int(m.group(1)) + 1
s = s.replace(m.group(0), "const SW_VERSION = 'v%d'" % v)
open(sp, 'w', encoding='utf-8').write(s)
print("✅ حُذفت البطاقة | SW_VERSION → v%d" % v)

if not apply:
    print("للتطبيق: python3 patch-remove-copy.py --apply"); sys.exit(0)

ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
for f in ('index.html', 'sw.js'):
    shutil.copy(f, "%s.bak-rmcopy-%s" % (f, ts))
    shutil.copy(os.path.join(sbx, f), f)
print("💾 نسخ احتياطية .bak-rmcopy-" + ts)
