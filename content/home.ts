import { englishHome } from "./pages";
import type { Locale, RichTextBlock } from "./schema";

// Captured desktop/mobile duplicates are reduced to one section per heading.
// Chinese text translates the same captured source, whose CN endpoint is mixed-language.
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
    partner: "您值得信赖的个护与家用电器合作伙伴",
    bullets: ["10条自动化生产线", "8年个护与家用电器研发制造经验", "66个成功的联合品牌案例", "提供创新的个护与家用电器设计和研发解决方案"],
    manufacturing: "为什么选择LBH的个护电器解决方案？",
    why: "为什么众多知名品牌信赖LBH的个护电器解决方案？", video: "一分钟视频，了解我们卓越的制造体系。",
    products: "即刻选择有竞争力的产品",
    productDescription: "与大多数供应商相比，我们专注于打造具有竞争壁垒、专属私模和高标准认证的高品质产品。",
    audiences: ["您是经销商或批发商？", "您是品牌定制客户？", "您是工程师或设计师？", "您是线上品牌经营者？", "诚邀代理商"],
    agents: "如果您与家电行业的品牌采购专业人士保持联系，我们诚邀您成为LBH电器的重要合作伙伴。",
    join: "今天加入我们", quote: "立即询价", catalogue: "索取完整产品目录", contact: "联系我们",
    welcome: "欢迎加入LBH电器大家庭",
    welcomeParagraphs: ["在LBH电器，我们深知您的业务需要的不仅是一款个护电器，更是助力品牌成功的创新解决方案。", "多年的行业经验让我们积累了个护电器研发与设计的专业能力，致力于提供超越您预期的产品。", "我们深入挖掘每个设计的潜力，确保产品方案提升您的品牌形象和消费者认知。", "选择LBH电器，就是与致力于推动您业务发展和成长的专业制造商携手合作。"],
    partners: "重要合作伙伴",
    testimonials: ["LBH为我们定制的高速吹风机在设计和技术创新方面处于行业前沿。凭借产品的差异化与出色的使用体验，我们在短时间内赢得了市场份额。LBH兑现了最初的承诺，我们的深入合作仍在继续。感谢团队的努力与付出。", "LBH是我们合作过的高效团队。从首次会面到最终交付，仅用了两个多月。新产品的开发过程成功规避了潜在专利问题，消费者喜爱产品的外观，上市后市场反馈良好。期待继续合作，研发更多创新产品。", "LBH定制的高速吹风机凭借独特的差异化与出色的体验，帮助我们迅速获得市场份额。团队兑现了承诺，我们已成功进入新的国际市场，双方合作持续深化。感谢LBH团队的辛勤付出。"],
    certification: "LBH电器产品认证", sustainability: "为下一代的可持续发展而努力",
    sustainableItems: ["可再生能源", "节能产品", "环保包装与涂层", "可持续包装"],
    mission: "我们的使命",
    missionParagraphs: ["多年来，我们与海外专业研究机构合作，深入了解个护与家用电器行业未来的研发趋势和方向。同时，我们扎根客户市场，派遣工程团队观察当地消费者的真实使用场景及售后体验，并通过严谨的数据分析持续完善产品设计。我们的使命是了解客户需求，并做好客户需要的事。与我们的联合品牌合作伙伴携手，打造满足用户需求的高品质产品。"],
    customization: "立即联系LBH电器，开启您的产品定制！",
    finalHeading: "今天就联系我们，找到适合您的解决方案！", expert: "咨询家电专家",
  },
} satisfies Record<Locale, object>;

export const manufacturingVideo = "/media/b2826cd9475f31b7fff671709db2d4909cb86c72e6c196c73f0109d0039ef959.mp4";
export const manufacturingPoster = "/media/manufacturing-poster.jpg";
