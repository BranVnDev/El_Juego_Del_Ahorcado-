import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

const LETTERS = [
  ['A','B','C','D','E','F','G','H','I','J'],
  ['K','L','M','N','Ñ','O','P','Q','R','S'],
  ['T','U','V','W','X','Y','Z'],
];

export default function Keyboard({ usedLetters, onPress, disabled, lightMode }) {
  const { width } = useWindowDimensions();
  const keySize = Math.max(25, Math.min(31, Math.floor((width - 40) / 10) - 4));
  const keyStyle = { width: keySize, height: Math.max(34, keySize + 8), borderRadius: 9 };

  return (
    <View style={styles.container}>
      {LETTERS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((letter) => {
            const used = usedLetters.includes(letter);
            return (
              <TouchableOpacity
                key={letter}
                style={[styles.key, keyStyle, used && styles.keyUsed, lightMode && styles.keyLight]}
                onPress={() => onPress(letter)}
                disabled={used || disabled}
              >
                <Text style={[styles.keyText, used && styles.keyTextUsed, lightMode && !used && { color: '#000' }]}>
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 6, alignItems: 'center', width: '100%', marginTop: 60 },
  row: { flexDirection: 'row', justifyContent: 'center', marginVertical: 1 },
  key: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1.5,
  },
  keyUsed: { borderColor: '#333', opacity: 0.3 },
  keyLight: { borderColor: '#ccc', backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
  keyText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Courier' },
  keyTextUsed: { color: '#333' },
});
