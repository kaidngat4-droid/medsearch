#!/usr/bin/env python3
"""
patch-barcode.py - استبدال ماسح الباركود (BarcodeDetector أولاً ثم ZXing احتياطي).
من داخل ~/medsearch:
  python3 patch-barcode.py            # تجربة معزولة في /tmp فقط
  python3 patch-barcode.py --apply    # بعد نجاح التجربة: نسخة احتياطية ثم تعديل app.js
"""
import sys, os, shutil, subprocess, tempfile, datetime

NEW = r"""// ---- ضبط المسح (عدّل هنا عند الحاجة) ----
const QR_FORMATS = ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'data_matrix'];
const QR_SCAN_INTERVAL_MS = 90;      // BarcodeDetector: ~11 مسحة/ثانية
const QR_ZXING_INTERVAL_MS = 200;    // ZXing: ~5 مسحات/ثانية
const QR_MAX_DETECT_ERRORS = 5;      // أخطاء متتالية قبل التحويل إلى ZXing
const QR_VIDEO_CONSTRAINTS = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } };

function stopQRStream() {
    if (qrStream) { try { qrStream.getTracks().forEach(t => t.stop()); } catch (e) {} qrStream = null; }
}

async function applyContinuousFocus(stream) {
    try {
        const track = stream && stream.getVideoTracks && stream.getVideoTracks()[0];
        const caps = track && track.getCapabilities ? track.getCapabilities() : {};
        if (caps.focusMode && caps.focusMode.includes('continuous')) {
            await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
        }
    } catch (e) { /* غير مدعوم، نكمل */ }
}

// 1) المسار الأسرع: BarcodeDetector الأصلي في المتصفح
async function startWithBarcodeDetector(overlay, video) {
    if (!(await supportsBarcodeDetector())) return false;
    try {
        const supported = await BarcodeDetector.getSupportedFormats();
        const formats = QR_FORMATS.filter(f => supported.includes(f));
        if (!formats.length) return false;
        const detector = new BarcodeDetector({ formats });

        qrStream = await navigator.mediaDevices.getUserMedia(QR_VIDEO_CONSTRAINTS);
        await applyContinuousFocus(qrStream);
        video.srcObject = qrStream;
        await video.play();
        overlay.classList.add('active');
        updateNativeStatus('qrStatus', '\u{1F50D} يبحث...');
        showToast('\u{1F4F7} وجه الكاميرا نحو QR أو Barcode');

        let stopped = false, timer = null, errs = 0;
        const scanLoop = async () => {
            if (stopped || !overlay.classList.contains('active')) return;
            try {
                if (video.readyState >= 2) {
                    const codes = await detector.detect(video);
                    errs = 0;
                    if (codes.length > 0) {
                        handleQRResult(codes[0].rawValue, codes[0].format);
                        return;
                    }
                }
            } catch (e) {
                // بعض الأجهزة تُعلن الدعم ثم يفشل detect فعلياً: نحوّل إلى ZXing
                if (++errs >= QR_MAX_DETECT_ERRORS) {
                    console.warn('[QR] BarcodeDetector يفشل على هذا الجهاز، التحويل إلى ZXing');
                    stopped = true;
                    stopQRStream();
                    video.srcObject = null;
                    const ok = await startWithZXing(overlay, video);
                    if (!ok) {
                        updateNativeStatus('qrStatus', '\u{274C} غير مدعوم');
                        showToast('\u{274C} تعذر تشغيل المسح على هذا الجهاز.');
                        overlay.classList.remove('active');
                    }
                    return;
                }
            }
            timer = setTimeout(scanLoop, QR_SCAN_INTERVAL_MS);
        };
        scanLoop();
        qrControls = { stop: () => { stopped = true; clearTimeout(timer); overlay.classList.remove('active'); } };
        return true;
    } catch (err) {
        console.error('[QR] BarcodeDetector failed:', err);
        stopQRStream();
        return false;
    }
}

// 2) الاحتياطي: ZXing مع حصر الصيغ ودقة أعلى
async function startWithZXing(overlay, video) {
    let Z;
    try { Z = await loadZXing(); } catch (err) {
        console.warn('[QR] ZXing غير متاح');
        return false;
    }
    try {
        const F = Z.BarcodeFormat, H = Z.DecodeHintType;
        const hints = new Map();
        hints.set(H.POSSIBLE_FORMATS, [F.QR_CODE, F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128, F.DATA_MATRIX]);
        hints.set(H.TRY_HARDER, true);
        const reader = new Z.BrowserMultiFormatReader(hints, QR_ZXING_INTERVAL_MS);
        const onResult = (result) => {
            if (result) handleQRResult(result.getText(), result.getBarcodeFormat ? String(result.getBarcodeFormat()) : 'QR');
        };

        overlay.classList.add('active');
        updateNativeStatus('qrStatus', '\u{1F50D} يبحث...');
        showToast('\u{1F4F7} وجه الكاميرا نحو QR أو Barcode');

        if (typeof reader.decodeFromConstraints === 'function') {
            reader.decodeFromConstraints(QR_VIDEO_CONSTRAINTS, video, onResult);
        } else {
            const devices = await reader.listVideoInputDevices();
            const back = devices.find(d => /back|environment|rear/i.test(d.label));
            const deviceId = back ? back.deviceId : (devices[devices.length - 1]?.deviceId || undefined);
            reader.decodeFromVideoDevice(deviceId, video, onResult);
        }
        qrControls = { stop: () => { try { reader.reset(); } catch (e) {} } };
        setTimeout(() => { qrStream = video.srcObject; applyContinuousFocus(qrStream); }, 800);
        return true;
    } catch (err) {
        console.error('[QR] ZXing start failed:', err);
        stopQRStream();
        return false;
    }
}

async function startQRScanner() {
    const overlay = document.getElementById('qrScannerOverlay');
    const video = document.getElementById('qrVideo');
    if (!overlay || !video) return;

    updateNativeStatus('qrStatus', 'جارٍ التحميل...');
    if (qrControls) { try { qrControls.stop(); } catch (e) {} qrControls = null; }

    if (await startWithBarcodeDetector(overlay, video)) return;
    if (await startWithZXing(overlay, video)) return;

    updateNativeStatus('qrStatus', '\u{274C} غير مدعوم');
    showToast('\u{274C} تعذر تحميل مكتبة المسح. تأكد من الاتصال بالإنترنت أو استخدم متصفحاً حديثاً.');
    overlay.classList.remove('active');
}

"""

START = "async function startQRScanner() {"
END = "function stopQRScanner() {"


def fail(m):
    print("❌", m); sys.exit(1)


def main():
    apply = '--apply' in sys.argv
    src = os.getcwd()
    if not os.path.exists('app.js'):
        fail("شغّل السكربت داخل ~/medsearch")
    sbx = tempfile.mkdtemp(prefix='medsearch-bc-')
    path = os.path.join(sbx, 'app.js')
    shutil.copy('app.js', path)
    print("🧪 البيئة المعزولة:", sbx)

    t = open(path, encoding='utf-8').read()
    if t.count(START) != 1 or t.count(END) != 1:
        fail("لم أجد حدود الدالة بشكل فريد (قد يكون الملف عُدّل)")
    if 'startWithBarcodeDetector' in t:
        fail("التعديل مطبّق مسبقاً")
    a, b = t.index(START), t.index(END)
    if a > b:
        fail("ترتيب الدوال غير متوقع")
    t = t[:a] + NEW.strip() + "\n\n" + t[b:]
    open(path, 'w', encoding='utf-8').write(t)

    c = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    if c.returncode:
        fail("node --check فشل (مشروعك لم يُمس):\n" + c.stderr)
    for name in ['startWithBarcodeDetector', 'startWithZXing', 'startQRScanner',
                 'stopQRScanner', 'loadZXing', 'supportsBarcodeDetector']:
        if t.count('function ' + name) != 1:
            fail("الدالة %s غير موجودة أو مكررة" % name)
    print("✅ الصياغة سليمة، والدوال موجودة مرة واحدة")

    if not apply:
        print("لم يُعدَّل مشروعك. للتطبيق: python3 patch-barcode.py --apply")
        return
    ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    bak = 'app.js.bak-barcode-' + ts
    shutil.copy('app.js', bak)
    shutil.copy(path, 'app.js')
    print("💾 نسخة احتياطية:", bak)
    print("""
جرّب على جهازين (سريع وضعيف)، ثم:
  git checkout -b barcode-speed
  git add app.js && git commit -m "Barcode: BarcodeDetector first, restricted formats, auto-fallback"
  git push -u origin barcode-speed
وغيّر رقم إصدار الكاش في sw.js ليصل التحديث.""")


main()

