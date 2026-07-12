import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);

  // Коробки для нового отзыва
  const [rating, setRating] = useState(5); // По умолчанию 5 звезд
  const [comment, setComment] = useState('');

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const savedUser = localStorage.getItem('vibe_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Загружаем отзывы
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const response = await fetch('http://localhost:5000/api/reviews');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.log('Ошибка при загрузке отзывов:', error);
    }
  }

  async function submitReview(e) {
    e.preventDefault();

    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы оставить отзыв.');
      return;
    }

    const reviewData = {
      userId: user.id,
      userEmail: user.email, // Берем email прямо из профиля
      rating,
      comment
    };

    try {
      await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      setComment('');
      setRating(5);
      fetchReviews(); // Обновляем список отзывов, чтобы сразу увидеть свой
    } catch (error) {
      alert('Ошибка при отправке отзыва!');
    }
  }

  // Функция для отрисовки звездочек
  function renderStars(count) {
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>⭐ Отзывы покупателей</h1>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🏠 В магазин</Link>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* === БЛОК СПИСКА ОТЗЫВОВ === */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reviews.length === 0 ? (
            <p style={{ color: 'white', fontSize: '1.2rem', textAlign: 'center', marginTop: '20px' }}>
              Отзывов пока нет. Станьте первым! ✨
            </p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  {/* Красиво обрезаем email, чтобы показывать только имя пользователя (до @) */}
                  <b style={{ color: 'white' }}>{review.user_email.split('@')[0]}</b>
                  <span style={{ color: '#ffd700', fontSize: '1.2rem', letterSpacing: '2px' }}>
                    {renderStars(review.rating)}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  {review.comment}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  {new Date(review.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* === ФОРМА НАПИСАНИЯ ОТЗЫВА === */}
        <div className="glass-card" style={{ flex: '1 1 300px', padding: '30px', position: 'sticky', top: '20px' }}>
          <h2 style={{ color: 'white', marginTop: '0', marginBottom: '20px' }}>Поделитесь впечатлениями</h2>

          {user ? (
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ color: 'white' }}>Ваша оценка:</label>
                {/* Интерактивные звездочки для выбора */}
                <div style={{ display: 'flex', gap: '10px', fontSize: '2rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ color: star <= rating ? '#ffd700' : 'rgba(255,255,255,0.3)', transition: '0.2s' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Что вам понравилось? Как прошла доставка?"
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
                rows="5"
                style={{ padding: '15px', borderRadius: '12px', border: 'none', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />

              <button type="submit" className="glass-btn" style={{ background: 'rgba(100, 255, 100, 0.4)', marginTop: '10px' }}>
                Опубликовать отзыв
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ marginBottom: '20px' }}>Оставлять отзывы могут только авторизованные покупатели.</p>
              <Link to="/profile" className="glass-btn" style={{ textDecoration: 'none', color: 'white', display: 'inline-block' }}>
                Войти в аккаунт
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
