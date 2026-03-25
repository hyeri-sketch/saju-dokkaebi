import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>⚙️</Text>
        <Text style={styles.title}>설정</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>앱 정보</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>앱 이름</Text>
            <Text style={styles.rowValue}>사주도깨비</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>버전</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>기능 상태</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>사주팔자 계산</Text>
            <Text style={[styles.rowValue, { color: COLORS.success }]}>✓ 활성</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>오행 분석</Text>
            <Text style={[styles.rowValue, { color: COLORS.success }]}>✓ 활성</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>십신 분석</Text>
            <Text style={[styles.rowValue, { color: COLORS.success }]}>✓ 활성</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>AI 해석</Text>
            <Text style={[styles.rowValue, { color: COLORS.warning }]}>준비 중</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>서양 점성술</Text>
            <Text style={[styles.rowValue, { color: COLORS.warning }]}>준비 중</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>자미두수</Text>
            <Text style={[styles.rowValue, { color: COLORS.warning }]}>준비 중</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          사주도깨비 - 명리학 기반 사주 분석 앱{'\n'}
          참고용으로만 활용해주세요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 20,
  },
});
