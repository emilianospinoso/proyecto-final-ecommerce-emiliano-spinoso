// js/script.js

// Variable global para mantener los productos cargados
let inventarioGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarDatosDelSistema();
  inicializarCarrito();
});

// 1. CARGA DE DATOS (Conexión con Admin)
function cargarDatosDelSistema() {
  // A) Intentamos leer la "Base de Datos" local (creada por el Admin)
  const storedProducts = localStorage.getItem('productsDB');

  if (storedProducts) {
    console.log("Cargando datos desde el Sistema (LocalStorage)...");
    inventarioGlobal = JSON.parse(storedProducts);
    renderizarTienda(inventarioGlobal);
  } else {
    // B) Si no hay datos locales, leemos el JSON original
    console.log("Cargando datos desde archivo JSON...");
    fetch("./data/products.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el JSON");
        return res.json();
      })
      .then((data) => {
        // Normalizamos: si viene { products: [...] } usamos eso, si no, el array directo
        inventarioGlobal = data.products ? data.products : data;
        
        // Guardamos esto en memoria para sincronizar futura gestión
        localStorage.setItem('productsDB', JSON.stringify(inventarioGlobal));
        
        renderizarTienda(inventarioGlobal);
      })
      .catch((err) => console.error("Error cargando productos:", err));
  }
}

// 2. RENDERIZADO EN EL HTML
function renderizarTienda(productos) {
  // Filtramos por categorías (asegúrate que en el JSON dice "category")
  const comidas = productos.filter((p) => p.category === "comidas");
  const postres = productos.filter((p) => p.category === "postres");

  pintarContenedor(comidas, "contenedor-comidas");
  pintarContenedor(postres, "contenedor-postres");
}

function pintarContenedor(lista, idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  contenedor.innerHTML = ""; // Limpiar antes de pintar

  lista.forEach((prod) => {
    // Definir si hay stock
    const sinStock = prod.stock <= 0;
    const textoBoton = sinStock ? "Sin Stock" : "Agregar";
    const claseBoton = sinStock ? "btn-secondary" : "btn-primary";
    const disabled = sinStock ? "disabled" : "";

    // Cortar descripción larga
    const desc = prod.description || "";
    const shortDesc = desc.length > 50 ? desc.substring(0, 50) + "..." : desc;

    // Crear la columna y tarjeta
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-3";

    col.innerHTML = `
      <div class="card shadow-sm h-100">
        <div class="position-relative">
            <img src="${prod.image}" class="card-img-top" alt="${prod.title}" style="height: 200px; object-fit: cover;">
            ${sinStock ? '<span class="position-absolute top-0 end-0 badge bg-danger m-2">AGOTADO</span>' : ''}
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-center">${prod.title}</h5>
          <p class="card-text text-muted small" title="${desc}">${shortDesc}</p>
          
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="fw-bold fs-5 text-dark">$${prod.price}</span>
            <button 
                class="btn ${claseBoton} btn-sm" 
                onclick="addToCart(${prod.id})" 
                ${disabled}>
                ${textoBoton}
            </button>
          </div>
          <small class="text-center text-muted mt-2" style="font-size: 0.75rem">Stock: ${prod.stock || 0}</small>
        </div>
      </div>
    `;
    contenedor.appendChild(col);
  });
}

// --- LOGICA DEL CARRITO ---

// 3. AGREGAR AL CARRITO
window.addToCart = function (id) {
  // Buscamos el producto real en el inventario para chequear stock
  const productoReal = inventarioGlobal.find((p) => p.id === id);
  
  if (!productoReal) return;
  
  if (productoReal.stock <= 0) {
      alert("Lo sentimos, no queda stock de este producto.");
      return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let itemEnCarrito = cart.find((item) => item.id === id);

  // Validamos que no agregue más de lo que hay en stock
  if (itemEnCarrito) {
      if (itemEnCarrito.quantity >= productoReal.stock) {
          alert(`Solo quedan ${productoReal.stock} unidades disponibles.`);
          return;
      }
      itemEnCarrito.quantity++;
  } else {
      cart.push({ ...productoReal, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  
  // Feedback visual (opcional, abre el carrito)
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");
  if(sidebar) {
      sidebar.style.transform = "translateX(0%)";
      if(overlay) overlay.style.display = "block";
  }
};

// 4. ELIMINAR DEL CARRITO
window.removeFromCart = function (id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
};

// 5. ACTUALIZAR INTERFAZ (UI) DEL CARRITO
function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const contenedorItems = document.getElementById("carrito-items");
  const contadores = document.querySelectorAll("#cart-counter, #cart-counter-nav");
  const totalEl = document.getElementById("carrito-total");
  const btnComprar = document.getElementById("realizar-compra");

  if (!contenedorItems) return;

  contenedorItems.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  if (cart.length === 0) {
    contenedorItems.innerHTML = '<div class="text-center p-4 text-muted">Tu carrito está vacío</div>';
    if (btnComprar) btnComprar.disabled = true;
  } else {
    if (btnComprar) btnComprar.disabled = false;

    cart.forEach((item) => {
      total += item.price * item.quantity;
      cantidadTotal += item.quantity;

      const div = document.createElement("div");
      div.className = "d-flex align-items-center mb-3 bg-light p-2 rounded border";
      div.innerHTML = `
        <img src="${item.image}" alt="img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        <div class="ms-2 flex-grow-1">
            <h6 class="mb-0 small text-truncate" style="max-width: 130px;">${item.title}</h6>
            <small class="text-muted">${item.quantity} x $${item.price}</small>
        </div>
        <span class="fw-bold text-success me-2">$${(item.price * item.quantity).toFixed(2)}</span>
        <button class="btn btn-sm text-danger border-0" onclick="removeFromCart(${item.id})">✕</button>
      `;
      contenedorItems.appendChild(div);
    });
  }

  if (totalEl) totalEl.textContent = total.toFixed(2);
  contadores.forEach(c => c.textContent = cantidadTotal);
}

// 6. FINALIZAR COMPRA (Actualiza Stock del Admin)
function inicializarCarrito() {
    updateCartUI();

    const btnComprar = document.getElementById("realizar-compra");
    if (btnComprar) {
        btnComprar.addEventListener("click", () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            if (cart.length === 0) return;

            // 1. DESCONTAR STOCK DEL INVENTARIO GLOBAL
            let stockInsuficiente = false;
            
            cart.forEach(itemCarrito => {
                const index = inventarioGlobal.findIndex(p => p.id === itemCarrito.id);
                if (index !== -1) {
                    if (inventarioGlobal[index].stock >= itemCarrito.quantity) {
                        inventarioGlobal[index].stock -= itemCarrito.quantity;
                    } else {
                        stockInsuficiente = true;
                    }
                }
            });

            if (stockInsuficiente) {
                alert("Hubo un error con el stock de algunos productos. Por favor revise.");
                // Aquí podrías recargar la página para actualizar stocks
                return; 
            }

            // 2. GUARDAR NUEVO STOCK EN LOCALSTORAGE (Para que el Admin lo vea)
            localStorage.setItem('productsDB', JSON.stringify(inventarioGlobal));

            // 3. CALCULAR TOTAL PARA EL MODAL
            const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const modalTotal = document.getElementById("modal-total");
            if (modalTotal) modalTotal.textContent = total.toFixed(2);

            // 4. MOSTRAR MODAL EXITO
            const modalEl = document.getElementById("compraExitosaModal");
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }

            // 5. LIMPIAR CARRITO Y RE-RENDERIZAR TIENDA (Para mostrar nuevo stock)
            localStorage.removeItem("cart");
            updateCartUI();
            renderizarTienda(inventarioGlobal);
        });
    }

    // Botón Vaciar
    const btnVaciar = document.getElementById("vaciar-carrito");
    if (btnVaciar) {
        btnVaciar.addEventListener("click", () => {
            localStorage.removeItem("cart");
            updateCartUI();
        });
    }
}

// 7. FUNCIONES VISUALES DEL SIDEBAR
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");

window.toggleCart = function() {
    if (!cartSidebar) return;
    if (cartSidebar.style.transform === "translateX(0%)") {
        cartSidebar.style.transform = "translateX(100%)";
        if(cartOverlay) cartOverlay.style.display = "none";
    } else {
        cartSidebar.style.transform = "translateX(0%)";
        if(cartOverlay) cartOverlay.style.display = "block";
    }
}

if(cartOverlay) cartOverlay.addEventListener("click", toggleCart);

// Listener para el botón del navbar (si existe)
const openCartBtn = document.getElementById("open-cart");
if(openCartBtn) {
    openCartBtn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleCart();
    });
}

