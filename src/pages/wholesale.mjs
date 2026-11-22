import { wholesaleDetails } from "../data/solutions.mjs";
import { imagePublicPath, siteImages } from "../data/image-manifest.mjs";
import { renderSolutionLayout } from "./solution-layout.mjs";

const image = (key) => imagePublicPath(siteImages[key]);

export function renderWholesalePage() {
  return {
    path: "/solutions/wholesale/",
    title: "南油二批与女装档口牛仔合作｜昂玖熙",
    description: "面向南油二批、女装档口与全国买手的牛仔选款合作，支持广州展厅看款、现货沟通、补货确认、贴牌换标和定制。",
    body: renderSolutionLayout({
      ...wholesaleDetails,
      heroImage: image("selectionService"),
      heroAlt: siteImages.selectionService.alt,
      secondaryImage: image("showroomAlternate"),
      secondaryAlt: siteImages.showroomAlternate.alt,
      secondaryTitle: "在广州现场，把实物和区域客群放在一起判断",
      secondaryText: "展厅可以查看面料、洗水、细节与上身方向。起订、价格、现货、补货和交付根据实际款式与排期逐项确认。"
    })
  };
}
