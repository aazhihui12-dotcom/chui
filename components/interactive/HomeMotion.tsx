"use client";

import { useEffect } from "react";
import type { Locale } from "@/content/schema";

type Entrance = { selector:string; direction:"up" | "right" | "fade"; delay:number; desktopOnly?:boolean; enOnly?:boolean };

// Retained CN/EN homepage WOW attributes; do not animate unrelated sections.
const entrances: Entrance[] = [
  {selector:'.home-hero h1',direction:'right',delay:500,desktopOnly:true},
  {selector:'.hero-slide:not(.hero-slide--product) ul',direction:'up',delay:500,desktopOnly:true},
  {selector:'.home-manufacturing .stats-grid',direction:'up',delay:1000},
  {selector:'.home-products__grid',direction:'up',delay:0,enOnly:true},
  {selector:'.home-products > .button-row',direction:'fade',delay:500},
  ...[300,600,900,1200,1500].map((delay,index): Entrance => ({selector:`.audience-card:nth-child(${index+1})`,direction:'up',delay})),
  {selector:'.home-featured-products',direction:'up',delay:500},
  {selector:'.home-welcome .lbh-button',direction:'fade',delay:500,desktopOnly:true},
  {selector:'.sustainability-grid',direction:'up',delay:500},
  {selector:'.home-mission > img',direction:'up',delay:300},
];

/** Restore source scroll entrances without wrappers or changing static layout. */
export function HomeMotion({ locale }: { locale:Locale }) {
  useEffect(() => {
    const root=document.querySelector<HTMLElement>('.home-page');
    const preference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    // SSR/no JS, unsupported browsers and reduced motion always keep copy visible.
    if (!root || preference?.matches || !window.IntersectionObserver || !Element.prototype.animate) return;
    const desktop=window.matchMedia?.('(min-width:768px)').matches ?? true;
    const targets=new Map<HTMLElement,Entrance>();
    const animations=new Map<HTMLElement,Animation>();
    const settle=(element:HTMLElement) => {
      observer.unobserve(element);
      element.dataset.homeMotionState='settled';
      const animation=animations.get(element);
      if (animation) { animation.onfinish=null; animation.cancel(); animations.delete(element); }
    };
    const observer=new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element=entry.target as HTMLElement;
        const entrance=targets.get(element);
        if (!entry.isIntersecting || !entrance || element.dataset.homeMotionState!=='pending') continue;
        observer.unobserve(element);
        element.dataset.homeMotionState='running';
        const start:Keyframe={opacity:0};
        const end:Keyframe={opacity:1};
        // Individual translate preserves existing translateX(-50%) grid centering.
        if (entrance.direction!=='fade') {
          start.translate=entrance.direction==='up' ? '0 150px' : '150px 0';
          end.translate='0 0';
        }
        const animation=element.animate([start,end],{delay:entrance.delay,duration:2500,easing:'ease',fill:'both'});
        animations.set(element,animation);
        animation.onfinish=()=>settle(element);
      }
    },{threshold:0});
    for (const entrance of entrances) {
      if ((entrance.desktopOnly && !desktop) || (entrance.enOnly && locale!=='en')) continue;
      for (const element of root.querySelectorAll<HTMLElement>(entrance.selector)) {
        // display:none modules are not armed (e.g. mobile-only featured products).
        if (getComputedStyle(element).display==='none') continue;
        targets.set(element,entrance);
        element.dataset.homeMotionState='pending';
        observer.observe(element);
      }
    }
    const onPreference=()=>{ if (preference?.matches) targets.forEach((_,element)=>settle(element)); };
    const onFocus=(event:FocusEvent)=>{
      if (!(event.target instanceof Node)) return;
      targets.forEach((_,element)=>{ if(element.contains(event.target as Node)) settle(element); });
    };
    preference?.addEventListener('change',onPreference);
    root.addEventListener('focusin',onFocus);
    return ()=>{
      observer.disconnect();
      preference?.removeEventListener('change',onPreference);
      root.removeEventListener('focusin',onFocus);
      animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});
      targets.forEach((_,element)=>{delete element.dataset.homeMotionState;});
    };
  },[locale]);
  return null;
}
