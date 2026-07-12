const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Простой тест, чтобы проверить, работает ли сервер
app.get('/api/products', (req, res) => {
    res.json([{ id: 1, name: 'Тестовый товар', price: 100 }]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));