import { Solar, Lunar } from 'lunar-typescript';

// 宜忌活动映射
const YI_JI_ACTIVITIES: Record<string, { yi: string[]; ji: string[] }> = {
  '建': {
    yi: ['出行', '上任', '会友', '上书', '见贵'],
    ji: ['嫁娶', '开仓', '安葬']
  },
  '除': {
    yi: ['沐浴', '清洁', '求医', '安葬', '扫舍'],
    ji: ['嫁娶', '入宅', '出行']
  },
  '满': {
    yi: ['开市', '立券', '交易', '纳财'],
    ji: ['安葬', '动土', '栽种']
  },
  '平': {
    yi: ['修饰垣墙', '平治道涂'],
    ji: ['嫁娶', '移徙', '入宅', '出行']
  },
  '定': {
    yi: ['冠笄', '嫁娶', '会友', '纳采', '捕捉'],
    ji: ['词讼', '出行', '谈判']
  },
  '执': {
    yi: ['捕捉', '狩猎', '求嗣', '纳采'],
    ji: ['嫁娶', '开市', '安葬']
  },
  '破': {
    yi: ['治病', '求医', '破屋', '坏垣'],
    ji: ['嫁娶', '签约', '出行', '安床']
  },
  '危': {
    yi: ['安床', '祭祀', '祈福', '入殓', '移柩'],
    ji: ['嫁娶', '开市', '安葬']
  },
  '成': {
    yi: ['嫁娶', '开市', '立券', '祭祀', '祈福', '入学', '上任'],
    ji: ['诉讼', '安葬']
  },
  '收': {
    yi: ['纳财', '收纳', '藏宝', '捕捉'],
    ji: ['嫁娶', '安葬', '出行', '开市']
  },
  '开': {
    yi: ['嫁娶', '开市', '立券', '交易', '入学', '出行', '上任'],
    ji: ['安葬', '动土']
  },
  '闭': {
    yi: ['祭祀', '祈福', '求嗣', '安葬', '收藏'],
    ji: ['嫁娶', '开市', '出行', '上任']
  }
};

// 十二值日
const ZHI_RI = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

// 二十八星宿
const XING_XIU = [
  '角', '亢', '氐', '房', '心', '尾', '箕',
  '斗', '牛', '女', '虚', '危', '室', '壁',
  '奎', '娄', '胃', '昴', '毕', '觜', '参',
  '井', '鬼', '柳', '星', '张', '翼', '轸'
];

// 星宿吉凶
const XING_XIU_LUCK: Record<string, { luck: '吉' | '凶' | '平'; desc: string }> = {
  '角': { luck: '吉', desc: '角星造作主荣昌，外进田财内女郎' },
  '亢': { luck: '凶', desc: '亢星造作长房当，十日之中主有殃' },
  '氐': { luck: '凶', desc: '氐星造作主灾凶，费尽田园仓库空' },
  '房': { luck: '吉', desc: '房星造作田园进，血财牛马遍山冈' },
  '心': { luck: '凶', desc: '心星造作大为凶，更遭刑讼狱囚中' },
  '尾': { luck: '吉', desc: '尾星造作主天恩，富贵荣华福禄增' },
  '箕': { luck: '吉', desc: '箕星造作主高强，岁岁年年大吉昌' },
  '斗': { luck: '吉', desc: '斗星造作主招财，文武官员位鼎台' },
  '牛': { luck: '凶', desc: '牛星造作主灾危，九横三灾不可推' },
  '女': { luck: '凶', desc: '女星造作损婆娘，兄弟相嫌似虎狼' },
  '虚': { luck: '凶', desc: '虚星造作主灾殃，男女孤眠不一双' },
  '危': { luck: '凶', desc: '危星不可造高堂，自吊遭刑祸难当' },
  '室': { luck: '吉', desc: '室星造作进田牛，儿孙代代近王侯' },
  '壁': { luck: '吉', desc: '壁星造作主添财，丝蚕大熟福滔天' },
  '奎': { luck: '凶', desc: '奎星造作得祯祥，家下荣和大吉昌' },
  '娄': { luck: '吉', desc: '娄星造作起天门，财旺家和万事兴' },
  '胃': { luck: '吉', desc: '胃星造作事如何，家贵荣华喜气多' },
  '昴': { luck: '凶', desc: '昴星造作进田牛，埋葬官灾不得休' },
  '毕': { luck: '吉', desc: '毕星造作主光前，买得田园有余钱' },
  '觜': { luck: '凶', desc: '觜星造作有徒刑，三年之内主家倾' },
  '参': { luck: '吉', desc: '参星造作旺人家，文星照耀大光华' },
  '井': { luck: '吉', desc: '井星造作旺蚕田，金榜题名第一先' },
  '鬼': { luck: '凶', desc: '鬼星起造卒人亡，堂前不见主人郎' },
  '柳': { luck: '凶', desc: '柳星造作主遭官，昼眠夜坐祸难安' },
  '星': { luck: '吉', desc: '星宿日好造新房，进职加官近帝王' },
  '张': { luck: '吉', desc: '张星日好造龙轩，年年并见进庄田' },
  '翼': { luck: '凶', desc: '翼星不利架高堂，三年二载见瘟惶' },
  '轸': { luck: '吉', desc: '轸星临水造龙宫，代代为官受王封' }
};

// 彭祖百忌
const PENG_ZU_BAI_JI: Record<string, string> = {
  '甲': '甲不开仓财物耗散',
  '乙': '乙不栽植千株不长',
  '丙': '丙不修灶必见灾殃',
  '丁': '丁不剃头头必生疮',
  '戊': '戊不受田田主不祥',
  '己': '己不破券二比并亡',
  '庚': '庚不经络织机虚张',
  '辛': '辛不合酱主人不尝',
  '壬': '壬不汲水更难提防',
  '癸': '癸不词讼理弱敌强',
  '子': '子不问卜自惹祸殃',
  '丑': '丑不冠带主不还乡',
  '寅': '寅不祭祀神鬼不尝',
  '卯': '卯不穿井水泉不香',
  '辰': '辰不哭泣必主重丧',
  '巳': '巳不远行财物伏藏',
  '午': '午不苫盖屋主更张',
  '未': '未不服药毒气入肠',
  '申': '申不安床鬼祟入房',
  '酉': '酉不会客醉坐颠狂',
  '戌': '戌不吃犬作怪上床',
  '亥': '亥不嫁娶不利新郎'
};

// 吉神
const JI_SHEN = ['天德', '月德', '天德合', '月德合', '天赦', '天愿', '月恩', '四相', '时德', '民日', '驿马', '天马', '成日', '开日'];

// 凶神
const XIONG_SHEN = ['月破', '平日', '收日', '闭日', '劫煞', '灾煞', '月煞', '月刑', '月厌', '大时', '天吏', '四废', '五墓', '九空'];

export interface HuangliResult {
  date: Date;
  lunarDate: string;
  ganZhi: string;
  zhiRi: string;
  yi: string[];
  ji: string[];
  xingXiu: string;
  xingXiuLuck: '吉' | '凶' | '平';
  xingXiuDesc: string;
  pengZuBaiJi: string[];
  jiShen: string[];
  xiongShen: string[];
  jieQi?: string;
  isJieQi: boolean;
  sha: string;
  wuXing: string;
}

/**
 * 计算十二值日
 * 以月建为基础，按顺序推算
 */
function calculateZhiRi(lunar: Lunar): string {
  const monthZhi = lunar.getMonthZhi();
  const dayZhi = lunar.getDayZhi();

  const zhiIndex = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const monthIndex = zhiIndex.indexOf(monthZhi);
  const dayIndex = zhiIndex.indexOf(dayZhi);

  const offset = (dayIndex - monthIndex + 12) % 12;
  return ZHI_RI[offset];
}

/**
 * 计算二十八星宿
 * 以日期为基础推算
 */
function calculateXingXiu(date: Date): string {
  const baseDate = new Date(2000, 0, 1); // 基准日期
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % 28) + 28) % 28;
  return XING_XIU[index];
}

/**
 * 计算每日冲煞
 */
function calculateSha(dayZhi: string): string {
  const shaMap: Record<string, string> = {
    '子': '南', '丑': '东', '寅': '北', '卯': '西',
    '辰': '南', '巳': '东', '午': '北', '未': '西',
    '申': '南', '酉': '东', '戌': '北', '亥': '西'
  };
  return shaMap[dayZhi] || '北';
}

/**
 * 推算吉神凶煞（简化版）
 */
function calculateShenSha(lunar: Lunar): { ji: string[]; xiong: string[] } {
  const ji: string[] = [];
  const xiong: string[] = [];

  const dayGanZhi = lunar.getDayInGanZhi();
  const dayGan = dayGanZhi.charAt(0);
  const dayZhi = dayGanZhi.charAt(1);

  // 根据天干地支简单推算
  const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(dayGan);
  const zhiIndex = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(dayZhi);

  // 添加一些随机但确定的吉神凶煞
  if (ganIndex % 2 === 0) ji.push('天德');
  if (zhiIndex % 3 === 0) ji.push('月德');
  if ((ganIndex + zhiIndex) % 5 === 0) ji.push('天赦');

  if (ganIndex % 3 === 0) xiong.push('劫煞');
  if (zhiIndex % 4 === 0) xiong.push('灾煞');
  if ((ganIndex + zhiIndex) % 7 === 0) xiong.push('月煞');

  return { ji: ji.slice(0, 3), xiong: xiong.slice(0, 3) };
}

/**
 * 计算黄历
 */
export function calculateHuangli(date: Date): HuangliResult {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const ganZhi = lunar.getDayInGanZhi();
  const zhiRi = calculateZhiRi(lunar);
  const activities = YI_JI_ACTIVITIES[zhiRi] || { yi: [], ji: [] };
  const xingXiu = calculateXingXiu(date);
  const xingXiuInfo = XING_XIU_LUCK[xingXiu] || { luck: '平', desc: '' };
  const shenSha = calculateShenSha(lunar);

  // 彭祖百忌
  const pengZuBaiJi = [
    PENG_ZU_BAI_JI[ganZhi.charAt(0)],
    PENG_ZU_BAI_JI[ganZhi.charAt(1)]
  ].filter(Boolean);

  // 五行
  const wuXingMap: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
  };

  // 节气
  const jieQi = lunar.getJieQi();

  return {
    date,
    lunarDate: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    ganZhi,
    zhiRi,
    yi: activities.yi,
    ji: activities.ji,
    xingXiu,
    xingXiuLuck: xingXiuInfo.luck,
    xingXiuDesc: xingXiuInfo.desc,
    pengZuBaiJi,
    jiShen: shenSha.ji,
    xiongShen: shenSha.xiong,
    jieQi: jieQi || undefined,
    isJieQi: !!jieQi,
    sha: calculateSha(ganZhi.charAt(1)),
    wuXing: wuXingMap[ganZhi.charAt(0)] || '土'
  };
}

/**
 * 获取今日黄历
 */
export function getTodayHuangli(): HuangliResult {
  return calculateHuangli(new Date());
}

/**
 * 格式化日期显示
 */
export function formatHuangliDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}
