import { liveCommerceDetails } from "../data/solutions.mjs";
import { imagePublicPath, siteImages } from "../data/image-manifest.mjs";
import { renderSolutionLayout } from "./solution-layout.mjs";

const image = (key) => imagePublicPath(siteImages[key]);

export function renderLiveCommercePage() {
  return {
    path: "/solutions/live-commerce/",
    title: "女装牛仔直播团队合作｜昂玖熙",
    description: "昂玖熙为女装直播团队提供人群与版型选款、拿样、平拍模特与视频素材、直播讲解及现货和定制协同。",
    body: renderSolutionLayout({
      ...liveCommerceDetails,
      heroImage: image("livePreparation"),
      heroAlt: siteImages.livePreparation.alt,
      secondaryImage: image("collectionLookTwo"),
      secondaryAlt: siteImages.collectionLookTwo.alt,
      secondaryTitle: "让一条裤子的适合人群和讲解重点更清楚",
      secondaryText: "从腰位、裤长、面料、洗水到建议身形，先整理主播真正需要回答的问题。可用素材和合作政策再按具体款式确认。"
    })
  };
}
