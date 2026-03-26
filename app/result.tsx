import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { calculateSaju } from '../src/lib/saju-engine';
import { getDetailedInterpretation } from '../src/lib/detailed-interpretation';
import { calculateAstrology, ELEMENT_COLORS, ELEMENT_EMOJI } from '../src/lib/astrology-engine';
import { calculateZiwei, MAIN_STAR_COLORS } from '../src/lib/ziwei-engine';
import {
  CHEON_GAN_HANJA,
  JI_JI_HANJA,
  CHEON_GAN_OHAENG,
  JI_JI_OHAENG,
  OHAENG_COLORS,
  OHAENG_HANJA,
  JI_JI_ANIMAL,
} from '../src/constants/saju-data';
import {
  MONKEY_OPENING,
  MONKEY_SECTION_COMMENTS,
  DOPAMINE_PARTY_LINES,
  SAD_MONKEY_LINES,
  getRandomItem,
  isLuckyFortune,
  hasWealthStar,
} from '../src/constants/monkey-lines';
import type { YearlyFortuneDetail, JiJiInteraction } from '../src/lib/yearly-fortune-engine';
import type { BirthInput, GanJi, OHaeng } from '../src/types/saju';
import type { Element } from '../src/types/astrology';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    isLunar: string;
    gender: string;
    unknownTime: string;
  }>();

  const isUnknownTime = params.unknownTime === 'true';

  const analysis = useMemo(() => {
    const input: BirthInput = {
      year: parseInt(params.year || '1990'),
      month: parseInt(params.month || '1'),
      day: parseInt(params.day || '1'),
      hour: isUnknownTime ? 12 : parseInt(params.hour || '12'),
      minute: isUnknownTime ? 0 : parseInt(params.minute || '0'),
      isLunar: params.isLunar === 'true',
      gender: (params.gender as '남' | '여') || '남',
    };
    return calculateSaju(input);
  }, [params]);

  const detailed = useMemo(() => getDetailedInterpretation(analysis), [analysis]);

  // 원숭이 세계관
  const dayGan = analysis.saju.일주.천간;
  const opening = MONKEY_OPENING[dayGan] || '우끼끼! 바나나 까본다!';
  const isLucky = useMemo(() => isLuckyFortune(analysis.오행분석 as unknown as Record<string, number>), [analysis]);
  const sipsinList = useMemo(() => {
    const s = analysis.십신분석;
    return [s.년주천간, s.월주천간, s.시주천간, s.년주지지, s.월주지지, s.일주지지, s.시주지지];
  }, [analysis]);
  const isWealthy = useMemo(() => hasWealthStar(sipsinList), [sipsinList]);

  // 도파민 파티 애니메이션
  const [showParty, setShowParty] = useState(isLucky);
  const partyAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (isLucky) {
      Animated.sequence([
        Animated.timing(partyAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(partyAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]).start(() => setShowParty(false));
    }
  }, [isLucky]);

  const astrologyResult = useMemo(() => {
    return calculateAstrology(parseInt(params.month || '1'), parseInt(params.day || '1'));
  }, [params]);

  const ziweiResult = useMemo(() => {
    const hour = parseInt(params.hour || '12');
    const hourBranchIndex = hour === 23 || hour === 0 ? 0 : Math.floor((hour + 1) / 2);
    return calculateZiwei(
      parseInt(params.year || '1990'),
      parseInt(params.month || '1'),
      parseInt(params.day || '1'),
      hourBranchIndex,
      (params.gender as '남' | '여') || '남',
    );
  }, [params]);

  const renderPillar = (label: string, ganji: GanJi, subLabel?: string) => {
    const ganOH = CHEON_GAN_OHAENG[ganji.천간];
    const jiOH = JI_JI_OHAENG[ganji.지지];
    return (
      <View style={styles.pillar}>
        <Text style={styles.pillarLabel}>{label}</Text>
        {subLabel && <Text style={styles.pillarSubLabel}>{subLabel}</Text>}
        <View style={[styles.ganjiBox, { backgroundColor: OHAENG_COLORS[ganOH] + 'CC' }]}>
          <Text style={styles.ganjiHanja}>{CHEON_GAN_HANJA[ganji.천간]}</Text>
          <Text style={styles.ganjiKor}>{ganji.천간}</Text>
          <View style={[styles.ohaengBadge, { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
            <Text style={styles.ohaengBadgeText}>{OHAENG_HANJA[ganOH]}</Text>
          </View>
        </View>
        <View style={[styles.ganjiBox, { backgroundColor: OHAENG_COLORS[jiOH] + 'CC' }]}>
          <Text style={styles.ganjiHanja}>{JI_JI_HANJA[ganji.지지]}</Text>
          <Text style={styles.ganjiKor}>{ganji.지지}</Text>
          <View style={[styles.ohaengBadge, { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
            <Text style={styles.ohaengBadgeText}>{OHAENG_HANJA[jiOH]}</Text>
          </View>
        </View>
        <Text style={styles.animalText}>{JI_JI_ANIMAL[ganji.지지]}</Text>
      </View>
    );
  };

  const ohaengEntries = Object.entries(analysis.오행분석) as [OHaeng, number][];
  const maxOH = Math.max(...ohaengEntries.map(([, v]) => v));

  // 점수 → 게이지 바 렌더
  const renderScoreBar = (score: number, label: string) => {
    const pct = (score / 10) * 100;
    const color = score >= 8 ? COLORS.success : score >= 6 ? COLORS.accent : score >= 4 ? COLORS.warning : COLORS.error;
    return (
      <View style={styles.scoreBarContainer}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <View style={styles.scoreBarTrack}>
          <View style={[styles.scoreBarFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.scoreBarValue, { color }]}>{score}/10</Text>
      </View>
    );
  };

  // 올해 운세 상세 렌더
  const renderYearlyFortuneDetail = (yf: YearlyFortuneDetail) => {
    const yearComments = MONKEY_SECTION_COMMENTS.yearlyDetail;
    return (
      <View>
        {/* 총운 헤더 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 {yearComments.title} ({yf.year})</Text>
          <View style={styles.yearHeaderBox}>
            <Text style={styles.yearHeaderAnimal}>{yf.yearAnimal === '말' ? '🐴' : yf.yearAnimal === '양' ? '🐑' : yf.yearAnimal === '원숭이' ? '🐵' : yf.yearAnimal === '닭' ? '🐔' : yf.yearAnimal === '개' ? '🐶' : yf.yearAnimal === '돼지' ? '🐷' : yf.yearAnimal === '쥐' ? '🐭' : yf.yearAnimal === '소' ? '🐮' : yf.yearAnimal === '호랑이' ? '🐯' : yf.yearAnimal === '토끼' ? '🐰' : yf.yearAnimal === '용' ? '🐲' : '🐍'}</Text>
            <View style={styles.yearHeaderInfo}>
              <Text style={styles.yearHeaderTitle}>{yf.year}년 {yf.yearGanHanja}{yf.yearJiHanja}({yf.yearGan}{yf.yearJi})년</Text>
              <Text style={styles.yearHeaderSub}>{yf.yearAnimal}띠의 해 · {yf.yearGanOhaeng}({OHAENG_HANJA[yf.yearGanOhaeng]})+{yf.yearJiOhaeng}({OHAENG_HANJA[yf.yearJiOhaeng]}) 기운</Text>
            </View>
          </View>
          <View style={styles.sipsinBadge}>
            <Text style={styles.sipsinBadgeText}>세운 십신: {yf.sipsinRelation} ({yf.totalFortune.keyword})</Text>
          </View>

          {/* 6대 카테고리 점수 총괄 */}
          <View style={styles.fortuneScoreGrid}>
            {renderScoreBar(yf.totalFortune.overallScore, '총운')}
            {renderScoreBar(yf.loveFortune.score, '애정')}
            {renderScoreBar(yf.wealthFortune.score, '재물')}
            {renderScoreBar(yf.careerFortune.score, '업무')}
            {renderScoreBar(yf.healthFortune.score, '건강')}
            {renderScoreBar(yf.relationshipFortune.score, '인간관계')}
          </View>
        </View>

        {/* 1. 총운 (가장 상세) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔮 {yearComments.total.title}</Text>
          <View style={styles.monkeyMini}>
            <Text style={styles.monkeyMiniEmoji}>🐵</Text>
            <Text style={styles.monkeyMiniText}>{yf.totalFortune.overallScore >= 7 ? yearComments.total.good : yearComments.total.bad}</Text>
          </View>
          <View style={styles.fortuneScoreBig}>
            <Text style={styles.fortuneScoreBigNum}>{yf.totalFortune.overallScore}</Text>
            <Text style={styles.fortuneScoreBigLabel}>/ 10</Text>
          </View>
          <Text style={styles.bodyText}>{yf.totalFortune.summary}</Text>
          <View style={styles.subSection}>
            <Text style={styles.bodyText}>{yf.totalFortune.detail}</Text>
          </View>
          {/* 지지 상호작용 */}
          {yf.jijiInteractions.length > 0 && (
            <View style={styles.jijiSection}>
              <Text style={styles.subTitle}>⚡ 지지(地支) 상호작용</Text>
              {yf.jijiInteractions.map((inter, i) => (
                <View key={i} style={[styles.jijiItem, { borderLeftColor: inter.isPositive ? COLORS.success : COLORS.error }]}>
                  <Text style={styles.jijiType}>{inter.isPositive ? '✅' : '⚠️'} {inter.type} ({inter.yearJi}↔{inter.myJi}, {inter.position})</Text>
                  <Text style={styles.jijiMeaning}>{inter.meaning}</Text>
                </View>
              ))}
            </View>
          )}
          {yf.totalFortune.jijiBonus !== '' && (
            <View style={styles.subSection}>
              <Text style={styles.bodyText}>{yf.totalFortune.jijiBonus}</Text>
            </View>
          )}
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>📆 상반기 전망</Text>
            <Text style={styles.bodyText}>{yf.totalFortune.firstHalf}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>📆 하반기 전망</Text>
            <Text style={styles.bodyText}>{yf.totalFortune.secondHalf}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>💡 올해의 조언</Text>
            <Text style={styles.adviceText}>{yf.totalFortune.advice}</Text>
          </View>
          <View style={styles.luckyRow}>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>🎨 행운 색</Text>
              <Text style={styles.luckyValue}>{yf.totalFortune.luckyColor}</Text>
            </View>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>🔢 행운 숫자</Text>
              <Text style={styles.luckyValue}>{yf.totalFortune.luckyNumber}</Text>
            </View>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>🧭 행운 방위</Text>
              <Text style={styles.luckyValue}>{yf.totalFortune.luckyDirection}</Text>
            </View>
          </View>
        </View>

        {/* 2. 애정운 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💘 {yearComments.love.title}</Text>
          <View style={styles.monkeyMini}>
            <Text style={styles.monkeyMiniEmoji}>🐵</Text>
            <Text style={styles.monkeyMiniText}>{yf.loveFortune.score >= 7 ? yearComments.love.good : yearComments.love.bad}</Text>
          </View>
          {renderScoreBar(yf.loveFortune.score, '애정운')}
          <Text style={[styles.bodyText, { marginTop: SPACING.md }]}>{yf.loveFortune.summary}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>💕 솔로라면</Text>
            <Text style={styles.bodyText}>{yf.loveFortune.singleAdvice}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>👫 커플이라면</Text>
            <Text style={styles.bodyText}>{yf.loveFortune.coupleAdvice}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>💒 결혼 신호</Text>
            <Text style={styles.bodyText}>{yf.loveFortune.marriageSign}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>⚠ 연애 주의사항</Text>
            <Text style={styles.adviceText}>{yf.loveFortune.caution}</Text>
          </View>
        </View>

        {/* 3. 재물운 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💰 {yearComments.wealth.title}</Text>
          <View style={styles.monkeyMini}>
            <Text style={styles.monkeyMiniEmoji}>🐵</Text>
            <Text style={styles.monkeyMiniText}>{yf.wealthFortune.score >= 7 ? yearComments.wealth.good : yearComments.wealth.bad}</Text>
          </View>
          {renderScoreBar(yf.wealthFortune.score, '재물운')}
          <Text style={[styles.bodyText, { marginTop: SPACING.md }]}>{yf.wealthFortune.summary}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>📈 수입 변화</Text>
            <Text style={styles.bodyText}>{yf.wealthFortune.incomeChange}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>📊 투자 조언</Text>
            <Text style={styles.bodyText}>{yf.wealthFortune.investmentAdvice}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🛍 지출 주의</Text>
            <Text style={styles.bodyText}>{yf.wealthFortune.spendingWarning}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>💡 부업/사업 조언</Text>
            <Text style={styles.adviceText}>{yf.wealthFortune.sideBusiness}</Text>
          </View>
        </View>

        {/* 4. 업무운 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💼 {yearComments.career.title}</Text>
          <View style={styles.monkeyMini}>
            <Text style={styles.monkeyMiniEmoji}>🐵</Text>
            <Text style={styles.monkeyMiniText}>{yf.careerFortune.score >= 7 ? yearComments.career.good : yearComments.career.bad}</Text>
          </View>
          {renderScoreBar(yf.careerFortune.score, '업무운')}
          <Text style={[styles.bodyText, { marginTop: SPACING.md }]}>{yf.careerFortune.summary}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>📈 승진 가능성</Text>
            <Text style={styles.bodyText}>{yf.careerFortune.promotionChance}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🔄 이직/전직</Text>
            <Text style={styles.bodyText}>{yf.careerFortune.jobChangeAdvice}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🏢 사업/비즈니스</Text>
            <Text style={styles.bodyText}>{yf.careerFortune.businessAdvice}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>📅 핵심 시기</Text>
            <Text style={styles.adviceText}>{yf.careerFortune.keyPeriod}</Text>
          </View>
        </View>

        {/* 5. 건강운 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏥 {yearComments.health.title}</Text>
          <View style={styles.monkeyMini}>
            <Text style={styles.monkeyMiniEmoji}>🐵</Text>
            <Text style={styles.monkeyMiniText}>{yf.healthFortune.score >= 7 ? yearComments.health.good : yearComments.health.bad}</Text>
          </View>
          {renderScoreBar(yf.healthFortune.score, '건강운')}
          <Text style={[styles.bodyText, { marginTop: SPACING.md }]}>{yf.healthFortune.summary}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>⚠ 취약 부위</Text>
            <Text style={styles.bodyText}>{yf.healthFortune.weakPoints}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🌿 계절별 건강관리</Text>
            <Text style={styles.bodyText}>{yf.healthFortune.seasonalAdvice}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🧠 정신 건강</Text>
            <Text style={styles.bodyText}>{yf.healthFortune.mentalHealth}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>🏃 추천 운동</Text>
            <Text style={styles.adviceText}>{yf.healthFortune.exerciseAdvice}</Text>
          </View>
        </View>

        {/* 6. 대인관계운 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🤝 {yearComments.relationship.title}</Text>
          <View style={styles.monkeyMini}>
            <Text style={styles.monkeyMiniEmoji}>🐵</Text>
            <Text style={styles.monkeyMiniText}>{yf.relationshipFortune.score >= 7 ? yearComments.relationship.good : yearComments.relationship.bad}</Text>
          </View>
          {renderScoreBar(yf.relationshipFortune.score, '대인관계')}
          <Text style={[styles.bodyText, { marginTop: SPACING.md }]}>{yf.relationshipFortune.summary}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>👨‍👩‍👧‍👦 가족 관계</Text>
            <Text style={styles.bodyText}>{yf.relationshipFortune.familyRelation}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>👥 친구 관계</Text>
            <Text style={styles.bodyText}>{yf.relationshipFortune.friendRelation}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🏢 직장 관계</Text>
            <Text style={styles.bodyText}>{yf.relationshipFortune.workRelation}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>⭐ 올해의 귀인</Text>
            <Text style={styles.adviceText}>{yf.relationshipFortune.noblePerson}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {showParty && (
          <Animated.View style={[styles.partyOverlay, { opacity: partyAnim }]}>
            <Text style={styles.partyEmoji}>🎉🐵🎆🍌🎊🐵🎉</Text>
            <Text style={styles.partyText}>{getRandomItem(DOPAMINE_PARTY_LINES)}</Text>
            <Text style={styles.partyEmoji}>🎆🍌🎉🐵🎊🍌🎆</Text>
          </Animated.View>
        )}
        <View style={styles.monkeyBubble}>
          <Text style={styles.monkeyFace}>🐵</Text>
          <View style={styles.monkeySpeech}>
            <Text style={styles.monkeySpeechText}>{opening}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏛 사주{isUnknownTime ? '삼주 (三柱六字)' : '팔자 (四柱八字)'}</Text>
          {isUnknownTime && (
            <View style={styles.unknownTimeBanner}>
              <Text style={styles.unknownTimeBannerText}>⏰ 태어난 시간을 모르므로 시주(時柱)를 제외한 년주·월주·일주 기반으로 분석합니다.</Text>
            </View>
          )}
          <View style={styles.pillarsRow}>
            {isUnknownTime ? (
              <View style={styles.pillarUnknown}>
                <Text style={styles.pillarLabel}>시주</Text>
                <Text style={styles.pillarSubLabel}>時柱</Text>
                <View style={styles.ganjiBoxUnknown}>
                  <Text style={styles.unknownMark}>?</Text>
                </View>
                <View style={styles.ganjiBoxUnknown}>
                  <Text style={styles.unknownMark}>?</Text>
                </View>
              </View>
            ) : (
              renderPillar('시주', analysis.saju.시주, '時柱')
            )}
            {renderPillar('일주', analysis.saju.일주, '日柱')}
            {renderPillar('월주', analysis.saju.월주, '月柱')}
            {renderPillar('년주', analysis.saju.년주, '年柱')}
          </View>
          <Text style={styles.dayGanNote}>
            ★ 일간(日干): {analysis.saju.일주.천간} ({analysis.일간음양} {analysis.일간오행}) - 나를 나타내는 글자
          </Text>
        </View>
        <View style={styles.totalFortuneCard}>
          <Text style={styles.totalFortuneTitle}>🍌 전체 총운</Text>
          <Text style={styles.totalFortuneGan}>{detailed.personality.summary}</Text>
          <View style={styles.totalFortuneStats}>
            <View style={styles.totalFortuneStat}>
              <Text style={styles.totalFortuneStatLabel}>재물</Text>
              <Text style={styles.totalFortuneStatValue}>{isWealthy ? '★★★' : '★★'}</Text>
            </View>
            <View style={styles.totalFortuneStat}>
              <Text style={styles.totalFortuneStatLabel}>오행</Text>
              <Text style={styles.totalFortuneStatValue}>{isLucky ? '균형' : '편중'}</Text>
            </View>
            <View style={styles.totalFortuneStat}>
              <Text style={styles.totalFortuneStatLabel}>별자리</Text>
              <Text style={styles.totalFortuneStatValue}>{astrologyResult.sunSign.sign}</Text>
            </View>
          </View>
          <Text style={styles.subTitle}>{'📅 올해 총운'}</Text>
          <Text style={styles.totalFortuneBody}>{detailed.yearlyFortune.summary}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🐵 {MONKEY_SECTION_COMMENTS.personality.title}</Text>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>{detailed.personality.summary}</Text>
          </View>
          <Text style={styles.bodyText}>{detailed.personality.personality}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>💪 강점</Text>
            <Text style={styles.bodyText}>{detailed.personality.strength}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>⚡ 약점</Text>
            <Text style={styles.bodyText}>{detailed.personality.weakness}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>💡 조언</Text>
            <Text style={styles.adviceText}>{detailed.personality.advice}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🍌 {MONKEY_SECTION_COMMENTS.wealth.title}</Text>
          <Text style={styles.bodyText}>{detailed.wealth.overall}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>📈 돈 버는 스타일</Text>
            <Text style={styles.bodyText}>{detailed.wealth.earningStyle}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🛍 소비 패턴</Text>
            <Text style={styles.bodyText}>{detailed.wealth.spendingStyle}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>💡 투자 조언</Text>
            <Text style={styles.adviceText}>{detailed.wealth.investmentAdvice}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🐵 {MONKEY_SECTION_COMMENTS.career.title}</Text>
          <Text style={styles.bodyText}>{detailed.career.overall}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🎯 적합한 직업</Text>
            <View style={styles.tagsRow}>
              {detailed.career.suitableFields.map((field, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{field}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🔧 업무 스타일</Text>
            <Text style={styles.bodyText}>{detailed.career.workStyle}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>💡 커리어 조언</Text>
            <Text style={styles.adviceText}>{detailed.career.careerAdvice}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💘 {MONKEY_SECTION_COMMENTS.love.title}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>💘 연애 스타일</Text>
            <Text style={styles.bodyText}>{detailed.love.loveStyle}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>👫 이상적인 상대</Text>
            <Text style={styles.bodyText}>{detailed.love.idealPartner}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>💒 결혼 후</Text>
            <Text style={styles.bodyText}>{detailed.love.marriageAdvice}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>⚠ 연애 주의점</Text>
            <Text style={styles.adviceText}>{detailed.love.cautionInLove}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💊 {MONKEY_SECTION_COMMENTS.health.title}</Text>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>🏋 체질</Text>
            <Text style={styles.bodyText}>{detailed.health.bodyType}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>⚠ 취약 장기</Text>
            <Text style={styles.bodyText}>{detailed.health.weakOrgans}</Text>
          </View>
          <View style={styles.subSection}>
            <Text style={styles.subTitle}>💊 건강 관리법</Text>
            <Text style={styles.bodyText}>{detailed.health.healthAdvice}</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceTitle}>🧘 스트레스 해소법</Text>
            <Text style={styles.adviceText}>{detailed.health.stressRelief}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🍌 {MONKEY_SECTION_COMMENTS.ohaeng.title}</Text>
          {ohaengEntries.map(([label, value]) => (
            <View style={styles.ohaengBarRow} key={label}>
              <Text style={[styles.ohaengBarLabel, { color: OHAENG_COLORS[label] }]}>
                {OHAENG_HANJA[label]} {label}
              </Text>
              <View style={styles.ohaengBarTrack}>
                <View style={[styles.ohaengBarFill, { width: `${maxOH > 0 ? (value / maxOH) * 100 : 0}%`, backgroundColor: OHAENG_COLORS[label] }]} />
              </View>
              <Text style={styles.ohaengBarValue}>{value}</Text>
            </View>
          ))}
          {detailed.ohaengAdvice.excessElement && (
            <View style={styles.subSection}>
              <Text style={styles.subTitle}>🔺 {detailed.ohaengAdvice.excessElement} 오행 과다</Text>
              <Text style={styles.bodyText}>{detailed.ohaengAdvice.excessText}</Text>
            </View>
          )}
          {detailed.ohaengAdvice.lackElement && (
            <View style={styles.subSection}>
              <Text style={styles.subTitle}>🔻 {detailed.ohaengAdvice.lackElement} 오행 부족</Text>
              <Text style={styles.bodyText}>{detailed.ohaengAdvice.lackText}</Text>
            </View>
          )}
          {detailed.ohaengAdvice.supplementText && (
            <View style={styles.adviceBox}>
              <Text style={styles.adviceTitle}>💡 오행 보완법</Text>
              <Text style={styles.adviceText}>{detailed.ohaengAdvice.supplementText}</Text>
            </View>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔬 {MONKEY_SECTION_COMMENTS.sipsin.title}</Text>
          <View style={styles.sipsinGrid}>
            {detailed.sipsinSummary.allSipsin
              .filter((item) => !isUnknownTime || !item.position.includes('시주'))
              .map((item, i) => (
              <View key={i} style={styles.sipsinGridItem}>
                <Text style={styles.sipsinPosition}>{item.position}</Text>
                <Text style={styles.sipsinName}>{item.sipsin}</Text>
                <Text style={styles.sipsinKeyword}>{item.keyword}</Text>
              </View>
            ))}
          </View>
          {detailed.sipsinSummary.dominant && (
            <View style={styles.subSection}>
              <Text style={styles.subTitle}>⭐ 핵심 십신: {detailed.sipsinSummary.dominant}</Text>
              <Text style={styles.bodyText}>{detailed.sipsinSummary.dominantMeaning}</Text>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>{detailed.sipsinSummary.dominantInLife}</Text>
            </View>
          )}
        </View>
        {/* ========== 올해 운세 (상세) ========== */}
        {renderYearlyFortuneDetail(detailed.yearlyFortuneDetail)}
        {/* ========== 대운 흐름 ========== */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🗺 {MONKEY_SECTION_COMMENTS.daeun.title}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.daeunRow}>
              {analysis.대운.slice(0, 8).map((du, i) => (
                <View key={i} style={styles.daeunItem}>
                  <Text style={styles.daeunAge}>{du.시작나이}세</Text>
                  <View style={[styles.daeunBox, { borderColor: OHAENG_COLORS[du.오행] }]}>
                    <Text style={styles.daeunGan}>{CHEON_GAN_HANJA[du.천간]}</Text>
                    <Text style={styles.daeunJi}>{JI_JI_HANJA[du.지지]}</Text>
                  </View>
                  <Text style={[styles.daeunOH, { color: OHAENG_COLORS[du.오행] }]}>{du.오행}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          {detailed.daeunInterpretations.map((du, i) => (
            <View key={i} style={styles.daeunDetail}>
              <View style={styles.daeunDetailHeader}>
                <View style={[styles.daeunDot, { backgroundColor: OHAENG_COLORS[du.ohaeng] }]} />
                <Text style={styles.daeunDetailTitle}>{du.age}세 대운 ({du.gan}{du.ji} / {du.ohaeng}운)</Text>
              </View>
              <Text style={styles.daeunPositive}>{du.positive}</Text>
              <Text style={styles.daeunNegative}>{du.negative}</Text>
              <Text style={styles.daeunAdviceText}>{du.advice}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⭐ {MONKEY_SECTION_COMMENTS.astrology.title}</Text>
          <View style={styles.zodiacHeader}>
            <Text style={styles.zodiacSymbol}>{astrologyResult.sunSign.symbol}</Text>
            <View>
              <Text style={styles.zodiacName}>{astrologyResult.sunSign.sign}</Text>
              <Text style={styles.zodiacNameEn}>{astrologyResult.sunSign.signEn}</Text>
            </View>
          </View>
          <View style={styles.zodiacInfo}>
            <View style={styles.zodiacInfoItem}>
              <Text style={styles.zodiacInfoLabel}>원소</Text>
              <Text style={styles.zodiacInfoValue}>{ELEMENT_EMOJI[astrologyResult.sunSign.element]} {astrologyResult.sunSign.element}</Text>
            </View>
            <View style={styles.zodiacInfoItem}>
              <Text style={styles.zodiacInfoLabel}>특성</Text>
              <Text style={styles.zodiacInfoValue}>{astrologyResult.sunSign.modality}</Text>
            </View>
            <View style={styles.zodiacInfoItem}>
              <Text style={styles.zodiacInfoLabel}>수호성</Text>
              <Text style={styles.zodiacInfoValue}>{astrologyResult.sunSign.rulingPlanet}</Text>
            </View>
          </View>
          <View style={styles.tagsRow}>
            {astrologyResult.sunSign.traits.map((trait, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🌟 {MONKEY_SECTION_COMMENTS.ziwei.title}</Text>
          <View style={styles.ziweiHeader}>
            <View style={styles.ziweiHeaderItem}>
              <Text style={styles.ziweiHeaderLabel}>명궁</Text>
              <Text style={styles.ziweiHeaderValue}>{ziweiResult.명궁지지}궁</Text>
            </View>
            <View style={styles.ziweiHeaderItem}>
              <Text style={styles.ziweiHeaderLabel}>신궁</Text>
              <Text style={styles.ziweiHeaderValue}>{ziweiResult.신궁지지}궁</Text>
            </View>
          </View>
          <Text style={styles.subTitle}>12궁 주성 배치</Text>
          {ziweiResult.palaces.map((palace, i) => (
            <View key={i} style={styles.palaceRow}>
              <Text style={[styles.palaceName, i === 0 && styles.palaceNameHL]}>
                {palace.name} ({palace.branch})
              </Text>
              <View style={styles.palaceStars}>
                {palace.mainStars.length > 0 ? (
                  palace.mainStars.map((star, j) => (
                    <View key={j} style={[styles.starBadge, { backgroundColor: MAIN_STAR_COLORS[star] || COLORS.surfaceLight }]}>
                      <Text style={styles.starText}>{star}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noStar}>-</Text>
                )}
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>🐵 다른 바나나 까러 가기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  // 도파민 파티
  partyOverlay: {
    backgroundColor: COLORS.accent + '15',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  partyEmoji: { fontSize: 24, letterSpacing: 4 },
  partyText: {
    fontSize: 16, fontWeight: '900', color: COLORS.accent,
    textAlign: 'center', marginVertical: SPACING.sm, lineHeight: 24,
  },
  // 원숭이 말풍선
  monkeyBubble: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: SPACING.md, gap: SPACING.sm,
  },
  monkeyFace: { fontSize: 40 },
  monkeySpeech: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, borderTopLeftRadius: 4,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  monkeySpeechText: {
    fontSize: 14, color: COLORS.accent, lineHeight: 22, fontWeight: '600',
  },
  totalFortuneCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  totalFortuneTitle: {
    fontSize: 20, fontWeight: '900', color: COLORS.accent, textAlign: 'center', marginBottom: SPACING.sm,
  },
  totalFortuneGan: {
    fontSize: 28, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: 4,
  },
  totalFortuneSummary: {
    fontSize: 14, color: COLORS.primaryLight, textAlign: 'center', marginBottom: SPACING.md, fontWeight: '600',
  },
  totalFortuneStats: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md,
    backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
  },
  totalFortuneStat: { alignItems: 'center' },
  totalFortuneStatLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  totalFortuneStatValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  totalFortuneBody: {
    fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg,
  },
  // 사주 팔자
  pillarsRow: { flexDirection: 'row', justifyContent: 'space-around', gap: SPACING.sm },
  pillar: { alignItems: 'center', flex: 1 },
  pillarLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  pillarSubLabel: { fontSize: 10, color: COLORS.textMuted, marginBottom: SPACING.sm },
  ganjiBox: {
    width: '100%', aspectRatio: 1.1, borderRadius: BORDER_RADIUS.md,
    borderWidth: 0,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  ganjiHanja: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  ganjiKor: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  ohaengBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm, marginTop: 3 },
  ohaengBadgeText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  animalText: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  unknownTimeBanner: {
    backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.warning + '40',
  },
  unknownTimeBannerText: { fontSize: 12, color: COLORS.warning, textAlign: 'center', lineHeight: 18 },
  pillarUnknown: { alignItems: 'center', flex: 1, opacity: 0.4 },
  ganjiBoxUnknown: {
    width: '100%', aspectRatio: 0.75, borderRadius: BORDER_RADIUS.md,
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  unknownMark: { fontSize: 28, fontWeight: '700', color: COLORS.textMuted },
  dayGanNote: {
    fontSize: 13, color: COLORS.accent, textAlign: 'center', marginTop: SPACING.md, fontWeight: '600',
  },
  // 본문 텍스트
  bodyText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 24 },
  subSection: { marginTop: SPACING.lg },
  subTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  // 요약 뱃지
  summaryBadge: {
    backgroundColor: COLORS.primary + '20', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  summaryBadgeText: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '600' },
  // 조언 박스
  adviceBox: {
    backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.lg,
    borderLeftWidth: 3, borderLeftColor: COLORS.accent,
  },
  adviceTitle: { fontSize: 14, fontWeight: '700', color: COLORS.accent, marginBottom: SPACING.xs },
  adviceText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  // 태그
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: {
    backgroundColor: COLORS.surfaceLight, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
  },
  tagText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  // 오행 바
  ohaengBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  ohaengBarLabel: { width: 60, fontSize: 14, fontWeight: '600' },
  ohaengBarTrack: {
    flex: 1, height: 16, backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.sm, overflow: 'hidden', marginHorizontal: SPACING.sm,
  },
  ohaengBarFill: { height: '100%', borderRadius: BORDER_RADIUS.sm },
  ohaengBarValue: { width: 30, fontSize: 14, color: COLORS.text, textAlign: 'right', fontWeight: '600' },
  // 십신 그리드
  sipsinGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md,
  },
  sipsinGridItem: {
    width: '47%', backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  sipsinPosition: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  sipsinName: { fontSize: 15, fontWeight: '700', color: COLORS.primaryLight },
  sipsinKeyword: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  // 올해 운세
  yearPriceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md,
  },
  yearPriceLeft: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  yearPriceEmoji: { fontSize: 28 },
  yearPriceGrade: {
    fontSize: 18, fontWeight: '900', color: COLORS.accent,
  },
  yearPriceValue: {
    fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: 1,
  },
  yearBadge: {
    backgroundColor: COLORS.secondary + '20', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  yearBadgeText: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  // 대운
  daeunRow: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.xs },
  daeunItem: { alignItems: 'center', width: 55 },
  daeunAge: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  daeunBox: {
    width: 48, height: 60, borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5, backgroundColor: COLORS.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  daeunGan: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  daeunJi: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, marginTop: 2 },
  daeunOH: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  daeunDetail: {
    marginTop: SPACING.md, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  daeunDetailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  daeunDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  daeunDetailTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  daeunPositive: { fontSize: 13, color: COLORS.success, lineHeight: 20, marginBottom: 4 },
  daeunNegative: { fontSize: 13, color: COLORS.warning, lineHeight: 20, marginBottom: 4 },
  daeunAdviceText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  // 점성술
  zodiacHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  zodiacSymbol: { fontSize: 48 },
  zodiacName: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  zodiacNameEn: { fontSize: 14, color: COLORS.textMuted },
  zodiacInfo: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  zodiacInfoItem: { alignItems: 'center' },
  zodiacInfoLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  zodiacInfoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  // 자미두수
  ziweiHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  ziweiHeaderItem: {
    alignItems: 'center', backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary,
  },
  ziweiHeaderLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  ziweiHeaderValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  palaceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  palaceName: { fontSize: 13, color: COLORS.textSecondary, width: 90, fontWeight: '500' },
  palaceNameHL: { color: COLORS.accent, fontWeight: '700' },
  palaceStars: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' },
  starBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.sm },
  starText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  noStar: { fontSize: 13, color: COLORS.textMuted },
  // 올해 운세 상세
  yearHeaderBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  yearHeaderAnimal: { fontSize: 48 },
  yearHeaderInfo: { flex: 1 },
  yearHeaderTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  yearHeaderSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  sipsinBadge: {
    backgroundColor: COLORS.primary + '30', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
  },
  sipsinBadgeText: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '600' },
  fortuneScoreGrid: { gap: SPACING.sm },
  scoreBarContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  scoreBarLabel: { width: 56, fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  scoreBarTrack: {
    flex: 1, height: 14, backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.sm, overflow: 'hidden', marginHorizontal: SPACING.sm,
  },
  scoreBarFill: { height: '100%', borderRadius: BORDER_RADIUS.sm },
  scoreBarValue: { width: 36, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  monkeyMini: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.md,
  },
  monkeyMiniEmoji: { fontSize: 24 },
  monkeyMiniText: { flex: 1, fontSize: 13, color: COLORS.accent, fontWeight: '600', lineHeight: 20 },
  fortuneScoreBig: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  fortuneScoreBigNum: { fontSize: 48, fontWeight: '900', color: COLORS.accent },
  fortuneScoreBigLabel: { fontSize: 20, fontWeight: '600', color: COLORS.textMuted, marginLeft: 4 },
  jijiSection: { marginTop: SPACING.lg },
  jijiItem: {
    backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm, marginBottom: SPACING.sm,
    borderLeftWidth: 3,
  },
  jijiType: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  jijiMeaning: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  luckyRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.lg,
    backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  luckyItem: { alignItems: 'center' },
  luckyLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4 },
  luckyValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  // 하단
  backBtn: { paddingVertical: 16, alignItems: 'center' },
  backBtnText: { color: COLORS.primaryLight, fontSize: 16, fontWeight: '600' },
});
