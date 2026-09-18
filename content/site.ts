import type { Locale, NavigationItem, SiteConfig } from "./schema";
import { categories } from "./products";

const serviceLinks = [
  ["Exclusive_sale", "Exclusive Sale", "独家销售"],
  ["Contract_manufacturing_service", "OEM Services", "代工服务"],
  ["PinZhiGuanLi", "Quality Management", "品质管理"],
  ["Design_and_Development", "Design and Development", "设计与研发"],
  ["Order_Management", "Order Management", "订单管理"],
  ["Product_manufacturing", "Product Manufacturing", "产品制造"],
  ["Product_Warranty_and_After-Sales_Service", "Product Warranty and After-Sales Service", "产品保修与售后服务"],
];
const companyLinks = [
  ["Company_Introduction", "Company Profile", "公司介绍"],
  ["Lead_the_team", "Leadership Team", "领导团队"],
  ["Factory_tour", "Factory Tour", "工厂参观"],
  ["Milestone", "Milestone", "发展历程"],
  ["Certification_certificate", "Certification Certificate", "认证证书"],
  ["Sustainable_Development", "Sustainable Development", "可持续发展"],
  ["Product_Laboratory", "Product Lab", "产品实验室"],
];
function createConfig(locale: Locale): SiteConfig {
  const cn = locale === "cn";
  const links = (items: string[][]): NavigationItem[] => items.map(([path, en, zh]) => ({ label: cn ? zh : en, href: `/${locale}/${path}` }));
  return {
    name: "LBH APPLIANCES", locale,
    navigation: [
      { label: cn ? "产品" : "Product", href: `/${locale}/ProductIndex`, children: categories.map((category) => ({ label: category.title[locale], href: `/${locale}${category.legacyPath}` })) },
      { label: cn ? "我们为您提供帮助" : "We are here to help", href: `/${locale}/We_are_here_to_offer_assistance`, children: links(serviceLinks) },
      { label: cn ? "关于我们" : "About", href: `/${locale}/About_us`, children: links(companyLinks) },
      { label: cn ? "联系" : "Touch", href: `/${locale}/Contact`, children: links([["Contact_Us", "Contact Us", "联系我们"], ["FAQ", "FAQ", "常见问题"]]) },
    ],
    contact: {
      phone: "+86 137 0306 7387", email: "tina.fang@linknove.com", whatsapp: "+8613703067387",
      company: cn ? "佛山朗必豪电器有限公司" : "Foshan LBH Appliances Co.,ltd.",
      address: cn ? "广东省佛山市顺德区容桂街道南区社区兴南路9号广意智能装备园3栋1006室" : "Room 1006, Building 3, Guangyi Intelligent Equipment Park, No. 9 Xingnan Road, Nanqu Community, Ronggui Subdistrict, Shunde District, Foshan City, Guangdong Province",
    },
    labels: cn ? {
      inquiry: "立即询价", catalogue: "索取完整产品目录", contact: "联系我们", menu: "菜单", close: "关闭", backToTop: "返回顶部", products: "产品", news: "新闻", specifications: "规格参数", features: "产品功能", accessories: "可选配件",
    } : {
      inquiry: "Get a Quote Now", catalogue: "Request Full Product Catalog", contact: "Contact Us", menu: "Menu", close: "Close", backToTop: "Back to Top", products: "Products", news: "News", specifications: "Parameters", features: "Product Features", accessories: "Optional Accessories",
    },
  };
}

export const siteConfig: Record<Locale, SiteConfig> = { en: createConfig("en"), cn: createConfig("cn") };
