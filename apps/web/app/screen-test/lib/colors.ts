import { ColorConfig, PWMTestConfig, ColorGamutConfig } from '../types';

export const DEAD_PIXEL_COLORS: ColorConfig[] = [
  { name: '纯白', value: '#FFFFFF', description: '检测黑点/暗点' },
  { name: '纯黑', value: '#000000', description: '检测亮点/白点' },
  { name: '纯红', value: '#FF0000', description: '检测红色子像素' },
  { name: '纯绿', value: '#00FF00', description: '检测绿色子像素' },
  { name: '纯蓝', value: '#0000FF', description: '检测蓝色子像素' },
  { name: '灰色50%', value: '#808080', description: '检测亮度不均' },
];

export const COLOR_CHECKER_COLORS: ColorConfig[] = [
  { name: 'Dark Skin', value: '#735244' },
  { name: 'Light Skin', value: '#c29682' },
  { name: 'Blue Sky', value: '#627a9d' },
  { name: 'Foliage', value: '#576c43' },
  { name: 'Blue Flower', value: '#8580b1' },
  { name: 'Bluish Green', value: '#67bdaa' },
  { name: 'Orange', value: '#d67e2c' },
  { name: 'Purplish Blue', value: '#505ba6' },
  { name: 'Moderate Red', value: '#c15a63' },
  { name: 'Purple', value: '#5e3c6c' },
  { name: 'Yellow Green', value: '#9dbc40' },
  { name: 'Orange Yellow', value: '#e0a32e' },
  { name: 'Blue', value: '#383d96' },
  { name: 'Green', value: '#469449' },
  { name: 'Red', value: '#af363c' },
  { name: 'Yellow', value: '#e7c71f' },
  { name: 'Magenta', value: '#bb5695' },
  { name: 'Cyan', value: '#0885a1' },
  { name: 'White', value: '#f3f3f2' },
  { name: 'Neutral 8', value: '#c8c8c8' },
  { name: 'Neutral 6.5', value: '#a0a0a0' },
  { name: 'Neutral 5', value: '#7a7a79' },
  { name: 'Neutral 3.5', value: '#555555' },
  { name: 'Black', value: '#343434' },
];

export const PWM_CONFIGS: PWMTestConfig[] = [
  { frequency: 60, name: '60Hz', description: '低频PWM，对眼睛伤害较大', risk: 'high' },
  { frequency: 120, name: '120Hz', description: '中低频PWM', risk: 'high' },
  { frequency: 240, name: '240Hz', description: '中频PWM', risk: 'medium' },
  { frequency: 480, name: '480Hz', description: '中高频PWM', risk: 'medium' },
  { frequency: 960, name: '960Hz', description: '高频PWM，相对护眼', risk: 'low' },
  { frequency: 1920, name: '1920Hz+', description: '超高频/DC调光，护眼', risk: 'low' },
];

export const COLOR_GAMUTS: ColorGamutConfig[] = [
  {
    name: 'sRGB',
    description: '标准色域，大多数屏幕支持',
    colors: [
      { name: 'sRGB Red', value: '#FF0000' },
      { name: 'sRGB Green', value: '#00FF00' },
      { name: 'sRGB Blue', value: '#0000FF' },
    ],
  },
  {
    name: 'DCI-P3',
    description: '广色域，iPhone/Mac标准',
    colors: [
      { name: 'P3 Red', value: 'color(display-p3 1 0 0)' },
      { name: 'P3 Green', value: 'color(display-p3 0 1 0)' },
      { name: 'P3 Blue', value: 'color(display-p3 0 0 1)' },
    ],
  },
];

export const BURN_IN_COLORS: ColorConfig[] = [
  { name: '灰色', value: '#808080' },
  { name: '红色', value: '#FF0000' },
  { name: '绿色', value: '#00FF00' },
  { name: '蓝色', value: '#0000FF' },
];
