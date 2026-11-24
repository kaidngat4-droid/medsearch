#!/usr/bin/env python3
"""patch-detail-ui.py - يضيف إخلاء المسؤولية + المصادر إلى نافذة التفاصيل showItemDetail.
- يتراجع تلقائياً عن تعديل بطاقة البحث السابق إن وُجد
- يعمل في بيئة معزولة أولاً. للتطبيق الفعلي: python3 patch-detail-ui.py --apply
"""
import sys, os, re, shutil, tempfile, datetime

OLD_CARD = r"""    } else if (type === 'diseases') {
        detailsHTML = `<div class="result-details"><div class="detail-item"><div class="detail-label">الأعراض</div><div class="detail-value">${escapeHtml(item.symptoms)}</div></div><div class="detail-item"><div class="detail-label">الأسباب</div><div class="detail-value">${escapeHtml(item.causes)}</div></div></div>`;"""
NEW_CARD = r"""    } else if (type === 'diseases') {
        detailsHTML = `
        <div class="result-details">
            <div class="detail-item"><div class="detail-label">الأعراض</div><div class="detail-value">${escapeHtml(item.symptoms)}</div></div>
            <div class="detail-item"><div class="detail-label">الأسباب</div><div class="detail-value">${escapeHtml(item.causes)}</div></div>
            <div class="detail-item"><div class="detail-label">التشخيص</div><div class="detail-value">${escapeHtml(item.diagnosis || 'غير متوفر')}</div></div>
            <div class="detail-item"><div class="detail-label">العلاج</div><div class="detail-value">${escapeHtml(item.treatment || 'غير متوفر')}</div></div>
            <div class="detail-item"><div class="detail-label">المضاعفات</div><div class="detail-value">${escapeHtml(item.complications || 'غير متوفر')}</div></div>
            <div class="detail-item"><div class="detail-label">الوقاية</div><div class="detail-value">${escapeHtml(item.prevention || 'غير متوفر')}</div></div>
        </div>
        ${typeof medicalDisclaimerHTML === 'function' ? medicalDisclaimerHTML() : ''}
        ${typeof diseaseRefsHTML === 'function' ? diseaseRefsHTML(item) : ''}
        `;"""

OLD1 = r"""if (['id', 'name', 'nameEn'].includes(key) || !value) continue;"""
NEW1 = r"""if (['id', 'name', 'nameEn', 'refs'].includes(key) || !value) continue;"""
OLD2 = r"""${detailsHTML}<div style="text-align:center;margin-top:24px;"""
NEW2 = r"""${detailsHTML}${typeof medicalDisclaimerHTML === 'function' ? medicalDisclaimerHTML() : ''}${type === 'diseases' && typeof diseaseRefsHTML === 'function' ? diseaseRefsHTML(item) : ''}<div style="text-align:center;margin-top:24px;"""

def fail(m):
    print("❌", m); sys.exit(1)

def main():
    apply = '--apply' in sys.argv
    for f in ('app.js', 'sw.js'):
        if not os.path.exists(f): fail("شغّل السكربت داخل ~/medsearch (ينقص " + f + ")")
    if 'MEDICAL-REFS-START' not in open('app.js', encoding='utf-8').read():
        fail("دوال المصادر غير موجودة في app.js. شغّل add-diseases.js أولاً.")

    sbx = tempfile.mkdtemp(prefix='medsearch-detail-')
    for f in ('app.js', 'sw.js'): shutil.copy(f, sbx)
    jp = os.path.join(sbx, 'app.js')
    js = open(jp, encoding='utf-8').read()

    if NEW_CARD in js:
        js = js.replace(NEW_CARD, OLD_CARD)
        print("↩️  تم التراجع عن تعديل بطاقة البحث السابق")

    if 'medicalDisclaimerHTML() : \'\'}${type ===' in js:
        print("ℹ️  تعديل التفاصيل مطبّق مسبقاً، لا تغيير."); return
    if js.count(OLD1) != 1: fail("لم أجد سطر حلقة الحقول (أو وُجد أكثر من واحد)")
    if js.count(OLD2) != 1: fail("لم أجد موضع أزرار نافذة التفاصيل (أو وُجد أكثر من واحد)")
    js = js.replace(OLD1, NEW1).replace(OLD2, NEW2)
    open(jp, 'w', encoding='utf-8').write(js)

    if os.system(f"node --check {jp} > /dev/null 2>&1") != 0:
        fail("node --check فشل، لم يُعدَّل مشروعك.")

    sp = os.path.join(sbx, 'sw.js')
    s = open(sp, encoding='utf-8').read()
    m = re.search(r"const SW_VERSION = 'v(\d+)'", s)
    if not m: fail("لم أجد SW_VERSION")
    v = int(m.group(1)) + 1
    open(sp, 'w', encoding='utf-8').write(s.replace(m.group(0), "const SW_VERSION = 'v%d'" % v))
    print(f"✅ الصياغة سليمة | SW_VERSION → v{v}")

    if not apply:
        print("لم يُعدَّل مشروعك. للتطبيق: python3 patch-detail-ui.py --apply"); return
    ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    for f in ('app.js', 'sw.js'):
        shutil.copy(f, f"{f}.bak-detail-{ts}")
        shutil.copy(os.path.join(sbx, f), f)
    print("💾 نسخ احتياطية .bak-detail-" + ts)

if __name__ == '__main__':
    main()
