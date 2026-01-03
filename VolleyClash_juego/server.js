const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
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
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// USUARIOS ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//LISTA DE SARIOS CONECTADOS
let activePlayers = [];

//CREAR USUSARIO
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
    users.push({ username, 
        password, 
        partidaJugadas: 0, 
        partidasGanadas: 0, 
        partidasPerdidas:0 });
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

        const isHost = activePlayers[0] === username;

        console.log(`Login exitoso: ${username} | ¿Es Host?: ${isHost}`);
        console.log(`Jugadores activos: [${activePlayers.join(', ')}]`);
        
        // Token
        res.json({ 
            success: true, 
            username: user.username, 
            token: `token-${user.username}`,
            isHost: isHost
        });
    } else {
        res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }
});

// CERRAR SESION DE UN USARIO
app.post('/api/logout', (req, res) => {
    const { username } = req.body;
    activePlayers = activePlayers.filter(u => u !== username);
    console.log(`Usuario ${username} ha cerrado sesión.`);
    res.json({ success: true });
});

// NUMERO DE JGADORES CONECTADOS
app.get('/api/players/count', (req, res) => {
    res.json({ count: activePlayers.length });
});

// LISTA DE JUUGADORES CONECTADOS
app.get('/api/players/list', (req, res) => {
    res.json({ activePlayers });
});

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

//ACTALIZAR LAS PARTIDAS DEL USUARIO AL ACABAR PARTIDA
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
        console.log(`🏆 ${username} ha GANADO la partida`);
    } else if (winner === "player2") {
        user.partidasPerdidas++;
        console.log(`❌ ${username} ha PERDIDO la partida`);
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
        .sort((a, b) => b.partidasGanadas - a.partidasGanadas)
        .slice(0, 5); // Tomamos solo los 5 primeros

    res.json({ topPlayers });
});

//ESTADO DEL SERVIDOR
app.get('/status', (req, res) => {
    res.status(200).send('active');
});



// Esto asegura que si se refresca la página, se cargue el index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});