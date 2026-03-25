// 사주도깨비 - 명리학 기초 데이터

import { CheonGan, JiJi, OHaeng, EumYang } from '../types/saju';

// 천간 (天干) 10개
export const CHEON_GAN: CheonGan[] = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// 지지 (地支) 12개
export const JI_JI: JiJi[] = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 천간 → 오행 매핑
export const CHEON_GAN_OHAENG: Record<CheonGan, OHaeng> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
};

// 천간 → 음양 매핑
export const CHEON_GAN_EUMYANG: Record<CheonGan, EumYang> = {
  '갑': '양', '을': '음',
  '병': '양', '정': '음',
  '무': '양', '기': '음',
  '경': '양', '신': '음',
  '임': '양', '계': '음',
};

// 지지 → 오행 매핑
export const JI_JI_OHAENG: Record<JiJi, OHaeng> = {
  '인': '목', '묘': '목',
  '사': '화', '오': '화',
  '진': '토', '술': '토', '축': '토', '미': '토',
  '신': '금', '유': '금',
  '해': '수', '자': '수',
};

// 지지 → 음양 매핑
export const JI_JI_EUMYANG: Record<JiJi, EumYang> = {
  '자': '양', '축': '음',
  '인': '양', '묘': '음',
  '진': '양', '사': '음',
  '오': '양', '미': '음',
  '신': '양', '유': '음',
  '술': '양', '해': '음',
};

// 지지 장간 (地支藏干) - 각 지지에 숨어있는 천간
export const JI_JI_JANGGAN: Record<JiJi, CheonGan[]> = {
  '자': ['계'],
  '축': ['기', '계', '신'],
  '인': ['갑', '병', '무'],
  '묘': ['을'],
  '진': ['무', '을', '계'],
  '사': ['병', '경', '무'],
  '오': ['정', '기'],
  '미': ['기', '정', '을'],
  '신': ['경', '임', '무'],
  '유': ['신'],
  '술': ['무', '신', '정'],
  '해': ['임', '갑'],
};

// 오행 상생 관계 (나를 생하는 것, 내가 생하는 것)
export const OHAENG_SANGSAENG: Record<OHaeng, { generates: OHaeng; generatedBy: OHaeng }> = {
  '목': { generates: '화', generatedBy: '수' },
  '화': { generates: '토', generatedBy: '목' },
  '토': { generates: '금', generatedBy: '화' },
  '금': { generates: '수', generatedBy: '토' },
  '수': { generates: '목', generatedBy: '금' },
};

// 오행 상극 관계 (내가 극하는 것, 나를 극하는 것)
export const OHAENG_SANGGEUK: Record<OHaeng, { controls: OHaeng; controlledBy: OHaeng }> = {
  '목': { controls: '토', controlledBy: '금' },
  '화': { controls: '금', controlledBy: '수' },
  '토': { controls: '수', controlledBy: '목' },
  '금': { controls: '목', controlledBy: '화' },
  '수': { controls: '화', controlledBy: '토' },
};

// 오행 색상 (UI용)
export const OHAENG_COLORS: Record<OHaeng, string> = {
  '목': '#4CAF50',  // 녹색
  '화': '#F44336',  // 적색
  '토': '#FFC107',  // 황색
  '금': '#FFFFFF',  // 백색
  '수': '#2196F3',  // 흑색/남색
};

// 오행 한자
export const OHAENG_HANJA: Record<OHaeng, string> = {
  '목': '木',
  '화': '火',
  '토': '土',
  '금': '金',
  '수': '水',
};

// 천간 한자
export const CHEON_GAN_HANJA: Record<CheonGan, string> = {
  '갑': '甲', '을': '乙',
  '병': '丙', '정': '丁',
  '무': '戊', '기': '己',
  '경': '庚', '신': '辛',
  '임': '壬', '계': '癸',
};

// 지지 한자
export const JI_JI_HANJA: Record<JiJi, string> = {
  '자': '子', '축': '丑',
  '인': '寅', '묘': '卯',
  '진': '辰', '사': '巳',
  '오': '午', '미': '未',
  '신': '申', '유': '酉',
  '술': '戌', '해': '亥',
};

// 지지 띠 동물
export const JI_JI_ANIMAL: Record<JiJi, string> = {
  '자': '쥐', '축': '소',
  '인': '호랑이', '묘': '토끼',
  '진': '용', '사': '뱀',
  '오': '말', '미': '양',
  '신': '원숭이', '유': '닭',
  '술': '개', '해': '돼지',
};

// 60갑자 (六十甲子) 순서
export const SIXTY_GANJI: Array<{ 천간: CheonGan; 지지: JiJi }> = (() => {
  const result: Array<{ 천간: CheonGan; 지지: JiJi }> = [];
  for (let i = 0; i < 60; i++) {
    result.push({
      천간: CHEON_GAN[i % 10],
      지지: JI_JI[i % 12],
    });
  }
  return result;
})();

// 월주 천간 결정표 (년간 → 월지인(1월) 시작 천간)
// 년간이 갑/기 → 병인월, 을/경 → 무인월, 병/신 → 경인월, 정/임 → 임인월, 무/계 → 갑인월
export const WOLJU_START_GAN: Record<string, number> = {
  '갑': 2, // 병(2)
  '기': 2,
  '을': 4, // 무(4)
  '경': 4,
  '병': 6, // 경(6)
  '신': 6,
  '정': 8, // 임(8)
  '임': 8,
  '무': 0, // 갑(0)
  '계': 0,
};

// 시주 천간 결정표 (일간 → 자시 시작 천간)
// 일간이 갑/기 → 갑자시, 을/경 → 병자시, 병/신 → 무자시, 정/임 → 경자시, 무/계 → 임자시
export const SIJU_START_GAN: Record<string, number> = {
  '갑': 0, // 갑(0)
  '기': 0,
  '을': 2, // 병(2)
  '경': 2,
  '병': 4, // 무(4)
  '신': 4,
  '정': 6, // 경(6)
  '임': 6,
  '무': 8, // 임(8)
  '계': 8,
};

// 시간 → 지지 매핑 (시간대별)
export const HOUR_TO_JIJI: Array<{ start: number; end: number; jiji: JiJi }> = [
  { start: 23, end: 1, jiji: '자' },   // 23:00 ~ 01:00
  { start: 1, end: 3, jiji: '축' },    // 01:00 ~ 03:00
  { start: 3, end: 5, jiji: '인' },    // 03:00 ~ 05:00
  { start: 5, end: 7, jiji: '묘' },    // 05:00 ~ 07:00
  { start: 7, end: 9, jiji: '진' },    // 07:00 ~ 09:00
  { start: 9, end: 11, jiji: '사' },   // 09:00 ~ 11:00
  { start: 11, end: 13, jiji: '오' },  // 11:00 ~ 13:00
  { start: 13, end: 15, jiji: '미' },  // 13:00 ~ 15:00
  { start: 15, end: 17, jiji: '신' },  // 15:00 ~ 17:00
  { start: 17, end: 19, jiji: '유' },  // 17:00 ~ 19:00
  { start: 19, end: 21, jiji: '술' },  // 19:00 ~ 21:00
  { start: 21, end: 23, jiji: '해' },  // 21:00 ~ 23:00
];

// 절기 기반 월 시작일 (양력 기준 근사값)
// 실제로는 매년 조금씩 다르지만 근사값 사용
export const JEOLGI_MONTHS: Array<{ month: number; startMonth: number; startDay: number }> = [
  { month: 1, startMonth: 2, startDay: 4 },   // 입춘 (立春)
  { month: 2, startMonth: 3, startDay: 6 },   // 경칩 (驚蟄)
  { month: 3, startMonth: 4, startDay: 5 },   // 청명 (清明)
  { month: 4, startMonth: 5, startDay: 6 },   // 입하 (立夏)
  { month: 5, startMonth: 6, startDay: 6 },   // 망종 (芒種)
  { month: 6, startMonth: 7, startDay: 7 },   // 소서 (小暑)
  { month: 7, startMonth: 8, startDay: 7 },   // 입추 (立秋)
  { month: 8, startMonth: 9, startDay: 8 },   // 백로 (白露)
  { month: 9, startMonth: 10, startDay: 8 },  // 한로 (寒露)
  { month: 10, startMonth: 11, startDay: 7 }, // 입동 (立冬)
  { month: 11, startMonth: 12, startDay: 7 }, // 대설 (大雪)
  { month: 12, startMonth: 1, startDay: 6 },  // 소한 (小寒)
];
