// === Хранилище данных ===
let stations = JSON.parse(localStorage.getItem('stations')) || [
  "Распил", "ЧПУ", "Покраска", "Фрезеровка",
  "Шпонировка", "Сборка", "Упаковка"
];

let orders = JSON.parse(localStorage.getItem('orders')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// Создаём первого пользователя по умолчанию (если нет)
if (users.length === 0) {
  users.push({
    username: 'оператор',
    password: '12345' // ← вы можете изменить
  });
  localStorage.setItem('users', JSON.stringify(users));
}

let currentUser = null;
let currentStation = stations[0];

// === Сохранение ===
function saveData() {
  localStorage.setItem('stations', JSON.stringify(stations));
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.setItem('users', JSON.stringify(users));
}

// === DOM ===
const loginScreen = document.getElementById('login-screen');
const app = document.getElementById('app');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const currentUserEl = document.getElementById('current-user');

// === Проверка автоматического входа ===
function checkAutoLogin() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    const found = users.find(u => u.username === user.username && u.password === user.password);
    if (found) {
      currentUser = found;
      showApp();
      return;
    }
  }
  loginScreen.style.display = 'flex';
}

// === Вход ===
loginBtn.addEventListener('click', () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    loginError.style.display = 'none';
    showApp();
  } else {
    loginError.textContent = 'Неверное имя или пароль';
    loginError.style.display = 'block';
  }
});

// === Выход ===
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  app.style.display = 'none';
  loginScreen.style.display = 'flex';
  loginUsername.value = '';
  loginPassword.value = '';
});

// === Показать основное приложение ===
function showApp() {
  loginScreen.style.display = 'none';
  app.style.display = 'block';
  currentUserEl.textContent = `Привет, ${currentUser.username}`;
  renderStations();
  loadOrders();
}

// === Рендер участков ===
function renderStations() {
  const counts = {};
  stations.forEach(s => counts[s] = 0);
  orders.forEach(o => {
    if (counts.hasOwnProperty(o.station)) counts[o.station]++;
  });

  const list = document.getElementById('stations-list');
  list.innerHTML = '';
  stations.forEach(station => {
    const li = document.createElement('li');
    li.textContent = `${station} (${counts[station]})`;
    li.classList.toggle('active', station === currentStation);
    li.addEventListener('click', () => {
      currentStation = station;
      renderStations();
      loadOrders();
    });
    list.appendChild(li);
  });
}

// === Загрузка заказов ===
function loadOrders(searchTerm = null) {
  const container = document.getElementById('orders-container');
  container.innerHTML = '';

  let filtered = orders.filter(order => {
    if (searchTerm) {
      return order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return order.station === currentStation;
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = searchTerm ? '<p>Не найдено</p>' : '<p>Нет задач</p>';
    return;
  }

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  filtered.forEach((order, index) => {
    const card = document.createElement('div');
    card.className = 'order-card';

    card.innerHTML = `
      <div class="order-id">#${order.orderId}</div>
      <div class="status-buttons">
        <button onclick="showMoveDialog(${index})">Переместить</button>
        <button onclick="closeOrder(${index})">Закрыть</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// === Добавление заказа ===
document.getElementById('add-order').addEventListener('click', () => {
  const orderId = document.getElementById('order-input').value.trim();
  if (!orderId) return alert('Введите номер заказа');
  if (orders.some(o => o.orderId === orderId)) return alert('Такой заказ уже есть');

  orders.push({
    orderId,
    station: stations[0],
    createdAt: new Date().toISOString()
  });

  saveData();
  document.getElementById('order-input').value = '';
  if (currentStation === stations[0]) loadOrders();
  renderStations();
});

// === Поиск ===
document.getElementById('search-input').addEventListener('input', (e) => {
  loadOrders(e.target.value.trim());
});

// === Переместить заказ ===
window.showMoveDialog = (index) => {
  const modal = document.createElement('div');
  modal.id = 'move-modal';
  modal.style = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); z-index: 2000;
    display: flex; justify-content: center; align-items: center;
  `;

  let options = stations.map(s => 
    `<option value="${s}" ${s === orders[index].station ? 'selected' : ''}>${s}</option>`
  ).join('');

  modal.innerHTML = `
    <div style="background: white; padding: 20px; color: black; max-width: 300px; width: 90%;">
      <h4>Переместить #${orders[index].orderId}</h4>
      <select id="move-select" style="width: 100%; margin: 10px 0;">${options}</select>
      <div>
        <button onclick="confirmMove(${index})" style="margin-right: 10px;">OK</button>
        <button onclick="closeMoveDialog()">Отмена</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.confirmMove = (index) => {
  const select = document.getElementById('move-select');
  orders[index].station = select.value;
  saveData();
  closeMoveDialog();
  renderStations();
  loadOrders();
};

window.closeMoveDialog = () => {
  const el = document.getElementById('move-modal');
  if (el) el.remove();
};

// === Закрыть заказ (удалить) ===
window.closeOrder = (index) => {
  if (confirm(`Закрыть заказ #${orders[index].orderId}?`)) {
    orders.splice(index, 1);
    saveData();
    renderStations();
    loadOrders();
  }
};

// === Запуск ===
checkAutoLogin();
