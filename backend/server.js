require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Настройка CORS
app.use(cors());
app.use(express.json());

// Подключение к Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- РОУТЫ ---

// Получить все товары
app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Добавить товар
app.post('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').insert([req.body]);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- КОНЕЦ РОУТОВ ---

// Запуск сервера локально
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
}

// Экспорт для Vercel
module.exports = app;