import { text } from './apower';
import type { Locale } from './schema';
const make=(locale:Locale)=>({
 title:text(2,locale),partner:text(3,locale),bullets:[4,5,6,7].map(i=>text(i,locale)),
 manufacturing:text(8,locale),why:'',video:locale==='cn'?'了解我们的生产制造体系':'Explore our manufacturing system',
 products:text(13,locale),productDescription:text(14,locale),
 audiences:[16,17,18,19].map(i=>text(i,locale)).concat(locale==='cn'?'经纪人 / 推荐伙伴':'Referral Partners'),agents:text(20,locale),
 join:locale==='cn'?'今天加入我们':'Join us today',quote:locale==='cn'?'立即询价':'Get a Quote Now',catalogue:locale==='cn'?'索取完整产品目录':'Request Full Product Catalog',contact:locale==='cn'?'联系我们':'Contact Us',
 welcome:text(21,locale),welcomeParagraphs:[text(22,locale)],partners:text(23,locale),
 testimonials:[24,25,26].map(i=>text(i,locale).replace(/\s*[—–]+\s*(Jeff Deng|Warren Steve|María Emilia)$/,'')),
 certification:text(27,locale),sustainability:text(28,locale),sustainableItems:[29,30,31,32].map(i=>text(i,locale)),
 mission:text(33,locale),missionParagraphs:[text(34,locale)],customization:text(35,locale),
 finalHeading:locale==='cn'?'让我们今天就取得联系，找到正确的解决方案！':'Let’s connect today and find the right solution.',expert:locale==='cn'?'与家电专家交流':'Speak with an Appliance Expert',
});
export const homeCopy={cn:make('cn'),en:make('en')};
export const manufacturingVideo='/media/b2826cd9475f31b7fff671709db2d4909cb86c72e6c196c73f0109d0039ef959.mp4';
export const manufacturingPoster='/media/manufacturing-poster.jpg';
// The retained LBH homepage's transparent white icon artwork, in source order.
export const sustainabilityIcons = [
 '/media/f5b922de341d5afcd094a78d59bc785b13401fb2841f2800f75cee5742715b84.png',
 '/media/b181f7afcd98f4d5b0792e6050a1cd3f37c79a2a673b9e00df4496d306bd27c3.png',
 '/media/8d71177979fd77c7219e1bf5b11916efcbfae6ff6dba95a099cb5a0ef22ce95b.png',
 '/media/7342b9dc51cfbd13a36f036dcd6c46db49ccad5a78d9dcbf08f869e568a7ad76.png',
];
