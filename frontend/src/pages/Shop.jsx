import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log('Упс, ошибка:', error);
    }
  }

  function increaseQuantity(product) {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct && existingProduct.quantity >= product.stock) return prevCart;
      if (existingProduct) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }

  function decreaseQuantity(id) {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === id);
      if (existingProduct.quantity === 1) return prevCart.filter(item => item.id !== id);
      return prevCart.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
    });
  }

  function addToCart(product) {
    increaseQuantity(product);
    setIsCartOpen(true);
    setSelectedProduct(null);
  }

  function removeFromCart(id) {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  }

  const totalPrice = cart.reduce((sum, item) => {
    const priceNumber = parseInt(String(item.price).replace(/\D/g, '')) || 0;
    return sum + (priceNumber * item.quantity);
  }, 0);

  async function submitOrder(e) {
    e.preventDefault();

    // Достаем данные пользователя из памяти браузера
    const savedUser = JSON.parse(localStorage.getItem('vibe_user'));
    const userId = savedUser ? savedUser.id : null; // Если не вошел - будет null (гость)

    // Добавляем userId к данным заказа
    const orderData = { firstName, lastName, region, address, cart, totalPrice, userId };

    try {
      await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      alert(`Спасибо, ${firstName}! Ваш заказ успешно оформлен.`);
      setCart([]); setIsCheckout(false); setIsCartOpen(false);
      setFirstName(''); setLastName(''); setRegion(''); setAddress('');
      getProducts();
    } catch (error) {
      alert('Ошибка при оформлении заказа!');
    }
  }

  function renderActionButtons(product) {
    const cartItem = cart.find(item => item.id === product.id);
    const inCartQuantity = cartItem ? cartItem.quantity : 0;
    const isOutOfStock = product.stock === 0;
    const isMaxReached = inCartQuantity >= product.stock;

    return (
      <div className="card-actions">
        {inCartQuantity > 0 ? (
          <>
            <button className="btn-in-cart" onClick={(e) => { e.stopPropagation(); setIsCartOpen(true); setSelectedProduct(null); }}>
              <span>В корзине</span><span>Перейти</span>
            </button>
            <div className="qty-control" onClick={e => e.stopPropagation()}>
              <button className="qty-btn" onClick={() => decreaseQuantity(product.id)}>−</button>
              <span className="qty-value">{inCartQuantity}</span>
              <button className="qty-btn" onClick={() => increaseQuantity(product)} disabled={isMaxReached}>+</button>
            </div>
          </>
        ) : (
          <button className="btn-add" onClick={(e) => { e.stopPropagation(); addToCart(product); }} disabled={isOutOfStock}>
            {isOutOfStock ? "Нет в наличии" : "Добавить в корзину"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* ШАПКА */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="menu-btn" onClick={() => setIsMenuOpen(true)}>☰</button>
          <h1 style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.2)', margin: 0 }}>Мой Vibe Магазин</h1>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button className="glass-btn" onClick={() => setIsCartOpen(true)}>🛒 ({cart.length})</button>
          <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🔒 Админка</Link>
        </div>
      </div>

      {/* СЕТКА ТОВАРОВ */}
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="clickable-area" onClick={() => setSelectedProduct(product)}>
              <img src={product.image} alt={product.name} />
              <h2>{product.name}</h2>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>{product.price}</p>
              <p style={{ color: product.stock === 0 ? '#ff6b6b' : 'rgba(255,255,255,0.8)', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                Остаток: {product.stock} шт.
              </p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              {renderActionButtons(product)}
            </div>
          </div>
        ))}
      </div>

      {/* ВСПЛЫВАЮЩЕЕ ОКНО ДЕТАЛЕЙ ТОВАРА */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>✕</button>
            <div className="modal-content">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-image" />
              <div className="modal-info">
                <h1 style={{ margin: '0 0 15px 0' }}>{selectedProduct.name}</h1>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '2rem' }}>{selectedProduct.price}</h2>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '10px' }}>Описание</h3>
                <p style={{ lineHeight: '1.6', fontSize: '1.1rem', flex: 1, whiteSpace: 'pre-wrap' }}>
                  {selectedProduct.description}
                </p>
                <p style={{ color: selectedProduct.stock === 0 ? '#ff6b6b' : '#a8ffb8', fontWeight: 'bold', marginTop: '20px' }}>
                  На складе: {selectedProduct.stock} шт.
                </p>
                <div style={{ marginTop: '15px' }}>
                  {renderActionButtons(selectedProduct)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* БОКОВОЕ ВЫПАДАЮЩЕЕ МЕНЮ */}
      {isMenuOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div className="glass-sidebar" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 style={{ color: 'white', margin: 0 }}>Меню</h2>
              <button className="glass-btn" onClick={() => setIsMenuOpen(false)} style={{ padding: '5px 15px' }}>✕</button>
            </div>
            <Link to="/profile" className="sidebar-link">👤 Личный кабинет</Link>
            <Link to="/orders" className="sidebar-link">📦 Мои заказы</Link>
            <Link to="/reviews" className="sidebar-link">⭐ Отзывы</Link>
            <Link to="/privacy" className="sidebar-link">📄 Политика</Link>
          </div>
        </>
      )}

      {/* ПАНЕЛЬ КОРЗИНЫ */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => { setIsCartOpen(false); setIsCheckout(false); }}>
          <div className="glass-cart" onClick={e => e.stopPropagation()}>
            {!isCheckout ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: 'white', margin: 0 }}>🛒 Корзина</h2>
                  <button className="glass-btn" onClick={() => setIsCartOpen(false)} style={{ padding: '5px 15px' }}>✕</button>
                </div>
                {cart.length === 0 ? (
                  <p style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Тут пока пусто 😔</p>
                ) : (
                  <>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {cart.map(item => (
                        <div key={item.id} className="cart-item" style={{ alignItems: 'flex-start' }}>
                          <img src={item.image} alt={item.name} />
                          <div style={{ flex: 1, color: 'white' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>{item.price}</div>
                            <div className="cart-qty-controls">
                              <button className="cart-qty-btn" onClick={() => decreaseQuantity(item.id)}>−</button>
                              <span>{item.quantity} шт.</span>
                              <button className="cart-qty-btn" onClick={() => increaseQuantity(item)} disabled={item.quantity >= item.stock}>+</button>
                            </div>
                          </div>
                          <button className="glass-btn" onClick={() => removeFromCart(item.id)} style={{ padding: '5px 10px', background: 'rgba(255, 70, 70, 0.4)' }}>🗑</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.4)', paddingTop: '15px', marginTop: '15px' }}>
                      <h3 style={{ color: 'white', margin: '0 0 15px 0' }}>Итого: {totalPrice.toLocaleString('ru-RU')} ₽</h3>
                      <button className="glass-btn" onClick={() => setIsCheckout(true)} style={{ width: '100%', background: 'rgba(100, 255, 100, 0.4)', color: 'white', fontSize: '1.1rem' }}>
                        Оформить заказ
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: 'white', margin: 0 }}>📦 Доставка</h2>
                  <button className="glass-btn" onClick={() => setIsCheckout(false)} style={{ padding: '5px 15px' }}>Назад</button>
                </div>
                <form onSubmit={submitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                  <input type="text" placeholder="Имя" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }} />
                  <input type="text" placeholder="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }} />
                  <input type="text" placeholder="Регион (напр. Республика Башкортостан)" value={region} onChange={e => setRegion(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }} />
                  <textarea placeholder="Полный адрес доставки" value={address} onChange={e => setAddress(e.target.value)} required rows="3" style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none', resize: 'none' }} />
                  <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.4)', paddingTop: '15px' }}>
                    <h3 style={{ color: 'white', margin: '0 0 15px 0' }}>К оплате: {totalPrice.toLocaleString('ru-RU')} ₽</h3>
                    <button type="submit" className="glass-btn" style={{ width: '100%', background: 'rgba(100, 255, 100, 0.6)', color: 'white', fontSize: '1.1rem' }}>
                      Подтвердить заказ
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}