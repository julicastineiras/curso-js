
//---Funcion de consistencias para organizar productos---
function consistenciasItemsAOrganizar(producto,gondolaSeleccionada,cantidadOrganizar,) {
  // consistencia que se haya seleccionado un producto y una gondola.
  if (!producto || !gondolaSeleccionada) {
    Toastify({
      text: "Seleccioná un producto y una gondola.",
      gravity: "top",
      position: "center",
    }).showToast();
    return false;
  }

  // consistencia que se haya ingresado una cantidad valida.
  if (!cantidadOrganizar || cantidadOrganizar <= 0) {
    Toastify({
      text: "Ingresá una cantidad válida.",
      gravity: "top",
      position: "center",
    }).showToast();
    return false;
  }

  // consistencia que la cantidad ingresada no sea mayor a la pendiente.
  if (cantidadOrganizar > producto.cantidadPendiente) {
    Toastify({
      text: `Solo hay ${producto.cantidadPendiente} unidades pendientes de ${producto.nombre}.`,
      gravity: "top",
      position: "center",
    }).showToast();
    return false;
  }

  // Chequea si la gondola del producto seleccionado corresponde a la gondola seleccionada.
  if (gondolaSeleccionada !== producto.categoria) {
    Toastify({
      text: "La gondola seleccionada no corresponde a la categoría del producto.",
      gravity: "top",
      position: "center",
      style: { background: "#ff0000" },
    }).showToast();
    return false;
  }

  return true;
}

//---Organizar productos en categorias/gondolas---

function organizarProducto() {
  const productoSeleccionado = document.getElementById("selectArticulo").value;
  const gondolaSeleccionada = document.getElementById("selectGondola").value;
  const producto = productos.find((p) => p.id === productoSeleccionado);
  const cantidadOrganizar = parseInt(
    document.getElementById("organizaCantidad").value,
  );

  if (!consistenciasItemsAOrganizar(producto,gondolaSeleccionada,cantidadOrganizar,)) {
    return;
  }

  //guarda en local storage
  const organizados = JSON.parse(localStorage.getItem("organizados")) || [];
  organizados.push({
    id: producto.id,
    nombre: producto.nombre,
    categoria: producto.categoria,
    cantidad: cantidadOrganizar,
  });
  localStorage.setItem("organizados", JSON.stringify(organizados));

  renderTabla();

  producto.cantidadPendiente -= cantidadOrganizar;

 //Si la cantidad pendiente es cero, se busca el producto en el array y se borra.
  if (producto.cantidadPendiente === 0) {
    productos = productos.filter((p) => p.id !== productoSeleccionado);
  }
  localStorage.setItem("productos", JSON.stringify(productos));
  renderProductos(productos);

  //Mensaje de exito
  Toastify({
    text: `${producto.nombre} organizado en ${producto.categoria}`,
    duration: 3000,
    gravity: "top",
    position: "center",
    style: { background: "#00aa66" },
  }).showToast();

  document.getElementById("selectArticulo").value = "";
  document.getElementById("selectGondola").value = "";
  document.getElementById("organizaCantidad").value = "";
}

document
  .getElementById("btnOrganizar")
  .addEventListener("click", organizarProducto);
document
  .getElementById("selectArticulo")
  .addEventListener("change", function () {
    const producto = productos.find((p) => p.id === this.value);
    document.getElementById("organizaCantidad").value = producto
      ? producto.cantidadPendiente
      : "";
  });
