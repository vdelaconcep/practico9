// Librerías
const mongoose = require('mongoose');
const express = require('express');


// Modelo de contacto en base de datos
const Contacto = require('./modeloContacto');

// Creación del servidor
const app = express();

// Puerto
const PORT = 3000;

// Conexión con la base de datos
const uri = "mongodb+srv://vdelaconcep:practico9@cluster0.lw36mte.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.log('No se pudo conectar con la base de datos', err));

// Middlewares
app.use(express.static('public'));
app.use(express.json());

// Recepción de datos desde el front
app.post('/api/contactos', async (req, res) => {
    try {
        const contactoNuevo = {
            nombre: req.body.nombre,
            email: req.body.email,
            nacimiento: req.body.nacimiento
        };

        // Registro en base de datos
        const contacto = new Contacto(contactoNuevo);
        const contactoGuardado = await contacto.save();
        res.status(200).json(contactoGuardado)
    } catch (err) {
        res.status(500).json({mensaje: 'Error al guardar el contacto'})
    }
});

// Obtención de datos desde la base de datos y envío al front
app.get('/api/contactos', async (req, res) => {
    try {
        const contactos = await (Contacto.find());
        res.status(200).json(contactos);
    } catch (error) {
        res.status(500).json({mensaje: 'Error al obtener los contactos'});
    }
});

// Modificación de un registro de la base de datos
app.put('/api/contactos/:id', async (req, res) => {
    try {
        const buscaPorID = {_id: req.params.id}

        const contactoModificado = {
            nombre: req.body.nombre,
            email: req.body.email,
            nacimiento: req.body.nacimiento
        };
        const actualizacion = await Contacto.updateOne(buscaPorID, contactoModificado);

        if (!actualizacion) {
            return res.status(404).json({mensaje: 'Contacto no encontrado'})
        }
        res.status(200).json(actualizacion);
    } catch (error) {
        res.status(500).json({mensaje: 'Error en la modificación'});
    }
})

// Eliminación de un registro de la base de datos
app.delete('/api/contactos/:id', async (req, res) => {
    try {
        const baja = await Contacto.findByIdAndDelete(req.params.id);
        if (!baja) {
            res.status(404).json({mensaje: 'Contacto no encontrado'})
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({mensaje: 'Error al eliminar el registro'})
    }
})

// Middlewares de error
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

app.use((err, req, res, next) => {
    res.status(500).send('Error interno del servidor');
});

// Ponemos a escuchar el servidor
app.listen(PORT, (req, res) => {
    console.log(`Servidor escuchando en: http://localhost:${PORT}`);
});