// Configuración del servidor:

// Librerías
const express = require('express');

// Creación del servidor
const app = express();

// Middlewares
app.use(express.static('public'));
app.use(express.json());

app.post('/', (req, res) => {
    const contacto = {
        nombre: req.body.nombre,
        email: req.body.email,
        nacimiento: req.body.nacimiento
    }
})

// Middlewares de error
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

app.use((req, res) => {
    res.status(500).send('Error interno del servidor');
});

// Exportamos el servidor
module.exports = app;
