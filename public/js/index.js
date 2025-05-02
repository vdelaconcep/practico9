// Declaración de variables:
const PORT = 3000;
const tabla = document.querySelector('table');
let validacionNombre = false;
let validacionEmail = false;
let validacionFecha = false;

// Promise para crear y enviar una petición
const peticion = (metodo, url, datos) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(metodo, url, true);

        // Se configura el tipo de dato (JSON) para POST y PUT
        if (metodo == 'POST' || metodo == 'PUT') {
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        }

        xhr.onload = () => {
            
            if (xhr.status == 200) {
                
                // Si el método es "GET", devuelve los datos en la DB
                if (metodo == 'GET') {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    resolve(true);
                }
                
            } else if (xhr.status == 204 && metodo == 'DELETE') {
                resolve(true);
            } else {
                reject(new Error('Error en la petición de datos'));
            }

        };

        xhr.onerror = () => {
            reject(new Error('Error en la petición de datos'));
        };

        xhr.send(datos);
    });
};

// Función para obtener datos de la DB
const obtenerDatos = async () => {
    const data = await peticion('GET', `http://localhost:${PORT}/api/contactos`);
    return data;
}

// Función para obtener datos de un contacto a partir del id
const contactoPorId = async (id) => {
    const dataCompleta = await obtenerDatos();
    const contacto = dataCompleta.find(element => element._id == id);
    if (!contacto) return null;

    return contacto;
};

// Cargar datos en la tabla
const cargarDatos = async () => {

    const data = await obtenerDatos();

    const fragmento = document.createDocumentFragment();

    for (i = (data.length - 1); i >= 0; i--) {

        let fila = document.createElement('tr');
        fila.style = 'background-color: #C7DBD2 !important; border-bottom: 1px solid #A7B9B1';

        fila.innerHTML += `
            <td style="border-left: 1px solid #A7B9B1; border-right: 1px solid #A7B9B1">${data[i].nombre}</td>
            <td style="border-right: 1px solid #A7B9B1">${data[i].email}</td>
            <td style="border-right: 1px solid #A7B9B1">${data[i].nacimiento.slice(8, 10)}${data[i].nacimiento.slice(4, 8)}${data[i].nacimiento.slice(0, 4)}</td>
            <td data-id="${data[i]._id}" style="border-right: 1px solid #A7B9B1">
                <button data-id="${data[i]._id}" class = "btn btn-modificar btn-outline-dark m-1 border-1"><i class="fa-solid fa-file-pen"></i></button>
                <button data-id="${data[i]._id}" class = "btn-eliminar btn btn-outline-dark m-1 border-1"><i class="fa-solid fa-trash"></i></button>
            </td>
            `;
        fragmento.appendChild(fila);
    };

    tabla.appendChild(fragmento);
};

// Función para validar input nombre
function validarNombre(inputNombre, minlength, maxlength) {
    let inputValue = inputNombre.value;
    let longitud = inputValue.trim().length;
    if (longitud < minlength) {
        inputNombre.setCustomValidity('Este campo debe tener ' + minlength + ' caracteres como mínimo');
        validacionNombre = false;
    } else if (longitud > maxlength) {
        inputNombre.setCustomValidity('Este campo no debe tener más de ' + minlength + ' caracteres');
        validacionNombre = false;
    } else {
        validacionNombre = true;
    }
    inputNombre.addEventListener('input', function () {
        inputNombre.setCustomValidity("");
    });
    encodeURIComponent(inputValue);
    inputNombre.value = inputValue;
}

// Función para validar input tipo e-mail
function validarEmail(inputEmail) {
    let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    let inputValue = inputEmail.value;
    if (!regex.test(inputValue)) {
        inputEmail.setCustomValidity('Debe ingresar un e-mail válido');
        validacionEmail = false;
    } else {
        validacionEmail = true;
    }
    inputEmail.addEventListener('input', function () {
        inputEmail.setCustomValidity("");
    });
    encodeURIComponent(inputValue);
    inputEmail.value = inputValue;
}

// Función para validar fecha (que no quede vacía)
function validarFecha(inputFecha) {
    let inputValue = inputFecha.value;
    if (inputValue == "") {
        inputFecha.setCustomValidity('Seleccione una fecha');
        validacionFecha = false;
    } else {
        validacionFecha = true;
    }
    inputFecha.addEventListener('input', function () {
    inputFecha.setCustomValidity("");
    });
}

// Función para agregar contacto
const agregar = async () => {

    const inputNombre = document.getElementById('nombreContacto');
    const inputEmail = document.getElementById('emailContacto');
    const inputNacimiento = document.getElementById('nacimientoContacto');
    const formulario = document.querySelector('form');

    validarNombre(inputNombre, 3, 50);
    validarEmail(inputEmail);
    validarFecha(inputNacimiento);

    // Si está validado el formulario, enviar los datos al servidor
    if (validacionNombre && validacionEmail && validacionFecha) {

        const nombre = inputNombre.value;
        const email = inputEmail.value;
        const nacimiento = inputNacimiento.value;

        const datos = {
            nombre: nombre,
            email: email,
            nacimiento: nacimiento
        };

        const envio = await peticion('POST', `http://localhost:${PORT}/api/contactos`, JSON.stringify(datos));

        if (envio) {
            formulario.submit();
        }
    }
};

// Función para modificar contacto
const modificar = async (id) => {

    const formulario = document.getElementById('form-modificar');
    const divModificar = document.getElementById('div-modificar');
    const divOverlay = document.querySelector('.overlay');
    const btnCancelar = document.getElementById("btn-cancelar-modificacion");
    const btnEnviarModificacion = document.getElementById("btn-enviar-modificacion");
    const inputModificarNombre = document.getElementById("modificar-nombre");
    const inputModificarEmail = document.getElementById("modificar-email");
    const inputModificarFecha = document.getElementById("modificar-fecha");
    const contactoAModificar = await contactoPorId(id);

    divOverlay.style.display = 'block';

    inputModificarNombre.value = contactoAModificar.nombre;
    inputModificarEmail.value = contactoAModificar.email;

    const fecha = `${contactoAModificar.nacimiento.slice(0, 4)}${contactoAModificar.nacimiento.slice(4, 8)}${contactoAModificar.nacimiento.slice(8, 10)}`
    inputModificarFecha.value = fecha;

    btnCancelar.addEventListener('click', (e) => {
        e.preventDefault();
        divOverlay.style.display = 'none';
    });

    btnEnviarModificacion.addEventListener('click', async (e) => {
        e.preventDefault();
        const nombre = inputModificarNombre.value;
        const email = inputModificarEmail.value;
        const nacimiento = inputModificarFecha.value;

        const datos = {
            nombre: nombre,
            email: email,
            nacimiento: nacimiento
        };

        const envio = await peticion('PUT', `http://localhost:${PORT}/api/contactos/${id}`, JSON.stringify(datos));

        if (envio) {
            formulario.submit();
            alert('El registro ha sido modificado');
        }
    });

    /* divOverlay.addEventListener('click', (event) => {
        if (event.target != divModificar) {
            divOverlay.style.display = 'none';
        }
    }) */
}

// Función para eliminar contacto
const eliminar = async (id) => {

    const data = await contactoPorId(id);
    const confirmacion = confirm(`¿Desea eliminar el contacto "${data.nombre}"?`);
    
    if (confirmacion) {
        const baja = await peticion('DELETE', `http://localhost:${PORT}/api/contactos/${id}`);
        if (baja) {
            location.reload();
        }
    }
    
}


// Evento al hacer click en un botón de la tabla
tabla.addEventListener('click', (event) => {

    if (event.target.tagName == "BUTTON" || event.target.tagName == "I") {
        if (event.target.id == "btn-agregar") {

            agregar();

        } else if (event.target.classList.contains("btn-eliminar") || event.target.classList.contains("fa-trash")) {

            const idcontacto = event.target.parentNode.dataset.id;
            eliminar(idcontacto);

        } else if (event.target.classList.contains("btn-modificar") || event.target.classList.contains("fa-file-pen")) {

            const idcontacto = event.target.parentNode.dataset.id;
            modificar(idcontacto);

        }
    }
});

// Al iniciar la app:
cargarDatos();