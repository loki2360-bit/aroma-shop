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
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // 1. Цена
  const priceMatch = text.match(/(\d[\d\s]*)\s*₽/);
  const price = priceMatch ? priceMatch[1].replace(/\s/g, '') + ' ₽' : '—';

  // 2. Гарантия
  const warranty = /гарантия|гарантий/i.test(lower);

  // 3. Чек / документы
  const receipt = /чек|документ|касс|коробк/i.test(lower);

  // 4. Состояние
  let condition = '—';
  if (/новы|оригинал|новый/i.test(lower)) condition = 'Новое';
  else if (/как нов|идеал/i.test(lower)) condition = 'Как новое';
  else if (/б\/у|бу|подерж/i.test(lower)) condition = 'Б/у';

  // 5. Дефекты
  const defects = /царапин|трещин|бит|слом|не раб|брак|проблем/i.test(lower);

  // 6. Комплектация
  let kit = '—';
  if (/коробк|зарядк|провод|инструкц|наушник|чехол/i.test(lower)) {
    kit = 'Есть';
  }

  // 7. Причина продажи
  let reason = '—';
  if (/не нужн|передумал|дар|подарок|ребёнок|развод/i.test(lower)) reason = 'Личная';
  else if (/срочно|деньги|срочн/i.test(lower)) reason = 'Срочно';

  // 8. Торг
  const bargain = /торг|договор|уступ|скидк/i.test(lower);

  // 9. Передача
  let delivery = '—';
  if (/самовывоз|самов/i.test(lower)) delivery = 'Самовывоз';
  else if (/доставк|привезу|курьер/i.test(lower)) delivery = 'Доставка';

  // 10. Город/район
  let location = '—';
  const cityMatch = text.match(/(Москва|СПб|Новосибирск|Екатеринбург|Казань|Нижний Новгород|Челябинск|Самара|Омск|Ростов|Уфа|Красноярск|Воронеж|Пермь|Волгоград)/i);
  if (cityMatch) location = cityMatch[1];
  else if (/район|мкр|ул\.|улица/i.test(lower)) location = 'Указан район';

  // 11. Дата
  let date = '—';
  if (/сегодня/i.test(lower)) date = 'Сегодня';
  else if (/вчера/i.test(lower)) date = 'Вчера';
  else if (/\d{1,2}\s+(январ|феврал|март|апрел|ма|июн|июл|август|сентябр|октябр|ноябр|декабр)/i.test(text)) {
    date = 'Указана дата';
  }

  // 12. Контакт
  const contact = /показать телефон|телефон/i.test(lower) ? 'Скрыт' : 'Возможно открыт';

  // Краткое описание
  const preview = lines.find(line => line.length > 20 && !line.includes('₽')) || lines[0] || '—';
  const shortPreview = preview.length > 60 ? preview.substring(0, 60) + '...' : preview;

  return {
    price,
    warranty,
    receipt,
    condition,
    defects,
    kit,
    reason,
    bargain,
    delivery,
    location,
    date,
    contact,
    preview: shortPreview
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

  // Формируем строки таблицы
  const rows = [
    { label: 'Цена', key: 'price', type: 'text' },
    { label: 'Гарантия', key: 'warranty', type: 'bool' },
    { label: 'Чек / документы', key: 'receipt', type: 'bool' },
    { label: 'Состояние', key: 'condition', type: 'text' },
    { label: 'Дефекты', key: 'defects', type: 'bool' },
    { label: 'Комплектация', key: 'kit', type: 'text' },
    { label: 'Причина продажи', key: 'reason', type: 'text' },
    { label: 'Торг возможен', key: 'bargain', type: 'bool' },
    { label: 'Передача', key: 'delivery', type: 'text' },
    { label: 'Город / район', key: 'location', type: 'text' },
    { label: 'Дата публикации', key: 'date', type: 'text' },
    { label: 'Контакт', key: 'contact', type: 'text' }
  ];

  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Параметр</th>
          ${items.map((_, i) => `<th>Объявление ${i + 1}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  for (const row of rows) {
    tableHTML += `<tr><td><strong>${row.label}</strong></td>`;
    for (const item of items) {
      let cell = '—';
      if (row.type === 'bool') {
        cell = item[row.key] ? '✅' : '❌';
      } else {
        cell = item[row.key] || '—';
      }
      tableHTML += `<td>${cell}</td>`;
    }
    tableHTML += `</tr>`;
  }

  tableHTML += `
      </tbody>
    </table>
    <p style="margin-top: 15px; font-size: 0.9em; color: #64748b;">
      💡 Совет: копируйте весь текст объявления (Ctrl+A → Ctrl+C) для лучшего анализа.
    </p>
  `;

  document.getElementById('result').innerHTML = tableHTML;
}
