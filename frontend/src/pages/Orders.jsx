import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, вошел ли пользователь
    const savedUser = localStorage.getItem('vibe_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchOrders(parsedUser.id); // Запускаем загрузку заказов
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchOrders(userId) {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/user/${userId}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log('Ошибка при загрузке заказов:', error);
    } finally {
      setLoading(false);
    }
  }

  // Если человек не вошел в аккаунт
  if (!loading && !user) {
    return (
      <div className="app-container">
        <div className="glass-card" style={{ maxWidth: '500px', margin: '100px auto', textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>Доступ закрыт 🔒</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: '30px' }}>
            Чтобы просматривать историю заказов, необходимо войти в личный кабинет.
          </p>
          <Link to="/profile" className="glass-btn" style={{ textDecoration: 'none', color: 'white' }}>Войти в аккаунт</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>📦 Мои заказы</h1>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🏠 В магазин</Link>
      </div>

      {loading ? (
        <p style={{ color: 'white', textAlign: 'center', fontSize: '1.2rem' }}>Загрузка заказов...</p>
      ) : orders.length === 0 ? (
        // Если заказов еще нет
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛍️</div>
          <h2 style={{ color: 'white' }}>Вы еще ничего не заказывали</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>Самое время это исправить!</p>
          <Link to="/" className="glass-btn" style={{ textDecoration: 'none', color: 'white' }}>За покупками</Link>
        </div>
      ) : (
        // Если заказы есть, выводим их списком
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '10px', marginBottom: '15px' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>Заказ № {order.id}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <div style={{ color: 'white', marginBottom: '15px', fontSize: '0.95rem' }}>
                <div><b>Получатель:</b> {order.first_name} {order.last_name}</div>
                <div><b>Адрес:</b> {order.region}, {order.address}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, color: 'white' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{item.price} x {item.quantity} шт.</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                Итого: {order.total_price.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}