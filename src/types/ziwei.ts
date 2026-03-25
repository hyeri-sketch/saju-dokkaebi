// 자미두수 (紫微斗數) 타입 정의

// 자미두수 12궁
export type ZiweiPalace =
  | '명궁' | '형제궁' | '부처궁' | '자녀궁'
  | '재백궁' | '질액궁' | '천이궁' | '노복궁'
  | '관록궁' | '전택궁' | '복덕궁' | '부모궁';

// 자미두수 14주성
export type MainStar =
  | '자미' | '천기' | '태양' | '무곡' | '천동' | '염정' | '천부'
  | '태음' | '탐랑' | '거문' | '천상' | '천량' | '칠살' | '파군';

// 보성
export type AuxStar =
  | '좌보' | '우필' | '천괴' | '천월'
  | '문창' | '문곡' | '녹존' | '천마';

// 살성
export type MaleficStar =
  | '경양' | '타라' | '화성' | '영성'
  | '지공' | '지겁';

// 궁 정보
export interface PalaceInfo {
  name: ZiweiPalace;
  branch: string;       // 지지
  mainStars: MainStar[];
  auxStars: AuxStar[];
  maleficStars: MaleficStar[];
}

// 자미두수 분석 결과
export interface ZiweiResult {
  명궁지지: string;
  신궁지지: string;
  palaces: PalaceInfo[];
  summary: string;
}
