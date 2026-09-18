export const visualRoutes = [
  "/en", "/cn", "/en/ProductIndex", "/en/ProductDetail/11906944.html",
  "/cn/ProductDetail/11906921.html", "/en/Company_Introduction",
  "/en/NewsDetail/6860217.html", "/cn/Contact_Us",
];
export const visualViewports = [{ width: 1440, height: 1200 }, { width: 390, height: 844 }];
export const visualName = (route: string, width: number) => `${route.slice(1).replaceAll("/", "-")}-${width}.png`;
