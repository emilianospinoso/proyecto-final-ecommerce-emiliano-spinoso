# 🇻🇪 Sabores Venearg - E-commerce & Sistema de Gestión

Este proyecto es una aplicación web integral desarrollada como Trabajo Final Integrador. Simula un entorno real de E-commerce para un emprendimiento de comida venezolana ("Sabores Venearg"), combinando una **Tienda Online** para clientes y un **Panel de Administración (Backoffice)** para la gestión del negocio.

El sistema destaca por su capacidad de **persistencia de datos y gestión de stock en tiempo real** utilizando el almacenamiento local del navegador, sin necesidad de un backend tradicional.

## 🚀 Características Principales

### 🛒 Tienda (Cliente)
* **Catálogo Dinámico:** Renderizado automático de productos (Comidas y Postres) basado en datos JSON o LocalStorage.
* **Gestión de Stock:** Validación inteligente que impide agregar al carrito más unidades de las disponibles.
* **Carrito de Compras:** Persistente (no se borra al recargar), con cálculo automático de totales y edición de cantidades.
* **Simulación de Compra:** Al confirmar el pedido, el stock se descuenta automáticamente de la base de datos global.
* **Diseño Responsive:** Adaptado a móviles, tablets y escritorio.

### ⚙️ Panel de Administración (Backoffice)
* **Dashboard:** Visualización de métricas clave (Total de productos, Alertas de bajo stock).
* **CRUD Completo:**
    * **Crear** nuevos productos.
    * **Leer** el listado completo con buscador en tiempo real.
    * **Actualizar** precios, stock, imágenes y descripciones.
    * **Eliminar** productos del catálogo.
* **Seguridad:** Acceso restringido mediante Login y protección de rutas (simulación de sesión con `sessionStorage`).

## 🛠 Tecnologías Utilizadas

* **HTML5:** Estructura semántica y accesible.
* **CSS3:** Estilos personalizados (`styles.css` para tienda, `admin.css` para panel).
* **Bootstrap 5:** Sistema de grillas, componentes (Modales, Cards, Navbar) y diseño responsivo.
* **JavaScript (ES6+):**
    * Lógica asíncrona (`async/await`) para carga de datos.
    * Manipulación avanzada del DOM.
    * Lógica de negocio (descuento de stock, carrito).
* **Persistencia de Datos:** Uso avanzado de `localStorage` para simular una Base de Datos NoSQL.
* **JSON:** Estructura de datos inicial.
* **FontAwesome:** Iconografía para interfaz de usuario.

## 📂 Estructura del Proyecto

```text
├── index.html          # Tienda Principal (Landing Page)
├── login.html          # Puerta de acceso al Admin
├── admin.html          # Panel de Gestión (CRUD)
│
├── css/
│   ├── styles.css      # Estilos de la Tienda
│   └── admin.css       # Estilos del Panel Administrativo
│
├── js/
│   ├── script.js       # Lógica de la Tienda y Carrito
│   └── admin.js        # Lógica del Backoffice y Seguridad
│
├── data/
│   └── products.json   # Datos semilla (Seed data)
│
└── img/                # Recursos gráficos

## 🔐 Credenciales de Acceso
Para ingresar al Panel de Administración y probar las funcionalidades de gestión:

Hacer clic en el botón "Acceso Admin" en el footer o en el engranaje flotante.

Ingresar los siguientes datos:

Usuario: admin

Contraseña: 1234

## 📦 Instalación y Uso
Clonar el repositorio o descargar el ZIP.

Importante: Abrir el proyecto utilizando Live Server (extensión de VS Code) o un servidor local equivalente.

Nota: Al usar fetch para leer el JSON, el protocolo file:// puede dar errores de CORS si se abre directamente.

Al iniciar por primera vez, la aplicación cargará los datos desde products.json.

Cualquier cambio realizado en el Admin (precios, stock) se guardará en el navegador y se reflejará instantáneamente en la tienda.

## 🔄 Flujo de Datos (Lógica del Sistema)
El proyecto utiliza una arquitectura híbrida de datos:

Carga Inicial: El sistema verifica si existe una base de datos en localStorage.

Fallback: Si no existe, consume el archivo data/products.json y crea la base de datos local.

Sincronización: Tanto la Tienda (script.js) como el Admin (admin.js) leen y escriben sobre la misma variable en localStorage, permitiendo que el descuento de stock por ventas se vea reflejado en el inventario del administrador en tiempo real.

Desarrollado para el Trabajo Final Integrador de FrontEnd-BackEnd - 2025
