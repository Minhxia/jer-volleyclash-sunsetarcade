// Se encarga de retransmitir mensajes in-game entre los jugadores,
// y mantiene un match activo (2 jugadores) para limitar broadcasts

function createGameRoomService(connectionService, getMeta) {
    let match = null; // {players: [ws1, ws2], hostWs: ws o null, escenario}

    // Inicia un match con dos jugadores y un escenario
    function startMatch(playerEntriesPublic, playerWss, scenario) {
        const hostIndex = playerEntriesPublic.findIndex(p => p.isHost);
        const hostWs = hostIndex >= 0 ? playerWss[hostIndex] : (playerWss[0] || null);
        const seed = Date.now().toString();

        match = {
            players: playerWss,
            hostWs,
            scenario,
            rallyId: 0,
            seed
        };

        // se notifica a ambos jugadores
        for (const ws of playerWss) {
            connectionService.send(ws, 'start_game', {
                players: playerEntriesPublic,
                selectedScenario: scenario,
                seed
            });
        }
    }

    // Termina el match si contiene al ws dado
    function endMatchIfContains(ws) {
        if (!match) return;
        if (!match.players.includes(ws)) return;
        match = null;
    }

    // Comprueba si hay una partida activa
    function isMatchActive() {
        return !!match;
    }

    // Comprueba si un ws está en el match actual
    function isInMatch(ws) {
        return !!match && match.players.includes(ws);
    }

    // Envía un mensaje a todos los jugadores del match
    function sendToMatch(type, payload = {}) {
        if (!match) return;
        for (const ws of match.players) {
            connectionService.send(ws, type, payload);
        }
    }

    // Envía un mensaje al oponente del ws dado
    function sendToOpponent(ws, type, payload = {}) {
        if (!isInMatch(ws)) return;
        for (const other of match.players) {
            if (other !== ws) {
                connectionService.send(other, type, payload);
            };
        }
    }

    // Maneja la desconexión de un jugador
    function handleDisconnect(ws) {
        if (!match || !isInMatch(ws)) return;

        const opponent = match.players[0] === ws ? match.players[1] : match.players[0];

        if (opponent.readyState === 1) { // WebSocket.OPEN
            opponent.send(JSON.stringify({
                type: 'playerDisconnected'
            }));
        }

        // Clean up room
        match = null;
    }

    //// EVENTOS DE JUEGO ////
    // Estos métodos se llaman desde server.js al recibir mensajes in-game

    // Maneja el movimiento de un jugador
    function handlePlayerMove(ws, moveData) {
        if (!isInMatch(ws)) return;

        const meta = getMeta ? getMeta(ws) : null;

        sendToOpponent(ws, 'opponent_move', {
            playerName: moveData.playerName,
            command: moveData.command
        });
    }

    // Controla la sincronización de la pelota
    function handleBallSync(ws, ballData) {
        if (!isInMatch(ws)) return;
        if (match.hostWs && ws !== match.hostWs) return;

        // usar seq si viene, sino timestamp actual
        const seq = Number.isFinite(ballData.seq) ? ballData.seq : Date.now();

        const payload = {
            rallyId: match.rallyId ?? 0,
            x: ballData.x,
            y: ballData.y,
            vx: ballData.vx,
            vy: ballData.vy,
            seq
        };

        // para resync
        match.lastBallState = payload;

        sendToOpponent(ws, 'ball_update', payload);
    }

    // Controla el reseteo de la pelota
    function handleBallReset(ws, data) {
        if (!isInMatch(ws)) return;
        if (match.hostWs && ws !== match.hostWs) return;

        match.rallyId = (match.rallyId ?? 0) + 1;

        const seq = Number.isFinite(data.seq) ? data.seq : Date.now();

        sendToMatch('ball_reset', {
            rallyId: match.rallyId,
            x: data.x,
            y: data.y,
            vx: data.vx,
            vy: data.vy,
            reason: data.reason ?? 'point' // 'set_start', 'set_reset', etc.
        });
    }

    // Controla el spawn de un power-up
    function handleSpawnPowerUp(ws, data) {
        if (!isInMatch(ws)) return;
        if (match.hostWs && ws !== match.hostWs) return;

        sendToOpponent(ws, 'spawn_powerup', {
            id: data.id,
            x: data.x,
            y: data.y,
            powerType: data.powerType
        });
    }

    // Controla la eliminación de un power-up
    function handleRemovePowerUp(ws, data) {
        if (!isInMatch(ws)) return;
        if (match.hostWs && ws !== match.hostWs) return;

        sendToOpponent(ws, 'remove_powerup', { id: data.id });
    }

    // Controla la sincronización del inventario
    function handleInventorySync(ws, data) {
        if (!isInMatch(ws)) return;
        if (match.hostWs && ws !== match.hostWs) return;

        //  en cliente ya se filtra con !isHostClient()
        sendToMatch('inv_sync', {
            p1Inv: data.p1Inv ?? [],
            p2Inv: data.p2Inv ?? []
        });
    }

    // Controla la actualización del marcador
    function handleScoreUpdate(ws, scoreData) {
        console.log('[SERVER] update_score recibido', scoreData);

        if (!isInMatch(ws)) return;
        if (match.hostWs && ws !== match.hostWs) return;

        const { type, ...payload } = scoreData; // quita "update_score"
        sendToMatch('score_sync', payload);
    }

    // Reenvía un mensaje al oponente
    function forwardToOpponent(ws, type, payload = {}) {
        if (!isInMatch(ws)) return;
        sendToOpponent(ws, type, payload);
    }

    // Envía un mensaje a todos los jugadores del match
    function broadcastToMatch(type, payload = {}) {
        sendToMatch(type, payload);
    }

    return {
        startMatch,
        endMatchIfContains,
        isMatchActive,

        handleDisconnect,
        handlePlayerMove,
        handleBallSync,
        handleBallReset,
        handleSpawnPowerUp,
        handleRemovePowerUp,
        handleScoreUpdate,
        handleInventorySync,
        forwardToOpponent,
        broadcastToMatch
    };
}

module.exports = { createGameRoomService };
