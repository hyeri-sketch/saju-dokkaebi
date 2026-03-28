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
    grade: '폭등' | '상승' | '보합' | '하락' | '폭락';
    gradeEmoji: string;
    priceLabel: string;
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
  let grade: DetailedResult['yearlyFortune']['grade'] = '보합';
  let gradeEmoji = '';
  let priceLabel = '';

  // 올해 천간의 오행과 일간의 관계로 운세 판단
  if (yearOHaeng === dayOHaeng) {
    grade = '보합';
    gradeEmoji = '🍌';
    priceLabel = '1,200원/kg';
    summary = `올해는 비견/겁재의 해야. 나랑 같은 기운이 들어오니까 경쟁자가 늘어나는 시기거든. 직장에서 라이벌이 등장하거나, 같은 포지션을 노리는 사람이 생길 수 있어. 근데 이게 꼭 나쁜 건 아니야. 경쟁이 있어야 성장하니까. 독립적으로 뭔가 시작하기엔 좋은 해고, "내 힘으로 해보겠다"는 마인드가 강해지는 시기야. 다만 돈이 나갈 일이 많아져. 형제나 친구 관계에서 돈이 오가는 상황이 생길 수 있으니까 보증은 절대 서지 마.`;
  } else if (getGenerated(dayOHaeng) === yearOHaeng) {
    grade = '상승';
    gradeEmoji = '🍌🍌';
    priceLabel = '2,500원/kg';
    summary = `올해는 식신/상관의 해야. 표현력과 창의성이 터지는 시기거든. 그동안 머릿속에만 있던 아이디어가 밖으로 나오고, "와 이거 좋은데?" 하는 반응을 받게 돼. 유튜브 시작하거나, 블로그 쓰거나, 작품 활동 하기에 딱 좋은 해야. 먹는 복도 따라오니까 맛있는 거 많이 먹게 될 거고, 체중 관리에 주의해야 해. 자기 표현을 적극적으로 하면 인정받는 해지만, 입이 가벼워지면 구설수에 주의해야 해.`;
  } else if (getControlled(dayOHaeng) === yearOHaeng) {
    grade = '폭등';
    gradeEmoji = '🍌🍌🍌';
    priceLabel = '5,000원/kg';
    summary = `올해는 재성의 해야. 돈이 들어오는 시기가 왔어! 사업이든 투자든 적극적으로 움직이면 좋은 결과가 나와. 월급 인상, 보너스, 사이드 수입 등 재물운이 활발해지는 해거든. 연애운도 같이 올라가니까 솔로면 좋은 만남이 있을 수 있고, 커플이면 관계가 더 진전돼. 다만 욕심이 과하면 오히려 날릴 수 있으니까 "적당히 벌고 적당히 쓰는" 균형을 잊지 마.`;
  } else if (getControlling(dayOHaeng) === yearOHaeng) {
    grade = '하락';
    gradeEmoji = '🍌';
    priceLabel = '800원/kg';
    summary = `올해는 관성의 해야. 윗사람이나 조직에서 오는 압박이 커지는 시기거든. 직장에서 책임이 늘어나거나, 승진 기회가 오는 대신 업무량도 폭발해. "이거 왜 다 내 몫이야?" 하면서 스트레스 받을 수 있어. 근데 이걸 잘 버티면 다음 해에 확실한 보상이 와. 건강관리 필수고, 법적인 문제나 교통법규 같은 규칙 관련 일에서 조심해야 해. 올해는 참고 버티면서 실력을 쌓는 해야.`;
  } else {
    grade = '상승';
    gradeEmoji = '🍌🍌';
    priceLabel = '2,800원/kg';
    summary = `올해는 인성의 해야. 배움의 기운이 강해지는 시기거든. 자격증 시험이나 공부를 시작하면 결과가 좋고, 직장에서도 교육이나 연수 기회가 와. 귀인의 도움을 받기 쉬운 해라 어려울 때 "갑자기 도와주는 사람"이 나타나. 어머니나 스승과의 관계가 깊어지고, 부동산이나 문서 관련 일도 잘 풀려. 다만 너무 생각만 하고 행동은 안 하는 패턴에 빠지지 않게 조심해.`;
  }

  return {
    currentYear,
    yearGan,
    yearJi,
    yearOHaeng,
    summary,
    grade,
    gradeEmoji,
    priceLabel,
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
