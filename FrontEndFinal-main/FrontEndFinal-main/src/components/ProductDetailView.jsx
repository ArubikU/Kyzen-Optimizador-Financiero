import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const viewStyles = {
  container: { display: 'flex', gap: '40px', padding: '32px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '32px', },
  imageWrapper: { width: '40%', flexShrink: 0, },
  image: { width: '100%', height: 'auto', borderRadius: '6px', border: '1px solid #e5e7eb', objectFit: 'contain', },
  infoWrapper: { flex: 1, },
  title: { fontSize: '28px', fontWeight: '700', margin: '0 0 16px 0', },
  description: { fontSize: '16px', lineHeight: '1.6', color: '#4b5563', marginBottom: '24px', },
  price: { fontSize: '32px', fontWeight: 'bold', color: '#2e9b1f', marginBottom: '24px', },
  addButton: { backgroundColor: '#2e9b1f', color: 'white', border: 'none', borderRadius: '6px', padding: '14px 24px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', },
  breadcrumb: { marginBottom: '16px', color: '#6b7280', }
};

export default function ProductDetailView({ product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // PROTECCIÓN: Extraemos el nombre de la categoría de forma segura
  // Si viene como objeto (SQL) o string (Legacy)
  const categoryName = product.category?.name || product.category || 'General';

  const handleAddToCart = () => {
    if (isAdded) return;
    
    const productToAdd = {
        // Aseguramos que usamos el ID numérico si existe, o el _id mapeado
        id: product.id || product._id, 
        productId: product.id || product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: 1
    };

    addToCart(productToAdd);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const dynamicButtonStyles = {
    ...viewStyles.addButton,
    backgroundColor: isAdded ? '#6c757d' : '#2e9b1f',
    cursor: isAdded ? 'not-allowed' : 'pointer'
  };

  return (
    <div>
      <div style={viewStyles.breadcrumb}>
        {/* CORRECCIÓN AQUÍ: Usamos la variable segura categoryName */}
        {`Categorías > ${categoryName}`}
      </div>
      <div style={viewStyles.container}>
        <div style={viewStyles.imageWrapper}>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={viewStyles.image} 
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x400?text=Sin+Imagen" }}
          />
        </div>
        <div style={viewStyles.infoWrapper}>
          <h1 style={viewStyles.title}>{product.name}</h1>
          <p style={viewStyles.description}>
            {product.description || "Sin descripción disponible para este producto."}
          </p>
          <div style={viewStyles.price}>S/ {product.price?.toFixed(2)}</div>
          <button 
            onClick={handleAddToCart} 
            style={dynamicButtonStyles}
            disabled={isAdded}
          >
            {isAdded ? '¡Producto agregado! ' : (
              <> <ShoppingCart size={20} /> AGREGAR </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}