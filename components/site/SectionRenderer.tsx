import type { ContentBlock } from "@/content/schema";
import { CountUp } from "@/components/interactive/CountUp";
import { Media } from "./Media";

export function SectionRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return <>{blocks.map((block, index) => {
    switch (block.type) {
      case "rich-text": return <section className="content-text" key={index}>{block.heading && <h2>{block.heading}</h2>}{block.paragraphs.map((text, i) => <p key={i}>{text}</p>)}{block.items && <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>}</section>;
      case "stats": return <dl className="stats-grid" key={index}>{block.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd><CountUp value={item.value} /></dd></div>)}</dl>;
      case "gallery": return <section key={index} className="content-gallery">{block.heading && <h2>{block.heading}</h2>}<div>{block.images.map((image, i) => <Media key={`${image.src}-${i}`} image={image} />)}</div></section>;
      case "media": return <figure className="content-media" key={index}><Media image={block.image} />{block.caption && <figcaption>{block.caption}</figcaption>}{block.videoUrl && <video controls preload="none" src={block.videoUrl} poster={block.image.src} />}</figure>;
      case "cta": return <section className="content-cta" key={index}>{block.heading && <h2>{block.heading}</h2>}{block.description && <p>{block.description}</p>}<div className="button-row">{block.actions.map((action) => <a className="lbh-button" href={action.href} key={action.label}>{action.label}<span aria-hidden="true"> ↗</span></a>)}</div></section>;
      case "split": return <section key={index} className={`content-split content-split--${block.imagePosition ?? "right"}`}><div><h2>{block.heading}</h2>{block.paragraphs.map((text, i) => <p key={i}>{text}</p>)}{block.actions?.map((action) => <a className="lbh-button" key={action.label} href={action.href}>{action.label}</a>)}</div><Media image={block.image} /></section>;
      case "timeline": return <ol className="content-timeline" key={index}>{block.items.map((item) => <li key={item.year}><span>{item.year}</span><h2>{item.title}</h2><p>{item.description}</p></li>)}</ol>;
      case "hero": return <section className="content-hero" key={index}>{block.image && <Media image={block.image} />}<h2>{block.title}</h2>{block.subtitle && <p>{block.subtitle}</p>}{block.actions?.map((action) => <a className="lbh-button" href={action.href} key={action.label}>{action.label}</a>)}</section>;
    }
  })}</>;
}
