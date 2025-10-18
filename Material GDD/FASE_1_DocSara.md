## :video_game: Jugabilidad
**Volley Clash** consiste en partidos rápidos (**2-5 minutos**) y competitivos de **voleibol arcade** en **1vs1** local. Cada jugador mueve a su personaje en un **entorno 2D**, y tiene que golpear la pelota en el momento adecuado para devolverla al campo rival. Además, durante el partido aparecen ***power-ups*** en la pista, que los jugadores pueden usar para ganar ventaja.

### :dart: Objetivo del juego
Gana el partido el jugador que marque antes **20 puntos**, o quien más tenga cuando termine el tiempo. Si hay empate al final, se juega un **punto de oro** en el que el siguiente punto decide el ganador.

### :joystick: Controles
- **Jugador 1:** corresponde al jugador situado a la izquierda de la red.
    - <kbd>A</kbd>/<kbd>D</kbd> para moverse hacia la izquierda y hacia la derecha, respectivamente.
    - <kbd>W</kbd> para saltar.
    - <kbd>S</kbd> para activar un *power up*.
    
- **Jugador 2:** corresponde al jugador situado a la derecha de la red.
    - <kbd>J</kbd>/<kbd>L</kbd> para moverse hacia la izquierda y hacia la derecha, respectivamente.
    - <kbd>I</kbd> para saltar.
    - <kbd>K</kbd> para activar un *power up*.

### :jigsaw: Mecánicas
#### Golpeo
Cuando la pelota entra en contacto con el jugador, rebota y la dirección se define con el movimiento del jugador (teclas).

#### Puntuación
Se anota un punto cuando la **pelota toca el suelo** del campo del rival o cuando el rival comete una **falta**.

#### *Rally point*
Cuando un jugador anota un punto, se actualiza el marcador y el juego pasa a **estado de saque**.

#### Saque
El saque lo realiza el jugador que haya anotado el último punto, desde la **zona marcada** al fondo de su campo. Para realizar el **saque inicial**, se elige a un jugador **aleatoriamente**.

#### Faltas
Un jugador comete una falta si toca la pelota **tres veces consecutivas** en su campo antes de devolverla, o si realiza un saque **fuera de la zona marcada**.

#### Límites de la pantalla
La pelota **no sale fuera** por los laterales o la parte superior, sino que **rebota** en los **límites de la pantalla** y en la **red**. Aunque la pelota rebote en el campo del jugador, **no** se reinicia su conteo de toques.

#### ***Power-ups***
Durante el partido, los *power-ups* aparecen de forma **aleatoria** en zonas válidas de la pista (nunca sobre la red). Permanecen visibles un tiempo corto (**5 segundos**) y si no se recogen, a partir de los 3 segundos empiezan a **desvanecerse** poco a poco hasta desaparecer.

- **Efectos disponibles:**
  - **Aumentar velocidad** del jugador.
  - **Ralentizar** al rival.
  - **Paralizar** al rival durante un breve intervalo.
  - **Multiplicar** la puntuación (**x2/x3**).

- **Frecuencia de aparición:** **cada 10–20 segundos** en función de la duración del partido, siempre que haya **menos de 2** *power-ups* en pantalla.

- **Duración y aplicación:** 
    - Cada efecto dura **10 segundos** desde su activación
    - Los **efectos del mismo tipo no se acumulan**, si activas el mismo efecto mientras está activo, **se refresca su duración**.
    - Los **efectos de distinto tipo sí se acumulan**, por ejemplo, paralizar al rival y multiplicar x2 a la vez.
    - El multiplicador (**x2/x3**) se aplica a **todos los puntos que anote** el jugador mientras el efecto esté activo.

#### Recogida de *power-ups* e inventario
 Cuando un jugador pasa por encima de un *power-up*, lo recoge **automáticamente** si tiene espacio en su **inventario**. Cada jugador puede guardar como **máximo 2** *power-ups*.

### :gear: Físicas
Modelo arcade 2D, basado en gravedad y rebotes.

#### Gravedad
La **gravedad** que se aplica sobre la pelota es de 9.8 m/s², que se mantiene constante.

#### Rebotes
La pelota rebota con el jugador, en la red y en los límites de la pantalla, teniendo en cuenta que cuando toca el suelo termina el *rally*.

### :world_map: Calidad del escenario
El **escenario** tiene un estilo ***pixel-art***. Los personajes y la pelota tienen una silueta clara y unos colores que contrastan con el fondo. La red también destaca, pero sin desviar la atención de los jugadores.

El **HUD** es claro y limpio. El **marcador** con la puntuación se encuentra centrado en la pantalla y es grande. El **inventario** de cada jugador se coloca en la parte superior de su propio lado de la pantalla, para que resulte más visible.

La **cámara** es estática y se mantiene centrada, de modo que se visualiza todo el escenario.

Durante toda la partida suena **música de fondo** y se producen **efectos de sonido** cuando los jugadores golpean la pelota o al anotar un punto. Al finalizar, cada jugador escucha el tono que le corresponda (de victoria o derrota).

Los ***power-ups*** tienen iconos reconocibles en función de su efecto, y un contorno para contrastar con el fondo. Al agotarse, se van volviendo invisibles gradualmente.

---

### :wrench: Aspectos ténicos
La dimensión del juego es **2D**, con una vista lateral. La **cámara** es fija y está centrada en la pantalla, sin perspectiva, permitiendo así observar todo el escenario de frente.

El **HUD** es un canvas en ***overlay*** que no afecta al encuadre, y además es responsivo.
