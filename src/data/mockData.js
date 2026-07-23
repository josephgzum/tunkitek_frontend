// Base de datos local (localStorage) para el control de inventario y caja de TUNKITEK

const INITIAL_CATALOG = [
  {
    id: "prod-1",
    name: "ONU ZTE F670L Dual Band",
    brand: "ZTE",
    type: "ONU",
    controlMethod: "serialized",
    description: "ONU GPON de doble banda AC1200",
    minStockAlert: 2
  },
  {
    id: "prod-2",
    name: "ONU Huawei EG8145V5 GPON",
    brand: "Huawei",
    type: "ONU",
    controlMethod: "serialized",
    description: "ONT GPON 4GE+1POTS+2.4G/5G WiFi",
    minStockAlert: 2
  },
  {
    id: "prod-3",
    name: "ONU Nokia G-140W-H",
    brand: "Nokia",
    type: "ONU",
    controlMethod: "serialized",
    description: "ONT GPON AC1600 con antenas internas",
    minStockAlert: 2
  },
  {
    id: "prod-4",
    name: "Router TP-Link Archer C50 WISP",
    brand: "TP-Link",
    type: "Router",
    controlMethod: "quantity",
    description: "Router Dual Band AC1200 ideal para ISP/WISP",
    minStockAlert: 5
  },
  {
    id: "prod-5",
    name: "Bobina de Cable UTP Cat6 Outdoor",
    brand: "ATW",
    type: "Cable",
    controlMethod: "quantity",
    description: "Bobina de 305 metros de cable de red exterior",
    minStockAlert: 1
  },
  {
    id: "prod-6",
    name: "Caja NAP de 16 Puertos Exterior",
    brand: "C-Data",
    type: "Caja NAP",
    controlMethod: "quantity",
    description: "Caja de distribución de fibra óptica hermética IP65",
    minStockAlert: 3
  }
];

const INITIAL_LOTS = [
  {
    id: "lot-1",
    name: "Lote ZTE Julio 2026",
    productId: "prod-1",
    vendor: "Importaciones Fibra S.A.",
    date: "2026-07-05 10:15:30",
    purchasePricePerUnit: 12.50,
    quantity: 5,
    type: "ONU"
  },
  {
    id: "lot-2",
    name: "Lote Huawei & Nokia Import",
    productId: "prod-2",
    vendor: "Distribuidor Telco S.R.L.",
    date: "2026-07-10 16:45:00",
    purchasePricePerUnit: 18.00,
    quantity: 4,
    type: "ONU"
  },
  {
    id: "lot-3",
    name: "Lote Router TP-Link Archer C50",
    productId: "prod-4",
    vendor: "Distribuidora Mayorista Lima",
    date: "2026-07-11 12:00:00",
    purchasePricePerUnit: 15.00,
    quantity: 10,
    type: "Otro"
  }
];

const INITIAL_DEVICES = [
  {
    id: "dev-1",
    productId: "prod-1",
    brand: "ZTE",
    model: "F670L Dual Band",
    type: "ONU",
    sn: "ZTEGC78D24E8",
    mac: "98:45:62:78:D2:4E",
    barcode: "ZTEGC78D24E8",
    status: "Disponible", // Disponible, Vendido, Defectuoso
    lotId: "lot-1",
    purchasePrice: 12.50,
    salePrice: 25.00,
    soldPrice: null,
    soldDate: null,
    soldTo: null,
    dateAdded: "2026-07-05 10:18:22"
  },
  {
    id: "dev-2",
    productId: "prod-1",
    brand: "ZTE",
    model: "F670L Dual Band",
    type: "ONU",
    sn: "ZTEGC78D24E9",
    mac: "98:45:62:78:D2:4F",
    barcode: "ZTEGC78D24E9",
    status: "Disponible",
    lotId: "lot-1",
    purchasePrice: 12.50,
    salePrice: 25.00,
    soldPrice: null,
    soldDate: null,
    soldTo: null,
    dateAdded: "2026-07-05 10:19:05"
  },
  {
    id: "dev-3",
    productId: "prod-1",
    brand: "ZTE",
    model: "F660 V8.0",
    type: "ONU",
    sn: "ZTEGC99A11FF",
    mac: "98:45:62:99:A1:1F",
    barcode: "ZTEGC99A11FF",
    status: "Vendido",
    lotId: "lot-1",
    purchasePrice: 12.50,
    salePrice: 22.00,
    soldPrice: 22.00,
    soldDate: "2026-07-12 11:30:15",
    soldTo: "Juan Perez (Cliente Residencial)",
    dateAdded: "2026-07-05 10:20:11"
  },
  {
    id: "dev-4",
    productId: "prod-2",
    brand: "Huawei",
    model: "EG8145V5 GPON",
    type: "ONU",
    sn: "4857544321A8",
    mac: "E8:08:8F:21:5A:A8",
    barcode: "4857544321A8",
    status: "Disponible",
    lotId: "lot-2",
    purchasePrice: 18.00,
    salePrice: 35.00,
    soldPrice: null,
    soldDate: null,
    soldTo: null,
    dateAdded: "2026-07-10 16:50:40"
  },
  {
    id: "dev-5",
    productId: "prod-3",
    brand: "Nokia",
    model: "G-140W-H",
    type: "ONU",
    sn: "ALCLB1234567",
    mac: "B4:5E:A2:12:34:56",
    barcode: "ALCLB1234567",
    status: "Disponible",
    lotId: "lot-2",
    purchasePrice: 18.00,
    salePrice: 32.00,
    soldPrice: null,
    soldDate: null,
    soldTo: null,
    dateAdded: "2026-07-10 16:52:12"
  }
];

// Quantity-based stock state (for non-ONU products)
const INITIAL_NON_SERIALIZED_STOCK = [
  { productId: "prod-4", qtyAvailable: 8 },
  { productId: "prod-5", qtyAvailable: 3 },
  { productId: "prod-6", qtyAvailable: 5 }
];

const DEFAULT_BRANDS = [
  "ZTE",
  "Huawei",
  "Nokia",
  "ATW",
  "Mitrastar",
  "Askey",
  "TP-Link",
  "C-Data"
];

const INITIAL_USERS = [
  {
    username: "admin",
    password: "123",
    name: "Administrador General",
    role: "Administrador"
  },
  {
    username: "almacen",
    password: "123",
    name: "Juan Almacenero",
    role: "Almacenero"
  },
  {
    username: "encargado",
    password: "123",
    name: "María Encargada de Ventas",
    role: "Encargado"
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Juan Perez (Cliente Residencial)",
    phone: "+51 987 654 321",
    email: "juan.perez@email.com",
    address: "Av. Larco 123, Miraflores",
    docId: "45879612",
    dateAdded: "2026-07-01 09:30:00"
  },
  {
    id: "cust-2",
    name: "Carlos Gomez (Técnico Independiente)",
    phone: "+51 912 345 678",
    email: "carlos.tecnico@email.com",
    address: "Calle Los Claveles 456, Surco",
    docId: "10458796123",
    dateAdded: "2026-07-02 11:20:00"
  },
  {
    id: "cust-3",
    name: "Telecomunicaciones del Sur S.A.C.",
    phone: "+51 1 444 8888",
    email: "compras@telecomsur.com",
    address: "Zona Industrial Lote 5, Arequipa",
    docId: "20556677889",
    dateAdded: "2026-07-05 14:00:00"
  }
];

// Financial Ledger containing incomes and outcomes
const INITIAL_LEDGER = [
  {
    id: "tx-1",
    type: "Egreso",
    category: "Compra",
    description: "Compra lote ZTE Julio 2026 (5 ONUs)",
    amount: 62.50,
    date: "2026-07-05 10:15:30"
  },
  {
    id: "tx-2",
    type: "Egreso",
    category: "Compra",
    description: "Compra lote Huawei & Nokia Import (4 ONUs)",
    amount: 72.00,
    date: "2026-07-10 16:45:00"
  },
  {
    id: "tx-3",
    type: "Egreso",
    category: "Compra",
    description: "Compra lote 10 Routers TP-Link Archer C50",
    amount: 150.00,
    date: "2026-07-11 12:00:00"
  },
  {
    id: "tx-4",
    type: "Ingreso",
    category: "Venta",
    description: "Venta ONU ZTE F660 V8.0 - Juan Perez",
    amount: 22.00,
    date: "2026-07-12 11:30:15"
  },
  {
    id: "tx-5",
    type: "Ingreso",
    category: "Venta",
    description: "Venta 2 Routers TP-Link Archer C50 - Telecomunicaciones del Sur",
    amount: 56.00,
    date: "2026-07-13 14:35:10"
  },
  {
    id: "tx-6",
    type: "Egreso",
    category: "Transporte",
    description: "Pago de delivery de mercadería (Courier)",
    amount: 15.00,
    date: "2026-07-14 09:00:00"
  },
  {
    id: "tx-7",
    type: "Egreso",
    category: "Servicios",
    description: "Recibo mensual de luz oficina",
    amount: 45.80,
    date: "2026-07-15 17:30:00"
  }
];

// Initial Credits (Cuentas por Cobrar y por Pagar)
const INITIAL_CREDITS = [
  {
    id: "cred-1",
    type: "Cobrar", // 'Cobrar' (Venta a crédito) | 'Pagar' (Compra a crédito)
    clientOrVendor: "Telecomunicaciones del Sur S.A.C.",
    totalAmount: 120.00,
    paidAmount: 40.00,
    balance: 80.00,
    status: "Pendiente", // 'Pendiente' | 'Pagado'
    date: "2026-07-15 14:00:00",
    description: "Venta a Crédito: ONU Huawei EG8145V5",
    payments: [
      {
        id: "pay-101",
        date: "2026-07-15 14:00:00",
        amount: 40.00,
        paymentMethod: "Yape",
        receiptImage: null,
        note: "Cuota inicial en la venta"
      }
    ]
  }
];

// Helper to get current Date in YYYY-MM-DD format
export const getFormattedDateTime = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Inicializar base de datos local en localStorage
export const INITIAL_VENDORS = [
  {
    id: "vend-1",
    name: "Distribuidor Mayorista FiberTech S.A.C.",
    docId: "20601234567",
    contactPerson: "Juan Pérez",
    phone: "987654321",
    email: "ventas@fibertech.pe",
    address: "Av. Argentina 1450, Lima",
    notes: "Proveedor principal de ONUs ZTE y Huawei"
  },
  {
    id: "vend-2",
    name: "Importaciones OptiRed E.I.R.L.",
    docId: "20549876543",
    contactPerson: "María Gómez",
    phone: "912345678",
    email: "contacto@optired.com.pe",
    address: "Calle Los Plateros 320, Ate",
    notes: "Cables Drop, Splitters y Ferretería de Fibra"
  },
  {
    id: "vend-3",
    name: "Global Net Telecom S.A.",
    docId: "20109876543",
    contactPerson: "Carlos Mendoza",
    phone: "998877665",
    email: "cmendoza@globalnet.pe",
    address: "Av. Parra 450, Arequipa",
    notes: "Sistemas OLT y Routers Mikrotik"
  }
];

export const initializeDB = () => {
  if (!localStorage.getItem("onu_inventory_devices")) {
    localStorage.setItem("onu_inventory_devices", JSON.stringify(INITIAL_DEVICES));
  }
  if (!localStorage.getItem("onu_inventory_lots")) {
    localStorage.setItem("onu_inventory_lots", JSON.stringify(INITIAL_LOTS));
  }
  if (!localStorage.getItem("onu_inventory_brands")) {
    localStorage.setItem("onu_inventory_brands", JSON.stringify(DEFAULT_BRANDS));
  }
  if (!localStorage.getItem("onu_inventory_users")) {
    localStorage.setItem("onu_inventory_users", JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem("onu_inventory_customers")) {
    localStorage.setItem("onu_inventory_customers", JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem("onu_inventory_currency")) {
    localStorage.setItem("onu_inventory_currency", "$");
  }
  if (!localStorage.getItem("onu_inventory_catalog")) {
    localStorage.setItem("onu_inventory_catalog", JSON.stringify(INITIAL_CATALOG));
  }
  if (!localStorage.getItem("onu_inventory_ledger")) {
    localStorage.setItem("onu_inventory_ledger", JSON.stringify(INITIAL_LEDGER));
  }
  if (!localStorage.getItem("onu_inventory_non_serialized")) {
    localStorage.setItem("onu_inventory_non_serialized", JSON.stringify(INITIAL_NON_SERIALIZED_STOCK));
  }
  if (!localStorage.getItem("onu_inventory_credits")) {
    localStorage.setItem("onu_inventory_credits", JSON.stringify(INITIAL_CREDITS));
  }
  if (!localStorage.getItem("onu_inventory_vendors")) {
    localStorage.setItem("onu_inventory_vendors", JSON.stringify(INITIAL_VENDORS));
  }
  localStorage.setItem("onu_inventory_currency", "S/.");
};

// Sincronizar datos con servidor central MySQL
export const syncServerDB = async (dbData) => {
  // En TUNKITEK v2.0 la persistencia se realiza mediante endpoints REST de MySQL
  return { success: true };
};

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://tunkitek-backend.onrender.com';
export const API_URL = rawApiUrl.replace(/[\[\]]/g, '').trim();

export const fetchServerDB = async () => {
  try {
    const token = localStorage.getItem("tunkitek_token");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    const [catRes, devRes, custRes, usrRes, vendRes, credRes, ledgRes, lotsRes, settRes] = await Promise.all([
      fetch(`${API_URL}/api/catalog`).catch(() => null),
      fetch(`${API_URL}/api/devices`).catch(() => null),
      fetch(`${API_URL}/api/customers`).catch(() => null),
      fetch(`${API_URL}/api/users`).catch(() => null),
      fetch(`${API_URL}/api/vendors`).catch(() => null),
      fetch(`${API_URL}/api/credits`).catch(() => null),
      token ? fetch(`${API_URL}/api/ledger`, { headers }).catch(() => null) : Promise.resolve(null),
      fetch(`${API_URL}/api/lots`).catch(() => null),
      fetch(`${API_URL}/api/settings`).catch(() => null)
    ]);

    if (!catRes || !catRes.ok) return null;

    const catalog = await catRes.json();
    const devices = devRes && devRes.ok ? await devRes.json() : [];
    const customers = custRes && custRes.ok ? await custRes.json() : [];
    const users = usrRes && usrRes.ok ? await usrRes.json() : [];
    const vendors = vendRes && vendRes.ok ? await vendRes.json() : [];
    const credits = credRes && credRes.ok ? await credRes.json() : [];
    const ledger = ledgRes && ledgRes.ok ? await ledgRes.json() : [];
    const lots = lotsRes && lotsRes.ok ? await lotsRes.json() : [];
    const settings = settRes && settRes.ok ? await settRes.json() : {};

    if (Array.isArray(catalog)) {
      return {
        catalog,
        devices: Array.isArray(devices) ? devices : [],
        customers: Array.isArray(customers) ? customers : [],
        users: Array.isArray(users) ? users : [],
        vendors: Array.isArray(vendors) ? vendors : [],
        credits: Array.isArray(credits) ? credits : [],
        ledger: Array.isArray(ledger) ? ledger : [],
        lots: Array.isArray(lots) ? lots : [],
        appName: settings.appName || "TUNKITEK",
        appSubtitle: settings.appSubtitle || "Gestión de Almacén e Inventario",
        appLogo: settings.appLogo || "/logo-tunqui-red.png",
        currency: settings.currency || "S/.",
        bgTheme: settings.bgTheme || "cyber-dark"
      };
    }
  } catch (err) {
    console.warn("No se pudo obtener datos del servidor MySQL:", err);
  }
  return null;
};

// Obtener datos
export const getInventory = () => {
  initializeDB();
  const devices = JSON.parse(localStorage.getItem("onu_inventory_devices") || "[]");
  const lots = JSON.parse(localStorage.getItem("onu_inventory_lots") || "[]");
  const brands = JSON.parse(localStorage.getItem("onu_inventory_brands") || "[]");
  const users = JSON.parse(localStorage.getItem("onu_inventory_users") || "[]");
  const customers = JSON.parse(localStorage.getItem("onu_inventory_customers") || "[]");
  const currency = "S/.";
  const catalog = JSON.parse(localStorage.getItem("onu_inventory_catalog") || "[]");
  const ledger = JSON.parse(localStorage.getItem("onu_inventory_ledger") || "[]");
  const nonSerialized = JSON.parse(localStorage.getItem("onu_inventory_non_serialized") || "[]");
  const credits = JSON.parse(localStorage.getItem("onu_inventory_credits") || "[]");
  const vendors = JSON.parse(localStorage.getItem("onu_inventory_vendors") || "[]");
  return { devices, lots, brands, users, customers, currency, catalog, ledger, nonSerialized, credits, vendors };
};

// Guardar datos
export const saveInventory = (devices, lots, brands, users, customers, currency, catalog, ledger, nonSerialized, credits, vendors) => {
  localStorage.setItem("onu_inventory_devices", JSON.stringify(devices));
  localStorage.setItem("onu_inventory_lots", JSON.stringify(lots));
  if (brands) localStorage.setItem("onu_inventory_brands", JSON.stringify(brands));
  if (users) localStorage.setItem("onu_inventory_users", JSON.stringify(users));
  if (customers) localStorage.setItem("onu_inventory_customers", JSON.stringify(customers));
  if (currency) localStorage.setItem("onu_inventory_currency", currency);
  if (catalog) localStorage.setItem("onu_inventory_catalog", JSON.stringify(catalog));
  if (ledger) localStorage.setItem("onu_inventory_ledger", JSON.stringify(ledger));
  if (nonSerialized) localStorage.setItem("onu_inventory_non_serialized", JSON.stringify(nonSerialized));
  if (credits) localStorage.setItem("onu_inventory_credits", JSON.stringify(credits));
  if (vendors) localStorage.setItem("onu_inventory_vendors", JSON.stringify(vendors));

  const dbData = { devices, lots, brands, users, customers, currency, catalog, ledger, nonSerialized, credits, vendors };
  syncServerDB(dbData);
};

// Limpiar base de datos y restaurar iniciales
export const resetToSeed = () => {
  localStorage.setItem("onu_inventory_devices", JSON.stringify(INITIAL_DEVICES));
  localStorage.setItem("onu_inventory_lots", JSON.stringify(INITIAL_LOTS));
  localStorage.setItem("onu_inventory_brands", JSON.stringify(DEFAULT_BRANDS));
  localStorage.setItem("onu_inventory_users", JSON.stringify(INITIAL_USERS));
  localStorage.setItem("onu_inventory_customers", JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem("onu_inventory_currency", "$");
  localStorage.setItem("onu_inventory_catalog", JSON.stringify(INITIAL_CATALOG));
  localStorage.setItem("onu_inventory_ledger", JSON.stringify(INITIAL_LEDGER));
  localStorage.setItem("onu_inventory_non_serialized", JSON.stringify(INITIAL_NON_SERIALIZED_STOCK));
  localStorage.setItem("onu_inventory_credits", JSON.stringify(INITIAL_CREDITS));
  localStorage.setItem("onu_inventory_vendors", JSON.stringify(INITIAL_VENDORS));

  const dbData = {
    devices: INITIAL_DEVICES,
    lots: INITIAL_LOTS,
    brands: DEFAULT_BRANDS,
    users: INITIAL_USERS,
    customers: INITIAL_CUSTOMERS,
    currency: "$",
    catalog: INITIAL_CATALOG,
    ledger: INITIAL_LEDGER,
    nonSerialized: INITIAL_NON_SERIALIZED_STOCK,
    credits: INITIAL_CREDITS,
    vendors: INITIAL_VENDORS
  };
  syncServerDB(dbData);
};
