import type { SitePage } from "@/content/schema";
import { Media } from "@/components/site/Media";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { HeroCarousel } from "@/components/interactive/HeroCarousel";
import { VideoModal } from "@/components/interactive/VideoModal";
import { categories, products } from "@/content/products";
import { homeCopy, manufacturingPoster, manufacturingVideo } from "@/content/home";
import { InquiryTrigger } from "@/components/interactive/InquiryTrigger";
import { PartnerCarousel } from "@/components/interactive/PartnerCarousel";

export function HomeTemplate({ page }: { page: SitePage }) {
  const copy = homeCopy[page.locale];
  const contact = `/${page.locale}/Contact_Us`;
  const media = page.blocks.filter((block) => block.type === "media");
  const uniqueMedia = [...new Map(media.map((block) => [block.image.src, block.image])).values()];
  const galleries = page.blocks.filter((block) => block.type === "gallery");
  const stats = page.blocks.filter((block) => block.type === "stats");
  const featured = ["11906944", "11906943", "11906942", "11906941"].map((id) => products.find((product) => product.id === id)!);
  return <main id="main-content" tabIndex={-1} className="home-page">
    <HeroCarousel locale={page.locale} slides={[
      { title: page.locale === "cn" ? "LBH电器 ,节省您的时间与成本并成就您的品牌" : page.title, subtitle: copy.partner, image: page.images[0], bullets: copy.bullets },
    ]} />
    <section className="home-manufacturing" aria-labelledby="manufacturing-title">
      <h2 id="manufacturing-title">{copy.manufacturing}</h2>{copy.why && <p>{copy.why}</p>}<p>{copy.video}</p>
      <div className="home-manufacturing__media">
        <VideoModal src={manufacturingVideo} poster="/media/manufacturing-opening.webp" locale={page.locale} background />
        <SectionRenderer blocks={stats} />
      </div>
      <section className="home-featured-products" aria-label={page.locale === "cn" ? "精选产品" : "Featured products"}>
        {featured.map((product, index) => <a href={`/${page.locale}${product.locales[page.locale].legacyPath}`} key={product.id}>
          <Media image={{ ...page.images[index + 3], alt: "" }} /><h3>{product.model}</h3>
        </a>)}
      </section>
    </section>

    <section className="home-products home-section" aria-labelledby="products-title">
      <h2 id="products-title">{copy.products}</h2><p className="section-intro">{copy.productDescription}</p>
      <div className="home-products__grid">{categories.map((category, index) => <a className="product-category" key={category.id} href={`/${page.locale}${category.legacyPath}`}>
        <Media image={{ ...uniqueMedia[index], alt: "" }} /><h3>{category.title[page.locale]}<span aria-hidden="true">↗</span></h3>
      </a>)}</div>
      <div className="button-row"><InquiryTrigger locale={page.locale} title={copy.quote}>{copy.quote} ↗</InquiryTrigger><InquiryTrigger locale={page.locale} title={copy.catalogue} className="lbh-button lbh-button--outline">{copy.catalogue} ↗</InquiryTrigger></div>
    </section>

    <section className="home-audiences" aria-label={page.locale === "cn" ? "合作机会" : "Partnership opportunities"}>
      <div className="home-section home-audiences__grid">{copy.audiences.map((heading, index) => <article key={heading} className="audience-card">
        <Media image={{ ...uniqueMedia[index + 5], alt: "" }} /><div><h2>{heading}</h2>{index === 4 && <p>{copy.agents}</p>}<a href={contact}>{copy.join} <span aria-hidden="true">↗</span></a></div>
      </article>)}</div>
    </section>

    <section className="home-welcome home-section"><div><p className="eyebrow">LBH APPLIANCES</p><h2>{copy.welcome}</h2>{copy.welcomeParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a className="lbh-button" href={contact}>{copy.contact} ↗</a></div><Media image={{ src: manufacturingPoster, alt: page.locale === "cn" ? "LBH生产与装配现场" : "LBH production and assembly facility", width: 1280, height: 720 }} /></section>

    <section className="home-partners home-section"><h2>{copy.partners}</h2>{galleries[0] && <PartnerCarousel images={galleries[0].images} label={copy.partners} locale={page.locale} />}
      <div className="testimonials">{copy.testimonials.map((quote, index) => <figure key={quote}><Media image={{ ...uniqueMedia[index + 10], alt: "" }} /><blockquote>{quote}</blockquote><figcaption>{["Jeff Deng", "Warren Steve", "María Emilia"][index]}</figcaption></figure>)}</div>
    </section>

    <section className="home-certifications home-section"><h2>{copy.certification}</h2>{galleries.at(-1) && <SectionRenderer blocks={[galleries.at(-1)!]} />}</section>

    <section className="home-sustainability"><div className="home-section"><h2>{copy.sustainability}</h2><div className="sustainability-grid">{copy.sustainableItems.map((item, index) => <a href={`/${page.locale}/Sustainable_Development`} key={item}><span aria-hidden="true">{["☀", "↯", "♧", "♲"][index]}</span><h3>{item}</h3></a>)}</div></div></section>

    <section className="home-mission home-section"><Media image={{ ...uniqueMedia[13], alt: page.locale === "cn" ? "LBH研发与合作" : "LBH research and collaboration" }} /><div><p className="eyebrow">LBH APPLIANCES</p><h2>{copy.mission}</h2>{copy.missionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a className="text-link" href={contact}>{copy.customization} ↗</a></div></section>

    <section className="home-final-cta"><Media image={{ ...uniqueMedia[14], alt: "" }} /><div className="home-section"><h2>{copy.finalHeading}</h2><InquiryTrigger locale={page.locale} title={copy.expert}>{copy.expert}</InquiryTrigger></div></section>
  </main>;
}
