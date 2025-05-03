// Declaración de variables:
const PORT = 3000;
const tabla = document.querySelector('table');

// Promise para crear y enviar una petición
const peticion = (metodo, url, datos) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(metodo, url, true);

        if (metodo == 'POST' || metodo == 'PUT') {
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        }

        xhr.onload = () => {

            if (xhr.status == 200) {

                // Si el método es "GET", devuelve los datos en la DB
                if (metodo === 'GET') {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    resolve(true);
                }
            } else if (xhr.status === 204 && metodo === 'DELETE') {
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
};

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

    data.reverse().forEach(({ _id, nombre, email, nacimiento }) => {
        const fila = document.createElement('tr');
        fila.style = 'background-color: #C7DBD2; border-bottom: 1px solid #A7B9B1';

        fila.innerHTML = `
            <td style="border-left: 1px solid #A7B9B1; border-right: 1px solid #A7B9B1">${nombre}</td>
            <td style="border-right: 1px solid #A7B9B1">${email}</td>
            <td style="border-right: 1px solid #A7B9B1">${nacimiento.slice(8, 10)}${nacimiento.slice(4, 8)}${nacimiento.slice(0, 4)}</td>
            <td data-id="${_id}" style="border-right: 1px solid #A7B9B1">
                <button class="btn btn-modificar btn-outline-dark m-1 border-1" data-id="${_id}">
                    <i class="fa-solid fa-file-pen"></i>
                </button>
                <button class="btn-eliminar btn btn-outline-dark m-1 border-1" data-id="${_id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>`;
        fragmento.appendChild(fila);
    });

    tabla.appendChild(fragmento);
};

// Función para validar input nombre
function validarNombre(inputNombre, minlength, maxlength) {
    let valor = inputNombre.value.trim();
    inputNombre.setCustomValidity("");

    if (valor.length < minlength) {
        inputNombre.setCustomValidity('Este campo debe tener ' + minlength + ' caracteres como mínimo');
        return false;
    } else if (valor.lenght > maxlength) {
        inputNombre.setCustomValidity('Este campo no debe tener más de ' + minlength + ' caracteres');
        return false;
    } else {
        return true;
    }
};

// Función para validar input tipo e-mail
function validarEmail(inputEmail) {
    let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    inputEmail.setCustomValidity("");

    if (!regex.test(inputEmail.value)) {
        inputEmail.setCustomValidity('Debe ingresar un e-mail válido');
        return false;
    } else {
        return true;
    }
};

// Función para validar fecha (que no quede vacía)
function validarFecha(inputFecha) {
    inputFecha.setCustomValidity("");

    if (inputFecha.value == "") {
        inputFecha.setCustomValidity('Seleccione una fecha');
        return false;
    } else {
        return true;
    }
};

// Función para agregar contacto
const agregar = async () => {

    const inputNombre = document.getElementById('nombreContacto');
    const inputEmail = document.getElementById('emailContacto');
    const inputNacimiento = document.getElementById('nacimientoContacto');
    const formulario = document.querySelector('form');

    let nombreOk = validarNombre(inputNombre, 3, 50);
    let emailOk = validarEmail(inputEmail);
    let fechaOk = validarFecha(inputNacimiento);

    // Si está validado el formulario, enviar los datos al servidor
    if (nombreOk && emailOk && fechaOk) {

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

    const fecha = `${contactoAModificar.nacimiento.slice(0, 4)}${contactoAModificar.nacimiento.slice(4, 8)}${contactoAModificar.nacimiento.slice(8, 10)}`;
    inputModificarFecha.value = fecha;

    btnCancelar.addEventListener('click', (e) => {
        e.preventDefault();
        divOverlay.style.display = 'none';
    });

    btnEnviarModificacion.addEventListener('click', async (e) => {

        let nombreOk = validarNombre(inputModificarNombre, 3, 50);
        let emailOk = validarEmail(inputModificarEmail);
        let fechaOk = validarFecha(inputModificarFecha);

        if (nombreOk && emailOk && fechaOk) {

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
                alert('El registro ha sido modificado');
                formulario.submit();
            }
        }
    });
};

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
};

// Evento al hacer click en un botón de la tabla
tabla.addEventListener('click', (event) => {

    const target = event.target.closest('button');
    if (!target) return;

    const id = target.dataset.id;

    if (target.id === "btn-agregar") {
        agregar();
    } else if (target.classList.contains("btn-eliminar")) {
        eliminar(id);
    } else if (target.classList.contains("btn-modificar")) {
        modificar(id);
    }
});

// Al iniciar la app:
cargarDatos();