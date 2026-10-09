import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { pages } from '@/content/pages';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import { ProductIndexTemplate } from '@/components/templates/ProductIndexTemplate';
import { ContactTemplate } from '@/components/templates/ContactTemplate';
import { FaqTemplate } from '@/components/templates/FaqTemplate';
import { EditorialTemplate } from '@/components/templates/EditorialTemplate';
import { pageMetadata } from '@/lib/metadata';
afterEach(cleanup);
it('places the current company story and supplied billboard in the existing company layout',()=>{
 render(<EditorialTemplate page={pages.find(p=>p.locale==='en'&&p.legacyPath==='/Company_Introduction')!}/>);
 expect(screen.getByText(/APOWER TECH began its journey in 2020/)).toBeVisible();
 expect(screen.getByRole('img',{name:'APOWER TECH'})).toHaveAttribute('src','/media/apower/company-billboard.webp');
});
it('keeps OEM descriptions with their correct step and preserves the last delivery paragraph',()=>{
 const {container}=render(<EditorialTemplate page={pages.find(p=>p.locale==='en'&&p.legacyPath==='/Contract_manufacturing_service')!}/>);
 const tooling=screen.getByRole('heading',{name:'Tooling'}).closest('.editorial-section__group')!;
 expect(tooling).toHaveTextContent('We build the molds for your custom appliance');
 expect(tooling.querySelector('img')).not.toBeNull();
 expect(container).toHaveTextContent('All finished goods are packed in custom packaging and loaded into shipping containers for safe, on-time delivery.');
});
const page = (path: string) => pages.find(p=>p.locale==='cn' && p.legacyPath===path)!;
it('does not expose the former company or founder in migrated page metadata',()=>{
 expect(pageMetadata(page('/Contact_Us')).description).toContain('佛山市空气力量科技有限公司');
 expect(pageMetadata(page('/Design_and_Development')).description).toContain('ARON');
 expect(pageMetadata(page('/Design_and_Development')).description).not.toMatch(/Tina|四年/);
});
it('navigates all three supplied homepage banners without losing the Chinese proposition',()=>{
 render(<HomeTemplate page={page('/')} />);
 expect(screen.getByRole('heading',{level:1})).toHaveTextContent('APOWER');
 fireEvent.click(screen.getByRole('button',{name:'下一张'}));
 expect(screen.getByRole('link',{name:/探索产品/})).toHaveAttribute('href','/cn/ProductDetail/AP-G1.html');
 fireEvent.click(screen.getByRole('button',{name:'下一张'}));
 expect(screen.getByRole('link',{name:/探索产品/})).toHaveAttribute('href','/cn/ProductDetail/AP-AR01.html');
 fireEvent.click(screen.getByRole('button',{name:'下一张'}));
 expect(screen.getByRole('heading',{level:1})).toBeVisible();
});
it('shows the six supplied product models and only four category destinations',()=>{
 render(<ProductIndexTemplate page={page('/ProductIndex')} />);
 const ranges=within(screen.getByRole('region',{name:'产品系列'}));
 expect(ranges.getAllByRole('link')).toHaveLength(4);
 expect(ranges.getByRole('link',{name:/吸附挂烫机/})).toHaveAttribute('href','/cn/Product/garment-steamers.html');
 expect(screen.getAllByText('AP-G1').length).toBeGreaterThan(0);
 expect(screen.queryByText('LBH-3228')).not.toBeInTheDocument();
});
it('routes email and phone actions to the contacts supplied in the Word document',()=>{
 render(<ContactTemplate page={page('/Contact_Us')} />);
 expect(screen.getByRole('link',{name:'kalman_chen@apowertechs.com'})).toHaveAttribute('href','mailto:kalman_chen@apowertechs.com');
 expect(screen.getByRole('link',{name:'WhatsApp'})).toHaveAttribute('href','https://wa.me/8618842665006');
});
it('expands the supplied FAQ answer instead of the old manufacturer answer',()=>{
 render(<FaqTemplate page={page('/FAQ')} articles={[]} />);
 fireEvent.click(screen.getByRole('button',{name:/最小起订量/}));
 expect(screen.getByText('我们支持 1,000 台起订。')).toBeVisible();
});
