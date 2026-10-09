"use client";

import {useEffect,useId,useRef,useState} from 'react';
import type {ImageAsset,Locale} from '@/content/schema';
import {Media} from '@/components/site/Media';

/** Source gallery 109's frame/magnifier and working image expansion. */
export function HomeGalleryImage({image,locale,label,interactive=true,tabIndex=0}: {
  image:ImageAsset; locale:Locale; label:string; interactive?:boolean; tabIndex?:number;
}) {
  // A loop commit reorders thumbnail props. Keep the user's selected artwork
  // independent from that reordering until they close the preview.
  const [preview,setPreview]=useState<{image:ImageAsset;label:string}|null>(null);
  const open=preview!==null;
  const trigger=useRef<HTMLButtonElement>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const close=useRef<HTMLButtonElement>(null);
  const titleId=useId();
  useEffect(()=>{
    if(!open) return;
    const node=dialog.current!;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    if(typeof node.showModal==='function') node.showModal();
    else node.setAttribute('open','');
    close.current?.focus();
    return ()=>{node.close?.(); document.body.style.overflow=overflow; trigger.current?.focus();};
  },[open]);
  const contents=<><Media image={image}/><span className="home-gallery__frame" aria-hidden="true"/><span className="home-gallery__icon" aria-hidden="true"/></>;
  // Carousel loop buffers are artwork only, never duplicate keyboard targets.
  if(!interactive) return <span className="home-gallery__image">{contents}</span>;
  const cn=locale==='cn';
  return <>
    <button type="button" ref={trigger} tabIndex={tabIndex} className="home-gallery__image" aria-label={cn?`放大${label}`:`Enlarge ${label}`} onClick={()=>setPreview({image,label})}>{contents}</button>
    {preview && <dialog ref={dialog} className="product-lightbox home-gallery__dialog" aria-labelledby={titleId} onCancel={event=>{event.preventDefault();setPreview(null);}} onClick={event=>{if(event.target===event.currentTarget)setPreview(null);}}>
      <div className="product-lightbox__header"><h2 id={titleId}>{preview.label}</h2><button type="button" ref={close} aria-label={cn?'关闭图片':'Close image'} onClick={()=>setPreview(null)}>×</button></div>
      <Media image={preview.image}/>
    </dialog>}
  </>;
}
