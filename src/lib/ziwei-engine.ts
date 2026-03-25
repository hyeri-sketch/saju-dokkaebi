// 사주도깨비 - 자미두수 (紫微斗數) 계산 엔진
//
// 자미두수는 매우 복잡한 체계로, 여기서는 핵심 로직을 구현합니다.
// 음력 생년월일시를 기반으로 명궁/신궁 위치와 14주성 배치를 계산합니다.

import type { ZiweiPalace, MainStar, PalaceInfo, ZiweiResult } from '../types/ziwei';

// 12궁 순서 (자~해)
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 12궁 이름 (인궁부터 시작하여 반시계 방향)
const PALACE_NAMES: ZiweiPalace[] = [
  '명궁', '형제궁', '부처궁', '자녀궁',
  '재백궁', '질액궁', '천이궁', '노복궁',
  '관록궁', '전택궁', '복덕궁', '부모궁',
];

// 14주성
const MAIN_STARS: MainStar[] = [
  '자미', '천기', '태양', '무곡', '천동', '염정', '천부',
  '태음', '탐랑', '거문', '천상', '천량', '칠살', '파군',
];

/**
 * 명궁 지지 계산
 * 공식: 명궁지지 인덱스 = (월 + 시 인덱스의 합) 기반으로 결정
 * 인월(1월)을 인(寅)에 놓고, 월수만큼 순행하여 생월을 찾고,
 * 거기서 시지만큼 역행하여 명궁을 결정
 */
function calculateMyeongGung(lunarMonth: number, hourBranchIndex: number): number {
  // 인(寅) = 인덱스 2
  // 생월 위치: 인(2)에서 (월-1)만큼 순행
  const monthPosition = (2 + lunarMonth - 1) % 12;
  // 명궁: 생월 위치에서 시지만큼 역행
  const myeonggung = ((monthPosition - hourBranchIndex) % 12 + 12) % 12;
  return myeonggung;
}

/**
 * 신궁 지지 계산
 * 공식: 월지 + 시지 인덱스를 기반으로 계산
 */
function calculateShinGung(lunarMonth: number, hourBranchIndex: number): number {
  // 인(2)에서 (월-1)만큼 순행한 위치
  const monthPosition = (2 + lunarMonth - 1) % 12;
  // 신궁: 생월 위치에서 시지만큼 순행
  const shingung = (monthPosition + hourBranchIndex) % 12;
  return shingung;
}

/**
 * 오행국 계산 (간략화)
 * 명궁의 천간과 지지 조합으로 결정되나, 여기서는 간소화
 */
function getWuXingJu(lunarYear: number, myeonggungIndex: number): number {
  // 2(수이국), 3(목삼국), 4(금사국), 5(토오국), 6(화육국)
  const yearStem = ((lunarYear - 4) % 10 + 10) % 10; // 천간 인덱스
  const combo = (yearStem + myeonggungIndex) % 5;
  const juMap = [2, 6, 3, 5, 4]; // 수, 화, 목, 토, 금
  return juMap[combo];
}

/**
 * 자미성 위치 계산
 * 오행국수와 음력 일을 이용하여 자미성의 위치를 결정
 */
function getZiweiPosition(wuxingJu: number, lunarDay: number): number {
  // 간소화된 계산: (일 / 국수)를 기반으로 위치 결정
  const quotient = Math.ceil(lunarDay / wuxingJu);
  const remainder = lunarDay % wuxingJu;

  let position: number;
  if (remainder === 0) {
    position = quotient;
  } else {
    // 홀수 나머지면 순행, 짝수 나머지면 역행
    if (remainder % 2 === 1) {
      position = quotient + Math.ceil(remainder / 2);
    } else {
      position = quotient - Math.floor(remainder / 2);
    }
  }

  // 12궁 내로 제한 (1~12를 0~11 인덱스로)
  return ((position - 1) % 12 + 12) % 12;
}

/**
 * 자미성 계열 배치 (자미, 천기, 태양, 무곡, 천동, 염정)
 */
function placeZiweiGroup(ziweiPos: number): Map<number, MainStar[]> {
  const starMap = new Map<number, MainStar[]>();

  const addStar = (pos: number, star: MainStar) => {
    const normalized = ((pos % 12) + 12) % 12;
    if (!starMap.has(normalized)) starMap.set(normalized, []);
    starMap.get(normalized)!.push(star);
  };

  // 자미 계열 배치 (자미에서의 상대적 위치)
  addStar(ziweiPos, '자미');
  addStar(ziweiPos - 1, '천기');
  addStar(ziweiPos - 3, '태양');
  addStar(ziweiPos - 4, '무곡');
  addStar(ziweiPos - 5, '천동');
  addStar(ziweiPos - 8, '염정');

  return starMap;
}

/**
 * 천부성 계열 배치 (천부, 태음, 탐랑, 거문, 천상, 천량, 칠살, 파군)
 */
function placeTianfuGroup(ziweiPos: number): Map<number, MainStar[]> {
  const starMap = new Map<number, MainStar[]>();

  const addStar = (pos: number, star: MainStar) => {
    const normalized = ((pos % 12) + 12) % 12;
    if (!starMap.has(normalized)) starMap.set(normalized, []);
    starMap.get(normalized)!.push(star);
  };

  // 천부 위치: 자미와 대칭 (인진 기준)
  // 간소화: 천부는 자미에서 반대 방향
  const tianfuPos = (4 - (ziweiPos - 4) + 12) % 12; // 진(4) 기준 대칭

  addStar(tianfuPos, '천부');
  addStar(tianfuPos + 1, '태음');
  addStar(tianfuPos + 2, '탐랑');
  addStar(tianfuPos + 3, '거문');
  addStar(tianfuPos + 4, '천상');
  addStar(tianfuPos + 5, '천량');
  addStar(tianfuPos + 6, '칠살');
  addStar(tianfuPos + 10, '파군');

  return starMap;
}

/**
 * 자미두수 메인 계산 함수
 */
export function calculateZiwei(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  hourBranchIndex: number, // 0=자시, 1=축시, ...
  gender: '남' | '여',
): ZiweiResult {
  // 1. 명궁/신궁 위치 계산
  const myeonggungIndex = calculateMyeongGung(lunarMonth, hourBranchIndex);
  const shingungIndex = calculateShinGung(lunarMonth, hourBranchIndex);

  // 2. 오행국 계산
  const wuxingJu = getWuXingJu(lunarYear, myeonggungIndex);

  // 3. 자미성 위치 계산
  const ziweiPos = getZiweiPosition(wuxingJu, lunarDay);

  // 4. 14주성 배치
  const ziweiGroup = placeZiweiGroup(ziweiPos);
  const tianfuGroup = placeTianfuGroup(ziweiPos);

  // 5. 12궁 정보 생성
  const palaces: PalaceInfo[] = [];
  for (let i = 0; i < 12; i++) {
    // 명궁 위치에서 시작하여 12궁 배치
    const branchIndex = (myeonggungIndex + i) % 12;
    const palaceName = PALACE_NAMES[i];

    const mainStars: MainStar[] = [
      ...(ziweiGroup.get(branchIndex) || []),
      ...(tianfuGroup.get(branchIndex) || []),
    ];

    palaces.push({
      name: palaceName,
      branch: BRANCHES[branchIndex],
      mainStars,
      auxStars: [],      // 보성은 추후 구현
      maleficStars: [],   // 살성은 추후 구현
    });
  }

  // 6. 요약 생성
  const summary = generateZiweiSummary(palaces, myeonggungIndex, wuxingJu);

  return {
    명궁지지: BRANCHES[myeonggungIndex],
    신궁지지: BRANCHES[shingungIndex],
    palaces,
    summary,
  };
}

/**
 * 자미두수 요약 생성
 */
function generateZiweiSummary(palaces: PalaceInfo[], myeonggungIndex: number, wuxingJu: number): string {
  const juNames: Record<number, string> = {
    2: '수이국(水二局)',
    3: '목삼국(木三局)',
    4: '금사국(金四局)',
    5: '토오국(土五局)',
    6: '화육국(火六局)',
  };

  const myeonggung = palaces[0];
  let summary = `【 자미두수 명반 】\n\n`;
  summary += `◆ 명궁: ${BRANCHES[myeonggungIndex]}궁\n`;
  summary += `◆ 오행국: ${juNames[wuxingJu] || wuxingJu + '국'}\n\n`;

  if (myeonggung.mainStars.length > 0) {
    summary += `◆ 명궁 주성: ${myeonggung.mainStars.join(', ')}\n`;
  } else {
    summary += `◆ 명궁 주성: 없음 (차입궁 적용)\n`;
  }

  summary += `\n◆ 12궁 주성 배치:\n`;
  for (const palace of palaces) {
    const stars = palace.mainStars.length > 0 ? palace.mainStars.join(', ') : '-';
    summary += `  ${palace.name}(${palace.branch}): ${stars}\n`;
  }

  // 명궁 주성에 따른 간략 해석
  if (myeonggung.mainStars.length > 0) {
    const mainStar = myeonggung.mainStars[0];
    const starInterpretation = getMainStarInterpretation(mainStar);
    if (starInterpretation) {
      summary += `\n◆ 명궁 ${mainStar}성 해석:\n${starInterpretation}`;
    }
  }

  return summary;
}

/**
 * 주성별 간략 해석
 */
function getMainStarInterpretation(star: MainStar): string {
  const interpretations: Partial<Record<MainStar, string>> = {
    '자미': '제왕의 별. 리더십이 강하고 존엄한 기질을 가집니다. 높은 자존심과 포부를 지니며 큰 뜻을 품습니다.',
    '천기': '지혜의 별. 총명하고 두뇌 회전이 빠릅니다. 계획적이고 전략적인 사고에 능합니다.',
    '태양': '빛의 별. 밝고 활기차며 남을 돕기를 좋아합니다. 공정하고 정의로운 성격입니다.',
    '무곡': '재물의 별. 재물 복이 있으며 실행력이 뛰어납니다. 과감하고 결단력 있는 성격입니다.',
    '천동': '복락의 별. 낙천적이고 인자합니다. 예술적 감각이 뛰어나며 평화를 좋아합니다.',
    '염정': '정치의 별. 사교적이고 감정이 풍부합니다. 예술과 문학에 재능이 있으나 감정적 기복이 있을 수 있습니다.',
    '천부': '재물고의 별. 재물 관리에 뛰어나며 안정적인 삶을 추구합니다. 보수적이고 현실적입니다.',
    '태음': '달의 별. 섬세하고 감수성이 풍부합니다. 부동산이나 재물 복이 있으며 문학적 소양이 있습니다.',
    '탐랑': '욕망의 별. 다재다능하고 호기심이 강합니다. 사교적이며 다양한 분야에 관심을 갖습니다.',
    '거문': '구설의 별. 언변이 뛰어나고 분석력이 강합니다. 법률, 교육 분야에 재능이 있습니다.',
    '천상': '기록의 별. 성실하고 꼼꼼합니다. 조직적이며 보좌 능력이 뛰어납니다.',
    '천량': '덕의 별. 어른의 풍모가 있으며 남을 가르치기를 좋아합니다. 봉사 정신이 강합니다.',
    '칠살': '장군의 별. 용맹하고 결단력이 있습니다. 고독하지만 강한 의지를 가집니다.',
    '파군': '파괴와 재건의 별. 혁신적이고 파괴적 창조력을 가집니다. 변화를 좋아하며 모험적입니다.',
  };

  return interpretations[star] || '';
}

// 주성별 색상 (UI용)
export const MAIN_STAR_COLORS: Partial<Record<MainStar, string>> = {
  '자미': '#9C27B0',  // 자색
  '천기': '#2196F3',
  '태양': '#FF9800',
  '무곡': '#FFD700',
  '천동': '#4CAF50',
  '염정': '#F44336',
  '천부': '#FF9800',
  '태음': '#B0BEC5',
  '탐랑': '#E91E63',
  '거문': '#607D8B',
  '천상': '#8BC34A',
  '천량': '#00BCD4',
  '칠살': '#F44336',
  '파군': '#9E9E9E',
};
