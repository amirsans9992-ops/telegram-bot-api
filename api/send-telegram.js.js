export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен' });
  }

  const { name, phone, message } = req.body;

  // Проверка данных
  if (!name || !phone) {
    return res.status(400).json({ error: 'Имя и телефон обязательны' });
  }

  // Получаем данные из переменных окружения
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Отсутствуют переменные окружения');
    return res.status(500).json({ error: 'Ошибка настройки сервера' });
  }

  // Форматируем время
  const currentTime = new Date().toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Сообщение для Telegram
  const telegramMessage = `📩 *НОВАЯ ЗАЯВКА С САЙТА*
  
👤 *Имя:* ${name}
📞 *Телефон:* ${phone}
💬 *Сообщение:* ${message || 'Не указано'}

⏰ *Время:* ${currentTime}`;

  try {
    // Отправляем в Telegram
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', data);
      throw new Error(data.description || 'Ошибка отправки в Telegram');
    }

    return res.status(200).json({
      success: true,
      message: 'Заявка отправлена!'
    });

  } catch (error) {
    console.error('Ошибка:', error);
    return res.status(500).json({
      error: 'Ошибка отправки. Пожалуйста, позвоните нам.'
    });
  }
}