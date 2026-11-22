const forbiddenClaims = [
  "全国TOP3直播间团队",
  "98%返单率",
  "不良率0.005%",
  "准时交付率100%",
  "日产5000件",
  "日产3500件",
  "年营业额3.86亿元",
  "全网最低",
  "行业第一",
  "全国第一",
  "任何人穿都显瘦",
  "没有一条不合适"
];

export function assertPublishableCopy(text) {
  for (const phrase of forbiddenClaims) {
    if (text.includes(phrase)) {
      throw new Error(`Public copy contains forbidden or unverified phrase: ${phrase}`);
    }
  }
}

export { forbiddenClaims };
