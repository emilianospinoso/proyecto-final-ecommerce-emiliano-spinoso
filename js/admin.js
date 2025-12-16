let productsData = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICAR DÓNDE ESTAMOS
    const path = window.location.pathname;
    
    // Si estamos en el admin.html, CHEQUEAR SEGURIDAD
    if (path.includes('admin.html')) {
        verificarSesion();
        inicializarSistema();
    }
    
    // Si estamos en login.html, ACTIVAR LISTENER DEL FORMULARIO
    if (path.includes('login.html')) {
        configurarLogin();
    }
});

// --- SEGURIDAD ---

function verificarSesion() {
    const sesionActiva = sessionStorage.getItem('adminLogged');
    if (!sesionActiva) {
        // Si no hay llave, lo mandamos al login
        window.location.href = 'login.html';
    }
}

function configurarLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            // CREDENCIALES (Puedes cambiarlas aquí)
            if (user === 'admin' && pass === '1234') {
                // Guardamos la "llave" en la sesión
                sessionStorage.setItem('adminLogged', 'true');
                window.location.href = 'admin.html';
            } else {
                const errorDiv = document.getElementById('loginError');
                errorDiv.classList.remove('d-none');
            }
        });
    }
}

// Función para el botón "Salir" del menú lateral
window.cerrarSesion = function() {
    sessionStorage.removeItem('adminLogged');
    window.location.href = 'index.html';
}


// --- TU CÓDIGO ANTERIOR DEL SISTEMA (CRUD) ---

async function inicializarSistema() {
    // ... (Aquí va TODO el código de inicializarSistema, renderizarTabla, etc. que tenías antes)
    // ... PEGA AQUÍ EL RESTO DEL CÓDIGO DEL PASO ANTERIOR ...
    // PARA AHORRAR ESPACIO, SOLO TE MUESTRO DONDE VA:
    
    const storedProducts = localStorage.getItem('productsDB');

    if (storedProducts) {
        productsData = JSON.parse(storedProducts);
        renderizarTabla();
        actualizarDashboard();
    } else {
        try {
            const response = await fetch('./data/products.json');
            const data = await response.json();
            if(data.products) {
                productsData = data.products;
            } else {
                productsData = data;
            }
            guardarEnLocalStorage();
            renderizarTabla();
            actualizarDashboard();
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    }
}

function guardarEnLocalStorage() {
    localStorage.setItem('productsDB', JSON.stringify(productsData));
    actualizarDashboard();
}

// NAVEGACIÓN
window.mostrarSeccion = function(seccionId) {
    document.getElementById('seccion-dashboard').style.display = 'none';
    document.getElementById('seccion-productos').style.display = 'none';
    document.getElementById('seccion-nuevo-pedido').style.display = 'none';

    document.getElementById(`seccion-${seccionId}`).style.display = 'block';

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// GESTIÓN DE PRODUCTOS
function renderizarTabla(filtro = "") {
    const tbody = document.getElementById('tabla-productos-body');
    if(!tbody) return; // Seguridad por si no cargó el HTML
    tbody.innerHTML = "";

    const datosFiltrados = productsData.filter(p => 
        p.title.toLowerCase().includes(filtro.toLowerCase()) || 
        p.id.toString().includes(filtro)
    );

    datosFiltrados.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${p.id}</td>
            <td><img src="${p.image}" width="40" height="40" class="rounded"></td>
            <td class="fw-bold">${p.title}</td>
            <td><span class="badge bg-secondary">${p.category}</span></td>
            <td>$${p.price}</td>
            <td><span class="badge ${p.stock < 5 ? 'bg-danger' : 'bg-success'}">${p.stock} u.</span></td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarProducto(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Listeners y Modales
const buscarInput = document.getElementById('buscar-producto');
if(buscarInput) {
    buscarInput.addEventListener('input', (e) => renderizarTabla(e.target.value));
}

// INICIALIZAR MODAL SOLO SI EXISTE EL ELEMENTO (Para evitar error en login.html)
let modalProducto;
const modalEl = document.getElementById('productoModal');
if(modalEl) {
    modalProducto = new bootstrap.Modal(modalEl);
}

window.abrirModalProducto = function() {
    document.getElementById('productoForm').reset();
    document.getElementById('prodId').value = "";
    document.getElementById('modalTitle').innerText = "Agregar Producto";
    if(modalProducto) modalProducto.show();
}

window.editarProducto = function(id) {
    const p = productsData.find(item => item.id === id);
    if(p) {
        document.getElementById('prodId').value = p.id;
        document.getElementById('prodTitle').value = p.title;
        document.getElementById('prodCategory').value = p.category;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodStock').value = p.stock || 0;
        document.getElementById('prodImage').value = p.image;
        document.getElementById('prodDesc').value = p.description;
        
        document.getElementById('modalTitle').innerText = "Actualizar Producto";
        if(modalProducto) modalProducto.show();
    }
}

const prodForm = document.getElementById('productoForm');
if(prodForm) {
    prodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prodId').value;
        const title = document.getElementById('prodTitle').value;
        const category = document.getElementById('prodCategory').value;
        const price = Number(document.getElementById('prodPrice').value);
        const stock = Number(document.getElementById('prodStock').value);
        const image = document.getElementById('prodImage').value || "https://via.placeholder.com/150";
        const description = document.getElementById('prodDesc').value;

        if(id) {
            const index = productsData.findIndex(p => p.id == id);
            if(index !== -1) {
                productsData[index] = { ...productsData[index], title, category, price, stock, image, description };
                alert("Producto actualizado");
            }
        } else {
            const newProduct = { id: Date.now(), title, category, price, stock, image, description };
            productsData.push(newProduct);
            alert("Producto agregado");
        }
        guardarEnLocalStorage();
        renderizarTabla();
        if(modalProducto) modalProducto.hide();
    });
}

window.eliminarProducto = function(id) {
    if(confirm("¿Eliminar producto #" + id + "?")) {
        productsData = productsData.filter(p => p.id !== id);
        guardarEnLocalStorage();
        renderizarTabla();
    }
}

function actualizarDashboard() {
    const totalEl = document.getElementById('dash-total-productos');
    const bajoEl = document.getElementById('dash-stock-bajo');
    
    if(totalEl) totalEl.innerText = productsData.length;
    if(bajoEl) {
        const bajoStock = productsData.filter(p => p.stock < 5).length;
        bajoEl.innerText = bajoStock;
    }
}