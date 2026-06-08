import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function HangmanCanvas({ wrongGuesses, size = 170, color = '#fff', strokeWidth = 1 }) {
  const s = strokeWidth;
  const lineStyle = { backgroundColor: color, shadowColor: color };
  const headStyle = { borderColor: color, shadowColor: color };
  const parts = [
    <View key="head" style={[styles.head, headStyle, { borderWidth: 4 * s, width: 20 + 4 * s, height: 20 + 4 * s, borderRadius: (20 + 4 * s) / 2 }]} />,
    <View key="body" style={[styles.body, lineStyle, { width: 5 * s, height: 60 * s }]} />,
    <View key="leftArm" style={[styles.arm, styles.leftArm, lineStyle, { width: 4 * s, height: 35 * s }]} />,
    <View key="rightArm" style={[styles.arm, styles.rightArm, lineStyle, { width: 4 * s, height: 35 * s }]} />,
    <View key="leftLeg" style={[styles.leg, styles.leftLeg, lineStyle, { width: 3 * s, height: 40 * s }]} />,
    <View key="rightLeg" style={[styles.leg, styles.rightLeg, lineStyle, { width: 3 * s, height: 40 * s }]} />,
  ];
  const scale = size / 200;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.gallows, { transform: [{ scale }] }]}>
        <View style={[styles.base, lineStyle, { height: 5 * s, width: 120, left: 20 }]} />
        <View style={[styles.pole, lineStyle, { width: 5 * s, height: 180 }]} />
        <View style={[styles.beam, lineStyle, { height: 5 * s, width: 100 }]} />
        <View style={[styles.rope, lineStyle, { width: 5 * s, height: 30 * s }]} />
        {parts.slice(0, wrongGuesses)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gallows: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  base: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#fff',
    width: 120,
    left: 20,
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  pole: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    width: 5,
    height: 180,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  beam: {
    position: 'absolute',
    top: 0,
    left: 30,
    width: 100,
    height: 5,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  rope: {
    position: 'absolute',
    top: 0,
    right: 66,
    width: 5,
    height: 30,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  head: {
    position: 'absolute',
    top: 28,
    right: 46,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  body: {
    position: 'absolute',
    top: 50,
    right: 55,
    width: 5,
    height: 60,
    backgroundColor: '#fff',
  },
  arm: {
    position: 'absolute',
    top: 58,
    width: 4,
    height: 35,
    backgroundColor: '#fff',
  },
  leftArm: {
    right: 78,
    transform: [{ rotate: '30deg' }],
  },
  rightArm: {
    right: 42,
    transform: [{ rotate: '-30deg' }],
  },
  leg: {
    position: 'absolute',
    top: 105,
    width: 3,
    height: 40,
    backgroundColor: '#fff',
  },
  leftLeg: {
    right: 70,
    transform: [{ rotate: '30deg' }],
  },
  rightLeg: {
    right: 46,
    transform: [{ rotate: '-30deg' }],
  },
});
