import v2 from './apower-v2-assets.json';
import v3 from './apower-v3-assets.json';
// Workbook image filenames are explicit so the shipped-asset audit can validate every reference.
export const apowerMedia: Record<string,string> = {
  'hero-brand': '/media/apower/hero-brand.webp',
  'hero-g1': '/media/apower/hero-g1.webp',
  'hero-ar01': '/media/apower/hero-ar01.webp',
  'range-dryers': '/media/apower/range-dryers.webp',
  'range-straighteners': '/media/apower/range-straighteners.webp',
  'range-steamers': '/media/apower/range-steamers.webp',
  'partner-distributor': '/media/apower/partner-distributor.webp',
  'partner-brand': '/media/apower/partner-brand.webp',
  'partner-engineer': '/media/apower/partner-engineer.webp',
  'partner-online': '/media/apower/partner-online.webp',
  'partner-referral': '/media/apower/partner-referral.webp',
  'product-g1': '/media/apower/product-g1.webp',
  'product-g3': '/media/apower/product-g3.webp',
  'product-g11': '/media/apower/product-g11.webp',
  'product-s1': '/media/apower/product-s1.webp',
  'product-h1': '/media/apower/product-h1.webp',
  'product-ar01': '/media/apower/product-ar01.webp',
  'company-billboard': '/media/apower/company-billboard.webp',
  'logo-white': '/media/apower/logo-white.webp',
  ...Object.fromEntries(Object.entries(v2).map(([key, image]) => [key, image.src])),
  ...Object.fromEntries(Object.entries(v3).map(([key, image]) => [key, image.src])),
};
export const apowerAssetDetails: Record<string, {src: string; width: number; height: number}> = {...v2,...v3};
