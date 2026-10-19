import type { Locale } from './schema';
export const productManufacturingPoster = '/media/apower/production-video-poster.webp';
export const factoryTourPoster = '/media/apower/factory-tour-video-poster.webp';
export const productOverviewPoster = '/media/apower/overview-video-poster.webp';
export const manufacturingLabels = {
  en: ['Driver motherboard','High speed motor','Shell material injection molding','Hair dryer manufacturing','Testing and packaging'],
  cn: ['驱动主板','高速电机','壳料注塑','吹风机制造','测试与包装'],
};
export const proofCopy = (locale: Locale) => locale === 'en' ? [
  'We strictly follow a systematic product manufacturing process to ensure that each batch of orders can be produced on time and with guaranteed quality.',
  'No necessary inspection process is overlooked before the products leave the factory, and the after-sales rate of the products is strictly controlled.',
  'Our self-designed model offers competitive prices and can help save more costs.',
  'We have obtained comprehensive international certifications for all our products. We have also applied for patents for each product to protect our customers.',
] : [
  '我们严格遵循系统化的产品制造流程，确保每批订单都能按时生产并保证质量。',
  '产品出厂前不遗漏任何必要的检验流程，并严格控制售后率。',
  '我们自主设计的产品具有竞争力的价格，能够帮助您节省更多成本。',
  '我们的所有产品均已获得全面的国际认证，并为每款产品申请专利，保护客户权益。',
];
export const stripPaths = ['/Exclusive_sale','/Contract_manufacturing_service','/PinZhiGuanLi','/Design_and_Development','/Order_Management','/Product_manufacturing','/Product_Warranty_and_After-Sales_Service','/Lead_the_team'];
