import sequelize from './src/Config/database.js';
import Category from './src/Models/Categories.js';

const seedDatabase = async () => {
  try {
    // Sincroniza y limpia estructuras viejas de forma segura
    await sequelize.sync({ force: true });
    console.log('🔄 Tablas de Kyzen limpiadas y recreadas en pgAdmin.');

    // Inyectamos únicamente las categorías de flujo fintech oficiales de Kyzen
    const coreCategories = [
      { name: 'Comida', type: 'gasto', icon: '🍔', color: '#6366f1' },
      { name: 'Viaje', type: 'gasto', icon: '✈️', color: '#818cf8' },
      { name: 'Transporte', type: 'gasto', icon: '🚌', color: '#93c5fd' },
      { name: 'Estudios', type: 'gasto', icon: '🎓', color: '#22d3ee' },
      { name: 'Servicios', type: 'gasto', icon: '💡', color: '#34d399' },
      { name: 'Hogar', type: 'gasto', icon: '🏠', color: '#fca5a5' },
      { name: 'Otros', type: 'gasto', icon: '⚙️', color: '#cbd5e1' },
      { name: 'Otros Ingresos', type: 'ingreso', icon: '💰', color: '#34d399' }
    ];

    await Category.bulkCreate(coreCategories);
    console.log('✅ ¡Las 8 Categorías oficiales de Kyzen han sido cargadas con éxito!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando el seed de Kyzen:', error.message);
    process.exit(1);
  }
};

seedDatabase();