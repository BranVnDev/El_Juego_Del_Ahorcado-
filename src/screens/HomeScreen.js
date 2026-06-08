import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Platform, ScrollView, Pressable, BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HangmanCanvas from '../components/HangmanCanvas';
import FlipClockText from '../components/FlipClockText';
import SplashScreen from './SplashScreen';
import { connect, disconnect } from '../services/socket';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function HomeScreen({ navigation }) {
  const pulseAnim = useState(new Animated.Value(1))[0];
  const glowAnim = useState(new Animated.Value(0.3))[0];
  const [showMenu, setShowMenu] = useState(false);
  const [hangmanStep, setHangmanStep] = useState(0);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [player1Name, setPlayer1Name] = useState('JUGADOR 1');
  const [player2Name, setPlayer2Name] = useState('JUGADOR 2');
  const [firstTurn, setFirstTurn] = useState(1);
  const [showBackExit, setShowBackExit] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: USE_NATIVE_DRIVER }),
      ])
    );
    anim.start();

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.6, duration: 1750, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1750, useNativeDriver: false }),
      ])
    );
    glow.start();

    const interval = setInterval(() => {
      setHangmanStep(prev => prev >= 6 ? 0 : prev + 1);
    }, 900);

    return () => { anim.stop(); glow.stop(); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const onBack = () => {
      if (showMenu) { setShowMenu(false); return true; }
      if (showSetupModal) { setShowSetupModal(false); return true; }
      if (showHistoryModal) { setShowHistoryModal(false); return true; }
      setShowBackExit(true);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [showMenu, showSetupModal, showHistoryModal]);

  function navigateWithSplash(params) {
    setPendingNav(params);
    setShowTransition(true);
    setTimeout(() => {
      setShowTransition(false);
      setPendingNav(null);
      navigation.replace('Game', params);
    }, 900);
  }

  async function fetchHistory() {
    setHistoryLoading(true);
    let local = [];
    try {
      const raw = await AsyncStorage.getItem('historial');
      local = raw ? JSON.parse(raw) : [];
    } catch (e) {}
    const url = 'http://192.168.1.79:3000';
    const s = connect(url);
    s.on('connect', () => s.emit('get-history'));
    s.on('history-data', (data) => {
      const merged = [...(data || []), ...local];
      merged.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setHistoryData(merged);
      setHistoryLoading(false);
      s.disconnect();
    });
    s.on('connect_error', () => {
      setHistoryData(local);
      setHistoryLoading(false);
      s.disconnect();
    });
  }

  return (
    <View style={styles.container}>
      {showTransition && (
        <View style={StyleSheet.absoluteFill} zIndex={999}>
          <SplashScreen onFinish={() => {}} />
        </View>
      )}
      <Animated.View
        style={[
          styles.edgeGlow,
          {
            borderWidth: glowAnim.interpolate({
              inputRange: [0.3, 0.6],
              outputRange: [1, 2],
            }),
            opacity: glowAnim.interpolate({
              inputRange: [0.3, 0.6],
              outputRange: [0.3, 0.6],
            }),
          },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.edgeGlowInner,
          {
            borderWidth: glowAnim.interpolate({
              inputRange: [0.3, 0.6],
              outputRange: [2, 4],
            }),
            opacity: glowAnim.interpolate({
              inputRange: [0.3, 0.6],
              outputRange: [0.1, 0.25],
            }),
          },
        ]}
        pointerEvents="none"
      />
      <TouchableOpacity style={styles.btnMenu} onPress={() => setShowMenu(!showMenu)}>
        <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
      </TouchableOpacity>

      {showMenu && (
        <>
          <Pressable style={styles.dropdownOverlay} onPress={() => setShowMenu(false)} />
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setShowMenu(false); setShowHistoryModal(true); fetchHistory(); }}>
              <Ionicons name="time-outline" size={18} color="#000" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>HISTORIAL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => setShowMenu(false)}>
              <Ionicons name="information-circle-outline" size={18} color="#000" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>INFORMACION</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoMark}>
          <HangmanCanvas wrongGuesses={hangmanStep} size={150} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>AHORCADO</Text>
        <Text style={styles.subtitle}>Multijugador</Text>
        <FlipClockText phrases={['ATREVETE A JUGAR', 'JUEGA AHORA', 'NO TE RINDAS', 'ADIVINA YA', 'JUEGA O TE AHORCAS', 'UNA LETRA A LA VEZ', 'SALVA AL AHORCADO']} />

        <View style={styles.form}>
          <TouchableOpacity
            style={styles.buttonSingle}
            onPress={() => navigateWithSplash({ mode: 'single' })}
          >
            <Text style={styles.buttonTextSingle}>1 JUGADOR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonLocal}
            onPress={() => setShowSetupModal(true)}
          >
            <Text style={styles.buttonTextLocal}>2 JUGADORES</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>ONLINE</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.buttonOnline}
            onPress={() => navigateWithSplash({ mode: 'online' })}
          >
            <Text style={styles.buttonTextOnline}>SALA ONLINE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showSetupModal && (
        <View style={[styles.exitOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.overlayBox}>
            <Text style={styles.exitModalTitle}>2 JUGADORES</Text>

            <Text style={styles.setupLabel}>JUGADOR 1</Text>
            <TextInput
              style={styles.setupInput}
              value={player1Name}
              onChangeText={setPlayer1Name}
              placeholder="JUGADOR 1"
              placeholderTextColor="#888"
              maxLength={14}
              autoCapitalize="characters"
            />

            <Text style={styles.setupLabel}>JUGADOR 2</Text>
            <TextInput
              style={styles.setupInput}
              value={player2Name}
              onChangeText={setPlayer2Name}
              placeholder="JUGADOR 2"
              placeholderTextColor="#888"
              maxLength={14}
              autoCapitalize="characters"
            />

            <Text style={[styles.setupLabel, { marginTop: 12 }]}>EMPIECE:</Text>
            <View style={styles.setupTurns}>
              <TouchableOpacity
                style={[styles.setupTurnBtn, firstTurn === 1 && styles.setupTurnBtnActive]}
                onPress={() => setFirstTurn(1)}
              >
                <Text style={[styles.setupTurnText, firstTurn === 1 && styles.setupTurnTextActive]}>
                  {player1Name || 'J1'}
                </Text>
              </TouchableOpacity>
              <Text style={{ color: '#666', fontSize: 12, letterSpacing: 2 }}>O</Text>
              <TouchableOpacity
                style={[styles.setupTurnBtn, firstTurn === 2 && styles.setupTurnBtnActive]}
                onPress={() => setFirstTurn(2)}
              >
                <Text style={[styles.setupTurnText, firstTurn === 2 && styles.setupTurnTextActive]}>
                  {player2Name || 'J2'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.setupActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowSetupModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimarySetup}
                onPress={() => {
                  setShowSetupModal(false);
                  navigateWithSplash({
                    mode: 'local',
                    player1Name: player1Name.trim() || 'JUGADOR 1',
                    player2Name: player2Name.trim() || 'JUGADOR 2',
                    firstTurn,
                  });
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>JUGAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showBackExit && (
        <View style={[styles.exitOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.overlayBox}>
            <Ionicons name="exit-outline" size={36} color="#000" style={{ marginBottom: 8 }} />
            <Text style={styles.exitModalTitle}>¿SEGURO QUE QUIERES SALIR DEL JUEGO?</Text>
            <View style={styles.setupActions}>
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowBackExit(false)}>
                <Text style={styles.modalButtonTextSecondary}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimarySetup} onPress={() => BackHandler.exitApp()}>
                <Text style={styles.modalButtonTextPrimary}>SI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showHistoryModal && (
        <View style={[styles.exitOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.overlayBox}>
            <Text style={styles.exitModalTitle}>HISTORIAL</Text>
            {historyLoading ? (
              <Text style={{ color: '#999', fontSize: 12, letterSpacing: 2 }}>CARGANDO...</Text>
            ) : historyData.length === 0 ? (
              <Text style={{ color: '#999', fontSize: 12, letterSpacing: 2 }}>SIN PARTIDAS REGISTRADAS</Text>
            ) : (
              <ScrollView style={{ width: '100%', maxHeight: 300 }}>
                {historyData.map((g, i) => (
                  <View key={i} style={[styles.historyItem, { borderBottomColor: '#ddd' }]}>
                    <View>
                      <Text style={{ color: '#666', fontSize: 10 }}>{g.fecha}</Text>
                      <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>
                        J1 {g.scores[0]} - {g.scores[1]} J2
                      </Text>
                      <Text style={{ color: '#666', fontSize: 11 }}>{g.palabra || ''} {g.motivo ? `(${g.motivo})` : ''}</Text>
                      <Text style={{ color: g.winner === 1 ? '#000' : '#999', fontSize: 11 }}>
                        GANADOR: JUGADOR {g.winner}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={[styles.modalButtonSecondary, { marginTop: 12 }]}
              onPress={() => setShowHistoryModal(false)}>
              <Text style={styles.modalButtonTextSecondary}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 38,
    paddingBottom: 8,
  },
  logoMark: {
    width: 180,
    height: 180,
    marginTop: -50,
    borderWidth: 6,
    borderColor: '#fff',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#fff',
    shadowOpacity: 0.7,
    shadowRadius: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 5,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 4,
  },
  form: {
    width: '100%',
    maxWidth: 310,
    marginTop: 80,
  },
  buttonSingle: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonTextSingle: { color: '#000', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Courier' },
  buttonLocal: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonTextLocal: { color: '#000', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Courier' },
  buttonOnline: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonTextOnline: { color: '#000', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Courier' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  line: { flex: 1, height: 1, backgroundColor: '#222' },
  or: { color: '#555', marginHorizontal: 10, fontSize: 14 },
  edgeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: '#fff',
    borderRadius: 0,
  },
  edgeGlowInner: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderColor: '#fff',
    borderRadius: 0,
  },
  btnMenu: {
    position: 'absolute',
    top: 38,
    right: 14,
    width: 38,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
  },
  dropdown: {
    position: 'absolute',
    top: 74,
    right: 14,
    zIndex: 101,
    backgroundColor: '#e8e8e8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    minWidth: 160,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dropdownIcon: { marginRight: 10 },
  dropdownText: { color: '#000', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  exitOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 200,
  },
  overlayBox: {
    width: '85%', maxWidth: 340,
    backgroundColor: '#e8e8e8',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  exitModalTitle: {
    color: '#000', fontSize: 18, fontWeight: 'bold', letterSpacing: 4, marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalButtonSecondary: {
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center',
  },
  modalButtonTextSecondary: {
    color: '#000', fontSize: 12, fontWeight: 'bold', letterSpacing: 2,
  },
  modalButtonPrimarySetup: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
  },
  setupLabel: {
    color: '#000', fontSize: 10, letterSpacing: 2, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 4,
  },
  setupInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Courier',
    marginBottom: 10,
  },
  setupTurns: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, width: '100%', justifyContent: 'center',
  },
  setupTurnBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 100,
    paddingVertical: 8,
    alignItems: 'center',
  },
  setupTurnBtnActive: {
    backgroundColor: '#000',
  },
  setupTurnText: {
    color: '#000', fontSize: 11, fontWeight: 'bold', letterSpacing: 1,
  },
  setupTurnTextActive: {
    color: '#fff',
  },
  setupActions: {
    flexDirection: 'row', gap: 8, marginTop: 16, width: '100%',
  },
  modalButtonTextPrimary: {
    color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2,
  },
});
