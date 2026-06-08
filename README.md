# El Juego Del Ahorcado

Aplicacion movil del juego del ahorcado desarrollada con **Expo** y **React Native**. El juego permite jugar de forma individual, local con dos jugadores y en modo online mediante conexion a un servidor.

## Descripcion

El objetivo del juego es adivinar una palabra oculta seleccionando letras del teclado. Cada letra incorrecta resta vidas y avanza el dibujo del ahorcado. El jugador gana si completa la palabra antes de quedarse sin vidas.

La aplicacion incluye pantallas de inicio, carga, juego, espera online, historial, resultados y mensajes de error. Tambien cuenta con sistema de rondas, puntuacion, turnos, muerte subita e historial de partidas.

## Tecnologias utilizadas

- React Native
- Expo
- JavaScript
- React Navigation
- AsyncStorage
- Expo Camera
- Expo Blur
- Socket.IO Client

## Requisitos para instalar

Antes de ejecutar el proyecto se necesita tener instalado:

- Node.js
- npm
- Git
- Expo CLI o usar `npx expo`
- Expo Go en el celular, si se desea probar en dispositivo fisico
- Android Studio, si se desea probar en emulador Android

## Instalacion

Clonar el repositorio:

```bash
git clone https://github.com/BranVnDev/El_Juego_Del_Ahorcado-.git
```

Entrar a la carpeta del proyecto:

```bash
cd El_Juego_Del_Ahorcado-
```

Entrar a la carpeta **mobile**, que es donde esta la aplicacion:

```bash
cd mobile
```

Instalar dependencias:

```bash
npm install
```

Iniciar el proyecto:

```bash
npm start
```

Tambien se puede iniciar limpiando cache:

```bash
npx expo start --clear
```

## Comandos disponibles

Todos estos comandos se deben ejecutar dentro de la carpeta `mobile`. Si se ejecutan desde otra carpeta, la aplicacion no va a funcionar porque ahi no se encuentra el archivo `package.json`.

Iniciar Expo:

```bash
npm start
```

Ejecutar en Android:

```bash
npm run android
```

Ejecutar en iOS:

```bash
npm run ios
```

Ejecutar en navegador web:

```bash
npm run web
```

Limpiar cache de Expo:

```bash
npx expo start --clear
```

Generar una exportacion de prueba para Android:

```bash
npx expo export --platform android --clear
```

## Como usar la aplicacion

1. Abrir la aplicacion.
2. Esperar a que termine la pantalla de carga.
3. Elegir un modo de juego desde el inicio.
4. Seleccionar letras para intentar descubrir la palabra.
5. Evitar perder todas las vidas.
6. Revisar el resultado final.
7. Volver a jugar o regresar al inicio.

## Modos de juego

### Modo individual

Un solo jugador intenta adivinar las palabras generadas por la aplicacion. Es ideal para practicar sin necesidad de otro jugador.

### Modo local

Dos jugadores usan el mismo dispositivo. El juego maneja turnos, rondas y puntuacion entre jugador 1 y jugador 2.

### Modo online

Permite jugar contra otro jugador mediante conexion a un servidor. El usuario puede crear una sala o unirse a una sala existente usando una IP y un codigo de sala.

## Vistas o pantallas del juego

### 1. Pantalla de carga

Se muestra al iniciar la aplicacion. Sirve como presentacion inicial mientras se cargan los recursos necesarios.

### 2. Pantalla de inicio

Es el menu principal. Desde aqui el usuario puede elegir el modo de juego, entrar al historial o navegar a otras opciones.

### 3. Pantalla de juego

Es la pantalla principal del juego. Muestra:

- Palabra oculta.
- Letras seleccionables.
- Dibujo del ahorcado.
- Vidas restantes.
- Ronda actual.
- Marcador.
- Turno actual.
- Boton para salir.

### 4. Pantalla de juego individual

Muestra la palabra actual, el teclado y las vidas del jugador. Si el jugador adivina la palabra, avanza a la siguiente. Si falla demasiadas veces, termina la partida.

### 5. Pantalla de juego local

Muestra los turnos de ambos jugadores, el marcador y la ronda actual. Cada jugador selecciona letras por turnos.

### 6. Pantalla de juego online

Permite ingresar la IP del servidor, crear una sala o unirse a una sala existente. Tambien permite escanear datos de sala si se usa la camara.

### 7. Pantalla de espera online

Se muestra cuando un jugador crea una sala y espera a que otro jugador se una. Presenta:

- IP del servidor.
- Codigo de sala.
- Boton para compartir sala.
- Mensaje de espera.
- Numero de jugador.

### 8. Pantalla de resultado

Aparece cuando termina una partida. Muestra:

- Si el jugador gano o perdio.
- Palabra completa.
- Marcador final.
- Boton para volver a jugar.
- Boton para volver al inicio.

### 9. Pantalla de historial

Muestra partidas anteriores guardadas. Incluye fecha, marcador, ganador, palabra y motivo del final de la partida.

### 10. Pantalla de error

Se muestra cuando ocurre un problema, por ejemplo:

- No se pudo conectar al servidor.
- Codigo de sala incorrecto.
- El otro jugador abandono la partida.
- Error durante la conexion.

## Reglas del juego

- El jugador debe adivinar la palabra oculta.
- Cada letra correcta aparece en su posicion.
- Cada letra incorrecta resta una vida.
- Una letra ya usada no debe repetirse.
- Si la palabra se completa, el jugador gana la ronda.
- Si se terminan las vidas, el jugador pierde la ronda.
- En modo de dos jugadores, gana quien tenga mayor puntuacion.
- Si hay empate al final, se activa muerte subita.

## Sistema de vidas

El juego usa un limite de **5 vidas**. Cada error resta una vida y agrega una parte al dibujo del ahorcado.

Partes del dibujo:

- Cabeza.
- Cuerpo.
- Brazo izquierdo.
- Brazo derecho.
- Pierna izquierda.
- Pierna derecha.

## Sistema de rondas

El juego maneja hasta **3 rondas** en las modalidades de competencia. Cada ronda puede sumar puntos para el jugador ganador.

## Sistema de puntuacion

Cuando un jugador gana una ronda, recibe un punto. Al terminar las rondas, se comparan los puntos:

- Si jugador 1 tiene mas puntos, gana jugador 1.
- Si jugador 2 tiene mas puntos, gana jugador 2.
- Si ambos tienen la misma puntuacion, se activa muerte subita.

## Muerte subita

La muerte subita se activa cuando hay empate. En esta etapa, una jugada puede definir al ganador:

- Si el jugador acierta, gana.
- Si el jugador falla, gana el otro jugador.

## Palabras del juego

El juego utiliza palabras relacionadas con tecnologia. Algunas de las palabras incluidas son:

- WIFI
- MOUSE
- VIRUS
- DISCO
- PIXEL
- ROUTER
- TABLET
- CAMARA
- LAPTOP
- MONITOR
- CELULAR
- MEMORIA
- PANTALLA
- INTERNET
- SERVIDOR
- FACEBOOK
- PYTHON
- JAVA
- LINUX
- WINDOWS
- ANDROID
- GOOGLE
- CHROME
- BLUETOOTH
- TOKEN

## Letras disponibles

El teclado del juego incluye el abecedario en mayusculas:

```text
A B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z
```

## Estilo visual

La aplicacion usa un estilo oscuro y minimalista. Los colores principales son:

- Fondo negro.
- Texto blanco.
- Botones con bordes blancos.
- Acentos verdes para acciones principales.
- Acentos azules para opciones relacionadas con QR o escaneo.
- Sombras blancas en el dibujo del ahorcado.

La interfaz utiliza letras mayusculas, espaciado entre caracteres y botones redondeados para dar una apariencia de juego arcade/moderno.

## Estructura del proyecto

```text
mobile/
├── App.js
├── app.json
├── package.json
├── package-lock.json
├── metro.config.js
├── babel.config.js
├── assets/
├── android/
├── scripts/
└── src/
    ├── components/
    │   ├── HangmanCanvas.js
    │   ├── Keyboard.js
    │   └── FlipClockText.js
    ├── screens/
    │   ├── HomeScreen.js
    │   ├── GameScreen.js
    │   ├── HistoryScreen.js
    │   └── SplashScreen.js
    └── services/
        └── socket.js
```

## Archivos principales

### App.js

Configura la navegacion principal de la aplicacion y muestra la pantalla de carga antes del menu principal.

### src/screens/HomeScreen.js

Contiene la pantalla de inicio y las opciones principales del juego.

### src/screens/GameScreen.js

Contiene la logica principal del juego, las rondas, turnos, vidas, puntuacion, conexion online y resultados.

### src/screens/HistoryScreen.js

Muestra el historial de partidas guardadas.

### src/screens/SplashScreen.js

Muestra la pantalla inicial de carga.

### src/components/HangmanCanvas.js

Dibuja el ahorcado segun la cantidad de errores del jugador.

### src/components/Keyboard.js

Muestra el teclado de letras y controla las letras usadas.

### src/services/socket.js

Maneja la conexion con el servidor para el modo online.

## Dependencias principales

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@react-navigation/native": "^7.0.0",
  "@react-navigation/native-stack": "^7.0.0",
  "@react-native-async-storage/async-storage": "^3.1.1",
  "expo-camera": "~17.0.10",
  "expo-blur": "~15.0.8",
  "socket.io-client": "^4.8.1"
}
```

## Solucion de errores comunes

### Error de cache de Metro

Ejecutar:

```bash
npx expo start --clear
```

### Error con dependencias

Borrar dependencias instaladas e instalar de nuevo:

```bash
rm -rf node_modules
npm install
```

En Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Error al conectar modo online

Verificar:

- Que el servidor este encendido.
- Que la IP sea correcta.
- Que ambos dispositivos esten en la misma red.
- Que el puerto del servidor sea correcto.
- Que el codigo de sala exista.

## Nota sobre QR

La aplicacion puede compartir los datos de la sala mediante texto. Actualmente se muestran la IP y el codigo de sala para evitar errores de dependencias con generadores de QR en React Native.

## Conclusion

El Juego del Ahorcado es una aplicacion movil interactiva que permite practicar logica, memoria y reconocimiento de palabras de una forma entretenida. Cuenta con modos individual, local y online, ademas de sistema de vidas, rondas, turnos, puntuacion, muerte subita e historial.

La documentacion anterior permite que otra persona instale, ejecute, entienda y utilice el proyecto correctamente.
