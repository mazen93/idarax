'use client';

import { MapPin, Phone, Mail, Clock, Info } from 'lucide-react';

interface Props {
    tenant: any;
}

export default function StorefrontHero({ tenant }: Props) {
    const bannerStyle = tenant.bannerImageUrl
        ? { backgroundImage: `url(${tenant.bannerImageUrl})` }
        : { background: 'linear-gradient(to right bottom, var(--tenant-primary), #0a0a0b)' };

    return (
        <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-border">
            {/* Background Banner */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
                style={bannerStyle}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row gap-8 items-end justify-between mt-12">
                <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-border text-sm font-semibold text-slate-300 mb-6 backdrop-blur-md">
                        <Clock className="w-4 h-4 text-[var(--tenant-primary)]" />
                        We are open and accepting orders
                    </span>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
                        Experience the best of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
                            {tenant?.name || 'Restaurant'}
                        </span>
                    </h1>

                    {tenant?.aboutUsText && (
                        <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                            {tenant.aboutUsText}
                        </p>
                    )}

                    {/* Social and Contact Links */}
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                        {tenant.contactPhone && (
                            <a href={`tel:${tenant.contactPhone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-border transition-colors text-slate-300">
                                <Phone className="w-4 h-4 text-[var(--tenant-primary)]" />
                                {tenant.contactPhone}
                            </a>
                        )}
                        {tenant.contactEmail && (
                            <a href={`mailto:${tenant.contactEmail}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-border transition-colors text-slate-300">
                                <Mail className="w-4 h-4 text-[var(--tenant-primary)]" />
                                Email Us
                            </a>
                        )}
                        {/* Add icon links for Instagram/Facebook if available */}
                    </div>
                </div>
            </div>
        </section>
    );
}
