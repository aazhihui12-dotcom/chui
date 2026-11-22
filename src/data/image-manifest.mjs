const showroomRoot = "C:/Users/Administrator/Desktop/昂玖熙官网";
const factoryRoot = "C:/Users/Administrator/Desktop/服装厂缝纫工作照";

export const siteImages = {
  heroDesktopPrimary: {
    source: `${showroomRoot}/01.jpg`,
    output: "hero-desktop-primary.webp",
    alt: "昂玖熙广州展厅内的女装牛仔模特与陈列",
    width: 1920,
    height: 1080,
    position: "center center"
  },
  heroDesktopAlternate: {
    source: `${showroomRoot}/02.jpg`,
    output: "hero-desktop-alternate.webp",
    alt: "昂玖熙女装牛仔展厅与模特选款场景",
    width: 1920,
    height: 1080,
    position: "center center"
  },
  heroMobilePrimary: {
    source: `${showroomRoot}/03.jpg`,
    output: "hero-mobile-primary.webp",
    alt: "女装牛仔裤移动端全身穿搭展示",
    width: 1080,
    height: 1920,
    position: "center center"
  },
  heroMobileAlternate: {
    source: `${showroomRoot}/04.jpg`,
    output: "hero-mobile-alternate.webp",
    alt: "昂玖熙牛仔裤版型移动端展示",
    width: 1080,
    height: 1920,
    position: "center center"
  },
  showroomPrimary: {
    source: `${showroomRoot}/05.jpg`,
    output: "showroom-primary.webp",
    alt: "昂玖熙广州女装牛仔品牌展厅",
    width: 1600,
    height: 900,
    position: "center center"
  },
  showroomAlternate: {
    source: `${showroomRoot}/08.jpg`,
    output: "showroom-alternate.webp",
    alt: "广州展厅内整齐陈列的女装牛仔款式",
    width: 1600,
    height: 900,
    position: "center center"
  },
  selectionService: {
    source: `${showroomRoot}/09.jpg`,
    output: "selection-service.webp",
    alt: "客户在昂玖熙展厅现场查看牛仔款式",
    width: 1600,
    height: 1067,
    position: "center center"
  },
  livePreparation: {
    source: `${showroomRoot}/15.jpg`,
    output: "live-preparation.webp",
    alt: "工作人员整理牛仔裤并准备选款素材",
    width: 1600,
    height: 1067,
    position: "center center"
  },
  materialStillLife: {
    source: `${showroomRoot}/06.jpg`,
    output: "material-still-life.webp",
    alt: "折叠牛仔裤与面料质感静物",
    width: 1200,
    height: 800,
    position: "center center"
  },
  collectionLookOne: {
    source: `${showroomRoot}/27.jpg`,
    output: "collection-look-one.webp",
    alt: "女装牛仔裤当季版型穿搭一",
    width: 1200,
    height: 1500,
    position: "center center"
  },
  collectionLookTwo: {
    source: `${showroomRoot}/28.jpg`,
    output: "collection-look-two.webp",
    alt: "女装牛仔裤当季版型穿搭二",
    width: 1200,
    height: 1500,
    position: "center center"
  },
  collectionLookThree: {
    source: `${showroomRoot}/29.jpg`,
    output: "collection-look-three.webp",
    alt: "女装牛仔裤当季版型穿搭三",
    width: 1200,
    height: 1500,
    position: "center center"
  },
  colorStory: {
    source: `${showroomRoot}/30.jpg`,
    output: "denim-color-story.webp",
    alt: "多种洗水颜色的牛仔面料组合",
    width: 1200,
    height: 800,
    position: "center center"
  },
  patternDesign: {
    source: `${factoryRoot}/C6795_still.JPG`,
    output: "pattern-design.webp",
    alt: "昂玖熙生产基地的电脑制版环节",
    width: 1600,
    height: 900,
    position: "center center"
  },
  cuttingProduction: {
    source: `${factoryRoot}/C6797_still.JPG`,
    output: "cutting-production.webp",
    alt: "服装生产基地的面料铺布与裁剪环节",
    width: 1600,
    height: 900,
    position: "center center"
  },
  denimQualityControl: {
    source: `${factoryRoot}/C6834_still.JPG`,
    output: "denim-quality-control.webp",
    alt: "工作人员进行蓝色牛仔成衣检查与后整",
    width: 1600,
    height: 900,
    position: "center center"
  },
  packingDelivery: {
    source: `${factoryRoot}/C6843_still.JPG`,
    output: "packing-delivery.webp",
    alt: "服装完成检查后的折叠与包装流程",
    width: 1600,
    height: 900,
    position: "center center"
  }
};

export const imagePublicPath = (image) => `/images/site/${image.output}`;
