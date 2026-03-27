const URL = "./db/data.json";
let productos = [];

function getOrganizados() {
  return JSON.parse(localStorage.getItem("organizados")) || [];
}

function renderGondolas(productos) {
  const select = document.getElementById("selectGondola");
  select.innerHTML = '<option value="">Selecciona una gondola</option>';
  const gondolas = [...new Set(productos.map((p) => p.categoria))];

  gondolas.forEach((categoria) => {
    select.innerHTML += `<option value="${categoria}">${categoria}</option>`;
  });
}

function renderTabla() {
  const organizados = getOrganizados();
  const tbody = document.getElementById("tablaProductos");
  const columnas = ["Frios", "Verduras", "Frutas", "Almacen"];

  tbody.innerHTML = "";

  // agrupa por id y suma cantidades en tabla
  const agrupados = {};
  organizados.forEach((p) => {
    if (agrupados[p.id]) {
      agrupados[p.id].cantidad += p.cantidad;
    } else {
      agrupados[p.id] = { ...p };
    }
  });

  Object.values(agrupados).forEach((p) => {
    const columnaIndex = columnas.indexOf(p.categoria);
    const tr = document.createElement("tr");
    columnas.forEach((_, i) => {
      tr.innerHTML += `<td>${i === columnaIndex ? `${p.nombre} (${p.cantidad})` : ""}</td>`;
    });
    tbody.appendChild(tr);
  });
}

function renderDescartar() {
  const organizados = getOrganizados();
  const todos = [...productos];

  organizados.forEach((org) => {
    const existe = todos.find((p) => p.id === org.id);
    if (!existe) {
      todos.push({ id: org.id, nombre: org.nombre });
    }
  });

  const descarte = document.getElementById("selectDescartar");
  descarte.innerHTML = '<option value="">Selecciona un producto</option>';

  todos.forEach((producto) => {
    descarte.innerHTML += `<option value="${producto.id}">${producto.nombre}</option>`;
  });
}

function renderProductos(productos) {
  const select = document.getElementById("selectArticulo");
  select.innerHTML = '<option value="">Selecciona un producto</option>';

  productos.forEach((producto) => {
    select.innerHTML += `<option value="${producto.id}">${producto.nombre}</option>`;
  });
}

function renderCategorias(productos) {
  const select = document.getElementById("selectCategoria");
  select.innerHTML =
    '<option value="">Selecciona la categoría del producto</option>';
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  categorias.forEach((categoria) => {
    select.innerHTML += `<option value="${categoria}">${categoria}</option>`;
  });
}

function obtenerProductos() {
  const enStorage = localStorage.getItem("productos");
  if (enStorage) {
    productos = JSON.parse(enStorage);
    renderProductos(productos);
    renderCategorias(productos);
    renderGondolas(productos);
    renderTabla();
    renderDescartar();
  } else {
    fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        productos = data;
        localStorage.setItem("productos", JSON.stringify(productos));
        renderProductos(productos);
        renderCategorias(productos);
        renderGondolas(productos);
        renderTabla();
        renderDescartar();
      })
      .catch((err) => console.log("Hubo un error", err))
      .finally(() => console.log("finalizó la peticion"));
  }
}

function agregarProducto() {
  const nombre = document.getElementById("agregaProducto").value;
  const categoria = document.getElementById("selectCategoria").value;
  const cantidad = parseInt(document.getElementById("agregaCantidad").value);

  const productoExistente = productos.find(
    (p) => p.nombre.toLowerCase() === nombre.toLowerCase(),
  );

  if (productoExistente) {
    productoExistente.cantidadPendiente += cantidad;
  } else {
    productos.push({
      id: `p${Math.max(...productos.map((p) => parseInt(p.id.slice(1)))) + 1}`,
      codigo: `ART${String(productos.length + 1).padStart(3, "0")}`,
      nombre,
      categoria,
      cantidadPendiente: cantidad,
    });
  }

  localStorage.setItem("productos", JSON.stringify(productos));
  renderProductos(productos);
  document.getElementById("agregaProducto").value = "";
  document.getElementById("agregaPrecio").value = "";
  document.getElementById("selectCategoria").value = "";
  document.getElementById("agregaCantidad").value = "";
}

//Descartar producto

function descartarProducto() {
  const nombreDescarte = document.getElementById("selectDescartar").value;
  const cantidadDescarte = parseInt(
    document.getElementById("descartaCantidad").value,
  );
  const pendiente = productos.find((p) => p.id === nombreDescarte);

  // valida que la cantidad sea un número mayor a 0 y que no supere las pendientes
  if (!cantidadDescarte || cantidadDescarte <= 0) {
    Toastify({
      text: "Ingresá una cantidad válida.",
      gravity: "top",
      position: "center",
    }).showToast();
    return;
  }
  if (!pendiente || cantidadDescarte > pendiente.cantidadPendiente) {
    Toastify({
      text: `Solo hay ${pendiente ? pendiente.cantidadPendiente : 0} unidades pendientes.`,
      gravity: "top",
      position: "center",
    }).showToast();
    return;
  }

  pendiente.cantidadPendiente -= cantidadDescarte;

  // si llega a 0, elimina el producto del array
  if (pendiente.cantidadPendiente === 0) {
    productos = productos.filter((p) => p.id !== nombreDescarte);
  }

  // guarda el array actualizado en storage y re-renderiza
  localStorage.setItem("productos", JSON.stringify(productos));
  renderProductos(productos);
  renderDescartar();

  Toastify({
    text: `${cantidadDescarte} unidades descartadas.`,
    duration: 3000,
    style: { background: "rgb(255, 208, 0)" },
    gravity: "top",
    position: "center",
  }).showToast();

  // limpia los campos
  document.getElementById("descartaCantidad").value = "";
  document.getElementById("selectDescartar").value = "";
  document.getElementById("infoDescartar").textContent = "";
}

// Inicio para renderizar todo al cargar la página
obtenerProductos();

//Listeners
document.getElementById("btnAgregar").addEventListener("click", agregarProducto);
document.getElementById("btnDescartar").addEventListener("click", descartarProducto);
document.getElementById("selectDescartar").addEventListener("change", function () {
    const pendientes = productos.find((p) => p.id === this.value);
    document.getElementById("infoDescartar").textContent = this.value
      ? `Cantidad pendiente: ${pendientes?.cantidadPendiente ?? 0}`
      : "";
  });
