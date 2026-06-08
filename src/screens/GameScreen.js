import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Platform, useWindowDimensions, Modal, Pressable, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connect, disconnect, getSocket } from '../services/socket';
import HangmanCanvas from '../components/HangmanCanvas';
import Keyboard from '../components/Keyboard';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WORDS = [
  'WIFI','MOUSE','VIRUS','DISCO','PIXEL',
  'ROUTER','TABLET','CAMARA','LAPTOP','MONITOR',
  'CELULAR','MEMORIA','PANTALLA','INTERNET','SERVIDOR',
  'FACEBOOK','PYTHON','JAVA','LINUX','WINDOWS',
  'ANDROID','GOOGLE','CHROME','BLUETOOTH','TOKEN',
];
const MAX_ROUNDS = 3;
const MAX_LIVES = 5;
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const USE_NATIVE_DRIVER = Platform.OS !== 'web';



function getRandomWord(used) {
  const available = WORDS.filter(w => !used || !used.includes(w));
  return available[Math.floor(Math.random() * available.length)];
}

function getInitialRevealed(word) {
  const uniqueLetters = [...new Set(word.split(''))];
  let count;
  if (word.length <= 4) count = Math.min(1, uniqueLetters.length - 1);
  else if (word.length <= 5) count = Math.min(2, uniqueLetters.length - 1);
  else count = Math.min(4, uniqueLetters.length - 1);
  const shuffled = uniqueLetters.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function GameScreen({ route, navigation }) {
  const { width, height } = useWindowDimensions();
  const { roomCode, playerNumber = 1, player1Name, player2Name, firstTurn: setupFirstTurn } = route.params;
  const mode = route.params.mode || 'online';
  const isLocal = mode === 'local' || mode === 'single';
  const isOnlineLobby = mode === 'online';

  const [gameState, setGameState] = useState(isOnlineLobby ? 'lobby' : (isLocal ? 'playing' : 'waiting'));
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [scores, setScores] = useState([0, 0]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [winner, setWinner] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lightMode, setLightMode] = useState(false);
  const [hangmanStep, setHangmanStep] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [serverIp, setServerIp] = useState('192.168.1.79:3000');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const localState = useRef({
    word: '',
    round: 1,
    scores: [0, 0],
    currentTurn: (mode === 'local' && setupFirstTurn) ? setupFirstTurn : 0,
    guesses: [],
    suddenDeath: false,
    usedWords: [],
  });

  const socket = !isLocal && !isOnlineLobby ? getSocket() : null;
  const roundEndedRef = useRef(false);

  const wrongGuesses = guesses.filter((l) => !word.includes(l)).length;
  const wordDisplay = word
    .split('')
    .map((l) => (guesses.includes(l) ? l : '_'))
    .join(' ');

  const localTurn = localState.current.currentTurn;
  const effectiveTurn = isLocal
    ? (mode === 'single' ? 1 : (localTurn === 0 ? 1 : localTurn))
    : currentTurn;
  const isMyTurn = isLocal ? true : effectiveTurn === playerNumber;
  const hangmanSize = Math.max(112, Math.min(148, Math.floor(height * 0.22)));
  const wordFontSize = Math.max(22, Math.min(29, Math.floor(width / Math.max(word.length || 6, 6))));
  const wordLetterSpacing = word.length > 8 ? 4 : 6;

  async function handleScanQr() {
    if (!cameraPermission?.granted) {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Se necesita permiso de la camara para escanear codigos QR');
        return;
      }
    }
    setScanning(true);
  }

  function handleBarCodeScanned({ data }) {
    setScanning(false);
    const match = data.match(/AHORCADO:([^:]+):(\w+)/);
    if (match) {
      const ip = match[1];
      const code = match[2];
      setServerIp(ip);
      setRoomCodeInput(code);
      connectAndJoin(code, ip);
    } else {
      Alert.alert('QR invalido', 'Este codigo QR no corresponde a una sala de Ahorcado');
    }
  }

  function connectAndJoin(joinCode, qrIp) {
    disconnect();
    setLoading(true);

    const ip = qrIp || serverIp;
    const url = ip.includes('://') ? ip : `http://${ip}`;
    const s = connect(url);

    s.on('connect', () => {
      if (joinCode) {
        s.emit('join-room', { roomCode: joinCode.toUpperCase() });
      } else {
        s.emit('create-room');
      }
    });

    s.on('room-created', (data) => {
      setLoading(false);
      navigation.replace('Game', {
        roomCode: data.roomCode,
        playerNumber: data.playerNumber,
      });
    });

    s.on('room-joined', (data) => {
      setLoading(false);
      navigation.replace('Game', {
        roomCode: data.roomCode,
        playerNumber: data.playerNumber,
      });
    });

    s.on('join-error', (msg) => {
      setLoading(false);
      setErrorMessage(msg);
      setShowErrorModal(true);
      disconnect();
    });

    s.on('connect_error', () => {
      setLoading(false);
      setErrorMessage('No se pudo conectar al servidor.\nVerifica la IP e intenta de nuevo.');
      setShowErrorModal(true);
    });
  }

  function initRound() {
    const s = localState.current;
    s.word = getRandomWord(s.usedWords);
    s.usedWords.push(s.word);
    const initial = getInitialRevealed(s.word);
    s.guesses = [...initial];
    s.currentTurn = 0;
    setWord(s.word);
    setGuesses([...initial]);
    setCurrentTurn(0);
    setGameState('playing');
    setRoundComplete(false);
  }

  function processGuess(letter) {
    const s = localState.current;
    if (s.guesses.includes(letter)) return;
    s.guesses.push(letter);
    const currentPlayer = mode === 'single' ? 1 : (s.currentTurn === 0 ? 1 : s.currentTurn);
    const correct = s.word.includes(letter);

    if (s.suddenDeath) {
      if (correct) {
        setWinner(currentPlayer);
        setGameState('gameOver');
      } else {
        setWinner(currentPlayer === 1 ? 2 : 1);
        setGameState('gameOver');
      }
      return;
    }

    if (mode === 'local') {
      s.currentTurn = currentPlayer === 1 ? 2 : 1;
    }
    setCurrentTurn(s.currentTurn);
    setGuesses([...s.guesses]);

    const display = s.word.split('').map(l => s.guesses.includes(l) ? l : '_');
    if (!display.includes('_')) {
      handleWin(currentPlayer);
    } else if (s.guesses.filter(l => !s.word.includes(l)).length >= MAX_LIVES) {
      handleLose(currentPlayer);
    }
  }

  function handleWin(currentPlayer) {
    const s = localState.current;
    if (mode === 'single') {
      s.scores[0]++;
      setScores([...s.scores]);
      if (s.round >= MAX_ROUNDS) {
        setTimeout(() => { setGameState('gameOver'); setWinner(1); }, 1200);
      } else {
        setTimeout(() => { setRoundComplete(false); s.round++; initRound(); setRound(s.round); }, 1200);
      }
      return;
    }
    s.scores[currentPlayer - 1]++;
    setScores([...s.scores]);
    if (s.round >= MAX_ROUNDS) {
      if (s.scores[0] === s.scores[1]) {
        localStartSuddenDeath();
      } else {
        setWinner(s.scores[0] > s.scores[1] ? 1 : 2);
        setGameState('gameOver');
      }
    } else {
      setRoundComplete(true);
    }
  }

  function handleLose(currentPlayer) {
    const s = localState.current;
    if (mode === 'single') {
      setTimeout(() => { setGameState('gameOver'); setWinner(0); }, 800);
      return;
    }
    const w = currentPlayer === 1 ? 2 : 1;
    s.scores[w - 1]++;
    setScores([...s.scores]);
    if (s.round >= MAX_ROUNDS) {
      if (s.scores[0] === s.scores[1]) {
        localStartSuddenDeath();
      } else {
        setWinner(w);
        setGameState('gameOver');
      }
    } else {
      setRoundComplete(true);
    }
  }

  function localStartSuddenDeath() {
    const s = localState.current;
    s.suddenDeath = true;
    s.word = getRandomWord(s.usedWords);
    s.usedWords.push(s.word);
    const initial = getInitialRevealed(s.word);
    s.guesses = [...initial];
    s.currentTurn = 0;
    setWord(s.word);
    setGuesses([...initial]);
    setSuddenDeath(true);
    setGameState('suddenDeath');
  }

  function localNextRound() {
    setRoundComplete(false);
    const s = localState.current;
    s.round++;
    if (s.round > MAX_ROUNDS) {
      if (s.scores[0] === s.scores[1]) {
        localStartSuddenDeath();
      } else {
        setWinner(s.scores[0] > s.scores[1] ? 1 : 2);
        setGameState('gameOver');
      }
      return;
    }
    initRound();
    setRound(s.round);
  }

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
      ])
    );
    anim.start();

    if (isLocal) {
      const t = setTimeout(() => initRound(), 50);
      return () => { anim.stop(); clearTimeout(t); };
    }

    if (!socket) {
      if (!isOnlineLobby) {
        setErrorMessage('Sin conexión');
        setShowErrorModal(true);
        setTimeout(() => navigation.goBack(), 1500);
      }
      return;
    }

    socket.on('game-start', () => setGameState('playing'));
    socket.on('game-update', (data) => {
      setWord(data.word);
      setRound(data.round);
      setScores(data.scores);
      setCurrentTurn(data.currentTurn);
      setGuesses(data.guesses);
      setSuddenDeath(data.suddenDeath);
      if (data.suddenDeath) setGameState('suddenDeath');
      if (!data.suddenDeath && !roundEndedRef.current && data.word) {
        const display = data.word.split('').map(l => data.guesses.includes(l) ? l : '_');
        const wrongCount = data.guesses.filter(l => !data.word.includes(l)).length;
        if (!display.includes('_')) {
          roundEndedRef.current = true;
          const w = data.currentTurn === 1 ? 2 : 1;
          socket.emit('next-round', { winner: w });
        } else if (wrongCount >= MAX_LIVES) {
          roundEndedRef.current = true;
          socket.emit('next-round', { winner: data.currentTurn });
        }
      }
    });
    socket.on('new-round', (data) => {
      roundEndedRef.current = false;
      setWord(data.word);
      setRound(data.round);
      setGuesses([]);
    });
    socket.on('sudden-death', (data) => {
      roundEndedRef.current = false;
      setWord(data.word);
      setGuesses([]);
      setGameState('suddenDeath');
    });
    socket.on('sudden-death-winner', (data) => {
      setWinner(data.player);
      setGameState('gameOver');
    });
    socket.on('game-over', (data) => {
      setWinner(data.winner);
      setGameState('gameOver');
    });
    socket.on('opponent-disconnected', () => {
      setErrorMessage('El otro jugador abandonó la partida.');
      setShowErrorModal(true);
      setTimeout(() => navigation.goBack(), 1500);
    });

    return () => {
      anim.stop();
      socket.off('game-start');
      socket.off('game-update');
      socket.off('new-round');
      socket.off('sudden-death');
      socket.off('sudden-death-winner');
      socket.off('game-over');
      socket.off('opponent-disconnected');
    };
  }, [isLocal, isOnlineLobby, mode, socket, navigation]);

  useEffect(() => {
    if (gameState !== 'lobby') return;
    const hs = setInterval(() => {
      setHangmanStep(prev => prev >= 6 ? 0 : prev + 1);
    }, 900);
    return () => clearInterval(hs);
  }, [gameState]);

  function handleLetterPress(letter) {
    if (isLocal) {
      processGuess(letter);
      return;
    }
    if (socket && currentTurn === playerNumber) {
      socket.emit('guess', { letter });
    }
  }

  function handleNextRound() {
    if (isLocal) {
      localNextRound();
      return;
    }
    if (socket) socket.emit('next-round');
  }

  const handleLeave = useCallback(async () => {
    if (isLocal && gameState !== 'lobby') {
      await saveLocalGame(
        gameState === 'gameOver' || gameState === 'suddenDeath'
          ? (suddenDeath ? 'Muerte subita' : (mode === 'single' ? 'Fin de partida' : 'Fin de rondas'))
          : 'Abandono',
        winner || 0
      );
    }
    if (socket) disconnect();
    navigation.replace('Home');
  }, [socket, navigation, isLocal, gameState, suddenDeath, mode, winner]);

  const handlePlayAgain = useCallback(async () => {
    if (isLocal && gameState !== 'lobby') {
      await saveLocalGame(
        suddenDeath ? 'Muerte subita' : (mode === 'single' ? 'Fin de partida' : 'Fin de rondas'),
        winner
      );
    }
    if (socket) disconnect();
    navigation.replace('Game', { mode });
  }, [socket, navigation, mode, isLocal, gameState, suddenDeath, winner]);

  async function saveLocalGame(motivo, gameWinner) {
    try {
      const existing = await AsyncStorage.getItem('historial');
      const history = existing ? JSON.parse(existing) : [];
      const s = localState.current;
      history.unshift({
        fecha: new Date().toLocaleString('es-MX'),
        scores: [...s.scores],
        winner: gameWinner,
        suddenDeath: s.suddenDeath,
        palabra: s.word || word,
        motivo: motivo,
      });
      if (history.length > 50) history.length = 50;
      await AsyncStorage.setItem('historial', JSON.stringify(history));
    } catch (e) {}
  }

  async function fetchHistory() {
    setHistoryLoading(true);
    let local = [];
    try {
      const localRaw = await AsyncStorage.getItem('historial');
      local = localRaw ? JSON.parse(localRaw) : [];
    } catch (e) {}
    const url = serverIp.includes('://') ? serverIp : `http://${serverIp}`;
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

  if (gameState === 'lobby') {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={[styles.toolBtn, { marginTop: 6, marginLeft: 12 }]} onPress={() => navigation.replace('Home')}>
            <Text style={styles.toolBtnText}>ATRAS</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lobbyContent}>
          <View style={styles.lobbyLogo}>
            <HangmanCanvas wrongGuesses={hangmanStep} size={130} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>JUEGO ONLINE</Text>

          <View style={styles.form}>
            <Text style={styles.label}>IP DEL SERVIDOR:</Text>
            <TextInput
              style={styles.input}
              value={serverIp}
              onChangeText={setServerIp}
              placeholder="192.168.1.79:3000"
              placeholderTextColor="#333"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.buttonCreate, loading && styles.buttonDisabled]}
              onPress={() => connectAndJoin(null)}
              disabled={loading}
            >
              <Text style={styles.buttonTextCreate}>
                {loading ? 'CONECTANDO...' : 'CREAR SALA'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>O</Text>
              <View style={styles.line} />
            </View>

            <TextInput
              style={styles.input}
              value={roomCodeInput}
              onChangeText={setRoomCodeInput}
              placeholder="CODIGO"
              placeholderTextColor="#333"
              maxLength={4}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.buttonJoin, loading && styles.buttonDisabled]}
              onPress={() => connectAndJoin(roomCodeInput.trim())}
              disabled={loading}
            >
              <Text style={styles.buttonTextJoin}>
                {loading ? 'CONECTANDO...' : 'UNIRSE A SALA'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonQr}
              onPress={handleScanQr}
            >
              <Text style={styles.buttonTextQr}>ESCANEAR QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarCodeScanned}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>Coloca el codigo QR en el centro</Text>
              <TouchableOpacity style={styles.scannerCancel} onPress={() => setScanning(false)}>
                <Text style={styles.scannerCancelText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (gameState === 'waiting') {
    const qrData = `AHORCADO:${serverIp}:${roomCode}`;
    return (
      <View style={[styles.container, !lightMode && { backgroundColor: '#000' }]}>
        <Text style={[styles.waitingTitle, !lightMode && { color: '#fff' }]}>AHORCADO</Text>
        <Text style={[styles.roomCode, !lightMode && { color: '#fff' }]}>SALA: {roomCode}</Text>
        <View style={styles.qrBox}>
          <Text style={styles.inviteLabel}>DATOS PARA UNIRSE</Text>
          <Text style={styles.inviteText}>IP: {serverIp}</Text>
          <Text style={styles.inviteText}>SALA: {roomCode}</Text>
        </View>
        <TouchableOpacity style={styles.qrShareBtn} onPress={() => Share.share({ message: qrData })}>
          <Text style={styles.qrShareText}>COMPARTIR SALA</Text>
        </TouchableOpacity>
        <Animated.Text style={[styles.waitingText, { opacity: pulseAnim }, !lightMode && { color: '#666' }]}>
          ESPERANDO OPONENTE...
        </Animated.Text>
        <Text style={[styles.playerNum, !lightMode && { color: '#666' }]}>JUGADOR {playerNumber}</Text>
        <TouchableOpacity style={[styles.leaveButton, !lightMode && styles.leaveBtnDark]} onPress={handleLeave}>
          <Text style={[styles.leaveText, !lightMode && { color: '#666' }]}>SALIR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showGameOver = gameState === 'gameOver' || gameState === 'suddenDeath';
  const isGameOverWin = mode === 'single' ? winner === 1 : winner === playerNumber;
  const [score1, score2] = scores;
  const completedWord = word.split('').join(' ');

  const showNextBtn = roundComplete && mode !== 'single';

  return (
    <View style={[styles.container, !lightMode && { backgroundColor: '#000' }]}>
      <TouchableOpacity style={styles.btnMenu} onPress={() => setShowGameMenu(!showGameMenu)}>
        <Ionicons name="ellipsis-horizontal" size={28} color="#000" />
      </TouchableOpacity>

      {showGameMenu && (
        <>
          <Pressable style={styles.dropdownOverlay} onPress={() => setShowGameMenu(false)} />
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => { setShowGameMenu(false); setShowHistoryModal(true); fetchHistory(); }}>
              <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.dropdownText}>HISTORIAL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => setShowGameMenu(false)}>
              <Ionicons name="information-circle-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.dropdownText}>INFORMACION</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity style={[styles.toolBtn, lightMode && styles.toolBtnLight]} onPress={() => setShowExitModal(true)}>
          <Text style={[styles.toolBtnText, lightMode && { color: '#000' }]}>SALIR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topRow}>
        <View>
          <Text style={[styles.header, lightMode && { color: '#999' }]}>
            {mode === 'single' ? 'MODO INDIVIDUAL' : `RONDA ${round}`}
          </Text>
          <Text style={[styles.header, lightMode && { color: '#999' }]}>
            {mode === 'local' ? (effectiveTurn === 1 ? player1Name : player2Name) : `JUGADOR ${playerNumber}`}
          </Text>
          <Text style={[styles.score, lightMode && { color: '#000' }]}>
            {scores[0]} - {scores[1]}
          </Text>
        </View>
        <View style={[styles.livesBox, lightMode && styles.livesBoxLight]}>
          <Text style={[styles.livesLabel, lightMode && { color: '#000' }]}>VIDAS</Text>
          <Text style={[styles.livesCount, lightMode && { color: '#000' }]}>
            {'♥'.repeat(Math.max(0, MAX_LIVES - wrongGuesses)) + '♡'.repeat(Math.min(wrongGuesses, MAX_LIVES))}
          </Text>
        </View>
      </View>

      <View style={[styles.hangmanWrap, lightMode && styles.hangmanLight]}>
        <HangmanCanvas wrongGuesses={wrongGuesses} size={hangmanSize} color={lightMode ? '#000' : '#fff'} />
      </View>

      <Text style={[styles.wordDisplay, { fontSize: wordFontSize, letterSpacing: wordLetterSpacing }, lightMode && { color: '#000' }]}>{wordDisplay}</Text>

      <Animated.Text style={[styles.turnText, isMyTurn && { opacity: pulseAnim }, lightMode && { color: '#999' }]}>
        {suddenDeath
          ? 'MUERTE SUBITA'
          : mode === 'single'
            ? `PALABRA ${round} DE ${MAX_ROUNDS}`
            : mode === 'local'
              ? `TURNO ${effectiveTurn === 1 ? player1Name : player2Name}`
              : isMyTurn
                ? 'TU TURNO'
                : `TURNO JUGADOR ${currentTurn}`}
      </Animated.Text>

      <Keyboard
        usedLetters={guesses}
        onPress={handleLetterPress}
        disabled={!isMyTurn}
        lightMode={lightMode}
      />

      {showNextBtn && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNextRound}>
          <Text style={styles.nextText}>SIGUIENTE RONDA</Text>
        </TouchableOpacity>
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
                  <View key={i} style={[styles.dropdownItem, { borderBottomColor: '#444' }]}>
                    <View>
                      <Text style={{ color: '#aaa', fontSize: 10 }}>{g.fecha}</Text>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>J1 {g.scores[0]} - {g.scores[1]} J2</Text>
                      <Text style={{ color: '#888', fontSize: 11 }}>{g.palabra || ''} {g.motivo ? `(${g.motivo})` : ''}</Text>
                      <Text style={{ color: g.winner === 1 ? '#fff' : '#666', fontSize: 11 }}>GANADOR: JUGADOR {g.winner}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={[styles.modalButtonSecondary, { marginTop: 12 }]} onPress={() => setShowHistoryModal(false)}>
              <Text style={styles.modalButtonTextSecondary}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showErrorModal && (
        <View style={[styles.exitOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.overlayBox}>
            <Ionicons name="alert-circle-outline" size={40} color="#fff" style={{ marginBottom: 8 }} />
            <Text style={styles.exitModalTitle}>ERROR</Text>
            <Text style={{ color: '#fff', fontSize: 13, textAlign: 'center', marginBottom: 16, letterSpacing: 1 }}>
              {errorMessage}
            </Text>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalButtonTextSecondary}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showExitModal && (
        <View style={[styles.exitOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.overlayBox, { gap: 6 }]}>
            <Text style={styles.exitModalTitle}>SI SALES VAS A PERDER</Text>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => setShowExitModal(false)}>
              <Text style={styles.modalButtonTextSecondary}>CONTINUAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={() => { setShowExitModal(false); handleLeave(); }}>
              <Text style={styles.modalButtonTextSecondary}>PERDER</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={() => { setShowExitModal(false); handleLeave(); }}>
              <Text style={styles.modalButtonTextPrimary}>SALIR</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showGameOver && (
        <View style={[styles.exitOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.overlayBox}>
            <View style={{ marginBottom: 8 }}>
              <HangmanCanvas wrongGuesses={wrongGuesses} size={80} color="#fff" />
            </View>
            {isGameOverWin ? (
              <Ionicons name="trophy-outline" size={40} color="#fff" style={{ marginBottom: 4 }} />
            ) : (
              <Ionicons name="close-circle-outline" size={40} color="#fff" style={{ marginBottom: 4 }} />
            )}
            <Text style={[styles.resultIcon, { color: '#fff', fontSize: 24 }]}>
              {isGameOverWin ? 'VENCISTE' : 'PERDISTE'}
            </Text>
            <Text style={[styles.completedWord, { color: '#0f0', fontSize: 18 }]}>
              {completedWord}
            </Text>
            {suddenDeath && (
              <Text style={[styles.gameOverTitle, { color: '#fff', fontSize: 14 }]}>
                MUERTE SUBITA
              </Text>
            )}
            {mode !== 'single' && (
              <Text style={[styles.scoreText, { color: '#fff' }]}>
                {score1} - {score2}
              </Text>
            )}
            <View style={[styles.modalButtons, { gap: 6, marginTop: 8 }]}>
              {isLocal ? (
                <TouchableOpacity style={styles.modalButtonPrimary} onPress={handlePlayAgain}>
                  <Text style={styles.modalButtonTextPrimary}>VOLVER A JUGAR</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleLeave}>
                  <Text style={styles.modalButtonTextPrimary}>VOLVER A JUGAR</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.modalButtonSecondary} onPress={handleLeave}>
                <Text style={styles.modalButtonTextSecondary}>VOLVER AL INICIO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 74,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  header: {
    color: '#aaa',
    fontSize: 10,
    letterSpacing: 2,
  },
  score: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 0,
    alignItems: 'center',
  },
  toolBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 9,
    marginTop: -15,
  },
  toolBtnLight: {
    borderColor: '#000',
  },
  toolBtnText: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 2 },
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    minWidth: 160,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  wordDisplay: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 2,
    textAlign: 'center',
    width: '100%',
  },
  turnText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 0,
  },
  hangmanWrap: {
    shadowColor: '#fff',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    marginTop: 80,
  },
  hangmanLight: {
    shadowOpacity: 0,
    elevation: 0,
  },
  livesBoxLight: {
    borderColor: '#000',
    backgroundColor: '#fff',
    shadowOpacity: 0,
    elevation: 0,
  },
  livesBox: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    shadowColor: '#fff',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  livesLabel: {
    color: '#fff',
    fontSize: 7,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  livesCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  exitOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  exitModalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  nextButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 2,
  },
  nextText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  waitingTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 5,
  },
  roomCode: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginVertical: 10,
  },
  waitingText: {
    color: '#666',
    fontSize: 13,
    letterSpacing: 2,
    marginVertical: 20,
  },
  playerNum: { color: '#666', fontSize: 12, letterSpacing: 2, marginBottom: 28 },
  leaveButton: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  leaveBtnDark: { borderColor: '#333' },
  leaveText: { color: '#000', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  qrBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    minWidth: 220,
    alignItems: 'center',
    gap: 6,
  },
  inviteLabel: { color: '#000', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  inviteText: { color: '#000', fontSize: 15, fontWeight: 'bold', letterSpacing: 1, fontFamily: 'Courier' },
  qrShareBtn: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  qrShareText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  overlayBox: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#1a1a1a',
  },
  gameOverTitle: {
    fontSize: 19,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  scoreText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  trophyIcon: { fontSize: 48, marginBottom: 8 },
  completedWord: { fontSize: 22, fontWeight: 'bold', color: '#0f0', letterSpacing: 3, marginVertical: 8, textAlign: 'center' },
  resultIcon: { fontSize: 32, color: '#fff', marginBottom: 5 },
  modalButtons: { width: '100%', gap: 12, marginTop: 5 },
  modalButtonPrimary: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonTextPrimary: { color: '#000', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  modalButtonSecondary: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonTextSecondary: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  lobbyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 18,
    paddingBottom: 60,
  },
  lobbyLogo: {
    width: 160,
    height: 160,
    borderWidth: 5,
    borderColor: '#fff',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  logoMark: {
    width: 66,
    height: 66,
    borderWidth: 2,
    borderColor: '#00ff88',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#00ff88',
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 5,
    marginBottom: 20,
  },
  form: {
    width: '100%',
    maxWidth: 310,
  },
  label: { color: '#666', marginBottom: 4, fontSize: 10, letterSpacing: 2 },
  input: {
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    textAlign: 'center',
    marginBottom: 7,
    fontFamily: 'Courier',
  },
  buttonCreate: {
    borderWidth: 2,
    borderColor: '#00ff88',
    backgroundColor: '#00ff88',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 7,
  },
  buttonTextCreate: { color: '#000', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Courier' },
  buttonJoin: {
    borderWidth: 2,
    borderColor: '#00ff88',
    backgroundColor: '#000',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 7,
  },
  buttonTextJoin: { color: '#00ff88', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Courier' },
  buttonDisabled: { opacity: 0.4 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  line: { flex: 1, height: 1, backgroundColor: '#333' },
  or: { color: '#666', marginHorizontal: 10, fontSize: 14 },
  buttonQr: {
    borderWidth: 2,
    borderColor: '#0af',
    backgroundColor: '#000',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
    maxWidth: 310,
  },
  buttonTextQr: { color: '#0af', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'Courier' },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#0af',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 20,
    textAlign: 'center',
  },
  scannerCancel: {
    position: 'absolute',
    bottom: 60,
    borderWidth: 2,
    borderColor: '#fff',
    padding: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  scannerCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
