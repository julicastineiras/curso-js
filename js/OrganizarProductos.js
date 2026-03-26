// Organizar productos en categorias/gondolas

function organizarProducto() {
  const productoSeleccionado = document.getElementById("selectArticulo").value;
  const gondolaSeleccionada = document.getElementById("selectGondola").value;
  const producto = productos.find((p) => p.id === productoSeleccionado);
  const cantidadOrganizar = parseInt(
    document.getElementById("organizaCantidad").value,
  );

  if (!cantidadOrganizar || cantidadOrganizar <= 0) {
    Toastify({
      text: "Ingresá una cantidad válida.",
      gravity: "top",
      position: "center",
    }).showToast();
    return;
  }

  if (cantidadOrganizar > producto.cantidadPendiente) {
    Toastify({
      text: `Solo hay ${producto.cantidadPendiente} unidades pendientes de ${producto.nombre}.`,
      gravity: "top",
      position: "center",
    }).showToast();
    return;
  }

  // Chequea si la gondola del producto seleccionado corresponde a la gondola seleccionada.
  if (gondolaSeleccionada !== producto.categoria) {
    Toastify({
      text: "La gondola seleccionada no corresponde a la categoría del producto.",
      gravity: "top",
      position: "center",
      backgroundColor: "#ff0000",
    }).showToast();
    return;
  }


 //guarda en local storage 
  const organizados = JSON.parse(localStorage.getItem('organizados')) || [];
organizados.push({ 
  id: producto.id, 
  nombre: producto.nombre, 
  categoria: producto.categoria, 
  cantidad: cantidadOrganizar 
});
localStorage.setItem('organizados', JSON.stringify(organizados));

renderTabla();


  producto.cantidadPendiente -= cantidadOrganizar;

  if (producto.cantidadPendiente === 0) {
    productos = productos.filter((p) => p.id !== productoSeleccionado);
  }
  localStorage.setItem("productos", JSON.stringify(productos));
  renderProductos(productos);

  Toastify({
    text: `✅ ${producto.nombre} organizado en ${producto.categoria}`,
    duration: 3000,
    gravity: "top",
    position: "center",
    background: "#00aa66",
  }).showToast();

  document.getElementById("selectArticulo").value = "";
  document.getElementById("selectGondola").value = "";
  document.getElementById("organizaCantidad").value = "";
}

document.getElementById("btnOrganizar").addEventListener("click", organizarProducto);
document.getElementById("selectArticulo").addEventListener("change", function () {
    const producto = productos.find((p) => p.id === this.value);
    document.getElementById("organizaCantidad").value = producto
      ? producto.cantidadPendiente
      : "";
  });
