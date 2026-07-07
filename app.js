/**
 * ============================================================
 * MedSearch Yemen - app.js (Final Production Version)
 * ============================================================
 * محرك البحث الطبي العالمي - النسخة النهائية مع جميع التحسينات
 * 
 * @version     4.0.2
 * @author      Dr. Salah Al-Ahdal
 * @email       kaidngat4@gmail.com
 * @phone       +967 711 129 611
 * @location    الجمهورية اليمنية
 * @license     All Rights Reserved
 * ============================================================
 */

// ═══════════════════════════════════════════════════════════
// 1. الإعدادات والثوابت
// ═══════════════════════════════════════════════════════════

const APP_NAME = 'MedSearch Yemen';
const APP_SHORT_NAME = 'MedSearch';
const APP_VERSION = '4.0.2';
const DB_NAME = 'MedSearchDB';
const DB_VERSION = 1;
const THEME_KEY = 'medsearch_theme';
const INSTALL_DISMISSED_KEY = 'medsearch_install_dismissed';
const QR_HISTORY_KEY = 'medsearch_qr_history';

// مصادر تحميل ZXing (رئيسي واحتياطي)
const ZXING_CDN_PRIMARY = 'https://unpkg.com/@zxing/browser@0.1.5/umd/index.min.js';
const ZXING_CDN_FALLBACK = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js';

// ═══════════════════════════════════════════════════════════
// 2. مصادر البحث الموحدة
// ═══════════════════════════════════════════════════════════

const SEARCH_SOURCES = [
    {
        name: 'Google',
        desc: 'البحث الشامل',
        icon: '\u{1F50D}',
        color: '#4285f4',
        key: 'google',
        url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + ' medical')}`
    },
    {
        name: 'PubMed',
        desc: '+35 مليون مقالة',
        icon: '\u{1F4C4}',
        color: '#e53935',
        key: 'pubmed',
        url: (q) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`
    },
    {
        name: 'WHO',
        desc: 'منظمة الصحة العالمية',
        icon: '\u{1F30D}',
        color: '#43a047',
        key: 'who',
        url: (q) => `https://www.who.int/search?query=${encodeURIComponent(q)}`
    },
    {
        name: 'Mayo Clinic',
        desc: 'موسوعة طبية',
        icon: '\u{1F3E5}',
        color: '#ff6f00',
        key: 'mayo',
        url: (q) => `https://www.mayoclinic.org/search?q=${encodeURIComponent(q)}`
    },
    {
        name: 'WebMD',
        desc: 'صحة وأدوية',
        icon: '\u{1F4BB}',
        color: '#00acc1',
        key: 'webmd',
        url: (q) => `https://www.webmd.com/search?query=${encodeURIComponent(q)}`
    },
    {
        name: 'Medscape',
        desc: 'أخبار طبية',
        icon: '\u{1F4F0}',
        color: '#5e35b1',
        key: 'medscape',
        url: (q) => `https://www.medscape.com/search/?q=${encodeURIComponent(q)}`
    },
    {
        name: 'Drugs.com',
        desc: '+24000 دواء',
        icon: '\u{1F48A}',
        color: '#00897b',
        key: 'drugs',
        url: (q) => `https://www.drugs.com/search.php?searchterm=${encodeURIComponent(q)}`
    },
    {
        name: 'NHS',
        desc: 'خدمات بريطانية',
        icon: '\u{1F1EC}\u{1F1E7}',
        color: '#005eb8',
        key: 'nhs',
        url: (q) => `https://www.nhs.uk/search/?q=${encodeURIComponent(q)}`
    }
];

// ═══════════════════════════════════════════════════════════
// 3. قاعدة البيانات الطبية
// ═══════════════════════════════════════════════════════════

const MEDICAL_DB = {
    pharmacology: {
        name: 'قاموس علم الأدوية',
        icon: '\u{1F48A}',
        color: 'warning',
        desc: '+5000 دواء | جرعات | تفاعلات | آثار جانبية | موانع | تصنيف | آلية عمل',
        stats: ['جرعات', 'تفاعلات', 'موانع'],
        data: [
            { id: 1, name: 'باراسيتامول', nameEn: 'Paracetamol', category: 'مسكن ألم / خافض حرارة', dose: '500-1000 ملغ كل 6 ساعات', maxDose: '4000 ملغ/اليوم', sideEffects: 'غثيان، طفح، نادراً سمية كبدية', interactions: 'الكحول يزيد سمية الكبد', contraindications: 'أمراض الكبد الحادة', pregnancy: 'آمن نسبياً (فئة B)', form: 'أقراص، شراب، تحاميل، حقن', mechanism: 'تثبيط COX في الجهاز العصبي المركزي' },
            { id: 2, name: 'أموكسيسيلين', nameEn: 'Amoxicillin', category: 'مضاد حيوي (بنسلين)', dose: '500 ملغ كل 8 ساعات', maxDose: '3000 ملغ/اليوم', sideEffects: 'إسهال، غثيان، طفح، حساسية', interactions: 'ميثوتريكسات، وارفارين', contraindications: 'حساسية البنسلين', pregnancy: 'آمن (فئة B)', form: 'كبسولات، شراب، حقن', mechanism: 'تثبيط بناء جدار الخلية البكتيرية' },
            { id: 3, name: 'ميترونيدازول', nameEn: 'Metronidazole', category: 'مضاد حيوي / مضاد طفيليات', dose: '500 ملغ كل 8 ساعات', maxDose: '2000 ملغ/اليوم', sideEffects: 'طعم معدني، غثيان، صداع', interactions: 'الكحول، وارفارين', contraindications: 'الحمل (ثلاثة أشهر الأولى)', pregnancy: 'يتجنب في الثلث الأول', form: 'أقراص، جل، تحاميل، حقن', mechanism: 'تدمير الحمض النووي للكائنات الدقيقة' },
            { id: 4, name: 'أوميبرازول', nameEn: 'Omeprazole', category: 'مثبط مضخة البروتون', dose: '20-40 ملغ يومياً', maxDose: '80 ملغ/اليوم', sideEffects: 'صداع، إسهال، إمساك', interactions: 'كلوبيدوقرل، كيتوكونازول', contraindications: 'فرط الحساسية', pregnancy: 'آمن نسبياً (فئة C)', form: 'كبسولات، حقن', mechanism: 'تثبيط مضخة البروتون في المعدة' },
            { id: 5, name: 'إيبوبروفين', nameEn: 'Ibuprofen', category: 'مضاد التهاب غير ستيرويدي', dose: '400-800 ملغ كل 8 ساعات', maxDose: '3200 ملغ/اليوم', sideEffects: 'آلام معدة، قرحة، نزيف', interactions: 'أسبرين، وارفارين، كورتيزون', contraindications: 'قرحة المعدة، فشل كلوي', pregnancy: 'يتجنب (فئة D)', form: 'أقراص، شراب، جل', mechanism: 'تثبيط COX-1 و COX-2' },
            { id: 6, name: 'سيتالوبرام', nameEn: 'Citalopram', category: 'مضاد اكتئاب (SSRI)', dose: '20 ملغ يومياً', maxDose: '40 ملغ/اليوم', sideEffects: 'غثيان، أرق، صداع، تعرق', interactions: 'MAOIs، تريبتانات', contraindications: 'فرط الحساسية، MAOIs', pregnancy: 'فئة C - يحتاج تقييم', form: 'أقراص، شراب', mechanism: 'تثبيط إعادة امتصاص السيروتونين' },
            { id: 7, name: 'ميتفورمين', nameEn: 'Metformin', category: 'خافض سكر فموي', dose: '500-850 ملغ مرتين يومياً', maxDose: '2550 ملغ/اليوم', sideEffects: 'غثيان، إسهال، فقدان شهية', interactions: 'اليود المشع، كحول', contraindications: 'فشل كلوي حاد، حمضية', pregnancy: 'آمن (فئة B)', form: 'أقراص، شراب', mechanism: 'تقليل إنتاج الجلوكوز في الكبد' },
            { id: 8, name: 'أتورفاستاتين', nameEn: 'Atorvastatin', category: 'خافض كوليسترول (ستاتين)', dose: '10-20 ملغ يومياً', maxDose: '80 ملغ/اليوم', sideEffects: 'آلام عضلية، ارتفاع إنزيمات الكبد', interactions: 'جراب فروت، سيكلوسبورين', contraindications: 'أمراض الكبد النشطة', pregnancy: 'ممنوع (فئة X)', form: 'أقراص', mechanism: 'تثبيط إنزيم HMG-CoA ريدكتاز' },
            { id: 9, name: 'ليفوثيروكسين', nameEn: 'Levothyroxine', category: 'هرمون الغدة الدرقية', dose: '25-200 ميكروغرام يومياً', maxDose: 'حسب الحالة', sideEffects: 'عصبية، رعاش، عدم انتظام ضربات القلب', interactions: 'كالسيوم، حديد، سوكرالفات', contraindications: 'فرط نشاط الغدة الدرقية غير المعالج', pregnancy: 'آمن (فئة A)', form: 'أقراص', mechanism: 'استبدال هرمون T4 الطبيعي' },
            { id: 10, name: 'لوسارتان', nameEn: 'Losartan', category: 'مضاد ارتفاع ضغط (ARB)', dose: '50 ملغ يومياً', maxDose: '100 ملغ/اليوم', sideEffects: 'دوخة، ارتفاع بوتاسيوم', interactions: 'مكملات البوتاسيوم، NSAIDs', contraindications: 'الحمل (فئة D)', pregnancy: 'ممنوع في الحمل', form: 'أقراص', mechanism: 'حصر مستقبلات أنجيوتنسين II' }
        ]
    },
    diseases: {
        name: 'قاموس الأمراض',
        icon: '\u{1F9A0}',
        color: 'danger',
        desc: '+3000 مرض | أعراض | تشخيص | علاج | مضاعفات | وقاية',
        stats: ['أعراض', 'علاج', 'وقاية'],
        data: [
            { id: 1, name: 'السكري نوع 2', nameEn: 'Type 2 Diabetes', category: 'الغدد الصماء', symptoms: 'عطش، كثرة تبول، تعب، جوع، ضبابية رؤية', causes: 'مقاومة الإنسولين، سمنة، وراثة، قلة النشاط', diagnosis: 'سكر صائم >126، HbA1c >6.5%', treatment: 'ميتفورمين، نظام غذائي، رياضة، إنسولين', complications: 'أمراض قلب، فشل كلوي، عمى، بتر', prevention: 'وزن صحي، رياضة، غذاء متوازن' },
            { id: 2, name: 'ارتفاع ضغط الدم', nameEn: 'Hypertension', category: 'القلب والشرايين', symptoms: 'غالباً لا أعراض، صداع، دوخة، نزيف أنفي', causes: 'وراثة، ملح زائد، سمنة، تدخين، إجهاد', diagnosis: 'ضغط >140/90 ملم زئبقي (متوسط 3 قراءات)', treatment: 'مدرات، محصرات بيتا، مثبطات ACE', complications: 'جلطة، نزيف دماغي، فشل كلوي، قصور قلب', prevention: 'تقليل الملح، رياضة، وزن صحي، ترك التدخين' },
            { id: 3, name: 'الربو', nameEn: 'Asthma', category: 'الجهاز التنفسي', symptoms: 'صفير، ضيق تنفس، سعال، شعور بضيق الصدر', causes: 'حساسية، وراثة، تلوث، عدوى تنفسية', diagnosis: 'قياس التنفس (Spirometry)، اختبار الحساسية', treatment: 'بخاخات موسعة، كورتيزون استنشاقي، مضادات اللوكوترايين', complications: 'نوبات حادة، فشل تنفسي، تغيرات رئوية دائمة', prevention: 'تجنب المحفزات، لقاح الإنفلونزا' },
            { id: 4, name: 'فقر الدم', nameEn: 'Anemia', category: 'الدم', symptoms: 'تعب، شحوب، دوخة، ضيق تنفس، سرعة نبض', causes: 'نقص حديد، نقص B12، نزيف، أمراض مزمنة', diagnosis: 'Hb <13 (رجال) <12 (نساء)، Ferritin', treatment: 'حديد فموي/حقن، B12، علاج السبب', complications: 'فشل قلب، ضعف مناعة، تأخر نمو', prevention: 'غذاء غني بالحديد، فيتامينات' },
            { id: 5, name: 'التهاب المسالك البولية', nameEn: 'UTI', category: 'المسالك البولية', symptoms: 'حرقان بالتبول، كثرة تبول، دم بالبول، حمى', causes: 'E. coli، بكتيريا أخرى، قسطرة بولية', diagnosis: 'تحليل بول، زراعة بول', treatment: 'مضاد حيوي (نيتروفيورانتوين، سيفترياكسون)', complications: 'عدوى الكلى، تسمم دموي', prevention: 'شرب ماء، نظافة، تبول بعد الجماع' },
            { id: 6, name: 'التهاب الكبد الوبائي B', nameEn: 'Hepatitis B', category: 'الجهاز الهضمي', symptoms: 'إرهاق، غثيان، يرقان، بول داكن، ألم بطن', causes: 'فيروس التهاب الكبد B (HBV)', diagnosis: 'HBsAg، Anti-HBc، PCR HBV', treatment: 'تينوفوفير، إنتيفير، راقب', complications: 'تليف الكبد، سرطان الكبد', prevention: 'لقاح، دم آمن، تجنب الإبر المشتركة' }
        ]
    },
    tissues: {
        name: 'قاموس الأنسجة والخلايا',
        icon: '\u{1F52C}',
        color: 'purple',
        desc: 'أنسجة | خلايا | أعضاء | تشريح | وظائف | أنواع | تركيب',
        stats: ['أنسجة', 'خلايا', 'أعضاء'],
        data: [
            { id: 1, name: 'النسيج الطلائي', nameEn: 'Epithelial Tissue', category: 'الأنسجة الأساسية', location: 'الجلد، بطانة الأعضاء، الغدد، الأنابيب', structure: 'خلايا متراصة، غشاء قاعدي، قليلة مادة بين خلوية', function: 'حماية، إفراز، امتصاص، حس، تبولين', types: 'حرشفي، مكعب، عمادي، انتقالي، حشوي', cells: 'خلايا كيراتينية، خلايا كأسية، خلايا قاعدية' },
            { id: 2, name: 'النسيج الضام', nameEn: 'Connective Tissue', category: 'الأنسجة الأساسية', location: 'جميع أنحاء الجسم، بين الأعضاء', structure: 'خلايا متفرقة، مادة بين خلوية غنية، ألياف', function: 'دعم، ربط، حماية، تخزين، نقل', types: 'رخو، كثيف، دهني، غضروفي، عظمي، دموي، لمفي', cells: 'أرومات ليفية، خلايا دهنية، خلايا دم' },
            { id: 3, name: 'النسيج العضلي', nameEn: 'Muscle Tissue', category: 'الأنسجة الأساسية', location: 'العضلات، القلب، الأعضاء المجوفة', structure: 'ألياف طويلة، أكتين وميوسين، ساركوميرات', function: 'الحركة، الانقباض، ضخ الدم، هضم', types: 'هيكلي (إرادي)، قلبي، أملس (لا إرادي)', cells: 'خلايا عضلية، خلايا قلبية' },
            { id: 4, name: 'النسيج العصبي', nameEn: 'Nervous Tissue', category: 'الأنسجة الأساسية', location: 'الدماغ، النخاع الشوكي، الأعصاب', structure: 'خلايا عصبية (عصبونات)، خلايا دبقية', function: 'نقل الإشارات، معالجة المعلومات، تحكم', types: 'حسية، حركية، رابطة', cells: 'عصبونات، خلايا شوان، خلايا نجمية' },
            { id: 5, name: 'الغضروف الهياليني', nameEn: 'Hyaline Cartilage', category: 'الأنسجة الضامة المتخصصة', location: 'أطراف العظام، الأنف، القصبة الهوائية، الحنجرة', structure: 'خلايا غضروفية في حفر، مادة أساسية زجاجية', function: 'تقليل الاحتكاك، امتصاص الصدمات، دعم', types: 'هياليني، ليفي، مرن', cells: 'خلايا غضروفية (Chondrocytes)' }
        ]
    },
    labs: {
        name: 'قاموس المختبرات',
        icon: '\u{1F9EA}',
        color: 'info',
        desc: '+2000 تحليل | قيم طبيعية | تفسير | دواعي | عينة',
        stats: ['قيم طبيعية', 'طريقة', 'تفسير'],
        data: [
            { id: 1, name: 'تعداد الدم الكامل', nameEn: 'CBC', category: 'تحاليل الدم', normalValues: 'WBC: 4000-11000، Hb: 13-17 غ/دل، PLT: 150-450 ألف', specimen: 'دم كامل (EDTA)', preparation: 'لا يحتاج صيام', turnaround: '1-2 ساعة', indications: 'فحص روتيني، فقر دم، عدوى، نزيف' },
            { id: 2, name: 'سكر الدم الصائم', nameEn: 'FBS', category: 'تحاليل السكر', normalValues: '70-110 ملغ/دل', specimen: 'دم (مصل)', preparation: 'صيام 8-12 ساعة', turnaround: '1 ساعة', indications: 'تشخيص ومتابعة السكري، فحص روتيني' },
            { id: 3, name: 'وظائف الكبد', nameEn: 'LFT', category: 'تحاليل الكبد', normalValues: 'ALT: 10-40، AST: 10-40، ALP: 40-130، Bilirubin: 0.3-1.2', specimen: 'دم (مصل)', preparation: 'لا يحتاج صيام', turnaround: '2-4 ساعات', indications: 'أمراض الكبد، يرقان، مراقبة الأدوية' },
            { id: 4, name: 'وظائف الكلى', nameEn: 'RFT', category: 'تحاليل الكلى', normalValues: 'Creatinine: 0.7-1.3، BUN: 7-20، eGFR: >90', specimen: 'دم (مصل)', preparation: 'لا يحتاج صيام', turnaround: '2-4 ساعات', indications: 'فشل كلوي، مرض السكري، ضغط دم' },
            { id: 5, name: 'الدهون في الدم', nameEn: 'Lipid Profile', category: 'تحاليل الدهون', normalValues: 'Cholesterol: <200، LDL: <100، HDL: >40، TG: <150', specimen: 'دم (مصل)', preparation: 'صيام 12 ساعة', turnaround: '2-4 ساعات', indications: 'تقييم خطر القلب، مراقبة العلاج' },
            { id: 6, name: 'تخثر الدم', nameEn: 'Coagulation Profile', category: 'تحاليل التخثر', normalValues: 'PT: 11-13.5 ثانية، INR: 0.8-1.2، aPTT: 25-35 ثانية', specimen: 'دم (سيترات)', preparation: 'لا يحتاج صيام', turnaround: '1-2 ساعة', indications: 'قبل العمليات، مراقبة الوارفارين، نزيف' }
        ]
    }
};

// ═══════════════════════════════════════════════════════════
// 4. الحالة العامة
// ═══════════════════════════════════════════════════════════

let currentTheme = 'light';
let currentDictionary = null;
let currentLetter = 'all';
let dictionarySearchResults = [];
let lastQuery = '';
let deferredPrompt = null;
let installDismissed = false;
let wakeLock = null;
let recognition = null;
let qrStream = null;
let qrScanInterval = null;
let qrControls = null;
let torchOn = false;
let db = null;
let toastTimeout = null;
let zxingLoaded = false;

// ═══════════════════════════════════════════════════════════
// 5. التهيئة الرئيسية
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(savedTheme);
    initServiceWorker();
    initOfflineDetection();
    initInstallPrompt();
    initScrollEffects();
    initRippleEffect();
    initSpeechRecognition();
    initIndexedDB();
    initBadging();
    initKeyboardShortcuts();
    populateGlobalSources();
    populateHomeSources();
    populateDictionaryCards();
    printConsoleSignature();
}

// ═══════════════════════════════════════════════════════════
// 6. Service Worker
// ═══════════════════════════════════════════════════════════

function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log(`[SW] Registered: ${reg.scope}`))
        .catch((err) => console.warn('[SW] Registration failed:', err));
}

// ═══════════════════════════════════════════════════════════
// 7. التنقل بين الصفحات
// ═══════════════════════════════════════════════════════════

const PAGE_MAP = { home: 'homePage', dictionaries: 'dictionariesPage', native: 'nativePage' };
const NAV_INDEX = { home: 0, dictionaries: 1, pharmacology: 2, diseases: 3, tissues: 4, labs: 5, native: 6 };

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.opacity = '';
    });
    const pageId = PAGE_MAP[page];
    if (pageId) {
        const pageEl = document.getElementById(pageId);
        if (pageEl) pageEl.classList.add('active');
    }
    updateActiveNav(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const externalPanel = document.getElementById('externalResultsPanel');
    if (externalPanel) externalPanel.classList.remove('active');
}

function updateActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const navLinks = document.querySelectorAll('.nav-link');
    const idx = NAV_INDEX[page];
    if (idx !== undefined && navLinks[idx]) navLinks[idx].classList.add('active');
}

function showDictionary(type) {
    currentDictionary = type;
    const dict = MEDICAL_DB[type];
    if (!dict) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const detailPage = document.getElementById('dictionaryDetailPage');
    if (detailPage) detailPage.classList.add('active');
    updateActiveNav(type);
    currentLetter = 'all';
    dictionarySearchResults = [];
    renderDictionaryPage(dict, type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════
// 8. تعبئة الواجهة
// ═══════════════════════════════════════════════════════════

function populateHomeSources() {
    const container = document.getElementById('homeSourceGrid');
    if (!container) return;
    container.innerHTML = SEARCH_SOURCES.map(s =>
        `<button class="source-btn" onclick="searchDirect('${s.key}')">${s.icon} ${s.name}</button>`
    ).join('');
}

function populateDictionaryCards() {
    const homeGrid = document.getElementById('homeDictionaryGrid');
    const dictPageGrid = document.getElementById('dictPageGrid');
    const cardHTML = Object.entries(MEDICAL_DB).map(([key, dict]) => {
        const statsHTML = dict.stats.map(s => `<span class="dictionary-stat">${s}</span>`).join('');
        return `
        <div class="dictionary-card ${key}" onclick="showDictionary('${key}')">
            <div class="dictionary-icon">${dict.icon}</div>
            <div class="dictionary-name">${dict.name}</div>
            <div class="dictionary-desc">${dict.desc}</div>
            <div class="dictionary-stats">${statsHTML}</div>
        </div>`;
    }).join('');
    if (homeGrid) homeGrid.innerHTML = cardHTML;
    if (dictPageGrid) dictPageGrid.innerHTML = cardHTML;
}

function populateGlobalSources() {
    const container = document.getElementById('globalSourcesGrid');
    if (!container) return;
    const globalSources = [
        { name: 'WHO', desc: 'منظمة الصحة العالمية', icon: '\u{1F30D}', color: '#43a047', url: 'https://www.who.int/' },
        { name: 'PubMed', desc: '+35 مليون مقالة علمية', icon: '\u{1F4C4}', color: '#e53935', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
        { name: 'Mayo Clinic', desc: 'موسوعة طبية شاملة', icon: '\u{1F3E5}', color: '#ff6f00', url: 'https://www.mayoclinic.org/' },
        { name: 'WebMD', desc: 'صحة وأدوية وأعراض', icon: '\u{1F4BB}', color: '#00acc1', url: 'https://www.webmd.com/' },
        { name: 'Medscape', desc: 'أخبار طبية وتعليم', icon: '\u{1F4F0}', color: '#5e35b1', url: 'https://www.medscape.com/' },
        { name: 'Drugs.com', desc: '+24000 دواء', icon: '\u{1F48A}', color: '#00897b', url: 'https://www.drugs.com/' },
        { name: 'NHS', desc: 'الخدمات الصحية البريطانية', icon: '\u{1F1EC}\u{1F1E7}', color: '#005eb8', url: 'https://www.nhs.uk/' },
        { name: 'DailyMed', desc: 'نشرات أدوية FDA', icon: '\u{1F4CB}', color: '#1565c0', url: 'https://dailymed.nlm.nih.gov/' }
    ];
    container.innerHTML = globalSources.map(s => `
        <div class="external-source-card" onclick="openInNewTab('${s.url}')">
            <div class="external-source-icon" style="background:${s.color}20;color:${s.color}">${s.icon}</div>
            <div class="external-source-info">
                <div class="external-source-name">${s.name}</div>
                <div class="external-source-desc">${s.desc}</div>
            </div>
            <div class="external-source-arrow">\u{1F517}</div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════
// 9. عرض القواميس
// ═══════════════════════════════════════════════════════════

const ARABIC_LETTERS = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي'];
const COLOR_MAP = { pharmacology: 'pharma', diseases: 'disease', tissues: 'tissue', labs: 'lab' };
const LABEL_MAP = {
    category: 'التصنيف', dose: 'الجرعة', maxDose: 'الجرعة القصوى', sideEffects: 'الآثار الجانبية',
    interactions: 'التداخلات الدوائية', contraindications: 'موانع الاستعمال', pregnancy: 'الحمل والرضاعة',
    form: 'الشكل الدوائي', mechanism: 'آلية العمل', symptoms: 'الأعراض', causes: 'الأسباب',
    treatment: 'العلاج', complications: 'المضاعفات', prevention: 'الوقاية', location: 'الموقع',
    structure: 'التركيب', function: 'الوظيفة', types: 'الأنواع', cells: 'الخلايا',
    normalValues: 'القيم الطبيعية', specimen: 'العينة', preparation: 'التحضير',
    turnaround: 'مدة التحليل', indications: 'دواعي الاستعمال', diagnosis: 'التشخيص'
};

function renderDictionaryPage(dict, type) {
    const container = document.getElementById('dictionaryDetailContent');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align:center;margin-bottom:28px">
            <div style="font-family:var(--font-display);font-size:clamp(1.8rem,4vw,2.5rem);font-weight:900;color:var(--primary);margin-bottom:8px">${dict.icon} ${dict.name}</div>
            <div style="font-size:14px;color:var(--text-secondary)">${dict.data.length} عنصر طبي - ابحث محلياً أو في المصادر العالمية</div>
        </div>
        <div class="dictionary-search-box">
            <input type="text" class="dictionary-search-input" id="dictSearchInput" 
                placeholder="ابحث في ${dict.name}..." 
                onkeypress="if(event.key==='Enter')searchInDictionary('${type}')" 
                autocomplete="off" inputmode="search" aria-label="البحث في ${dict.name}">
            <button class="dictionary-search-btn" onclick="searchInDictionary('${type}')" aria-label="بحث">
                <span>\u{1F50D}</span><span>بحث</span>
            </button>
        </div>
        <div class="alphabet-nav">
            <button class="alphabet-btn active" onclick="currentLetter='all';renderFilteredResults('${type}');updateActiveBtn(this)">الكل</button>
            ${ARABIC_LETTERS.map(l => `<button class="alphabet-btn" onclick="currentLetter='${l}';renderFilteredResults('${type}');updateActiveBtn(this)">${l}</button>`).join('')}
        </div>
        <div id="filteredResultsContainer"></div>
        <div style="margin-top:24px;text-align:center;padding:20px;background:var(--primary-light);border-radius:var(--radius);border:1px solid rgba(13,115,119,0.1)">
            <div style="font-weight:800;color:var(--primary);margin-bottom:12px;font-size:15px">\u{1F310} لم تجد ما تبحث عنه؟ ابحث في المصادر العالمية:</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
                <button class="result-btn google" onclick="searchGlobal('google')">\u{1F50D} Google</button>
                <button class="result-btn pubmed" onclick="searchGlobal('pubmed')">\u{1F4C4} PubMed</button>
                <button class="result-btn who" onclick="searchGlobal('who')">\u{1F30D} WHO</button>
                <button class="result-btn mayo" onclick="searchGlobal('mayo')">\u{1F3E5} Mayo Clinic</button>
                <button class="result-btn webmd" onclick="searchGlobal('webmd')">\u{1F4BB} WebMD</button>
                <button class="result-btn medscape" onclick="searchGlobal('medscape')">\u{1F4F0} Medscape</button>
            </div>
        </div>`;
    renderFilteredResults(type);
}

function updateActiveBtn(btn) {
    if (!btn || !btn.parentElement) return;
    btn.parentElement.querySelectorAll('.alphabet-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function renderFilteredResults(type) {
    const dict = MEDICAL_DB[type];
    if (!dict) return;
    let data = dict.data;
    if (currentLetter !== 'all') data = data.filter(item => item.name.startsWith(currentLetter));
    if (dictionarySearchResults.length > 0) data = dictionarySearchResults;
    const container = document.getElementById('filteredResultsContainer');
    if (!container) return;
    if (data.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">\u{1F50D}</div><div class="empty-state-title">لا توجد نتائج</div><div class="empty-state-desc">جرب البحث في المصادر العالمية أدناه</div></div>`;
        return;
    }
    container.innerHTML = data.map((item, index) => renderDictionaryItem(item, type, index)).join('');
}

function renderDictionaryItem(item, type, index) {
    const color = COLOR_MAP[type] || 'pharma';
    const dictIcon = MEDICAL_DB[type]?.icon || '\u{1F4CB}';
    let detailsHTML = '';
    if (type === 'pharmacology') {
        detailsHTML = `<div class="result-details"><div class="detail-item"><div class="detail-label">التصنيف</div><div class="detail-value">${escapeHtml(item.category)}</div></div><div class="detail-item"><div class="detail-label">الجرعة</div><div class="detail-value">${escapeHtml(item.dose)}</div></div><div class="detail-item"><div class="detail-label">الآثار الجانبية</div><div class="detail-value">${escapeHtml(item.sideEffects)}</div></div></div>`;
    } else if (type === 'diseases') {
        detailsHTML = `<div class="result-details"><div class="detail-item"><div class="detail-label">الأعراض</div><div class="detail-value">${escapeHtml(item.symptoms)}</div></div><div class="detail-item"><div class="detail-label">الأسباب</div><div class="detail-value">${escapeHtml(item.causes)}</div></div></div>`;
    } else {
        detailsHTML = `<div class="result-details"><div class="detail-item"><div class="detail-label">الموقع/القيم</div><div class="detail-value">${escapeHtml(item.location || item.normalValues)}</div></div></div>`;
    }
    const searchTerm = encodeURIComponent((item.nameEn || item.name) + ' medical');
    return `<div class="dictionary-result-card" onclick="showItemDetail('${type}', ${item.id})" style="animation:fadeInUp 0.4s ease ${index * 0.05}s both"><div class="result-header"><div class="result-icon ${color}">${dictIcon}</div><div><div class="result-title">${escapeHtml(item.name)}</div><div class="result-subtitle">${escapeHtml(item.nameEn)}</div></div></div>${detailsHTML}<div class="result-actions"><button class="result-btn" onclick="event.stopPropagation();showItemDetail('${type}', ${item.id})"><span>\u{1F4CB}</span> تفاصيل</button><button class="result-btn google" onclick="event.stopPropagation();openInNewTab('https://www.google.com/search?q=${searchTerm}')"><span>\u{1F50D}</span> Google</button><button class="result-btn pubmed" onclick="event.stopPropagation();openInNewTab('https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(item.nameEn || item.name)}')"><span>\u{1F4C4}</span> PubMed</button></div></div>`;
}

function searchInDictionary(type) {
    const input = document.getElementById('dictSearchInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) { dictionarySearchResults = []; renderFilteredResults(type); return; }
    const dict = MEDICAL_DB[type];
    if (!dict) return;
    const lowerQuery = query.toLowerCase();
    dictionarySearchResults = dict.data.filter(item => JSON.stringify(item).toLowerCase().includes(lowerQuery));
    renderFilteredResults(type);
}

function showItemDetail(type, id) {
    const dict = MEDICAL_DB[type];
    if (!dict) return;
    const item = dict.data.find(i => i.id === id);
    if (!item) return;
    let detailsHTML = '';
    for (const [key, value] of Object.entries(item)) {
        if (['id', 'name', 'nameEn'].includes(key) || !value) continue;
        detailsHTML += `<div style="padding:12px;background:var(--bg-secondary);border-radius:10px;margin-bottom:8px;border:1px solid var(--border-light);transition:var(--transition-fast)" onmouseover="this.style.borderColor='var(--primary)';this.style.transform='translateX(-4px)'" onmouseout="this.style.borderColor='var(--border-light)';this.style.transform='translateX(0)'"><div style="font-size:11px;color:var(--text-tertiary);font-weight:800;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${LABEL_MAP[key] || key}</div><div style="font-size:14px;color:var(--text);font-weight:600;line-height:1.6">${escapeHtml(value)}</div></div>`;
    }
    const searchTerm = encodeURIComponent((item.nameEn || item.name) + ' medical');
    const modalBody = document.getElementById('modalBody');
    if (modalBody) {
        modalBody.innerHTML = `<div style="text-align:center;margin-bottom:24px"><div style="font-size:48px;margin-bottom:8px">${dict.icon}</div><h2 style="font-family:var(--font-display);font-size:24px;color:var(--text);margin:8px 0">${escapeHtml(item.name)}</h2><p style="color:var(--text-tertiary);font-size:14px">${escapeHtml(item.nameEn)}</p></div>${detailsHTML}<div style="text-align:center;margin-top:24px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="result-btn google" onclick="openInNewTab('https://www.google.com/search?q=${searchTerm}')">\u{1F50D} Google</button><button class="result-btn pubmed" onclick="openInNewTab('https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(item.nameEn || item.name)}')">\u{1F4C4} PubMed</button><button class="result-btn" onclick="closeModal()">\u{2715} إغلاق</button></div>`;
    }
    document.getElementById('detailModal')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('detailModal')?.classList.remove('active');
    document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════
// 10. البحث العالمي
// ═══════════════════════════════════════════════════════════

function performGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) { showToast('الرجاء كتابة كلمة البحث'); return; }
    lastQuery = query;
    const panel = document.getElementById('externalResultsPanel');
    const content = document.getElementById('externalResultsContent');
    const display = document.getElementById('searchQueryDisplay');
    if (!panel || !content) return;
    if (display) display.textContent = query;
    content.innerHTML = SEARCH_SOURCES.map((s, i) => `
        <div class="external-source-card" onclick="openInNewTab('${s.url(query)}')" style="animation:fadeInUp 0.3s ease ${i * 0.05}s both">
            <div class="external-source-icon" style="background:${s.color}20;color:${s.color}">${s.icon}</div>
            <div class="external-source-info"><div class="external-source-name">${s.name}</div><div class="external-source-desc">${s.desc}</div></div>
            <div class="external-source-arrow">\u{1F517}</div>
        </div>
    `).join('');
    panel.classList.add('active');
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function getQuery() {
    const input = document.getElementById('globalSearchInput');
    return input ? input.value.trim() : (lastQuery || '');
}

function openInNewTab(url) {
    if (!url) return;
    try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) { window.location.href = url; }
}

function searchDirect(sourceKey) {
    const q = getQuery();
    if (!q) { showToast('اكتب كلمة البحث أولاً'); return; }
    const source = SEARCH_SOURCES.find(s => s.key === sourceKey);
    if (source) openInNewTab(source.url(q));
}

function searchGlobal(source) {
    const dictInput = document.getElementById('dictSearchInput');
    const globalInput = document.getElementById('globalSearchInput');
    const q = (dictInput ? dictInput.value.trim() : '') || (globalInput ? globalInput.value.trim() : '') || lastQuery || '';
    if (!q) { showToast('اكتب كلمة البحث أولاً'); return; }
    searchDirect(source);
}

// ═══════════════════════════════════════════════════════════
// 11. QR & Barcode Scanner – دعم متعدد المصادر + BarcodeDetector
// ═══════════════════════════════════════════════════════════

async function loadZXing() {
    if (zxingLoaded && window.ZXingBrowser) return window.ZXingBrowser;
    const urls = [ZXING_CDN_PRIMARY, ZXING_CDN_FALLBACK];
    for (const url of urls) {
        try {
            await new Promise((resolve, reject) => {
                if (window.ZXingBrowser) { zxingLoaded = true; resolve(window.ZXingBrowser); return; }
                const script = document.createElement('script');
                script.src = url;
                script.async = true;
                script.onload = () => { zxingLoaded = true; resolve(window.ZXingBrowser); };
                script.onerror = reject;
                document.head.appendChild(script);
            });
            if (window.ZXingBrowser) return window.ZXingBrowser;
        } catch (e) {
            console.warn(`[QR] فشل تحميل ZXing من ${url}`);
        }
    }
    throw new Error('جميع محاولات تحميل ZXing فشلت. تحقق من اتصالك بالإنترنت.');
}

function supportsBarcodeDetector() {
    if (!('BarcodeDetector' in window)) return false;
    try {
        const formats = await BarcodeDetector.getSupportedFormats();
        return formats.length > 0;
    } catch {
        return false;
    }
}

async function startQRScanner() {
    const overlay = document.getElementById('qrScannerOverlay');
    const video = document.getElementById('qrVideo');
    if (!overlay || !video) return;

    updateNativeStatus('qrStatus', 'جارٍ التحميل...');

    let ZXingBrowser = null;
    try {
        ZXingBrowser = await loadZXing();
    } catch (err) {
        console.warn('[QR] ZXing غير متاح، تجربة BarcodeDetector...');
    }

    if (qrControls) { try { qrControls.stop(); } catch(e){} qrControls = null; }

    if (ZXingBrowser) {
        try {
            const codeReader = new ZXingBrowser.BrowserMultiFormatReader();
            const videoInputDevices = await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
            const backCamera = videoInputDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            const selectedDeviceId = backCamera ? backCamera.deviceId : (videoInputDevices[0]?.deviceId || undefined);

            overlay.classList.add('active');
            updateNativeStatus('qrStatus', '\u{1F50D} يبحث...');
            showToast('\u{1F4F7} وجه الكاميرا نحو QR أو Barcode');

            qrControls = await codeReader.decodeFromVideoDevice(
                selectedDeviceId,
                video,
                (result, err) => {
                    if (result) {
                        handleQRResult(result.getText(), result.format);
                    }
                    if (err && err.name !== 'NotFoundException') {
                        console.warn('[QR] Scan error:', err);
                    }
                }
            );
            qrStream = video.srcObject;
            return;
        } catch (err) {
            console.error('[QR] ZXing start failed:', err);
            if (qrStream) { qrStream.getTracks().forEach(t => t.stop()); qrStream = null; }
        }
    }

    const barcodeSupported = await supportsBarcodeDetector();
    if (barcodeSupported) {
        try {
            qrStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = qrStream;
            await video.play();
            overlay.classList.add('active');
            updateNativeStatus('qrStatus', '\u{1F50D} يبحث (BarcodeDetector)...');
            showToast('\u{1F4F7} وجه الكاميرا نحو QR أو Barcode');

            const detector = new BarcodeDetector();
            const scanLoop = async () => {
                if (!overlay.classList.contains('active')) return;
                try {
                    const barcodes = await detector.detect(video);
                    if (barcodes.length > 0) {
                        const first = barcodes[0];
                        handleQRResult(first.rawValue, first.format);
                        return;
                    }
                } catch (e) { /* ignore */ }
                requestAnimationFrame(scanLoop);
            };
            scanLoop();
            qrControls = { stop: () => { overlay.classList.remove('active'); } };
            return;
        } catch (err) {
            console.error('[QR] BarcodeDetector failed:', err);
            if (qrStream) { qrStream.getTracks().forEach(t => t.stop()); qrStream = null; }
        }
    }

    updateNativeStatus('qrStatus', '\u{274C} غير مدعوم');
    showToast('\u{274C} تعذر تحميل مكتبة المسح. تأكد من الاتصال بالإنترنت أو استخدم متصفحاً حديثاً.');
    overlay.classList.remove('active');
}

function stopQRScanner() {
    const overlay = document.getElementById('qrScannerOverlay');
    const video = document.getElementById('qrVideo');

    if (qrControls) { try { qrControls.stop(); } catch(e){} qrControls = null; }
    if (qrStream) { qrStream.getTracks().forEach(track => track.stop()); qrStream = null; }
    if (overlay) overlay.classList.remove('active');
    if (video) video.srcObject = null;

    torchOn = false;
    updateNativeStatus('qrStatus', 'جاهز');
}

function handleQRResult(data, format) {
    if (qrControls) { try { qrControls.stop(); } catch(e){} qrControls = null; }
    if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
    saveQRHistory(data, format);

    const isURL = data.startsWith('http://') || data.startsWith('https://');
    const isEmail = data.startsWith('mailto:');
    const isTel = data.startsWith('tel:');
    const formatName = format || 'QR Code';

    const overlay = document.getElementById('qrScannerOverlay');
    if (overlay) overlay.classList.remove('active');

    if (isURL) {
        showToast(`\u{1F517} تم العثور على رابط (${formatName})`);
        setTimeout(() => {
            if (confirm(`فتح الرابط؟\n${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`)) {
                openInNewTab(data);
            } else {
                copyToClipboard(data);
            }
        }, 300);
    } else if (isEmail) {
        copyToClipboard(data);
        showToast(`\u{1F4E7} بريد إلكتروني تم نسخه`);
    } else if (isTel) {
        copyToClipboard(data.replace('tel:', ''));
        showToast(`\u{1F4DE} رقم هاتف تم نسخه`);
    } else {
        copyToClipboard(data);
        showToast(`\u{2705} ${formatName} تم نسخه: ${data.substring(0, 30)}${data.length > 30 ? '...' : ''}`);
    }
    updateNativeStatus('qrStatus', '\u{2705} تم القراءة');
}

async function toggleTorch() {
    if (!qrStream) { showToast('⚠️ الكاميرا غير نشطة'); return; }
    const track = qrStream.getVideoTracks()[0];
    if (!track) return;
    try {
        const capabilities = track.getCapabilities();
        if (!capabilities.torch) { showToast('⚠️ الكاميرا لا تدعم الفلاش'); return; }
        torchOn = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: torchOn }] });
        showToast(torchOn ? '\u{1F526} الفلاش مفعل' : '\u{1F526} الفلاش مطفأ');
    } catch (err) { showToast('\u{274C} خطأ في التحكم بالفلاش'); }
}

async function switchCamera() {
    stopQRScanner();
    setTimeout(() => startQRScanner(), 300);
}

function saveQRHistory(data, format) {
    try {
        const history = JSON.parse(localStorage.getItem(QR_HISTORY_KEY) || '[]');
        history.unshift({ data: data.substring(0, 500), format: format || 'QR', timestamp: new Date().toISOString(), id: Date.now() });
        localStorage.setItem(QR_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch (e) { /* silent */ }
}

function showQRHistory() {
    try {
        const history = JSON.parse(localStorage.getItem(QR_HISTORY_KEY) || '[]');
        if (history.length === 0) { showToast('\u{1F4ED} لا يوجد سجل مسح'); return; }
        let html = '<div style="max-height:300px;overflow-y:auto;">';
        history.slice(0, 10).forEach((item) => {
            const date = new Date(item.timestamp).toLocaleString('ar-SA');
            const shortData = item.data.substring(0, 40) + (item.data.length > 40 ? '...' : '');
            html += `<div style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="copyToClipboard('${escapeHtml(item.data)}');showToast('تم النسخ')">`;
            html += `<div style="font-size:11px;color:var(--text-tertiary)">${item.format} | ${date}</div>`;
            html += `<div style="font-size:13px;font-weight:600">${escapeHtml(shortData)}</div>`;
            html += `</div>`;
        });
        html += '</div>';
        const modalBody = document.getElementById('modalBody');
        if (modalBody) {
            modalBody.innerHTML = `<h3 style="margin-bottom:16px">\u{1F4DC} سجل المسح (${history.length})</h3>${html}<div style="text-align:center;margin-top:16px"><button class="result-btn" onclick="clearQRHistory();closeModal()">\u{1F5D1}\u{FE0F} مسح السجل</button><button class="result-btn" onclick="closeModal()">إغلاق</button></div>`;
        }
        document.getElementById('detailModal')?.classList.add('active');
    } catch (e) { showToast('\u{274C} خطأ في قراءة السجل'); }
}

function clearQRHistory() {
    localStorage.removeItem(QR_HISTORY_KEY);
    showToast('\u{1F5D1}\u{FE0F} تم مسح السجل');
}

// ═══════════════════════════════════════════════════════════
// 12. البحث الصوتي
// ═══════════════════════════════════════════════════════════

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        updateNativeStatus('voiceStatus', 'غير مدعوم');
        return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.value = transcript;
        const voiceBtn = document.getElementById('voiceSearchBtn');
        if (voiceBtn) voiceBtn.classList.remove('listening');
        updateNativeStatus('voiceStatus', 'تم التعرف');
        showToast(`\u{1F3A4} تم التعرف: ${transcript}`);
        performGlobalSearch();
    };

    recognition.onerror = (e) => {
        const voiceBtn = document.getElementById('voiceSearchBtn');
        if (voiceBtn) voiceBtn.classList.remove('listening');
        const errorMsg = e.error === 'not-allowed' ? 'تم رفض الميكروفون' : 
                        e.error === 'no-speech' ? 'لم يتم اكتشاف كلام' : 'خطأ في التعرف';
        updateNativeStatus('voiceStatus', 'خطأ');
        showToast(`\u{274C} ${errorMsg}`);
    };

    recognition.onend = () => {
        const voiceBtn = document.getElementById('voiceSearchBtn');
        if (voiceBtn) voiceBtn.classList.remove('listening');
    };
}

function startVoiceSearch() {
    if (!recognition) {
        showToast('\u{274C} التعرف الصوتي غير مدعوم');
        updateNativeStatus('voiceStatus', 'غير مدعوم');
        return;
    }
    const voiceBtn = document.getElementById('voiceSearchBtn');
    if (voiceBtn) voiceBtn.classList.add('listening');
    updateNativeStatus('voiceStatus', 'يستمع...');
    try {
        recognition.start();
        showToast('\u{1F3A4} استمع الآن... تحدث بوضوح');
    } catch (e) {
        if (voiceBtn) voiceBtn.classList.remove('listening');
        updateNativeStatus('voiceStatus', 'خطأ');
        showToast('\u{274C} خطأ في بدء الاستماع');
    }
}

// ═══════════════════════════════════════════════════════════
// 13. Web Share
// ═══════════════════════════════════════════════════════════

async function shareApp() {
    const shareData = {
        title: `${APP_NAME} - محرك البحث الطبي العالمي`,
        text: `تطبيق ${APP_NAME} - قواميس طبية شاملة ومصادر عالمية`,
        url: window.location.href
    };
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('\u{2705} تمت المشاركة بنجاح');
            updateNativeStatus('shareStatus', 'تمت');
        } catch (err) {
            if (err.name !== 'AbortError') showToast('\u{274C} خطأ في المشاركة');
        }
    } else {
        copyToClipboard(window.location.href);
        showToast('\u{1F4CB} تم نسخ الرابط');
        updateNativeStatus('shareStatus', 'تم النسخ');
    }
}

// ═══════════════════════════════════════════════════════════
// 14. Clipboard
// ═══════════════════════════════════════════════════════════

async function copyToClipboard(text) {
    const content = text || `${APP_NAME}: ${window.location.href}`;
    try {
        await navigator.clipboard.writeText(content);
        showToast('\u{1F4CB} تم النسخ إلى الحافظة');
        updateNativeStatus('clipboardStatus', 'تم النسخ');
    } catch (err) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = content;
            textarea.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('\u{1F4CB} تم النسخ');
            updateNativeStatus('clipboardStatus', 'تم النسخ');
        } catch (e) {
            showToast('\u{274C} فشل النسخ');
            updateNativeStatus('clipboardStatus', 'فشل');
        }
    }
}

// ═══════════════════════════════════════════════════════════
// 15. Geolocation
// ═══════════════════════════════════════════════════════════

function getLocation() {
    if (!navigator.geolocation) {
        showToast('\u{274C} تحديد الموقع غير مدعوم');
        updateNativeStatus('locationStatus', 'غير مدعوم');
        return;
    }
    updateNativeStatus('locationStatus', 'يجلب...');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            showNativeOutput(
                `\u{1F4CD} موقعك الحالي:\n` +
                `خط العرض: ${latitude.toFixed(6)}\n` +
                `خط الطول: ${longitude.toFixed(6)}\n` +
                `الدقة: ${accuracy ? accuracy.toFixed(0) : 'غير معروف'} متر\n\n` +
                `\u{1F517} ${mapsUrl}`
            );
            updateNativeStatus('locationStatus', 'تم الحصول');
            showToast('\u{1F4CD} تم تحديد الموقع');
        },
        (err) => {
            const errorMap = {
                [err.PERMISSION_DENIED]: 'تم رفض الإذن',
                [err.POSITION_UNAVAILABLE]: 'الموقع غير متاح',
                [err.TIMEOUT]: 'انتهى الوقت'
            };
            showToast(`\u{274C} ${errorMap[err.code] || 'خطأ غير معروف'}`);
            updateNativeStatus('locationStatus', 'خطأ');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
}

// ═══════════════════════════════════════════════════════════
// 16. Battery API
// ═══════════════════════════════════════════════════════════

async function getBatteryInfo() {
    if (!navigator.getBattery) {
        showToast('\u{274C} Battery API غير مدعوم');
        updateNativeStatus('batteryStatus', 'غير مدعوم');
        return;
    }
    try {
        const battery = await navigator.getBattery();
        const level = Math.round(battery.level * 100);
        const charging = battery.charging ? '\u{26A1} يشحن' : '\u{1F50B} يعمل على البطارية';
        let timeStr = '';
        if (battery.charging && isFinite(battery.chargingTime)) timeStr = `${Math.round(battery.chargingTime / 60)} دقيقة حتى الامتلاء`;
        else if (!battery.charging && isFinite(battery.dischargingTime)) timeStr = `${Math.round(battery.dischargingTime / 60)} دقيقة متبقية`;
        showNativeOutput(
            `\u{1F50B} حالة البطارية:\n` +
            `المستوى: ${level}%\n` +
            `الحالة: ${charging}\n` +
            `${timeStr ? 'الوقت: ' + timeStr : ''}`
        );
        updateNativeStatus('batteryStatus', `${level}%`);
        showToast(`\u{1F50B} البطارية: ${level}%`);
    } catch (err) {
        showToast('\u{274C} خطأ في قراءة البطارية');
        updateNativeStatus('batteryStatus', 'خطأ');
    }
}

// ═══════════════════════════════════════════════════════════
// 17. Network Info
// ═══════════════════════════════════════════════════════════

function getNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isOnline = navigator.onLine;
    let info = `\u{1F4F6} معلومات الشبكة:\nمتصل: ${isOnline ? 'نعم \u{2705}' : 'لا \u{274C}'}`;
    if (conn) {
        info += `\nنوع الاتصال: ${conn.effectiveType || 'غير معروف'}`;
        info += `\nسرعة التنزيل: ${(conn.downlink || 0).toFixed(1)} Mbps`;
        info += `\nRTT: ${conn.rtt || 0} ms`;
        info += `\nتوفير البيانات: ${conn.saveData ? 'مفعل' : 'معطل'}`;
    }
    showNativeOutput(info);
    updateNativeStatus('networkStatus', conn ? (conn.effectiveType || 'متصل') : (isOnline ? 'متصل' : 'غير متصل'));
}

// ═══════════════════════════════════════════════════════════
// 18. Vibration
// ═══════════════════════════════════════════════════════════

function vibrateDevice() {
    if (!navigator.vibrate) {
        showToast('\u{274C} الاهتزاز غير مدعوم');
        updateNativeStatus('vibrateStatus', 'غير مدعوم');
        return;
    }
    try {
        navigator.vibrate([100, 50, 100, 50, 200]);
        showToast('\u{1F4F3} اهتزاز الجهاز');
        updateNativeStatus('vibrateStatus', 'اهتز');
    } catch (e) {
        updateNativeStatus('vibrateStatus', 'خطأ');
    }
}

// ═══════════════════════════════════════════════════════════
// 19. Wake Lock
// ═══════════════════════════════════════════════════════════

async function requestWakeLock() {
    if (!('wakeLock' in navigator)) {
        showToast('\u{274C} Wake Lock غير مدعوم');
        updateNativeStatus('wakeStatus', 'غير مدعوم');
        return;
    }
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        showToast('\u{1F512} الشاشة ستبقى نشطة');
        updateNativeStatus('wakeStatus', 'مفعل');
        wakeLock.addEventListener('release', () => {
            updateNativeStatus('wakeStatus', 'مطلق');
            wakeLock = null;
        });
    } catch (err) {
        showToast(`\u{274C} خطأ في Wake Lock: ${err.message || ''}`);
        updateNativeStatus('wakeStatus', 'خطأ');
    }
}

// ═══════════════════════════════════════════════════════════
// 20. Fullscreen
// ═══════════════════════════════════════════════════════════

function requestFullscreen() {
    const elem = document.documentElement;
    try {
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
        else {
            showToast('\u{274C} ملء الشاشة غير مدعوم');
            updateNativeStatus('fullscreenStatus', 'غير مدعوم');
            return;
        }
        showToast('\u{26F6} وضع ملء الشاشة');
        updateNativeStatus('fullscreenStatus', 'مفعل');
    } catch (e) {
        showToast('\u{274C} خطأ في ملء الشاشة');
        updateNativeStatus('fullscreenStatus', 'خطأ');
    }
}

// ═══════════════════════════════════════════════════════════
// 21. Orientation Lock
// ═══════════════════════════════════════════════════════════

function lockOrientation() {
    if (screen.orientation?.lock) {
        screen.orientation.lock('portrait')
            .then(() => {
                showToast('\u{1F504} تم تثبيت الاتجاه العمودي');
                updateNativeStatus('orientationStatus', 'مثبت');
            })
            .catch(() => {
                showToast('\u{274C} لا يمكن تثبيت الاتجاه');
                updateNativeStatus('orientationStatus', 'خطأ');
            });
    } else if (screen.lockOrientation) {
        try {
            screen.lockOrientation('portrait');
            showToast('\u{1F504} تم تثبيت الاتجاه العمودي');
            updateNativeStatus('orientationStatus', 'مثبت');
        } catch (e) {
            showToast('\u{274C} لا يمكن تثبيت الاتجاه');
            updateNativeStatus('orientationStatus', 'خطأ');
        }
    } else {
        showToast('\u{274C} تثبيت الاتجاه غير مدعوم');
        updateNativeStatus('orientationStatus', 'غير مدعوم');
    }
}

// ═══════════════════════════════════════════════════════════
// 22. Push Notifications
// ═══════════════════════════════════════════════════════════

function requestPushNotifications() {
    if (!('Notification' in window)) {
        showToast('\u{274C} الإشعارات غير مدعومة');
        updateNativeStatus('pushStatus', 'غير مدعوم');
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showToast('\u{2705} تم تفعيل الإشعارات');
            updateNativeStatus('pushStatus', 'مفعل');
            try {
                new Notification(APP_NAME, {
                    body: '\u{2705} الإشعارات تعمل بنجاح!',
                    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%230d7377" width="100" height="100" rx="20"/%3E%3Ctext x="50" y="68" font-size="60" text-anchor="middle" fill="white"%3E\u{2695}%3C/text%3E%3C/svg%3E',
                    tag: 'test-notification'
                });
            } catch (e) { /* silent */ }
        } else if (permission === 'denied') {
            showToast('\u{274C} تم رفض الإشعارات');
            updateNativeStatus('pushStatus', 'مرفوض');
        } else {
            updateNativeStatus('pushStatus', 'مغلق');
        }
    }).catch(() => {
        showToast('\u{274C} خطأ في طلب الإشعارات');
        updateNativeStatus('pushStatus', 'خطأ');
    });
}

// ═══════════════════════════════════════════════════════════
// 23. Native Output Helper
// ═══════════════════════════════════════════════════════════

function showNativeOutput(text) {
    const output = document.getElementById('nativeOutput');
    if (output) {
        output.textContent = text;
        output.style.display = 'block';
        output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function updateNativeStatus(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
}

// ═══════════════════════════════════════════════════════════
// 24. IndexedDB
// ═══════════════════════════════════════════════════════════

function initIndexedDB() {
    if (!window.indexedDB) {
        console.warn('IndexedDB not supported');
        return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => console.warn('[DB] Open error');
    request.onsuccess = (e) => {
        db = e.target.result;
        console.log('[DB] Ready');
    };
    request.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains('searches')) {
            database.createObjectStore('searches', { keyPath: 'id', autoIncrement: true });
        }
        if (!database.objectStoreNames.contains('favorites')) {
            database.createObjectStore('favorites', { keyPath: 'id', autoIncrement: true });
        }
    };
}

function saveToLocalDB() {
    if (!db) {
        showToast('\u{274C} قاعدة البيانات غير جاهزة');
        updateNativeStatus('dbSaveStatus', 'خطأ');
        return;
    }
    try {
        const tx = db.transaction(['searches'], 'readwrite');
        const store = tx.objectStore('searches');
        store.add({
            query: lastQuery || 'test',
            timestamp: new Date().toISOString(),
            type: currentDictionary || 'global'
        });
        showToast('\u{2705} تم الحفظ في قاعدة البيانات المحلية');
        updateNativeStatus('dbSaveStatus', 'تم الحفظ');
    } catch (err) {
        showToast('\u{274C} خطأ في الحفظ');
        updateNativeStatus('dbSaveStatus', 'خطأ');
    }
}

function loadFromLocalDB() {
    if (!db) {
        showToast('\u{274C} قاعدة البيانات غير جاهزة');
        updateNativeStatus('dbLoadStatus', 'خطأ');
        return;
    }
    try {
        const tx = db.transaction(['searches'], 'readonly');
        tx.objectStore('searches').getAll().onsuccess = (e) => {
            const data = e.target.result;
            showNativeOutput(`\u{1F4C2} البيانات المحفوظة:\n${JSON.stringify(data.slice(-5), null, 2)}`);
            updateNativeStatus('dbLoadStatus', `${data.length} سجل`);
        };
    } catch (err) {
        showToast('\u{274C} خطأ في الاسترجاع');
        updateNativeStatus('dbLoadStatus', 'خطأ');
    }
}

function clearLocalDB() {
    if (!db) {
        showToast('\u{274C} قاعدة البيانات غير جاهزة');
        updateNativeStatus('clearStatus', 'خطأ');
        return;
    }
    try {
        const tx = db.transaction(['searches', 'favorites'], 'readwrite');
        tx.objectStore('searches').clear();
        tx.objectStore('favorites').clear();
        showToast('\u{1F5D1}\u{FE0F} تم مسح التخزين المحلي');
        updateNativeStatus('clearStatus', 'تم المسح');
    } catch (err) {
        showToast('\u{274C} خطأ في المسح');
        updateNativeStatus('clearStatus', 'خطأ');
    }
}

function exportData() {
    if (!db) {
        showToast('\u{274C} قاعدة البيانات غير جاهزة');
        updateNativeStatus('exportStatus', 'خطأ');
        return;
    }
    try {
        const tx = db.transaction(['searches'], 'readonly');
        tx.objectStore('searches').getAll().onsuccess = (e) => {
            const data = e.target.result;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'medsearch-yemen-data.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('\u{1F4E5} تم تصدير البيانات');
            updateNativeStatus('exportStatus', 'تم التصدير');
        };
    } catch (err) {
        showToast('\u{274C} خطأ في التصدير');
        updateNativeStatus('exportStatus', 'خطأ');
    }
}

// ═══════════════════════════════════════════════════════════
// 25. PWA Install
// ═══════════════════════════════════════════════════════════

function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (!installDismissed && !localStorage.getItem(INSTALL_DISMISSED_KEY)) {
            setTimeout(() => {
                const banner = document.getElementById('installBanner');
                if (banner) banner.classList.add('show');
            }, 3000);
        }
    });
    if (window.matchMedia('(display-mode: standalone)').matches) {
        installDismissed = true;
        localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
    }
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                showToast('\u{2705} تم تثبيت التطبيق بنجاح');
                dismissInstall();
            } else {
                showToast('\u{274C} تم إلغاء التثبيت');
            }
            deferredPrompt = null;
        });
    } else {
        showToast('\u{1F4F2} أضف الصفحة إلى الشاشة الرئيسية من قائمة المتصفح');
    }
    closePwaSheet();
}

function dismissInstall() {
    installDismissed = true;
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
    const banner = document.getElementById('installBanner');
    if (banner) banner.classList.remove('show');
}

function showPwaSheet() {
    document.getElementById('pwaOverlay')?.classList.add('show');
    document.getElementById('pwaSheet')?.classList.add('show');
}

function closePwaSheet() {
    document.getElementById('pwaOverlay')?.classList.remove('show');
    document.getElementById('pwaSheet')?.classList.remove('show');
}

// ═══════════════════════════════════════════════════════════
// 26. Badging API
// ═══════════════════════════════════════════════════════════

function initBadging() {
    if ('setAppBadge' in navigator) {
        try { navigator.setAppBadge(0); } catch (e) { /* silent */ }
    }
}

// ═══════════════════════════════════════════════════════════
// 27. Offline Detection
// ═══════════════════════════════════════════════════════════

function initOfflineDetection() {
    const indicator = document.getElementById('offlineIndicator');
    if (!indicator) return;
    function updateStatus() {
        if (navigator.onLine) {
            indicator.classList.remove('show');
        } else {
            indicator.classList.add('show');
            showToast('\u{26A0} أنت غير متصل بالإنترنت');
        }
    }
    window.addEventListener('online', () => {
        updateStatus();
        showToast('\u{2705} تم استعادة الاتصال');
    });
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

// ═══════════════════════════════════════════════════════════
// 28. Scroll Effects
// ═══════════════════════════════════════════════════════════

function initScrollEffects() {
    const header = document.getElementById('headerMain');
    const backToTop = document.getElementById('backToTop');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (header) header.classList.toggle('scrolled', scrollY > 10);
                if (backToTop) backToTop.classList.toggle('show', scrollY > 400);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ═══════════════════════════════════════════════════════════
// 29. Ripple Effect
// ═══════════════════════════════════════════════════════════

function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.icon-btn, .source-btn, .result-btn, .dictionary-search-btn, .global-search-btn, .alphabet-btn, .dictionary-card, .external-source-card, .native-btn, .native-feature-chip');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });
}

// ═══════════════════════════════════════════════════════════
// 30. Keyboard Shortcuts
// ═══════════════════════════════════════════════════════════

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('globalSearchInput');
            if (searchInput) { searchInput.focus(); searchInput.select(); }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            showPage('dictionaries');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            showPage('home');
        }
        if (e.key === 'Escape') {
            closeModal();
            stopQRScanner();
            closePwaSheet();
        }
    });
    document.getElementById('detailModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// ═══════════════════════════════════════════════════════════
// 31. Theme
// ═══════════════════════════════════════════════════════════

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    showToast(newTheme === 'dark' ? '\u{1F319} تم تفعيل الوضع الليلي' : '\u{2600}\u{FE0F} تم تفعيل الوضع النهاري');
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0f172a' : '#0d7377');
    const msTile = document.querySelector('meta[name="msapplication-TileColor"]');
    if (msTile) msTile.setAttribute('content', theme === 'dark' ? '#0f172a' : '#0d7377');
}

// ═══════════════════════════════════════════════════════════
// 32. Toast
// ═══════════════════════════════════════════════════════════

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ═══════════════════════════════════════════════════════════
// 33. Utilities
// ═══════════════════════════════════════════════════════════

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════
// 34. Console Signature
// ═══════════════════════════════════════════════════════════

function printConsoleSignature() {
    console.log('%c\u{2695}\u{FE0F} ' + APP_NAME + ' v' + APP_VERSION, 'font-size:24px;font-weight:bold;color:#0d7377');
    console.log('%cمحرك البحث الطبي العالمي - مع ميزات أصلية للجوال', 'font-size:14px;color:#4a5568');
    console.log('%c\u{1F468}\u{200D}\u{1F52C} Dr. Salah Al-Ahdal', 'font-size:12px;color:#d4af37');
    console.log('%c\u{1F4E7} kaidngat4@gmail.com | \u{1F4DE} 711129611 | \u{1F1FE}\u{1F1EA} الجمهورية اليمنية', 'font-size:11px;color:#64748b');
    console.log('%c\u{2705} app.js v4.0.2 - QR Scanner: ZXing + BarcodeDetector', 'font-size:12px;color:#43a047');
}

// ═══════════════════════════════════════════════════════════
// 35. Module Exports
// ═══════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_NAME, APP_VERSION, SEARCH_SOURCES, MEDICAL_DB,
        showPage, showDictionary, performGlobalSearch,
        toggleTheme, showToast, escapeHtml
    };
}