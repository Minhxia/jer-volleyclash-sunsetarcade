// Se encarga de retransmitir mensajes in-game entre los jugadores,
// y mantiene un match activo (2 jugadores) para limitar broadcasts

function createGameRoomService(connectionService, getMeta) {
    let match = null; // {players: [ws1, ws2], hostWs: ws o null, escenario}

    // Inicia un match con dos jugadores y un escenario
    function startMatch(playerEntriesPublic, playerWss, scenario) {
        const hostIndex = playerEntriesPublic.findIndex(p => p.isHost);
        const hostWs = hostIndex >= 0 ? playerWss[hostIndex] : (playerWss[0] || null);

        match = {
            players: playerWss,
            hostWs,
            scenario
        };

        // se notifica a ambos jugadores
        for (const ws of playerWss) {
            connectionService.send(ws, 'start_game', {
                players: playerEntriesPublic,
                selectedScenario: scenario
            });
        }
    }

    // Termina el match si contiene al ws dado
    function endMatchIfContains(ws) {
        if (!match) return;
        if (!match.players.includes(ws)) return;
        match = null;
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
            if (other !== ws) connectionService.send(other, type, payload);
        }
    }

    //// EVENTOS DE JUEGO ////
    // Estos métodos se llaman desde server.js al recibir mensajes in-game

    // Maneja el movimiento de un jugador
    function handlePlayerMove(ws, moveData) {
        if (!isInMatch(ws)) return;

        const meta = getMeta ? getMeta(ws) : null;

        sendToOpponent(ws, 'opponent_move', {
            id: meta?.id ?? null,
            x: moveData.x,
            y: moveData.y,
            anim: moveData.anim,
            flipX: !!moveData.flipX
        });
    }

    // Controla la sincronización de la pelota
    function handleBallSync(ws, ballData) {
        if (!isInMatch(ws)) return;
        if (match.hostWs && ws !== match.hostWs) return;

        sendToOpponent(ws, 'ball_update', {
            x: ballData.x,
            y: ballData.y,
            vx: ballData.vx,
            vy: ballData.vy
        });
    }

    // Controla la actualización del marcador
    function handleScoreUpdate(ws, scoreData) {
        if (!isInMatch(ws)) return;
        sendToMatch('score_sync', scoreData);
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

        handlePlayerMove,
        handleBallSync,
        handleScoreUpdate,
        forwardToOpponent,
        broadcastToMatch
    };
}

module.exports = { createGameRoomService };
