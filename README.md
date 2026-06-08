# El_Juego_Del_Ahorcado-

Aplicacion movil del juego del ahorcado desarrollada con Expo y React Native.

## Documentacion del Juego del Ahorcado

### Portada

**Nombre del proyecto:** Juego del Ahorcado  
**Tipo de aplicacion:** Aplicacion movil interactiva  
**Materia:** Desarrollo de aplicaciones / Programacion  
**Alumno:** ______________________________  
**Docente:** ______________________________  
**Grupo:** ______________________________  
**Fecha:** ______________________________  

## Contenido

### Introduccion

El presente documento describe el funcionamiento de la aplicacion movil **Juego del Ahorcado**, desarrollada como un juego interactivo donde el usuario debe adivinar una palabra antes de quedarse sin vidas. La aplicacion permite jugar en diferentes modalidades, mostrando una interfaz sencilla, visual y facil de usar.

El objetivo principal del juego es que el jugador seleccione letras para descubrir una palabra oculta. Cada error aumenta el avance del dibujo del ahorcado y reduce las vidas disponibles. Si el jugador completa la palabra antes de perder todas sus vidas, gana la ronda.

### Descripcion general de la aplicacion

La aplicacion es un juego basado en el clasico **Ahorcado**. El jugador observa una palabra oculta representada por guiones bajos y debe seleccionar letras del abecedario para adivinarla.

La aplicacion cuenta con diferentes pantallas o vistas que permiten navegar por el juego, iniciar partidas, jugar rondas, ver resultados y consultar el historial.

## Vistas de la Aplicacion

### 1. Vista de Inicio

La vista de inicio es la primera pantalla que aparece al abrir la aplicacion despues de la pantalla de carga. Desde esta vista, el usuario puede elegir el modo de juego que desea utilizar.

Elementos principales:

- Titulo del juego.
- Botones para seleccionar el modo de juego.
- Acceso al historial de partidas.
- Opciones de configuracion o navegacion.

Funcionamiento:

El usuario selecciona una opcion del menu principal. Dependiendo del boton presionado, la aplicacion lo lleva a la pantalla correspondiente, como una partida local, individual u online.

### 2. Vista de Carga o Splash Screen

Esta vista aparece al iniciar la aplicacion. Su funcion es mostrar una pantalla inicial mientras la app termina de cargar los recursos necesarios.

Elementos principales:

- Nombre o logo del juego.
- Animacion o diseno visual de presentacion.

Funcionamiento:

Despues de unos segundos, la aplicacion cambia automaticamente a la vista de inicio. Esta pantalla ayuda a que el inicio de la app sea mas ordenado y visual.

### 3. Vista de Juego Local

En esta vista se desarrolla una partida entre dos jugadores usando el mismo dispositivo.

Elementos principales:

- Palabra oculta.
- Dibujo del ahorcado.
- Teclado con letras.
- Marcador de jugadores.
- Numero de ronda.
- Vidas restantes.
- Turno del jugador actual.
- Boton para salir.

Funcionamiento:

Cada jugador toma turnos para elegir letras. Si la letra esta dentro de la palabra, se muestra en su posicion correspondiente. Si la letra no pertenece a la palabra, se descuenta una vida y avanza el dibujo del ahorcado.

El juego cuenta con varias rondas. Al finalizar cada ronda, se actualiza el marcador. El jugador con mayor puntuacion al final gana la partida.

### 4. Vista de Juego Individual

En esta modalidad, un solo jugador intenta adivinar las palabras propuestas por la aplicacion.

Elementos principales:

- Palabra oculta.
- Letras disponibles.
- Vidas restantes.
- Dibujo del ahorcado.
- Numero de palabra o ronda.
- Resultado final.

Funcionamiento:

El jugador selecciona letras para completar la palabra. Si adivina correctamente, avanza a la siguiente palabra. Si comete demasiados errores y se queda sin vidas, pierde la partida.

Esta modalidad permite practicar y jugar sin necesidad de otro participante.

### 5. Vista de Juego Online

Esta vista permite jugar contra otro jugador mediante conexion a un servidor.

Elementos principales:

- Campo para ingresar la IP del servidor.
- Boton para crear sala.
- Campo para ingresar codigo de sala.
- Boton para unirse a una sala.
- Opcion para escanear codigo.
- Mensajes de conexion.

Funcionamiento:

El jugador puede crear una sala o unirse a una sala existente. Para conectarse, debe ingresar la IP del servidor y el codigo de sala correspondiente.

Cuando ambos jugadores estan conectados, la partida inicia. La aplicacion envia y recibe informacion del servidor para actualizar turnos, letras seleccionadas, marcador y estado de la partida.

### 6. Vista de Espera

Esta pantalla aparece cuando un jugador crea una sala online y esta esperando a que otro jugador se una.

Elementos principales:

- Codigo de sala.
- IP del servidor.
- Boton para compartir la sala.
- Mensaje de espera.
- Numero de jugador.
- Boton para salir.

Funcionamiento:

Mientras no se conecte otro jugador, la aplicacion permanece en esta vista. El usuario puede compartir los datos de la sala para que otro jugador pueda entrar.

Cuando el segundo jugador se conecta, la partida cambia automaticamente a la vista de juego.

### 7. Vista del Teclado

El teclado es una parte importante de la pantalla de juego. Esta formado por las letras del abecedario, incluyendo la letra N.

Elementos principales:

- Botones con letras.
- Letras disponibles.
- Letras ya utilizadas.

Funcionamiento:

El usuario toca una letra para hacer un intento. Una vez usada, la letra queda marcada o deshabilitada para evitar que se repita.

Si la letra seleccionada esta en la palabra, se muestra en la posicion correcta. Si no esta, se cuenta como error.

### 8. Vista del Dibujo del Ahorcado

Esta vista muestra graficamente el progreso de los errores del jugador.

Elementos principales:

- Base del ahorcado.
- Poste.
- Cuerda.
- Cabeza.
- Cuerpo.
- Brazos.
- Piernas.

Funcionamiento:

Cada vez que el jugador falla una letra, se agrega una parte del dibujo. Cuando el dibujo se completa, significa que el jugador ha perdido la ronda o la partida.

### 9. Vista de Resultado o Fin de Partida

Esta vista aparece cuando termina una partida o una ronda importante.

Elementos principales:

- Mensaje de victoria o derrota.
- Palabra completa.
- Marcador final.
- Boton para volver a jugar.
- Boton para regresar al inicio.

Funcionamiento:

La aplicacion muestra si el jugador gano o perdio. Tambien muestra la palabra que debia adivinarse y el resultado final. Desde esta pantalla, el usuario puede iniciar otra partida o regresar al menu principal.

### 10. Vista de Historial

La vista de historial permite consultar partidas anteriores.

Elementos principales:

- Lista de partidas guardadas.
- Fecha de la partida.
- Marcador.
- Ganador.
- Palabra jugada.
- Motivo del final de partida.

Funcionamiento:

La aplicacion guarda informacion de partidas anteriores, especialmente en los modos locales. El usuario puede revisar los resultados para conocer su desempeno en juegos pasados.

### 11. Vista de Error

Esta vista aparece cuando ocurre un problema durante el funcionamiento de la aplicacion.

Elementos principales:

- Mensaje de error.
- Boton para cerrar.
- Aviso visual.

Funcionamiento:

Se muestra cuando la aplicacion no puede conectarse al servidor, cuando el codigo de sala es incorrecto o cuando ocurre algun problema durante la partida.

El usuario puede cerrar el mensaje e intentar nuevamente.

## Funcionamiento General del Juego

### Seleccion de palabra

La aplicacion contiene una lista de palabras relacionadas con tecnologia, como WIFI, MOUSE, VIRUS, ROUTER, TABLET, LAPTOP, MONITOR, INTERNET, SERVIDOR, ANDROID, GOOGLE y BLUETOOTH.

Al iniciar una ronda, el sistema selecciona una palabra aleatoria. Algunas letras pueden aparecer descubiertas desde el inicio para facilitar el juego.

### Sistema de vidas

El jugador cuenta con un numero limitado de vidas. Cada vez que selecciona una letra incorrecta, pierde una vida.

Cuando las vidas se terminan, el jugador pierde la ronda o la partida.

### Sistema de turnos

En el modo local y online, los jugadores se turnan para seleccionar letras. El turno cambia despues de cada intento, dependiendo de la logica del juego.

El sistema muestra en pantalla de quien es el turno actual.

### Sistema de puntuacion

Cuando un jugador gana una ronda, recibe un punto. Al final de las rondas, el jugador con mayor puntuacion gana la partida.

Si los jugadores empatan, puede activarse una ronda especial de muerte subita.

### Muerte subita

La muerte subita se activa cuando ambos jugadores terminan empatados. En esta fase, una sola respuesta puede definir al ganador.

Si el jugador acierta, gana. Si falla, gana el otro jugador.

### Guardado de historial

La aplicacion guarda informacion de las partidas jugadas, como la fecha, marcador, ganador, palabra y motivo por el cual termino la partida.

Esto permite consultar partidas anteriores desde la vista de historial.

## Conclusion

El Juego del Ahorcado es una aplicacion movil interactiva que permite practicar logica, memoria y reconocimiento de palabras de una forma entretenida. Su funcionamiento se basa en seleccionar letras para descubrir una palabra oculta antes de perder todas las vidas.

La aplicacion cuenta con distintas vistas que organizan el flujo del juego, desde el inicio hasta el resultado final. Ademas, incluye modalidades individual, local y online, lo que permite jugar solo o contra otra persona.

En conclusion, esta aplicacion cumple con el objetivo de ofrecer una experiencia de juego clara, funcional y dinamica, utilizando elementos como turnos, vidas, puntuacion, historial y conexion entre jugadores.

## Como ejecutar el proyecto

```powershell
npm install
npm start
```
