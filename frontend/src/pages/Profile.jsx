import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Profile() {
  // Коробки для переключения формы и хранения данных
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Коробка, которая хранит вошедшего пользователя
  const [user, setUser] = useState(null);

  // Когда страница загружается, проверяем, не входил ли пользователь ранее
  useEffect(() => {
    const savedUser = localStorage.getItem('vibe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    // Выбираем, куда стучаться на сервер: регистрация или вход
    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.error) {
        alert('Ошибка: ' + data.error);
        return;
      }

      // Если всё успешно, сохраняем пользователя в память браузера
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('vibe_user', JSON.stringify(userData));

      // Очищаем форму
      setEmail('');
      setPassword('');

    } catch (error) {
      alert('Ошибка при связи с сервером!');
    }
  }

  function logout() {
    setUser(null); // Стираем пользователя из памяти React
    localStorage.removeItem('vibe_user'); // Стираем из памяти браузера
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>Личный кабинет</h1>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🏠 В магазин</Link>
      </div>

      {user ? (
        // === ЕСЛИ ПОЛЬЗОВАТЕЛЬ ВОШЕЛ ===
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👋</div>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>С возвращением!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '30px' }}>
            Ваш email: <br/> <b>{user.email}</b>
          </p>
          <button className="glass-btn" onClick={logout} style={{ background: 'rgba(255, 70, 70, 0.4)', width: '100%' }}>
            Выйти из аккаунта
          </button>
        </div>
      ) : (
        // === ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ ВОШЕЛ (ФОРМА) ===
        <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto', padding: '30px' }}>
          <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
            {isLoginMode ? "Вход в аккаунт" : "Регистрация"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="email"
              placeholder="Ваш Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }}
            />
            <input
              type="password"
              placeholder="Пароль (минимум 6 символов)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength="6"
              style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }}
            />

            <button type="submit" className="glass-btn" style={{ background: 'rgba(100, 255, 100, 0.4)', marginTop: '10px' }}>
              {isLoginMode ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          {/* Переключатель Вход/Регистрация */}
          <div style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}>
            {isLoginMode ? "Ещё нет аккаунта? " : "Уже есть аккаунт? "}
            <span
              onClick={() => setIsLoginMode(!isLoginMode)}
              style={{ color: '#a8ffb8', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              {isLoginMode ? "Зарегистрируйтесь" : "Войдите"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}