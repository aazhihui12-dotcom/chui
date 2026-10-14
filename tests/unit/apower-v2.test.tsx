import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { apowerProducts, apowerCategories } from '@/content/apower';
import { ProductDetailTemplate } from '@/components/templates/ProductDetailTemplate';
import { ProductCategoryTemplate } from '@/components/templates/ProductCategoryTemplate';
import { EditorialTemplate } from '@/components/templates/EditorialTemplate';
import { ContactTemplate } from '@/components/templates/ContactTemplate';
import { pages } from '@/content/pages';

afterEach(cleanup);
const expected = [
  ['AP-G1', '1500W', '110000RPM', 6, 3],
  ['AP-G3', '1500W', '110000RPM', 6, 3],
  ['AP-G11', '1600W', '115000RPM', 7, 3],
  ['AP-S1', '1400W', '110000RPM', 5, 3],
  ['AP-H1', '1000W', null, 6, 3],
  ['AP-AR01', '930W', null, 5, 4],
] as const;

for (const locale of ['cn', 'en'] as const) {
  it.each(expected)('%s renders the supplied v2 parameters, selectable colors and ordered details in '+locale, (model, watts, rpm, imageCount, detailCount) => {
    const product = apowerProducts.find(p => p.model === model)!;
    const { container } = render(<ProductDetailTemplate product={product} locale={locale} />);
    const specs = screen.getByRole('table');
    expect(within(specs).getByText(model)).toBeVisible();
    expect(within(specs).getByText(watts)).toBeVisible();
    if (rpm) expect(within(specs).getByText(rpm)).toBeVisible();
    expect(container.querySelectorAll('.product-gallery__thumbnails button')).toHaveLength(imageCount);
    const mainImage = container.querySelector('.product-gallery__main img')!;
    const firstSrc = mainImage.getAttribute('src');
    fireEvent.click(container.querySelectorAll('.product-gallery__thumbnails button')[1]);
    expect(mainImage.getAttribute('src')).not.toBe(firstSrc);
    const detailImages = [...container.querySelectorAll('#product-details .content-media img')];
    expect(detailImages).toHaveLength(detailCount);
    detailImages.forEach((image, index) => expect(image.getAttribute('src')).toMatch(new RegExp(`/${model.toLowerCase()}-detail-${index+1}\\.webp$`)));
    if (model === 'AP-G3') expect(within(specs).queryByText('AP-G1')).toBeNull();
  });

  it('uses the supplied common product-category banner without replacing the catalog images in '+locale, () => {
    const { container } = render(<ProductCategoryTemplate category={apowerCategories[0]} locale={locale} />);
    expect(container.querySelector('.product-category-banner > img')).toHaveAttribute('src', '/media/apower/v2/product-range-banner.webp');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(locale === 'cn' ? '吹风机系列' : 'Hair Dryers');
    expect(container.querySelector('.product-card img')).not.toHaveAttribute('src', '/media/apower/v2/product-range-banner.webp');
  });

  it('replaces the factory 5S diagram and order-management phone artwork in '+locale, () => {
    const factory = pages.find(p => p.locale === locale && p.legacyPath === '/Factory_tour')!;
    const first = render(<EditorialTemplate page={factory} />);
    expect(first.container.querySelector('img[src="/media/apower/v2/factory-5s.webp"]')).not.toBeNull();
    first.unmount();
    render(<EditorialTemplate page={pages.find(p => p.locale === locale && p.legacyPath === '/Order_Management')!} />);
    expect(screen.getAllByRole('img', { name: 'APOWER' })).toEqual(expect.arrayContaining([expect.objectContaining({ src: expect.stringContaining('/media/apower/v2/order-phone.webp') })]));
  });

  it('uses the v2 Factory 1 address in '+locale, () => {
    render(<ContactTemplate page={pages.find(p => p.locale === locale && p.legacyPath === '/Contact_Us')!} />);
    expect(screen.getByText(locale === 'cn' ? '中山市南头镇晋合路33号' : 'No. 33 Jinhe Road, Nantou Town, Zhongshan City, Guangdong, China')).toBeVisible();
  });
}
