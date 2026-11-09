#!/usr/bin/env python3
import sys, os, re, json, shutil, subprocess, tempfile, datetime

def fail(msg):
    print("❌", msg)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("usage: fix_labels.py corrections.js [--apply]")
    corr_file = sys.argv[1]
    apply = '--apply' in sys.argv
    src = os.getcwd()

    # قراءة ملف التصحيحات
    r = subprocess.run(
        ['node', '-e',
         "console.log(JSON.stringify(require(require('path').resolve(process.argv[1]))))",
         corr_file], capture_output=True, text=True)
    if r.returncode:
        fail("صياغة ملف التصحيحات خاطئة:\n" + r.stderr)
    corrections = json.loads(r.stdout)

    # بيئة معزولة
    sbx = tempfile.mkdtemp(prefix='medsearch-fix-')
    for f in ['app.js']:
        if os.path.exists(f):
            shutil.copy(f, sbx)
    print("🧪 البيئة المعزولة:", sbx)

    path = os.path.join(sbx, 'app.js')
    content = open(path, encoding='utf-8').read()

    # تنفيذ التصحيحات
    fixed_count = 0
    for name_en, fields in corrections.items():
        # البحث عن كائن الدواء بالاسم الإنجليزي
        # نبحث عن { id: X, name: '...', nameEn: 'Name', ... }
        pattern = re.compile(r"(\{ id: \d+, name: '[^']*', nameEn: '" + re.escape(name_en) + r"',)([^}]*)\}")
        
        def replacer(match):
            nonlocal fixed_count
            prefix = match.group(1)
            rest = match.group(2) # بقية الحقول
            # تحديث الحقول المطلوبة
            new_rest = rest
            for key, val in fields.items():
                # استبدال القيمة القديمة (بين علامات التنصيص)
                # نبحث عن key: '...' ونستبدلها
                pattern_key = re.compile(r"(" + re.escape(key) + r": ')[^']*(')")
                if pattern_key.search(new_rest):
                    new_rest = pattern_key.sub(r"\g<1>" + val.replace("\\", "\\\\").replace("'", "\\'") + r"\g<2>", new_rest)
                else:
                    # إذا لم يكن الحقل موجوداً، نضيفه قبل القوس الأخير
                    new_rest = new_rest.rstrip() + f", {key}: '{val}'"
            fixed_count += 1
            return prefix + new_rest + "}"

        content = pattern.sub(replacer, content)

    if fixed_count == 0:
        fail("لم يتم العثور على أي دواء لتحديثه. تأكد من الأسماء الإنجليزية.")

    open(path, 'w', encoding='utf-8').write(content)

    # فحص الصياغة
    c = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    if c.returncode:
        fail("node --check فشل (لم يُمس مشروعك):\n" + c.stderr)
    print(f"✅ تم تصحيح {fixed_count} دواءً بنجاح.")

    if not apply:
        print("لم يُعدَّل مشروعك. للتطبيق: python3 fix_labels.py", corr_file, "--apply")
        return

    # نسخ احتياطي وتطبيق
    ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    bak = f"app.js.bak-fix-{ts}"
    shutil.copy(os.path.join(src, 'app.js'), os.path.join(src, bak))
    shutil.copy(path, os.path.join(src, 'app.js'))
    print("💾 نسخة احتياطية:", bak)
    print("\nالآن ارفع:\n  git add app.js && git commit -m \"تصحيح بيانات الأدوية\"\n  git push")

main()
