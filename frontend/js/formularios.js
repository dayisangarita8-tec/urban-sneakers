// ================= VARIABLES GLOBALES =================
const state = {
    currentUser: null,
    cart: [],
    favorites: [],
    currentSection: 'inicio'
};

// ================= ELEMENTOS DEL DOM =================
// Botones de navegación
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const btnLogout = document.getElementById("btn-logout");
const btnInicio = document.getElementById("btn-inicio");
const btnCat1 = document.getElementById("btn-cat1");
const btnCat2 = document.getElementById("btn-cat2");
const btnCat3 = document.getElementById("btn-cat3");
const btnContacto = document.getElementById("btn-contacto");
const btnCart = document.getElementById("btn-cart");

// Secciones
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const catalogo1 = document.getElementById("catalogo1");
const catalogo2 = document.getElementById("catalogo2");
const catalogo3 = document.getElementById("catalogo3");
const contacto = document.getElementById("contacto");
const carrusel = document.querySelector(".carousel-container");
const searchContainer = document.getElementById("search-container");
const userInfo = document.getElementById("user-info");
const userName = document.getElementById("user-name");

// ================= MANEJO DE USUARIOS =================
// Verificar si hay un usuario en localStorage al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
    state.currentUser = JSON.parse(savedUser);
    updateUIAfterLogin();
    }
    
    initCarousel();
    initFavorites();
});

// Registro de usuario
document.getElementById("register-btn").addEventListener("click", () => {
    const nombre = document.getElementById("reg-nombre").value;
    const email = document.getElementById("reg-email").value;
    const pass = document.getElementById("reg-pass").value;
    
    if(nombre && email && pass){
    state.currentUser = { nombre, email, pass };
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    
    alert("Registro exitoso. Bienvenido/a " + nombre);
    registerForm.classList.add("oculto");
    updateUIAfterLogin();
    showSection('inicio');
    } else {
    alert("Por favor completa todos los campos.");
    }
});

// Inicio de sesión
document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-pass").value;
    
    // En una aplicación real, esto se verificaría contra una base de datos
    if (state.currentUser && email === state.currentUser.email && pass === state.currentUser.pass) {
    alert("Inicio de sesión exitoso. Bienvenido/a " + state.currentUser.nombre);
    loginForm.classList.add("oculto");
    updateUIAfterLogin();
    showSection('inicio');
    } else {
    alert("Correo o contraseña incorrectos.");
    }
});

// Cerrar sesión
btnLogout.addEventListener("click", () => {
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    
    btnLogin.classList.remove("oculto");
    btnRegister.classList.remove("oculto");
    btnLogout.classList.add("oculto");
    btnCart.classList.add("oculto");
    userInfo.classList.add("oculto");
    searchContainer.classList.add("oculto");
    
    alert("Has cerrado sesión.");
    showSection('inicio');
});

// Navegación entre formularios
document.getElementById("go-to-register").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("oculto");
    registerForm.classList.remove("oculto");
    registerForm.classList.add("fade-in");
});

document.getElementById("go-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("oculto");
    loginForm.classList.remove("oculto");
    loginForm.classList.add("fade-in");
});

// Actualizar UI después del login
function updateUIAfterLogin() {
    btnLogin.classList.add("oculto");
    btnRegister.classList.add("oculto");
    btnLogout.classList.remove("oculto");
    btnCart.classList.remove("oculto");
    userInfo.classList.remove("oculto");
    searchContainer.classList.remove("oculto");
    userName.textContent = state.currentUser.nombre;
}

// ================= NAVEGACIÓN =================
btnInicio.addEventListener("click", () => showSection('inicio'));
btnCat1.addEventListener("click", () => showSection('catalogo1'));
btnCat2.addEventListener("click", () => showSection('catalogo2'));
btnCat3.addEventListener("click", () => showSection('catalogo3'));
btnContacto.addEventListener("click", () => showSection('contacto'));
btnLogin.addEventListener("click", () => showSection('login'));
btnRegister.addEventListener("click", () => showSection('register'));

function showSection(section) {
    // Ocultar todas las secciones
    loginForm.classList.add("oculto");
    registerForm.classList.add("oculto");
    catalogo1.classList.add("oculto");
    catalogo2.classList.add("oculto");
    catalogo3.classList.add("oculto");
    contacto.classList.add("oculto");
    carrusel.classList.add("oculto");
    
    // Mostrar la sección solicitada
    switch(section) {
    case 'inicio':
        carrusel.classList.remove("oculto");
        carrusel.classList.add("fade-in");
        state.currentSection = 'inicio';
        break;
    case 'login':
        if (!state.currentUser) {
        loginForm.classList.remove("oculto");
        loginForm.classList.add("fade-in");
        state.currentSection = 'login';
        } else {
        showSection('inicio');
        }
        break;
    case 'register':
        if (!state.currentUser) {
        registerForm.classList.remove("oculto");
        registerForm.classList.add("fade-in");
        state.currentSection = 'register';
        } else {
        showSection('inicio');
        }
        break;
    case 'catalogo1':
        catalogo1.classList.remove("oculto");
        catalogo1.classList.add("fade-in");
        state.currentSection = 'catalogo1';
        break;
    case 'catalogo2':
        catalogo2.classList.remove("oculto");
        catalogo2.classList.add("fade-in");
        state.currentSection = 'catalogo2';
        break;
    case 'catalogo3':
        catalogo3.classList.remove("oculto");
        catalogo3.classList.add("fade-in");
        state.currentSection = 'catalogo3';
        break;
    case 'contacto':
        contacto.classList.remove("oculto");
        contacto.classList.add("fade-in");
        state.currentSection = 'contacto';
        break;
    }
}

// ================= CARRUSEL =================
function initCarousel() {
    const slidesContainer = document.querySelector('.carousel-slides');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    
    let currentSlide = 0, slideInterval;

    // Crear indicadores
    slides.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.classList.add('carousel-indicator');
    if (index === 0) indicator.classList.add('active');
    indicator.addEventListener('click', () => goToSlide(index));
    indicatorsContainer.appendChild(indicator);
    });

    const indicators = document.querySelectorAll('.carousel-indicator');

    function goToSlide(index) {
    currentSlide = index;
    updateSlidePosition();
    updateIndicators();
    resetInterval();
    }
    
    function updateSlidePosition() {
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    function updateIndicators() {
    indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentSlide));
    }
    
    function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlidePosition(); 
    updateIndicators();
    }
    
    function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlidePosition(); 
    updateIndicators();
    }
    
    function startInterval() { 
    slideInterval = setInterval(nextSlide, 4000); 
    }
    
    function resetInterval() { 
    clearInterval(slideInterval); 
    startInterval(); 
    }

    nextButton.addEventListener('click', () => { 
    nextSlide(); 
    resetInterval(); 
    });
    
    prevButton.addEventListener('click', () => { 
    prevSlide(); 
    resetInterval(); 
    });
    
    slidesContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slidesContainer.addEventListener('mouseleave', startInterval);

    startInterval();
}

// ================= FAVORITOS Y CARRITO =================
function initFavorites() {
    // Añadir event listeners a los botones de favorito
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    favoriteButtons.forEach(button => {
    button.addEventListener('click', function() {
        this.classList.toggle('active');
        this.innerHTML = this.classList.contains('active') ? 
        '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        
        // Aquí podrías guardar los favoritos en el state
    });
    });
    
    // Añadir event listeners a los botones de carrito
    const cartButtons = document.querySelectorAll('.btn-cart');
    cartButtons.forEach(button => {
    button.addEventListener('click', function() {
        const productElement = this.closest('.producto');
        const productName = productElement.querySelector('h3').textContent;
        
        // Añadir al carrito
        state.cart.push({
        name: productName,
        price: 0 // En una app real, tendrías precios reales
        });
        
        // Actualizar contador del carrito
        updateCartCount();
        
        // Mensaje de confirmación
        alert(`¡${productName} añadido al carrito!`);
    });
    });
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = state.cart.length;
}

// ================= BÚSQUEDA =================
document.getElementById('search-btn').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
    performSearch();
    }
});

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    if (searchTerm.trim() === '') return;
    
    // Buscar en todos los productos
    const allProducts = document.querySelectorAll('.producto');
    let found = false;
    
    allProducts.forEach(product => {
    const productName = product.querySelector('h3').textContent.toLowerCase();
    if (productName.includes(searchTerm)) {
        product.style.display = 'block';
        found = true;
    } else {
        product.style.display = 'none';
    }
    });
    
    // Mostrar la sección de catálogo donde se encontraron resultados
    if (found) {
    showSection('catalogo1');
    } else {
    alert("No se encontraron productos que coincidan con tu búsqueda.");
    }
}

// ================= FORMULARIO DE CONTACTO =================
document.getElementById('contact-btn').addEventListener('click', function() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    if (name && email && message) {
    alert('Gracias por tu mensaje. Te contactaremos pronto.');
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-message').value = '';
    } else {
    alert('Por favor completa todos los campos.');
    }
});