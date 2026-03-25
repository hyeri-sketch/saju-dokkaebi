// 사주도깨비 - 타입 정의

// 천간 (天干) - 10개
export type CheonGan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';

// 지지 (地支) - 12개
export type JiJi = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';

// 오행 (五行)
export type OHaeng = '목' | '화' | '토' | '금' | '수';

// 음양
export type EumYang = '양' | '음';

// 십신 (十神)
export type SipSin =
  | '비견' | '겁재'
  | '식신' | '상관'
  | '편재' | '정재'
  | '편관' | '정관'
  | '편인' | '정인';

// 간지 (干支) 쌍
export interface GanJi {
  천간: CheonGan;
  지지: JiJi;
}

// 사주팔자 (四柱八字)
export interface SajuResult {
  년주: GanJi;  // 年柱
  월주: GanJi;  // 月柱
  일주: GanJi;  // 日柱
  시주: GanJi;  // 時柱
}

// 오행 분석 결과
export interface OHaengAnalysis {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

// 십신 분석 결과
export interface SipSinAnalysis {
  년주천간: SipSin;
  월주천간: SipSin;
  일주천간: string; // 일간 (본인)
  시주천간: SipSin;
  년주지지: SipSin;
  월주지지: SipSin;
  일주지지: SipSin;
  시주지지: SipSin;
}

// 대운 정보
export interface DaeUn {
  시작나이: number;
  천간: CheonGan;
  지지: JiJi;
  오행: OHaeng;
}

// 사용자 입력
export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  isLunar: boolean;  // 음력 여부
  gender: '남' | '여';
}

// 전체 분석 결과
export interface FullAnalysis {
  input: BirthInput;
  saju: SajuResult;
  오행분석: OHaengAnalysis;
  십신분석: SipSinAnalysis;
  대운: DaeUn[];
  일간오행: OHaeng;
  일간음양: EumYang;
}
