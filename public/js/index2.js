const PORT = 3000;
const tabla = document.querySelector('table');
let validacionNombre = false;
let validacionEmail = false;
let validacionFecha = false;

const peticion = (metodo, url, datos = null) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(metodo, url, true);

    if (['POST', 'PUT'].includes(metodo)) {
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }

    xhr.onload = () => {
        if ((xhr.status === 200 && metodo === 'GET') || (xhr.status === 204 && metodo === 'DELETE')) {
            resolve(metodo === 'GET' ? JSON.parse(xhr.responseText) : true);
        } else if (xhr.status === 200) {
            resolve(true);
        } else {
            reject(new Error('Error en la petición de datos'));
        }
    };

    xhr.onerror = () => reject(new Error('Error en la petición de datos'));
    xhr.send(datos);
});

const obtenerDatos = async () => await peticion('GET', `http://localhost:${PORT}/api/contactos`);

const contactoPorId = async id => {
    const data = await obtenerDatos();
    return data.find(c => c._id == id) || null;
};

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

const validarNombre = (input, min, max) => {
    const valor = input.value.trim();

    if (valor.length < min) {
        input.setCustomValidity(`Este campo debe tener al menos ${min} caracteres`);
        validacionNombre = false;
    } else if (valor.length > max) {
        input.setCustomValidity(`Este campo no debe superar los ${max} caracteres`);
        validacionNombre = false;
    } else {
        validacionNombre = true;
    }

    input.addEventListener('input', () => input.setCustomValidity(""));
    input.value = valor;
};

const validarEmail = (input) => {
    const valor = input.value.trim();

    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    validacionEmail = regex.test(valor);

    if (!validacionEmail) {
        input.setCustomValidity('Debe ingresar un e-mail válido');
    }

    input.addEventListener('input', () => input.setCustomValidity(""));
    input.value = valor;
};

const validarFecha = (input) => {
    const valor = input.value.trim();

    validacionFecha = valor !== "";

    if (!validacionFecha) {
        input.setCustomValidity('Seleccione una fecha');
    }

    input.addEventListener('input', () => input.setCustomValidity(""));
};

const agregar = async () => {
    const inputNombre = document.getElementById('nombreContacto');
    const inputEmail = document.getElementById('emailContacto');
    const inputNacimiento = document.getElementById('nacimientoContacto');
    const formulario = document.querySelector('form');

    validarNombre(inputNombre, 3, 50);
    validarEmail(inputEmail);
    validarFecha(inputNacimiento);

    if (validacionNombre && validacionEmail && validacionFecha) {
        const datos = {
            nombre: inputNombre.value,
            email: inputEmail.value,
            nacimiento: inputNacimiento.value
        };

        const envio = await peticion('POST', `http://localhost:${PORT}/api/contactos`, JSON.stringify(datos));

        if (envio) formulario.submit();
    }
};

const modificar = async (id) => {
    const formulario = document.getElementById('form-modificar');
    const divOverlay = document.querySelector('.overlay');
    const inputNombre = document.getElementById("modificar-nombre");
    const inputEmail = document.getElementById("modificar-email");
    const inputFecha = document.getElementById("modificar-fecha");
    const contacto = await contactoPorId(id);

    inputNombre.value = contacto.nombre;
    inputEmail.value = contacto.email;
    inputFecha.value = `${contacto.nacimiento.slice(0, 4)}${contacto.nacimiento.slice(4, 8)}${contacto.nacimiento.slice(8, 10)}`;

    divOverlay.style.display = 'block';

    document.getElementById("btn-cancelar-modificacion").onclick = (e) => {
        e.preventDefault();
        divOverlay.style.display = 'none';
    };

    document.getElementById("btn-enviar-modificacion").onclick = async (e) => {

        const datos = {
            nombre: inputNombre.value,
            email: inputEmail.value,
            nacimiento: inputFecha.value
        };

        validarNombre(inputNombre, 3, 50);
        validarEmail(inputEmail);
        validarFecha(inputNacimiento);

        if (validacionNombre && validacionEmail && validacionFecha) {

            const envio = await peticion('PUT', `http://localhost:${PORT}/api/contactos/${id}`, JSON.stringify(datos));

            if (envio) {
                formulario.submit();
                alert('El registro ha sido modificado');
            }
        }
    };
};

const eliminar = async (id) => {
    const contacto = await contactoPorId(id);
    if (confirm(`¿Desea eliminar el contacto "${contacto.nombre}"?`)) {
        const baja = await peticion('DELETE', `http://localhost:${PORT}/api/contactos/${id}`);
        if (baja) location.reload();
    }
};

tabla.addEventListener('click', async (event) => {
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

cargarDatos();