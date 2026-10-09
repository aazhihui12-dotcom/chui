import type { SitePage } from "@/content/schema";
import { Media } from "@/components/site/Media";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { HeroCarousel } from "@/components/interactive/HeroCarousel";
import { VideoModal } from "@/components/interactive/VideoModal";
import { apowerCategories as categories, apowerProducts as products, artwork, text, overviewVideo } from "@/content/apower";
import { SourceVideo } from "@/components/interactive/SourceVideo";
import { homeCopy, manufacturingPoster, manufacturingVideo, sustainabilityIcons } from "@/content/home";
import { InquiryTrigger } from "@/components/interactive/InquiryTrigger";
import { PartnerCarousel } from "@/components/interactive/PartnerCarousel";
import { SourceButtonLabel } from "@/components/site/SourceButtonLabel";
import { HomeMotion } from "@/components/interactive/HomeMotion";
import { HomeGalleryImage } from "@/components/interactive/HomeGalleryImage";

export function HomeTemplate({ page }: { page: SitePage }) {
  const copy = homeCopy[page.locale];
  const contact = `/${page.locale}/Contact_Us`;
  const media = page.blocks.filter((block) => block.type === "media");
  const uniqueMedia = [...new Map(media.map((block) => [block.image.src, block.image])).values()];
  const galleries = page.blocks.filter((block) => block.type === "gallery");
  const stats = [{type: 'stats' as const,items:[9,10,11,12].map(id=>{const value=text(id,page.locale);const match=value.match(/^(\d+\+?)\s*(.*)$/)!;return {value:match[1],label:match[2]};})}];
  const featured = products.slice(0,4);
  return <main id="main-content" tabIndex={-1} className="home-page">
    <HomeMotion locale={page.locale} />
    <HeroCarousel locale={page.locale} slides={[
      { title: copy.title, subtitle: copy.partner, image: artwork('hero-brand'), bullets: copy.bullets },
      {title:page.locale==='cn'?'Miracle Essence · G1 高速吹风机':'Miracle Essence · G1 High-Speed Hair Dryer', subtitle:page.locale==='cn'?'微雾精华吹护，让秀发更强韧、更有光泽':'Micro-Mist Essence Drying for Stronger, Shinier Hair',image:artwork('hero-g1'),bullets:page.locale==='cn'?['完整的专利布局，拥有美国、英国及欧盟专利认证','支持小批量定制：1,000 台起订，可定制包装与丝印']:['Comprehensive patent portfolio: US, UK and EU patent certifications','Minimum order quantity of 1,000 units; custom packaging and screen printing available'],href:`/${page.locale}/ProductDetail/AP-G1.html`},
      {title:'AR01',subtitle:page.locale==='cn'?'手持式吸附挂烫机，重新定义衣物护理':'HANDHELD STEAM GARMENT STEAMER — REDEFINING THE SUCTION-STYLE GARMENT STEAMER',image:artwork('hero-ar01'),bullets:page.locale==='cn'?['吸附力 5500 Pa','最高转速 95000 RPM']:['Adsorption capacity: 5500 Pa','Maximum speed: 95000 RPM'],href:`/${page.locale}/ProductDetail/AP-AR01.html`},
    ]} />
    <section className="home-manufacturing" aria-labelledby="manufacturing-title">
      <h2 id="manufacturing-title">{copy.manufacturing}</h2>{copy.why && <p>{copy.why}</p>}<p>{copy.video}</p>
      <div className="home-manufacturing__media">
        <VideoModal src={manufacturingVideo} poster="/media/manufacturing-opening.webp" locale={page.locale} background />
        <SectionRenderer blocks={stats} />
      </div>
    </section>

    <section className="home-products home-section" aria-labelledby="products-title">
      <h2 id="products-title">{copy.products}</h2><p className="section-intro">{copy.productDescription}</p>
      <div className="home-products__grid">{categories.map((category, index) => <a className="product-category" key={category.id} href={`/${page.locale}${category.legacyPath}`}>
        <span className="home-product-image"><Media image={{ ...category.image!, alt: "" }} /></span><h3>{category.title[page.locale]}<span aria-hidden="true">↗</span></h3>
      </a>)}</div>
      <div className="button-row"><InquiryTrigger locale={page.locale} title={copy.quote}>{copy.quote} ↗</InquiryTrigger><InquiryTrigger locale={page.locale} title={copy.catalogue} className="lbh-button lbh-button--outline">{copy.catalogue} ↗</InquiryTrigger></div>
    </section>

    <section className="home-audiences" aria-label={page.locale === "cn" ? "合作机会" : "Partnership opportunities"}>
      <h2 className="home-audiences__heading">{text(15,page.locale)}</h2>
      <div className="home-section home-audiences__grid">{copy.audiences.map((heading, index) => <article key={heading} className="audience-card">
        <Media image={artwork(['partner-distributor','partner-brand','partner-engineer','partner-online','partner-referral'][index])} /><div><h2>{heading}</h2>{index === 4 && <p>{copy.agents}</p>}<a className="lbh-button" href={contact}><SourceButtonLabel>{copy.join}</SourceButtonLabel></a></div>
      </article>)}</div>
    </section>

    <section className="home-featured-products" aria-label={page.locale === "cn" ? "精选产品" : "Featured products"}>
      {featured.map((product) => <a href={`/${page.locale}${product.locales[page.locale].legacyPath}`} key={product.id}>
        <span className="home-product-image"><Media image={{ ...product.image!, alt: "" }} /></span><h3>{product.model}</h3>
      </a>)}
    </section>

    <section className="home-welcome home-section" id="welcome" aria-labelledby="welcome-title">
      <header className="home-welcome__intro"><h2 id="welcome-title">{copy.welcome}</h2>{copy.welcomeParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</header>
      <div className="home-welcome__media"><SourceVideo video={overviewVideo} locale={page.locale} poster={manufacturingPoster} title={page.locale==='cn'?'APOWER TECH · 公司概览':'APOWER TECH · Company Overview'} /></div>
      <a className="lbh-button" href={contact}><SourceButtonLabel>{copy.contact}</SourceButtonLabel></a>
    </section>

    <section className="home-partners" id="partners"><div className="home-partners__inner"><h2>{copy.partners}</h2>{galleries[0] && <PartnerCarousel images={galleries[0].images} label={copy.partners} locale={page.locale} />}
      <div className="testimonials">{copy.testimonials.map((quote, index) => <figure key={quote}><Media image={{ ...uniqueMedia[index + 10], alt: "" }} /><blockquote>{quote}</blockquote><figcaption>{["Jeff Deng", "Warren Steve", "María Emilia"][index]}</figcaption></figure>)}</div>
    </div></section>

    <section className="home-certifications home-section"><h2>{copy.certification}</h2>{galleries.at(-1) && <section className="content-gallery">{galleries.at(-1)!.heading && <h2>{galleries.at(-1)!.heading}</h2>}<div>{galleries.at(-1)!.images.map((image,index)=><HomeGalleryImage key={`${image.src}-${index}`} image={image} locale={page.locale} label={image.alt || `${copy.certification} ${index+1}`}/>)}</div></section>}</section>

    <section className="home-sustainability" id="sustainability"><div className="home-section">
      <h2>{copy.sustainability}</h2>
      <div className="sustainability-grid">{[0,3,2,1].map((copyIndex, index) => <a href={`/${page.locale}/Sustainable_Development`} key={copyIndex}>
        <Media image={{ src:sustainabilityIcons[index], alt:'', width:200, height:200 }} />
        <h3>{copy.sustainableItems[copyIndex]}</h3>
      </a>)}</div>
    </div></section>

    <section className="home-mission home-section"><Media image={artwork('logo-white','APOWER')} /><div><p className="eyebrow">APOWER TECH</p><h2>{copy.mission}</h2>{copy.missionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a className="text-link" href={contact}>{copy.customization} ↗</a></div></section>

    <section className="home-customization"><Media image={artwork('logo-white','APOWER')} /><h2>{copy.customization}</h2><div className="button-row"><InquiryTrigger locale={page.locale} title={copy.quote}>{copy.quote} ↗</InquiryTrigger><InquiryTrigger locale={page.locale} title={copy.catalogue} className="lbh-button lbh-button--outline">{copy.catalogue} ↗</InquiryTrigger></div></section>

    <section className="home-final-cta"><Media image={{ ...uniqueMedia[14], alt: "" }} /><div className="home-section"><h2>{copy.finalHeading}</h2><InquiryTrigger locale={page.locale} title={copy.expert}>{copy.expert}</InquiryTrigger></div></section>
  </main>;
}
