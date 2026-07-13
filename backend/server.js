require('dotenv').config(); // Нужно для локальной работы
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Тот самый CORS, который работает
app.use(cors());
app.use(express.json());

// Подключаем базу данных Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ВАШИ ПУТИ ДЛЯ ДАННЫХ (РОУТЫ) ---

// Получить все товары
app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        res.json(data); // Отдаем реальные товары из базы
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Добавить товар (для Админки)
app.post('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').insert([req.body]);
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// (Если у вас были пути для отзывов или заказов — добавьте их сюда по такому же принципу)

// --- КОНЕЦ РОУТОВ ---

// Специальный запуск: для Vercel и для вашего компьютера
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
}

module.exports = app;