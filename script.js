const LS_USERS   = 'cepasUsers';
const LS_SESSION = 'cepasSession';
const LS_RES     = 'cepasReservas';
const LS_MENU    = 'cepasMenu';
const LS_CATEGORIAS = 'cepasCategorias';

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const save = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
const load = k=>JSON.parse(localStorage.getItem(k)||'[]');

const io=new IntersectionObserver(
  e=>e.forEach(x=>x.isIntersecting&&x.target.classList.add('loaded')),
  {threshold:.2});
$$('.fade-in').forEach(el=>io.observe(el));

function currentUser(){return JSON.parse(localStorage.getItem(LS_SESSION)||'null');}
function logout(){localStorage.removeItem(LS_SESSION);location.href='menu.html';}

/* ---------- REGISTRO (actualizado con mensaje y limpieza) ---------- */
function signUp(name,email,pass){
  const users = load(LS_USERS);
  if(users.some(u => u.email === email)){
    alert('Ese correo ya está registrado.');
    return;
  }

  users.push({name,email,pass,admin:false});
  save(LS_USERS, users);

  // Limpia campos y muestra mensaje
  document.querySelectorAll('#modalLogin form')[1]?.reset();
  alert('✅  Registrado correctamente. ¡Ingresa ahora!');
  document.querySelector('#modalLogin input[name="email"]')?.focus();
}

/* ---------- LOGIN ---------- */
function login(email,pass){
  const u = (email==='kingbrasa_admin' && pass==='123456789')
            ? {name:'Administrador',email,admin:true}
            : load(LS_USERS).find(x=>x.email===email && x.pass===pass);

  if(!u){
    alert('No estás registrado o la contraseña es incorrecta.\nPor favor, regístrate para una mejor experiencia.');
    return;
  }

  save(LS_SESSION,u);
  location.href = u.admin ? 'admin.html' : 'Cmenu.html';
}
function logout(){
  localStorage.removeItem(LS_SESSION);
  location.href = 'menu principal.html';
}
/* ---------- NAVEGACIÓN DINÁMICA ---------- */
function toggleAuthSections(){
  const auth = !!currentUser();
  $$('.private').forEach(el => el.classList.toggle('hide', !auth));

  if(auth){
    $('#btnLogin')?.remove();
    const nav = $('#navBtns');
    const u = currentUser();
    
    // Mostrar nombre
    const n = document.getElementById('userName');
    if(n){ n.textContent = u.name; n.classList.remove('hide'); }

    if (nav) {
      const perfil = document.createElement('button');
      perfil.className = 'btn outline';
      perfil.textContent = u.admin ? 'Panel Admin' : 'Perfil';
      perfil.onclick = () => location.href = u.admin ? 'admin.html' : 'perfil.html';
      nav.prepend(perfil);

      const salir = document.createElement('button');
      salir.className = 'btn outline';
      salir.textContent = 'Salir';
      salir.onclick = logout;
      nav.prepend(salir);
    } else {
      console.warn('Elemento #navBtns no existe en esta página');
    }
    
  }
}
document.addEventListener('DOMContentLoaded',toggleAuthSections);
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navMenu');

  if (!btn) {
    console.warn('No se encontró #hamburgerBtn');
    return;
  }

  if (!menu) {
    console.warn('No se encontró #navMenu');
    return;
  }

  btn.addEventListener('click', () => {
    menu.classList.toggle('show');
  });
});

/* ---------- RESERVAS ---------- */
function reservar(data){
  const res = load(LS_RES);
  res.push({...data,id:Date.now()});
  save(LS_RES,res);
  descargaTXT(data);
  alert('¡Reserva guardada!');
}
function descargaTXT(obj){
  const blob=new Blob(
    [Object.entries(obj).map(([k,v])=>`${k}: ${v}`).join('\n')],
    {type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`reserva_${obj.id||Date.now()}.txt`;
  a.click();
}

/* ---------- MENÚ PÚBLICO ---------- */
function getMenu() {
  let menu = load(LS_MENU);

  // Si está vacío o no es un array válido, se reinicializa con los platos base
  if (!Array.isArray(menu) || menu.length === 0) {
    menu = [
      {
        id: 1001,
        cat: "Entradas",
        nombre: "Causa Limeña",
        precio: 18,
        img: "https://cdn0.recetasgratis.net/es/posts/8/6/2/causa_limena_31268_600_square.jpg",
        descripcion: "Deliciosa causa limeña con pollo y palta"
      },
      {
        id: 1002,
        cat: "Platos Principales",
        nombre: "Lomo Saltado",
        precio: 35,
        img: "https://i.ytimg.com/vi/r2oGrH__hT0/sddefault.jpg",
        descripcion: "Clásico plato peruano con carne salteada, papas fritas y arroz"
      },
      {
        id: 1003,
        cat: "Postres",
        nombre: "Mazamorra Morada",
        precio: 10,
        img: "https://cdn0.recetasgratis.net/es/posts/1/9/6/mazamorra_morada_facil_16691_600.jpg",
        descripcion: "Postre tradicional de maíz morado y frutas secas"
      },
      {
        id: 1004,
        cat: "Bebidas",
        nombre: "Chicha Morada",
        precio: 8,
        img: "https://perucomidas.com/wp-content/uploads/2024/04/chicha-morada-Peru-Comidas.png",
        descripcion: "Refrescante bebida natural de maíz morado"
      }
    ];
    save(LS_MENU, menu); // ¡muy importante!
  }

  return menu;
}
function getCategorias() {
  let cats = JSON.parse(localStorage.getItem(LS_CATEGORIAS) || 'null');
  if (!Array.isArray(cats)) {
    cats = ["Entradas", "Platos Principales", "Postres", "Bebidas"];
    localStorage.setItem(LS_CATEGORIAS, JSON.stringify(cats));
  }
  return cats;
}
function addCategoria() {
  const input = document.getElementById('newCatInput');
  const nueva = input.value.trim();
  if (!nueva) return;

  const cats = getCategorias();
  if (cats.includes(nueva)) {
    alert('Esa categoría ya existe.');
    return;
  }

  cats.push(nueva);
  localStorage.setItem(LS_CATEGORIAS, JSON.stringify(cats));
  renderCategorias(); // recarga select
  input.value = "";
}

// Renderiza las opciones en el select
function renderCategorias() {
  const select = document.querySelector('#formAdd select[name="cat"]');
  if (!select) return;

  const cats = getCategorias();
  select.innerHTML = cats.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}
function enableAddToCartButtons() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const menu = getMenu();
      const item = menu.find(x => x.id === id);
      if (!item) return;

      // Usamos carritoCepas en lugar de cepasPedido
      let carrito = JSON.parse(localStorage.getItem('carritoCepas') || '[]');
      
      // Evitar duplicados
      if (!carrito.some(p => p.id === item.id)) {
        carrito.push(item);
        localStorage.setItem('carritoCepas', JSON.stringify(carrito));
        alert(`${item.nombre} añadido al pedido.`);
      } else {
        alert(`${item.nombre} ya está en tu pedido.`);
      }

      updateCarritoCount();
    });
  });
}

function updateCarritoCount() {
  const carrito = JSON.parse(localStorage.getItem('carritoCepas') || '[]');
  const countEl = document.getElementById('carritoCount');
  if (countEl) {
    countEl.textContent = carrito.length;
  }
}
function renderMenu() {
  const menu = getMenu();
  const main = document.querySelector("main");
  if (!main) return;

  // Eliminar el contenedor anterior si existe
  const old = document.getElementById("menuDinamic");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "menuDinamic";

  // Agrupar por categoría
  const categorias = {};
  menu.forEach(item => {
    if (!categorias[item.cat]) categorias[item.cat] = [];
    categorias[item.cat].push(item);
  });

  // 🔽 Generar los botones de categorías en el nav lateral
  const navLateral = document.querySelector("#nave ul");
  if (navLateral) {
    navLateral.innerHTML = Object.keys(categorias).map(cat => {
      const id = cat.toLowerCase().replace(/\s/g, "-");
      return `<li><a href="#${id}">${cat}</a></li>`;
    }).join("");
  }

  // Generar las secciones por categoría
  Object.entries(categorias).forEach(([cat, items]) => {
    const section = document.createElement("section");
    const id = cat.toLowerCase().replace(/\s/g, "-");

    section.innerHTML = `
      <h2 id="${id}">${cat}</h2>
      <div class="grid-menu">
        ${items.map(i => `
         <div class="card">
          <img src="${i.img}" alt="${i.nombre}">
          <h3>${i.nombre}</h3>
          <p>${i.descripcion || ""}</p>
          <div class="price">S/ ${parseFloat(i.precio).toFixed(2)}</div>
          <button class="btn add-btn" data-id="${i.id}">Añadir</button>
        </div>
        `).join("")}
      </div>
    `;

    container.appendChild(section);
  });

  main.appendChild(container);
  enableAddToCartButtons();
  updateCarritoCount();
}

function upd(id,k,v){
  const m=getMenu(),i=m.findIndex(x=>x.id===id);
  if(i>-1){m[i][k]=k==='precio'?Number(v):v;save(LS_MENU,m);}
}
function delItem(id){save(LS_MENU,getMenu().filter(x=>x.id!==id));renderAdminMenu();}
function addItem(){
  const f = $('#formAdd');
  const nuevo = {
    id: Date.now(),
    cat: f.cat.value,
    nombre: f.nombre.value,
    precio: Number(f.precio.value),
    img: f.img.value || 'imagenes/placeholder.jpg',
    descripcion: f.descripcion?.value || ""
  };

  const m = getMenu();
  m.push(nuevo);
  save(LS_MENU, m);

  f.reset();
  renderAdminMenu();
}
function load_(clave) {
  return JSON.parse(localStorage.getItem(clave) || '[]');
}
function renderTablaReservas() {
  const tb = document.getElementById('tbodyRes');
  if (!tb) return;
  const reservas = load_('cepasReservas'); // LS_RES

  tb.innerHTML = reservas.map((r, i) => `
    <tr>
      <td>${r.nombre}</td>
      <td>${r.email}</td>
      <td>${r.fecha}</td>
      <td>${r.hora}</td>
      <td>${r.personas}</td>
      <td><button onclick="confirmarReserva(${i})"><i class="fas fa-check"></i></button></td>
    </tr>
  `).join('');
}

function cargarReservas() {
  renderTablaReservas();
}

function confirmarReserva(index) {
  const reservas = load('cepasReservas');
  reservas.splice(index, 1);
  localStorage.setItem('cepasReservas', JSON.stringify(reservas));
  cargarReservas();
}
function renderAdminMenu() {
  const tb = $('#tbodyMenu');
  if (!tb) return;

  const menu = getMenu();
  tb.innerHTML = menu.map(item => `
    <tr>
      <td><img src="${item.img}" alt="${item.nombre}" width="50"></td>
      <td><input onchange="upd(${item.id},'nombre',this.value)" value="${item.nombre}"></td>
      <td><input type="number" onchange="upd(${item.id},'precio',this.value)" value="${item.precio}"></td>
      <td><input onchange="upd(${item.id},'cat',this.value)" value="${item.cat}"></td>
      <td><textarea onchange="upd(${item.id},'descripcion',this.value)" rows="2">${item.descripcion || ""}</textarea></td>
      <td><button onclick="delItem(${item.id})">❌</button></td>
    </tr>
  `).join('');
}

function cargarPedidos() {
  const tbody = document.getElementById('tbodyPedidos');
  const pedidos = JSON.parse(localStorage.getItem('pedidosCepas') || '[]');
  if (!tbody) return;

  tbody.innerHTML = pedidos.map((p, i) => `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.telefono}</td>
      <td>${p.direccion}</td>
      <td>${p.metodoPago}</td>
      <td>${p.fecha}</td>
      <td>
        <ul>${p.platos.map(pl => `<li>${pl.nombre} - S/ ${parseFloat(pl.precio).toFixed(2)}</li>`).join('')}</ul>
      </td>
      <td><button onclick="confirmarPedido(${i})"><i class="fas fa-check"></i></button></td>
    </tr>
  `).join('');
}

function confirmarPedido(index) {
  const pedidos = JSON.parse(localStorage.getItem('pedidosCepas') || '[]');
  pedidos.splice(index, 1);
  localStorage.setItem('pedidosCepas', JSON.stringify(pedidos));
  cargarPedidos();
}
let chartInstance;
function graficarPedidosPorCategoria() {
  const pedidos = JSON.parse(localStorage.getItem('pedidosCepas') || '[]');
  if (!pedidos.length) return;

  const menu = getMenu();
  const categorias = {};

  pedidos.forEach(pedido => {
    pedido.platos.forEach(plato => {
      let cat = plato.cat;
      if (!cat) {
        const encontrado = menu.find(x => x.nombre === plato.nombre);
        cat = encontrado?.cat || "Desconocida";
      }
      categorias[cat] = (categorias[cat] || 0) + 1;
    });
  });

  const labels = Object.keys(categorias);
  const datos = Object.values(categorias);

  if (!labels.length) return;

  document.getElementById('graficoPedidosSection').style.display = 'block';
  const ctx = document.getElementById('graficoPedidos').getContext('2d');

  // Destruir gráfico previo si existe
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Pedidos por Categoría',
        data: datos,
        backgroundColor: ['#ff7043', '#42a5f5', '#66bb6a', '#ab47bc', '#ffa726'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}


function adminInit() {
  cargarPedidos();
  cargarReservas();
  renderAdminMenu();
  graficarPedidosPorCategoria(); 
  renderCategorias();
}
/* ---------- EXPORTAR ---------- */
Object.assign(window, {
  login, signUp, reservar, renderMenu, adminInit, addItem
});


/* ==== King Brasa: Carrito y Pedidos (cliente y admin por localStorage) ==== */
const KB_CART_KEY = 'kingbrasa_cart';
const KB_ORDERS_KEY = 'kingbrasa_orders';

function getCart(){
  try{ return JSON.parse(localStorage.getItem(KB_CART_KEY)) || []; }catch(e){return [];}
}
function saveCart(cart){ localStorage.setItem(KB_CART_KEY, JSON.stringify(cart)); }
function getOrders(){ try{ return JSON.parse(localStorage.getItem(KB_ORDERS_KEY))||[] }catch(e){return []} }
function saveOrders(ord){ localStorage.setItem(KB_ORDERS_KEY, JSON.stringify(ord)); }

// Utility to render cart on Cmenu.html
function renderCartOnPage(){
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  if(!cartItemsEl) return;
  const cart = getCart();
  if(cart.length===0){
    cartItemsEl.innerHTML = '<p>Tu carrito está vacío. Ve a la carta y añade productos.</p>';
    cartTotalEl.textContent = '';
    return;
  }
  let html = '<ul class="cart-list">';
  let total = 0;
  cart.forEach((it,idx)=>{
    html += `<li>${it.name} x ${it.qty} — S/ ${(it.price*it.qty).toFixed(2)} <button data-idx="${idx}" class="remove-from-cart">Quitar</button></li>`;
    total += it.price*it.qty;
  });
  html += '</ul>';
  cartItemsEl.innerHTML = html;
  cartTotalEl.innerHTML = `<strong>Total: S/ ${total.toFixed(2)}</strong>`;
  // attach remove handlers
  document.querySelectorAll('.remove-from-cart').forEach(btn=>{
    btn.onclick = (e)=>{
      const i = Number(e.target.dataset.idx);
      const cart = getCart();
      cart.splice(i,1);
      saveCart(cart);
      renderCartOnPage();
    }
  });
}

// On page load render cart and bind form
document.addEventListener('DOMContentLoaded', ()=>{
  renderCartOnPage();
  const form = document.getElementById('order-form');
  if(form){
    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const nombre = document.getElementById('cliente-nombre').value.trim();
      const direccion = document.getElementById('cliente-direccion').value.trim();
      const telefono = document.getElementById('cliente-telefono').value.trim();
      const pago = document.querySelector('input[name="pago"]:checked').value;
      const cart = getCart();
      if(cart.length===0){ alert('El carrito está vacío'); return; }
      const total = cart.reduce((s,i)=>s + i.price*i.qty, 0);
      const order = {
        id: 'KB-'+Date.now(),
        nombre, direccion, telefono, pago, items: cart, total, status: 'Pendiente', created: new Date().toISOString()
      };
      // save to orders
      const orders = getOrders();
      orders.push(order);
      saveOrders(orders);
      // clear cart
      saveCart([]);
      renderCartOnPage();
      // show confirmation
      const msg = document.getElementById('order-message');
      if(msg) msg.innerHTML = `<p>✅ Pedido confirmado con éxito. Gracias por tu compra, King Brasa te lo llevará pronto.</p><p>ID del pedido: <strong>${order.id}</strong></p>`;
    });
  }

  // If admin page, render orders table
  const ordersTable = document.getElementById('orders-table');
  if(ordersTable){
    const orders = getOrders();
    if(orders.length===0){
      ordersTable.innerHTML = '<tr><td colspan="6">No hay pedidos aún.</td></tr>';
    } else {
      ordersTable.innerHTML = orders.map(o=>`
        <tr data-id="${o.id}">
          <td>${o.id}</td>
          <td>${o.nombre}</td>
          <td>${o.direccion}</td>
          <td>S/ ${o.total.toFixed(2)}</td>
          <td class="order-status">${o.status}</td>
          <td><button class="confirm-send" data-id="${o.id}">Confirmar envío</button></td>
        </tr>
      `).join('');
      // attach handlers
      document.querySelectorAll('.confirm-send').forEach(btn=>{
        btn.onclick = (e)=>{
          const id = e.target.dataset.id;
          const orders = getOrders();
          const idx = orders.findIndex(x=>x.id===id);
          if(idx>-1){
            orders[idx].status = 'Confirmado';
            saveOrders(orders);
            // update row
            const tr = document.querySelector(`tr[data-id="${id}"]`);
            if(tr) tr.querySelector('.order-status').textContent = 'Confirmado';
            alert('Estado actualizado a Confirmado');
          }
        }
      });
    }
  }
});

/* Helper: function to add product to cart (used from Cmenu) */
function kb_addToCart(product){
  const cart = getCart();
  const idx = cart.findIndex(i=>i.name===product.name);
  if(idx>-1){
    cart[idx].qty += product.qty;
  } else {
    cart.push(product);
  }
  saveCart(cart);
  // notify briefly
  alert('Producto agregado al carrito ✅');
}
