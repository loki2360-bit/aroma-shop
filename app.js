// === База признаков перекупа ===
const BASIC_TRIGGERS = [
  'гарантия', 'оригинал', 'самовывоз', 'только сегодня', 
  'не упусти', 'в наличии', 'звони скорее', 'новый'
];

const PRO_TRIGGERS = [
  ...BASIC_TRIGGERS,
  'без торга', 'рассмотрю предложение', 'актуально', 'покупал для друга',
  'не моё', 'работает исправно', 'чистый корпус', 'полный комплект',
  'чек есть', 'магазинная упаковка', 'не пыльный', 'как новый'
];

// === Проверка Pro-статуса ===
function isPro() {
  return localStorage.getItem('avitoScout_pro') === 'unlocked';
}

// === Активация Pro ===
function activatePro() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) return alert('Введите код активации');
  
  // Простая проверка: должен начинаться с SCOUT-2026-
  if (code.startsWith('SCOUT-2026-') && code.length >= 15) {
    localStorage.setItem('avitoScout_pro', 'unlocked');
    localStorage.setItem('avitoScout_code', code);
    alert('✅ Pro-режим активирован!');
    location.reload();
  } else {
    alert('❌ Неверный код. Проверьте написание.');
  }
}

// === Анализ текста ===
function analyzeAd() {
  const text = document.getElementById('adText').value.toLowerCase().trim();
  if (!text) return alert('Введите текст объявления');

  const triggers = isPro() ? PRO_TRIGGERS : BASIC_TRIGGERS;
  let matches = 0;
  const found = [];

  for (const trigger of triggers) {
    if (text.includes(trigger)) {
      matches++;
      found.push(trigger);
    }
  }

  let risk = '🟢 Вероятно частник';
  if (matches >= 3) risk = '🟡 Возможно перекуп';
  if (matches >= 5) risk = '🔴 Высокий риск: перекуп';

  let resultHtml = `
    <h3>Результат анализа:</h3>
    <p><strong>${risk}</strong></p>
    <p>Найдено совпадений: ${matches} из ${triggers.length}</p>
  `;

  if (found.length > 0) {
    resultHtml += `<p><small>Подозрительные фразы: ${found.join(', ')}</small></p>`;
  }

  // Pro-функции
  if (isPro()) {
    resultHtml += `<p>✨ Pro-режим: расширенный анализ включён</p>`;
  } else {
    resultHtml += `<p><em>💡 Хотите глубже? Активируйте Pro-режим.</em></p>`;
  }

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = resultHtml;
  resultDiv.classList.add('show');
}

// === При загрузке скрыть поле, если уже Pro ===
document.addEventListener('DOMContentLoaded', () => {
  if (isPro()) {
    document.querySelector('.pro-activate').style.display = 'none';
    document.querySelector('.pro-link').style.display = 'none';
  }
});
