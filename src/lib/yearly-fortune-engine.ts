// 사주도깨비 - 세운(歲運) 상세 분석 엔진
// 해당 년도의 천간·지지와 사주 원국의 상호작용을 분석하여
// 총운/애정운/재물운/업무운/건강운/대인관계운 6대 카테고리를 도출

import type { FullAnalysis, CheonGan, JiJi, OHaeng, SipSin } from '../types/saju';
import {
  CHEON_GAN,
  JI_JI,
  CHEON_GAN_OHAENG,
  CHEON_GAN_EUMYANG,
  JI_JI_OHAENG,
  JI_JI_JANGGAN,
  CHEON_GAN_HANJA,
  JI_JI_HANJA,
  JI_JI_ANIMAL,
} from '../constants/saju-data';
import {
  YEARLY_TOTAL_FORTUNE,
  YEARLY_LOVE_FORTUNE,
  YEARLY_WEALTH_FORTUNE,
  YEARLY_CAREER_FORTUNE,
  YEARLY_HEALTH_FORTUNE,
  YEARLY_RELATIONSHIP_FORTUNE,
  SAMHAP,
  YUKHAP,
  SANGCHUNG,
  HYEONG,
} from '../constants/yearly-fortune-data';

// ============================================================
// 세운 상세 분석 결과 타입
// ============================================================
export interface YearlyFortuneDetail {
  // 기본 정보
  year: number;
  yearGan: CheonGan;
  yearJi: JiJi;
  yearGanHanja: string;
  yearJiHanja: string;
  yearGanOhaeng: OHaeng;
  yearJiOhaeng: OHaeng;
  yearAnimal: string;
  sipsinRelation: SipSin;  // 일간과 세운 천간의 십신 관계

  // 지지 상호작용
  jijiInteractions: JiJiInteraction[];

  // 6대 카테고리
  totalFortune: {
    score: number;
    keyword: string;
    summary: string;
    detail: string;
    firstHalf: string;
    secondHalf: string;
    advice: string;
    luckyColor: string;
    luckyNumber: string;
    luckyDirection: string;
    jijiBonus: string;       // 지지 상호작용으로 인한 추가 해석
    overallScore: number;     // 지지 보정 포함 최종 점수
  };
  loveFortune: {
    score: number;
    summary: string;
    singleAdvice: string;
    coupleAdvice: string;
    marriageSign: string;
    caution: string;
  };
  wealthFortune: {
    score: number;
    summary: string;
    incomeChange: string;
    investmentAdvice: string;
    spendingWarning: string;
    sideBusiness: string;
  };
  careerFortune: {
    score: number;
    summary: string;
    promotionChance: string;
    jobChangeAdvice: string;
    businessAdvice: string;
    keyPeriod: string;
  };
  healthFortune: {
    score: number;
    summary: string;
    weakPoints: string;
    seasonalAdvice: string;
    mentalHealth: string;
    exerciseAdvice: string;
  };
  relationshipFortune: {
    score: number;
    summary: string;
    familyRelation: string;
    friendRelation: string;
    workRelation: string;
    noblePerson: string;
  };
}

export interface JiJiInteraction {
  type: '삼합' | '육합' | '상충' | '형';
  yearJi: string;
  myJi: string;
  position: string;  // 년주/월주/일주/시주
  meaning: string;
  isPositive: boolean;
}

// ============================================================
// 십신 관계 계산 (일간 기준으로 세운 천간의 십신)
// ============================================================
function getSipSinRelation(dayGan: CheonGan, yearGan: CheonGan): SipSin {
  const dayOH = CHEON_GAN_OHAENG[dayGan];
  const dayEY = CHEON_GAN_EUMYANG[dayGan];
  const yearOH = CHEON_GAN_OHAENG[yearGan];
  const yearEY = CHEON_GAN_EUMYANG[yearGan];
  const sameEY = dayEY === yearEY;

  if (dayOH === yearOH) return sameEY ? '비견' : '겁재';

  const generates: Record<OHaeng, OHaeng> = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  if (yearOH === generates[dayOH]) return sameEY ? '식신' : '상관';

  const controls: Record<OHaeng, OHaeng> = { '목': '토', '화': '금', '토': '수', '금': '목', '수': '화' };
  if (yearOH === controls[dayOH]) return sameEY ? '편재' : '정재';

  const controlledBy: Record<OHaeng, OHaeng> = { '목': '금', '화': '수', '토': '목', '금': '화', '수': '토' };
  if (yearOH === controlledBy[dayOH]) return sameEY ? '편관' : '정관';

  return sameEY ? '편인' : '정인';
}

// ============================================================
// 지지 상호작용 분석
// ============================================================
function analyzeJiJiInteractions(
  yearJi: JiJi,
  saju: FullAnalysis['saju'],
  isUnknownTime: boolean,
): JiJiInteraction[] {
  const interactions: JiJiInteraction[] = [];

  const positions: Array<{ ji: JiJi; label: string }> = [
    { ji: saju.년주.지지, label: '년주' },
    { ji: saju.월주.지지, label: '월주' },
    { ji: saju.일주.지지, label: '일주' },
  ];
  if (!isUnknownTime) {
    positions.push({ ji: saju.시주.지지, label: '시주' });
  }

  for (const { ji, label } of positions) {
    // 삼합 체크
    for (const [key, data] of Object.entries(SAMHAP)) {
      if (data.elements.includes(yearJi) && data.elements.includes(ji) && yearJi !== ji) {
        interactions.push({
          type: '삼합',
          yearJi,
          myJi: ji,
          position: label,
          meaning: data.meaning,
          isPositive: true,
        });
      }
    }

    // 육합 체크
    const yukhapPairs: [string, string][] = [
      ['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미'],
    ];
    for (const [a, b] of yukhapPairs) {
      if ((yearJi === a && ji === b) || (yearJi === b && ji === a)) {
        const key = [a, b].sort().join('') === '자축' ? '자축' :
                    [a, b].sort().join('') === '인해' ? '인해' :
                    [a, b].sort().join('') === '묘술' ? '묘술' :
                    [a, b].sort().join('') === '진유' ? '진유' :
                    [a, b].sort().join('') === '사신' ? '사신' : '오미';
        const yukhapKey = Object.keys(YUKHAP).find(k =>
          (k.includes(a) && k.includes(b))
        );
        if (yukhapKey && YUKHAP[yukhapKey]) {
          interactions.push({
            type: '육합',
            yearJi,
            myJi: ji,
            position: label,
            meaning: YUKHAP[yukhapKey].meaning,
            isPositive: true,
          });
        }
      }
    }

    // 상충 체크
    const chungPairs: [string, string][] = [
      ['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해'],
    ];
    for (const [a, b] of chungPairs) {
      if ((yearJi === a && ji === b) || (yearJi === b && ji === a)) {
        const chungKey = Object.keys(SANGCHUNG).find(k =>
          (k.includes(a) && k.includes(b))
        );
        if (chungKey && SANGCHUNG[chungKey]) {
          interactions.push({
            type: '상충',
            yearJi,
            myJi: ji,
            position: label,
            meaning: SANGCHUNG[chungKey].meaning,
            isPositive: false,
          });
        }
      }
    }

    // 형 체크
    for (const [key, data] of Object.entries(HYEONG)) {
      if (data.elements.includes(yearJi) && data.elements.includes(ji) && yearJi !== ji) {
        interactions.push({
          type: '형',
          yearJi,
          myJi: ji,
          position: label,
          meaning: data.meaning,
          isPositive: false,
        });
      }
    }
  }

  return interactions;
}

// ============================================================
// 지지 상호작용 → 총운 보너스 텍스트 생성
// ============================================================
function generateJiJiBonus(interactions: JiJiInteraction[]): { text: string; scoreAdj: number } {
  if (interactions.length === 0) {
    return { text: '', scoreAdj: 0 };
  }

  const positives = interactions.filter(i => i.isPositive);
  const negatives = interactions.filter(i => !i.isPositive);
  let scoreAdj = 0;
  const parts: string[] = [];

  if (positives.length > 0) {
    const samhaps = positives.filter(i => i.type === '삼합');
    const yukhaps = positives.filter(i => i.type === '육합');

    if (samhaps.length > 0) {
      parts.push(`올해의 지지와 사주 원국에서 삼합(三合)이 형성됩니다. ${samhaps[0].meaning} 이는 올해 운세를 한층 끌어올려주는 강력한 길한 조합입니다.`);
      scoreAdj += 1;
    }
    if (yukhaps.length > 0) {
      parts.push(`육합(六合)이 형성되어 조화로운 기운이 흐릅니다. ${yukhaps[0].meaning}`);
      scoreAdj += 0.5;
    }
  }

  if (negatives.length > 0) {
    const chungs = negatives.filter(i => i.type === '상충');
    const hyeongs = negatives.filter(i => i.type === '형');

    if (chungs.length > 0) {
      parts.push(`올해의 지지와 사주 원국에서 상충(相沖)이 발생합니다. ${chungs[0].meaning} 변동과 변화에 대비하고, 안전에 각별히 유의하세요.`);
      scoreAdj -= 1;
    }
    if (hyeongs.length > 0) {
      parts.push(`형(刑)이 형성되어 주의가 필요합니다. ${hyeongs[0].meaning}`);
      scoreAdj -= 0.5;
    }
  }

  return { text: parts.join(' '), scoreAdj };
}

// ============================================================
// 메인: 세운 상세 분석 함수
// ============================================================
export function calculateYearlyFortuneDetail(
  analysis: FullAnalysis,
  isUnknownTime: boolean = false,
): YearlyFortuneDetail {
  const currentYear = new Date().getFullYear();
  const offset = ((currentYear - 4) % 60 + 60) % 60;

  const yearGan = CHEON_GAN[offset % 10];
  const yearJi = JI_JI[offset % 12] as JiJi;
  const yearGanOhaeng = CHEON_GAN_OHAENG[yearGan];
  const yearJiOhaeng = JI_JI_OHAENG[yearJi];

  const dayGan = analysis.saju.일주.천간;
  const sipsinRelation = getSipSinRelation(dayGan, yearGan);

  // 지지 상호작용 분석
  const jijiInteractions = analyzeJiJiInteractions(yearJi, analysis.saju, isUnknownTime);
  const { text: jijiBonus, scoreAdj } = generateJiJiBonus(jijiInteractions);

  // 총운 데이터
  const totalData = YEARLY_TOTAL_FORTUNE[sipsinRelation];
  const overallScore = Math.max(1, Math.min(10, Math.round(totalData.score + scoreAdj)));

  // 각 카테고리 데이터
  const loveData = YEARLY_LOVE_FORTUNE[sipsinRelation];
  const wealthData = YEARLY_WEALTH_FORTUNE[sipsinRelation];
  const careerData = YEARLY_CAREER_FORTUNE[sipsinRelation];
  const healthData = YEARLY_HEALTH_FORTUNE[sipsinRelation];
  const relationshipData = YEARLY_RELATIONSHIP_FORTUNE[sipsinRelation];

  return {
    year: currentYear,
    yearGan,
    yearJi,
    yearGanHanja: CHEON_GAN_HANJA[yearGan],
    yearJiHanja: JI_JI_HANJA[yearJi],
    yearGanOhaeng,
    yearJiOhaeng,
    yearAnimal: JI_JI_ANIMAL[yearJi],
    sipsinRelation,

    jijiInteractions,

    totalFortune: {
      score: totalData.score,
      keyword: totalData.keyword,
      summary: totalData.summary,
      detail: totalData.detail,
      firstHalf: totalData.firstHalf,
      secondHalf: totalData.secondHalf,
      advice: totalData.advice,
      luckyColor: totalData.luckyColor,
      luckyNumber: totalData.luckyNumber,
      luckyDirection: totalData.luckyDirection,
      jijiBonus,
      overallScore,
    },
    loveFortune: loveData,
    wealthFortune: wealthData,
    careerFortune: careerData,
    healthFortune: healthData,
    relationshipFortune: relationshipData,
  };
}
