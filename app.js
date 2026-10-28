/**
 * ============================================================
 * MedSearch Yemen - app.js (Final Production Version)
 * ============================================================
 * محرك البحث الطبي العالمي - النسخة النهائية مع جميع التحسينات
 * 
 * @version     4.0.0
 * @author      Dr. Salah Al-Ahdal
 * @email       salahalahdal43@gmail.com
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
const APP_VERSION = '4.0.0';
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
        desc: 'مرجع شامل للأدوية والتداخلات الدوائية',
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
        desc: 'أدوية | جرعات | تفاعلات | آثار جانبية | موانع | تصنيف | آلية عمل',
        stats: ['جرعات', 'تفاعلات', 'موانع'],
        data: [
            { id: 1, name: 'باراسيتامول', nameEn: 'Paracetamol', category: 'مسكن ألم / خافض حرارة', dose: '500-1000 ملغ كل 6 ساعات', maxDose: '4000 ملغ/اليوم', sideEffects: 'غثيان، طفح، نادراً سمية كبدية', interactions: 'الكحول يزيد سمية الكبد', contraindications: 'أمراض الكبد الحادة', pregnancy: 'يُعد آمناً نسبياً؛ استشر الطبيب', form: 'أقراص، شراب، تحاميل، حقن', mechanism: 'تثبيط COX في الجهاز العصبي المركزي' },
            { id: 2, name: 'أموكسيسيلين', nameEn: 'Amoxicillin', category: 'مضاد حيوي (بنسلين)', dose: '500 ملغ كل 8 ساعات', maxDose: '3000 ملغ/اليوم', sideEffects: 'إسهال، غثيان، طفح، حساسية', interactions: 'ميثوتريكسات، وارفارين', contraindications: 'حساسية البنسلين', pregnancy: 'يُعد آمناً عموماً؛ استشر الطبيب', form: 'كبسولات، شراب، حقن', mechanism: 'تثبيط بناء جدار الخلية البكتيرية' },
            { id: 3, name: 'ميترونيدازول', nameEn: 'Metronidazole', category: 'مضاد حيوي / مضاد طفيليات', dose: '500 ملغ كل 8 ساعات', maxDose: '2000 ملغ/اليوم', sideEffects: 'طعم معدني، غثيان، صداع', interactions: 'الكحول، وارفارين', contraindications: 'الحمل (ثلاثة أشهر الأولى)', pregnancy: 'يتجنب في الثلث الأول', form: 'أقراص، جل، تحاميل، حقن', mechanism: 'تدمير الحمض النووي للكائنات الدقيقة' },
            { id: 4, name: 'أوميبرازول', nameEn: 'Omeprazole', category: 'مثبط مضخة البروتون', dose: '20-40 ملغ يومياً', maxDose: '80 ملغ/اليوم', sideEffects: 'صداع، إسهال، إمساك', interactions: 'كلوبيدوقرل، كيتوكونازول', contraindications: 'فرط الحساسية', pregnancy: 'يُستخدم عند الحاجة وبإشراف الطبيب', form: 'كبسولات، حقن', mechanism: 'تثبيط مضخة البروتون في المعدة' },
            { id: 5, name: 'إيبوبروفين', nameEn: 'Ibuprofen', category: 'مضاد التهاب غير ستيرويدي', dose: '400-800 ملغ كل 8 ساعات', maxDose: '1200 ملغ/اليوم (بدون وصفة)؛ حتى 2400 ملغ/اليوم بوصفة وإشراف الطبيب', sideEffects: 'آلام معدة، قرحة، نزيف', interactions: 'أسبرين، وارفارين، كورتيزون', contraindications: 'قرحة المعدة، فشل كلوي', pregnancy: 'يُتجنب، خصوصاً بعد الأسبوع 20 من الحمل', form: 'أقراص، شراب، جل', mechanism: 'تثبيط COX-1 و COX-2', source: 'NHS (ibuprofen for adults)؛ إرشادات UKMi: الحد الأعلى بوصفة 2.4 غ/اليوم' },
            { id: 6, name: 'سيتالوبرام', nameEn: 'Citalopram', category: 'مضاد اكتئاب (SSRI)', dose: '20 ملغ يومياً', maxDose: '40 ملغ/اليوم', sideEffects: 'غثيان، أرق، صداع، تعرق', interactions: 'MAOIs، تريبتانات', contraindications: 'فرط الحساسية، MAOIs', pregnancy: 'يحتاج تقييماً طبياً قبل الاستخدام', form: 'أقراص، شراب', mechanism: 'تثبيط إعادة امتصاص السيروتونين' },
            { id: 7, name: 'ميتفورمين', nameEn: 'Metformin', category: 'خافض سكر فموي', dose: '500-850 ملغ مرتين يومياً', maxDose: '2550 ملغ/اليوم', sideEffects: 'غثيان، إسهال، فقدان شهية', interactions: 'اليود المشع، كحول', contraindications: 'فشل كلوي حاد، حمضية', pregnancy: 'يُعد آمناً عموماً؛ استشر الطبيب', form: 'أقراص، شراب', mechanism: 'تقليل إنتاج الجلوكوز في الكبد' },
            { id: 8, name: 'أتورفاستاتين', nameEn: 'Atorvastatin', category: 'خافض كوليسترول (ستاتين)', dose: '10-20 ملغ يومياً', maxDose: '80 ملغ/اليوم', sideEffects: 'آلام عضلية، ارتفاع إنزيمات الكبد', interactions: 'جراب فروت، سيكلوسبورين', contraindications: 'أمراض الكبد النشطة', pregnancy: 'ممنوع في الحمل', form: 'أقراص', mechanism: 'تثبيط إنزيم HMG-CoA ريدكتاز' },
            { id: 9, name: 'ليفوثيروكسين', nameEn: 'Levothyroxine', category: 'هرمون الغدة الدرقية', dose: '25-200 ميكروغرام يومياً', maxDose: 'حسب الحالة', sideEffects: 'عصبية، رعاش، عدم انتظام ضربات القلب', interactions: 'كالسيوم، حديد، سوكرالفات', contraindications: 'فرط نشاط الغدة الدرقية غير المعالج', pregnancy: 'يُستخدم في الحمل مع متابعة الجرعة طبياً', form: 'أقراص', mechanism: 'استبدال هرمون T4 الطبيعي' },
            { id: 10, name: 'لوسارتان', nameEn: 'Losartan', category: 'مضاد ارتفاع ضغط (ARB)', dose: '50 ملغ يومياً', maxDose: '100 ملغ/اليوم', sideEffects: 'دوخة، ارتفاع بوتاسيوم', interactions: 'مكملات البوتاسيوم، NSAIDs', contraindications: 'الحمل', pregnancy: 'ممنوع في الحمل', form: 'أقراص', mechanism: 'حصر مستقبلات أنجيوتنسين II' },
            { id: 11, name: 'ديكلوفيناك', nameEn: 'Diclofenac', category: 'مضاد التهاب غير ستيرويدي', dose: 'للبالغين: 75-150 ملغ يومياً مقسمة على 2-3 جرعات بعد وجبة أو وجبة خفيفة', maxDose: '150 ملغ/اليوم', sideEffects: 'ألم بطن، غثيان، طفح؛ مع الاستخدام الطويل أو الجرعات العالية: قرحة المعدة', interactions: 'لا يُجمع مع الأسبرين أو الإيبوبروفين أو النابروكسين دون استشارة الطبيب؛ لا مشكلة مع الباراسيتامول', contraindications: 'فرط الحساسية للدواء أو لمضادات الالتهاب، نوبات الربو الشديدة، قرحة أو نزيف هضمي (راجع النشرة الكاملة)', pregnancy: 'يُتجنب، خصوصاً في الثلث الأخير من الحمل', form: 'أقراص، كبسولات، تحاميل، جل، لصقات، حقن', mechanism: 'تثبيط إنزيمات COX', source: 'NHS (diclofenac)، آخر مراجعة للصفحة: أغسطس 2024' },
            { id: 12, name: 'جليكلازيد', nameEn: 'Gliclazide', category: 'خافض سكر فموي (سلفونيل يوريا)', dose: 'للبالغين: 40-80 ملغ يومياً في البداية وتُعدَّل حسب الاستجابة؛ ما فوق 160 ملغ يُقسَّم على جرعتين مع الوجبات', maxDose: '320 ملغ/اليوم (أقراص عادية)؛ 120 ملغ/اليوم (الممتدة المفعول)', sideEffects: 'هبوط السكر، زيادة الوزن', interactions: 'وارفارين (قد يزيد تأثيره)، الكحول، مضادات الالتهاب (قد تحتاج تعديل الجرعة)', contraindications: 'السكري من النوع 1، الحماض الكيتوني السكري، قصور الكبد أو الكلى الشديد', pregnancy: 'غير مناسب في الحمل', form: 'أقراص عادية، أقراص ممتدة المفعول', mechanism: 'تحفيز إفراز الإنسولين من البنكرياس', source: 'NHS (gliclazide)؛ SmPC على medicines.org.uk' }
        ]
    },
    diseases: {
        name: 'قاموس الأمراض',
        icon: '\u{1F9A0}',
        color: 'danger',
        desc: 'أمراض | أعراض | تشخيص | علاج | مضاعفات | وقاية',
        stats: ['أعراض', 'علاج', 'وقاية'],
        data: [
            { id: 1, name: 'السكري نوع 2', nameEn: 'Type 2 Diabetes', category: 'الغدد الصماء', symptoms: 'عطش، كثرة تبول، تعب، جوع، ضبابية رؤية', causes: 'مقاومة الإنسولين، سمنة، وراثة، قلة النشاط', diagnosis: 'سكر صائم >126، HbA1c >6.5%', treatment: 'ميتفورمين، نظام غذائي، رياضة، إنسولين', complications: 'أمراض قلب، فشل كلوي، عمى، بتر', prevention: 'وزن صحي، رياضة، غذاء متوازن' },
            { id: 2, name: 'ارتفاع ضغط الدم', nameEn: 'Hypertension', category: 'القلب والشرايين', symptoms: 'غالباً لا أعراض، صداع، دوخة، نزيف أنفي', causes: 'وراثة، ملح زائد، سمنة، تدخين، إجهاد', diagnosis: 'ضغط >140/90 ملم زئبقي (متوسط 3 قراءات)', treatment: 'مدرات، محصرات بيتا، مثبطات ACE', complications: 'جلطة، نزيف دماغي، فشل كلوي، قصور قلب', prevention: 'تقليل الملح، رياضة، وزن صحي، ترك التدخين' },
            { id: 3, name: 'الربو', nameEn: 'Asthma', category: 'الجهاز التنفسي', symptoms: 'صفير، ضيق تنفس، سعال، شعور بضيق الصدر', causes: 'حساسية، وراثة، تلوث، عدوى تنفسية', diagnosis: 'قياس التنفس (Spirometry)، اختبار الحساسية', treatment: 'بخاخات موسعة، كورتيزون استنشاقي، مضادات اللوكوترايين', complications: 'نوبات حادة، فشل تنفسي، تغيرات رئوية دائمة', prevention: 'تجنب المحفزات، لقاح الإنفلونزا' },
            { id: 4, name: 'فقر الدم', nameEn: 'Anemia', category: 'الدم', symptoms: 'تعب، شحوب، دوخة، ضيق تنفس، سرعة نبض', causes: 'نقص حديد، نقص B12، نزيف، أمراض مزمنة', diagnosis: 'Hb <13 (رجال) <12 (نساء)، Ferritin', treatment: 'حديد فموي/حقن، B12، علاج السبب', complications: 'فشل قلب، ضعف مناعة، تأخر نمو', prevention: 'غذاء غني بالحديد، فيتامينات' },
            { id: 5, name: 'التهاب المسالك البولية', nameEn: 'UTI', category: 'المسالك البولية', symptoms: 'حرقان بالتبول، كثرة تبول، دم بالبول، حمى', causes: 'E. coli، بكتيريا أخرى، قسطرة بولية', diagnosis: 'تحليل بول، زراعة بول', treatment: 'مضاد حيوي (نيتروفيورانتوين، سيفترياكسون)', complications: 'عدوى الكلى، تسمم دموي', prevention: 'شرب ماء، نظافة، تبول بعد الجماع' },
            { id: 6, name: 'التهاب الكبد الوبائي B', nameEn: 'Hepatitis B', category: 'الجهاز الهضمي', symptoms: 'إرهاق، غثيان، يرقان، بول داكن، ألم بطن', causes: 'فيروس التهاب الكبد B (HBV)', diagnosis: 'HBsAg، Anti-HBc، PCR HBV', treatment: 'تينوفوفير، إنتيفير، مراقبة دورية', complications: 'تليف الكبد، سرطان الكبد', prevention: 'لقاح، دم آمن، تجنب الإبر المشتركة' }
        ]
    },
    tissues: {
        name: 'قاموس الأنسجة والخلايا',
        icon: '\u{1F52C}',
        color: 'purple',
        desc: 'أنسجة | خلايا | أعضاء | تشريح | وظائف | أنواع | تركيب',
        stats: ['أنسجة', 'خلايا', 'أعضاء'],
        data: [
            { id: 1, name: 'النسيج الطلائي', nameEn: 'Epithelial Tissue', category: 'الأنسجة الأساسية', location: 'الجلد، بطانة الأعضاء، الغدد، الأنابيب', structure: 'خلايا متراصة، غشاء قاعدي، قليلة مادة بين خلوية', function: 'حماية، إفراز، امتصاص، حس، ترشيح', types: 'حرشفي، مكعب، عمادي، انتقالي، حشوي', cells: 'خلايا كيراتينية، خلايا كأسية، خلايا قاعدية' },
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
        desc: 'تحاليل | قيم طبيعية | تفسير | دواعي | عينة',
        stats: ['قيم طبيعية', 'طريقة', 'تفسير'],
        data: [
            { id: 1, name: 'تعداد الدم الكامل', nameEn: 'CBC', category: 'تحاليل الدم', normalValues: 'WBC: 4000-11000، Hb: 13-17 (رجال)، 12-15 (نساء) غ/دل، PLT: 150-450 ألف', specimen: 'دم كامل (EDTA)', preparation: 'لا يحتاج صيام', turnaround: '1-2 ساعة', indications: 'فحص روتيني، فقر دم، عدوى، نزيف' },
            { id: 2, name: 'سكر الدم الصائم', nameEn: 'FBS', category: 'تحاليل السكر', normalValues: '70-99 ملغ/دل', specimen: 'دم (مصل)', preparation: 'صيام 8-12 ساعة', turnaround: '1 ساعة', indications: 'تشخيص ومتابعة السكري، فحص روتيني' },
            { id: 3, name: 'وظائف الكبد', nameEn: 'LFT', category: 'تحاليل الكبد', normalValues: 'ALT: 10-40، AST: 10-40، ALP: 40-130، Bilirubin: 0.3-1.2', specimen: 'دم (مصل)', preparation: 'لا يحتاج صيام', turnaround: '2-4 ساعات', indications: 'أمراض الكبد، يرقان، مراقبة الأدوية' },
            { id: 4, name: 'وظائف الكلى', nameEn: 'RFT', category: 'تحاليل الكلى', normalValues: 'Creatinine: 0.7-1.3 (رجال)، 0.6-1.1 (نساء)، BUN: 7-20، eGFR: >90', specimen: 'دم (مصل)', preparation: 'لا يحتاج صيام', turnaround: '2-4 ساعات', indications: 'فشل كلوي، مرض السكري، ضغط دم' },
            { id: 5, name: 'الدهون في الدم', nameEn: 'Lipid Profile', category: 'تحاليل الدهون', normalValues: 'Cholesterol: <200، LDL: <100، HDL: >40 (رجال)، >50 (نساء)، TG: <150', specimen: 'دم (مصل)', preparation: 'صيام 12 ساعة', turnaround: '2-4 ساعات', indications: 'تقييم خطر القلب، مراقبة العلاج' },
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
let dictionarySearchActive = false;
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
    dictionarySearchActive = false;
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
            <div class="dictionary-desc">المتوفر الآن: ${dict.data.length} | ${dict.desc}</div>
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
        { name: 'Drugs.com', desc: 'مرجع شامل للأدوية والتداخلات الدوائية', icon: '\u{1F48A}', color: '#00897b', url: 'https://www.drugs.com/' },
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
    turnaround: 'مدة التحليل', indications: 'دواعي الاستعمال', diagnosis: 'التشخيص', source: 'المرجع'
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
    if (currentLetter !== 'all') data = data.filter(item => normalizeArabic(item.name).startsWith(normalizeArabic(currentLetter)));
    if (dictionarySearchActive) data = dictionarySearchResults;
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
    if (!query) { dictionarySearchResults = []; dictionarySearchActive = false; renderFilteredResults(type); return; }
    const dict = MEDICAL_DB[type];
    if (!dict) return;
    const lowerQuery = query.toLowerCase();
    dictionarySearchActive = true;
    const nq = normalizeArabic(query);
    dictionarySearchResults = dict.data.filter(item => normalizeArabic(Object.values(item).join(' ')).includes(nq));
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
        <div class="external-source-card" onclick="openSearchSource('${s.key}')" style="animation:fadeInUp 0.3s ease ${i * 0.05}s both">
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
    if (window.ZXing && window.ZXing.BrowserMultiFormatReader) return window.ZXing;
    const urls = ['lib/zxing-library.min.js', 'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'];
    for (const url of urls) {
        try {
            await new Promise((resolve, reject) => {
                const sc = document.createElement('script');
                sc.src = url; sc.async = true;
                sc.onload = resolve; sc.onerror = reject;
                document.head.appendChild(sc);
            });
            if (window.ZXing && window.ZXing.BrowserMultiFormatReader) return window.ZXing;
        } catch (e) { console.warn('[QR] فشل تحميل', url); }
    }
    throw new Error('تعذر تحميل ZXing');
}

async function supportsBarcodeDetector() {
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
            const devices = await codeReader.listVideoInputDevices();
            const back = devices.find(d => /back|environment|rear/i.test(d.label));
            const deviceId = back ? back.deviceId : (devices[devices.length - 1]?.deviceId || undefined);

            overlay.classList.add('active');
            updateNativeStatus('qrStatus', '\u{1F50D} يبحث...');
            showToast('\u{1F4F7} وجه الكاميرا نحو QR أو Barcode');

            codeReader.decodeFromVideoDevice(deviceId, video, (result, err) => {
                if (result) handleQRResult(result.getText(), result.getBarcodeFormat ? String(result.getBarcodeFormat()) : 'QR');
            });
            qrControls = { stop: () => { try { codeReader.reset(); } catch (e) {} } };
            setTimeout(() => { qrStream = video.srcObject; }, 800);
            return;
        } catch (err) {
            console.error('[QR] ZXing start failed:', err);
            if (qrStream) { qrStream.getTracks().forEach(t => t.stop()); qrStream = null; }
        }
    }

    const barcodeSupported = await supportsBarcodeDetector();
    if (barcodeSupported) {
        try {
            qrStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
            video.srcObject = qrStream;
            await video.play();
            overlay.classList.add('active');
            updateNativeStatus('qrStatus', '\u{1F50D} يبحث (BarcodeDetector)...');
            showToast('\u{1F4F7} وجه الكاميرا نحو QR أو Barcode');

            const detector = new BarcodeDetector({ formats: ['qr_code','ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf','data_matrix','pdf417'] });
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

let _lastQR = { d: '', t: 0 };
function handleQRResult(data, format) {
    if (_lastQR.d === data && Date.now() - _lastQR.t < 3000) return;
    _lastQR = { d: data, t: Date.now() };
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
    const video = document.getElementById('qrVideo');
    const stream = (video && video.srcObject) || qrStream;
    if (!stream) { showToast('⚠️ الكاميرا غير نشطة'); return; }
    const track = stream.getVideoTracks()[0];
    if (!track) { showToast('⚠️ لا يوجد مسار فيديو'); return; }
    try {
        const caps = track.getCapabilities ? track.getCapabilities() : {};
        if (!('torch' in caps)) { showToast('⚠️ هذه الكاميرا لا تدعم الفلاش'); return; }
        torchOn = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: torchOn }] });
        showToast(torchOn ? '\u{1F526} الفلاش مفعل' : '\u{1F526} الفلاش مطفأ');
    } catch (err) {
        torchOn = false;
        showToast('\u{274C} الفلاش: ' + (err.name || 'خطأ'));
    }
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
        history.slice(0, 10).forEach((item, idx) => {
            const date = new Date(item.timestamp).toLocaleString('ar-SA');
            const shortData = item.data.substring(0, 40) + (item.data.length > 40 ? '...' : '');
            html += `<div style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="copyQRHistoryItem(${idx})">`;
            html += `<div style="font-size:11px;color:var(--text-tertiary)">${escapeHtml(item.format)} | ${date}</div>`;
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
        text: `تطبيق ${APP_NAME} - قواميس طبية مختصرة ومصادر عالمية`,
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


// ═══════════════════════════════════════════════════════════
// 16. Battery API
// ═══════════════════════════════════════════════════════════


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
    if (text === null || text === undefined || text === '') return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// توحيد الحروف العربية للبحث: أ/إ/آ -> ا ، ى -> ي ، ة -> ه ، وحذف التشكيل
function normalizeArabic(text) {
    return String(text === null || text === undefined ? '' : text)
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه');
}

// فتح مصدر بحث دون تمرير نص المستخدم داخل onclick
function openSearchSource(key) {
    const s = SEARCH_SOURCES.find(x => x.key === key);
    const q = lastQuery || getQuery();
    if (s && q) openInNewTab(s.url(q));
}

// نسخ عنصر من سجل QR بالفهرس بدل تمرير محتواه داخل onclick
function copyQRHistoryItem(idx) {
    try {
        const history = JSON.parse(localStorage.getItem(QR_HISTORY_KEY) || '[]');
        if (history[idx]) copyToClipboard(history[idx].data);
    } catch (e) { /* silent */ }
}

// ═══════════════════════════════════════════════════════════
// 34. Console Signature
// ═══════════════════════════════════════════════════════════

function printConsoleSignature() {
    console.log('%c\u{2695}\u{FE0F} ' + APP_NAME + ' v' + APP_VERSION, 'font-size:24px;font-weight:bold;color:#0d7377');
    console.log('%cمحرك البحث الطبي العالمي - مع ميزات أصلية للجوال', 'font-size:14px;color:#4a5568');
    console.log('%c\u{1F468}\u{200D}\u{1F52C} Dr. Salah Al-Ahdal', 'font-size:12px;color:#d4af37');
    console.log('%c\u{1F4E7} salahalahdal43@gmail.com | \u{1F4DE} 711129611 | \u{1F1FE}\u{1F1EA} الجمهورية اليمنية', 'font-size:11px;color:#64748b');
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


// ===== MS103: بحث محلي في القواميس + إتاحة لوحة المفاتيح =====
(function () {
    const _origSearch = performGlobalSearch;
    window.performGlobalSearch = function () {
        _origSearch();
        const input = document.getElementById('globalSearchInput');
        const content = document.getElementById('externalResultsContent');
        const q = input ? input.value.trim() : '';
        if (!q || !content) return;
        const nq = normalizeArabic(q);
        const hits = [];
        Object.entries(MEDICAL_DB).forEach(([type, dict]) => {
            dict.data.forEach(item => {
                const hay = normalizeArabic(Object.entries(item).filter(e => e[0] !== 'id').map(e => e[1]).join(' '));
                if (hay.includes(nq)) hits.push({ type, dict, item });
            });
        });
        if (!hits.length) return;
        const cards = hits.slice(0, 8).map(h =>
            `<div class="external-source-card" onclick="showItemDetail('${h.type}', ${h.item.id})">` +
            `<div class="external-source-icon" style="background:var(--primary-light)">${h.dict.icon}</div>` +
            `<div class="external-source-info"><div class="external-source-name">${escapeHtml(h.item.name)}</div>` +
            `<div class="external-source-desc">${escapeHtml(h.item.nameEn)} · ${escapeHtml(h.dict.name)}</div></div></div>`
        ).join('');
        content.insertAdjacentHTML('afterbegin',
            `<div style="font-weight:800;margin-bottom:10px;color:var(--primary)">\u{1F4DA} نتائج في القواميس (${hits.length})</div>${cards}` +
            `<div style="font-weight:800;margin:16px 0 10px;color:var(--primary)">\u{1F310} المصادر العالمية</div>`);
    };
})();

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target;
    if (el && el.getAttribute && el.getAttribute('role') === 'button' && el.tagName !== 'BUTTON') {
        e.preventDefault();
        el.click();
    }
});


// ═══════════════════════════════════════════════════════════
// Clinical Calculators v3 — تصميم أزرار + نافذة منبثقة
// ═══════════════════════════════════════════════════════════
function initClinicalCalculators() {
    if (document.getElementById('clinicalCalcPanel')) return;
    const anchor = document.querySelector('.native-panel');
    if (!anchor || !anchor.parentNode) return;

    const CALCS = [
        { id: 'gfr', icon: '\u{1F9EA}', shortName: 'تصفية الكرياتينين', 
          title: 'تصفية الكرياتينين (Cockcroft-Gault)', 
          fields: [ {id:'sex',label:'الجنس',type:'select',options:[['m','ذكر'],['f','أنثى']]}, {id:'age',label:'العمر (سنة)',type:'number'}, {id:'w',label:'الوزن (كغ)',type:'number'}, {id:'scr',label:'كرياتينين المصل',type:'number'}, {id:'unit',label:'الوحدة',type:'select',options:[['mg','mg/dL'],['umol','µmol/L']]} ],
          run: (v) => {
              let r;
              if (v.unit === 'mg') r = (140 - v.age) * v.w * (v.sex === 'f' ? 0.85 : 1) / (72 * v.scr);
              else r = (140 - v.age) * v.w * (v.sex === 'f' ? 1.04 : 1.23) / v.scr;
              return `التصفية المقدّرة: ${Number(r.toFixed(0))} مل/دقيقة\n\nتنبيه: تقدير تقريبي، راجع الطبيب.`;
          }
        },
        { id: 'bmi', icon: '\u{2696}\u{FE0F}', shortName: 'مؤشر كتلة الجسم', 
          title: 'مؤشر كتلة الجسم ومساحة السطح', 
          fields: [ {id:'h',label:'الطول (سم)',type:'number'}, {id:'w',label:'الوزن (كغ)',type:'number'} ],
          run: (v) => {
              const bmi = v.w / Math.pow(v.h / 100, 2);
              const bsa = Math.sqrt(v.h * v.w / 3600);
              const cat = bmi < 18.5 ? 'نحافة' : bmi < 25 ? 'وزن طبيعي' : bmi < 30 ? 'وزن زائد' : 'سمنة';
              const _r = (n, d) => Number(n.toFixed(d));
              const lowW = 18.5 * Math.pow(v.h / 100, 2);
              const highW = 24.9 * Math.pow(v.h / 100, 2);
              const rangeNote = v.w > highW ? 'وزنك أعلى من النطاق الصحي بحوالي ' + _r(v.w - highW, 1) + ' كغ.' : v.w < lowW ? 'وزنك أقل من النطاق الصحي بحوالي ' + _r(lowW - v.w, 1) + ' كغ.' : 'وزنك ضمن النطاق الصحي.';
              return `مؤشر كتلة الجسم: ${Number(bmi.toFixed(1))} (${cat})\nمساحة السطح: ${Number(bsa.toFixed(2))} م²\nالنطاق الصحي للوزن عند هذا الطول (BMI 18.5–24.9): ${_r(lowW, 1)} – ${_r(highW, 1)} كغ\n${rangeNote}\n\nتقدير تقريبي للبالغين فقط، ولا يصلح للحوامل أو الرياضيين ذوي الكتلة العضلية العالية.`;
          }
        },
        { id: 'iv', icon: '\u{1F4A7}', shortName: 'معدل التسريب', 
          title: 'معدل التسريب الوريدي', 
          fields: [ {id:'vol',label:'الحجم (مل)',type:'number'}, {id:'hrs',label:'المدة (ساعات)',type:'number'}, {id:'df',label:'معامل القطرة',type:'select',options:[['10','10'],['15','15'],['20','20'],['60','60']]} ],
          run: (v) => {
              const df = Number(v.df);
              return `المعدل: ${Number((v.vol/v.hrs).toFixed(1))} مل/ساعة\nالقطرات: ${Math.round(v.vol*df/(v.hrs*60))} قطرة/دقيقة\n\nتحقق من معامل القطرة.`;
          }
        },
        { id: 'conv', icon: '\u{1F501}', shortName: 'تحويل الوحدات', 
          title: 'تحويل وحدات التحاليل', 
          fields: [
              {id:'test',label:'التحليل',type:'select',options:[['glu','سكر الدم'],['cr','الكرياتينين'],['chol','الكوليسترول']]},
              {id:'dir',label:'الاتجاه',type:'select',options:[
                  ['si','من التقليدي \u2066(mg/dL)\u2069 إلى الدولي \u2066(mmol/L)\u2069'],
                  ['cv','من الدولي \u2066(mmol/L)\u2069 إلى التقليدي \u2066(mg/dL)\u2069']
              ]},
              {id:'val',label:'القيمة',type:'number'}
          ],
          run: (v) => {
              const C = {
                  glu:{f:18.016, mul:false, cv:'mg/dL', si:'mmol/L'},
                  cr:{f:88.4, mul:true, cv:'mg/dL', si:'µmol/L'},
                  chol:{f:38.67, mul:false, cv:'mg/dL', si:'mmol/L'}
              };
              const c = C[v.test]; let res, inUnit, outUnit;
              if (v.dir === 'si') {
                  res = c.mul ? v.val * c.f : v.val / c.f;
                  inUnit = c.cv;
                  outUnit = c.si;
              } else {
                  res = c.mul ? v.val / c.f : v.val * c.f;
                  inUnit = c.si;
                  outUnit = c.cv;
              }
              return `النتيجة: ${Number(res.toFixed(2))} ${outUnit}\n\nالمعادلة: تحويل من ${inUnit} إلى ${outUnit}\n\nقارن بالمدى المرجعي لمختبرك.`;
          }
        },
        { id: 'edd', icon: '\u{1F930}', shortName: 'تاريخ الولادة', 
          title: 'تاريخ الولادة المتوقع (نيجل)', 
          fields: [ {id:'lmp',label:'أول يوم لآخر دورة',type:'date'} ],
          run: (v) => {
              const p = v.lmp.split('-').map(Number);
              const lmp = Date.UTC(p[0], p[1] - 1, p[2]);
              const e = new Date(lmp + 280 * 86400000);
              const pad = (x) => String(x).padStart(2, '0');
              return `تاريخ الولادة: ${pad(e.getUTCDate())}/${pad(e.getUTCMonth()+1)}/${e.getUTCFullYear()}\n\nقاعدة 280 يوماً.`;
          }
        }
    ];

    const panel = document.createElement('div');
    panel.className = 'native-panel active';
    panel.id = 'clinicalCalcPanel';

    const title = document.createElement('div');
    title.className = 'native-panel-title';
    title.textContent = '\u{1F9EE} حاسبات سريرية';
    panel.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'native-grid';

    CALCS.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'native-btn';
        btn.innerHTML = `<span class="native-icon">${c.icon}</span><span class="native-label">${c.shortName}</span><span class="native-status">احسب</span>`;
        btn.onclick = () => openCalcModal(c);
        grid.appendChild(btn);
    });
    panel.appendChild(grid);
    anchor.parentNode.insertBefore(panel, anchor);

    // إضافة المودال (النافذة المنبثقة) إلى الصفحة
    if (!document.getElementById('calcModalOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'calcModalOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:10005;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px);';
        
        const content = document.createElement('div');
        content.id = 'calcModalContent';
        content.style.cssText = 'background:var(--bg-card);width:100%;max-width:500px;border-radius:16px;padding:20px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid var(--border);';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = 'position:absolute;top:15px;left:15px;background:transparent;border:none;color:var(--text);font-size:20px;cursor:pointer;';
        closeBtn.onclick = () => overlay.style.display = 'none';
        
        content.appendChild(closeBtn);
        
        const body = document.createElement('div');
        body.id = 'calcModalBody';
        content.appendChild(body);
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }
}

function openCalcModal(c) {
    const overlay = document.getElementById('calcModalOverlay');
    const body = document.getElementById('calcModalBody');
    if (!overlay || !body) return;

    body.innerHTML = `<h2 style="font-family:var(--font-display);font-size:20px;margin-bottom:16px;color:var(--primary);">${c.title}</h2>`;
    
    const inputs = {};
    c.fields.forEach(f => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '12px';
        
        const lab = document.createElement('label');
        lab.textContent = f.label;
        lab.style.cssText = 'display:block;font-size:14px;font-weight:bold;margin-bottom:6px;color:var(--text-secondary);';
        wrapper.appendChild(lab);

        let inp;
        if (f.type === 'select') {
            inp = document.createElement('select');
            f.options.forEach(o => {
                const op = document.createElement('option');
                op.value = o[0]; op.textContent = o[1];
                inp.appendChild(op);
            });
        } else {
            inp = document.createElement('input');
            inp.type = f.type;
            if (f.type === 'number') inp.inputMode = 'decimal';
        }
        inp.style.cssText = 'width:100%;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit;font-size:16px;';
        inputs[f.id] = inp;
        wrapper.appendChild(inp);
        body.appendChild(wrapper);
    });

    const calcBtn = document.createElement('button');
    calcBtn.textContent = 'احسب النتيجة';
    calcBtn.style.cssText = 'width:100%;padding:14px;border-radius:10px;background:var(--primary);color:#fff;border:none;font-size:16px;font-weight:bold;margin-top:10px;cursor:pointer;';
    
    const resultBox = document.createElement('div');
    resultBox.style.cssText = 'margin-top:16px;padding:16px;border-radius:10px;background:rgba(13,115,119,0.1);border:1px solid rgba(13,115,119,0.3);color:var(--text);font-size:15px;line-height:1.6;white-space:pre-line;display:none;';

    calcBtn.onclick = () => {
        try {
            const v = {};
            c.fields.forEach(f => {
                const raw = inputs[f.id].value;
                if (f.type === 'number') {
                    v[f.id] = Number(String(raw).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫,]/g, '.'));
                    if (isNaN(v[f.id])) throw new Error('أدخل أرقاماً صحيحة');
                } else {
                    v[f.id] = raw;
                    if (f.type === 'date' && !raw) throw new Error('اختر التاريخ');
                }
            });
            resultBox.style.color = 'var(--text)';
            resultBox.style.borderColor = 'rgba(13,115,119,0.3)';
            resultBox.textContent = c.run(v);
        } catch (e) {
            resultBox.style.color = '#e57373';
            resultBox.style.borderColor = '#e57373';
            resultBox.textContent = '⚠️ ' + e.message;
        }
        resultBox.style.display = 'block';
    };

    body.appendChild(calcBtn);
    body.appendChild(resultBox);
    overlay.style.display = 'flex';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClinicalCalculators);
} else {
    initClinicalCalculators();
}

const ADV_DISCLAIMER = '⚠️ أداة دعم قرار سريري فقط، ولا تغني عن الحكم الطبي. تحقق من النتائج قبل أي قرار علاجي.';

function advNum(label, raw, min, max, integer) {
    if (raw === '' || raw === null || raw === undefined) throw new Error('أدخل قيمة: ' + label);
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error('قيمة غير صالحة: ' + label);
    if (integer && !Number.isInteger(n)) throw new Error('يجب أن تكون القيمة عدداً صحيحاً: ' + label);
    if (n < min || n > max) throw new Error(label + ' خارج النطاق المعقول (' + min + '–' + max + ')');
    return n;
}

function advChoice(label, raw, allowed) {
    if (raw === '' || raw === null || raw === undefined || !allowed.includes(String(raw))) {
        throw new Error('اختر قيمة: ' + label);
    }
    return String(raw);
}

function advNEWS2(v) {
    const rr = advNum('معدل التنفس', v.rr, 1, 80, true);
    const spo2 = advNum('تشبع الأكسجين SpO2', v.spo2, 50, 100, true);
    const scale = advChoice('مقياس SpO2', v.scale, ['1', '2']);
    const onO2 = advChoice('أكسجين إضافي', v.onO2, ['true', 'false']) === 'true';
    const sbp = advNum('الضغط الانقباضي', v.sbp, 30, 300, true);
    const pulse = advNum('النبض', v.pulse, 10, 300, true);
    const cons = advChoice('مستوى الوعي', v.consciousness, ['A', 'C', 'V', 'P', 'U']);
    const temp = Math.round(advNum('الحرارة (°م)', v.temp, 25, 45) * 10) / 10;

    const p = {};
    p.rr = rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3;
    if (scale === '1') {
        p.spo2 = spo2 <= 91 ? 3 : spo2 <= 93 ? 2 : spo2 <= 95 ? 1 : 0;
    } else if (spo2 <= 83) p.spo2 = 3;
    else if (spo2 <= 85) p.spo2 = 2;
    else if (spo2 <= 87) p.spo2 = 1;
    else if (spo2 <= 92) p.spo2 = 0;
    else if (!onO2) p.spo2 = 0;
    else p.spo2 = spo2 <= 94 ? 1 : spo2 <= 96 ? 2 : 3;
    p.o2 = onO2 ? 2 : 0;
    p.sbp = sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : sbp <= 219 ? 0 : 3;
    p.pulse = pulse <= 40 ? 3 : pulse <= 50 ? 1 : pulse <= 90 ? 0 : pulse <= 110 ? 1 : pulse <= 130 ? 2 : 3;
    p.cons = cons === 'A' ? 0 : 3;
    p.temp = temp <= 35.0 ? 3 : temp <= 36.0 ? 1 : temp <= 38.0 ? 0 : temp <= 39.0 ? 1 : 2;

    const score = Object.values(p).reduce((a, b) => a + b, 0);
    const anyThree = Object.values(p).some(x => x === 3);

    let risk, resp;
    if (score >= 7) { risk = 'مرتفعة'; resp = 'استجابة طارئة: مراقبة مستمرة وتقييم عاجل من فريق ذي كفاءة في الرعاية الحرجة.'; }
    else if (score >= 5) { risk = 'متوسطة'; resp = 'استجابة عاجلة: مراجعة عاجلة من طبيب مختص بالحالات الحادة وفكّر بالتصعيد.'; }
    else if (anyThree) { risk = 'منخفضة–متوسطة'; resp = 'معيار منفرد بدرجة 3: مراجعة سريرية عاجلة في الجناح.'; }
    else if (score >= 1) { risk = 'منخفضة'; resp = 'أبلغ الممرض المسؤول وقيّم الحاجة لزيادة وتيرة المراقبة.'; }
    else { risk = 'منخفضة'; resp = 'استمر بالمراقبة الروتينية حسب سياسة المؤسسة.'; }

    const lines = ['النتيجة: ' + score + '/20', 'الخطورة: ' + risk, resp];
    if (scale === '2') lines.push('ملاحظة: المقياس 2 يُستخدم فقط بتوجيه طبيب لمن هدفه 88–92% (مثل احتباس CO₂).');
    return { score: score, risk: risk, anyThree: anyThree, lines: lines };
}

function advGCS(v) {
    const e = advNum('فتح العين', v.e, 1, 4, true);
    const vb = advNum('الاستجابة اللفظية', v.v, 1, 5, true);
    const m = advNum('الاستجابة الحركية', v.m, 1, 6, true);
    const score = e + vb + m;
    const sev = score >= 13 ? 'خفيف' : score >= 9 ? 'متوسط' : 'شديد';
    return { score: score, lines: ['المجموع: ' + score + '/15 (E' + e + ' V' + vb + ' M' + m + ')', 'التصنيف: ' + sev] };
}

function advCURB65(v) {
    const conf = advChoice('تشوش ذهني جديد', v.confusion, ['true', 'false']) === 'true';
    const unit = advChoice('وحدة اليوريا', v.ureaUnit, ['mmol', 'bun']);
    const urea = advNum('اليوريا', v.urea, 0, 500);
    const rr = advNum('معدل التنفس', v.rr, 1, 80, true);
    const sbp = advNum('الضغط الانقباضي', v.sbp, 30, 300, true);
    const dbp = advNum('الضغط الانبساطي', v.dbp, 10, 200, true);
    const age = advNum('العمر', v.age, 0, 120, true);
    const ureaHigh = unit === 'mmol' ? urea > 7 : urea > 19;
    let s = 0;
    if (conf) s++; if (ureaHigh) s++; if (rr >= 30) s++; if (sbp < 90 || dbp <= 60) s++; if (age >= 65) s++;
    let risk, sug;
    if (s <= 1) { risk = 'منخفضة'; sug = 'شدة منخفضة: العلاج المنزلي مناسب غالباً حسب الحكم السريري.'; }
    else if (s === 2) { risk = 'متوسطة'; sug = 'شدة متوسطة: فكّر بالعلاج تحت إشراف المستشفى.'; }
    else { risk = 'مرتفعة'; sug = 'شدة عالية: تنويم عاجل' + (s >= 4 ? ' وفكّر بتقييم العناية المركزة.' : '.'); }
    return { score: s, risk: risk, lines: ['النتيجة: ' + s + '/5', 'الخطورة: ' + risk, sug, 'الحكم السريري والأمراض المصاحبة والأكسجة والعوامل الاجتماعية تؤخذ بالحسبان أيضاً.'] };
}

function advCHA2DS2(v) {
    const age = advNum('العمر', v.age, 0, 120, true);
    const sex = advChoice('الجنس', v.sex, ['male', 'female']);
    let va = 0;
    if (v.chf) va++; if (v.htn) va++;
    if (age >= 75) va += 2; else if (age >= 65) va++;
    if (v.dm) va++; if (v.stroke) va += 2; if (v.vasc) va++;
    const s = va + (sex === 'female' ? 1 : 0);
    const male = sex === 'male';
    let rec;
    if (s >= (male ? 2 : 3)) rec = 'يُوصى بمضادات التخثر الفموية (ESC 2020) بعد تقييم خطر النزف.';
    else if (s === (male ? 1 : 2)) rec = 'يُنظر في مضادات التخثر الفموية (ESC 2020).';
    else rec = 'خطورة منخفضة: لا يُشار عادةً لمضادات التخثر (ESC 2020).';
    return { score: s, va: va, lines: ['CHA₂DS₂-VASc: ' + s + '/9', rec, 'CHA₂DS₂-VA (بدون الجنس، ESC 2024): ' + va + '/8'] };
}

function advHASBLED(v) {
    const age = advNum('العمر', v.age, 0, 120, true);
    let s = 0;
    ['htn', 'renal', 'liver', 'stroke', 'bleeding', 'labileINR', 'drugs', 'alcohol'].forEach(function (k) { if (v[k]) s++; });
    if (age > 65) s++;
    const risk = s >= 3 ? 'مرتفعة' : s === 2 ? 'متوسطة' : 'منخفضة';
    const lines = ['النتيجة: ' + s + '/9', 'الخطورة: ' + risk];
    if (s >= 3) lines.push('تستدعي متابعة أدق وتصحيح العوامل القابلة للتعديل؛ وليست بذاتها سبباً لمنع مضادات التخثر.');
    return { score: s, risk: risk, lines: lines };
}

function advHEART(v) {
    const h = advNum('التاريخ المرضي', v.history, 0, 2, true);
    const ecg = advNum('تخطيط القلب', v.ecg, 0, 2, true);
    const age = advNum('العمر', v.age, 0, 120, true);
    const rf = advNum('عدد عوامل الخطورة', v.riskFactors, 0, 6, true);
    const trop = advNum('التروبونين (أضعاف الحد الأعلى الطبيعي)', v.troponin, 0, 100000);
    const ath = !!v.atherosclerosis;
    let s = h + ecg;
    s += age >= 65 ? 2 : age >= 45 ? 1 : 0;
    s += (ath || rf >= 3) ? 2 : rf >= 1 ? 1 : 0;
    s += trop > 3 ? 2 : trop > 1 ? 1 : 0;
    let risk, note;
    if (s <= 3) { risk = 'منخفضة'; note = 'خطر MACE خلال 6 أسابيع نحو 1–2% في دراسات التحقق؛ يمكن التفكير بالخروج المبكر حسب المسار المحلي.'; }
    else if (s <= 6) { risk = 'متوسطة'; note = 'خطر نحو 12–17% في دراسات التحقق؛ مراقبة وفحوص إضافية.'; }
    else { risk = 'مرتفعة'; note = 'خطر نحو 50% فأكثر في دراسات التحقق؛ تنويم/استراتيجية تدخلية مبكرة حسب المسار المحلي.'; }
    return { score: s, risk: risk, lines: ['النتيجة: ' + s + '/10', 'الخطورة: ' + risk, note] };
}



// ═══════════════════════════════════════════════════════════
// Pediatric Dose Calculator (Paracetamol & Ibuprofen)
// ═══════════════════════════════════════════════════════════
function initPediatricDose() {
    const anchor = document.getElementById('clinicalCalcPanel');
    if (!anchor || document.getElementById('pediatricDosePanel')) return;

    const DRUGS = {
        paracetamol: { name: 'باراسيتامول', source: 'BNFc', mgPerKgPerDose: 15, maxMgPerDose: 1000, maxMgPerDay: 4000, dosesPerDay: 4, concentrations: { '120': 120, '250': 250 } },
        ibuprofen: { name: 'إيبوبروفين', source: 'BNFc', mgPerKgPerDose: 10, maxMgPerDose: 400, maxMgPerDay: 1200, dosesPerDay: 3, concentrations: { '100': 100 } }
    };

    const panel = document.createElement('div');
    panel.className = 'native-panel active';
    panel.id = 'pediatricDosePanel';
    panel.style.marginTop = '20px';
    panel.innerHTML = '<div class="native-panel-title">💊 حاسبة جرعات الأدوية</div>';
    const grid = document.createElement('div');
    grid.className = 'native-grid';

    Object.keys(DRUGS).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'native-btn';
        btn.innerHTML = `<span class="native-icon">💊</span><span class="native-label">${DRUGS[key].name}</span><span class="native-status">احسب الجرعة</span>`;
        btn.onclick = () => {
            const body = document.getElementById('calcModalBody');
            const overlay = document.getElementById('calcModalOverlay');
            if (!body || !overlay) return;
            body.innerHTML = `<h2 style="font-size:20px;margin-bottom:16px;color:var(--primary);">${DRUGS[key].name}</h2>`;
            
            const wWrapper = document.createElement('div');
            wWrapper.style.marginBottom = '12px';
            wWrapper.innerHTML = `<label style="display:block;font-size:14px;font-weight:bold;margin-bottom:6px;">وزن الطفل (كغ)</label>`;
            const wInput = document.createElement('input');
            wInput.type = 'number'; wInput.step = '0.1';
            wInput.style.cssText = 'width:100%;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:16px;';
            wWrapper.appendChild(wInput); body.appendChild(wWrapper);

            const cWrapper = document.createElement('div');
            cWrapper.style.marginBottom = '12px';
            cWrapper.innerHTML = `<label style="display:block;font-size:14px;font-weight:bold;margin-bottom:6px;">التركيز (mg/5mL)</label>`;
            const cSelect = document.createElement('select');
            Object.keys(DRUGS[key].concentrations).forEach(conc => {
                const op = document.createElement('option');
                op.value = DRUGS[key].concentrations[conc];
                op.textContent = `${DRUGS[key].concentrations[conc]} mg/5mL`;
                cSelect.appendChild(op);
            });
            cSelect.style.cssText = 'width:100%;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:16px;';
            cWrapper.appendChild(cSelect); body.appendChild(cWrapper);

            const calcBtn = document.createElement('button');
            calcBtn.textContent = 'احسب';
            calcBtn.style.cssText = 'width:100%;padding:14px;border-radius:10px;background:var(--primary);color:#fff;border:none;font-size:16px;font-weight:bold;cursor:pointer;margin-top:10px;';
            const out = document.createElement('div');
            out.style.cssText = 'margin-top:16px;padding:16px;border-radius:10px;background:rgba(13,115,119,0.1);white-space:pre-line;font-size:15px;display:none;';
            
            calcBtn.onclick = () => {
                try {
                    const weight = parseFloat(wInput.value);
                    const conc = parseFloat(cSelect.value);
                    if (!weight || weight < 2 || weight > 150) throw new Error('أدخل وزناً صحيحاً');
                    let dose = weight * DRUGS[key].mgPerKgPerDose;
                    let warning = '';
                    if (dose > DRUGS[key].maxMgPerDose) { dose = DRUGS[key].maxMgPerDose; warning = '⚠️ تم تحديد الجرعة عند الحد الأقصى.\n'; }
                    const vol = (dose / conc) * 5;
                    out.style.color = 'var(--text)';
                    out.textContent = `الجرعة: ${dose.toFixed(1)} ملغ\nالحجم: ${vol.toFixed(1)} مل\nعدد الجرعات: ${DRUGS[key].dosesPerDay} يومياً\n${warning}المرجع: ${DRUGS[key].source}`;
                } catch (e) { out.style.color = '#e57373'; out.textContent = '⚠️ ' + e.message; }
                out.style.display = 'block';
            };
            body.appendChild(calcBtn); body.appendChild(out); overlay.style.display = 'flex';
        };
        grid.appendChild(btn);
    });
    panel.appendChild(grid); anchor.parentNode.insertBefore(panel, anchor.nextSibling);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPediatricDose);
} else {
    initPediatricDose();
}


// ═══════════════════════════════════════════════════════════
// Barcode Handling: بحث ذكي عن الباركود (بدون بيانات وهمية)
// ═══════════════════════════════════════════════════════════
function findDrugByBarcode(barcode) {
    if (!barcode || !MEDICAL_DB || !MEDICAL_DB.drugs) return null;
    const code = String(barcode).trim();
    return MEDICAL_DB.drugs.data.find(item => 
        (item.barcode && Array.isArray(item.barcode) && item.barcode.includes(code)) || 
        (item.barcode && String(item.barcode) === code)
    ) || null;
}

const originalHandleQRResult = handleQRResult;
window.handleQRResult = function(data, format) {
    // 1. البحث في القاعدة المحلية
    const drug = findDrugByBarcode(data);
    if (drug) {
        if (typeof stopQRScanner === 'function') stopQRScanner();
        if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
        showToast(`✅ تم العثور على: ${drug.name}`);
        if (typeof showItemDetail === 'function') showItemDetail('drugs', drug.id);
        return;
    }
    
    // 2. إذا لم يوجد في القاعدة، نفتح بحث Google عن الباركود
    if (typeof stopQRScanner === 'function') stopQRScanner();
    if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
    
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(data)}`;
    showToast(`🔍 لم يتم العثور عليه محلياً. جارٍ البحث في Google...`);
    setTimeout(() => openInNewTab(searchUrl), 500);
};


// ═══════════════════════════════════════════════════════════
// Feedback System: شاركنا التطوير
// ═══════════════════════════════════════════════════════════
function openFeedbackModal() {
    // التحقق من وجود النافذة أو إنشائها
    let overlay = document.getElementById('feedbackOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'feedbackOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:10006;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px);';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:var(--bg-card);width:100%;max-width:500px;border-radius:16px;padding:20px;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid var(--border);';
        
        content.innerHTML = `
            <button id="closeFeedbackBtn" style="position:absolute;top:15px;left:15px;background:transparent;border:none;color:var(--text);font-size:20px;cursor:pointer;">✕</button>
            <h2 style="font-family:var(--font-display);font-size:20px;margin-bottom:16px;color:var(--primary);text-align:center;">💡 شاركنا التطوير</h2>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;text-align:center;">ساعدنا في تحسين التطبيق بملاحظاتك ومقترحاتك.</p>
            <textarea id="feedbackText" placeholder="اكتب ملاحظتك أو اقتراحك هنا..." style="width:100%;height:120px;padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit;font-size:15px;resize:none;margin-bottom:16px;"></textarea>
            <div style="display:flex;gap:10px;">
                <button id="sendWhatsAppBtn" style="flex:1;padding:12px;border-radius:10px;background:#25D366;color:#fff;border:none;font-size:15px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">واتساب 💬</button>
                <button id="sendTelegramBtn" style="flex:1;padding:12px;border-radius:10px;background:#0088cc;color:#fff;border:none;font-size:15px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">تليجرام ✈️</button>
            </div>
        `;
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // ربط الأحداث
        document.getElementById('closeFeedbackBtn').onclick = () => overlay.style.display = 'none';
        
        document.getElementById('sendWhatsAppBtn').onclick = () => {
            const text = document.getElementById('feedbackText').value.trim();
            if (!text) { showToast('⚠️ يرجى كتابة ملاحظتك أولاً'); return; }
            const msg = encodeURIComponent('📝 ملاحظة من مستخدم MedSearch Yemen:\\n\\n' + text);
            window.open('https://wa.me/967711129611?text=' + msg, '_blank');
            overlay.style.display = 'none';
        };

        document.getElementById('sendTelegramBtn').onclick = () => {
            const text = document.getElementById('feedbackText').value.trim();
            if (!text) { showToast('⚠️ يرجى كتابة ملاحظتك أولاً'); return; }
            // افترض أن اسم مستخدم تليجرام الخاص بك هو DrSalahAlAhdal (يمكنك تغييره)
            const msg = encodeURIComponent('📝 ملاحظة من مستخدم MedSearch Yemen:\\n\\n' + text);
            window.open('https://t.me/DrSalahAlAhdal?text=' + msg, '_blank');
            overlay.style.display = 'none';
        };
    }
    overlay.style.display = 'flex';
}
