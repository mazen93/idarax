import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enContent = [
  {
    section: 'en_hero',
    title: 'The Ultimate Restaurant Management Ecosystem',
    content: 'Unify your Point of Sale, Kitchen, Inventory, and Analytics into one powerful, easy-to-use platform designed for growth.',
    items: {
      imageUrl: '/pos-mockup.png',
      badge: 'Meet the New Loyalty Engine',
      primaryCta: 'Get Started for Free',
      secondaryCta: 'Explore Products',
    },
  },
  {
    section: 'en_header',
    title: 'Navigation',
    content: '',
    items: {
      brandName: 'Idarax',
      contactEmail: 'hello@idarax.io',
      loginLabel: 'Log in',
      ctaLabel: 'Book a Demo',
    },
  },
  {
    section: 'en_trusted_by',
    title: 'Trusted by global restaurants & retail chains',
    content: '',
    items: [
      { name: 'GourmetCo' },
      { name: 'The Baking Co' },
      { name: 'Foodies Inc' },
      { name: 'Bites & Co' },
      { name: 'LocalCafe' },
      { name: 'Resto Plus' },
    ],
  },
  {
    section: 'en_alternating_blocks',
    title: 'One platform. Endless capabilities.',
    content: 'Everything you need to accept payments, manage inventory, and grow your customer base in a single, unified ecosystem.',
    items: [
      {
        title: 'Lightroom-fast Point of Sale',
        desc: 'Accept payments with our lightning fast iPad and Android POS. Designed for speed, it works offline seamlessly so you never miss a sale.',
        color: 'blue',
        bullets: [
          'Omnichannel ordering (Dine-in, Takeaway, QR)',
          'Split bills & advanced discounting',
          'Real-time multi-branch sync',
          'Full offline capabilities',
        ],
      },
      {
        title: 'Kitchen & Inventory Controls',
        desc: 'Maximize profit margins with recipe-level costing. Track stock movements across multiple warehouses, and connect the FOH directly to your KDS.',
        color: 'emerald',
        imageLeft: true,
        bullets: [
          'Automatic purchase order generations',
          'Bill of Materials (BOM) & Waste tracking',
          'Dynamic course firing (KDS)',
          'Real-time Cost of Goods Sold (COGS)',
        ],
      },
      {
        title: 'Growth & Customer Marketing',
        desc: 'Turn walk-ins into regulars. Utilize our powerful CRM and dynamic loyalty engine to run smart, automated marketing campaigns.',
        color: 'purple',
        bullets: [
          'Customizable Cashback & Points tiers',
          'Automated SMS Win-Back campaigns',
          'Refer-a-friend viral growth engine',
          'Enterprise Grafana BI integration',
        ],
      },
    ],
  },
  {
    section: 'en_features',
    title: 'Discover what else you can do',
    content: 'Every feature is designed to cut costs and boost operational speed.',
    items: [
      { icon: '🍽️', title: 'Smart Table Management', desc: 'Interactive floor maps, real-time occupancy, and instant waiter-cashier sync.' },
      { icon: '👨‍🍳', title: 'Kitchen Display System', desc: 'Section-based KDS with live status updates, BUMP logic, and chef notifications.' },
      { icon: '📦', title: 'Inventory & Warehousing', desc: 'Track stock levels, set low-stock alerts, and manage multi-warehouse transfers.' },
      { icon: '📊', title: 'AI Analytics', desc: 'Demand forecasting, "frequently bought together" recommendations, and sales trends.' },
      { icon: '🌐', title: 'Web Admin Dashboard', desc: 'Manage your business from anywhere with a powerful Next.js control panel.' },
      { icon: '📱', title: 'Mobile-First Flutter App', desc: 'Offline-capable POS with biometric login for iOS and Android.' },
    ],
  },
  {
    section: 'en_pricing',
    title: 'Simple pricing, no surprises.',
    content: 'Choose the plan that fits your business size.',
    items: null,
  },
  {
    section: 'en_cta',
    title: 'Ready to transform your operations?',
    content: 'Join thousands of restaurants processing millions of orders daily through Idarax.',
    items: {
      contactEmail: 'hello@idarax.io',
      buttonLabel: 'Start Your Free Trial Now',
    },
  },
  {
    section: 'en_footer',
    title: 'Footer',
    content: 'The ultimate cloud-based Restaurant Management System designed to help you run better, grow faster, and profit more.',
    items: [
      {
        heading: 'Product',
        links: [
          { label: 'Point of Sale', href: '#products' },
          { label: 'Kitchen Display', href: '#products' },
          { label: 'Inventory', href: '#products' },
          { label: 'Marketing CRM', href: '#features' },
        ],
      },
      {
        heading: 'Company',
        links: [
          { label: 'About Us', href: '#about' },
          { label: 'Careers', href: '#' },
          { label: 'Contact', href: 'mailto:hello@idarax.io' },
        ],
      },
      {
        heading: 'Legal',
        links: [
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' },
        ],
      },
    ],
  },
];

const arContent = [
  {
    section: 'ar_hero',
    title: 'النظام المتكامل لإدارة المطاعم',
    content: 'وحّد نقطة البيع والمطبخ والمخزون والتحليلات في منصة واحدة قوية وسهلة الاستخدام.',
    items: {
      imageUrl: '/pos-mockup.png',
      badge: 'اكتشف محرك الولاء الجديد',
      primaryCta: 'ابدأ مجاناً',
      secondaryCta: 'استكشف المنتجات',
    },
  },
  {
    section: 'ar_header',
    title: 'شريط التنقل',
    content: '',
    items: {
      brandName: 'إدارة إكس',
      contactEmail: 'hello@idarax.io',
      loginLabel: 'تسجيل الدخول',
      ctaLabel: 'احجز عرضاً',
    },
  },
  {
    section: 'ar_trusted_by',
    title: 'موثوق من قِبل المطاعم والسلاسل حول العالم',
    content: '',
    items: [
      { name: 'جورميه كو' },
      { name: 'مطبخ إنك' },
      { name: 'فوديز' },
      { name: 'بايتس' },
      { name: 'المقهى المحلي' },
      { name: 'ريستو بلس' },
    ],
  },
  {
    section: 'ar_alternating_blocks',
    title: 'منصة واحدة. إمكانيات لا نهاية لها.',
    content: 'كل ما تحتاجه لقبول المدفوعات وإدارة المخزون وتنمية قاعدة عملائك في نظام بيئي موحد.',
    items: [
      {
        title: 'نقطة بيع سريعة البرق',
        desc: 'اقبل المدفوعات بأسرع نقطة بيع على iPad وAndroid. مصممة للسرعة وتعمل بدون إنترنت لكي لا تفوتك صفقة واحدة.',
        color: 'blue',
        bullets: [
          'الطلب الشامل (داخل، للأخذ، QR)',
          'تقسيم الفواتير والخصومات المتقدمة',
          'مزامنة الفروع الحية',
          'وضع عدم الاتصال الكامل',
        ],
      },
      {
        title: 'المطبخ والمخزون',
        desc: 'زِد هوامش ربحك بتكلفة الوصفات. تتبع حركة المخزون عبر مستودعات متعددة واربط الصالة بـ KDS مباشرة.',
        color: 'emerald',
        imageLeft: true,
        bullets: [
          'طلبات الشراء التلقائية',
          'قائمة المواد (BOM) وتتبع الهدر',
          'إطلاق دورات KDS الديناميكي',
          'تكلفة البضائع المبيعة (COGS) في الوقت الفعلي',
        ],
      },
      {
        title: 'التسويق ونمو العملاء',
        desc: 'حوّل الزوار إلى زبائن دائمين. استخدم نظام CRM القوي ومحرك الولاء الديناميكي لإجراء حملات تسويقية مؤتمتة وذكية.',
        color: 'purple',
        bullets: [
          'برامج كاش باك ونقاط مخصصة',
          'حملات Win-Back عبر الرسائل النصية',
          'نظام إحالة فيروسي للنمو',
          'تحليلات ذكاء اصطناعي Grafana',
        ],
      },
    ],
  },
  {
    section: 'ar_features',
    title: 'اكتشف ما يمكنك فعله أيضاً',
    content: 'كل ميزة مصممة لخفض التكاليف وزيادة السرعة التشغيلية.',
    items: [
      { icon: '🍽️', title: 'إدارة الطاولات الذكية', desc: 'خرائط تفاعلية وإشغال فوري وتزامن بين النادل والكاشير.' },
      { icon: '👨‍🍳', title: 'نظام عرض المطبخ', desc: 'KDS قائم على الأقسام مع تحديثات حية ومنطق BUMP.' },
      { icon: '📦', title: 'المخزون والمستودعات', desc: 'تتبع مستويات المخزون وتحويلات المستودعات المتعددة.' },
      { icon: '📊', title: 'التحليلات بالذكاء الاصطناعي', desc: 'توقعات الطلب وتوصيات "يُشترى معاً كثيراً".' },
      { icon: '🌐', title: 'لوحة تحكم الويب', desc: 'أدر عملك من أي مكان مع لوحة تحكم Next.js.' },
      { icon: '📱', title: 'تطبيق Flutter المحمول', desc: 'POS يعمل بدون إنترنت مع تسجيل دخول بيومتري لـ iOS وAndroid.' },
    ],
  },
  {
    section: 'ar_pricing',
    title: 'أسعار بسيطة بدون مفاجآت.',
    content: 'اختر الخطة التي تناسب حجم عملك.',
    items: null,
  },
  {
    section: 'ar_cta',
    title: 'مستعد لتحويل عملياتك؟',
    content: 'انضم إلى آلاف المطاعم التي تعالج ملايين الطلبات يومياً عبر إدارة إكس.',
    items: {
      contactEmail: 'hello@idarax.io',
      buttonLabel: 'ابدأ تجربتك المجانية الآن',
    },
  },
  {
    section: 'ar_footer',
    title: 'التذييل',
    content: 'نظام سحابي متكامل لإدارة المطاعم مصمم لمساعدتك على العمل بشكل أفضل والنمو أسرع.',
    items: [
      {
        heading: 'المنتج',
        links: [
          { label: 'نقطة البيع', href: '#products' },
          { label: 'عرض المطبخ', href: '#products' },
          { label: 'المخزون', href: '#products' },
          { label: 'CRM التسويق', href: '#features' },
        ],
      },
      {
        heading: 'الشركة',
        links: [
          { label: 'من نحن', href: '#about' },
          { label: 'وظائف', href: '#' },
          { label: 'اتصل بنا', href: 'mailto:hello@idarax.io' },
        ],
      },
      {
        heading: 'قانوني',
        links: [
          { label: 'شروط الاستخدام', href: '/terms' },
          { label: 'سياسة الخصوصية', href: '/privacy' },
        ],
      },
    ],
  },
];

async function run() {
  const allContent = [...enContent, ...arContent];
  for (const item of allContent) {
    await (prisma.landingContent as any).upsert({
      where: { section: item.section },
      update: { title: item.title, content: item.content, items: item.items as any },
      create: { section: item.section, title: item.title, content: item.content, items: item.items as any },
    });
    console.log(`✅ Upserted: ${item.section}`);
  }
  await prisma.$disconnect();
  console.log('\n🎉 All bilingual landing content seeded!');
}

run().catch(e => { console.error(e); process.exit(1); });
