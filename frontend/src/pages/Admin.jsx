import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Admin() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState('');
  // НОВЫЕ КОРОБКИ ДЛЯ ТЕКСТА
  const [description, setDescription] = useState('');
  const [characteristics, setCharacteristics] = useState('');

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log('Ошибка загрузки:', error);
    }
  }

  function startEditing(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setImage(product.image);
    setStock(product.stock);
    setDescription(product.description || ''); // Подтягиваем описание
    setCharacteristics(product.characteristics || ''); // Подтягиваем хар-ки
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEditing() {
    setEditingId(null);
    setName(''); setPrice(''); setImage(''); setStock('');
    setDescription(''); setCharacteristics('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const productData = {
      name, price, image, stock: Number(stock),
      description, characteristics // Отправляем новые данные
    };

    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        setEditingId(null);
      } else {
        await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      }

      setName(''); setPrice(''); setImage(''); setStock('');
      setDescription(''); setCharacteristics('');
      getProducts();
    } catch (error) {
      alert('Ошибка при сохранении!');
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Вы точно хотите удалить этот товар?')) return;
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      getProducts();
    } catch (error) {
      alert('Ошибка при удалении!');
    }
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>Секретная Админка</h1>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>🏠 На витрину</Link>
      </div>

      <form className="glass-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px', margin: '20px auto' }}>
        <h3 style={{ margin: 0, color: 'white' }}>{editingId ? "Редактировать товар" : "Добавить новый"}</h3>

        <input type="text" placeholder="Название товара" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }} />
        <input type="text" placeholder="Цена (например: 1 500 ₽)" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }} />
        <input type="text" placeholder="Ссылка на картинку (URL)" value={image} onChange={e => setImage(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }} />
        <input type="number" placeholder="Количество на складе (шт)" value={stock} onChange={e => setStock(e.target.value)} required min="0" style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' }} />

        {/* НОВЫЕ ПОЛЯ ДЛЯ ВВОДА */}
        <textarea placeholder="О рекламном описании товара..." value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none', resize: 'vertical' }} />
        <textarea placeholder="Характеристики (Цвет: черный&#10;Размер: 42&#10;Материал: кожа)" value={characteristics} onChange={e => setCharacteristics(e.target.value)} rows="4" style={{ padding: '12px', borderRadius: '10px', border: 'none', outline: 'none', resize: 'vertical' }} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="glass-btn" style={{ flex: 1, background: editingId ? 'rgba(100, 255, 100, 0.4)' : 'rgba(255, 255, 255, 0.5)' }}>
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
            <button type="button" className="glass-btn" onClick={cancelEditing} style={{ flex: 1, background: 'rgba(255, 100, 100, 0.4)' }}>Отмена</button>
          )}
        </div>
      </form>

      <h3 style={{ color: 'white', textAlign: 'center', marginTop: '40px' }}>Управление товарами</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px', margin: '0 auto' }}>
        {products.map(product => (
          <div key={product.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ textAlign: 'left' }}>
                <b style={{ color: 'white' }}>{product.name}</b>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>{product.price} | Остаток: {product.stock} шт.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="glass-btn" onClick={() => startEditing(product)} style={{ background: 'rgba(100, 150, 255, 0.6)', padding: '8px 12px' }}>✏️</button>
              <button className="glass-btn" onClick={() => deleteProduct(product.id)} style={{ background: 'rgba(255, 70, 70, 0.6)', padding: '8px 12px' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}