#!/usr/bin/env python3
import sys, os, re, json, shutil, subprocess, tempfile, datetime

ORDER = ['name', 'nameEn', 'category', 'dose', 'maxDose', 'sideEffects',
         'interactions', 'contraindications', 'pregnancy', 'form',
         'mechanism', 'source']
MARK = "name: 'قاموس علم الأدوية'"

def fail(msg):
    print("❌", msg)
    sys.exit(1)

def js(v):
    return "'" + str(v).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'"

def main():
    if len(sys.argv) < 2:
        fail("usage: merge.py batchN.js [--apply]")
    batch, apply = sys.argv[1], '--apply' in sys.argv
    src = os.getcwd()

    r = subprocess.run(['node', '-e', "console.log(JSON.stringify(require(require('path').resolve(process.argv[1]))))", batch], capture_output=True, text=True)
    if r.returncode:
        fail("صياغة ملف الدفعة خاطئة:\n" + r.stderr)
    drugs = json.loads(r.stdout)

    sbx = tempfile.mkdtemp(prefix='medsearch-sbx-')
    for f in ['app.js', 'index.html', 'sw.js', 'disclaimer.js', 'manifest.json']:
        if os.path.exists(f):
            shutil.copy(f, sbx)
    print("🧪 البيئة المعزولة:", sbx)

    path = os.path.join(sbx, 'app.js')
    lines = open(path, encoding='utf-8').read().split('\n')
    start = next((i for i, l in enumerate(lines) if MARK in l), None)
    if start is None:
        fail("لم أجد قسم قاموس علم الأدوية")
    end = next(i for i in range(start, len(lines)) if lines[i].strip() == ']')
    sect = lines[start:end]
    existing = {m.lower() for l in sect for m in re.findall(r"nameEn: '([^']*)'", l)}
    ids = [int(m) for l in sect for m in re.findall(r"\{ id: (\d+),", l)]
    nxt = max(ids) + 1 if ids else 1

    seen = set()
    for i, d in enumerate(drugs, 1):
        miss = [k for k in ORDER if not str(d.get(k, '')).strip()]
        if miss:
            fail(f"الدواء #{i} ({d.get('nameEn')}): حقول ناقصة {miss}")
        if not str(d['source']).startswith('http'):
            fail(f"{d['nameEn']}: المصدر يجب أن يكون رابطاً")
        n = d['nameEn'].lower()
        if n in existing or n in seen:
            print(f"⏭️ تجاهل (موجود مسبقاً): {d['nameEn']}"); continue
        seen.add(n)

    new = []
    for d in drugs:
        new.append("            { id: %d, %s }," % (nxt, ", ".join(f"{k}: {js(d[k])}" for k in ORDER)))
        nxt += 1
    j = end - 1
    while not lines[j].strip():
        j -= 1
    if not lines[j].rstrip().endswith(','):
        lines[j] = lines[j].rstrip() + ','
    lines[end:end] = new
    open(path, 'w', encoding='utf-8').write('\n'.join(lines))

    c = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    if c.returncode:
        fail("node --check فشل (لم يُمس مشروعك):\n" + c.stderr)
    print(f"✅ {len(drugs)} دواء أُدرجت بنجاح، آخر id = {nxt - 1}")

    if not apply:
        print("لم يُعدَّل مشروعك. للتطبيق: python3 merge.py", batch, "--apply")
        return

    ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    bak = f"app.js.bak-drugs-{ts}"
    shutil.copy(os.path.join(src, 'app.js'), os.path.join(src, bak))
    shutil.copy(path, os.path.join(src, 'app.js'))
    print("💾 نسخة احتياطية:", bak)
    print("\nالآن راجع الدفعة ثم ارفع:\n  git add app.js && git commit -m \"Add drugs batch\"\n  git push")

main()
