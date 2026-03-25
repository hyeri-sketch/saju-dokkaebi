import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { calculateSaju, getBasicInterpretation } from '../src/lib/saju-engine';
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
  }>();

  const analysis = useMemo(() => {
    const input: BirthInput = {
      year: parseInt(params.year || '1990'),
      month: parseInt(params.month || '1'),
      day: parseInt(params.day || '1'),
      hour: parseInt(params.hour || '12'),
      minute: parseInt(params.minute || '0'),
      isLunar: params.isLunar === 'true',
      gender: (params.gender as '남' | '여') || '남',
    };
    return calculateSaju(input);
  }, [params]);

  const interpretation = useMemo(() => getBasicInterpretation(analysis), [analysis]);

  // 점성술 계산 (양력 기준)
  const astrologyResult = useMemo(() => {
    const solarMonth = parseInt(params.month || '1');
    const solarDay = parseInt(params.day || '1');
    return calculateAstrology(solarMonth, solarDay);
  }, [params]);

  // 자미두수 계산 (음력 기준)
  const ziweiResult = useMemo(() => {
    const year = parseInt(params.year || '1990');
    const month = parseInt(params.month || '1');
    const day = parseInt(params.day || '1');
    const hour = parseInt(params.hour || '12');
    const hourBranchIndex = hour === 23 || hour === 0 ? 0 : Math.floor((hour + 1) / 2);
    const gender = (params.gender as '남' | '여') || '남';
    return calculateZiwei(year, month, day, hourBranchIndex, gender);
  }, [params]);

  const renderPillar = (label: string, ganji: GanJi, subLabel?: string) => {
    const ganOHaeng = CHEON_GAN_OHAENG[ganji.천간];
    const jiOHaeng = JI_JI_OHAENG[ganji.지지];

    return (
      <View style={styles.pillar}>
        <Text style={styles.pillarLabel}>{label}</Text>
        {subLabel && <Text style={styles.pillarSubLabel}>{subLabel}</Text>}
        {/* 천간 */}
        <View style={[styles.ganjiBox, { borderColor: OHAENG_COLORS[ganOHaeng] }]}>
          <Text style={styles.ganjiHanja}>{CHEON_GAN_HANJA[ganji.천간]}</Text>
          <Text style={styles.ganjiKor}>{ganji.천간}</Text>
          <View style={[styles.ohaengBadge, { backgroundColor: OHAENG_COLORS[ganOHaeng] }]}>
            <Text style={styles.ohaengText}>{OHAENG_HANJA[ganOHaeng]}</Text>
          </View>
        </View>
        {/* 지지 */}
        <View style={[styles.ganjiBox, { borderColor: OHAENG_COLORS[jiOHaeng] }]}>
          <Text style={styles.ganjiHanja}>{JI_JI_HANJA[ganji.지지]}</Text>
          <Text style={styles.ganjiKor}>{ganji.지지}</Text>
          <View style={[styles.ohaengBadge, { backgroundColor: OHAENG_COLORS[jiOHaeng] }]}>
            <Text style={styles.ohaengText}>{OHAENG_HANJA[jiOHaeng]}</Text>
          </View>
        </View>
        <Text style={styles.animalText}>
          {JI_JI_ANIMAL[ganji.지지]}
        </Text>
      </View>
    );
  };

  const renderOHaengBar = (label: OHaeng, value: number, maxValue: number) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <View style={styles.ohaengBarRow} key={label}>
        <Text style={[styles.ohaengBarLabel, { color: OHAENG_COLORS[label] }]}>
          {OHAENG_HANJA[label]} {label}
        </Text>
        <View style={styles.ohaengBarTrack}>
          <View
            style={[
              styles.ohaengBarFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: OHAENG_COLORS[label],
              },
            ]}
          />
        </View>
        <Text style={styles.ohaengBarValue}>{value}</Text>
      </View>
    );
  };

  const ohaengEntries = Object.entries(analysis.오행분석) as [OHaeng, number][];
  const maxOHaeng = Math.max(...ohaengEntries.map(([, v]) => v));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 사주 팔자 표 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏛 사주팔자 (四柱八字)</Text>
          <View style={styles.pillarsRow}>
            {renderPillar('시주', analysis.saju.시주, '時柱')}
            {renderPillar('일주', analysis.saju.일주, '日柱')}
            {renderPillar('월주', analysis.saju.월주, '月柱')}
            {renderPillar('년주', analysis.saju.년주, '年柱')}
          </View>
          <Text style={styles.dayGanNote}>
            ★ 일간(日干): {analysis.saju.일주.천간} ({analysis.일간음양} {analysis.일간오행}) - 나를 나타내는 글자
          </Text>
        </View>

        {/* 십신 분석 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔮 십신 (十神) 분석</Text>
          <View style={styles.sipsinRow}>
            <View style={styles.sipsinItem}>
              <Text style={styles.sipsinLabel}>시주</Text>
              <Text style={styles.sipsinGan}>{analysis.십신분석.시주천간}</Text>
              <Text style={styles.sipsinJi}>{analysis.십신분석.시주지지}</Text>
            </View>
            <View style={styles.sipsinItem}>
              <Text style={styles.sipsinLabel}>일주</Text>
              <Text style={styles.sipsinGan}>{analysis.십신분석.일주천간}</Text>
              <Text style={styles.sipsinJi}>{analysis.십신분석.일주지지}</Text>
            </View>
            <View style={styles.sipsinItem}>
              <Text style={styles.sipsinLabel}>월주</Text>
              <Text style={styles.sipsinGan}>{analysis.십신분석.월주천간}</Text>
              <Text style={styles.sipsinJi}>{analysis.십신분석.월주지지}</Text>
            </View>
            <View style={styles.sipsinItem}>
              <Text style={styles.sipsinLabel}>년주</Text>
              <Text style={styles.sipsinGan}>{analysis.십신분석.년주천간}</Text>
              <Text style={styles.sipsinJi}>{analysis.십신분석.년주지지}</Text>
            </View>
          </View>
        </View>

        {/* 오행 분석 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🌊 오행 (五行) 분석</Text>
          {ohaengEntries.map(([label, value]) => renderOHaengBar(label, value, maxOHaeng))}
        </View>

        {/* 대운 흐름 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🌀 대운 (大運) 흐름</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.daeunRow}>
              {analysis.대운.slice(0, 8).map((du, i) => (
                <View key={i} style={styles.daeunItem}>
                  <Text style={styles.daeunAge}>{du.시작나이}세</Text>
                  <View style={[styles.daeunBox, { borderColor: OHAENG_COLORS[du.오행] }]}>
                    <Text style={styles.daeunGan}>
                      {CHEON_GAN_HANJA[du.천간]}
                    </Text>
                    <Text style={styles.daeunJi}>
                      {JI_JI_HANJA[du.지지]}
                    </Text>
                  </View>
                  <Text style={[styles.daeunOH, { color: OHAENG_COLORS[du.오행] }]}>
                    {du.오행}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 기본 해석 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📖 기본 해석</Text>
          <Text style={styles.interpretationText}>{interpretation}</Text>
        </View>

        {/* 서양 점성술 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⭐ 서양 점성술</Text>
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
              <Text style={styles.zodiacInfoValue}>
                {ELEMENT_EMOJI[astrologyResult.sunSign.element]} {astrologyResult.sunSign.element}
              </Text>
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
          <View style={styles.traitsContainer}>
            {astrologyResult.sunSign.traits.map((trait, i) => (
              <View key={i} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
          {/* 원소 균형 */}
          <Text style={styles.subSectionTitle}>원소 균형</Text>
          {(Object.entries(astrologyResult.elementBalance) as [Element, number][]).map(([el, val]) => (
            <View style={styles.ohaengBarRow} key={el}>
              <Text style={[styles.ohaengBarLabel, { color: ELEMENT_COLORS[el] }]}>
                {ELEMENT_EMOJI[el]} {el}
              </Text>
              <View style={styles.ohaengBarTrack}>
                <View style={[styles.ohaengBarFill, { width: `${(val / 6) * 100}%`, backgroundColor: ELEMENT_COLORS[el] }]} />
              </View>
              <Text style={styles.ohaengBarValue}>{val}</Text>
            </View>
          ))}
        </View>

        {/* 자미두수 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🌟 자미두수 (紫微斗數)</Text>
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
          {/* 12궁 배치 */}
          <Text style={styles.subSectionTitle}>12궁 주성 배치</Text>
          {ziweiResult.palaces.map((palace, i) => (
            <View key={i} style={styles.palaceRow}>
              <Text style={[styles.palaceName, i === 0 && styles.palaceNameHighlight]}>
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

        {/* AI 해석 버튼 */}
        <TouchableOpacity style={styles.aiBtn} disabled>
          <Text style={styles.aiBtnText}>🤖 AI 상세 해석 (준비 중)</Text>
        </TouchableOpacity>

        {/* 돌아가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← 다시 분석하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  // 사주 팔자 표
  pillarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.sm,
  },
  pillar: {
    alignItems: 'center',
    flex: 1,
  },
  pillarLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  pillarSubLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  ganjiBox: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ganjiHanja: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  ganjiKor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ohaengBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 4,
  },
  ohaengText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  animalText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dayGanNote: {
    fontSize: 13,
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  // 십신
  sipsinRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sipsinItem: {
    alignItems: 'center',
    flex: 1,
  },
  sipsinLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  sipsinGan: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  sipsinJi: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  // 오행 바
  ohaengBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ohaengBarLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: '600',
  },
  ohaengBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  ohaengBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  ohaengBarValue: {
    width: 30,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    fontWeight: '600',
  },
  // 대운
  daeunRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  daeunItem: {
    alignItems: 'center',
    width: 55,
  },
  daeunAge: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  daeunBox: {
    width: 48,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daeunGan: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  daeunJi: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  daeunOH: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  // 해석
  interpretationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  // 점성술
  zodiacHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  zodiacSymbol: {
    fontSize: 48,
  },
  zodiacName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  zodiacNameEn: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  zodiacInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  zodiacInfoItem: {
    alignItems: 'center',
  },
  zodiacInfoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  zodiacInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  traitBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  traitText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  // 자미두수
  ziweiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  ziweiHeaderItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ziweiHeaderLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  ziweiHeaderValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  palaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  palaceName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 90,
    fontWeight: '500',
  },
  palaceNameHighlight: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  palaceStars: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-end',
  },
  starBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  starText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  noStar: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  // AI 버튼
  aiBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  aiBtnText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  // 돌아가기
  backBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backBtnText: {
    color: COLORS.primaryLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
