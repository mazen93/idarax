export interface CmsSection {
  theme?: string;
  items?: any;
  title?: string;
  content?: string;
}

export interface HeroContent {
  badge?: string;
  title?: string;
  content?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

export interface AlternatingBlock {
  title: string;
  desc: string;
  imageLeft?: boolean;
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
  bullets: string[];
  imageUrl?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number | string;
  features: string[];
  featuresAr?: string[];
  popular?: boolean;
}

export interface CmsThemeSettings {
  brandColor: string;
  logoUrl?: string;
  brandName?: string;
}

export interface CmsHeader {
  brandName?: string;
  logoUrl?: string;
  loginLabel?: string;
}

export interface CmsCta {
  title?: string;
  content?: string;
  contactEmail?: string;
}
