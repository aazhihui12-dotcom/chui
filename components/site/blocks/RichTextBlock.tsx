import type { RichTextBlock as RichTextContent } from "@/content/schema";

export function RichTextBlock({ block }: { block: RichTextContent }) {
  return <section className="content-text">{block.heading && <h2>{block.heading}</h2>}{block.paragraphs.map((text, index) => <p key={index}>{text}</p>)}{block.items && <ul>{block.items.map((item, index) => <li key={index}>{item}</li>)}</ul>}</section>;
}
