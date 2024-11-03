const carritoResumen = document.getElementById("totalCompra");
const medicamentosContainer = document.getElementById("medicamentos");
const iconoCarrito = document.getElementById("iconoCarrito");
const vistaCarrito = document.getElementById("vistaCarrito");
const fondoPopup = document.getElementById("fondoPopup");
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
fetch("data/productos.json")
    .then(response => response.json())
    .then(data => mostrarProductos(data));
function mostrarProductos(productos) {
    medicamentosContainer.innerHTML = "";
    productos.forEach(producto => {
        const medicamentoDiv = document.createElement("div");
        medicamentoDiv.classList.add("medicamento");
        medicamentoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
        `;
        const botonAgregar = document.createElement("button");
        botonAgregar.innerText = "Agregar al carrito";
        botonAgregar.classList.add("boton-agregar");
        botonAgregar.addEventListener("click", () => agregarAlCarrito(producto.nombre, producto.precio, producto.imagen));

        medicamentoDiv.appendChild(botonAgregar);
        medicamentosContainer.appendChild(medicamentoDiv);
    });
}
function agregarAlCarrito(nombre, precio, imagen, cantidad = 1) {
    const itemEnCarrito = carrito.find(item => item.nombre === nombre);
    if (itemEnCarrito) {
        itemEnCarrito.cantidad += cantidad;
        itemEnCarrito.total = itemEnCarrito.cantidad * itemEnCarrito.precio;
    } else {
        carrito.push({ nombre, precio, cantidad, total: precio * cantidad, imagen });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
    Swal.fire({
        title: 'Agregado al carrito',
        text: `${nombre} ha sido añadido a tu carrito.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
}
function calcularTotal() {
    return carrito.reduce((acc, item) => acc + item.total, 0);
}
function actualizarCarrito() {
    const total = calcularTotal();
    carritoResumen.innerText = `Total de la compra: $${total}`;
}
function renderizarCarrito() {
    vistaCarrito.innerHTML = "";
    const titulo = document.createElement("h2");
    titulo.innerText = "Carrito de Compras";
    vistaCarrito.appendChild(titulo);
    const botonCerrar = document.createElement("span");
    botonCerrar.innerHTML = "&times;";
    botonCerrar.classList.add("boton-cerrar");
    botonCerrar.addEventListener("click", cerrarPopup);
    vistaCarrito.appendChild(botonCerrar);
    carrito.forEach(item => {
        const itemCarrito = document.createElement("div");
        itemCarrito.classList.add("item-carrito");
        itemCarrito.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="imagen-item-carrito">
            <span>${item.nombre} - $${item.precio}</span>
        `;
        const cantidadInput = document.createElement("input");
        cantidadInput.type = "number";
        cantidadInput.min = 1;
        cantidadInput.value = item.cantidad;
        cantidadInput.classList.add("cantidad-input");
        cantidadInput.addEventListener("change", (e) => {
            const nuevaCantidad = parseInt(e.target.value);
            if (nuevaCantidad > 0) {
                actualizarCantidad(item.nombre, nuevaCantidad);
            }
        });
        itemCarrito.appendChild(cantidadInput);
        const totalItem = document.createElement("span");
        totalItem.classList.add("total-item");
        totalItem.innerText = `Total: $${item.total}`;
        itemCarrito.appendChild(totalItem);
        const botonEliminar = document.createElement("button");
        botonEliminar.innerText = "Eliminar";
        botonEliminar.classList.add("boton-eliminar");
        botonEliminar.addEventListener("click", () => eliminarDelCarrito(item.nombre));
        itemCarrito.appendChild(botonEliminar);
        vistaCarrito.appendChild(itemCarrito);
    });
    const totalCompra = document.createElement("p");
    totalCompra.innerText = `Total: $${calcularTotal()}`;
    totalCompra.classList.add("total-compra");
    vistaCarrito.appendChild(totalCompra);
    const metodoPagoLabel = document.createElement("label");
    metodoPagoLabel.innerText = "Método de Pago: ";
    const metodoPagoSelect = document.createElement("select");
    metodoPagoSelect.classList.add("dropdown-pago");
    metodoPagoSelect.innerHTML = `
        <option value="credito">Crédito</option>
        <option value="debito">Débito</option>
    `;
    metodoPagoLabel.appendChild(metodoPagoSelect);
    vistaCarrito.appendChild(metodoPagoLabel);

    const direccionEnvio = document.createElement("input");
    direccionEnvio.type = "text";
    direccionEnvio.id = "direccionEnvio";
    direccionEnvio.placeholder = "Dirección de Envío";
    direccionEnvio.classList.add("input-direccion");
    vistaCarrito.appendChild(direccionEnvio);
    const botonFinalizar = document.createElement("button");
    botonFinalizar.innerText = "Finalizar Compra";
    botonFinalizar.classList.add("boton-finalizar");
    botonFinalizar.addEventListener("click", () => finalizarCompra(direccionEnvio.value, metodoPagoSelect.value));
    vistaCarrito.appendChild(botonFinalizar);
    vistaCarrito.style.display = "block";
    fondoPopup.style.display = "block";
}
function actualizarCantidad(nombre, cantidad) {
    const itemEnCarrito = carrito.find(item => item.nombre === nombre);
    if (itemEnCarrito) {
        itemEnCarrito.cantidad = cantidad;
        itemEnCarrito.total = itemEnCarrito.cantidad * itemEnCarrito.precio;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarCarrito();
        renderizarCarrito();
    }
}
iconoCarrito.addEventListener("click", renderizarCarrito);
function cerrarPopup() {
    vistaCarrito.style.display = "none";
    fondoPopup.style.display = "none";
}
fondoPopup.addEventListener("click", cerrarPopup);
function eliminarDelCarrito(nombre) {
    const index = carrito.findIndex(item => item.nombre === nombre);
    if (index > -1) {
        carrito.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        actualizarCarrito();
        renderizarCarrito();
    }
}
function finalizarCompra(direccion, metodoPago) {
    if (direccion.trim() === "") {
        Swal.fire({
            title: 'Dirección de Envío',
            text: 'Por favor, ingresa una dirección de envío antes de finalizar la compra.',
            icon: 'warning'
        });
        return;
    }
    Swal.fire({
        title: 'Compra realizada',
        text: `Tu pedido ha sido confirmado y será enviado a: ${direccion}\nMétodo de pago: ${metodoPago}`,
        icon: 'success'
    }).then(() => {
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarCarrito();
        cerrarPopup();
    });
}
actualizarCarrito();
