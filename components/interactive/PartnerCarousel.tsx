"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { ImageAsset, Locale } from "@/content/schema";
import { HomeGalleryImage } from "./HomeGalleryImage";
import { useCarouselMotion } from "./useCarouselMotion";

type SlideState = { active:number; progress:number; target:number|null };

/** Source gallery 109: 4s autoplay, 2s desktop slide / 1s phone coverflow. */
export function PartnerCarousel({ images, locale, label }: { images: ImageAsset[]; locale: Locale; label: string }) {
  const [slide,setSlide]=useState<SlideState>({active:0,progress:0,target:null});
  const [visibleCount,setVisibleCount]=useState(5);
  const current=useRef(slide);
  const track=useRef<HTMLDivElement>(null);
  const drag=useRef<{id:number;x:number;y:number;horizontal:boolean}|null>(null);
  const suppressClick=useRef(false);
  useLayoutEffect(()=>{current.current=slide;},[slide]);
  const finish=useCallback(()=>setSlide(value=>value.target===null && value.progress===0 ? value : {
    active:value.target ?? value.active,progress:0,target:null,
  }),[]);
  const change=useCallback((direction:number)=>{
    const value=current.current;
    if(images.length<2 || value.target!==null || drag.current) return;
    const target=(value.active+direction+images.length)%images.length;
    // Reduced motion, no CSS layout (e.g. an embedded hidden module), or older
    // browsers still get usable navigation without waiting for an animation.
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !track.current?.clientWidth) {
      setSlide({active:target,progress:0,target:null});
    } else setSlide({active:value.active,progress:direction,target});
  },[images.length]);
  const motion = useCarouselMotion(change, images.length > 1 ? 4000 : 0);
  useEffect(()=>{
    if(typeof window.matchMedia!=='function') {
      const update=()=>setVisibleCount(window.innerWidth<768?1:5);
      update(); window.addEventListener('resize',update);
      return ()=>window.removeEventListener('resize',update);
    }
    const phone=window.matchMedia('(max-width:767px)');
    const update=()=>setVisibleCount(phone.matches?1:5);
    update(); phone.addEventListener('change',update);
    return ()=>phone.removeEventListener('change',update);
  },[]);
  useEffect(()=>{if(motion.reduced) finish();},[motion.reduced,finish]);
  useEffect(()=>{
    if(slide.target===null) return;
    // transitionend normally commits the loop; this also covers background tabs
    // or a interrupted CSS transition so controls never stay locked.
    const duration=window.matchMedia?.('(max-width:767px)').matches ? 1000 : 2000;
    const timer=window.setTimeout(finish,duration+100);
    return ()=>window.clearTimeout(timer);
  },[slide.target,finish]);
  useEffect(()=>{
    let width=window.innerWidth;
    const onResize=()=>{if(width!==window.innerWidth){width=window.innerWidth;drag.current=null;finish();}};
    window.addEventListener('resize',onResize);
    return ()=>window.removeEventListener('resize',onResize);
  },[finish]);

  const pointerDown=(event:PointerEvent<HTMLDivElement>)=>{
    suppressClick.current=false;
    if(event.button!==0 || images.length<2 || current.current.target!==null ||
      (event.target instanceof Element && event.target.closest('.partner-carousel__controls,dialog'))) return;
    drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,horizontal:false};
  };
  const pointerMove=(event:PointerEvent<HTMLDivElement>)=>{
    const gesture=drag.current;
    if(!gesture || gesture.id!==event.pointerId) return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!gesture.horizontal) {
      if(Math.abs(dx)<8 || Math.abs(dx)<=Math.abs(dy)) return;
      gesture.horizontal=true;
      event.currentTarget.setPointerCapture(event.pointerId);
      motion.interaction();
    }
    const cell=track.current?.firstElementChild?.getBoundingClientRect().width ?? 0;
    // Measure the layout width, not the perspective-projected phone rectangle.
    const step=track.current?.firstElementChild instanceof HTMLElement ? track.current.firstElementChild.offsetWidth : cell;
    if(step) setSlide(value=>({...value,progress:Math.max(-1,Math.min(1,-dx/step))}));
  };
  const pointerEnd=(event:PointerEvent<HTMLDivElement>,cancelled=false)=>{
    const gesture=drag.current;
    if(!gesture || gesture.id!==event.pointerId) return;
    drag.current=null;
    if(!gesture.horizontal) return;
    suppressClick.current=true;
    if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dx=event.clientX-gesture.x;
    if(!cancelled && Math.abs(dx)>40) change(dx<0 ? 1 : -1);
    else if(motion.reduced) finish();
    else setSlide(value=>({...value,progress:0,target:value.active}));
  };
  const cn = locale === "cn";
  const active=slide.active;
  const ordered = [...images.slice(active), ...images.slice(0, active)];
  // Offscreen buffers retain artwork at both seams while the track moves.
  // Clones are excluded from the accessibility tree and reset in the same
  // React commit as the track, preventing a last→first flash or blank cell.
  const trailing=Array.from({length:images.length ? Math.max(0,6-images.length) : 0},(_,index)=>ordered[index%images.length]);
  // Source phone coverflow keeps three preceding slides in its loop buffer.
  const leading=images.length ? [3,2,1].map(distance=>({
    image:images[(active-distance+images.length*3)%images.length],index:-distance,
  })) : [];
  return <div className={`partner-carousel${slide.target!==null ? ' partner-carousel--moving' : ''}`} role="region" aria-label={label} aria-roledescription="carousel" {...motion.bindings}
    onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={event=>pointerEnd(event)} onPointerCancel={event=>pointerEnd(event,true)}
    onClickCapture={event=>{
      // A drag can suppress its synthetic pointer click, never a later keyboard
      // activation (detail 0) of an accessible pause/previous/next control.
      if(suppressClick.current && event.detail!==0){event.preventDefault();event.stopPropagation();}
      suppressClick.current=false;
    }}>
    <div className="partner-carousel__viewport"><div ref={track} className="partner-carousel__track"
      style={{'--partner-progress':slide.progress} as CSSProperties}
      onTransitionEnd={event=>{if(event.target===event.currentTarget && event.propertyName==='transform') finish();}}>
      {ordered.map((image,index)=><div key={`logo-${index}`} style={{'--partner-index':index} as CSSProperties}><HomeGalleryImage image={image} locale={locale} label={image.alt || `${label} ${index+1}`} tabIndex={index<visibleCount?0:-1}/></div>)}
      {trailing.map((image,index)=><div key={`after-${index}`} aria-hidden="true" style={{'--partner-index':ordered.length+index} as CSSProperties}><HomeGalleryImage image={image} locale={locale} label={label} interactive={false}/></div>)}
      {leading.map(({image,index})=><div key={`before-${index}`} className="partner-carousel__previous" aria-hidden="true" style={{'--partner-index':index} as CSSProperties}><HomeGalleryImage image={image} locale={locale} label={label} interactive={false}/></div>)}
    </div></div>
    <div className="partner-carousel__controls">
      <button aria-label={cn ? "上一组合作伙伴" : "Previous partners"} onClick={() => { motion.interaction(); change(-1); }}>←</button>
      <span className="sr-only" role="status" aria-live={motion.playing ? "off" : "polite"}>{images.length ? active + 1 : 0} / {images.length}</span>
      <button aria-label={cn ? "下一组合作伙伴" : "Next partners"} onClick={() => { motion.interaction(); change(1); }}>→</button>
      {!motion.reduced && <button aria-label={cn ? (motion.paused ? "继续轮播" : "暂停轮播") : (motion.paused ? "Resume slideshow" : "Pause slideshow")} onClick={motion.toggle}>{motion.paused ? "▶" : "Ⅱ"}</button>}
    </div>
  </div>;
}
