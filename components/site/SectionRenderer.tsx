import type { ContentBlock } from "@/content/schema";
import { Fragment, type ReactElement } from "react";
import { HeroBlock } from "./blocks/HeroBlock";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { MediaBlock } from "./blocks/MediaBlock";
import { SplitBlock } from "./blocks/SplitBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";
import { CtaBlock } from "./blocks/CtaBlock";

function assertNever(block: never): never {
  throw new Error(`Unhandled content block: ${JSON.stringify(block)}`);
}

export function renderBlock(block: ContentBlock): ReactElement {
  switch (block.type) {
    case "hero": return <HeroBlock block={block} />;
    case "rich-text": return <RichTextBlock block={block} />;
    case "media": return <MediaBlock block={block} />;
    case "split": return <SplitBlock block={block} />;
    case "stats": return <StatsBlock block={block} />;
    case "gallery": return <GalleryBlock block={block} />;
    case "timeline": return <TimelineBlock block={block} />;
    case "cta": return <CtaBlock block={block} />;
    default: return assertNever(block);
  }
}

export function SectionRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return <>{blocks.map((block, index) => <Fragment key={index}>{renderBlock(block)}</Fragment>)}</>;
}
