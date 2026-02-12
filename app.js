let itemCount = 2;
const MAX_FREE_ITEMS = 3;
const MAX_PRO_ITEMS = 5;

function isPro() {
  return localStorage.getItem('avitoCompare_pro') === 'unlocked';
}

function activatePro() {
  const code = prompt('Введите код активации Pro (например: COMPARE-2026-XXXX):');
  if (!code) return;
  if (code.startsWith('COMPARE-2026-') && code.length >= 15) {
    localStorage.setItem('avitoCompare_pro', 'unlocked');
    alert('✅ Pro-режим активирован!');
    location.reload();
  } else {
    alert('❌ Неверный код. Пример: COMPARE-2026-7B3F');
  }
}

function addItem() {
  const maxItems = isPro() ? MAX_PRO_ITEMS : MAX_FREE_ITEMS;
  if (itemCount >= maxItems) {
    if (isPro()) {
      alert(`Максимум ${maxItems} объявлений`);
    } else {
      alert(`Бесплатно — до ${MAX_FREE_ITEMS} объявлений.\nАктивируйте Pro для 5!`);
    }
    return;
  }
  const container = document.getElementById('items');
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = `<textarea placeholder="Вставьте текст объявления ${itemCount + 1}..."></textarea>`;
  container.appendChild(div);
  itemCount++;
}

// === Извлечение "умных" строк из текста ===
function extractFeatures(text) {
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // Удаляем общие фразы-заголовки
  const ignore = [
    'описание', 'характеристики', 'подробности', 'продаю', 'куплю', 'срочно', 
    'звоните', 'пишите', 'whatsapp', 'telegram', 'avito', '₽', 'руб'
  ];

  const features = [];
  for (const line of lines) {
    let clean = line.trim();
    if (clean.length < 5) continue;
    
    // Пропускаем строки с контактами и мусором
    if (ignore.some(word => clean.toLowerCase().includes(word))) continue;
    if (/\d{10,}/.test(clean)) continue; // телефон
    if (/@[a-z]/.test(clean)) continue;   // email

    // Если строка содержит цену — сохраняем отдельно
    if (/\d[\d\s]*\s*₽/.test(clean)) {
      const priceMatch = clean.match(/(\d[\d\s]*)\s*₽/);
      const price = priceMatch ? priceMatch[1].replace(/\s/g, '') + ' ₽' : clean;
      features.push({ key: 'Цена', value: price });
    } else {
      // Сохраняем как есть, но нормализуем
      let key = clean;
      // Убираем дублирующиеся слова в начале
      if (key.toLowerCase().startsWith('есть ')) key = key.substring(5);
      if (key.toLowerCase().startsWith('нет ')) key = key.substring(4);

      features.push({ key: key, value: '✅' });
    }
  }

  return features;
}

// === Основная функция сравнения ===
function compareItems() {
  const textareas = document.querySelectorAll('#items textarea');
  const allItems = [];
  const allKeys = new Set();

  // Извлекаем признаки из каждого объявления
  for (const ta of textareas) {
    if (ta.value.trim()) {
      const features = extractFeatures(ta.value);
      const itemMap = new Map();
      for (const f of features) {
        itemMap.set(f.key, f.value);
        allKeys.add(f.key);
      }
      allItems.push(itemMap);
    }
  }

  if (allItems.length < 2) {
    return alert('Введите хотя бы 2 объявления');
  }

  // Сортируем ключи: сначала "Цена", потом остальные
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    if (a === 'Цена') return -1;
    if (b === 'Цена') return 1;
    return a.localeCompare(b);
  });

  // Генерация таблицы
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Параметр</th>
          ${allItems.map((_, i) => `<th>Объявление ${i + 1}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  for (const key of sortedKeys) {
    tableHTML += `<tr><td><strong>${escapeHtml(key)}</strong></td>`;
    for (const item of allItems) {
      const value = item.get(key) || '—';
      tableHTML += `<td>${value}</td>`;
    }
    tableHTML += `</tr>`;
  }

  tableHTML += `</tbody></table>`;

  // Pro-функции
  if (isPro()) {
    tableHTML += `<p style="margin-top: 15px; color: #10b981;">✨ Pro: таблица построена по реальным данным из объявлений</p>`;
  } else {
    tableHTML += `
      <p style="margin-top: 15px; font-size: 0.9em; color: #d32f2f;">
        💎 <a href="#" onclick="activatePro(); return false;">Активируйте Pro</a> — сравнивайте до 5 объявлений!
      </p>
    `;
  }

  document.getElementById('result').innerHTML = tableHTML;
}

// Защита от XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  if (isPro()) {
    const btn = document.getElementById('proBtn');
    if (btn) btn.style.display = 'none';
  }
});
