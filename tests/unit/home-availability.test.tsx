import React from 'react';
import {render,screen} from '@testing-library/react';
import {expect,it} from 'vitest';
import {HomeTemplate} from '@/components/templates/HomeTemplate';
import {getPage} from '@/lib/content';
it('does not advertise a detail-page link for an unpublished product in hero slides',()=>{
 const {container}=render(<HomeTemplate page={getPage('en',[])!} catalogProducts={[]}/>);
 expect(container.querySelector('a[href*="ProductDetail/AP-G1"]')).toBeNull();
 expect(container.querySelector('a[href*="ProductDetail/AP-AR01"]')).toBeNull();
});
