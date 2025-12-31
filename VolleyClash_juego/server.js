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

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, error: 'El usuario ya existe' });
    }

    // Guardamos el nuevo usuario
    users.push({ username, password });
    saveUsers(users);

    console.log(`Usuario registrado: ${username}`);
    res.json({ success: true, message: 'Usuario creado con éxito' });
});

let activePlayers = [];

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

// Limpieza de usuarios
app.post('/api/logout', (req, res) => {
    const { username } = req.body;
    activePlayers = activePlayers.filter(u => u !== username);
    console.log(`Usuario ${username} ha cerrado sesión.`);
    res.json({ success: true });
});

// Esto asegura que si se refresca la página, se cargue el index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});