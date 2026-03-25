// 사주도깨비 - 상세 해석 생성 엔진

import type { FullAnalysis, OHaeng, SipSin, CheonGan } from '../types/saju';
import {
  DAY_GAN_PERSONALITY,
  DAY_GAN_WEALTH,
  DAY_GAN_CAREER,
  DAY_GAN_LOVE,
  DAY_GAN_HEALTH,
  SIPSIN_INTERPRETATION,
  OHAENG_EXCESS_LACK,
  DAEUN_OHAENG_INTERPRETATION,
} from '../constants/interpretation-data';
import { CHEON_GAN_OHAENG } from '../constants/saju-data';

export interface DetailedResult {
  personality: {
    summary: string;
    personality: string;
    strength: string;
    weakness: string;
    advice: string;
  };
  wealth: {
    overall: string;
    earningStyle: string;
    spendingStyle: string;
    investmentAdvice: string;
  };
  career: {
    overall: string;
    suitableFields: string[];
    workStyle: string;
    careerAdvice: string;
  };
  love: {
    loveStyle: string;
    idealPartner: string;
    marriageAdvice: string;
    cautionInLove: string;
  };
  health: {
    bodyType: string;
    weakOrgans: string;
    healthAdvice: string;
    stressRelief: string;
  };
  ohaengAdvice: {
    excessElement: OHaeng | null;
    lackElement: OHaeng | null;
    excessText: string;
    lackText: string;
    supplementText: string;
  };
  sipsinSummary: {
    dominant: SipSin | null;
    dominantMeaning: string;
    dominantInLife: string;
    allSipsin: Array<{ position: string; sipsin: string; keyword: string }>;
  };
  daeunInterpretations: Array<{
    age: number;
    gan: string;
    ji: string;
    ohaeng: OHaeng;
    positive: string;
    negative: string;
    advice: string;
  }>;
  yearlyFortune: {
    currentYear: number;
    yearGan: string;
    yearJi: string;
    yearOHaeng: OHaeng;
    summary: string;
  };
}

/**
 * 상세 해석 결과 생성
 */
export function getDetailedInterpretation(analysis: FullAnalysis): DetailedResult {
  const dayGan = analysis.saju.일주.천간;

  // 1. 성격 해석
  const personality = DAY_GAN_PERSONALITY[dayGan];

  // 2. 재물운
  const wealth = DAY_GAN_WEALTH[dayGan];

  // 3. 직업운
  const career = DAY_GAN_CAREER[dayGan];

  // 4. 연애/결혼운
  const love = DAY_GAN_LOVE[dayGan];

  // 5. 건강운
  const health = DAY_GAN_HEALTH[dayGan];

  // 6. 오행 과다/부족 분석
  const ohaengAdvice = analyzeOHaengBalance(analysis);

  // 7. 십신 요약
  const sipsinSummary = analyzeSipsinSummary(analysis);

  // 8. 대운 해석
  const daeunInterpretations = analysis.대운.slice(0, 8).map((du) => {
    const interp = DAEUN_OHAENG_INTERPRETATION[du.오행];
    return {
      age: du.시작나이,
      gan: du.천간,
      ji: du.지지,
      ohaeng: du.오행,
      positive: interp.positive,
      negative: interp.negative,
      advice: interp.advice,
    };
  });

  // 9. 올해 운세 (간략)
  const yearlyFortune = calculateYearlyFortune(analysis, dayGan);

  return {
    personality,
    wealth,
    career,
    love,
    health,
    ohaengAdvice,
    sipsinSummary,
    daeunInterpretations,
    yearlyFortune,
  };
}

/**
 * 오행 과다/부족 분석
 */
function analyzeOHaengBalance(analysis: FullAnalysis): DetailedResult['ohaengAdvice'] {
  const entries = Object.entries(analysis.오행분석) as [OHaeng, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const strongest = entries[0];
  const weakest = entries[entries.length - 1];

  const excessElement = strongest[1] >= 3 ? strongest[0] : null;
  const lackElement = weakest[1] <= 0.5 ? weakest[0] : null;

  let excessText = '';
  let lackText = '';
  let supplementText = '';

  if (excessElement) {
    excessText = OHAENG_EXCESS_LACK[excessElement].excess;
  }
  if (lackElement) {
    lackText = OHAENG_EXCESS_LACK[lackElement].lack;
    supplementText = OHAENG_EXCESS_LACK[lackElement].supplement;
  }

  return { excessElement, lackElement, excessText, lackText, supplementText };
}

/**
 * 십신 요약 분석
 */
function analyzeSipsinSummary(analysis: FullAnalysis): DetailedResult['sipsinSummary'] {
  const sipsinData = analysis.십신분석;
  const allPositions: Array<{ position: string; sipsin: string }> = [
    { position: '년주 천간', sipsin: sipsinData.년주천간 },
    { position: '월주 천간', sipsin: sipsinData.월주천간 },
    { position: '시주 천간', sipsin: sipsinData.시주천간 },
    { position: '년주 지지', sipsin: sipsinData.년주지지 },
    { position: '월주 지지', sipsin: sipsinData.월주지지 },
    { position: '일주 지지', sipsin: sipsinData.일주지지 },
    { position: '시주 지지', sipsin: sipsinData.시주지지 },
  ];

  // 가장 빈번한 십신 찾기
  const count: Record<string, number> = {};
  for (const { sipsin } of allPositions) {
    if (sipsin !== '일간') {
      count[sipsin] = (count[sipsin] || 0) + 1;
    }
  }

  let dominant: SipSin | null = null;
  let maxCount = 0;
  for (const [sipsin, c] of Object.entries(count)) {
    if (c > maxCount) {
      maxCount = c;
      dominant = sipsin as SipSin;
    }
  }

  const dominantInfo = dominant ? SIPSIN_INTERPRETATION[dominant] : null;

  const allSipsin = allPositions.map(({ position, sipsin }) => {
    const info = sipsin === '일간' ? null : SIPSIN_INTERPRETATION[sipsin as SipSin];
    return {
      position,
      sipsin,
      keyword: info ? info.keyword : '본인 (일간)',
    };
  });

  return {
    dominant,
    dominantMeaning: dominantInfo?.meaning || '',
    dominantInLife: dominantInfo?.inLife || '',
    allSipsin,
  };
}

/**
 * 올해 운세 계산 (간략화)
 */
function calculateYearlyFortune(analysis: FullAnalysis, dayGan: CheonGan): DetailedResult['yearlyFortune'] {
  const currentYear = new Date().getFullYear();
  const offset = ((currentYear - 4) % 60 + 60) % 60;

  const CHEON_GAN: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const JI_JI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

  const yearGan = CHEON_GAN[offset % 10];
  const yearJi = JI_JI[offset % 12];
  const yearOHaeng = CHEON_GAN_OHAENG[yearGan];
  const dayOHaeng = CHEON_GAN_OHAENG[dayGan];

  let summary = '';

  // 올해 천간의 오행과 일간의 관계로 운세 판단
  if (yearOHaeng === dayOHaeng) {
    summary = `올해는 비견/겁재의 해입니다. 자립과 경쟁의 시기로, 동료나 형제와의 관계가 중요합니다. 독립적인 활동에서 좋은 성과를 거둘 수 있으나, 재물 관리에 신중해야 합니다. 새로운 도전을 시작하기 좋은 해입니다.`;
  } else if (getGenerated(dayOHaeng) === yearOHaeng) {
    summary = `올해는 식신/상관의 해입니다. 표현력과 창의성이 극대화되는 시기입니다. 새로운 아이디어가 빛을 발하며, 예술적 활동이나 자기 표현에 좋은 해입니다. 식복도 따르며 먹는 즐거움이 커집니다.`;
  } else if (getControlled(dayOHaeng) === yearOHaeng) {
    summary = `올해는 재성의 해입니다. 재물운이 활발해지는 시기입니다. 사업이나 투자에서 기회가 올 수 있으며, 적극적인 재테크 활동이 좋은 결과를 가져옵니다. 연애운도 좋아 좋은 만남이 있을 수 있습니다.`;
  } else if (getControlling(dayOHaeng) === yearOHaeng) {
    summary = `올해는 관성의 해입니다. 직장에서의 승진이나 사회적 지위 상승의 기회가 있습니다. 책임감이 커지는 시기이므로 성실하게 맡은 바를 다하면 좋은 결과를 얻습니다. 다만 스트레스 관리에 주의하세요.`;
  } else {
    summary = `올해는 인성의 해입니다. 학습과 자기 개발에 좋은 시기입니다. 귀인의 도움을 받기 쉬우며, 새로운 지식이나 자격증 취득에 유리합니다. 어머니나 스승과의 인연이 강해지는 해입니다.`;
  }

  return {
    currentYear,
    yearGan,
    yearJi,
    yearOHaeng,
    summary,
  };
}

function getGenerated(oh: OHaeng): OHaeng {
  const m: Record<OHaeng, OHaeng> = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  return m[oh];
}

function getControlled(oh: OHaeng): OHaeng {
  const m: Record<OHaeng, OHaeng> = { '목': '토', '화': '금', '토': '수', '금': '목', '수': '화' };
  return m[oh];
}

function getControlling(oh: OHaeng): OHaeng {
  const m: Record<OHaeng, OHaeng> = { '목': '금', '화': '수', '토': '목', '금': '화', '수': '토' };
  return m[oh];
}
