import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import{it,expect,vi}from'vitest';
const state=vi.hoisted(()=>({path:''}));
vi.mock('next/navigation',()=>({usePathname:()=>state.path}));
import{SourceStyles}from'@/components/site/SourceStyles';
it('does not request a nonexistent captured stylesheet for newly managed articles',()=>{
 for(const id of ['a22b3ce1-aabb-4abc-8abc-123456789abc','apower-faq-234']){
  state.path=`/en/NewsDetail/${id}.html/`;
  expect(renderToStaticMarkup(<SourceStyles/>)).not.toContain('/source-styles/');
 }
 state.path='/en/NewsDetail/6860206.html/';
 expect(renderToStaticMarkup(<SourceStyles/>)).toContain('/source-styles/');
});
