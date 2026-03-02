// Productos base (array de objetos)
const productosBase = [
  { id: "p1", nombre: "Crema", correcta: "Frios" },
  { id: "p2", nombre: "Lechuga", correcta: "Verduras" },
  { id: "p3", nombre: "Banana", correcta: "Frutas" },
  { id: "p4", nombre: "Azucar", correcta: "Descartar" },
  { id: "p5", nombre: "Manzana", correcta: "Frutas" },
  { id: "p6", nombre: "Espinaca", correcta: "Verduras" },
  { id: "p7", nombre: "Sal", correcta: "Descartar" }
];

// Clave para guardar el estado del juego en localStorage
const CLAVE_STORAGE = "estadoJuego";

// Variables que representan el estado del juego
let pendientes = [];
let cajas = { Frios: [], Verduras: [], Frutas: [], Descartar: [] };

// FUNCIÓN 1: guarda en storage
function guardarStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// FUNCIÓN 2: lee de storage
function leerStorage(clave, valorPorDefecto) {
  const data = localStorage.getItem(clave);
  return data ? JSON.parse(data) : valorPorDefecto;
}

// FUNCIÓN 3: reinicia el estado del juego
function reiniciarJuego() {
  pendientes = [];
  for (const producto of productosBase) {
    pendientes.push({
      id: producto.id,
      nombre: producto.nombre,
      correcta: producto.correcta
    });
  }
  cajas = {
    Frios: [],
    Verduras: [],
    Frutas: [],
    Descartar: []
  };
  guardarStorage(CLAVE_STORAGE, { pendientes, cajas });
}

// FUNCIÓN 4: busca un producto en pendientes por id
function buscarPendientePorId(idBuscado) {
  return pendientes.find(p => p.id === idBuscado);
}

// FUNCIÓN 5: renderiza el select de pendientes
function renderSelectPendientes(selectHTML, listaPendientes) {

  // Mantiene el placeholder
  selectHTML.innerHTML = '<option value="">Seleccione producto</option>';

  if (listaPendientes.length === 0) {
    selectHTML.disabled = true;
    return;
  }

  selectHTML.disabled = false;

  for (const prod of listaPendientes) {

    const opt = document.createElement("option");

    opt.value = prod.id;
    opt.textContent = prod.nombre;

    selectHTML.appendChild(opt);
  }

  // dejar placeholder seleccionado
  selectHTML.value = "";
}

// FUNCIÓN 6: renderiza una lista de productos (ul)
function renderLista(ulHTML, listaProductos) {
  ulHTML.innerHTML = "";

  if (listaProductos.length === 0) {
    const li = document.createElement("li");
    li.textContent = "-";
    ulHTML.appendChild(li);
    return;
  }

  for (const prod of listaProductos) {
    const li = document.createElement("li");
    li.textContent = prod.nombre;
    ulHTML.appendChild(li);
  }
}

// FUNCIÓN 7: renderiza TODO el estado en pantalla
function renderPantalla() {

  renderSelectPendientes(
    document.getElementById("selectPendiente"),
    pendientes
  );

  renderLista(
    document.getElementById("listaPendientes"),
    pendientes
  );

  renderLista(
    document.getElementById("listaFrios"),
    cajas.Frios
  );

  renderLista(
    document.getElementById("listaVerduras"),
    cajas.Verduras
  );

  renderLista(
    document.getElementById("listaFrutas"),
    cajas.Frutas
  );

  renderLista(
    document.getElementById("listaDescartados"),
    cajas.Descartar
  );

}

// FUNCIÓN 8: muestra mensaje en el DOM
function mostrarMensaje(texto, esError) {
  const p = document.getElementById("mensajeJuego");

  p.textContent = texto;

  if (esError) {
    p.classList.add("error");
  } else {
    p.classList.remove("error");
  }
}

// FUNCIÓN 9: clasificar un producto
function clasificarProducto(idProducto, cajaElegida) {
  const producto = buscarPendientePorId(idProducto);

  if (!producto) {
    mostrarMensaje("Ese producto ya no está pendiente.", true);
    return;
  }

  if (cajaElegida !== producto.correcta) {
    mostrarMensaje("❌ Incorrecto. Reintentá.", true);
    return;
  }

  // Mover: sacar de pendientes
  pendientes = pendientes.filter(p => p.id !== idProducto);

  // Guardar en la caja correcta
  cajas[cajaElegida].push(producto);

  mostrarMensaje("✅ Correcto. Producto guardado.", false);

  // Guardar estado
  guardarStorage(CLAVE_STORAGE, { pendientes, cajas });

  // Actualizar pantalla
  renderPantalla();

  // limpiar selección de caja
  document.getElementById("selectCaja").value = "";
  document.getElementById("selectPendiente").value = "";
}

document.addEventListener("DOMContentLoaded", function () {
  const estadoGuardado = leerStorage(CLAVE_STORAGE, null);

  if (estadoGuardado) {
    pendientes = estadoGuardado.pendientes;
    cajas = estadoGuardado.cajas;
  } else {
    reiniciarJuego();
  }

  renderPantalla();

  // 3) Evento: organizar producto (submit del form)
  const formOrganizar = document.getElementById("formOrganizar");
  formOrganizar.addEventListener("submit", function (e) {
    e.preventDefault();

    const selectPendiente = document.getElementById("selectPendiente");
    const selectCaja = document.getElementById("selectCaja");

    const idProducto = selectPendiente.value;
    const cajaElegida = selectCaja.value;

    if (!idProducto) return;

    clasificarProducto(idProducto, cajaElegida);
  });

  // 4) Evento: reiniciar
  const btnReiniciar = document.getElementById("btnReiniciar");
  btnReiniciar.addEventListener("click", function () {
    reiniciarJuego();
    mostrarMensaje("Juego reiniciado.", false);
    renderPantalla();
  });
});