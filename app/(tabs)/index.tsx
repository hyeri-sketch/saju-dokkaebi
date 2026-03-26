import React, { useState, useMemo } from 'react';
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
import { HOME_STATUS_MESSAGES, getRandomItem } from '../../src/constants/monkey-lines';

export default function HomeScreen() {
  const statusMsg = useMemo(() => getRandomItem(HOME_STATUS_MESSAGES), []);
  const router = useRouter();

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState<'남' | '여'>('남');
  const [unknownTime, setUnknownTime] = useState(false);

  const handleSubmit = () => {
    if (!year || !month || !day) {
      Alert.alert('입력 오류', '생년월일을 모두 입력해주세요.');
      return;
    }
    if (!unknownTime && !hour) {
      Alert.alert('입력 오류', '태어난 시간을 입력하거나 "시간 모름"을 선택해주세요.');
      return;
    }

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = unknownTime ? -1 : parseInt(hour);
    const min = unknownTime ? 0 : parseInt(minute || '0');

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
    if (!unknownTime && (h < 0 || h > 23)) {
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
        unknownTime: unknownTime ? 'true' : 'false',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 헤더 - 야끼 원숭이 */}
        <View style={styles.header}>
          <Text style={styles.logo}>🐵</Text>
          <Text style={styles.title}>포춘야끼</Text>
          <Text style={styles.subtitle}>도파민 원숭이의 팩폭 펀치</Text>
          <View style={styles.statusBubble}>
            <Text style={styles.statusText}>{statusMsg}</Text>
          </View>
        </View>

        {/* 입력 폼 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍌 바나나 투척하기</Text>

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
          <View style={styles.timeLabelRow}>
            <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>태어난 시간</Text>
            <TouchableOpacity
              style={styles.unknownTimeBtn}
              onPress={() => {
                setUnknownTime(!unknownTime);
                if (!unknownTime) {
                  setHour('');
                  setMinute('');
                }
              }}
            >
              <View style={[styles.checkbox, unknownTime && styles.checkboxActive]}>
                {unknownTime && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.unknownTimeText, unknownTime && styles.unknownTimeTextActive]}>
                시간 모름
              </Text>
            </TouchableOpacity>
          </View>
          {unknownTime ? (
            <View style={styles.unknownTimeNotice}>
              <Text style={styles.unknownTimeNoticeText}>
                시간을 모르면 시주(時柱)를 제외한 년주·월주·일주 기반으로 분석합니다.
              </Text>
            </View>
          ) : (
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
          )}

          {/* 분석 버튼 */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>🍌 바나나 까기 시작!</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 - 원숭이 톤 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🐵 야끼가 까주는 것들</Text>
          <Text style={styles.infoText}>🍌 사주팔자 바나나 (년주·월주·일주·시주)</Text>
          <Text style={styles.infoText}>🍌 오행 밸런스 체크 (영양 분석)</Text>
          <Text style={styles.infoText}>🍌 십신 X-ray (바나나 속 DNA)</Text>
          <Text style={styles.infoText}>🍌 인생 바나나 로드맵 (대운)</Text>
          <Text style={styles.infoText}>🍌 성격·재물·직업·연애·건강 전부 까줌</Text>
          <Text style={styles.infoText}>🍌 서양 별자리 & 자미두수 바나나</Text>
          <Text style={[styles.infoText, { color: COLORS.textMuted, fontStyle: 'italic', marginTop: 8 }]}>
            * 운세 대박이면 도파민 파티 발동됨 🎉
          </Text>
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
  statusBubble: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
    maxWidth: '90%',
  },
  statusText: {
    fontSize: 13,
    color: COLORS.accent,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
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
  timeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  unknownTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  unknownTimeText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  unknownTimeTextActive: {
    color: COLORS.primaryLight,
  },
  unknownTimeNotice: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  unknownTimeNoticeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
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
