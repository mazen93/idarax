
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCms() {
  console.log('Seeding CMS content with localized data and high-quality images...');

  const sections = [
    // THEME
    {
      section: 'theme_settings',
      title: 'Theme Settings',
      items: { brandColor: 'emerald' }
    },
    // HERO - English
    {
      section: 'en_hero',
      title: 'Hero (English)',
      content: 'Unify your Point of Sale, Kitchen, Inventory, and Analytics into one powerful, easy-to-use platform.',
      items: {
        badge: 'Meet the New Loyalty Engine',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop',
        primaryCta: 'Get Started for Free',
        secondaryCta: 'Explore Products'
      }
    },
    // HERO - Arabic
    {
      section: 'ar_hero',
      title: 'Hero (Arabic)',
      content: 'وحد نقطة البيع والمطبخ والمخزون والتحليلات في منصة واحدة قوية وسهلة الاستخدام.',
      items: {
        badge: 'تعرف على محرك الولاء الجديد',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2000&auto=format&fit=crop',
        primaryCta: 'ابدأ مجاناً',
        secondaryCta: 'استكشف المنتجات'
      }
    },
    // ALTERNATING BLOCKS - English
    {
      section: 'en_alternating_blocks',
      title: 'Feature Blocks (English)',
      items: [
        {
          title: 'Inventory Management',
          desc: 'Track stock levels in real-time across all branches.',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
          color: 'blue',
          imageLeft: false,
          bullets: ['Real-time tracking', 'Bulk updates', 'Low stock alerts']
        },
        {
          title: 'Advanced Analytics',
          desc: 'Get deep insights into your business performance with AI-powered reports.',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
          color: 'emerald',
          imageLeft: true,
          bullets: ['Revenue analysis', 'Popular products', 'Staff performance']
        }
      ]
    },
    // ALTERNATING BLOCKS - Arabic
    {
      section: 'ar_alternating_blocks',
      title: 'Feature Blocks (Arabic)',
      items: [
        {
          title: 'إدارة المخزون',
          desc: 'تتبع مستويات المخزون في الوقت الفعلي عبر جميع الفروع.',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
          color: 'blue',
          imageLeft: false,
          bullets: ['تتبع في الوقت الفعلي', 'تحديثات بالجملة', 'تنبيهات انخفاض المخزون']
        },
        {
          title: 'تحليلات متقدمة',
          desc: 'احصل على رؤى عميقة حول أداء عملك من خلال تقارير مدعومة بالذكاء الاصطناعي.',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
          color: 'emerald',
          imageLeft: true,
          bullets: ['تحليل الإيرادات', 'المنتجات الأكثر طلباً', 'أداء الموظفين']
        }
      ]
    },
    // TRUSTED BY
    {
      section: 'trusted_by',
      title: 'Trusted By',
      items: [
        { name: 'Gourmet World', logoUrl: 'https://cdn.worldvectorlogo.com/logos/starbucks-logo-1.svg' },
        { name: 'Fast Food King', logoUrl: 'https://cdn.worldvectorlogo.com/logos/mcdonalds-15.svg' },
        { name: 'Pizza Palace', logoUrl: 'https://cdn.worldvectorlogo.com/logos/pizza-hut-1.svg' }
      ]
    }
  ];

  for (const s of sections) {
    await (prisma as any).landingContent.upsert({
      where: { section: s.section },
      update: s,
      create: s
    });
  }

  // Update Subscription Plans with Arabic
  const planUpdates = [
    {
        name: 'Starter',
        nameAr: 'الباقة الأساسية',
        description: 'Perfect for small cafes and startups.',
        descriptionAr: 'مثالية للمقاهي الصغيرة والشركات الناشئة.',
        featuresAr: ['حتى 20 طاولة', '3 حسابات موظفين', 'شاشة مطبخ واحدة', 'تحليلات أساسية']
    },
    {
        name: 'Pro',
        nameAr: 'الباقة المتقدمة',
        description: 'For growing restaurants with multiple branches.',
        descriptionAr: 'للمطاعم المتنامية ذات الفروع المتعددة.',
        featuresAr: ['طاولات غير محدودة', '20 حساب موظف', '5 شاشات مطبخ', 'تحليلات الذكاء الاصطناعي', 'إدارة مستودعات']
    }
  ];

  for (const p of planUpdates) {
      await prisma.subscriptionPlan.updateMany({
          where: { name: p.name },
          data: p
      });
  }

  console.log('CMS Seeded!');
}

seedCms()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
