// 사주도깨비 - 서양 점성술 계산 엔진

import type { ZodiacSign, Element, Modality, Planet, ZodiacInfo, AstrologyResult } from '../types/astrology';

// 12궁 데이터
const ZODIAC_DATA: ZodiacInfo[] = [
  {
    sign: '양자리', signEn: 'Aries', symbol: '♈',
    element: '불', modality: '카디널', rulingPlanet: '화성',
    dateRange: '3/21 ~ 4/19',
    traits: ['리더십', '열정적', '용감함', '즉흥적'],
  },
  {
    sign: '황소자리', signEn: 'Taurus', symbol: '♉',
    element: '흙', modality: '고정', rulingPlanet: '금성',
    dateRange: '4/20 ~ 5/20',
    traits: ['인내심', '현실적', '감각적', '안정추구'],
  },
  {
    sign: '쌍둥이자리', signEn: 'Gemini', symbol: '♊',
    element: '공기', modality: '변통', rulingPlanet: '수성',
    dateRange: '5/21 ~ 6/21',
    traits: ['지적호기심', '소통능력', '다재다능', '적응력'],
  },
  {
    sign: '게자리', signEn: 'Cancer', symbol: '♋',
    element: '물', modality: '카디널', rulingPlanet: '달',
    dateRange: '6/22 ~ 7/22',
    traits: ['감수성', '가정적', '보호본능', '직관적'],
  },
  {
    sign: '사자자리', signEn: 'Leo', symbol: '♌',
    element: '불', modality: '고정', rulingPlanet: '태양',
    dateRange: '7/23 ~ 8/22',
    traits: ['자신감', '창의적', '관대함', '카리스마'],
  },
  {
    sign: '처녀자리', signEn: 'Virgo', symbol: '♍',
    element: '흙', modality: '변통', rulingPlanet: '수성',
    dateRange: '8/23 ~ 9/22',
    traits: ['분석적', '꼼꼼함', '실용적', '봉사정신'],
  },
  {
    sign: '천칭자리', signEn: 'Libra', symbol: '♎',
    element: '공기', modality: '카디널', rulingPlanet: '금성',
    dateRange: '9/23 ~ 10/22',
    traits: ['균형감각', '외교적', '공정함', '심미안'],
  },
  {
    sign: '전갈자리', signEn: 'Scorpio', symbol: '♏',
    element: '물', modality: '고정', rulingPlanet: '화성',
    dateRange: '10/23 ~ 11/21',
    traits: ['통찰력', '열정적', '의지력', '신비로움'],
  },
  {
    sign: '궁수자리', signEn: 'Sagittarius', symbol: '♐',
    element: '불', modality: '변통', rulingPlanet: '목성',
    dateRange: '11/22 ~ 12/21',
    traits: ['자유로움', '낙관적', '모험심', '철학적'],
  },
  {
    sign: '염소자리', signEn: 'Capricorn', symbol: '♑',
    element: '흙', modality: '카디널', rulingPlanet: '토성',
    dateRange: '12/22 ~ 1/19',
    traits: ['책임감', '야심찬', '인내심', '실용적'],
  },
  {
    sign: '물병자리', signEn: 'Aquarius', symbol: '♒',
    element: '공기', modality: '고정', rulingPlanet: '천왕성',
    dateRange: '1/20 ~ 2/18',
    traits: ['독창적', '인도주의', '혁신적', '독립적'],
  },
  {
    sign: '물고기자리', signEn: 'Pisces', symbol: '♓',
    element: '물', modality: '변통', rulingPlanet: '해왕성',
    dateRange: '2/19 ~ 3/20',
    traits: ['직관적', '공감능력', '예술적', '영적'],
  },
];

// 태양궁 (별자리) 결정 - 양력 월/일 기준
const ZODIAC_DATES: Array<{ month: number; day: number; sign: ZodiacSign }> = [
  { month: 1, day: 20, sign: '물병자리' },
  { month: 2, day: 19, sign: '물고기자리' },
  { month: 3, day: 21, sign: '양자리' },
  { month: 4, day: 20, sign: '황소자리' },
  { month: 5, day: 21, sign: '쌍둥이자리' },
  { month: 6, day: 22, sign: '게자리' },
  { month: 7, day: 23, sign: '사자자리' },
  { month: 8, day: 23, sign: '처녀자리' },
  { month: 9, day: 23, sign: '천칭자리' },
  { month: 10, day: 23, sign: '전갈자리' },
  { month: 11, day: 22, sign: '궁수자리' },
  { month: 12, day: 22, sign: '염소자리' },
];

/**
 * 양력 월/일로 태양궁(별자리) 결정
 */
export function getSunSign(solarMonth: number, solarDay: number): ZodiacInfo {
  let signName: ZodiacSign = '염소자리'; // 기본값 (1/1~1/19)

  for (const { month, day, sign } of ZODIAC_DATES) {
    if (solarMonth === month && solarDay >= day) {
      signName = sign;
    } else if (solarMonth > month) {
      signName = sign;
    }
  }

  // 12월 22일 이후는 염소자리
  if (solarMonth === 12 && solarDay >= 22) {
    signName = '염소자리';
  }

  return ZODIAC_DATA.find(z => z.sign === signName)!;
}

/**
 * 원소 균형 분석 (태양궁 기반 간소화 버전)
 */
function getElementBalance(sunSign: ZodiacInfo): Record<Element, number> {
  const balance: Record<Element, number> = { '불': 0, '흙': 0, '공기': 0, '물': 0 };

  // 태양궁 원소에 가중치
  balance[sunSign.element] += 3;

  // 다른 원소에 기본값
  for (const el of Object.keys(balance) as Element[]) {
    if (el !== sunSign.element) {
      balance[el] += 1;
    }
  }

  return balance;
}

/**
 * 점성술 분석 메인 함수
 */
export function calculateAstrology(solarMonth: number, solarDay: number): AstrologyResult {
  const sunSign = getSunSign(solarMonth, solarDay);
  const elementBalance = getElementBalance(sunSign);

  const summary = generateAstrologySummary(sunSign);

  return {
    sunSign,
    elementBalance,
    summary,
  };
}

/**
 * 점성술 요약 생성
 */
function generateAstrologySummary(sunSign: ZodiacInfo): string {
  let summary = `${sunSign.symbol} ${sunSign.sign} (${sunSign.signEn})\n`;
  summary += `기간: ${sunSign.dateRange}\n\n`;
  summary += `◆ 원소: ${sunSign.element}\n`;
  summary += `◆ 특성: ${sunSign.modality}\n`;
  summary += `◆ 수호 행성: ${sunSign.rulingPlanet}\n\n`;
  summary += `◆ 주요 성격:\n`;
  for (const trait of sunSign.traits) {
    summary += `  • ${trait}\n`;
  }

  return summary;
}

// 원소별 색상 (UI용)
export const ELEMENT_COLORS: Record<Element, string> = {
  '불': '#F44336',
  '흙': '#8B6914',
  '공기': '#90CAF9',
  '물': '#2196F3',
};

// 원소별 이모지
export const ELEMENT_EMOJI: Record<Element, string> = {
  '불': '🔥',
  '흙': '🌍',
  '공기': '💨',
  '물': '💧',
};
