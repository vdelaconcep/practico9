const PORT = 3000;

// Nueva solicitud xhr
const xhr = new XMLHttpRequest();

// Declaración de variables
const agregar = document.getElementById('btn-agregar');
const tabla = document.querySelector('table');
let validacionTexto = false;
let validacionEmail = false;
let validacionFecha = false;

// Función para validar input tipo texto por longitud
function validarTexto(inputTexto, minlength, maxlength) {
    let inputValue = inputTexto.value;
    let longitud = inputValue.trim().length;
    if (longitud < minlength) {
        inputTexto.setCustomValidity('Este campo debe tener ' + minlength + ' caracteres como mínimo');
        validacionTexto = false;
    } else if (longitud > maxlength) {
        inputTexto.setCustomValidity('Este campo no debe tener más de ' + minlength + ' caracteres');
        validacionTexto = false;
    } else {
        validacionTexto = true;
    }
    inputTexto.addEventListener('input', function () {
        inputTexto.setCustomValidity("")
    })
    encodeURIComponent(inputValue);
    inputTexto.value = inputValue;
}

// Función para validar input tipo e-mail
function ValidarEmail(inputEmail) {
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
function ValidarFecha(inputFecha) {
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

// Evento al cargar la aplicación (carga contactos de la base de datos en la tabla)
document.addEventListener('DOMContentLoaded', function () {
    // Obtener datos
    xhr.open('GET', `http://localhost:${PORT}/api/contactos`, true);
    xhr.onload = function () {
        if (this.status == 200) {
            let data = JSON.parse(this.responseText);
            
            // Creación de cada una de las filas (una por cada contacto)
            data.forEach(element => {
                let fila = document.createElement('tr');
                fila.innerHTML += `
                <td style="border-left: 1px solid #A7B9B1; border-right: 1px solid #A7B9B1">${element.nombre}</td>
                <td style="border-right: 1px solid #A7B9B1">${element.email}</td>
                <td style="border-right: 1px solid #A7B9B1">${element.nacimiento.slice(0, 10)}</td>
                `;

                // Última celda (botones)
                let celda = document.createElement('td');
                celda.setAttribute('style', 'border-right: 1px solid #A7B9B1');

                // Botón modificar
                let btnModificar = document.createElement('button');
                btnModificar.setAttribute('id', `modificar-${element._id}`);
                btnModificar.setAttribute('class', `btn btn-outline-dark m-1 border-1`);
                btnModificar.innerHTML = 'Modificar <i class="fa-solid fa-file-pen"></i>';

                // Botón eliminar
                let btnEliminar = document.createElement('button');
                btnEliminar.setAttribute('id', `eliminar-${element._id}`);
                btnEliminar.setAttribute('class', `btn-eliminar btn btn-outline-dark m-1 border-1`);
                btnEliminar.innerHTML = 'Eliminar <i class="fa-solid fa-trash"></i>';

                // Insertar botones en la celda, celda en la fila y fila en la tabla
                celda.appendChild(btnModificar);
                celda.appendChild(btnEliminar);
                fila.appendChild(celda);
                fila.setAttribute('style', 'background-color: #D1E7DD !important; border-bottom: 1px solid #A7B9B1');
                tabla.appendChild(fila);
            });
        } else {
            console.log('No se pudieron obtener los datos');
        }
    };
    xhr.send();
});

// Evento al presionar el botón agregar (o añadir)
    document.getElementById("btn-agregar").addEventListener('click', function () {
        // Variables
        const inputNombre = document.getElementById('nombreContacto');
        const inputEmail = document.getElementById('emailContacto');
        const inputNacimiento = document.getElementById('nacimientoContacto');
        const formulario = document.querySelector('form');

        // Validación de los inputs
        validarTexto(inputNombre, 3, 50);
        ValidarEmail(inputEmail);
        ValidarFecha(inputNacimiento);

        // Si está validado el formulario, enviar los datos al servidor
        if (validacionTexto && validacionEmail && validacionFecha) {
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

            // Configuración de la solicitud xhr
            xhr.open('POST', `http://localhost:${PORT}`, true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            // Manejo de respuesta del servidor
            xhr.onload = function () {
                if (xhr.status != 200) {
                    tabla.insertAdjacentHTML('beforebegin', "<div style='background-color: goldenrod;color: white; font-weight: bold; text-align: center'><p> Error al enviar la solicitud al servidor</p></div>");
                } else {
                    document.getElementById('div-error-solicitud').style.display = 'none';
                }
            };

            // Envío de datos
            xhr.send(JSON.stringify(datos));

            // Limpieza del formulario después de enviar datos
            formulario.submit();
        }
    });




