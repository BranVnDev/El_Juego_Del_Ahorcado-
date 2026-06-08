import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import HangmanCanvas from '../components/HangmanCanvas';
import FlipClockText from '../components/FlipClockText';

export default function SplashScreen({ onFinish }) {
  const dots = useRef([...Array(3)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        { delay: i * 200 }
      )
    );
    anims.forEach(a => a.start());
    const timer = setTimeout(onFinish, 9000);
    return () => { anims.forEach(a => a.stop()); clearTimeout(timer); };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <HangmanCanvas wrongGuesses={0} size={140} strokeWidth={2} />
      </View>
      <FlipClockText phrases={['ESPERO QUE TE DIVIERTAS', 'NO TE VAYAS A AHORCAR', 'SUERTE', 'A DIVINAR', 'QUE EMPIECE EL JUEGO']} />
      <View style={styles.dotsRow}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { opacity: dot }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    width: 170,
    height: 170,
    borderWidth: 6,
    borderColor: '#fff',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
