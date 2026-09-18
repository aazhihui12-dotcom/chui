import { englishHome, pages } from "./pages";
import type { Locale, RichTextBlock } from "./schema";

// Captured desktop/mobile duplicates are reduced to one section per heading.
// Chinese copy comes from the independently verified canonical www /cn capture.
const chineseHome = pages.find(page => page.id === "home" && page.locale === "cn")!;
const cnText = (index: number) => { const block = chineseHome.blocks[index]; if (block.type !== "rich-text") throw new Error(`Missing Chinese home text ${index}`); return [block.heading, ...block.paragraphs].filter(Boolean).join(" "); };
const sourceParagraphs = (heading: string, offset = 1) => {
  const index = englishHome.blocks.findIndex((block) => block.type === "rich-text" && block.heading === heading);
  const block = englishHome.blocks[index + offset];
  return block?.type === "rich-text" ? block.paragraphs : [];
};
const testimonials = englishHome.blocks.filter((block): block is RichTextBlock => block.type === "rich-text" && !!block.paragraphs.length)
  .filter((block) => /^(The high-speed hair dryer|LBH is the most efficient)/.test(block.paragraphs[0])).map((block) => block.paragraphs[0]);

export const homeCopy = {
  en: {
    partner: "Your Valued Partner in Personal Care and Home Appliances",
    bullets: ["10 Automated Production Lines", "8 Years of Experience in R&D and Manufacturing of Personal Care and Home Appliances", "66 Successful Co-branding Cases", "Providing Innovative Design and R&D Solutions for Personal Care and Home Appliances"],
    manufacturing: "Why LBH's Personal Care Appliances Solutions?",
    why: "Why do so many renowned brands trust LBH's personal care appliance solutions?",
    video: "A one-minute video demonstrating our exceptional manufacturing system.",
    products: "Select Your Competitive Products Now",
    productDescription: sourceParagraphs("Select Your Competitive Products Now")[0],
    audiences: ["Are you a distributor or a wholesaler?", "Are you a brand customization client?", "Are you an engineer or a designer?", "Are you an online brand business owner?", "For Agents Only"],
    agents: "If you have connections with brand purchasing professionals in the home appliance industry, we encourage you to become a valued partner of LBH Appliances.",
    join: "Join us today", quote: "Get a Quote Now", catalogue: "Request Full Product Catalog", contact: "Contact Us",
    welcome: "Welcome to the LBH Appliances Family",
    welcomeParagraphs: sourceParagraphs("Welcome to the LBH Appliances Family"),
    partners: "Valued Partners", testimonials,
    certification: "LBH Appliances Product Certifications",
    sustainability: "Our Efforts for the Sustainable Development of the Next Generation",
    sustainableItems: ["Renewable Energy", "Energy-Saving Products", "Eco-friendly Packaging and Coatings", "Sustainable Packaging"],
    mission: "Our Mission", missionParagraphs: sourceParagraphs("Our Mission", 2),
    customization: "Contact LBH Appliances now to get started on your product customization!",
    finalHeading: "Let's connect today to find the right solution!", expert: "Consult with Home Appliance Experts",
  },
  cn: {
    partner: "您宝贵的个护家电合作伙伴",
    bullets: ["10条自动化生产线", "8年个护家电研发制造经验", "66个成功的联合品牌案例", "提供创新的个护家电设计研发方案"],
    manufacturing: "为什么众多知名品牌信赖LBH的个护小家电解决方案?",
    why: "", video: "一段1分钟的视频，证明我们卓越的制造体系",
    products: "立即选择您有竞争力的产品",
    productDescription: "与大多数其他供应商相比，我们只专注于做有竞争壁垒、私模客制化、高门槛认证的好产品",
    audiences: ["您是经销商或批发商？", "您是品牌定制客户？", "您是工程师或设计师？", "您是网络品牌企业主？", "经纪人专用"],
    agents: "如果您和家电行业的品牌采购人士有联系 我们鼓励您成为LBH电器的宝贵合作伙伴",
    join: "今天加入我们", quote: "立即询价", catalogue: "索取完整产品目录", contact: "联系我们",
    welcome: "欢迎来到LBH电器家族",
    welcomeParagraphs: [cnText(41)],
    partners: "宝贵的合作伙伴",
    testimonials: [cnText(47), cnText(50), cnText(53)],
    certification: "LBH电器的产品认证", sustainability: "我们为下一代的可持续发展所做的努力",
    sustainableItems: ["可再生能源", "节能产品", "环保包装和涂层", "可持续包装"],
    mission: "我们的任务",
    missionParagraphs: [cnText(64)],
    customization: "现在联系LBH电器开始进行您的产品定制吧！",
    finalHeading: "让我们今天联系，寻找正确的解决方案！", expert: "咨询家电专家",
  },
} satisfies Record<Locale, object>;

export const manufacturingVideo = "/media/b2826cd9475f31b7fff671709db2d4909cb86c72e6c196c73f0109d0039ef959.mp4";
export const manufacturingPoster = "/media/manufacturing-poster.jpg";
