// Gestiona el lobby (roomPlayers, roomScenario, ready y host),
// y cuando hay 2 jugadores y ambos están ready se llama a start_game

function createMatchmakingService(connectionService, gameRoomService, getMeta) {
    let roomPlayers = [];   // [{ ws, id, username, character, ready, isHost }]
    let roomScenario = null;

    // Devuelve la info pública de un jugador
    function toPublicPlayer(p) {
        return {
            id: p.id,
            username: p.username,
            character: p.character,
            ready: p.ready,
            isHost: p.isHost
        };
    }

    // Envía a todos los jugadores del lobby el estado actualizado
    function broadcastLobbyUpdate() {
        connectionService.broadcast('lobby_update', {
            players: roomPlayers.map(toPublicPlayer),
            selectedScenario: roomScenario
        });
    }

    // Marca el meta del ws como host/no-host (si existe)
    function setMetaHost(ws, value) {
        if (!getMeta) return;
        const meta = getMeta(ws);
        if (meta) meta.isHost = !!value;
    }

    // Asegura que haya un host asignado
    function ensureHost() {
        if (roomPlayers.length === 0) return;

        if (!roomPlayers.some(p => p.isHost)) {
            roomPlayers[0].isHost = true;
            setMetaHost(roomPlayers[0].ws, true);
        }
    }

    // Un cliente WebSocket se une al lobby
    function joinLobby(ws, userData) {
        const { username, character, selectedScenario } = userData || {};

        if (!username || username === 'undefined') {
            connectionService.send(ws, 'error', { message: 'Username inválido en join_lobby' });
            return;
        }

        if (gameRoomService?.isMatchActive?.()) {
            connectionService.send(ws, 'error', { message: 'Partida en curso' });
            return;
        }

        // se actualiza el escenario si llega
        if (selectedScenario) roomScenario = selectedScenario;

        // se evitan duplicados por username
        const existingIndex = roomPlayers.findIndex(p => p.username === username);
        if (existingIndex !== -1) {
            const old = roomPlayers[existingIndex];

            // se cierra la conexión antigua si era distinta
            if (old.ws !== ws) {
                try {
                    connectionService.send(old.ws, 'error', { message: 'Sesión reemplazada por reconexión' });
                    old.ws.close();
                } catch { }
            }
            roomPlayers.splice(existingIndex, 1);
        }

        // máximo 2 jugadores
        if (roomPlayers.length >= 2) {
            connectionService.send(ws, 'error', { message: 'Lobby lleno (máx 2 jugadores)' });
            return;
        }

        // meta desde el Map (id, etc.)
        const meta = getMeta ? getMeta(ws) : null;
        const id = meta?.id ?? null;

        const player = {
            ws,
            id,
            username,
            character: character || null,
            ready: false,
            isHost: roomPlayers.length === 0
        };

        // se guardan los datos
        if (meta) {
            meta.username = username;
            meta.character = player.character;
            meta.isHost = player.isHost;
        }

        roomPlayers.push(player);
        ensureHost();
        broadcastLobbyUpdate();
    }

    // Cambia el escenario para esa sala
    function setScenario(ws, scenario) {
        // solo el host puede cambiarlo
        const me = roomPlayers.find(p => p.ws === ws);
        if (!me || !me.isHost) return;

        roomScenario = scenario || roomScenario;
        broadcastLobbyUpdate();
    }

    // Cambia el estado del jugador a ready
    function setReady(ws, isReady) {
        const p = roomPlayers.find(x => x.ws === ws);
        if (!p) return;

        p.ready = !!isReady;
        broadcastLobbyUpdate();

        // si hay 2 y ambos están ready se llama a start_game
        if (roomPlayers.length === 2 && roomPlayers.every(x => x.ready)) {
            const publicPlayers = roomPlayers.map(toPublicPlayer);
            const wss = roomPlayers.map(x => x.ws);

            connectionService.broadcast('log', { message: '¡Todos listos! Iniciando partida...' });

            gameRoomService.startMatch(publicPlayers, wss, roomScenario);

            // se resetea el ready
            roomPlayers.forEach(x => (x.ready = false));
            broadcastLobbyUpdate();
        }
    }

    // Un cliente WebSocket abandona el lobby
    function leave(ws) {
        const leavingIndex = roomPlayers.findIndex(p => p.ws === ws);
        if (leavingIndex === -1) return;

        const leavingPlayer = roomPlayers[leavingIndex];
        roomPlayers.splice(leavingIndex, 1);

        // se avisa del abandono
        connectionService.broadcastExcept(ws, 'player_abandoned', {
            username: leavingPlayer.username
        });

        // si el que se va era host, se reasigna
        if (leavingPlayer.isHost && roomPlayers.length > 0) {
            roomPlayers.forEach(p => {
                p.isHost = false;
                setMetaHost(p.ws, false);
            });

            roomPlayers[0].isHost = true;
            setMetaHost(roomPlayers[0].ws, true);
        }

        ensureHost();
        broadcastLobbyUpdate();

        // si estaba en un match, se cierra
        gameRoomService.endMatchIfContains(ws);
    }

    return {
        joinLobby,
        setScenario,
        setReady,
        leave,
        // para debug
        getPlayers: () => roomPlayers.map(toPublicPlayer),
        getScenario: () => roomScenario
    };
}

module.exports = { createMatchmakingService };
