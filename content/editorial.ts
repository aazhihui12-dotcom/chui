// Layout groups refer to the source-ordered blocks in the captured content/pages.ts.
// Repeated mobile/desktop copies are omitted explicitly, never by fuzzy text matching.
export const editorialPaths = [
  "/Company_Introduction", "/Lead_the_team", "/Factory_tour", "/Milestone", "/Certification_certificate",
  "/Sustainable_Development", "/Product_Laboratory", "/Exclusive_sale", "/Contract_manufacturing_service",
  "/PinZhiGuanLi", "/Design_and_Development", "/Order_Management", "/Product_manufacturing",
  "/Product_Warranty_and_After-Sales_Service", "/Ventilation_duct_technology", "/We_are_here_to_offer_assistance",
] as const;

export interface EditorialSection {
  layout: "stack" | "split" | "cards" | "feature" | "certificates" | "timeline";
  groups: EditorialEntry[][];
  tone?: "muted" | "dark";
}

export interface EditorialSourceGallery {
  media: number[];
  label: { en: string; cn: string };
  autoplayMs?: number;
}
export type EditorialEntry = number | EditorialSourceGallery | { icon: number; block: number } | { video: string };

// The source's ModuleSlideV2Giant photos are retained in page.images, but its
// generic block extraction misses the slide modules. Keep the exact groupings.
const sourceGallery = (media: number[], en: string, cn: string, autoplayMs = 0): EditorialSourceGallery => ({ media, label: { en, cn }, autoplayMs });

const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, index) => first + index);

export const editorialSections: Partial<Record<(typeof editorialPaths)[number], EditorialSection[]>> = {
  "/Company_Introduction": [
    { layout: "feature", groups: [[2, 3]] },
    { layout: "split", groups: [[4, 5], [6, 7]] },
    { layout: "certificates", groups: [[8, 10]], tone: "muted" },
    { layout: "stack", groups: [[11, 12, 13]] },
    { layout: "cards", groups: [[14, 15], [16, 17], [18, 19], [20, 21]] },
    { layout: "stack", groups: [[26]], tone: "dark" },
    { layout: "stack", groups: [[28]] },
    { layout: "cards", groups: [[29, 30], [31, 32], [33, 34]] },
    { layout: "stack", groups: [[35]], tone: "muted" },
    { layout: "cards", groups: [[36, 37, 38], [39, 40, 41], [42, 43, 44]], tone: "muted" },
  ],
  "/Lead_the_team": [
    { layout: "split", groups: [[2], [3, 4]] },
    { layout: "split", groups: [[5], [6]] },
    { layout: "split", groups: [[7], [8, 9, 10]], tone: "muted" },
  ],
  "/Factory_tour": [
    { layout: "stack", groups: [[2]] },
    { layout: "split", groups: [[sourceGallery([0, 1, 2], "Assembly Site", "装配现场", 4000), 3], [sourceGallery([3, 4, 5], "Motor Factory", "电机工厂"), 4]] },
    { layout: "split", groups: [[5], [{ video: "gg8SzzwqR2M" }]] },
    { layout: "stack", groups: [[6, 7]] },
    { layout: "stack", groups: [[9, 10]], tone: "muted" },
    { layout: "cards", groups: [[11, 12], [13, 14], [15, 16], [17, 18], [19, 20], [21, 22], [23, 24], [25, 26]], tone: "muted" },
    { layout: "stack", groups: [[27, 28]] },
  ],
  "/Milestone": [{ layout: "timeline", groups: [[9]] }],
  "/Certification_certificate": [{ layout: "certificates", groups: [[2]] }],
  "/Sustainable_Development": [
    { layout: "split", groups: [[2, 3], [4]] },
    { layout: "split", groups: [[5], [6, 7]], tone: "muted" },
    { layout: "split", groups: [[9, 10], [11]] },
  ],
  "/Product_Laboratory": [
    { layout: "split", groups: [[2, { icon: 0, block: 3 }, { icon: 0, block: 4 }, { icon: 0, block: 5 }, { icon: 0, block: 6 }], [sourceGallery([1, 2, 3], "Product laboratory", "产品实验室", 3000)]] },
    { layout: "split", groups: [[7], [8]] },
    { layout: "stack", groups: [[10, 11]], tone: "muted" },
    { layout: "cards", groups: [[12, 13], [14, 15], [16, 17]], tone: "muted" },
  ],
  "/Exclusive_sale": [
    { layout: "split", groups: [[2, 3], [4]] },
    { layout: "stack", groups: [[5, 6]], tone: "muted" },
    { layout: "cards", groups: [[7, 8], [9, 10], [11, 12]], tone: "muted" },
    { layout: "split", groups: [[13], [14, 15, 16]] },
  ],
  "/Contract_manufacturing_service": [
    { layout: "split", groups: [[2], [3]] },
    { layout: "cards", groups: [[4], [5], [6], [7]], tone: "muted" },
    { layout: "stack", groups: [[8, 9]] },
    { layout: "cards", groups: [[10, 11, 12], [13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23], [24, 25, 26], [27, 28, 29], [30, 31, 32]], tone: "muted" },
    { layout: "stack", groups: [[33, 34]] },
    { layout: "cards", groups: [[35, 36, 37], [38, 39, 40], [41, 42, 43], [44, 45, 46]] },
    { layout: "split", groups: [[52], [53, 54, 55]], tone: "muted" },
  ],
  "/PinZhiGuanLi": [
    { layout: "split", groups: [[2], [sourceGallery([0, 1], "ISO 9001:2000 quality management", "ISO 9001:2000 品质管理")]] },
    { layout: "split", groups: [[sourceGallery([2, 3], "Quality in every component", "零部件品质管理")], [3, 4]], tone: "dark" },
    { layout: "split", groups: [[sourceGallery([4, 5], "Independently developed drive module", "自主研发驱动模块")], [5, 6]], tone: "muted" },
    { layout: "split", groups: [[7, 8], [sourceGallery([6, 7, 8], "High-speed motor manufacturing", "高速电机制造")]] },
    { layout: "split", groups: [[sourceGallery([9, 10, 11], "CNC mold engraving", "CNC 模具雕刻")], [9, 10]], tone: "muted" },
    { layout: "split", groups: [[11, 12], [sourceGallery([12, 13], "Sample testing", "样品测试")]] },
    { layout: "stack", groups: [[13]] },
    { layout: "cards", groups: [[14, 15, 16], [17, 18, 19], [20, 21, 22], [23, 24, 25]] },
    { layout: "split", groups: [[26, 27], [sourceGallery([18, 19], "Assembly control and inspection", "装配控制与检验")]] },
    { layout: "split", groups: [[28], [29, 30, 31]], tone: "muted" },
  ],
  "/Design_and_Development": [
    { layout: "stack", groups: [[2]] },
    { layout: "split", groups: [[3], [4]] },
    { layout: "split", groups: [[5], [6]] },
    { layout: "split", groups: [range(7, 11), [12]] },
    { layout: "stack", groups: [[13]], tone: "muted" },
    { layout: "split", groups: [range(15, 19), [20]], tone: "muted" },
    { layout: "split", groups: [range(21, 25), [26]] },
    { layout: "split", groups: [range(27, 31), [32]], tone: "muted" },
    { layout: "split", groups: [[33], [34, 35, 36]] },
  ],
  "/Order_Management": [
    { layout: "split", groups: [[4, 5], [6]] },
    { layout: "split", groups: [[7], [9, 10, 11, 12]], tone: "muted" },
    { layout: "split", groups: [[14], [15, 16, 17]] },
  ],
  "/Product_manufacturing": [
    { layout: "stack", groups: [[2, 3]] },
    { layout: "cards", groups: [[4], [5], [6], [7], [8]] },
    { layout: "stack", groups: [[9, 10, sourceGallery([5, 6, 7], "Drive board manufacturing", "驱动主板制造", 2000)]], tone: "muted" },
    { layout: "stack", groups: [[12, 13, sourceGallery([8, 9, 10], "Motor manufacturing", "高速电机制造", 2000)]] },
    { layout: "stack", groups: [[15, 16, sourceGallery([11, 12, 13], "Injection molding", "壳料注塑", 2000)]], tone: "muted" },
    { layout: "stack", groups: [[18, 19, sourceGallery([14, 15, 16], "Hair dryer assembly", "吹风机组装", 2000)]] },
    { layout: "stack", groups: [[20, 21]], tone: "muted" },
    { layout: "cards", groups: [[22, 23], [24, 25], [26, 27], [28, 29]], tone: "muted" },
    { layout: "split", groups: [[30], [31, 32, 33]] },
  ],
  "/Product_Warranty_and_After-Sales_Service": [
    { layout: "split", groups: [[2], [3]] },
    { layout: "split", groups: [[4], range(5, 9)], tone: "muted" },
    { layout: "split", groups: [[11], [12, 13, 14]] },
  ],
};

// Chinese CMS modules differ in duplicate headings and paragraph boundaries.
// These groups were checked against the canonical /cn captures, not EN offsets.
export const chineseEditorialSections: typeof editorialSections = {
  ...editorialSections,
  "/Company_Introduction": [
    { layout: "feature", groups: [[2, 3]] },
    { layout: "split", groups: [[4, 5], [6, 7]] },
    { layout: "certificates", groups: [[8, 9]], tone: "muted" },
    { layout: "stack", groups: [[10, 11, 12]] },
    { layout: "cards", groups: [[13, 14], [15, 16], [17, 18], [19, 20]] },
    { layout: "stack", groups: [[25]], tone: "dark" },
    { layout: "cards", groups: [[26, 27], [28, 29], [30, 31]] },
    { layout: "stack", groups: [[32]], tone: "muted" },
    { layout: "cards", groups: [[33, 34, 35], [36, 37, 38], [39, 40, 41]], tone: "muted" },
  ],
  "/Factory_tour": [
    ...editorialSections["/Factory_tour"]!.slice(0, 4),
    { layout: "stack", groups: [[8, 9]], tone: "muted" },
    { layout: "cards", groups: [[10, 11], [12, 13], [14, 15], [16, 17], [18, 19], [20, 21], [22, 23], [24, 25]], tone: "muted" },
    { layout: "stack", groups: [[26, 27]] },
  ],
  "/Milestone": [{ layout: "timeline", groups: [[16]] }],
  "/Contract_manufacturing_service": [
    ...editorialSections["/Contract_manufacturing_service"]!.slice(0, 6),
    { layout: "split", groups: [[51], [52, 53, 54]], tone: "muted" },
  ],
  "/Design_and_Development": [
    ...editorialSections["/Design_and_Development"]!.slice(0, 5),
    { layout: "split", groups: [range(14, 18), [19]], tone: "muted" },
    { layout: "split", groups: [range(20, 24), [25]] },
    { layout: "split", groups: [range(26, 30), [31]], tone: "muted" },
    { layout: "split", groups: [[32], [33, 34, 35]] },
  ],
  "/Order_Management": [
    { layout: "split", groups: [[2], [3]] },
    { layout: "split", groups: [[4], [5, 6, 7, 8]], tone: "muted" },
    { layout: "split", groups: [[10], [11, 12, 13]] },
  ],
  "/Product_manufacturing": [
    ...editorialSections["/Product_manufacturing"]!.slice(0, 3),
    { layout: "stack", groups: [[11, 12, sourceGallery([8, 9, 10], "Motor manufacturing", "高速电机制造", 2000)]] },
    { layout: "stack", groups: [[13, 14, sourceGallery([11, 12, 13], "Injection molding", "壳料注塑", 2000)]], tone: "muted" },
    { layout: "stack", groups: [[15, 16, sourceGallery([14, 15, 16], "Hair dryer assembly", "吹风机组装", 2000)]] },
    { layout: "stack", groups: [[17]], tone: "muted" },
    { layout: "cards", groups: [[18, 19], [20, 21], [22, 23], [24, 25]], tone: "muted" },
    { layout: "split", groups: [[26], [27, 28, 29]] },
  ],
};
