// Mantiene un set de clientes WebSocket conectados,
// con helpers para send/broadcast con JSON

function createConnectionService() {
    const clients = new Set();  // set de WebSockets conectados

    // Agrega un cliente ws al set
    function add(ws) {
        clients.add(ws);
    }

    // Quita un cliente ws del set
    function remove(ws) {
        clients.delete(ws);
    }

    // Envía un mensaje JSON seguro a un cliente ws
    function safeSend(ws, msgObj) {
        // la comparación es numérica para no depender de imports extra
        if (!ws || ws.readyState !== 1) return;
        ws.send(JSON.stringify(msgObj));
    }
    function send(ws, type, payload = {}) {
        safeSend(ws, { type, ...payload });
    }

    // Envía un mensaje JSON a todos los clientes ws conectados
    function broadcast(type, payload = {}) {
        for (const client of clients) {
            safeSend(client, { type, ...payload });
        }
    }

    // Envía un mensaje JSON a todos los clientes ws conectados excepto uno
    function broadcastExcept(exceptWs, type, payload = {}) {
        for (const client of clients) {
            if (client === exceptWs) continue;
            safeSend(client, { type, ...payload });
        }
    }

    // Devuelve un array con todos los clientes ws conectados
    function getAll() {
        return Array.from(clients);
    }

    return {
        add,
        remove,
        send,
        broadcast,
        broadcastExcept,
        getAll
    };
}

module.exports = { createConnectionService };
