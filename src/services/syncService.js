import { db } from '../data/db.js';
import { API_URL } from '../data/mockData.js';

/**
 * Realiza la carga inicial desde la API REST e inserta los datos de
 * forma masiva y asíncrona en IndexedDB usando Dexie.js.
 */
export const syncServerToIndexedDB = async () => {
  try {
    console.log('🔄 Iniciando sincronización con el servidor REST...');

    // 1. Petición paralela a los endpoints REST del backend
    const [catRes, devRes, lotsRes] = await Promise.all([
      fetch(`${API_URL}/api/catalog`).catch(() => null),
      fetch(`${API_URL}/api/devices`).catch(() => null),
      fetch(`${API_URL}/api/lots`).catch(() => null)
    ]);

    // Validar respuesta del catálogo (esencial para el inventario)
    if (!catRes || !catRes.ok) {
      console.warn('⚠️ No se pudo conectar al servidor REST. Se usará el caché local de IndexedDB.');
      return false;
    }

    const catalog = await catRes.json();
    const devices = devRes && devRes.ok ? await devRes.json() : [];
    const lots = lotsRes && lotsRes.ok ? await lotsRes.json() : [];

    // 2. Insertar de forma masiva y atómica en IndexedDB
    await db.transaction('rw', [db.catalog, db.devices, db.lots], async () => {
      // Usamos bulkPut para actualizar registros existentes o insertar nuevos eficientemente
      if (Array.isArray(catalog) && catalog.length > 0) {
        await db.catalog.bulkPut(catalog);
      }
      if (Array.isArray(devices) && devices.length > 0) {
        await db.devices.bulkPut(devices);
      }
      if (Array.isArray(lots) && lots.length > 0) {
        await db.lots.bulkPut(lots);
      }
    });

    console.log('✅ Sincronización masiva con IndexedDB completada con éxito.');
    return true;

  } catch (error) {
    console.error('❌ Error durante la sincronización asíncrona con IndexedDB:', error);
    return false;
  }
};
