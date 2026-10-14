import type { Locale, Specification } from './schema';

// Website Guidance 2.0: 产品!R194, AE207, AE338, AE462, AE581, AF723.
// The user confirmed AP-G3's Model typo; all other supplied values stay intact.
type Row = [cn: string, en: string, value: string];
const hairDryer = (model: string, watts: string, motor: string): Row[] => [
  ['型号', 'Model', model], ['电压', 'Voltage', '220V, 50/60Hz'],
  ['功率', 'Wattage', watts], ['无刷电机转速', 'BLDC Motor', motor],
  ['风速', 'Wind Speed', '20m/s'], ['负离子', 'Negative Ions', '200million'],
  ['噪声', 'Noise Level', '<55dB'], ['风速档位', 'Wind Control Setting', 'Three-speed'],
  ['温度设置', 'Temp Setting', 'Cool/Low/Medium/High'],
  ['产品尺寸', 'Product Size', '240 × 90 × 75mm'],
  ['产品重量', 'Product Weight', '368g'], ['电源线长度', 'Power Cord Length', '1.8m'],
];
const rows: Record<string, Row[]> = {
  'AP-G1': hairDryer('AP-G1', '1500W', '110000RPM'),
  'AP-G3': hairDryer('AP-G3', '1500W', '110000RPM'),
  'AP-G11': hairDryer('AP-G11', '1600W', '115000RPM'),
  'AP-S1': [
    ['型号', 'Model', 'AP-S1'], ['电压', 'Voltage', '125V/220-240V, 50/60Hz'],
    ['功率', 'Wattage', '1400W'], ['无刷电机转速', 'BLDC Motor', '110000RPM'],
    ['负离子', 'Negative Ions', '100 million/cm³'],
    ['风速档位', 'Wind Control Setting', 'Three-speed'], ['温度设置', 'Temp Setting', 'Cool/Low/Medium/High'],
    ['产品尺寸', 'Product Size', '245 × 43 × 43mm (handle)'],
    ['产品重量', 'Product Weight', '376g (With power cord)'], ['电源线长度', 'Power Cord Length', '1.8m'],
  ],
  'AP-H1': [
    ['型号', 'Model', 'AP-H1'], ['电压', 'Voltage', '100-120V/220-240V, 50/60Hz'],
    ['功率', 'Wattage', '1000W'], ['面板材质', 'Plate material', 'PC plastic/Alum Alloy'],
    ['面板涂层', 'Plate coating', 'Ceramic or Titanium'], ['加热器', 'Heater', 'PCT'],
    ['温度设置', 'Temp Setting', '50°C/70°C/100°C'], ['产品尺寸', 'Product Size', '430 × 240 × 170mm'],
    ['产品重量', 'Product Weight', '600g (With power cord)'], ['电源线长度', 'Power Cord Length', '2m'],
  ],
  'AP-AR01': [
    ['型号', 'Model', 'AP-AR01'], ['电压', 'Voltage', '100-120V/220-240V, 50/60Hz'],
    ['功率', 'Wattage', '930W'], ['水箱容量', 'Water Tank Capacity', '110mL'],
    ['产品尺寸', 'Product Size', '137 × 84 × 296mm'],
    ['产品重量', 'Product Weight', '600g (With power cord)'], ['电源线长度', 'Power Cord Length', '1.8m'],
  ],
};
const chineseValues: Record<string, string> = {
  'Three-speed': '三档', 'Cool/Low/Medium/High': '冷风/低温/中温/高温',
  '245 × 43 × 43mm (handle)': '245 × 43 × 43mm（手柄）',
  '376g (With power cord)': '376g（含电源线）', '600g (With power cord)': '600g（含电源线）',
  'PC plastic/Alum Alloy': 'PC 塑料/铝合金', 'Ceramic or Titanium': '陶瓷或钛',
};
export function apowerSpecifications(model: string, locale: Locale): Specification[] {
  return (rows[model] ?? []).map(([cn, en, value]) => ({
    label: locale === 'cn' ? cn : en,
    value: locale === 'cn' ? chineseValues[value] ?? value : value,
  }));
}
export const factoryAddress = {
  cn: '中山市南头镇晋合路33号',
  en: 'No. 33 Jinhe Road, Nantou Town, Zhongshan City, Guangdong, China',
};
