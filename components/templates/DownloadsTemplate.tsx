import { realpathSync, statSync } from "node:fs";
import path from "node:path";
import type { Action, SitePage } from "@/content/schema";
import { pages } from "@/content/pages";
import { siteConfig } from "@/content/site";
import "./content-pages.css";

function verifiedDownload(action: Action) {
  if (!action.href.startsWith("/downloads/") || action.href.split("/").includes("..")) return false;
  try {
    const root = realpathSync(path.resolve("public/downloads"));
    const file = realpathSync(path.resolve("public", `.${action.href}`));
    return file.startsWith(`${root}${path.sep}`) && statSync(file).isFile();
  } catch { return false; }
}

export function DownloadsTemplate({ page }: { page: SitePage }) {
  const cn = page.locale === "cn";
  const downloads = (page.downloads ?? []).filter(verifiedDownload);
  const catalogue = page.legacyPath === "/Product_Catalogue";
  const records = pages.filter(record => record.locale === page.locale && record.legacyPath.startsWith("/DownLoad/")).sort((a, b) => a.id.localeCompare(b.id));
  return <main id="main-content" className="downloads-page support-page">
    <header className="support-banner"><h1>{page.title}</h1></header>
    <div className="support-container">
      {!downloads.length && <p role="status" className="source-note">{cn ? "暂无可下载文件。请联系我们获取最新产品目录。" : "No downloadable files are currently available. Please contact us for the latest product catalogue."}</p>}
      {downloads.length > 0 && <ul className="download-files">{downloads.map(file => <li key={file.href}><a className="support-text-link" href={file.href} download>{file.label}</a></li>)}</ul>}
      {catalogue && <div className="catalogue-grid">{records.map(record => <article key={record.id} className="catalogue-card"><span aria-hidden="true" className="catalogue-icon">↓</span><h2><a href={`/${page.locale}${record.legacyPath}`}>{record.title} — {record.id}</a></h2><p>{cn ? "文件暂不可用" : "File unavailable"}</p></article>)}</div>}
      <div className="downloads-actions"><a className="lbh-button" href={`/${page.locale}/Contact_Us`}>{siteConfig[page.locale].labels.catalogue}</a>
        {!catalogue && <a className="support-text-link" href={`/${page.locale}/Product_Catalogue`}>{cn ? "返回产品目录" : "Back to Product Catalogue"}</a>}
      </div>
    </div>
  </main>;
}
