import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { pages } from '@/content/pages';
import { HomeTemplate } from '@/components/templates/HomeTemplate';
import { ProductIndexTemplate } from '@/components/templates/ProductIndexTemplate';
import { EditorialTemplate } from '@/components/templates/EditorialTemplate';
import { ContactTemplate } from '@/components/templates/ContactTemplate';
import { Footer } from '@/components/site/Footer';
afterEach(cleanup);
const page = (path: string, locale: 'cn' | 'en' = 'en') => pages.find(p => p.locale === locale && p.legacyPath === path)!;
it('uses the shortened home proposition and supplied mission photograph', () => {
  const { container } = render(<HomeTemplate page={page('/')} />);
  expect(screen.getByRole('heading', { name: "Why choose APOWER TECH's personal care appliance solutions?" })).toBeVisible();
  expect(container.querySelector('.home-mission > img')).toHaveAttribute('src', '/media/apower/v3/home-mission.webp');
});
it('shows all ten assembly photos beside their numbered instructions', () => {
  const { container } = render(<ProductIndexTemplate page={page('/ProductIndex')} />);
  const steps = container.querySelectorAll('.product-index__assembly li');
  expect(steps).toHaveLength(10);
  for (let i = 0; i < 10; i++) expect(steps[i].querySelector('img')).toHaveAttribute('src', `/media/apower/v3/assembly-${i + 1}.webp`);
});
it('opens customization copy from its image button and returns keyboard focus', () => {
  render(<ProductIndexTemplate page={page('/ProductIndex')} />);
  const trigger = screen.getByRole('button', { name: 'Color Options', exact: true });
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog')).toHaveTextContent(/color/i);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
it('opens manufacturing assurance copy by clicking its photo',()=>{
  render(<ProductIndexTemplate page={page('/ProductIndex')}/>);
  fireEvent.click(screen.getByRole('button',{name:'On-Time Production',exact:true}));
  expect(screen.getByRole('dialog')).toHaveTextContent('each batch of orders can be produced on time');
  fireEvent.keyDown(document,{key:'Escape'});
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('keeps only the standalone contact strip at the end of requested service pages', () => {
  for (const path of ['/Contract_manufacturing_service', '/PinZhiGuanLi', '/Design_and_Development', '/Order_Management', '/Product_manufacturing', '/Product_Warranty_and_After-Sales_Service', '/Lead_the_team']) {
    const { container, unmount } = render(<EditorialTemplate page={page(path)} />);
    expect(container.querySelector('.v3-contact-strip')).toHaveTextContent('Let’s connect today and find the right solution.');
    expect(container).not.toHaveTextContent('Years of collaboration with leading international research institutions');
    unmount();
  }
});
it('shows the supplied five manufacturing photographs under the factory video', () => {
  const { container } = render(<EditorialTemplate page={page('/Product_manufacturing')} />);
  expect(container.querySelectorAll('.v3-manufacturing-stages img')).toHaveLength(5);
  expect(container.querySelector('.source-video')).not.toBeNull();
  expect(container).toHaveTextContent('Driver motherboard');
});
it('provides category selection and labeled requirements in the contact form', () => {
  render(<ContactTemplate page={page('/Contact_Us')} />);
  expect(screen.getByRole('combobox', { name: 'Product' })).toBeVisible();
  fireEvent.change(screen.getByRole('combobox', { name: 'Product' }), { target: { value: 'Hair Dryers' } });
  expect(screen.getByRole('combobox', { name: 'Product' })).toHaveValue('Hair Dryers');
  fireEvent.click(screen.getByRole('checkbox', { name: 'OEM / ODM Services' }));
  expect(screen.getByRole('checkbox', { name: 'OEM / ODM Services' })).toBeChecked();
});
it('matches the reference contact form required company and phone fields',()=>{
  render(<ContactTemplate page={page('/Contact_Us')}/>);
  fireEvent.click(screen.getByRole('button',{name:'Send Message'}));
  for(const label of ['Company','Phone']){
    expect(screen.getByLabelText(label)).toBeRequired();
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid','true');
  }
});
it('places the design facilities heading above its two-column photo and copy',()=>{
  const {container}=render(<EditorialTemplate page={page('/Design_and_Development')}/>);
  const facilities=container.querySelector('.v3-design-facilities');
  expect(facilities).not.toBeNull();
  expect(facilities?.querySelector(':scope > .content-text h2')).toHaveTextContent('Facilities');
  expect(facilities?.querySelector('.editorial-section__inner img')).not.toBeNull();
});
it('separates warranty coverage, three numbered promises and testing introduction',()=>{
  const {container,unmount}=render(<EditorialTemplate page={page('/Product_Warranty_and_After-Sales_Service')}/>);
  const warranty=container.querySelectorAll('.editorial-section')[0];
  expect(warranty.querySelectorAll('p')).toHaveLength(2);
  expect(screen.getByText(/^1\.An effective solution/)).toBeVisible();
  expect(screen.getByText(/^2\.Response within 8 hours/)).toBeVisible();
  expect(screen.getByText(/^3\.Free replacement/)).toBeVisible();
  unmount();
  render(<EditorialTemplate page={page('/Product_manufacturing')}/>);
  expect(screen.getByRole('heading',{name:'Testing and packaging',exact:true,level:2})).toBeVisible();
  expect(screen.getByText(/^assembled products undergo a 40-minute/)).toBeVisible();
});
it('keeps the factory introduction in the two paragraphs requested by the workbook',()=>{
  const {container}=render(<EditorialTemplate page={page('/Factory_tour')}/>);
  expect(container.querySelectorAll('.editorial-section:first-of-type .editorial-section__group:first-child p')).toHaveLength(2);
});
it('renders social placeholders without inventing external account links', () => {
  render(<Footer locale="en" />);
  const social = screen.getByRole('group', { name: 'Follow Us' });
  expect(within(social).getAllByRole('img')).toHaveLength(5);
  expect(social.querySelector('a')).toBeNull();
});
