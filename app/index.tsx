import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SPACING } from '../src/constants/theme';

const monkey1 = require('../assets/images/monkey_left.png');
const monkey2 = require('../assets/images/monkey_right.png');

// 레퍼런스 기반 커버 컬러 팔레트
const C = {
  sky: '#4EC5F1',
  skyLight: '#7DD8F7',
  cloud: '#FFFFFF',
  grass: '#3DAD3A',
  grassDark: '#2D8A2B',
  grassLight: '#5DC45B',
  title: '#FFFFFF',
  titleStroke: '#2B7CB5',
  accent: '#E84393',
  accentLight: '#F78FB3',
  star: '#D980FA',
  btnBg: '#FFD43B',
  btnText: '#2B7CB5',
  brown: '#5D4037',
};

export default function CoverScreen() {
  const router = useRouter();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [monkeyFrame, setMonkeyFrame] = useState(0);
  const cloudAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setMonkeyFrame((prev) => (prev === 0 ? 1 : 0));
    }, 400);

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -14,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 구름 흘러가는 애니메이션
    Animated.loop(
      Animated.timing(cloudAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => clearInterval(frameInterval);
  }, []);

  const cloudTranslate = cloudAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <View style={styles.container}>
      {/* 구름 레이어 */}
      <Animated.View style={[styles.cloudLayer, { transform: [{ translateX: cloudTranslate }] }]}>
        <View style={[styles.cloud, { top: 80, left: 30, width: 100, height: 40 }]} />
        <View style={[styles.cloud, { top: 120, right: 40, width: 80, height: 32 }]} />
        <View style={[styles.cloud, { top: 60, right: 100, width: 60, height: 24 }]} />
      </Animated.View>

      {/* 메인 콘텐츠 */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.stars}>★ ★ ★ ★ ★</Text>

        <Animated.View
          style={[styles.monkeyWrap, { transform: [{ translateY: bounceAnim }] }]}
        >
          <Image
            source={monkeyFrame === 0 ? monkey1 : monkey2}
            style={styles.monkeyImage}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.titleWrap}>
          <Text style={styles.titleMain}>도키도키</Text>
          <Text style={styles.titleMain}>우끼끼 포춘몽키</Text>
        </View>
        <Text style={styles.subtitle}>도파민 원숭이의 사주 바나나 감정소</Text>

        <Text style={styles.desc}>
          넌 어떤 바나나야?{'\n'}
          운세를 까줄게 🍌
        </Text>

        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.startBtnText}>🍌  TAP TO START  🍌</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 잔디 바닥 */}
      <View style={styles.grassWrap}>
        <View style={styles.grassTop} />
        <View style={styles.grassBody} />
      </View>

      <Text style={styles.version}>v1.0 · 포춘몽키</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.sky,
  },
  // 구름
  cloudLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: C.cloud,
    borderRadius: 999,
    opacity: 0.7,
  },
  // 메인 콘텐츠
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 80,
  },
  stars: {
    fontSize: 20,
    color: C.star,
    letterSpacing: 6,
    marginBottom: SPACING.md,
    fontWeight: '900',
  },
  monkeyWrap: {
    marginBottom: SPACING.md,
  },
  monkeyImage: {
    width: 130,
    height: 130,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleMain: {
    fontSize: 26,
    fontWeight: '900',
    color: C.title,
    textAlign: 'center',
    lineHeight: 36,
    textShadowColor: C.titleStroke,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.btnBg,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  desc: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  startBtn: {
    backgroundColor: C.btnBg,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E6B800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 6,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: C.btnText,
    letterSpacing: 2,
  },
  // 잔디
  grassWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  grassTop: {
    height: 8,
    backgroundColor: C.grassLight,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  grassBody: {
    height: 60,
    backgroundColor: C.grass,
  },
  version: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    fontSize: 11,
    color: C.grassDark,
    fontWeight: '600',
  },
});
