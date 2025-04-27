// Importación de librería
const mongoose = require('mongoose');

// Creación de esquema de contacto
const contactoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    nacimiento: {
        type: Date,
        require: true
    }
});

// Exportación del modelo "Contacto"
const Contacto = mongoose.model('Contacto', contactoSchema);

module.exports = Contacto;