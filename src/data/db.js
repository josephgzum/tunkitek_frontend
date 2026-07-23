import Dexie from 'dexie';

// 1. Inicializar la Base de Datos 'TunkitekLocalDB'
export const db = new Dexie('TunkitekLocalDB');

// 2. Definir esquemas y llaves primarias/índices
db.version(1).stores({
  catalog: 'id, name, brand, type',
  devices: 'id, productId, lotId, sn, mac, barcode, status',
  lots: 'id, productId, name, vendor'
});

// Helper para limpiar todas las colecciones al resetear datos
export const clearAllLocalTables = async () => {
  await Promise.all([
    db.catalog.clear(),
    db.devices.clear(),
    db.lots.clear()
  ]);
};
