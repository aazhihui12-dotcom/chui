import { sitePath } from "@/lib/site-path";
/** User-supplied artwork, kept unmodified with its original aspect ratio. */
export function BrandLogo({ className, width = 132 }: { className?: string; width?: number }) {
  return <img className={className} src={sitePath("/media/apower-logo.png")} alt="APOWER" width={width} height={Math.round(width * 164 / 723)} />;
}
