// 서양 점성술 타입 정의

// 12궁 (별자리)
export type ZodiacSign =
  | '양자리' | '황소자리' | '쌍둥이자리' | '게자리'
  | '사자자리' | '처녀자리' | '천칭자리' | '전갈자리'
  | '궁수자리' | '염소자리' | '물병자리' | '물고기자리';

// 4원소
export type Element = '불' | '흙' | '공기' | '물';

// 3특성
export type Modality = '카디널' | '고정' | '변통';

// 행성
export type Planet =
  | '태양' | '달' | '수성' | '금성' | '화성'
  | '목성' | '토성' | '천왕성' | '해왕성' | '명왕성';

// 하우스
export type House = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// 별자리 정보
export interface ZodiacInfo {
  sign: ZodiacSign;
  signEn: string;
  symbol: string;
  element: Element;
  modality: Modality;
  rulingPlanet: Planet;
  dateRange: string;
  traits: string[];
}

// 간단한 점성술 결과
export interface AstrologyResult {
  sunSign: ZodiacInfo;       // 태양궁 (일반적으로 알려진 별자리)
  elementBalance: Record<Element, number>;
  summary: string;
}
