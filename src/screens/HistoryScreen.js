import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { connect, disconnect, getSocket } from '../services/socket';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const url = 'http://192.168.1.79:3000';
    const socket = connect(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('get-history');
    });

    socket.on('history-data', (data) => {
      setHistory(data || []);
      setLoading(false);
    });

    socket.on('connect_error', () => {
      setLoading(false);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    });

    return () => disconnect();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HISTORIAL</Text>

      {loading ? (
        <Text style={styles.loading}>CARGANDO...</Text>
      ) : history.length === 0 ? (
        <Text style={styles.empty}>SIN PARTIDAS REGISTRADAS</Text>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {history.map((g, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.date}>{g.fecha}</Text>
              <Text style={styles.score}>
                J1 {g.scores[0]} - {g.scores[1]} J2
              </Text>
              <Text style={[styles.winner, g.winner === 1 ? styles.win : styles.lose]}>
                GANADOR: JUGADOR {g.winner}{g.motivo ? ` · ${g.motivo}` : ''}
              </Text>
              {g.palabra ? (
                <Text style={styles.word}>PALABRA: {g.palabra}</Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>VOLVER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 20,
  },
  loading: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    letterSpacing: 3,
    fontSize: 14,
  },
  empty: {
    color: '#555',
    textAlign: 'center',
    marginTop: 40,
    letterSpacing: 3,
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingVertical: 12,
  },
  date: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 1,
  },
  score: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
    letterSpacing: 2,
  },
  winner: {
    fontSize: 13,
    letterSpacing: 2,
  },
  win: { color: '#fff' },
  lose: { color: '#666' },
  word: { color: '#555', fontSize: 11, marginTop: 2, letterSpacing: 2 },
  backButton: {
    borderWidth: 2,
    borderColor: '#fff',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  backText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 3 },
});
