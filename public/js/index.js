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

        // Se configura el tipo de dato (JSON) para POST
        if (metodo == 'POST') {
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
                
            } else if (xhr.status == 204 || metodo == 'DELETE') {
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


// Carga datos en la tabla (o muestra mensaje de error)
const cargarDatos = async () => {

    const data = await peticion('GET', `http://localhost:${PORT}/api/contactos`);

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

    // Variables
    const inputNombre = document.getElementById('nombreContacto');
    const inputEmail = document.getElementById('emailContacto');
    const inputNacimiento = document.getElementById('nacimientoContacto');
    const formulario = document.querySelector('form');

    // Validación de los inputs
    validarNombre(inputNombre, 3, 50);
    validarEmail(inputEmail);
    validarFecha(inputNacimiento);

    // Si está validado el formulario, enviar los datos al servidor
    if (validacionNombre && validacionEmail && validacionFecha) {
        // Captura de datos
        const nombre = inputNombre.value;
        const email = inputEmail.value;
        const nacimiento = inputNacimiento.value;

        // Objeto JSON que será enviado al servidor
        const datos = {
            nombre: nombre,
            email: email,
            nacimiento: nacimiento
        };

        // Creación y onfiguración de la solicitud xhr
        const envio = await peticion('POST', `http://localhost:${PORT}`, JSON.stringify(datos));

        if (envio) {
            // Limpieza del formulario después de enviar datos
            formulario.submit();
        }
    }
};

// Función para eliminar contacto
const eliminar = async (id) => {
    const confirmacion = confirm("¿Desea eliminar el contacto?");
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
        }
    }
});

// Al iniciar la app:
cargarDatos();