const { WebSocketServer } = require('ws');

const { createConnectionService } = require('./services/connectionService');
const { createGameRoomService } = require('./services/gameRoomService');
const { createMatchmakingService } = require('./services/matchmakingService');

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
// TODO const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// TODO const io = new Server(server);
const lastSeen = new Map();

const PORT = process.env.PORT || 8080;

// Ruta del archivo para la base de datos
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

// Lectura y escritura en la base de datos
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// ----- API REST -----

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// USUARIOS //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//LISTA DE SARIOS CONECTADOS
let activePlayers = [];

//REGISTRAR USUSARIO
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, error: 'El usuario ya existe' });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
        return res.status(400).json({ success: false, error: 'Password inválido' });
    }

    // Guardamos el nuevo usuario
    users.push({
        username,
        password,
        partidaJugadas: 0,
        partidasGanadas: 0,
        partidasPerdidas: 0
    });
    saveUsers(users);

    console.log(`Usuario registrado: ${username}`);
    res.json({ success: true, message: 'Usuario creado con éxito' });
});

// ELIMINAR USUARIO
app.delete('/api/users/:username', (req, res) => {
    const username = req.params.username;
    const { password } = req.body; // Obtenemos la contraseña enviada desde el cliente

    const users = readUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Validamos la contraseña
    const user = users[userIndex];
    if (user.password !== password) {
        return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Eliminamos al usuario
    users.splice(userIndex, 1);
    saveUsers(users);

    console.log(`Usuario eliminado: ${username}`);
    res.json({ success: true, message: `Usuario ${username} eliminado` });
});

//INICIAR SESION
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        if (!activePlayers.includes(username)) {
            activePlayers.push(username);
        }

        // const isHost = activePlayers[0] === username;

        // console.log(`Login exitoso: ${username} | ¿Es Host?: ${isHost}`);
        console.log(`Login exitoso: ${username}`);
        console.log(`Jugadores activos: [${activePlayers.join(', ')}]`);

        // Token
        res.json({
            success: true,
            username: user.username,
            token: `token-${user.username}`,
            // isHost: isHost
        });
    } else {
        res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }
});

// CERRAR SESION DE UN USUARIO
app.post('/api/logout', (req, res) => {
    const { username } = req.body;
    activePlayers = activePlayers.filter(u => u !== username);
    lastSeen.delete(username);
    console.log(`Usuario ${username} ha cerrado sesión.`);
    res.json({ success: true });
});

// NUMERO DE JUGADORES CONECTADOS
app.get('/api/players/count', (req, res) => {
    res.json({ count: activePlayers.length });
});

// LISTA DE JUGADORES CONECTADOS
app.get('/api/players/list', (req, res) => {
    res.json({ activePlayers });
});

// ULTIMA VEZ VISTOS
app.get('/api/users/keepalive/:username', (req, res) => {
    const { username } = req.params;

    if (username && username !== 'undefined') {
        if (!activePlayers.includes(username)) {
            return res.status(401).json({
                success: false,
                error: 'Session expired',
                message: 'Inactividad detectada. Re-conectando...'
            });
        }
        lastSeen.set(username, Date.now());
        return res.json({ success: true, count: activePlayers.length });
    }
    res.status(400).json({ error: 'Invalid user' });
});

setInterval(() => {
    const now = Date.now();
    for (const [username, timestamp] of lastSeen.entries()) {
        if (now - timestamp > 10000) {
            console.log(`[Servidor] Desconexión detectada (timeout): ${username}`);

            lastSeen.delete(username);

            const antes = activePlayers.length;
            activePlayers = activePlayers.filter(u => u !== username);

            if (antes !== activePlayers.length) {
                console.log(`[Servidor] Lista actualizada tras timeout: [${activePlayers.join(', ')}]`);
                // Avisar a los clientes del cambio en el conteo
                // io.emit('lobby_update', roomPlayers.filter(p => p.username !== username));
            }
        }
    }
}, 5000);

///////////////////////////////////////////////////////////////////////////////
////////////////////////// DATOS ALMACENADOS //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//MOSTRAR PARTIDAS ALMACENADAS DE UN USUARIO
app.get('/api/users/profile/:username', (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.username === req.params.username);

    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
        username: user.username,
        partidaJugadas: user.partidaJugadas,
        partidasGanadas: user.partidasGanadas,
        partidasPerdidas: user.partidasPerdidas
    });
});

//ACTUALIZAR LAS PARTIDAS DEL USUARIO AL ACABAR PARTIDA
app.put('/api/game/finish', (req, res) => {
    const { username, winner } = req.body;

    if (!username || !winner) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.partidaJugadas++;

    if (winner === "player1") {
        user.partidasGanadas++;
        console.log(`${username} ha GANADO la partida`);
    } else if (winner === "player2") {
        user.partidasPerdidas++;
        console.log(`${username} ha PERDIDO la partida`);
    } else {
        return res.status(400).json({ error: 'Winner inválido' });
    }

    saveUsers(users);

    res.json({
        success: true,
        partidaJugadas: user.partidaJugadas,
        partidasGanadas: user.partidasGanadas,
        partidasPerdidas: user.partidasPerdidas
    });
});

//RANKING DE LOS 5 MEJORES JUGADORES
app.get('/api/topPlayers', (req, res) => {
    const users = readUsers();


    // Ordenamos de mayor a menor por partidasGanadas
    const topPlayers = users
        .sort((a, b) => (b.partidasGanadas || 0) - (a.partidasGanadas || 0))
        .slice(0, 5) // Tomamos solo los 5 primeros
        .map(u => ({ // Devolvemos solo los campos necesarios
            username: u.username,
            partidasGanadas: (u.partidasGanadas || 0),
            partidaJugadas: (u.partidaJugadas || 0),
            partidasPerdidas: (u.partidasPerdidas || 0)
        }));

    res.json({ topPlayers });
});

//ESTADO DEL SERVIDOR
app.get('/status', (req, res) => {
    res.status(200).send('active');
});


// ----- WEBSOCKETS -----

// Map: ws -> { id, username, character, isHost, isAlive }
const clients = new Map();
// Datos del jugador
function getMeta(ws) {
    return clients.get(ws);
}

const connectionService = createConnectionService();
const gameRoomService = createGameRoomService(connectionService, getMeta);
const matchmakingService = createMatchmakingService(connectionService, gameRoomService, getMeta);

const wss = new WebSocketServer({ server });

let nextWsId = 1;

// Inicializa los datos para un ws
function initMeta(ws) {
    const meta = {
        id: `ws_${nextWsId++}`,
        username: null,
        character: null,
        isHost: false,
        isAlive: true
    };
    clients.set(ws, meta);
    return meta;
}

// Convierte RawData a string
function rawToText(raw) {
    // raw: RawData (string | Buffer | ArrayBuffer | Buffer[])
    if (typeof raw === 'string') return raw;
    if (Buffer.isBuffer(raw)) return raw.toString('utf8');
    if (Array.isArray(raw)) return Buffer.concat(raw).toString('utf8');
    if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString('utf8');
    return String(raw);
}

// Evento de nueva conexión
wss.on('connection', (ws) => {
    const meta = initMeta(ws);

    connectionService.add(ws);
    console.log(`[WS] Conectado: ${meta.id}`);

    // Manejo de pong para keep-alive
    ws.on('pong', () => {
        const m = getMeta(ws);
        if (m) m.isAlive = true;
    });

    // Manejo de mensajes entrantes
    ws.on('message', (raw) => {
        let data;
        try {
            const text = rawToText(raw);
            data = JSON.parse(text);
        } catch {
            connectionService.send(ws, 'error', { message: 'JSON inválido' });
            return;
        }

        const type = data?.type;
        if (!type) {
            connectionService.send(ws, 'error', { message: 'Mensaje sin "type"' });
            return;
        }

        switch (type) {
            // ----- Lobby -----
            case 'join_lobby': {
                matchmakingService.joinLobby(ws, data);
                break;
            }

            case 'select_scenario':
                matchmakingService.setScenario(ws, data.selectedScenario);
                break;


            case 'player_ready':
                matchmakingService.setReady(ws, !!data.isReady);
                break;

            // ----- In-game sync -----
            case 'player_move':
                gameRoomService.handlePlayerMove(ws, {
                    x: data.x,
                    y: data.y,
                    anim: data.anim,
                    flipX: data.flipX
                });
                break;

            case 'ball_sync':
                gameRoomService.handleBallSync(ws, {
                    x: data.x,
                    y: data.y,
                    vx: data.vx,
                    vy: data.vy
                });
                break;

            case 'update_score':
                gameRoomService.handleScoreUpdate(ws, data);
                break;

            case 'set_finished_sync':
                gameRoomService.forwardToOpponent(ws, 'set_finished_sync', data);
                break;

            case 'golden_point_sync':
                gameRoomService.forwardToOpponent(ws, 'force_golden_point', {});
                break;

            case 'game_finished':
                gameRoomService.broadcastToMatch('match_finished', data);
                break;

            case 'use_powerup':
                gameRoomService.forwardToOpponent(ws, 'apply_powerup', data);
                break;

            case 'spawn_powerup':
                gameRoomService.forwardToOpponent(ws, 'force_spawn_powerup', data);
                break;

            case 'timer_sync':
                gameRoomService.forwardToOpponent(ws, 'timer_sync', data);
                break;

            default:
                connectionService.send(ws, 'error', { message: `Tipo desconocido: ${type}` });
                break;
        }
    });

    ws.on('close', () => {
        const m = getMeta(ws);
        console.log(`[WS] Desconectado: ${m?.id ?? 'unknown'}`);

        // saca del lobby y notifica abandono
        matchmakingService.leave(ws);

        // limpieza de conexión
        connectionService.remove(ws);

        // al desconectar, quitar del listado de activos
        if (m?.username) {
            activePlayers = activePlayers.filter(u => u !== m.username);
            lastSeen.delete(m.username);
        }
        gameRoomService.handleDisconnect(ws);
        clients.delete(ws);
    });

    ws.on('error', (err) => {
        const m = getMeta(ws);
        console.error(`[WS] Error (${m?.id ?? 'unknown'}):`, err);
    });
});

// Intervalo de ping para detectar desconexiones “silenciosas”
const interval = setInterval(() => {
    for (const [ws, meta] of clients) {
        if (meta.isAlive === false) {
            console.log(`[WS] Terminando conexión muerta: ${meta.id}`);
            ws.terminate();
            clients.delete(ws);
            continue;
        }

        meta.isAlive = false;
        ws.ping();
    }
}, 30000);

wss.on('close', () => clearInterval(interval));


// Si no se indica host, por defecto es 0.0.0.0
// https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback
server.listen(PORT, () => {
    console.log(`Servidor corriendo en dirección 0.0.0.0 y puerto ${PORT}`);
    console.log(`\taccesible desde http://localhost:${PORT}`);
});