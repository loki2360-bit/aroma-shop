<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Тест входа</title>
</head>
<body>
  <div id="login" style="display:none;">
    <input id="user" placeholder="Имя"><br>
    <input id="pass" type="password" placeholder="Пароль"><br>
    <button onclick="login()">Войти</button>
    <p id="err" style="color:red;"></p>
  </div>
  <div id="app" style="display:none;">
    <h1>Привет, <span id="name"></span>!</h1>
    <button onclick="logout()">Выйти</button>
  </div>

  <script>
    const users = [{ username: 'test', password: '123' }];
    let currentUser = null;

    function saveUser(u) {
      localStorage.setItem('currentUser', JSON.stringify(u));
    }

    function loadUser() {
      try {
        const s = localStorage.getItem('currentUser');
        if (!s) return false;
        const u = JSON.parse(s);
        const found = users.find(x => x.username === u.username && x.password === u.password);
        if (found) {
          currentUser = found;
          document.getElementById('name').textContent = found.username;
          document.getElementById('login').style.display = 'none';
          document.getElementById('app').style.display = 'block';
          return true;
        }
      } catch (e) {}
      return false;
    }

    function login() {
      const u = document.getElementById('user').value;
      const p = document.getElementById('pass').value;
      const user = users.find(x => x.username === u && x.password === p);
      if (user) {
        currentUser = user;
        saveUser(user);
        document.getElementById('err').textContent = '';
        loadUser();
      } else {
        document.getElementById('err').textContent = 'Ошибка';
      }
    }

    function logout() {
      currentUser = null;
      localStorage.removeItem('currentUser');
      document.getElementById('app').style.display = 'none';
      document.getElementById('login').style.display = 'block';
    }

    if (!loadUser()) {
      document.getElementById('login').style.display = 'block';
    }
  </script>
</body>
</html>
