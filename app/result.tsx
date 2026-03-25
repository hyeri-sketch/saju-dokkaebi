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
        <View style={[styles.ganjiBox, { borderColor: OHAENG_COLORS[ganOH] }]}>
          <Text style={styles.ganjiHanja}>{CHEON_GAN_HANJA[ganji.천간]}</Text>
          <Text style={styles.ganjiKor}>{ganji.천간}</Text>
          <View style={[styles.ohaengBadge, { backgroundColor: OHAENG_COLORS[ganOH] }]}>
            <Text style={styles.ohaengBadgeText}>{OHAENG_HANJA[ganOH]}</Text>
          </View>
        </View>
        <View style={[styles.ganjiBox, { borderColor: OHAENG_COLORS[jiOH] }]}>
          <Text style={styles.ganjiHanja}>{JI_JI_HANJA[ganji.지지]}</Text>
          <Text style={styles.ganjiKor}>{ganji.지지}</Text>
          <View style={[styles.ohaengBadge, { backgroundColor: OHAENG_COLORS[jiOH] }]}>
            <Text style={styles.ohaengBadgeText}>{OHAENG_HANJA[jiOH]}</Text>
          </View>
        </View>
        <Text style={styles.animalText}>{JI_JI_ANIMAL[ganji.지지]}</Text>
      </View>
    );
  };

  const ohaengEntries = Object.entries(analysis.오행분석) as [OHaeng, number][];
  const maxOH = Math.max(...ohaengEntries.map(([, v]) => v));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>{/* 도파민 파티 */}
        {showParty && (
          <Animated.View style={[styles.partyOverlay, { opacity: partyAnim }]}>
            <Text style={styles.partyEmoji}>🎉🐵🎆🍌🎊🐵🎉</Text>
            <Text style={styles.partyText}>{getRandomItem(DOPAMINE_PARTY_LINES)}</Text>
            <Text style={styles.partyEmoji}>🎆🍌🎉🐵🎊🍌🎆</Text>
          </Animated.View>
        )}
        {/* 원숭이 오프닝 */}
        <View style={styles.monkeyBubble}>
          <Text style={styles.monkeyFace}>🐵</Text>
          <View style={styles.monkeySpeech}>
            <Text style={styles.monkeySpeechText}>{opening}</Text>
          </View>
        </View>
        {/* ========== 사주 팔자 표 ========== */}
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
        {/* ========== 성격 분석 ========== */}
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
        {/* ========== 재물운 ========== */}
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
        {/* ========== 직업운 ========== */}
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
        {/* ========== 연애/결혼운 ========== */}
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
        {/* ========== 건강운 ========== */}
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
        {/* ========== 오행 분석 ========== */}
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
        {/* ========== 십신 분석 ========== */}
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
        {/* ========== 올해 운세 ========== */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 {MONKEY_SECTION_COMMENTS.yearly.title} ({detailed.yearlyFortune.currentYear})</Text>
          <View style={styles.yearBadge}>
            <Text style={styles.yearBadgeText}>
              {detailed.yearlyFortune.yearGan}{detailed.yearlyFortune.yearJi}년 ({detailed.yearlyFortune.yearOHaeng} 기운)
            </Text>
          </View>
          <Text style={styles.bodyText}>{detailed.yearlyFortune.summary}</Text>
        </View>
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
        {/* ========== 서양 점성술 ========== */}
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
        {/* ========== 자미두수 ========== */}
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
        {/* 돌아가기 */}
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
    width: '100%', aspectRatio: 0.75, borderRadius: BORDER_RADIUS.md,
    borderWidth: 2, backgroundColor: COLORS.surfaceLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  ganjiHanja: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  ganjiKor: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  ohaengBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm, marginTop: 4 },
  ohaengBadgeText: { fontSize: 10, fontWeight: '700', color: '#000' },
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
  yearBadge: {
    backgroundColor: COLORS.secondary + '20', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  yearBadgeText: { fontSize: 14, color: COLORS.secondary, fontWeight: '600' },
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
  // 하단
  backBtn: { paddingVertical: 16, alignItems: 'center' },
  backBtnText: { color: COLORS.primaryLight, fontSize: 16, fontWeight: '600' },
});
