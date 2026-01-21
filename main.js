// === Конфигурация ===
const stations = [
  "Распил", "ЧПУ", "Покраска", "Фрезеровка",
  "Шпонировка", "Сборка", "Упаковка"
];

let currentStation = stations[0];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// === DOM элементы ===
const stationsList = document.getElementById('stations-list');
const ordersContainer = document.getElementById('orders-container');
const orderInput = document.getElementById('order-input');
const addOrderBtn = document.getElementById('add-order');
const searchInput = document.getElementById('search-input');

// === Сохранение в localStorage ===
function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

// === Подсчёт задач по участкам ===
function getStationCounts() {
  const counts = {};
  stations.forEach(s => counts[s] = 0);
  orders.forEach(order => {
    if (counts.hasOwnProperty(order.currentStation)) {
      counts[order.currentStation]++;
    }
  });
  return counts;
}

// === Рендер списка участков с счётчиками ===
function renderStations() {
  const counts = getStationCounts();
  stationsList.innerHTML = '';
  stations.forEach(station => {
    const li = document.createElement('li');
    li.textContent = `${station} (${counts[station]})`;
    li.classList.toggle('active', station === currentStation);
    li.addEventListener('click', () => {
      currentStation = station;
      renderStations();
      loadOrders();
    });
    stationsList.appendChild(li);
  });
}

// === Загрузка заказов для текущего участка ===
function loadOrders(searchTerm = null) {
  ordersContainer.innerHTML = '';

  let filtered = orders.filter(order => 
    searchTerm 
      ? order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      : order.currentStation === currentStation
  );

  if (filtered.length === 0) {
    ordersContainer.innerHTML = searchTerm 
      ? '<p>Не найдено</p>' 
      : '<p>Нет задач</p>';
    return;
  }

  // Сортировка: новые сверху
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  filtered.forEach((order, index) => {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    let buttons = '';
    if (!searchTerm) {
      if (order.status === 'Не начат') {
        buttons = `<button onclick="startOrder(${index})">В работу</button>`;
      } else if (order.status === 'В работе') {
        buttons = `<button onclick="completeOrder(${index})">Готов</button>`;
      } else if (order.status === 'Готов') {
        buttons = `<span>✅ Готов</span>`;
      }
    }

    card.innerHTML = `
      <div class="order-id">#${order.orderId}</div>
      <div class="status-buttons">${buttons}</div>
    `;
    ordersContainer.appendChild(card);
  });
}

// === Добавление заказа ===
addOrderBtn.addEventListener('click', () => {
  const orderId = orderInput.value.trim();
  if (!orderId) return alert('Введите номер заказа');

  if (orders.some(o => o.orderId === orderId)) {
    return alert('Заказ с таким номером уже существует');
  }

  orders.push({
    orderId,
    currentStation: stations[0],
    status: 'Не начат',
    createdAt: new Date().toISOString()
  });

  saveOrders();
  orderInput.value = '';
  renderStations(); // обновляем счётчики
  if (currentStation === stations[0]) loadOrders();
});

// === Поиск ===
searchInput.addEventListener('input', (e) => {
  const term = e.target.value.trim();
  loadOrders(term);
});

// === Управление статусами ===
window.startOrder = (index) => {
  orders[index].status = 'В работе';
  saveOrders();
  renderStations();
  loadOrders();
};

window.completeOrder = (index) => {
  const order = orders[index];
  const currentIndex = stations.indexOf(order.currentStation);
  
  if (currentIndex < stations.length - 1) {
    orders[index] = {
      ...order,
      currentStation: stations[currentIndex + 1],
      status: 'Не начат'
    };
  } else {
    orders[index].status = 'Готов';
  }

  saveOrders();
  renderStations();
  loadOrders();
};

// === Инициализация ===
renderStations();
loadOrders();