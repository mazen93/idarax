"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const content = [
    {
        section: 'en_hero',
        title: 'The complete restaurant management system',
        content: 'Unify your Point of Sale, Kitchen, Inventory, and Analytics into one powerful, easy-to-use platform.',
        items: {
            badge: 'Meet the New Loyalty Engine',
            primaryCta: 'Get Started for Free',
            secondaryCta: 'Explore Products',
            imageUrl: '/pos-mockup.png'
        }
    },
    {
        section: 'ar_hero',
        title: 'نظام إدارة مطاعم متكامل',
        content: 'وحّد نقطة البيع والمطبخ والمخزون والتحليلات في منصة واحدة قوية.',
        items: {
            badge: 'مرحباً بك في إدارة المطاعم',
            primaryCta: 'ابدأ مجاناً',
            secondaryCta: 'استكشف المنتجات',
            imageUrl: '/pos-mockup.png'
        }
    },
    {
        section: 'en_header',
        title: 'Header Settings (EN)',
        content: '',
        items: {
            brandName: 'Idarax',
            loginLabel: 'Log in',
            ctaLabel: 'Book a Demo',
            contactEmail: 'hello@idarax.io'
        }
    },
    {
        section: 'ar_header',
        title: 'Header Settings (AR)',
        content: '',
        items: {
            brandName: 'Idarax',
            loginLabel: 'تسجيل الدخول',
            ctaLabel: 'احجز عرضاً',
            contactEmail: 'hello@idarax.io'
        }
    },
    {
        section: 'en_trusted_by',
        title: 'Trusted by global restaurants & retail chains',
        content: '',
        items: [
            { name: 'Brand A' }, { name: 'GourmetCo' }, { name: 'Foodies' },
            { name: 'Bites & Co' }, { name: 'LocalCafe' }, { name: 'Restaurants Plus' }
        ]
    },
    {
        section: 'ar_trusted_by',
        title: 'موثوق من قِبل المطاعم والسلاسل حول العالم',
        content: '',
        items: [
            { name: 'Brand A' }, { name: 'GourmetCo' }, { name: 'Foodies' },
            { name: 'Bites & Co' }, { name: 'LocalCafe' }, { name: 'Restaurants Plus' }
        ]
    },
    {
        section: 'en_alternating_blocks',
        title: 'Features highlight',
        content: '',
        items: [
            {
                title: 'Lightroom-fast Point of Sale',
                desc: 'Accept payments with our lightning fast iPad and Android POS.',
                color: 'blue',
                bullets: ['Omnichannel ordering', 'Split bills & discounting', 'Real-time sync', 'Full offline capabilities'],
            },
            {
                title: 'Kitchen & Inventory Controls',
                desc: 'Maximize profit margins with recipe-level costing.',
                color: 'emerald',
                imageLeft: true,
                bullets: ['Purchase orders', 'Bill of Materials', 'Dynamic KDS firing', 'Real-time COGS'],
            }
        ]
    },
    {
        section: 'ar_alternating_blocks',
        title: 'ميزات بارزة',
        content: '',
        items: [
            {
                title: 'نقطة بيع سريعة البرق',
                desc: 'اقبل المدفوعات بأسرع نقطة بيع على iPad وAndroid.',
                color: 'blue',
                bullets: ['الطلب الشامل (داخل، للأخذ، QR)', 'تقسيم الفواتير والخصومات', 'مزامنة الفروع الحية', 'وضع عدم الاتصال']
            },
            {
                title: 'المطبخ والمخزون',
                desc: 'تحكم في تكاليف الوصفات وتتبع المخزون.',
                color: 'emerald',
                imageLeft: true,
                bullets: ['طلبات الشراء التلقائية', 'قائمة المواد (BOM)', 'إطلاق دورات KDS', 'تكلفة البضائع (COGS)']
            }
        ]
    },
    {
        section: 'en_features',
        title: 'More powerful features',
        content: '',
        items: [
            { icon: '🚀', title: 'Performance', desc: 'Lightning fast system architecture' },
            { icon: '📊', title: 'Analytics', desc: 'Deep insights into your business' },
            { icon: '🔒', title: 'Security', desc: 'Bank-grade data protection' }
        ]
    },
    {
        section: 'ar_features',
        title: 'ميزات أقوى',
        content: '',
        items: [
            { icon: '🚀', title: 'أداء', desc: 'بنية نظام سريعة' },
            { icon: '📊', title: 'تحليلات', desc: 'رؤى عميقة لعملك' },
            { icon: '🔒', title: 'أمان', desc: 'حماية بيانات بنكية' }
        ]
    },
    {
        section: 'en_pricing',
        title: 'Simple, transparent pricing',
        content: 'Choose the plan that fits your business needs.',
        items: {}
    },
    {
        section: 'ar_pricing',
        title: 'أسعار بسيطة وشفافة',
        content: 'اختر الخطة التي تناسب احتياجات عملك.',
        items: {}
    },
    {
        section: 'en_cta',
        title: 'Get in Touch',
        content: 'We would love to hear from you.',
        items: {
            contactEmail: 'hello@idarax.io',
            buttonLabel: 'Start Your Free Trial Now'
        }
    },
    {
        section: 'ar_cta',
        title: 'تواصل معنا',
        content: 'نسعد بسماع ما لديك.',
        items: {
            contactEmail: 'hello@idarax.io',
            buttonLabel: 'ابدأ الفترة التجريبية'
        }
    },
    {
        section: 'en_footer',
        title: 'Footer',
        content: 'The ultimate cloud-based Restaurant Management System.',
        items: [
            {
                heading: 'Product',
                links: [
                    { label: 'Point of Sale', href: '#products' },
                    { label: 'Features', href: '#features' },
                    { label: 'Pricing', href: '#pricing' },
                ],
            },
            {
                heading: 'Company',
                links: [
                    { label: 'About Us', href: '/en/about' },
                    { label: 'Contact Us', href: '#contact' },
                ],
            },
            {
                heading: 'Legal',
                links: [
                    { label: 'Terms of Service', href: '/en/terms' },
                    { label: 'Privacy Policy', href: '/en/privacy' },
                ],
            }
        ]
    },
    {
        section: 'ar_footer',
        title: 'التذييل',
        content: 'نظام سحابي متكامل لإدارة المطاعم.',
        items: [
            {
                heading: 'المنتج',
                links: [
                    { label: 'نقطة البيع', href: '#products' },
                    { label: 'الميزات', href: '#features' },
                    { label: 'الأسعار', href: '#pricing' },
                ],
            },
            {
                heading: 'الشركة',
                links: [
                    { label: 'من نحن', href: '/ar/about' },
                    { label: 'اتصل بنا', href: '#contact' },
                ],
            },
            {
                heading: 'قانوني',
                links: [
                    { label: 'شروط الاستخدام', href: '/ar/terms' },
                    { label: 'سياسة الخصوصية', href: '/ar/privacy' },
                ],
            }
        ]
    }
];
async function main() {
    console.log('Seeding landing content...');
    for (const item of content) {
        await prisma.landingContent.upsert({
            where: { section: item.section },
            update: {
                title: item.title,
                content: item.content,
                items: item.items
            },
            create: {
                section: item.section,
                title: item.title,
                content: item.content,
                items: item.items
            }
        });
        console.log(`Upserted ${item.section}`);
    }
    console.log('Done!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed_cms.js.map