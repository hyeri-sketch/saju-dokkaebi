// 사주도깨비 - 사주팔자 계산 엔진

import KoreanLunarCalendar from 'korean-lunar-calendar';
import {
  BirthInput,
  CheonGan,
  JiJi,
  GanJi,
  SajuResult,
  OHaengAnalysis,
  SipSin,
  SipSinAnalysis,
  DaeUn,
  FullAnalysis,
  OHaeng,
  EumYang,
} from '../types/saju';
import {
  CHEON_GAN,
  JI_JI,
  CHEON_GAN_OHAENG,
  CHEON_GAN_EUMYANG,
  JI_JI_OHAENG,
  JI_JI_JANGGAN,
  WOLJU_START_GAN,
  SIJU_START_GAN,
  JEOLGI_MONTHS,
} from '../constants/saju-data';

/**
 * 음력 → 양력 변환
 */
function lunarToSolar(year: number, month: number, day: number): { year: number; month: number; day: number } {
  const calendar = new KoreanLunarCalendar();
  calendar.setLunarDate(year, month, day, false);
  return {
    year: calendar.getSolarCalendar().year,
    month: calendar.getSolarCalendar().month,
    day: calendar.getSolarCalendar().day,
  };
}

/**
 * 양력 → 음력 변환
 */
function solarToLunar(year: number, month: number, day: number): { year: number; month: number; day: number } {
  const calendar = new KoreanLunarCalendar();
  calendar.setSolarDate(year, month, day);
  return {
    year: calendar.getLunarCalendar().year,
    month: calendar.getLunarCalendar().month,
    day: calendar.getLunarCalendar().day,
  };
}

/**
 * 절기 기반 월 계산 (명리학에서는 절기 기준으로 월을 나눔)
 */
function getJeolgiMonth(solarMonth: number, solarDay: number): number {
  // 절기 기반 월: 입춘부터 1월(인월)
  for (let i = JEOLGI_MONTHS.length - 1; i >= 0; i--) {
    const jeolgi = JEOLGI_MONTHS[i];
    if (solarMonth > jeolgi.startMonth || (solarMonth === jeolgi.startMonth && solarDay >= jeolgi.startDay)) {
      return jeolgi.month;
    }
  }
  return 12; // 소한 이전이면 전년도 12월
}

/**
 * 절기 기반으로 년도 보정 (입춘 전이면 전년도)
 */
function getJeolgiYear(solarYear: number, solarMonth: number, solarDay: number): number {
  // 입춘(2월 4일경) 이전이면 전년도
  if (solarMonth < 2 || (solarMonth === 2 && solarDay < 4)) {
    return solarYear - 1;
  }
  return solarYear;
}

/**
 * 년주 (年柱) 계산
 * 기준년도: 갑자년 = 서기 4년 (또는 1984년 등 60갑자 순환)
 */
function calculateNyeonju(jeolgiYear: number): GanJi {
  // 1984년 = 갑자년을 기준으로 계산
  const offset = ((jeolgiYear - 4) % 60 + 60) % 60;
  return {
    천간: CHEON_GAN[offset % 10],
    지지: JI_JI[offset % 12],
  };
}

/**
 * 월주 (月柱) 계산
 * 년간에 따라 월간이 결정됨
 */
function calculateWolju(yearGan: CheonGan, jeolgiMonth: number): GanJi {
  const startGanIndex = WOLJU_START_GAN[yearGan];
  // 인월(1월)부터 시작, 월지는 인(2)부터
  const monthJijiIndex = (jeolgiMonth + 1) % 12; // 1월=인(2), 2월=묘(3), ...
  const monthGanIndex = (startGanIndex + jeolgiMonth - 1) % 10;

  return {
    천간: CHEON_GAN[monthGanIndex],
    지지: JI_JI[monthJijiIndex],
  };
}

/**
 * 일주 (日柱) 계산
 * 2000년 1월 1일 = 갑진일 (갑=0, 진=4) → 60갑자에서 4번째
 */
function calculateIlju(solarYear: number, solarMonth: number, solarDay: number): GanJi {
  // 줄리안 일수(Julian Day Number) 기반 계산
  const jdn = getJulianDayNumber(solarYear, solarMonth, solarDay);
  // 2000년 1월 1일의 JDN = 2451545, 이날은 갑진일
  // 갑진 = 60갑자 중 인덱스 40 (갑=0, 진=4 → 0*12+4는 아니고 60갑자 순서상 40번째)
  // 실제로: 2000-01-07이 갑자일
  // 2000-01-07 JDN = 2451551
  const baseJdn = 2451551; // 2000년 1월 7일 = 갑자일
  const diff = ((jdn - baseJdn) % 60 + 60) % 60;

  return {
    천간: CHEON_GAN[diff % 10],
    지지: JI_JI[diff % 12],
  };
}

/**
 * 줄리안 일수 계산
 */
function getJulianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * 시주 (時柱) 계산
 */
function calculateSiju(dayGan: CheonGan, hour: number): GanJi {
  // 시지 결정
  let sijiIndex: number;
  if (hour === 23 || hour === 0) {
    sijiIndex = 0; // 자시
  } else {
    sijiIndex = Math.floor((hour + 1) / 2);
  }

  // 시간 결정 (일간 기준)
  const startGanIndex = SIJU_START_GAN[dayGan];
  const siganIndex = (startGanIndex + sijiIndex) % 10;

  return {
    천간: CHEON_GAN[siganIndex],
    지지: JI_JI[sijiIndex],
  };
}

/**
 * 오행 분석
 */
function analyzeOHaeng(saju: SajuResult): OHaengAnalysis {
  const result: OHaengAnalysis = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

  const allGan: CheonGan[] = [saju.년주.천간, saju.월주.천간, saju.일주.천간, saju.시주.천간];
  const allJi: JiJi[] = [saju.년주.지지, saju.월주.지지, saju.일주.지지, saju.시주.지지];

  // 천간 오행 (각 1점)
  for (const gan of allGan) {
    result[CHEON_GAN_OHAENG[gan]] += 1;
  }

  // 지지 오행 (각 1점)
  for (const ji of allJi) {
    result[JI_JI_OHAENG[ji]] += 1;
  }

  // 지지 장간 오행 (각 0.5점)
  for (const ji of allJi) {
    const janggan = JI_JI_JANGGAN[ji];
    for (const jg of janggan) {
      result[CHEON_GAN_OHAENG[jg]] += 0.5 / janggan.length;
    }
  }

  // 소수점 둘째자리까지 반올림
  for (const key of Object.keys(result) as OHaeng[]) {
    result[key] = Math.round(result[key] * 100) / 100;
  }

  return result;
}

/**
 * 십신 (十神) 계산
 * 일간을 기준으로 다른 천간/지지와의 관계를 파악
 */
function getSipSin(dayGan: CheonGan, targetGan: CheonGan): SipSin {
  const dayOHaeng = CHEON_GAN_OHAENG[dayGan];
  const dayEumYang = CHEON_GAN_EUMYANG[dayGan];
  const targetOHaeng = CHEON_GAN_OHAENG[targetGan];
  const targetEumYang = CHEON_GAN_EUMYANG[targetGan];
  const sameEumYang = dayEumYang === targetEumYang;

  // 같은 오행
  if (dayOHaeng === targetOHaeng) {
    return sameEumYang ? '비견' : '겁재';
  }

  // 내가 생하는 오행 (식상)
  const generates = getGeneratedOHaeng(dayOHaeng);
  if (targetOHaeng === generates) {
    return sameEumYang ? '식신' : '상관';
  }

  // 내가 극하는 오행 (재성)
  const controls = getControlledOHaeng(dayOHaeng);
  if (targetOHaeng === controls) {
    return sameEumYang ? '편재' : '정재';
  }

  // 나를 극하는 오행 (관성)
  const controlledBy = getControllingOHaeng(dayOHaeng);
  if (targetOHaeng === controlledBy) {
    return sameEumYang ? '편관' : '정관';
  }

  // 나를 생하는 오행 (인성)
  return sameEumYang ? '편인' : '정인';
}

function getGeneratedOHaeng(ohaeng: OHaeng): OHaeng {
  const map: Record<OHaeng, OHaeng> = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  return map[ohaeng];
}

function getControlledOHaeng(ohaeng: OHaeng): OHaeng {
  const map: Record<OHaeng, OHaeng> = { '목': '토', '화': '금', '토': '수', '금': '목', '수': '화' };
  return map[ohaeng];
}

function getControllingOHaeng(ohaeng: OHaeng): OHaeng {
  const map: Record<OHaeng, OHaeng> = { '목': '금', '화': '수', '토': '목', '금': '화', '수': '토' };
  return map[ohaeng];
}

/**
 * 십신 분석
 */
function analyzeSipSin(saju: SajuResult): SipSinAnalysis {
  const dayGan = saju.일주.천간;

  // 지지의 장간 중 첫 번째(본기)를 기준으로 십신 계산
  const getJiJiSipSin = (ji: JiJi): SipSin => {
    const mainJanggan = JI_JI_JANGGAN[ji][0];
    return getSipSin(dayGan, mainJanggan);
  };

  return {
    년주천간: getSipSin(dayGan, saju.년주.천간),
    월주천간: getSipSin(dayGan, saju.월주.천간),
    일주천간: '일간', // 본인
    시주천간: getSipSin(dayGan, saju.시주.천간),
    년주지지: getJiJiSipSin(saju.년주.지지),
    월주지지: getJiJiSipSin(saju.월주.지지),
    일주지지: getJiJiSipSin(saju.일주.지지),
    시주지지: getJiJiSipSin(saju.시주.지지),
  };
}

/**
 * 대운 (大運) 계산
 * 남양순행, 남음역행, 여양역행, 여음순행
 */
function calculateDaeUn(saju: SajuResult, gender: '남' | '여', birthYear: number): DaeUn[] {
  const yearGanEumYang = CHEON_GAN_EUMYANG[saju.년주.천간];
  // 순행: 남+양 또는 여+음
  const isForward = (gender === '남' && yearGanEumYang === '양') || (gender === '여' && yearGanEumYang === '음');

  const wolGanIndex = CHEON_GAN.indexOf(saju.월주.천간);
  const wolJiIndex = JI_JI.indexOf(saju.월주.지지);

  const daeunList: DaeUn[] = [];

  for (let i = 1; i <= 12; i++) {
    const direction = isForward ? i : -i;
    const ganIndex = ((wolGanIndex + direction) % 10 + 10) % 10;
    const jiIndex = ((wolJiIndex + direction) % 12 + 12) % 12;

    const gan = CHEON_GAN[ganIndex];

    daeunList.push({
      시작나이: i * 10, // 대운 시작 나이 (간략화)
      천간: gan,
      지지: JI_JI[jiIndex],
      오행: CHEON_GAN_OHAENG[gan],
    });
  }

  return daeunList;
}

/**
 * 메인 사주 계산 함수
 */
export function calculateSaju(input: BirthInput): FullAnalysis {
  let solarYear = input.year;
  let solarMonth = input.month;
  let solarDay = input.day;

  // 음력인 경우 양력으로 변환
  if (input.isLunar) {
    const solar = lunarToSolar(input.year, input.month, input.day);
    solarYear = solar.year;
    solarMonth = solar.month;
    solarDay = solar.day;
  }

  // 절기 기반 년도 보정
  const jeolgiYear = getJeolgiYear(solarYear, solarMonth, solarDay);
  const jeolgiMonth = getJeolgiMonth(solarMonth, solarDay);

  // 사주 계산
  const nyeonju = calculateNyeonju(jeolgiYear);
  const wolju = calculateWolju(nyeonju.천간, jeolgiMonth);
  const ilju = calculateIlju(solarYear, solarMonth, solarDay);
  const siju = calculateSiju(ilju.천간, input.hour);

  const saju: SajuResult = {
    년주: nyeonju,
    월주: wolju,
    일주: ilju,
    시주: siju,
  };

  // 분석
  const ohaengAnalysis = analyzeOHaeng(saju);
  const sipsinAnalysis = analyzeSipSin(saju);
  const daeun = calculateDaeUn(saju, input.gender, jeolgiYear);

  return {
    input,
    saju,
    오행분석: ohaengAnalysis,
    십신분석: sipsinAnalysis,
    대운: daeun,
    일간오행: CHEON_GAN_OHAENG[ilju.천간],
    일간음양: CHEON_GAN_EUMYANG[ilju.천간],
  };
}

/**
 * 간단한 운세 해석 텍스트 생성
 */
export function getBasicInterpretation(analysis: FullAnalysis): string {
  const { 일간오행, 일간음양, 오행분석, 십신분석, saju } = analysis;
  const dayGan = saju.일주.천간;

  const personalityMap: Record<string, string> = {
    '갑': '큰 나무처럼 곧고 정직하며 리더십이 강합니다. 진취적이고 독립심이 강합니다.',
    '을': '풀이나 꽃처럼 부드럽고 유연합니다. 적응력이 뛰어나고 예술적 감각이 있습니다.',
    '병': '태양처럼 밝고 열정적입니다. 화려하고 표현력이 풍부하며 리더 기질이 있습니다.',
    '정': '촛불처럼 따뜻하고 섬세합니다. 배려심이 깊고 예술적 재능이 있습니다.',
    '무': '큰 산처럼 묵직하고 신뢰감이 있습니다. 포용력이 크고 안정적입니다.',
    '기': '정원의 흙처럼 생산적이고 실용적입니다. 꼼꼼하고 현실적인 판단력이 있습니다.',
    '경': '바위나 쇠처럼 강직하고 의리가 있습니다. 결단력이 강하고 정의감이 있습니다.',
    '신': '보석처럼 섬세하고 세련됩니다. 완벽주의적이고 심미안이 뛰어납니다.',
    '임': '큰 바다나 강물처럼 지혜롭고 포용력이 넓습니다. 총명하고 유동적입니다.',
    '계': '이슬이나 안개처럼 직관적이고 감수성이 풍부합니다. 영적 감각이 뛰어납니다.',
  };

  // 오행 강약 분석
  const ohaengEntries = Object.entries(오행분석) as [OHaeng, number][];
  ohaengEntries.sort((a, b) => b[1] - a[1]);
  const strongest = ohaengEntries[0];
  const weakest = ohaengEntries[ohaengEntries.length - 1];

  let interpretation = `【 일간: ${dayGan}(${일간음양} ${일간오행}) 】\n\n`;
  interpretation += `◆ 기본 성격\n${personalityMap[dayGan]}\n\n`;
  interpretation += `◆ 오행 분석\n`;
  interpretation += `가장 강한 오행: ${strongest[0]} (${strongest[1]}점)\n`;
  interpretation += `가장 약한 오행: ${weakest[0]} (${weakest[1]}점)\n\n`;

  if (weakest[1] === 0) {
    interpretation += `⚠ ${weakest[0]} 오행이 없습니다. 보완이 필요할 수 있습니다.\n\n`;
  }

  interpretation += `◆ 오행 균형\n`;
  for (const [oh, score] of ohaengEntries) {
    const bar = '█'.repeat(Math.round(score * 2)) + '░'.repeat(Math.max(0, 8 - Math.round(score * 2)));
    interpretation += `  ${oh}: ${bar} ${score}\n`;
  }

  return interpretation;
}
