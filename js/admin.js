// js/admin.js

let productsData = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarSistema();
});

// 1. INICIALIZACIÓN Y PERSISTENCIA (SIMULADA)
async function inicializarSistema() {
    // Intentamos leer del LocalStorage
    const storedProducts = localStorage.getItem('productsDB');

    if (storedProducts) {
        productsData = JSON.parse(storedProducts);
        renderizarTabla();
        actualizarDashboard();
    } else {
        // Si es la primera vez, leemos el JSON y lo guardamos en LocalStorage
        try {
            const response = await fetch('./data/products.json');
            const data = await response.json();
            
            // Normalizamos para asegurar que leemos .products
            if(data.products) {
                productsData = data.products;
            } else {
                productsData = data; // Por si el JSON es un array directo
            }

            // GUARDAMOS EN DB BROWSER
            guardarEnLocalStorage();
            renderizarTabla();
            actualizarDashboard();
        } catch (error) {
            console.error("Error cargando datos iniciales:", error);
            alert("Error cargando la base de datos inicial.");
        }
    }
}

function guardarEnLocalStorage() {
    localStorage.setItem('productsDB', JSON.stringify(productsData));
    actualizarDashboard();
}

// 2. NAVEGACIÓN
window.mostrarSeccion = function(seccionId) {
    // Ocultar todas
    document.getElementById('seccion-dashboard').style.display = 'none';
    document.getElementById('seccion-productos').style.display = 'none';
    document.getElementById('seccion-nuevo-pedido').style.display = 'none';

    // Mostrar seleccionada
    document.getElementById(`seccion-${seccionId}`).style.display = 'block';

    // Actualizar sidebar activo
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// 3. GESTIÓN DE PRODUCTOS (CRUD)

// b) Listar Productos (Renderizar Tabla)
function renderizarTabla(filtro = "") {
    const tbody = document.getElementById('tabla-productos-body');
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
            <td>
                <span class="badge ${p.stock < 5 ? 'bg-danger' : 'bg-success'}">
                    ${p.stock} u.
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarProducto(${p.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// c) Buscar Producto
document.getElementById('buscar-producto').addEventListener('input', (e) => {
    renderizarTabla(e.target.value);
});

// a) y d) Agregar / Actualizar (Manejo del Modal)
const modalProducto = new bootstrap.Modal(document.getElementById('productoModal'));

window.abrirModalProducto = function() {
    document.getElementById('productoForm').reset();
    document.getElementById('prodId').value = ""; // ID vacío = Crear nuevo
    document.getElementById('modalTitle').innerText = "Agregar Producto";
    modalProducto.show();
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
        modalProducto.show();
    }
}

// Guardar (Submit del form)
document.getElementById('productoForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('prodId').value;
    const title = document.getElementById('prodTitle').value;
    const category = document.getElementById('prodCategory').value;
    const price = Number(document.getElementById('prodPrice').value);
    const stock = Number(document.getElementById('prodStock').value);
    const image = document.getElementById('prodImage').value || "https://via.placeholder.com/150";
    const description = document.getElementById('prodDesc').value;

    if(id) {
        // ACTUALIZAR EXISTENTE
        const index = productsData.findIndex(p => p.id == id);
        if(index !== -1) {
            productsData[index] = { ...productsData[index], title, category, price, stock, image, description };
            alert("Producto actualizado correctamente.");
        }
    } else {
        // CREAR NUEVO (Generar ID único basado en timestamp)
        const newProduct = {
            id: Date.now(), // ID numérico único
            title, category, price, stock, image, description
        };
        productsData.push(newProduct);
        alert("Producto agregado correctamente.");
    }

    guardarEnLocalStorage();
    renderizarTabla();
    modalProducto.hide();
});

// e) Eliminar Producto
window.eliminarProducto = function(id) {
    if(confirm("¿Estás seguro de eliminar el producto #" + id + "?")) {
        productsData = productsData.filter(p => p.id !== id);
        guardarEnLocalStorage();
        renderizarTabla();
    }
}

// 4. ACTUALIZAR DASHBOARD
function actualizarDashboard() {
    document.getElementById('dash-total-productos').innerText = productsData.length;
    const bajoStock = productsData.filter(p => p.stock < 5).length;
    document.getElementById('dash-stock-bajo').innerText = bajoStock;
}
