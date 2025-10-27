


//Variable Global para almacenar la configuración del token
var configs_token;

get_config_token()//Llamada a la función para obtener la configuración del token
 .then(data => { // Manejar los datos recibidos
    configs_token = data; // Almacenar la configuración en la variable global
  })
  .catch(error => { // Manejar errores
    console.error("No se pudo cargar la configuración:", error);
  });
  
  async function get_config_token() { // Función para obtener la configuración del token
  const token = localStorage.getItem("token"); // Obtener el token del almacenamiento local
  const response = await fetch("https://pruebas.siac.historiaclinica.org/decodifica", { // Realizar la solicitud al servidor
    method: "GET", // Método GET
    headers: {
      Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
    },
  });
  if (!response.ok) { // Verificar si la respuesta es exitosa
    throw new Error("Error en la respuesta del servidor");
  }
  const data = await response.json(); // convertir la respuesta a JSON 
  const currentTime = Math.floor(Date.now() / 1000); // Obtener el tiempo actual en segundos
  const expirationTime = data.exp; // Obtener el tiempo de expiración del token
  const timeRemaining = expirationTime - currentTime; // Calcular el tiempo restante
  if (timeRemaining <= 0) { // Verificar si el token ha expirado
    Swal.fire({ // Mostrar una alerta de sesión expirada 
      title: "Sesión expirada.",
      text: "Redirigiendo al inicio de sesión...",
      icon: "warning",
      confirmButtonText: "Aceptar"
    }).then(() => {
      const url_actual = encodeURIComponent(window.location.href); // Obtener la URL actual
      window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`; // Redirigir al usuario al inicio de sesión
    });
    throw new Error("Token expirado");
  }
  return data; // Devolver la configuración del token
}

var timeRemaining = 0; // Variable para almacenar el tiempo restante del token
document.addEventListener('DOMContentLoaded', async () => { // Esperar a que el DOM esté completamente cargado
  const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
  if (!token) { // Verificar si el token no existe
    let url_actual=window.location.href // Obtener la URL actual
    try {
      Swal.fire({ // Mostrar una alerta de token inválido
                title: "Token invalido.",
                text: "Redirigiendo al inicio de sesión...",
                icon: "warning",
                confirmButtonText: "Aceptar"
            }).then(() => {               
                window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`; // Redirigir al usuario al inicio de sesión
            });
    } catch (error) {
      window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`; // Redirigir al usuario al inicio de sesión  
    }
    
  }
  
  const [headerPart, payloadPart, signaturePart] = token.split('.'); // Dividir el token en sus partes
  let token_decoded = await decodeJWT_local(payloadPart) // Decodificar la parte del payload del token
    configs_token = JSON.parse(token_decoded); // Parsear el payload decodificado como JSON
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds 
    const expirationTime = configs_token.exp; // Expiracion tiempo en segundo 
    timeRemaining = expirationTime - currentTime; // Calcular el tiempo restante

    if (timeRemaining <= 0) { // Verificar si el token ha expirado
        try {
      Swal.fire({ // Mostrar una alerta de sesión expirada
                title: "Session expirada.",
                text: "Redirigiendo al inicio de sesión...",
                icon: "warning",
                confirmButtonText: "Aceptar"
            }).then(() => {
                let url_actual=window.location.href // Obtener la URL actual
                window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`; // Redirigir al usuario al inicio de sesión
            });
    } catch (error) {
      let url_actual=window.location.href
      window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`;  
    }
    return; // Salir de la función si el token ha expirado
    }
  
}); 

async function verificar_permiso_token(){ // Función para verificar el permiso del token
  const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
  const [headerPart, payloadPart, signaturePart] = token.split('.'); // Dividir el token en sus partes
  let token_decoded = await decodeJWT_local(payloadPart) // Decodificar la parte del payload del token
  configs_token = JSON.parse(token_decoded); // Parsear el payload decodificado como JSON 
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const expirationTime = configs_token.exp; // Expiration time in seconds
  timeRemaining = expirationTime - currentTime; // Calcular el tiempo restante

  if (timeRemaining <= 0) { // Verificar si el token ha expirado
      Swal.fire({
          title: "Su session ha expirado!",
          html: "Sera redirigido a la pagina de login en un par de segundos <b></b>.",
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
              timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
          },
          willClose: () => { // Cuando se cierre la alerta
            clearInterval(timerInterval);
          }
        }).then((result) => {
          /* Read more about handling dismissals below */ //
          if (result.dismiss === Swal.DismissReason.timer) { // Si la alerta se cierra por el temporizador
            let url_actual=window.location.href
            window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`;  
            return false;
          }
            let url_actual=window.location.href
            window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`;  
            return false;
        });
 

  }
  return configs_token;
}

async function validaJWT_servidor (url=''){
const token = localStorage.getItem('token');
try {
const response = await fetch('https://pruebas.siac.historiaclinica.org/validate-token', {
method: 'GET',
headers: {
  Authorization: `Bearer ${token}`
}
});

if (response.status === 401) {
const data = await response.json();
if (data.redirectTo) {
  try {
      Swal.fire({
                title: "Session expirada.",
                text: "Redirigiendo al inicio de sesión...",
                icon: "warning",
                confirmButtonText: "Aceptar"
            }).then(() => {
                let url_actual=window.location.href
                window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`;
            });
    } catch (error) {
      let url_actual=window.location.href
      window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`;  
    }
}
}
fetch("https://pruebas.siac.historiaclinica.org/decodifica", {
    method: "GET",
    headers: {
        Authorization: `Bearer ${token}`,
    },
})
.then((response) => response.json())
.then((data) => {
    configs_token = data;
    
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const expirationTime = configs_token.exp; // Expiration time in seconds
    const timeRemaining = expirationTime - currentTime;
    
    if (timeRemaining <= 0) {
        try {
            Swal.fire({
                title: "Session expirada.",
                text: "Redirigiendo al inicio de sesión...",
                icon: "warning",
                confirmButtonText: "Aceptar"
            }).then(() => {
                let url_actual=window.location.href
                window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`;
            });
          } catch (error) {
            let url_actual=window.location.href
            window.location.href = `https://siac.empresas.historiaclinica.org/login.php?redirto=${url_actual}`;  
          }
        return;
    }
    return data
  })
} catch (error) {
console.error('Error al validar el token:', error);
}
}

function decodeJWT_local(token) {
  let base64 = token
  .replace(/-/g, '+')  // Convertir '-' a '+'
  .replace(/_/g, '/'); // Convertir '_' a '/'

  const padding = base64.length % 4;
  if (padding !== 0) {
  base64 += '='.repeat(4 - padding);
}

return atob(base64);
}

async function retornar_opciones(query, contenedor) {
  const token = localStorage.getItem('token');
  const [headerPart, payloadPart, signaturePart] = token.split('.');
  let token_decoded = await decodeJWT_local(payloadPart)
  token_decoded = JSON.parse(token_decoded); 
  try {
          const response = await fetch(
          "https://pruebas.siac.historiaclinica.org/cargar_query",
          {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filtros: [token_decoded.id_cli], id_query: query,id_contenedor:contenedor }),
          }
      );
      const opciones = await response.json();                
       return opciones;
  } catch (error) {
      console.log(error)
  }
}

async function re_session_php() {
  validaJWT_servidor();
  var data = {    
  usuario: configs_token.id_usuario, 
  id_empresa: configs_token.id_cli, 
  news: configs_token.mostrar_news, 
  ip_log: configs_token.ip_internet,  
  grupo_u: configs_token.grupo_u, 
  user_name: configs_token.usuario, 
  fecha_vencimiento: configs_token.fecha_vencimiento, 
}
let queryString = '';
for (const key in data) {
if (data.hasOwnProperty(key)) {
  queryString += `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}&`;
}
}

queryString = queryString.slice(0, -1);

console.log(queryString); // Ejemplo: "usuario=999&id_empresa=123&news=true&ip_log=192.168.1.1&grupo_u=admin&user_name=juan&fecha_vencimiento=2023-12-31"

// Construir la URL completa
const url = `../php/re_session.php?${queryString}`;
fetch(url)
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));


}

//let datos_agenda = [];

var modal = document.getElementById("myModal");
window.onclick = function (event) {
if (event.target == modal) {
modal.style.display = "none";
}
};

function activar_modal(mensaje, tipo) {
    switch (tipo) {
    case "ok":
    Swal.fire({
      title: mensaje,
      width: 600,
      padding: "3em",
      color: "#28a745",
      background:
        "#fff url(../images/background_alt2.png) 20%",

      backdrop: `
        rgba(40,167,69,0.4)
        url("../images/checked-simple.gif")
        left top
        no-repeat
      `,
    });

    break;
    case "err":
    Swal.fire({
      title: mensaje,
      width: 600,
      padding: "3em",
      color: "#dc3545",
      background:
        "#fff url(../images/background_alt2.png) 20%",
      backdrop: `
      rgba(167,40,119,0.4)
      url("../images/no-entry.gif")
      left top
      no-repeat
    `,
    });
    break;
    case "info":
    Swal.fire({
      title: mensaje,
      width: 600,
      padding: "3em",
      color: "#ffc107",
      backdrop: `
        rgba(167,124,40,0.4)
        url("../images/wired-flat-1140-error.gif")
        left top
        no-repeat
      `,
    });
    break;
  }
}

function parpadeo(objeto) {
objeto.forEach((items) => {
items.classList.add("animated");
items.classList.add("flash");
});
setTimeout(() => {
objeto.forEach((items) => {
items.classList.remove("animated");
items.classList.remove("flash");
});
}, "2000");
}

function mostrar_loader() {
    var loader = document.getElementById("cargador");
    loader.style.display = "initial";
}

function ocultar_loader() {
  var loader = document.getElementById("cargador");
loader.style.display = "none";
}
async function guardar_dato(
url,
datastring,
target,
header = "application/x-www-form-urlencoded",
bg_image = "url(../images/checked-simple.gif)",
mensaje = false
) {
try {
const response = await fetch(url, {
method: "POST",
headers: {
  "Content-Type": header,
},
body: datastring,
});

const result = await response.text();

if (!result.startsWith("You have an error in your SQL")) {
const objeto_objetivo = document.getElementById(target);
objeto_objetivo.style.outline = "green 1px solid";
objeto_objetivo.style.backgroundImage = bg_image;
objeto_objetivo.style.backgroundSize = "10%";
objeto_objetivo.style.backgroundRepeat = "no-repeat";
objeto_objetivo.style.backgroundPosition = "center right";
objeto_objetivo.style.backgroundPositionX = "95%";
setTimeout(() => {
  objeto_objetivo.style.outline = "1px hsl(246, 25%, 77%) solid";
  objeto_objetivo.style.backgroundImage = "none";
}, 5000);
}

if (mensaje) {
activar_modal(result, "ok");
}
} catch (error) {
activar_modal(error.message, "err");
}
}
async function guardar_dato_esperar_id(
url1,
datastring1,
url2,
datastring2,
campoid,
target,
header = "application/x-www-form-urlencoded",
header2 = "application/x-www-form-urlencoded",
retorno
) {
try {
const response1 = await fetch(url1, {
method: "POST",
headers: {
  "Content-Type": header,
},
body: datastring1,
});

const result1 = await response1.text();

if (!isNaN(result1)) {
datastring2 = `${datastring2}&campo_id=${campoid}&valor_id=${result1}`;
await guardar_dato(url2, datastring2, target, header2);
const retornoElement = document.getElementById(retorno);
  if (retornoElement && 'value' in retornoElement) {
    retornoElement.value = result1;
  }else if(retornoElement && 'textContent' in retornoElement){
    retornoElement.textContent = result1;
  }
} else {
activar_modal(result1, "info");
}
} catch (error) {
activar_modal(error.message, "err");
}
}

async function buscar_deuda(paciente) {

var url =
"../php/buscar_deuda.php?paciente=" +
paciente ;
const buscar_json = new Promise((resolve, reject) => {
const XHR = new XMLHttpRequest();
XHR.addEventListener("error", (event) => {
activar_modal(XHR.responseText + url, "err");
reject(XHR.responseText);
});
XHR.open("POST", url, true);
XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
XHR.overrideMimeType("application/json");
XHR.onreadystatechange = function () {
if (XHR.readyState == 4 && XHR.status == 200) {
resolve(XHR.responseText);
}
};
XHR.send(url);
});
buscar_json
.then((resultado) => {
var jsonResponse = JSON.parse(resultado);
if(Object.keys(jsonResponse.detalle).length > 0){

const toastLiveExample = window.parent.document.getElementById('liveToast_deuda')

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
  window.parent.document.getElementById('nombre_pac_toast').innerText=jsonResponse.detalle[0].paciente
  window.parent.document.getElementById('ver_deuda_toast').dataset.paciente=paciente;
    toastBootstrap.show()

}
})
.catch((error) => {});


}

function listar(
query,
objeto,
url = "../php/devolver_option_list.php?arg1=",
primer_elemento = "-seleccione-",
arg3 = "",
arg4 = "",
orden = "&orden=2"
) {
try {
jSuites.loading.show(2);
} catch (error) {
let timerInterval;
Swal.fire({
title: "Espere mientras cargamos los recursos necesarios!",
html: "Espere un momento por favor <b></b>.",
timer: 2000,
timerProgressBar: true,
didOpen: () => {
  Swal.showLoading();
  const timer = Swal.getPopup().querySelector("b");
  timerInterval = setInterval(() => {
    timer.textContent = `${Swal.getTimerLeft()}`;
  }, 100);
},
willClose: () => {
  clearInterval(timerInterval);
},
}).then((result) => {
/* Read more about handling dismissals below */
if (result.dismiss === Swal.DismissReason.timer) {
}
});
}

var request_func = new XMLHttpRequest();

var url_func = url + query + "&arg2=" + primer_elemento + arg3 + arg4 + orden;

request_func.open("GET", url_func, true);
request_func.onreadystatechange = function () {
if (request_func.readyState == 4 && request_func.status == 200) {
jSuites.loading.hide();
objeto.innerHTML = request_func.responseText;
}
};
request_func.addEventListener("error", (event) => {});
request_func.addEventListener("load", (event) => {
jSuites.loading.hide();
});

request_func.send();
}
function sanitizar_texto(texto) {
const map = {
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#x27;",
"/": " ",
";": ",;",
"-": "~",
};
const reg = /[&<>"'/;-]/gi;
return texto.replace(reg, (match) => map[match]);
}
function buscar_entabla(tabla, texto) {
const tableReg = document.getElementById(tabla);
const searchText = texto.toLowerCase();
let total = 0;
let found = false;
for (let i = 1; i < tableReg.rows.length; i++) {
const cellsOfRow = tableReg.rows[i].getElementsByTagName("td");

// Recorremos todas las celdas
for (let j = 0; j < cellsOfRow.length && !found; j++) {
const compareWith = cellsOfRow[j].innerHTML.toLowerCase();
if (searchText.length == 0 || compareWith.indexOf(searchText) > -1) {
  tableReg.rows[i].style.borderColor = "red";
  setTimeout(() => {
    tableReg.rows[i].style.borderColor = "inherit";
  }, 5000);
  found = true;
  total++;
}
}
}
if (found) {
return true;
} else {
return false;
}
}
function devolver_dato_promise(url, objeto) {
jSuites.loading.show(10);
const buscar_lista_tabla = new Promise((resolve, reject) => {
const XHR = new XMLHttpRequest();
XHR.addEventListener("error", (event) => {
activar_modal(XHR.responseText + url, "err");
reject(XHR.responseText);
jSuites.loading.hide();
});
XHR.open("POST", url, true);
XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
XHR.onreadystatechange = function () {
if (XHR.readyState == 4 && XHR.status == 200) {
  resolve(XHR.responseText);
}
};

XHR.send(url);
});
buscar_lista_tabla
.then((resultado) => {
objeto.value = resultado;
...

[Message clipped]  View entire message
