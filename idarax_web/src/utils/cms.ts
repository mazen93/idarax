import { CmsSection } from '../types/cms';

export function sec(content: Record<string, any>, locale: string, key: string): CmsSection {
  return (content[`${locale}_${key}`] || content[key] || {}) as CmsSection;
}

export function items<T = any>(section: CmsSection): T[] {
  if (!section?.items) return [];
  if (Array.isArray(section.items)) return section.items.filter(Boolean) as T[];
  // If it's a non-array object, check if it's empty
  if (typeof section.items === 'object' && Object.keys(section.items).length === 0) return [];
  return [section.items as T];
}

export function itemObj<T = any>(section: CmsSection): T {
  return (section?.items && !Array.isArray(section.items)) ? (section.items as T) : ({} as T);
}
