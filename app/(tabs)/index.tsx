import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState<'남' | '여'>('남');

  const handleSubmit = () => {
    if (!year || !month || !day || !hour) {
      Alert.alert('입력 오류', '생년월일시를 모두 입력해주세요.');
      return;
    }

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute || '0');

    if (y < 1900 || y > 2100) {
      Alert.alert('입력 오류', '년도는 1900~2100 사이로 입력해주세요.');
      return;
    }
    if (m < 1 || m > 12) {
      Alert.alert('입력 오류', '월은 1~12 사이로 입력해주세요.');
      return;
    }
    if (d < 1 || d > 31) {
      Alert.alert('입력 오류', '일은 1~31 사이로 입력해주세요.');
      return;
    }
    if (h < 0 || h > 23) {
      Alert.alert('입력 오류', '시는 0~23 사이로 입력해주세요.');
      return;
    }

    router.push({
      pathname: '/result',
      params: {
        year: y.toString(),
        month: m.toString(),
        day: d.toString(),
        hour: h.toString(),
        minute: min.toString(),
        isLunar: isLunar ? 'true' : 'false',
        gender,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>👹</Text>
          <Text style={styles.title}>사주도깨비</Text>
          <Text style={styles.subtitle}>당신의 사주팔자를 풀어드립니다</Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>생년월일시 입력</Text>

          {/* 성별 선택 */}
          <Text style={styles.label}>성별</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === '남' && styles.genderBtnActive]}
              onPress={() => setGender('남')}
            >
              <Text style={[styles.genderText, gender === '남' && styles.genderTextActive]}>
                남 ♂
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === '여' && styles.genderBtnActive]}
              onPress={() => setGender('여')}
            >
              <Text style={[styles.genderText, gender === '여' && styles.genderTextActive]}>
                여 ♀
              </Text>
            </TouchableOpacity>
          </View>

          {/* 양력/음력 선택 */}
          <Text style={styles.label}>달력 구분</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, !isLunar && styles.genderBtnActive]}
              onPress={() => setIsLunar(false)}
            >
              <Text style={[styles.genderText, !isLunar && styles.genderTextActive]}>양력</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, isLunar && styles.genderBtnActive]}
              onPress={() => setIsLunar(true)}
            >
              <Text style={[styles.genderText, isLunar && styles.genderTextActive]}>음력</Text>
            </TouchableOpacity>
          </View>

          {/* 생년월일 입력 */}
          <Text style={styles.label}>생년월일</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateInput}
                placeholder="1990"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={setYear}
              />
              <Text style={styles.dateUnit}>년</Text>
            </View>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateInput}
                placeholder="01"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                value={month}
                onChangeText={setMonth}
              />
              <Text style={styles.dateUnit}>월</Text>
            </View>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateInput}
                placeholder="15"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                value={day}
                onChangeText={setDay}
              />
              <Text style={styles.dateUnit}>일</Text>
            </View>
          </View>

          {/* 시간 입력 */}
          <Text style={styles.label}>태어난 시간</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateInput}
                placeholder="14"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                value={hour}
                onChangeText={setHour}
              />
              <Text style={styles.dateUnit}>시</Text>
            </View>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateInput}
                placeholder="30"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                value={minute}
                onChangeText={setMinute}
              />
              <Text style={styles.dateUnit}>분</Text>
            </View>
          </View>

          {/* 분석 버튼 */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>🔮 사주 분석하기</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📜 사주도깨비가 알려드리는 것</Text>
          <Text style={styles.infoText}>• 사주팔자 (년주, 월주, 일주, 시주)</Text>
          <Text style={styles.infoText}>• 오행 분석 (목, 화, 토, 금, 수)</Text>
          <Text style={styles.infoText}>• 십신 분석 (비견, 식신, 재성, 관성, 인성)</Text>
          <Text style={styles.infoText}>• 대운 흐름</Text>
          <Text style={styles.infoText}>• AI 기반 상세 해석</Text>
          <Text style={styles.infoText}>• 점성술 & 자미두수 (준비 중)</Text>
        </View>
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
  header: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  genderTextActive: {
    color: COLORS.text,
  },
  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dateInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
  },
  dateInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
    textAlign: 'center',
  },
  dateUnit: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 2,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 16,
    marginTop: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
});
