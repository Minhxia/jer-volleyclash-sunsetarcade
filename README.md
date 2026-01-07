# Volley Clash
## Descripción de la Temática
**Volley Clash** es un juego multijugador de **voleibol arcade** en 2D desarrollado para navegador web. En él, dos jugadores se enfrentan en partidos rápidos y competitivos, combinando **físicas realistas**, **power-ups aleatorios** y una estética **pixel-art minimalista**.  

El objetivo es derrotar al oponente alcanzando **11 puntos**, teniendo al menos 2 de ventaja para ganar el set, en un partido a **3 sets**, controlando el salto, golpeo y posición del personaje con una jugabilidad sencilla pero desafiante.  


## Información del Equipo

**Número de Grupo:** 5   
**Repositorio de GitHub:** [URL del repositorio](https://github.com/Minhxia/jer-volleyclash-sunsetarcade)  
**Presentación Fase 3, 4 y 5:** [URL de la presentación](https://www.canva.com/design/DAG9vPPKsKo/-o2fW4u-cMkP8aeihkXtcg/edit?utm_content=DAG9vPPKsKo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)  
**Equipo de Desarrollo:**

| Nombre | Correo Oficial | Cuenta de GitHub |
|--------------|--------------|--------------|
| Sara Bueno Esteban      | s.buenoe.2018@alumnos.urjc.es   | [GitHub - Minhxia](https://github.com/Minhxia)            |
| Antonio Morán Barrera   | a.moranb.2022@alumnos.urjc.es   | [GitHub - Splatboy32](https://github.com/Splatboy32)      |
| Cristine Nioka Tewo     | c.nioka.2022@alumnos.urjc.es    | [GitHub - cchrusta](https://github.com/cchrusta)          |
| Álvaro Ibáñez Montero   | a.ibanezm.2023@alumnos.urjc.es  | [GitHub - Alvaro-Ibanez](https://github.com/Alvaro-Ibanez)|

---

# Game Design Document: Volley Clash

## Índice

1. [Introducción](#1-introducción)  
 1.1 [Concepto del juego](#11-concepto-del-juego)  
 1.2 [Género](#12-género)  
 1.3 [Propósito y público objetivo](#13-propósito-y-público-objetivo)  
 1.4 [Plataforma](#14-plataforma)  
 1.5 [Categoría](#15-categoría)  
 1.6 [Alcance](#16-alcance)

2. [Características Principales](#2-características-principales)

3. [Aspectos Técnicos](#3-aspectos-técnicos)  
 3.1 [Lenguajes y Frameworks](#31-lenguajes-y-frameworks)  
 3.2 [Arquitectura Cliente-Servidor](#32-arquitectura-cliente-servidor)  
 3.3 [Control de Versiones y Gestión](#33-control-de-versiones-y-gestión)  
 3.4 [API REST](#34-api-rest)  
 3.5 [Comunicación en Tiempo Real – WebSockets](#35-comunicación-en-tiempo-real--websockets)
   
4. [Jugabilidad](#4-jugabilidad)  
 4.1 [Objetivo del juego](#41-objetivo-del-juego)  
 4.2 [Controles](#42-controles)  
 4.3 [Mecánicas](#43-mecánicas)  
  4.3.1 [Golpeo](#431-golpeo)  
  4.3.2 [Puntuación](#432-puntuación)  
  4.3.3 [Rally Point](#433-rally-point)  
  4.3.4 [Saque](#434-saque)  
  4.3.5 [Faltas](#435-faltas)  
  4.3.6 [Límites de la Pantalla](#436-límites-de-la-pantalla)  
  4.3.7 [Power-Ups](#437-power-ups)  
  4.3.8 [Recogida de Power-Ups e Inventario](#438-recogida-de-power-ups-e-inventario)  
 4.4 [Físicas](#44-físicas)  
  4.4.1 [Gravedad](#441-gravedad)  
  4.4.2 [Rebotes](#442-rebotes)  
 4.5 [Calidad del Escenario](#45-calidad-del-escenario)

5. [Imagen y Diseño Visual](#5-imagen-y-diseño-visual)  
 5.1 [Estilo visual](#51-estilo-visual)  
 5.2 [Aspectos Técnicos](#52-aspectos-técnicos)  
 5.3 [Uso de colores](#53-uso-de-colores)  
 5.4 [Logotipo](#54-logotipo)  
 5.5 [Bocetos](#55-bocetos)  
  5.5.1 [Interfaces](#551-interfaces)  
  5.5.2 [Diagrama de Estados](#552-diagrama-de-estados)  
  5.5.3 [Personajes](#553-personajes)  
  5.5.4 [Escenarios](#554-escenarios)  
  5.5.5 [Elementos del juego](#555-elementos-del-juego)

6. [Sonido](#6-sonido)  
 6.1 [Música](#61-música)  
 6.2 [Efectos de sonido](#62-efectos-de-sonido)

7. [Narrativa](#7-narrativa)  
 7.1 [Historia general del juego](#71-historia-general-del-juego)  
 7.2 [Desarrollo de personajes](#72-desarrollo-de-personajes)  
 7.3 [Contexto y ambientación](#73-contexto-y-ambientación)

8. [Comunicación y Marketing](#8-comunicación-y-marketing)  
 8.1 [Estrategia de difusión y canales](#81-estrategia-de-difusión-y-canales)  
 8.2 [Público objetivo](#82-público-objetivo)

9. [Referencias](#9-referencias)

10. [Licencia](#10-licencia)

11. [Enlaces del Proyecto](#11-enlaces-del-proyecto)

---

# 1. Introducción
## 1.1 Concepto del juego
**Volley Clash** es un juego multijugador de **voleibol arcade** en 2D desarrollado para navegador web. En él, dos jugadores se enfrentan en partidos rápidos y competitivos, combinando **físicas realistas**, **power-ups aleatorios** y una estética **pixel-art minimalista**.  

El objetivo es derrotar al oponente alcanzando **11 puntos**, teniendo al menos 2 de ventaja para ganar el set, en un partido a **3 sets**, controlando el salto, golpeo y posición del personaje con una jugabilidad sencilla pero desafiante.  


## 1.2 Género
El juego es un arcade multijugador casual de deportes, competitivo, rápido y accesible. Se busca ofrecer partidas cortas y rápidas con cierto desafío, fomentando el pique amistoso y la rejugabilidad inmediata.


## 1.3 Propósito y público objetivo
El propósito del juego es entretener y ofrecer una experiencia deportiva ligera, accesible y directa.  
Está dirigido a toda clase de jugadores jóvenes de entre 8 y 25 años, personas que disfruten de los juegos de web clásicos y rápidos del 2000, sin necesidad de registrarse ni instalar nada.  


## 1.4 Plataforma
El juego está diseñado para ejecutarse en navegadores web, siendo accesible desde PC, portátil o dispositivos móviles compatibles.  
Se publicará en portales como Itch.io o Newgrounds, aprovechando su facilidad de acceso y difusión.


## 1.5 Categoría
Es un juego de entretenimiento casual, multijugador de hasta 2 jugadores tanto en local como online, competitivo en tiempo real, con representación en 2D.


## 1.6 Alcance
La versión inicial se centra en:
- Implementar las físicas del balón y personajes.  
- Integrar mecánicas de red.  
- Crear 3 escenarios (playa, gimnasio y exterior).  
- Añadir 3 personajes jugables con diferencias estéticas.  
- Desarrollar un sistema básico de power-ups.  

---

# 2. Características Principales
- **Multijugador en tiempo real** (2 jugadores).  
- **Juego rápido y competitivo** con duración de partidas de 1 minuto.  
- ***Power-ups*** **aleatorios** que alteran la dinámica del juego (velocidad, parálisis, puntos extra).  
- **Estética pixel-art** minimalista y colorida.  
- **Controles simples y responsivos**:  
  - Jugador 1 → *<kbd>A</kbd>/<kbd>D</kbd>/<kbd>W</kbd>/<kbd>S</kbd>/<kbd>E</kbd>*  
  - Jugador 2 → *<kbd>J</kbd>/<kbd>L</kbd>/<kbd>I</kbd>/<kbd>K</kbd>/<kbd>O</kbd>*  
- **Mecánica física arcade**: gravedad constante y rebotes en los límites de la pantalla.  
- **Interfaz intuitiva**: menú principal, lobby, partida y pantalla de fin de juego.  
- **Modo local y online**, con sincronización en red mediante **API REST + WebSockets**.

---

# 3. Aspectos Técnicos
## 3.1 Lenguajes y Frameworks
- **Lenguaje principal:** JavaScript.  
- **Backend:** Node.js o framework REST (Express u otro).  
- **Comunicación en tiempo real:** WebSockets.  
- **API REST:** para login, registro de resultados y gestión de lobby.  
- **Control de versiones:** Git + GitHub.


## 3.2 Arquitectura Cliente-Servidor
El sistema está dividido en dos capas:
1. **Cliente (juego):**  
   - Renderiza el juego en el navegador.  
   - Envía movimientos y acciones al servidor.  
2. **Servidor:**  
   - Gestiona las partidas y sincroniza los estados de los jugadores.  
   - Proporciona endpoints REST para lobby, login y resultados.  
   - Mantiene conexión asíncrona mediante WebSockets para las partidas en tiempo real.  


## 3.3 Control de Versiones y Gestión
- **Repositorio público en GitHub:** Usado para el control de versiones, issues y coordinación del equipo.  
- **Gestión del proyecto:**  
  - Ramas separadas por funcionalidad.  
  - Commits frecuentes con mensajes descriptivos.  

---

## 3.4 API REST

La **API REST** de *Volley Clash* se encarga de la gestión general del juego fuera de la partida en tiempo real. Su función principal es manejar la información persistente y las acciones que no requieren sincronización inmediata entre jugadores.

### Funcionalidades principales de la API REST
- **Gestión de jugadores**
  - Registro de nombre del jugador.
  - Identificación básica de usuarios para partidas online.
  
- **Gestión de lobby**
  - Creación de salas de juego.
  - Unión de jugadores a una sala existente.
  - Asignación de roles (Jugador 1 / Jugador 2).

- **Resultados de partidas**
  - Registro del ganador y marcador final.
  - Almacenamiento de estadísticas básicas (partidas jugadas, partidas ganadas).
  - Creacion de un ranking entre los 5 mejores jugadores registrados.

  A través del protocolo HTTP, el servidor expone una API REST que permite administrar la información local del juego de forma estructurada y segura. Gracias a esta implementación, el servidor es capaz de realizar las siguientes acciones:
  * Crear y eliminar usuarios, mediante peticiones POST y DELETE.
  El registro de usuarios se realiza a través del endpoint /api/register, donde se valida la existencia previa del usuario y la corrección de la contraseña antes de almacenarlo. La eliminación de usuarios se gestiona mediante /api/users/:username, requiriendo la contraseña para garantizar la seguridad de la operación.

  * Iniciar y cerrar sesión, mediante peticiones POST.
  El inicio de sesión se gestiona en /api/login, validando las credenciales y manteniendo un registro de los usuarios activos en el servidor. El cierre de sesión se realiza mediante /api/logout, eliminando al usuario de la lista de jugadores conectados y liberando su sesión activa.

  * Comunicar el estado del servidor.
  El servidor dispone de un endpoint /status que permite comprobar si se encuentra activo y operativo, facilitando la verificación del estado del sistema desde el cliente.

  * Informar del número de usuarios conectados.
  A través del endpoint /api/players/count, el servidor devuelve en tiempo real el número de jugadores actualmente conectados, información que se gestiona mediante una lista interna de jugadores activos.

  * Almacenar datos como el nombre de usuario, contraseña y estadísticas de partidas jugadas, ganadas y perdidas.
  Cada usuario almacena de forma persistente sus estadísticas de juego, que se actualizan al finalizar cada partida mediante el endpoint /api/game/finish. Además, el perfil del jugador puede consultarse mediante /api/users/profile/:username.

  * Generar un ranking con los cinco jugadores más destacados.
  El servidor genera dinámicamente un ranking de los cinco mejores jugadores en función del número de partidas ganadas, accesible a través del endpoint /api/topPlayers, devolviendo únicamente la información relevante para su visualización en el cliente.


### Endpoints principales (ejemplo)

#### Gestión de usuarios
- **POST** `/api/register`  
  Registrar un nuevo usuario.
- **DELETE** `/api/users/:username`  
  Eliminar un usuario existente (requiere contraseña).
- **POST** `/api/login`  
  Iniciar sesión de un usuario.
- **POST** `/api/logout`  
  Cerrar sesión de un usuario.
- **GET** `/api/users/profile/:username`  
  Obtener el perfil y estadísticas de un usuario.
---
#### Gestión de jugadores conectados
- **GET** `/api/players/count`  
  Obtener el número de jugadores conectados.
- **GET** `/api/players/list`  
  Obtener la lista de jugadores conectados.
- **GET** `/api/users/keepalive/:username`  
  Mantener la sesión activa y detectar inactividad.
---
#### Gestión de partidas y estadísticas
- **PUT** `/api/game/finish`  
  Actualizar estadísticas del usuario al finalizar una partida.
---
#### Ranking de jugadores
- **GET** `/api/topPlayers`  
  Obtener el ranking de los cinco mejores jugadores.
---
#### Estado del servidor
- **GET** `/status`  
  Comprobar el estado del servidor. 

La API REST está desarrollada en **Node.js**, utilizando **Express**, y se comunica con el cliente mediante **JSON**.

---

## 3.5 Comunicación en Tiempo Real – WebSockets

Para la sincronización de las partidas en tiempo real, **Volley Clash** utiliza **WebSockets** mediante la librería `ws` en Node.js. Esta tecnología permite una comunicación bidireccional persistente entre el servidor y los clientes durante toda la partida, garantizando baja latencia y coherencia en el estado del juego.

El servidor WebSocket se inicializa sobre el mismo servidor HTTP que la API REST y actúa como **autoridad del juego**, validando y reenviando los eventos críticos entre los jugadores. Durante el partido, se utiliza un **host autoritativo**.

### Gestión de Conexiones

Cada conexión WebSocket mantiene una estructura de metadatos asociada con la siguiente información:

- **ID único de conexión**
- **Nombre de usuario**
- **Personaje seleccionado**
- **Rol de host**
- **Estado de conexión (keep-alive)**

El servidor mantiene un registro activo de clientes conectados y elimina automáticamente aquellas conexiones inactivas mediante un sistema de **ping/pong** periódico. Además, para mantener el código modular, el servidor se divide en servicios:

- **connectionService**: mantiene un set de clientes WebSocket conectados, con métodos auxiliares para mandar mensaje con JSON.
- **matchmakingService**: gestiona el lobby.
- **gameRoomService**: se encarga de retransmitir los mensajes in-game entre los jugadores.

### Sistema de Lobby y Matchmaking

A través de WebSockets se gestiona todo el flujo previo a la partida:

- Entrada de jugadores al **lobby** (`join_lobby`)
- Selección de **escenario** (solo el host puede seleccionar escenario)
- Confirmación de **estado listo** de cada jugador
- Asignación de roles y emparejamiento automático

Cuando ambos jugadores están preparados, el servidor crea una **sala de juego** y comienza la sincronización de la partida.

### Sincronización In-Game

Durante la partida, los WebSockets se utilizan para enviar y recibir eventos en tiempo real, entre ellos:

- **Movimiento de jugadores** (`player_move`)
- **Sincronización de la pelota** (`ball_sync`)
- **Actualización de puntuación** (`update_score`)
- **Sincronización del temporizador** (`timer_sync`)
- **Finalización de sets y partida** (`set_finished_sync`, `game_finished`)
- **Gestión del punto de oro** (`golden_point_sync`)
- **Gestión de inventario** (`inv_sync`)
- **Generación y eliminación de power-ups** (`spawn_powerup`, `remove_powerup`)
- **Uso y aplicación de power-ups** (`collect_powerup`, `collect_denied`, `use_powerup`)

Los mensajes siguen un formato JSON y contienen siempre un campo `type` que identifica la acción a realizar.

### Gestión de Power-Ups

Cuando un jugador activa un *power-up*, el servidor reenvía el evento al oponente correspondiente, garantizando que ambos clientes apliquen el mismo efecto de forma sincronizada.  
Del mismo modo, la aparición de *power-ups* en la pista puede ser forzada y sincronizada entre ambos jugadores.

### Desconexiones y Control de Estado

El servidor detecta y gestiona correctamente:

- Desconexiones voluntarias
- Desconexiones por inactividad
- Errores de red inesperados

En caso de desconexión, el jugador es eliminado del lobby o de la partida activa, se limpian sus datos de conexión y se notifica al oponente si es necesario.

Este sistema asegura la estabilidad de las partidas y evita estados inconsistentes o bloqueos en el flujo de juego.

---

# 4. Jugabilidad
**Volley Clash** consiste en partidos rápidos (**1 minuto**) y competitivos de **voleibol arcade** en **1vs1** local y *online*. Cada jugador mueve a su personaje en un **entorno 2D**, y tiene que golpear la pelota en el momento adecuado para devolverla al campo rival. Además, durante el partido aparecen ***power-ups*** en la pista, que los jugadores pueden usar para ganar ventaja.


## 4.1 Objetivo del juego
Vencer al rival ganando 2 sets (es decir, al mejor de 3). Cada set finaliza cuando un jugador alcanza 11 o más puntos con al menos 2 de ventaja. En el caso de usar los *power-ups* que modifican el valor de un rally (x2, x3), la condición de victoria del set se mantiene: ≥11 y +2. Además, como **objetivo adicional**, el jugador debe gestionar adecuadamente su inventario de *power-ups* y decidir cuándo activarlos para asegurar saques, defender o rematar sets.


## 4.2 Controles
- **Jugador 1:** corresponde al jugador situado a la izquierda de la red.
    - <kbd>A</kbd>/<kbd>D</kbd> para moverse hacia la izquierda y hacia la derecha, respectivamente.
    - <kbd>W</kbd> para saltar.
    - <kbd>S</kbd> para recibir la pelota.
    - <kbd>E</kbd> para activar un *power-up*.
    
- **Jugador 2:** corresponde al jugador situado a la derecha de la red.
    - <kbd>J</kbd>/<kbd>L</kbd> para moverse hacia la izquierda y hacia la derecha, respectivamente.
    - <kbd>I</kbd> para saltar.
    - <kbd>K</kbd> para recibir la pelota.
    - <kbd>O</kbd> para activar un *power-up*.


## 4.3 Mecánicas
### 4.3.1 Golpeo
Cuando la pelota entra en contacto con el jugador, rebota y la dirección se define con el movimiento del jugador (teclas).


### 4.3.2 Puntuación
Se anota un punto cuando la **pelota toca el suelo** del campo del rival o cuando el rival comete una **falta**.  


### 4.3.3 Rally Point
Cuando un jugador anota un punto, se actualiza el marcador y el juego pasa a **estado de saque**.


### 4.3.4 Saque
El saque lo realiza el jugador que haya anotado el último punto, desde la **zona marcada** al fondo de su campo. Para realizar el **saque inicial**, se elige a un jugador **aleatoriamente**.


### 4.3.5 Faltas
Un jugador comete una falta si toca la pelota **tres veces consecutivas** en su campo antes de devolverla, o si realiza un saque **fuera de la zona marcada**.


### 4.3.6 Límites de la Pantalla
La pelota **no sale fuera** por los laterales o la parte superior, sino que **rebota** en los **límites de la pantalla** y en la **red**. Aunque la pelota rebote en el campo del jugador, **no** se reinicia su conteo de toques.


### 4.3.7 Power-Ups
Durante el partido, los *power-ups* aparecen de forma **aleatoria** en zonas válidas de la pista (nunca sobre la red). Permanecen visibles un tiempo corto (**5 segundos**) y si no se recogen, a partir de los 3 segundos empiezan a **desvanecerse** poco a poco hasta desaparecer. Tienen un código de color para dar feedback visual a los jugadores.

- **Efectos disponibles:**
  - **Aumentar velocidad** del jugador. Color cian/verde.
  - **Ralentizar** al rival. Color azul oscuro.
  - **Paralizar** al rival durante un breve intervalo. Color rojo, parpadeante.
  - **Multiplicar** la puntuación (**x2/x3**). Color dorado, además aparece un texto con el multiplicador correspondiente sobre el personaje.

- **Frecuencia de aparición:** **cada 2–5 segundos** en función de la duración del partido, siempre que haya **menos de 2** *power-ups* en pantalla.

- **Duración y aplicación:** 
    - Cada efecto dura **10 segundos** desde su activación
    - Los **efectos del mismo tipo no se acumulan**, si activas el mismo efecto mientras está activo, **se refresca su duración**.
    - Los **efectos de distinto tipo sí se acumulan**, por ejemplo, paralizar al rival y multiplicar x2 a la vez.
    - El multiplicador (**x2/x3**) se aplica a **todos los puntos que anote** el jugador mientras el efecto esté activo.


### 4.3.8 Recogida de Power-Ups e Inventario
Cuando un jugador pasa por encima de un *power-up*, lo recoge **automáticamente** si tiene espacio en su **inventario**. Cada jugador puede guardar como **máximo 2** *power-ups*.


## 4.4 Físicas
Modelo arcade 2D, basado en gravedad y rebotes.


### 4.4.1 Gravedad
La **gravedad** que se aplica sobre la pelota es de 9.8 m/s², que se mantiene constante.


### 4.4.2 Rebotes
La pelota rebota con el jugador, en la red y en los límites de la pantalla, teniendo en cuenta que cuando toca el suelo termina el *rally*.


## 4.5 Calidad del Escenario
El **escenario** tiene un estilo ***pixel-art***. Los personajes y la pelota tienen una silueta clara y unos colores que contrastan con el fondo. La red también destaca, pero sin desviar la atención de los jugadores.

El **HUD** es claro y limpio. Los **marcadores** con las puntuaciones se encuentran en cada lado de la pantalla y son grandes. El **inventario** de cada jugador se coloca en la parte superior de su propio lado de la pantalla, para que resulte más visible.

La **cámara** es estática y se mantiene centrada, de modo que se visualiza todo el escenario.

Durante toda la partida suena **música de fondo** y se producen **efectos de sonido** cuando los jugadores golpean la pelota o al anotar un punto. Al finalizar, cada jugador escucha el tono que le corresponda (de victoria o derrota).

Los ***power-ups*** tienen iconos reconocibles en función de su efecto, y un contorno para contrastar con el fondo. Al agotarse, se van volviendo invisibles gradualmente.

---

# 5. Imagen y Diseño Visual
## 5.1 Estilo visual 
El estilo visual del juego es **pixel-art**, debido al nombre de nuestro equipo *Sunset Arcade*, representado con una máquina arcade retro.  
Por ello, todo el juego está diseñado en pixel-art para aportarle esa apariencia nostálgica y retro.


## 5.2 Aspectos Técnicos
La dimensión del juego es **2D**, con una vista lateral. La **cámara** es fija y está centrada en la pantalla, sin perspectiva, permitiendo así observar todo el escenario de frente.

El **HUD** es un canvas en ***overlay*** que no afecta al encuadre, y además es responsivo.


## 5.3 Uso de colores
Se ha utilizado una **gama de colores llamativos y cálidos** para atraer la atención de los jugadores.


## 5.4 Logotipo
Se han diseñado logotipos tanto para la empresa como para el videojuego, con el objetivo de crear una identidad visual clara y fácilmente reconocible por los jugadores.

**Logo de la empresa:**

![Logo de la empresa](VolleyClash_juego/public/ASSETS/LOGO/logo_empresa.png)

**Logo del juego:**
El logotipo seleccionado representa un **balón de voleibol en llamas**, símbolo de la **intensidad, la energía y la competitividad** que caracterizan al juego. Su diseño busca transmitir dinamismo y emoción, reforzando la temática deportiva y el espíritu competitivo del videojuego.

![Logo del juego](VolleyClash_juego/public/ASSETS/LOGO/Logo.png)


## 5.5 Bocetos
### 5.5.1 Interfaces
Se han realizado distintas interfaces para ofrecer al usuario una experiencia **fácil, agradable e intuitiva** al jugar.  
Para ello, se han creado las siguientes pantallas: **menú inicial**, **configuración**, **créditos**, **modo de juego**, **personalización de personaje**, **selección de escenario**, **pausa**, **pantalla de juego** y **fin de partida**.

#### Menú inicial
En esta interfaz, el jugador podrá **comenzar una partida**, acceder a la **pantalla de configuración**, al **tutorial** o a los **créditos** del juego. Además de cerrar sesión para volver a la pantalla de **logging**.  

![Menú principal](VolleyClash_juego/public/ASSETS/INTERFACES/Pantalla_de_inicio.png)

#### Configuración
En esta pantalla, el jugador puede **cambiar el volumen del sonido o la música** del juego.  

<img src="VolleyClash_juego/public/ASSETS/INTERFACES/Configuracion_inicial.png" width="960" height="540" alt="Pantalla de configuración">

#### Créditos
En esta interfaz se incluirán **únicamente los miembros del equipo**, con la opción de volver a la pantalla de inicio.  

![Pantalla de créditos](VolleyClash_juego/public/ASSETS/INTERFACES/Creditos.png)

#### Modo de juego
En esta pantalla se presentan dos botones para elegir entre los modos de **juego local o en red**, según prefiera el jugador. Además se muestra el estado del servidor y el número de jugadores conectados actualmente.  

![Pantalla de modo de juego](VolleyClash_juego/public/ASSETS/INTERFACES/Modo_de_juego.png)

#### Tutorial
En esta pantalla se presentan dos botones para moverse entre las diferentes páginas del tutorial.  

![Pantalla de modo de juego](VolleyClash_juego/public/ASSETS/INTERFACES/Modo_de_juego.png)

#### Personalizar personaje del jugador (Local)
En esta interfaz, el jugador podrá **elegir su nombre y el personaje** que desee utilizar.  

<img src="VolleyClash_juego/public/ASSETS/INTERFACES/Seleccion_de_personaje.png" width="960" height="540" alt="Pantalla de selección de personaje (Local)">

#### Personalizar personaje del jugador (Online)
En esta interfaz, el jugador podrá **elegir el personaje** que desee utilizar.  

<img src="VolleyClash_juego/public/ASSETS/INTERFACES/Seleccion_de_personajeOnline.png" width="960" height="540" alt="Pantalla de selección de personaje (Online)">

#### Selección de escenario (Local)
En esta pantalla, el jugador podrá **elegir el escenario** en el que desea jugar la partida.  

![Pantalla de selección de escenario](VolleyClash_juego/public/ASSETS/INTERFACES/Seleccion_de_escenario.png)

#### Pausa
En esta pantalla, el jugador podrá **volver al menú o reaunudar** la partida.  

![Pantalla de selección de escenario](VolleyClash_juego/public/ASSETS/INTERFACES/Pausa.png)

#### Lobby
En esta pantalla, el jugador podrá **seleccionar el escenario** si es **admin** o marcar su estado como listo para comenzar la partida.  

![Pantalla de selección de escenario](VolleyClash_juego/public/ASSETS/INTERFACES/Lobby.png)

#### Logging
En esta pantalla, el jugador podrá **registrarse**, **eliminar su cuenta** o **iniciar sesión**.  

![Pantalla de selección de escenario](VolleyClash_juego/public/ASSETS/INTERFACES/Logging.png)

#### Pantalla de juego
En la pantalla de juego se pueden encontrar los siguientes elementos:
- Contador de puntos (uno para cada jugador, ubicado en su lado del campo)
- *Power-ups* almacenados en el inventario de cada jugador
- Tiempo restante de la partida
- Set actual

![Pantalla de juego](VolleyClash_juego/public/ASSETS/INTERFACES/Partida.png)  

#### Fin de partida
En esta interfaz aparecerá el **nombre del jugador ganador** y una animación de su **personaje seleccionado**.  
Además, habrá un botón para **volver al menú inicial**.

![Pantalla de fin de juego](VolleyClash_juego/public/ASSETS/INTERFACES/Fin_de_partida.png)  


### 5.5.2 Diagrama de Estados
Este es el diagrama de estados del juego, con todas las interfaces y las diferentes interacciones entre ellas.

![Diagrama de Estados](VolleyClash_juego/public/ASSETS/DIAGRAMAS/Diagrama%20de%20Estados.jpg)


### 5.5.3 Personajes

Se han diseñado diversos personajes jugables que el usuario puede seleccionar para aportar variedad y personalización a la experiencia.
Cada uno representa un estereotipo distinto presente en la narración del videojuego, tanto en su apariencia como en su comportamiento.
| Equilibrado y Simpático | Rápido y Competitivo | Divertido y algo Distraído|
|-----------|--------|---------------|
| ![Personaje A](VolleyClash_juego/public/ASSETS/PERSONAJES/PERSONAJES_POSE/personajes_a.png) | ![Personaje B](VolleyClash_juego/public/ASSETS/PERSONAJES/PERSONAJES_POSE/personajes_b.png) | ![Personaje C](VolleyClash_juego/public/ASSETS/PERSONAJES/PERSONAJES_POSE/personaje_c.png) |

Cada uno tiene su hoja de Sprites con las animaciones de **Remate, recibo y movimiento**.
| Equilibrado y Simpático | Rápido y Competitivo | Divertido y algo Distraído |
|-------------|-------------|-------------|
| **Remate**  | **Remate**  | **Remate**  |
| ![Remate A](VolleyClash_juego/public/ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_A/ANIMACION_REMATE.png) | ![Remate B](VolleyClash_juego/public/ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_B/ANIMACION_REMATE.png) | ![Remate C](VolleyClash_juego/public/ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_C/ANIMACION_REMATE.png) |
| **Correr / Recibir** | **Correr / Recibir** | **Correr / Recibir** |
| ![Correr A](VolleyClash_juego/public/ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_A/ANIMACIONES_CORRER_RECIBIR.png) | ![Correr B](VolleyClash_juego/public/ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_B/ANIMACIONES_CORRER_RECIBIR.png) | ![Correr C](VolleyClash_juego/public/ASSETS/PERSONAJES/ANIMACIONES/PERSONAJE_C/ANIMACIONES_CORRER_RECIBIR.png) |


### 5.5.4 Escenarios
Para los escenarios, se han recreado **lugares típicos donde se suelen desarrollar los partidos de voleibol**.

| Gimnasio | Playa | Patio trasero |
|-----------|--------|---------------|
| ![Gimnasio](VolleyClash_juego/public/ASSETS/FONDOS/GIMNASIO.png) | ![Playa](VolleyClash_juego/public/ASSETS/FONDOS/PLAYA.png) | ![Patio trasero](VolleyClash_juego/public/ASSETS/FONDOS/JARDIN.png) |


### 5.5.5 Elementos del juego

#### Power-ups

| **Velocidad** | **Ralentizar** | **Paralizado** | **Multiplicador x3** | **Multiplicador x2** |
|:-------------:|:--------------:|:--------------:|:--------------------:|:--------------------:|
| ![Velocidad](VolleyClash_juego/public/ASSETS/ITEMS/POWER%20UPS/VELOCIDAD.png) | ![Ralentizar](VolleyClash_juego/public/ASSETS/ITEMS/POWER%20UPS/RELENTIZAR.png) | ![Paralizado](VolleyClash_juego/public/ASSETS/ITEMS/POWER%20UPS/PARALIZADO.png) | ![Multiplicador x3](VolleyClash_juego/public/ASSETS/ITEMS/POWER%20UPS/MULTIPLICADOR%203.png) | ![Multiplicador x2](VolleyClash_juego/public/ASSETS/ITEMS/POWER%20UPS/MULTIPLICADOR%202.png) |
| Aumenta la velocidad del jugador temporalmente. | Ralentiza al oponente durante unos segundos. | Paraliza al oponente brevemente, impidiéndole moverse. | Triplica los puntos obtenidos durante un corto tiempo. | Duplica los puntos obtenidos durante un corto tiempo. |


#### Pelotas de voleibol

| **Pelota Normal** | **Pelota Plus** | **Pelota de Playa** |
|:-----------------:|:---------------:|:-------------------:|
| ![Normal](VolleyClash_juego/public/ASSETS/ITEMS/PELOTAS/P_NORMAL.png) | ![Plus](VolleyClash_juego/public/ASSETS/ITEMS/PELOTAS/P_PLUS.png) | ![Playa](VolleyClash_juego/public/ASSETS/ITEMS/PELOTAS/P_PLAYA.png) |


#### Campo de Juego

| **Marco PowerUp** | **Timer** | **Red** |
|:-----------------:|:---------------:|:-------------------:|
| ![Marco](VolleyClash_juego/public/ASSETS/JUEGO/Base_powerUp.png) | ![Timer](VolleyClash_juego/public/ASSETS/JUEGO/TIMER.png) | ![Red](VolleyClash_juego/public/ASSETS/JUEGO/RED.png) |

---

# 6. Sonido
## 6.1 Música
El juego tiene una música alegre y veraniega que acompaña los partidos y transmite energía positiva.  
La canción principal es esta. Se han buscado canciones que se pudiesen repetir en bucle, para asegurarnos de que no haya cortes en partidas largas, y el tema principal del *Pou* encajaba perfectamente.  
[Enlace a la música principal](https://www.youtube.com/watch?v=XprZqZk87xE&list=RDXprZqZk87xE&start_radio=1https://www.youtube.com/watch?v=XprZqZk87xE&list=RDXprZqZk87xE&start_radio=1)


## 6.2 Efectos de sonido
Los efectos sonoros son simples y dinámicos, pensados para reforzar la acción del juego.  
Incluyen sonidos de:
- Menú principal  ->  [Efecto de Menú Principal](https://freesound.org/people/Sunsai/sounds/415805/)  
- Golpes de pelota  ->  [Efecto de Golpes de Pelota](https://freesound.org/people/16HPanskaResatko_Matej/sounds/497968/)  
- Salto  ->  [Efecto de Salto](https://freesound.org/people/vibritherabjit123/sounds/644410/)  
- Punto ganado  ->  [Efecto Conseguir un Punto](https://freesound.org/people/Scrampunk/sounds/345297/)  
- Partida ganada o perdida  -> [Efecto de Victoria](https://freesound.org/people/shinephoenixstormcrow/sounds/337049/) - [Efecto de Victoria 2](https://freesound.org/people/FunWithSound/sounds/456965/) - [Efecto de Derrota](https://freesound.org/people/martcraft/sounds/651626/)  

---

# 7. Narrativa
## 7.1 Historia general del juego
Cada verano se celebra un campeonato de voleibol, donde los jugadores se enfrentan en duelos 1 contra 1 para demostrar quién es el mejor en la arena.  
El juego no tiene una narrativa compleja, su enfoque está en la diversión, la competición y la habilidad.  
El objetivo es ganar puntos, avanzar entre los partidos y coronarse campeón del verano demostrando quién es el mejor del campeonato.


## 7.2 Desarrollo de personajes
Hay varios personajes jugables, cada uno con un estilo visual y personalidad propias:

- **Jugador A:** personaje equilibrado y simpático.  
- **Jugador B:** rápido y competitivo.  
- **Jugador C:** divertido y algo distraído.  

No tienen historia individual, pero cada uno aporta variedad visual y un toque de personalidad al juego. Lo importante en este juego es que el jugador se divierta y le guste el diseño visual de los personajes.


## 7.3 Contexto y ambientación
El juego se desarrolla principalmente en una playa soleada, aunque pueden existir otros escenarios como gimnasios o pistas exteriores.  
La atmósfera general es veraniega, alegre y competitiva, con un estilo pixel-art colorido y una banda sonora ligera que evoca diversión y vacaciones.  
La ambientación busca transmitir la sensación de un torneo de verano casual, donde el espíritu deportivo y la diversión son los protagonistas.

---

# 8. Comunicación y Marketing
El objetivo de nuestra campaña de marketing es conseguir que **Volley Clash** se vuelva popular en portales de juegos gratuitos, aprovechando la viralidad de las redes sociales y la sencillez de acceso para crear una comunidad activa de jugadores que compitan y compartan sus partidas. Se busca atraer a jugadores casuales que disfrutan de los clásicos juegos de navegador, ofreciendo partidas rápidas, competitivas y divertidas de voleibol 1 contra 1, con una estética colorida y dinámica inspirada en el modo vóley del juego *Pou*.  


## 8.1 Estrategia de difusión y canales

### Difusión en portales de juegos online
- Publicar el juego en distintas plataformas web de juegos gratuitos.  
- Optimizar el título, las etiquetas y la descripción para que destaque (por ejemplo: *“Juego de voley 1v1”*, *“Multijugador divertido”*, *“Juego rápido de playa”*).

### Redes sociales
- Crear clips cortos mostrando jugadas divertidas o momentos competitivos.  
- Compartir memes o gifs del juego en comunidades de **Discord**, **Reddit** o redes sociales centradas en juegos casuales.

### Colaboraciones y comunidad
- Contactar con streamers o creadores de contenido que jueguen a títulos de navegador.  
- Fomentar la participación mediante desafíos y torneos informales entre jugadores.

### Identidad visual y marca
- Nombre corto, fácil de recordar y relacionado con la acción del juego: **Volley Clash**.  
- Estilo visual colorido, alegre y con temática veraniega o de playa.  
- Logotipo simple y reconocible, con personajes divertidos y animaciones ligeras.

### Campaña de lanzamiento
- Publicación gratuita en varias plataformas de juegos online.  
- Promoción inicial con mini eventos o desafíos (*“Gana 5 partidos seguidos”*, *“Vence a tu amigo”*).  
- Uso de comentarios y valoraciones de los usuarios para mejorar la visibilidad en las plataformas.  


## 8.2 Público objetivo
- Jugadores casuales entre 8 y 25 años.  
- Personas que frecuentan páginas de juegos gratuitos como *Friv*, *Minijuegos*, *1001Juegos*, etc.  
- Usuarios que buscan diversión rápida sin necesidad de descargas ni registros.  
---
# 9. Comunicación
## 9.1 Comunicacion Cliente servidor con API REST
Se ha creado un servidor que funciona en entorno local y que se encarga de gestionar y almacenar los datos del juego. Siguiendo una arquitectura cliente–servidor, el cliente es responsable de la interacción con el usuario y de la presentación de la información, mientras que el servidor gestiona la lógica de negocio y el almacenamiento de datos.

A través del protocolo HTTP, el servidor expone una API REST que permite administrar la información local del juego de forma estructurada y segura. Gracias a esta implementación, el servidor es capaz de realizar las siguientes acciones:
* Crear y eliminar usuarios, mediante peticiones POST y DELETE.
El registro de usuarios se realiza a través del endpoint /api/register, donde se valida la existencia previa del usuario y la corrección de la contraseña antes de almacenarlo. La eliminación de usuarios se gestiona mediante /api/users/:username, requiriendo la contraseña para garantizar la seguridad de la operación.

* Iniciar y cerrar sesión, mediante peticiones POST.
El inicio de sesión se gestiona en /api/login, validando las credenciales y manteniendo un registro de los usuarios activos en el servidor. El cierre de sesión se realiza mediante /api/logout, eliminando al usuario de la lista de jugadores conectados y liberando su sesión activa.

* Comunicar el estado del servidor.
El servidor dispone de un endpoint /status que permite comprobar si se encuentra activo y operativo, facilitando la verificación del estado del sistema desde el cliente.

* Informar del número de usuarios conectados.
A través del endpoint /api/players/count, el servidor devuelve en tiempo real el número de jugadores actualmente conectados, información que se gestiona mediante una lista interna de jugadores activos.

* Almacenar datos como el nombre de usuario, contraseña y estadísticas de partidas jugadas, ganadas y perdidas.
Cada usuario almacena de forma persistente sus estadísticas de juego, que se actualizan al finalizar cada partida mediante el endpoint /api/game/finish. Además, el perfil del jugador puede consultarse mediante /api/users/profile/:username.

* Generar un ranking con los cinco jugadores más destacados.
El servidor genera dinámicamente un ranking de los cinco mejores jugadores en función del número de partidas ganadas, accesible a través del endpoint /api/topPlayers, devolviendo únicamente la información relevante para su visualización en el cliente.

## 9.2 Comunicacion asincrona con WebSockests

---

# 10. Referencias
- Fuentes de inspiración:
    - **Haikyuu!!** — Referente temático y estético de voleibol.
    - **Pou – Modo vóley** — Referente de ritmo arcade y tono casual. 

- Música y audio utilizados:
    - Audio de terceros (con copyright):
        - **Pou – Tema principal**  
  **Juego:** *Pou*  
  **Titular de derechos:** Zakeh / Paul Salameh  
  **Fuente oficial de referencia:** YouTube – “Pou MusiX / Soundtrack” [Enlace](https://www.youtube.com/watch?v=XprZqZk87xE&list=RDXprZqZk87xE&start_radio=1https://www.youtube.com/watch?v=XprZqZk87xE&list=RDXprZqZk87xE&start_radio=1)  
  **Licencia:** Obra con copyright. Uso en el prototipo con fines académicos internos.

    - Efectos de sonido (Freesound)
        - **Menú principal** — *Sunsai*. [Enlace](https://freesound.org/people/Sunsai/sounds/415805/) — Licencia: Attribution 4.0
        - **Inicio de partido (silbato)** — SpliceSound. [Enlace](https://freesound.org/people/SpliceSound/sounds/218318/) — Licencia: Creative Commons 0
        - **Golpe de pelota** — *16HPanskaResatko_Matej*. [Enlace](https://freesound.org/people/16HPanskaResatko_Matej/sounds/497968/) — Licencia: Creative Commons 0  
        - **Salto** — *vibritherabjit123*. [Enlace](https://freesound.org/people/vibritherabjit123/sounds/644410/) — Creative Commons 0  
        - **Punto ganado** — *Scrampunk*. [Enlace](https://freesound.org/people/Scrampunk/sounds/345297/) — Licencia: Attribution 4.0  
        - **Victoria** — *shinephoenixstormcrow*. [Enlace](https://freesound.org/people/shinephoenixstormcrow/sounds/337049/) — Licencia: Attribution 3.0 
        - **Victoria 2** — *FunWithSound*. [Enlace](https://freesound.org/people/FunWithSound/sounds/456965/) — Licencia: Creative Commons 0  
        - **Derrota** — *martcraft*. [Enlace](https://freesound.org/people/martcraft/sounds/651626/) — Licencia: Creative Commons 0

- Recursos propios del proyecto: 
    - **Arte y UI** (logotipo, escenarios, personajes, iconos, *power-ups*): **creación original del equipo**.
---


# 11. Licencia
**Licencia Apache 2.0**  
Este proyecto está bajo la licencia Apache 2.0. Consulta el archivo LICENSE para más información.

---

# 12. Enlaces del Proyecto

El juego **Volley Clash** se encuentra disponible en varias plataformas de distribución de juegos web:

- **Newgrounds**  
  https://www.newgrounds.com/portal/view/1013538

- **Game Jolt**  
  https://gamejolt.com/games/volley-clash/1041346

- **Itch.io**  
  https://splatboy32.itch.io/volley-clash
