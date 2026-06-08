import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const CHARS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789';

export default function FlipClockText({ phrases }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentText, setCurrentText] = useState(phrases[0]);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        const nextIdx = (indexRef.current + 1) % phrases.length;
        indexRef.current = nextIdx;
        setCurrentText(phrases[nextIdx]);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [phrases, fadeAnim]);

  return (
    <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
      {currentText}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Courier',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
});