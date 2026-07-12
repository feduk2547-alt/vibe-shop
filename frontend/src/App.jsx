import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Orders from './pages/Orders'; // Наша новая страница заказов
import './index.css';
import Reviews from './pages/Reviews';

// Универсальная страница-заглушка
function PlaceholderPage({ title }) {
  return (
    <div className="app-container">
      <div className="glass-card" style={{ maxWidth: '600px', margin: '100px auto', padding: '50px' }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '20px' }}>{title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '40px' }}>
          Эта страница сейчас находится в активной разработке. Совсем скоро здесь появится крутой функционал! 🚀
        </p>
        <Link to="/" className="glass-btn" style={{ textDecoration: 'none', color: 'white' }}>
          Вернуться в магазин
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Вот эта строчка потерялась: */}
        <Route path="/" element={<Shop />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />

        {/* Оставшиеся заглушки */}
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/privacy" element={<PlaceholderPage title="📄 Политика конфиденциальности" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;