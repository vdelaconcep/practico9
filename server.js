// Librerías
const mongoose = require('mongoose')

// Importamos configuración del servidor
const app = require('./app')

// Conexión con la base de datos local
mongoose.connect('mongodb://localhost:27017/practico9')
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.log('No se puedo conectar con la base de datos', err));

// Definimos el puerto
const PORT = 3000;

// Ponemos a escuchar el servidor
app.listen(PORT, (req, res) => {
    console.log(`Servidor escuchando en: http://localhost:${PORT}`);
});