let itemCount = 2;

function addItem() {
  if (itemCount >= 5) return alert('Максимум 5 объявлений');
  const container = document.getElementById('items');
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = `<textarea placeholder="Вставьте текст объявления ${itemCount + 1}..."></textarea>`;
  container.appendChild(div);
  itemCount++;
}

function extractData(text) {
  const lower = text.toLowerCase();
  
  // Цена
  const priceMatch = text.match(/(\d[\d\s]*)\s*₽/);
  const price = priceMatch ? priceMatch[1].replace(/\s/g, '') + ' ₽' : '—';

  // Ключевые признаки
  const hasWarranty = lower.includes('гарантия');
  const hasReceipt = lower.includes('чек') || lower.includes('кассов');
  const isNew = lower.includes('новы') || lower.includes('оригинал');
  const noScratches = lower.includes('царапин') || lower.includes('без дефект');

  return {
    price,
    warranty: hasWarranty,
    receipt: hasReceipt,
    condition: isNew ? 'Новое' : (noScratches ? 'Без царапин' : 'Б/у'),
    textPreview: text.substring(0, 60) + '...'
  };
}

function compareItems() {
  const textareas = document.querySelectorAll('#items textarea');
  const items = [];

  for (const ta of textareas) {
    if (ta.value.trim()) {
      items.push(extractData(ta.value));
    }
  }

  if (items.length < 2) {
    return alert('Введите хотя бы 2 объявления');
  }

  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Параметр</th>
          ${items.map((_, i) => `<th>Объявление ${i + 1}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr><td>Цена</td>${items.map(i => `<td>${i.price}</td>`).join('')}</tr>
        <tr><td>Гарантия</td>${items.map(i => `<td class="${i.warranty ? 'check' : 'cross'}"></td>`).join('')}</tr>
        <tr><td>Чек</td>${items.map(i => `<td class="${i.receipt ? 'check' : 'cross'}"></td>`).join('')}</tr>
        <tr><td>Состояние</td>${items.map(i => `<td>${i.condition}</td>`).join('')}</tr>
      </tbody>
    </table>
  `;

  document.getElementById('result').innerHTML = tableHTML;
}
