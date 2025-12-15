document.addEventListener("DOMContentLoaded", () => {
  //1. CARGA DE PRODUCTOS DESDE JSON
  fetch("./data/products.json")
  .then((response) => {
      if (!response || !response.ok) {
        throw new Error("No se pudo cargar el JSON");
      }
        return response.json();
      })
      .then((data) => {
      if (data && data.products) {
        const todosLosProductos = data.products;

        // CORRECCIÓN 2: Usamos "category" (en inglés) como está en tu JSON
        const listaComidas = todosLosProductos.filter((p) => p.category === "comidas");
        const listaPostres = todosLosProductos.filter((p) => p.category === "postres");

        // RENDERIZADO
        cargarProductos(listaComidas, "contenedor-comidas");
        cargarProductos(listaPostres, "contenedor-postres");
      } else {
        throw new Error("El JSON no tiene la estructura esperada (falta la clave 'products')");
      }
    })
    .catch((error) => console.error("Error al obtener productos: ", error));
    });



  function cargarProductos(listaDeProductos, idDelContenedor) {
  const contenedor = document.getElementById(idDelContenedor);

  // Si el contenedor no existe, salimos
  if (!contenedor) return;

  contenedor.innerHTML = ""; // Limpiar

  listaDeProductos.forEach((producto) => {
    // Crear columna Bootstrap
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-lg-3";

    // Manejo de descripción corta
    const descripcion = producto.description || "Sin descripción";
    const shortDescription = descripcion.length > 50
        ? descripcion.split(" ").slice(0, 8).join(" ") + "..."
        : descripcion;

    // Inyectar HTML de la tarjeta
    columna.innerHTML = `
        <div class="card shadow-sm h-100">
          <img 
            src="${producto.image}" 
            class="card-img-top" 
            alt="${producto.title}"
            style="height: 200px; object-fit: cover;" 
          >
          <div class="card-body d-flex flex-column">
            <h5 class="card-title text-center">${producto.title}</h5>
            
            <p class="card-text text-muted small">${shortDescription}</p>
            
            <button class="btn btn-link p-0 mb-3 text-decoration-none" style="font-size: 0.9rem;" onclick="alert('${descripcion}')">
              Ver descripción
            </button>
            
            <div class="mt-auto d-flex justify-content-between align-items-center">
                <span class="fw-bold fs-5 text-dark">$${producto.price}</span>
                <button class="btn btn-primary btn-sm" onclick="addToCart(${producto.id}, '${producto.image}', '${producto.title}', ${producto.price}, this)">
                  Agregar
                </button>
            </div>
          </div>
        </div>
      `;
    contenedor.appendChild(columna);
  });
}


// ------ FUNCIONES GLOBALES (Window)------
// TOGGLE DESCRIPCIÓN
window.toggleDescription = function (button) {
  // Ajustamos los selectores para encontrar los elementos hermanos correctamente
  const fullDescription = button.previousElementSibling;
  const shortDescription = fullDescription.previousElementSibling;

  if (fullDescription.style.display === "none") {
    fullDescription.style.display = "block";
    shortDescription.style.display = "none";
    button.textContent = "Ver menos";
  } else {
    fullDescription.style.display = "none";
    shortDescription.style.display = "block";
    button.textContent = "Ver más";
  }
};


  //  AGREGAR AL CARRITO
  window.addToCart = function (id, image, title, price, button) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existingProduct = cart.find((product) => product.id === id);

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({ id, image, title, price: Number(price), quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();

  // Animación del botón
  const textoOriginal = button.textContent;
  button.textContent = "¡Listo!";
  button.classList.replace("btn-primary", "btn-success");
  button.disabled = true;

  setTimeout(() => {
    button.textContent = textoOriginal;
    button.classList.replace("btn-success", "btn-primary");
    button.disabled = false;
  }, 1000);
};


  // ELIMINAR DEL CARRITO
  window.removeFromCart = function (id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
};

// VACIAR CARRITO (Evento Click)
const btnVaciar = document.getElementById("vaciar-carrito");
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      localStorage.removeItem("cart"); // Mejor removeItem que clear para no borrar otras cosas de la app
      updateCartUI();
    });
}

// ACTUALIZAR INTERFAZ DEL CARRITO (SIDEBAR)

  function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const carritoItems = document.getElementById("carrito-items");
  const contadores = document.querySelectorAll("#cart-counter, #cart-counter-nav"); // Badges
  const totalElement = document.getElementById("carrito-total");
  const btnComprar = document.getElementById("realizar-compra");

  if (!carritoItems) return;

  carritoItems.innerHTML = "";
  let total = 0;
  let totalCantidad = 0;

  if (cart.length === 0) {
    carritoItems.innerHTML = '<li class="text-center p-3 text-muted">Tu carrito está vacío</li>';
    if (btnComprar) btnComprar.disabled = true;
  } else {
    if (btnComprar) btnComprar.disabled = false;

    cart.forEach((item) => {
      total += item.price * item.quantity;
      totalCantidad += item.quantity;

      const li = document.createElement('li');
      li.className = "cart-item d-flex align-items-center mb-3 bg-light p-2 rounded";
      li.innerHTML = `
          <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
          <div class="ms-2 flex-grow-1">
            <h6 class="mb-0 small text-truncate" style="max-width: 120px;">${item.title}</h6>
            <small class="text-muted">${item.quantity} x $${item.price}</small>
          </div>
          <span class="fw-bold text-success me-2">$${(item.price * item.quantity).toFixed(2)}</span>
          <button class="btn btn-sm text-danger border-0" onclick="removeFromCart(${item.id})">
            <i class="bi bi-trash"></i> X
          </button>
      `;
      carritoItems.appendChild(li);
    });
  }

  if (totalElement) totalElement.textContent = total.toFixed(2);
  contadores.forEach(badge => badge.textContent = totalCantidad);
}

  
// REALIZAR COMPRA
const btnComprar = document.getElementById("realizar-compra");
if (btnComprar) {
  btnComprar.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const modalTotal = document.getElementById("modal-total");
    if (modalTotal) modalTotal.textContent = total.toFixed(2);

    // Mostrar modal Bootstrap
    const modalEl = document.getElementById("compraExitosaModal");
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }

    // Limpiar carrito
    localStorage.removeItem("cart");
    updateCartUI();
  });
}

// Lógica para abrir/cerrar el Sidebar (si usas el botón del menú)
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const openCartBtn = document.getElementById("open-cart"); // El enlace en el nav

function toggleCart() {
    cartSidebar.classList.toggle("hidden"); // Asumiendo que usas la clase .hidden para ocultar
    // O si usas transform en CSS:
    if (cartSidebar.style.transform === "translateX(0%)") {
        cartSidebar.style.transform = "translateX(100%)";
        cartOverlay.style.display = "none";
    } else {
        cartSidebar.style.transform = "translateX(0%)";
        cartOverlay.style.display = "block";
    }
}

if(openCartBtn) {
    openCartBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Evita que recargue o salte al ancla
        toggleCart();
    });
}

if(cartOverlay) {
    cartOverlay.addEventListener("click", toggleCart);
}


    // Mostrar el modal
    const modal = new bootstrap.Modal(
      document.getElementById("compraExitosaModal")
    );
    modal.show();

    // Limpiar el carrito después de la compra
    localStorage.clear();
    updateCartUI();

    