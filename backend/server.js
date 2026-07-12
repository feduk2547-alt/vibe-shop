import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Включаем чтение настроек из файла .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Разрешаем сайту присылать запросы и понимать формат JSON
app.use(cors());
app.use(express.json());

// Подключаем Supabase к серверу
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 1. Создаем маршрут (End-point), который будет отдавать товары сайту
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    res.json(data); // Отправляем товары обратно сайту
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 2. Создаем маршрут для ДОБАВЛЕНИЯ нового товара
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body; // Получаем данные от формы с сайта
    // Просим Supabase вставить эти данные в таблицу products
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (error) throw error;
    res.json(data); // Отвечаем сайту, что всё прошло успешно
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 3. Создаем маршрут для УДАЛЕНИЯ товара
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params; // Берем ID товара из ссылки

    // Просим Supabase удалить строку, где колонка 'id' совпадает с нашим ID
    const { data, error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Товар успешно удален!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 4. Создаем маршрут для ОФОРМЛЕНИЯ ЗАКАЗА
app.post('/api/orders', async (req, res) => {
  try {
    // ДОБАВИЛИ userId в список получаемых данных
    const { firstName, lastName, region, address, cart, totalPrice, userId } = req.body;

    const { error: orderError } = await supabase.from('orders').insert([{
      user_id: userId, // ДОБАВИЛИ сохранение ID пользователя
      first_name: firstName,
      last_name: lastName,
      region: region,
      address: address,
      total_price: totalPrice,
      items: cart
    }]);

    if (orderError) throw orderError;

    for (const item of cart) {
      const newStock = item.stock - item.quantity;
      await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
    }

    res.json({ message: 'Заказ успешно оформлен!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 6. Получение заказов конкретного пользователя
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Ищем в таблице orders все записи, где user_id совпадает с запрошенным
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Сортируем: сначала новые

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 5. Создаем маршрут для РЕДАКТИРОВАНИЯ товара
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params; // Узнаем ID товара из ссылки
    const updatedProduct = req.body; // Получаем новые данные из формы

    // Просим Supabase обновить строчку с этим ID
    const { data, error } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// === АВТОРИЗАЦИЯ ===

// Регистрация нового пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Просим Supabase создать аккаунт
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Вход существующего пользователя
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Просим Supabase проверить логин и пароль
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// === ОТЗЫВЫ ===

// 7. Получить все отзывы
app.get('/api/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false }); // Сначала новые

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Добавить новый отзыв
app.post('/api/reviews', async (req, res) => {
  try {
    const { userId, userEmail, rating, comment } = req.body;

    const { error } = await supabase.from('reviews').insert([{
      user_id: userId,
      user_email: userEmail,
      rating: rating,
      comment: comment
    }]);

    if (error) throw error;
    res.json({ message: 'Отзыв успешно добавлен!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});