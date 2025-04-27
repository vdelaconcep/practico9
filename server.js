// Librerías
const mongoose = require('mongoose');
const express = require('express');

// Modelo de contacto
const Contacto = require('./modeloContacto');

// Creación del servidor
const app = express();

// Puerto
const PORT = 3000;

// Conexión con la base de datos local
mongoose.connect('mongodb://localhost:27017/practico9')
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.log('No se puedo conectar con la base de datos', err));

// Middlewares
app.use(express.static('public'));
app.use(express.json());

// Recepción de datos desde el front
app.post('/', (req, res) => {
    const contactoNuevo = {
        nombre: req.body.nombre,
        email: req.body.email,
        nacimiento: req.body.nacimiento
    };

    // Registro en base de datos
    const contacto = new Contacto(contactoNuevo);
    contacto.save();
})

// Middlewares de error
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

app.use((req, res) => {
    res.status(500).send('Error interno del servidor');
});

// Ponemos a escuchar el servidor
app.listen(PORT, (req, res) => {
    console.log(`Servidor escuchando en: http://localhost:${PORT}`);
});