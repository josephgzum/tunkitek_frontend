import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MinusCircle,
  Settings,
  Search,
  Scan,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Download,
  Upload,
  User,
  Barcode,
  Layers,
  Sparkles,
  Info,
  Edit2,
  Calendar,
  XCircle,
  Lock,
  LogOut,
  UserPlus,
  Users,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  Menu,
  CreditCard,
  Camera,
  Paperclip,
  Eye,
  FileText,
  Truck,
  Building
} from "lucide-react";

import QrScanner from "./components/QrScanner";
import {
  getInventory,
  saveInventory,
  resetToSeed,
  getFormattedDateTime,
  fetchServerDB,
  syncServerDB,
  API_URL
} from "./data/mockData";

export const THEME_PALETTES = [
  {
    id: "cyan",
    name: "Cyber Cyan (Cian Neón)",
    primary: "#00f2fe",
    secondary: "#4facfe",
    gradient: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
    borderGlow: "rgba(0, 242, 254, 0.2)",
    shadowGlow: "0 0 15px rgba(0, 242, 254, 0.15)"
  },
  {
    id: "emerald",
    name: "Menta Esmeralda (Verde Bio)",
    primary: "#34d399",
    secondary: "#059669",
    gradient: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
    borderGlow: "rgba(52, 211, 153, 0.2)",
    shadowGlow: "0 0 15px rgba(52, 211, 153, 0.15)"
  },
  {
    id: "purple",
    name: "Violeta Eléctrico (Púrpura Neón)",
    primary: "#c084fc",
    secondary: "#7e22ce",
    gradient: "linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)",
    borderGlow: "rgba(192, 132, 252, 0.2)",
    shadowGlow: "0 0 15px rgba(192, 132, 252, 0.15)"
  },
  {
    id: "amber",
    name: "Dorado Solar (Naranja Ámbar)",
    primary: "#fbbf24",
    secondary: "#d97706",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
    borderGlow: "rgba(251, 191, 36, 0.2)",
    shadowGlow: "0 0 15px rgba(251, 191, 36, 0.15)"
  },
  {
    id: "rose",
    name: "Rosa Rubí (Carmín)",
    primary: "#fb7185",
    secondary: "#e11d48",
    gradient: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
    borderGlow: "rgba(251, 113, 133, 0.2)",
    shadowGlow: "0 0 15px rgba(251, 113, 133, 0.15)"
  },
  {
    id: "blue",
    name: "Azul Zafiro (Cobalto)",
    primary: "#60a5fa",
    secondary: "#1d4ed8",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)",
    borderGlow: "rgba(96, 165, 250, 0.2)",
    shadowGlow: "0 0 15px rgba(96, 165, 250, 0.15)"
  }
];

export const BACKGROUND_THEMES = [
  {
    id: "cyber-dark",
    name: "Oscuro Neón (Cyber Dark)",
    bgMain: "#0b0f19",
    bgCard: "rgba(15, 23, 42, 0.7)",
    bgGradient: "radial-gradient(circle at 10% 20%, rgba(0, 242, 254, 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(79, 172, 254, 0.05) 0%, transparent 50%)",
    previewColor: "#0b0f19"
  },
  {
    id: "midnight-navy",
    name: "Azul Noche (Midnight Sapphire)",
    bgMain: "#070e20",
    bgCard: "rgba(15, 29, 58, 0.7)",
    bgGradient: "radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.08) 0%, transparent 50%)",
    previewColor: "#070e20"
  },
  {
    id: "graphite-charcoal",
    name: "Gris Grafito (Modern Charcoal)",
    bgMain: "#121214",
    bgCard: "rgba(30, 30, 36, 0.7)",
    bgGradient: "radial-gradient(circle at 10% 20%, rgba(156, 163, 175, 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(75, 85, 99, 0.05) 0%, transparent 50%)",
    previewColor: "#121214"
  },
  {
    id: "emerald-night",
    name: "Verde Esmeralda (Emerald Night)",
    bgMain: "#061410",
    bgCard: "rgba(11, 37, 29, 0.7)",
    bgGradient: "radial-gradient(circle at 10% 20%, rgba(52, 211, 153, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.08) 0%, transparent 50%)",
    previewColor: "#061410"
  }
];

export const applyBackgroundTheme = (themeId) => {
  const t = BACKGROUND_THEMES.find(item => item.id === themeId) || BACKGROUND_THEMES[0];
  document.documentElement.style.setProperty("--bg-main", t.bgMain);
  document.documentElement.style.setProperty("--bg-card", t.bgCard);
  document.documentElement.style.setProperty("--bg-gradient", t.bgGradient);
  localStorage.setItem("tunkitek_bg_theme", t.id);
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "-";
  const dateOnly = dateStr.split(" ")[0];
  const parts = dateOnly.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export default function App() {
  const [themePalette, setThemePalette] = useState("cyan");
  // Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [devices, setDevices] = useState([]);
  const [lots, setLots] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currency, setCurrency] = useState("$");
  const [catalog, setCatalog] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [nonSerialized, setNonSerialized] = useState([]);

  // System Branding State
  const [appName, setAppName] = useState("TUNKITEK");
  const [appSubtitle, setAppSubtitle] = useState("Gestión de Almacén e Inventario");
  const [appLogo, setAppLogo] = useState("/logo-tunqui-red.png");
  const [bgTheme, setBgTheme] = useState("cyber-dark");

  // Settings Form State
  const [editAppName, setEditAppName] = useState("TUNKITEK");
  const [editAppSubtitle, setEditAppSubtitle] = useState("Gestión de Almacén e Inventario");
  const [editAppLogo, setEditAppLogo] = useState(null);

  // User Management State (Usuarios Tab - Admin only)
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Almacenero");

  // User Edit Modal State
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserUsername, setEditUserUsername] = useState("");
  const [editUserRole, setEditUserRole] = useState("Almacenero");
  const [editUserPassword, setEditUserPassword] = useState("");

  // Login Change Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpUsername, setCpUsername] = useState("");
  const [cpCurrentPassword, setCpCurrentPassword] = useState("");
  const [cpNewPassword, setCpNewPassword] = useState("");
  const [cpConfirmPassword, setCpConfirmPassword] = useState("");
  const [cpError, setCpError] = useState("");
  const [cpSuccess, setCpSuccess] = useState("");

  // Catalog Management State (Productos Tab)
  const [addProdName, setAddProdName] = useState("");
  const [addProdBrand, setAddProdBrand] = useState("");
  const [addProdType, setAddProdType] = useState("");
  const [addProdControlMethod, setAddProdControlMethod] = useState("serialized");
  const [addProdDesc, setAddProdDesc] = useState("");
  const [addProdMinAlert, setAddProdMinAlert] = useState("2");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editProdName, setEditProdName] = useState("");
  const [editProdBrand, setEditProdBrand] = useState("");
  const [editProdType, setEditProdType] = useState("");
  const [editProdControlMethod, setEditProdControlMethod] = useState("serialized");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdMinAlert, setEditProdMinAlert] = useState("");

  // Filters State (Devices)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [inventoryMode, setInventoryMode] = useState("serialized"); // 'serialized' | 'quantity'

  // Filters State (Ledger)
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerFilterCategory, setLedgerFilterCategory] = useState("");

  // Filters State (Customers)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Details Modal State (Device)
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditingDevice, setIsEditingDevice] = useState(false);

  // Customer Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // Add Customer Form States
  const [addCustName, setAddCustName] = useState("");
  const [addCustPhone, setAddCustPhone] = useState("");
  const [addCustEmail, setAddCustEmail] = useState("");
  const [addCustAddress, setAddCustAddress] = useState("");
  const [addCustDocId, setAddCustDocId] = useState("");

  // Edit Customer Form States
  const [editCustName, setEditCustName] = useState("");
  const [editCustPhone, setEditCustPhone] = useState("");
  const [editCustEmail, setEditCustEmail] = useState("");
  const [editCustAddress, setEditCustAddress] = useState("");
  const [editCustDocId, setEditCustDocId] = useState("");

  // Vendor Management State
  const [vendors, setVendors] = useState([]);
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isEditingVendor, setIsEditingVendor] = useState(false);

  // Add Vendor Form States
  const [addVendorName, setAddVendorName] = useState("");
  const [addVendorDocId, setAddVendorDocId] = useState("");
  const [addVendorContact, setAddVendorContact] = useState("");
  const [addVendorPhone, setAddVendorPhone] = useState("");
  const [addVendorEmail, setAddVendorEmail] = useState("");
  const [addVendorAddress, setAddVendorAddress] = useState("");
  const [addVendorNotes, setAddVendorNotes] = useState("");

  // Edit Vendor Form States
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorDocId, setEditVendorDocId] = useState("");
  const [editVendorContact, setEditVendorContact] = useState("");
  const [editVendorPhone, setEditVendorPhone] = useState("");
  const [editVendorEmail, setEditVendorEmail] = useState("");
  const [editVendorAddress, setEditVendorAddress] = useState("");
  const [editVendorNotes, setEditVendorNotes] = useState("");

  // Edit Device Form States
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSn, setEditSn] = useState("");
  const [editMac, setEditMac] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editPurchasePrice, setEditPurchasePrice] = useState("");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editStatus, setEditStatus] = useState("Disponible");
  const [editSoldTo, setEditSoldTo] = useState("");
  const [editSoldPrice, setEditSoldPrice] = useState("");
  const [editSoldDate, setEditSoldDate] = useState("");
  const [editDateAdded, setEditDateAdded] = useState("");

  // Scanner State
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(""); // 'entrada-sn-X', 'entrada-mac-X', 'salida-search', 'edit-sn', 'edit-mac', 'edit-barcode'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Entrada Form State
  const [entradaSelectedProductId, setEntradaSelectedProductId] = useState("");
  const [entradaPurchasePrice, setEntradaPurchasePrice] = useState("");
  const [entradaSalePrice, setEntradaSalePrice] = useState("");
  const [entradaLotName, setEntradaLotName] = useState("");
  const [entradaVendor, setEntradaVendor] = useState("");
  const [entradaNonSerializedQty, setEntradaNonSerializedQty] = useState(""); // For non-ONUs
  const [entradaRows, setEntradaRows] = useState([
    { id: 1, sn: "", mac: "", barcode: "" }
  ]);

  // Salida Form State
  const [salidaMode, setSalidaMode] = useState("onu"); // 'onu' or 'other'
  const [salidaSearch, setSalidaSearch] = useState("");
  const [salidaCartDevices, setSalidaCartDevices] = useState([]); // Array of ONUs to sell in batch
  
  // Sale of other products
  const [salidaSelectedProductId, setSalidaSelectedProductId] = useState("");
  const [salidaQty, setSalidaQty] = useState("");
  const [salidaPriceUnit, setSalidaPriceUnit] = useState("");

  // Common Salida checkout variables
  const [salidaClientMode, setSalidaClientMode] = useState("select"); // 'select' or 'manual'
  const [salidaSelectedCustomerId, setSalidaSelectedCustomerId] = useState("");
  const [salidaManualClient, setSalidaManualClient] = useState("");
  const [salidaSuccessMsg, setSalidaSuccessMsg] = useState("");
  const [salidaErrorMsg, setSalidaErrorMsg] = useState("");

  // Finance / Expense Form State
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Servicios");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Credits Management State
  const [credits, setCredits] = useState([]);
  const [entradaPaymentCondition, setEntradaPaymentCondition] = useState("Contado");
  const [entradaInitialPayment, setEntradaInitialPayment] = useState("0.00");
  const [entradaReceiptImage, setEntradaReceiptImage] = useState(null);
  const [salidaPaymentCondition, setSalidaPaymentCondition] = useState("Contado");
  const [salidaInitialPayment, setSalidaInitialPayment] = useState("0.00");
  const [salidaReceiptImage, setSalidaReceiptImage] = useState(null);

  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState("");
  const [abonoMethod, setAbonoMethod] = useState("Yape");
  const [abonoImage, setAbonoImage] = useState(null);
  const [abonoNote, setAbonoNote] = useState("");
  const [selectedCreditForHistory, setSelectedCreditForHistory] = useState(null);
  const [viewingReceiptImage, setViewingReceiptImage] = useState(null);

  const [creditsSearchQuery, setCreditsSearchQuery] = useState("");
  const [creditsFilterType, setCreditsFilterType] = useState("Cobrar");
  const [creditsFilterStatus, setCreditsFilterStatus] = useState("");

  // Helper to handle image file upload as base64
  const handleImageFileChange = (e, setImageState) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, etc.).");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("La imagen excede los 3MB. Por favor elige una foto o captura de menor tamaño.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImageState(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const applyThemePalette = (paletteId) => {
    const theme = THEME_PALETTES.find(t => t.id === paletteId) || THEME_PALETTES[0];
    document.documentElement.style.setProperty("--color-primary", theme.primary);
    document.documentElement.style.setProperty("--color-secondary", theme.secondary);
    document.documentElement.style.setProperty("--gradient-primary", theme.gradient);
    document.documentElement.style.setProperty("--border-glow", theme.borderGlow);
    document.documentElement.style.setProperty("--shadow-glow", theme.shadowGlow);
    setThemePalette(theme.id);
    localStorage.setItem("tunkitek_theme_palette", theme.id);
  };

  const reloadDataFromDB = (data) => {
    if (!data) return;
    
    // Sanitizar numéricamente objetos de MySQL (removiendo strings de DECIMAL)
    const sanitizedDevs = (data.devices || []).map(d => ({
      ...d,
      purchasePrice: parseFloat(d.purchasePrice) || 0,
      salePrice: parseFloat(d.salePrice) || 0,
      soldPrice: d.soldPrice !== null && d.soldPrice !== undefined ? parseFloat(d.soldPrice) : null
    }));

    const sanitizedLots = (data.lots || []).map(l => ({
      ...l,
      purchasePricePerUnit: parseFloat(l.purchasePricePerUnit) || 0
    }));

    const sanitizedCredits = (data.credits || []).map(c => ({
      ...c,
      totalAmount: parseFloat(c.totalAmount) || 0,
      paidAmount: parseFloat(c.paidAmount) || 0,
      balance: parseFloat(c.balance) || 0
    }));

    const sanitizedLedger = (data.ledger || []).map(t => ({
      ...t,
      amount: parseFloat(t.amount) || 0
    }));

    setDevices(sanitizedDevs);
    if (data.lots) setLots(sanitizedLots);
    if (data.users && data.users.length > 0) setUsers(data.users);
    if (data.customers) setCustomers(data.customers);
    if (data.currency) setCurrency(data.currency);
    if (data.catalog && data.catalog.length > 0) {
      setCatalog(data.catalog);
      setEntradaSelectedProductId(prev => {
        if (prev && data.catalog.some(c => c.id === prev)) return prev;
        return data.catalog[0].id;
      });
      setSalidaSelectedProductId(prev => {
        if (prev && data.catalog.some(c => c.id === prev)) return prev;
        const firstNonSerialized = data.catalog.find(c => c.controlMethod !== "serialized" && c.type !== "ONU");
        return firstNonSerialized ? firstNonSerialized.id : "";
      });
    }
    setLedger(sanitizedLedger);
    if (data.nonSerialized) setNonSerialized(data.nonSerialized);
    setCredits(sanitizedCredits);
    if (data.vendors) setVendors(data.vendors);
    if (data.appName) { setAppName(data.appName); setEditAppName(data.appName); }
    if (data.appSubtitle) { setAppSubtitle(data.appSubtitle); setEditAppSubtitle(data.appSubtitle); }
    if (data.appLogo) { setAppLogo(data.appLogo); }
    if (data.bgTheme) { setBgTheme(data.bgTheme); applyBackgroundTheme(data.bgTheme); }

    // Sobrescribir la memoria local del celular/PC con los datos reales de MySQL
    saveInventory(
      data.devices || [],
      data.lots || [],
      null,
      data.users || [],
      data.customers || [],
      data.currency || "$",
      data.catalog || [],
      data.ledger || [],
      data.nonSerialized || [],
      data.credits || [],
      data.vendors || []
    );
  };

  // Load Session and Inventory on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("tunkitek_theme_palette") || "cyan";
    applyThemePalette(savedTheme);

    const savedBgTheme = localStorage.getItem("tunkitek_bg_theme") || "cyber-dark";
    applyBackgroundTheme(savedBgTheme);

    const localInv = getInventory();
    setDevices(localInv.devices);
    setLots(localInv.lots);
    setUsers(localInv.users || []);
    setCustomers(localInv.customers || []);
    setCurrency(localInv.currency || "$");
    setCatalog(localInv.catalog || []);
    setLedger(localInv.ledger || []);
    setNonSerialized(localInv.nonSerialized || []);
    setCredits(localInv.credits || []);
    setVendors(localInv.vendors || []);

    if (localInv.catalog && localInv.catalog.length > 0) {
      setEntradaSelectedProductId(localInv.catalog[0].id);
      const firstNonSerialized = localInv.catalog.find(c => c.controlMethod !== "serialized" && c.type !== "ONU");
      setSalidaSelectedProductId(firstNonSerialized ? firstNonSerialized.id : "");
    }

    const savedUser = localStorage.getItem("onu_inventory_current_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Connect and sync with central LAN server (server_db.json)
    fetchServerDB().then(serverData => {
      if (serverData && serverData.catalog) {
        reloadDataFromDB(serverData);
      } else {
        syncServerDB(localInv);
      }
    });

    // Auto poll central server every 8 seconds for multi-device sync
    const syncInterval = setInterval(() => {
      fetchServerDB().then(serverData => {
        if (serverData && serverData.catalog) {
          reloadDataFromDB(serverData);
        }
      });
    }, 8000);

    document.title = `${appName} - ${appSubtitle}`;
    return () => clearInterval(syncInterval);
  }, [appName, appSubtitle]);

  // Role permissions helpers
  const isAdmin = currentUser?.role === "Administrador";
  const isAlmacenero = currentUser?.role === "Almacenero";
  const isEncargado = currentUser?.role === "Encargado";
  const canManageCatalog = isAdmin || isAlmacenero;

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    fetch(API_URL + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Usuario o contraseña incorrectos.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCurrentUser(data.user);
          localStorage.setItem("onu_inventory_current_user", JSON.stringify(data.user));
          localStorage.setItem("tunkitek_token", data.token);
          setLoginUsername("");
          setLoginPassword("");
          
          if (data.user.role === "Almacenero" && activeTab === "salida") {
            setActiveTab("inventory");
          } else if (data.user.role === "Encargado" && activeTab === "entrada") {
            setActiveTab("inventory");
          } else {
            setActiveTab("dashboard");
          }

          // Realizar sincronización inmediata
          fetchServerDB().then(serverData => {
            if (serverData && serverData.catalog) {
              reloadDataFromDB(serverData);
            }
          });
        } else {
          setLoginError(data.message || "Usuario o contraseña incorrectos.");
        }
      })
      .catch((err) => {
        setLoginError(err.message || "Error al conectar con el servidor.");
      });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setCpError("");
    setCpSuccess("");

    if (!cpUsername || !cpCurrentPassword || !cpNewPassword) {
      setCpError("Por favor completa todos los campos.");
      return;
    }

    if (cpNewPassword !== cpConfirmPassword) {
      setCpError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    const foundUser = users.find(u => u.username.toLowerCase() === cpUsername.trim().toLowerCase());
    if (!foundUser) {
      setCpError("El nombre de usuario ingresado no existe.");
      return;
    }

    if (foundUser.password !== cpCurrentPassword) {
      setCpError("La contraseña actual ingresada es incorrecta.");
      return;
    }

    const updatedUsers = users.map(u => u.username.toLowerCase() === cpUsername.trim().toLowerCase() ? { ...u, password: cpNewPassword } : u);
    setUsers(updatedUsers);
    saveInventory(devices, lots, null, updatedUsers, customers, currency, catalog, ledger, nonSerialized, credits, vendors);

    fetch(API_URL + "/api/users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cpUsername.trim(), currentPassword: cpCurrentPassword, newPassword: cpNewPassword })
    }).catch(() => {});

    setCpSuccess("¡Contraseña actualizada correctamente! Ya puedes iniciar sesión con tu nueva clave.");
    setCpUsername("");
    setCpCurrentPassword("");
    setCpNewPassword("");
    setCpConfirmPassword("");
  };

  const handleStartEditUser = (user) => {
    setSelectedUserToEdit(user);
    setEditUserName(user.name);
    setEditUserUsername(user.username);
    setEditUserRole(user.role);
    setEditUserPassword(user.password || "");
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editUserName || !editUserUsername) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.username === selectedUserToEdit.username || (u.id && u.id === selectedUserToEdit.id)) {
        return {
          ...u,
          name: editUserName.trim(),
          username: editUserUsername.trim(),
          role: editUserRole,
          password: editUserPassword.trim() || u.password
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    saveInventory(devices, lots, null, updatedUsers, customers, currency, catalog, ledger, nonSerialized, credits, vendors);

    if (selectedUserToEdit.id) {
      fetch(`${API_URL}/api/users/${selectedUserToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editUserName.trim(),
          username: editUserUsername.trim(),
          role: editUserRole,
          newPassword: editUserPassword.trim()
        })
      }).catch(() => {});
    }

    if (currentUser && selectedUserToEdit.username === currentUser.username) {
      const updatedSelf = {
        ...currentUser,
        name: editUserName.trim(),
        username: editUserUsername.trim(),
        role: editUserRole,
        password: editUserPassword.trim() || currentUser.password
      };
      setCurrentUser(updatedSelf);
      localStorage.setItem("onu_inventory_current_user", JSON.stringify(updatedSelf));
    }

    setSelectedUserToEdit(null);
    alert("Usuario actualizado correctamente.");
  };

  // RENDER LOGIN SCREEN IF NO SESSION
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-card glass">
          <div className="login-header" style={{ textAlign: "center" }}>
            <img src="/logo-tunqui-red.png" alt="Logo Tunqui" className="tunqui-logo-login" />
            <div className="login-logo" style={{ justifyContent: "center" }}>
              <h2>TUNKITEK</h2>
            </div>
            <p>{!showChangePassword ? "Control de Inventario y Ventas" : "Cambio Seguro de Contraseña"}</p>
          </div>

          {!showChangePassword ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label htmlFor="login-user">Usuario</label>
                <input
                  id="login-user"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Nombre de usuario"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-pass">Contraseña</label>
                <input
                  id="login-pass"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-control"
                  required
                />
              </div>

              {loginError && (
                <p className="text-danger" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={14} /> {loginError}
                </p>
              )}

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "4px" }}>
                Iniciar Sesión
              </button>

              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => { setShowChangePassword(true); setLoginError(""); setCpError(""); setCpSuccess(""); }}
                  style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
                >
                  ¿Deseas cambiar tu contraseña?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label htmlFor="cp-user">Usuario *</label>
                <input
                  id="cp-user"
                  type="text"
                  value={cpUsername}
                  onChange={(e) => setCpUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cp-curr-pass">Contraseña Actual *</label>
                <input
                  id="cp-curr-pass"
                  type="password"
                  value={cpCurrentPassword}
                  onChange={(e) => setCpCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu clave actual"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cp-new-pass">Nueva Contraseña *</label>
                <input
                  id="cp-new-pass"
                  type="password"
                  value={cpNewPassword}
                  onChange={(e) => setCpNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cp-confirm-pass">Confirmar Nueva Contraseña *</label>
                <input
                  id="cp-confirm-pass"
                  type="password"
                  value={cpConfirmPassword}
                  onChange={(e) => setCpConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva clave"
                  className="form-control"
                  required
                />
              </div>

              {cpError && (
                <p className="text-danger" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={14} /> {cpError}
                </p>
              )}

              {cpSuccess && (
                <p className="text-success" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={14} /> {cpSuccess}
                </p>
              )}

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "4px" }}>
                Guardar Nueva Contraseña
              </button>

              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => { setShowChangePassword(false); setCpError(""); setCpSuccess(""); }}
                  style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  ← Volver a Iniciar Sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Sync to LocalStorage on modification
  const updateLocalDB = ({
    newDevices = devices,
    newLots = lots,
    newUsers = users,
    newCustomers = customers,
    newCurrency = currency,
    newCatalog = catalog,
    newLedger = ledger,
    newNonSerialized = nonSerialized,
    newCredits = credits,
    newVendors = vendors
  }) => {
    setDevices(newDevices);
    setLots(newLots);
    setUsers(newUsers);
    setCustomers(newCustomers);
    setCurrency(newCurrency);
    setCatalog(newCatalog);
    setLedger(newLedger);
    setNonSerialized(newNonSerialized);
    setCredits(newCredits);
    setVendors(newVendors);
    
    saveInventory(
      newDevices,
      newLots,
      null, // preset brands not used anymore
      newUsers,
      newCustomers,
      newCurrency,
      newCatalog,
      newLedger,
      newNonSerialized,
      newCredits,
      newVendors
    );
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("onu_inventory_current_user");
    localStorage.removeItem("tunkitek_token");
    setActiveTab("dashboard");
  };

  // Reset/Seed handler
  const handleResetToSeed = () => {
    if (window.confirm("¿Estás seguro de que quieres restablecer los datos de prueba? Esto borrará tus cambios actuales, restaurará marcas, clientes, proveedores, usuarios, catálogo, finanzas y créditos por defecto.")) {
      resetToSeed();
      const { devices: devData, lots: lotData, users: userData, customers: customerData, currency: currencyData, catalog: catalogData, ledger: ledgerData, nonSerialized: nonSerializedData, credits: creditsData, vendors: vendorData } = getInventory();
      setDevices(devData);
      setLots(lotData);
      setUsers(userData || []);
      setCustomers(customerData || []);
      setCurrency(currencyData || "$");
      setCatalog(catalogData || []);
      setLedger(ledgerData || []);
      setNonSerialized(nonSerializedData || []);
      setCredits(creditsData || []);
      setVendors(vendorData || []);
      
      if (catalogData && catalogData.length > 0) {
        setEntradaSelectedProductId(catalogData[0].id);
        const firstNonSerialized = catalogData.find(c => c.controlMethod !== "serialized" && c.type !== "ONU");
        setSalidaSelectedProductId(firstNonSerialized ? firstNonSerialized.id : "");
      }
      alert("Base de datos restablecida con datos semilla.");
      handleLogout();
    }
  };

  // Clear DB completely
  const handleClearDB = () => {
    if (window.confirm("¡ATENCIÓN! Esto borrará permanentemente todo el stock, lotes, ventas, clientes, catálogo, caja, créditos y usuarios. ¿Deseas continuar?")) {
      updateLocalDB({
        newDevices: [],
        newLots: [],
        newUsers: [],
        newCustomers: [],
        newCurrency: "$",
        newCatalog: [],
        newLedger: [],
        newNonSerialized: [],
        newCredits: []
      });
      alert("Base de datos vaciada. Se cerrará la sesión actual.");
      handleLogout();
    }
  };

  // Change currency symbol
  const handleCurrencyChange = (newSym) => {
    updateLocalDB({ newCurrency: newSym });
  };

  // Export database states as JSON backup
  const handleExportJSON = () => {
    const data = {
      devices,
      lots,
      users,
      customers,
      currency,
      catalog,
      ledger,
      nonSerialized
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `tunkitek_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export inventory as CSV spreadsheet
  const handleExportCSV = () => {
    const headers = [
      "Marca",
      "Modelo",
      "Tipo Producto",
      "SN / Serie",
      "MAC Address",
      "Código de Barras",
      "Estado",
      "Costo Compra",
      "Precio Sugerido",
      "Precio Venta Real",
      "Fecha Venta",
      "Cliente",
      "Fecha Registro"
    ];

    const rows = devices.map(d => {
      const product = catalog.find(p => p.id === d.productId);
      const prodType = d.type || (product ? product.type : "ONU");
      return [
        d.brand,
        d.model,
        prodType,
        d.sn,
        d.mac || "",
        d.barcode || "",
        d.status,
        d.purchasePrice.toFixed(2),
        d.salePrice.toFixed(2),
        d.soldPrice ? d.soldPrice.toFixed(2) : "",
        d.soldDate || "",
        d.soldTo || "",
        d.dateAdded
      ];
    });

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `tunkitek_inventario_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import database states from JSON backup file
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        const newDevs = parsed.devices || [];
        const newLots = parsed.lots || [];
        const newUsers = parsed.users || [];
        const newCusts = parsed.customers || [];
        const newCurrency = parsed.currency || "$";
        const newCatalog = parsed.catalog || [];
        const newLedger = parsed.ledger || [];
        const newNonSerialized = parsed.nonSerialized || [];

        updateLocalDB({
          newDevices: newDevs,
          newLots: newLots,
          newUsers: newUsers,
          newCustomers: newCusts,
          newCurrency: newCurrency,
          newCatalog: newCatalog,
          newLedger: newLedger,
          newNonSerialized: newNonSerialized
        });

        alert("¡Copia de seguridad importada con éxito!");
        window.location.reload();
      } catch (err) {
        alert("Error al importar el archivo. Asegúrate de que sea un respaldo JSON de TUNKITEK válido.");
      }
    };
    fileReader.readAsText(file);
  };

  // User Management
  const handleAddUser = (e) => {
    e.preventDefault();
    const username = newUsername.trim().toLowerCase();
    const password = newPassword;
    const name = newName.trim();
    
    if (!username || !password || !name) {
      alert("Todos los campos del usuario son obligatorios.");
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username)) {
      alert("El nombre de usuario ya existe.");
      return;
    }

    const newUser = { id: `usr-${Date.now()}`, username, password, name, role: newRole };
    const updatedUsers = [...users, newUser];
    updateLocalDB({ newUsers: updatedUsers });

    fetch(API_URL + "/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    }).catch(err => console.error("Error al guardar usuario en MySQL:", err));

    setNewUsername("");
    setNewPassword("");
    setNewName("");
    setNewRole("Almacenero");
    alert(`Usuario "${name}" registrado con éxito.`);
  };

  const handleDeleteUser = (usernameToDelete) => {
    if (usernameToDelete === currentUser.username) {
      alert("No puedes eliminar a tu propio usuario.");
      return;
    }
    if (window.confirm(`¿Seguro que deseas eliminar al usuario "${usernameToDelete}"?`)) {
      const userObj = users.find(u => u.username === usernameToDelete);
      const updatedUsers = users.filter(u => u.username !== usernameToDelete);
      updateLocalDB({ newUsers: updatedUsers });

      if (userObj && userObj.id) {
        fetch(`${API_URL}/api/users/${userObj.id}`, { method: "DELETE" }).catch(() => {});
      }
      alert("Usuario eliminado.");
    }
  };

  // Catalog Management (Admin only)
  const handleAddProduct = (e) => {
    e.preventDefault();
    const name = addProdName.trim();
    const brand = addProdBrand.trim();
    const typeStr = addProdType.trim();
    
    if (!name || !brand || !typeStr) {
      alert("Nombre/Modelo, Marca y Tipo son campos obligatorios.");
      return;
    }

    if (catalog.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert("Ya existe un producto registrado con este nombre en el catálogo.");
      return;
    }

    const newProd = {
      id: `prod-${Date.now()}`,
      name,
      brand,
      type: typeStr,
      controlMethod: addProdControlMethod,
      description: addProdDesc.trim(),
      minStockAlert: parseInt(addProdMinAlert) || 2
    };

    const updatedCatalog = [...catalog, newProd];
    
    let updatedNonSerialized = [...nonSerialized];
    if (addProdControlMethod !== "serialized") {
      updatedNonSerialized.push({ productId: newProd.id, qtyAvailable: 0 });
    }

    updateLocalDB({
      newCatalog: updatedCatalog,
      newNonSerialized: updatedNonSerialized
    });

    fetch(API_URL + "/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProd)
    }).catch(err => console.error("Error al guardar producto en MySQL:", err));

    setAddProdName("");
    setAddProdBrand("");
    setAddProdType("");
    setAddProdControlMethod("serialized");
    setAddProdDesc("");
    setAddProdMinAlert("2");
    alert(`Producto "${name}" agregado al catálogo con éxito.`);
    
    if (entradaSelectedProductId === "") {
      setEntradaSelectedProductId(newProd.id);
    }
  };

  const handleStartEditingProduct = (prod) => {
    setEditProdName(prod.name);
    setEditProdBrand(prod.brand);
    setEditProdType(prod.type);
    setEditProdControlMethod(prod.controlMethod || (prod.type === "ONU" ? "serialized" : "quantity"));
    setEditProdDesc(prod.description || "");
    setEditProdMinAlert(String(prod.minStockAlert));
    setSelectedProduct(prod);
    setIsEditingProduct(true);
  };

  const handleEditProductSubmit = (e) => {
    e.preventDefault();
    const typeStr = editProdType.trim();
    if (!editProdName.trim() || !editProdBrand.trim() || !typeStr) {
      alert("Nombre, Marca y Tipo son obligatorios.");
      return;
    }

    const updatedProd = {
      ...selectedProduct,
      name: editProdName.trim(),
      brand: editProdBrand.trim(),
      type: typeStr,
      controlMethod: editProdControlMethod,
      description: editProdDesc.trim(),
      minStockAlert: parseInt(editProdMinAlert) || 2
    };

    const isNowSerialized = editProdControlMethod === "serialized";
    const wasSerialized = selectedProduct.controlMethod === "serialized" || selectedProduct.type === "ONU";

    let updatedNonSerialized = [...nonSerialized];
    if (isNowSerialized && !wasSerialized) {
      updatedNonSerialized = updatedNonSerialized.filter(n => n.productId !== selectedProduct.id);
    } else if (!isNowSerialized && wasSerialized) {
      if (!updatedNonSerialized.some(n => n.productId === selectedProduct.id)) {
        updatedNonSerialized.push({ productId: selectedProduct.id, qtyAvailable: 0 });
      }
    }

    // Propagate brand, model, and type updates to all matching devices in physical inventory
    const updatedDevices = devices.map(d => {
      if (d.productId === selectedProduct.id) {
        return {
          ...d,
          brand: updatedProd.brand,
          model: updatedProd.name,
          type: updatedProd.type
        };
      }
      return d;
    });

    const updatedCatalog = catalog.map(p => p.id === selectedProduct.id ? updatedProd : p);
    updateLocalDB({
      newCatalog: updatedCatalog,
      newNonSerialized: updatedNonSerialized,
      newDevices: updatedDevices
    });

    fetch(`${API_URL}/api/catalog/${selectedProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProd)
    }).catch(err => console.error("Error al editar producto en MySQL:", err));

    setSelectedProduct(null);
    setIsEditingProduct(false);
    alert("Producto actualizado correctamente en el catálogo e inventario.");
  };

  const handleDeleteProduct = (id, name) => {
    const associatedDevices = devices.filter(d => d.productId === id);
    const associatedLots = lots.filter(l => l.productId === id);
    const hasItems = associatedDevices.length > 0 || associatedLots.length > 0;

    let confirmMsg = `¿Seguro que deseas eliminar "${name}" del catálogo de productos?`;
    if (hasItems) {
      confirmMsg = `El producto "${name}" tiene ${associatedDevices.length} equipo(s) en inventario y ${associatedLots.length} lote(s) de compra registrados.\n\n¿Estás seguro de eliminarlo? Esta acción eliminará también todos sus equipos e historial de stock asociados.`;
    }

    if (window.confirm(confirmMsg)) {
      const updatedCatalog = catalog.filter(p => p.id !== id);
      const updatedNonSerialized = nonSerialized.filter(n => n.productId !== id);
      const updatedDevices = devices.filter(d => d.productId !== id);
      const updatedLots = lots.filter(l => l.productId !== id);

      updateLocalDB({
        newCatalog: updatedCatalog,
        newNonSerialized: updatedNonSerialized,
        newDevices: updatedDevices,
        newLots: updatedLots
      });

      fetch(`${API_URL}/api/catalog/${id}`, { method: "DELETE" }).catch(err => console.error("Error al eliminar producto en MySQL:", err));
      alert(`Producto "${name}" y sus registros asociados fueron eliminados del catálogo e inventario.`);
    }
  };

  // Customer Management Handlers
  const handleAddCustomer = (e) => {
    e.preventDefault();
    const name = addCustName.trim();
    if (!name) {
      alert("Nombres o Razón Social es obligatorio.");
      return;
    }

    const cleanDoc = addCustDocId.trim();
    if (cleanDoc) {
      const onlyNumbers = /^\d+$/.test(cleanDoc);
      if (!onlyNumbers) {
        alert("El número de DNI o RUC debe contener únicamente dígitos numéricos.");
        return;
      }
      if (cleanDoc.length !== 8 && cleanDoc.length !== 11) {
        alert("El documento no es válido. El DNI debe tener exactamente 8 dígitos y el RUC debe tener 11 dígitos.");
        return;
      }
    }

    const newCust = {
      id: `cust-${Date.now()}`,
      name,
      phone: addCustPhone.trim(),
      email: addCustEmail.trim(),
      address: addCustAddress.trim(),
      docId: cleanDoc,
      dateAdded: getFormattedDateTime()
    };

    const updated = [...customers, newCust];
    updateLocalDB({ newCustomers: updated });

    fetch(API_URL + "/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCust)
    }).catch(err => console.error("Error al guardar cliente en MySQL:", err));

    setAddCustName("");
    setAddCustPhone("");
    setAddCustEmail("");
    setAddCustAddress("");
    setAddCustDocId("");
    alert(`Cliente "${name}" registrado correctamente.`);
  };

  const handleStartEditingCustomer = (cust) => {
    setEditCustName(cust.name);
    setEditCustPhone(cust.phone || "");
    setEditCustEmail(cust.email || "");
    setEditCustAddress(cust.address || "");
    setEditCustDocId(cust.docId || "");
    setSelectedCustomer(cust);
    setIsEditingCustomer(true);
  };

  const handleEditCustomerSubmit = (e) => {
    e.preventDefault();
    const name = editCustName.trim();
    if (!name) {
      alert("Nombres o Razón Social es obligatorio.");
      return;
    }

    const cleanDoc = editCustDocId.trim();
    if (cleanDoc) {
      const onlyNumbers = /^\d+$/.test(cleanDoc);
      if (!onlyNumbers) {
        alert("El número de DNI o RUC debe contener únicamente dígitos numéricos.");
        return;
      }
      if (cleanDoc.length !== 8 && cleanDoc.length !== 11) {
        alert("El documento no es válido. El DNI debe tener exactamente 8 dígitos y el RUC debe tener 11 dígitos.");
        return;
      }
    }

    const updatedCust = {
      ...selectedCustomer,
      name,
      phone: editCustPhone.trim(),
      email: editCustEmail.trim(),
      address: editCustAddress.trim(),
      docId: cleanDoc
    };

    const updatedList = customers.map(c => c.id === selectedCustomer.id ? updatedCust : c);
    updateLocalDB({ newCustomers: updatedList });

    fetch(`${API_URL}/api/customers/${selectedCustomer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCust)
    }).catch(err => console.error("Error al editar cliente en MySQL:", err));

    setSelectedCustomer(null);
    setIsEditingCustomer(false);
    alert("Datos del cliente actualizados correctamente.");
  };

  const handleDeleteCustomer = (id, name) => {
    if (window.confirm(`¿Seguro que deseas eliminar al cliente "${name}"?`)) {
      const updated = customers.filter(c => c.id !== id);
      updateLocalDB({ newCustomers: updated });

      fetch(`${API_URL}/api/customers/${id}`, { method: "DELETE" }).catch(err => console.error("Error al eliminar cliente en MySQL:", err));
      alert("Cliente eliminado.");
    }
  };

  // Vendor Management Handlers
  const handleAddVendor = (e) => {
    e.preventDefault();
    const name = addVendorName.trim();
    const cleanDoc = addVendorDocId.trim();

    if (!name) {
      alert("El nombre o razón social del proveedor es obligatorio.");
      return;
    }

    if (cleanDoc) {
      const onlyNumbers = /^\d+$/.test(cleanDoc);
      if (!onlyNumbers) {
        alert("El documento del proveedor debe contener únicamente números.");
        return;
      }
      if (cleanDoc.length !== 8 && cleanDoc.length !== 11) {
        alert("El documento debe ser un DNI válido de 8 dígitos o un RUC válido de 11 dígitos.");
        return;
      }
    }

    const newVendor = {
      id: `vend-${Date.now()}`,
      name: name,
      docId: cleanDoc,
      contactPerson: addVendorContact.trim(),
      phone: addVendorPhone.trim(),
      email: addVendorEmail.trim(),
      address: addVendorAddress.trim(),
      notes: addVendorNotes.trim()
    };

    const updatedVendors = [...vendors, newVendor];
    updateLocalDB({ newVendors: updatedVendors });

    fetch(API_URL + "/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVendor)
    }).catch(err => console.error("Error al guardar proveedor en MySQL:", err));

    setAddVendorName("");
    setAddVendorDocId("");
    setAddVendorContact("");
    setAddVendorPhone("");
    setAddVendorEmail("");
    setAddVendorAddress("");
    setAddVendorNotes("");
    alert(`Proveedor "${name}" registrado con éxito.`);
  };

  const handleStartEditingVendor = (vend) => {
    setEditVendorName(vend.name || "");
    setEditVendorDocId(vend.docId || "");
    setEditVendorContact(vend.contactPerson || "");
    setEditVendorPhone(vend.phone || "");
    setEditVendorEmail(vend.email || "");
    setEditVendorAddress(vend.address || "");
    setEditVendorNotes(vend.notes || "");
    setSelectedVendor(vend);
    setIsEditingVendor(true);
  };

  const handleEditVendorSubmit = (e) => {
    e.preventDefault();
    const name = editVendorName.trim();
    const cleanDoc = editVendorDocId.trim();

    if (!name) {
      alert("El nombre o razón social del proveedor es obligatorio.");
      return;
    }

    if (cleanDoc) {
      const onlyNumbers = /^\d+$/.test(cleanDoc);
      if (!onlyNumbers) {
        alert("El documento del proveedor debe contener únicamente números.");
        return;
      }
      if (cleanDoc.length !== 8 && cleanDoc.length !== 11) {
        alert("El documento debe ser un DNI de 8 dígitos o un RUC de 11 dígitos.");
        return;
      }
    }

    const updatedVendorObj = {
      id: selectedVendor.id,
      name: name,
      docId: cleanDoc,
      contactPerson: editVendorContact.trim(),
      phone: editVendorPhone.trim(),
      email: editVendorEmail.trim(),
      address: editVendorAddress.trim(),
      notes: editVendorNotes.trim()
    };

    const updatedVendors = vendors.map(v => v.id === selectedVendor.id ? updatedVendorObj : v);

    updateLocalDB({ newVendors: updatedVendors });

    fetch(`${API_URL}/api/vendors/${selectedVendor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedVendorObj)
    }).catch(err => console.error("Error al actualizar proveedor en MySQL:", err));

    setSelectedVendor(null);
    setIsEditingVendor(false);
    alert(`Proveedor "${name}" actualizado con éxito.`);
  };

  const handleDeleteVendor = (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar el proveedor "${name}"?`)) {
      const updatedVendors = vendors.filter(v => v.id !== id);
      updateLocalDB({ newVendors: updatedVendors });

      fetch(`${API_URL}/api/vendors/${id}`, { method: "DELETE" }).catch(() => {});
      alert("Proveedor eliminado con éxito.");
    }
  };

  // Add rows for bulk entrance
  const addEntradaRow = () => {
    setEntradaRows([
      ...entradaRows,
      { id: Date.now(), sn: "", mac: "", barcode: "" }
    ]);
  };

  const removeEntradaRow = (id) => {
    if (entradaRows.length === 1) return;
    setEntradaRows(entradaRows.filter((r) => r.id !== id));
  };

  const handleEntradaRowChange = (id, field, value) => {
    setEntradaRows(
      entradaRows.map((row) => (row.id === id ? { ...row, [field]: value.trim() } : row))
    );
  };

  // Submit Entrada (Purchase Registration)
  const handleEntradaSubmit = (e) => {
    e.preventDefault();

    if (!entradaSelectedProductId) {
      alert("Por favor selecciona un producto del catálogo.");
      return;
    }

    const product = catalog.find(p => p.id === entradaSelectedProductId);
    if (!product) {
      alert("El producto seleccionado no existe en el catálogo.");
      return;
    }

    const cost = parseFloat(entradaPurchasePrice);
    const sale = parseFloat(entradaSalePrice);
    if (isNaN(cost) || isNaN(sale)) {
      alert("Los precios deben ser números válidos.");
      return;
    }

    const currentTimestamp = getFormattedDateTime();
    const lotId = `lot-${Date.now()}`;
    const lotNameStr = entradaLotName.trim() || `Lote ${product.name} ${currentTimestamp}`;
    const isSerialized = product.controlMethod === "serialized" || product.type === "ONU";

    let payloadQty = 1;
    let payloadDevices = [];

    if (isSerialized) {
      const validRows = entradaRows.filter(r => r.sn.trim() !== "");
      if (validRows.length === 0) {
        alert("Ingresa al menos una unidad con su serie (SN).");
        return;
      }

      const newSns = validRows.map(r => r.sn.toLowerCase());
      const duplicatesInNew = newSns.filter((item, index) => newSns.indexOf(item) !== index);
      if (duplicatesInNew.length > 0) {
        alert(`Has ingresado series duplicadas: ${duplicatesInNew.join(", ")}`);
        return;
      }

      const existingSns = devices.map(d => d.sn.toLowerCase());
      const duplicatesInDB = validRows.filter(r => existingSns.includes(r.sn.toLowerCase()));
      if (duplicatesInDB.length > 0) {
        alert(`Los siguientes SNs ya existen en el sistema: ${duplicatesInDB.map(r => r.sn).join(", ")}`);
        return;
      }

      payloadQty = validRows.length;
      payloadDevices = validRows.map((r, idx) => ({
        id: `dev-${Date.now()}-${idx}`,
        brand: product.brand,
        model: product.name.replace(`${product.brand} `, ""),
        sn: r.sn.trim(),
        mac: r.mac.trim(),
        barcode: r.barcode.trim() || r.sn.trim(),
        salePrice: sale
      }));
    } else {
      const qty = parseInt(entradaNonSerializedQty);
      if (isNaN(qty) || qty <= 0) {
        alert("Ingresa una cantidad válida para productos no serializados.");
        return;
      }
      payloadQty = qty;
    }

    const totalCost = cost * payloadQty;
    const initialVal = parseFloat(entradaInitialPayment) || 0;

    if (entradaPaymentCondition === "Credito" && initialVal > totalCost) {
      alert(`La cuota inicial no puede ser mayor al costo total de ${currency}${totalCost.toFixed(2)}.`);
      return;
    }

    const lotPayload = {
      id: lotId,
      name: lotNameStr,
      productId: product.id,
      vendor: entradaVendor.trim() || "Proveedor General",
      purchasePricePerUnit: cost,
      quantity: payloadQty,
      type: product.type,
      devices: payloadDevices,
      paymentCondition: entradaPaymentCondition,
      initialPayment: initialVal,
      salePrice: sale
    };

    fetch(API_URL + "/api/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lotPayload)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al registrar la compra en el servidor.");
        }
        return res.json();
      })
      .then(() => {
        alert(`¡Entrada registrada con éxito! Lote "${lotNameStr}" creado.`);
        
        // Limpiar formulario
        setEntradaPurchasePrice("");
        setEntradaSalePrice("");
        setEntradaLotName("");
        setEntradaVendor("");
        setEntradaNonSerializedQty("");
        setEntradaInitialPayment("0.00");
        setEntradaPaymentCondition("Contado");
        setEntradaReceiptImage(null);
        setEntradaRows([{ id: Date.now(), sn: "", mac: "", barcode: "" }]);
        setActiveTab("inventory");

        // Disparar sincronización inmediata
        fetchServerDB().then(serverData => {
          if (serverData && serverData.catalog) {
            reloadDataFromDB(serverData);
          }
        });
      })
      .catch((err) => {
        console.error("Error en handleEntradaSubmit:", err);
        alert(err.message || "No se pudo registrar la compra en el servidor MySQL.");
      });
  };

  // Add Device to Multi-ONU Salida Cart
  const handleAddDeviceToSalidaCart = (found) => {
    if (!found) return;

    if (found.status === "Vendido") {
      alert(`El equipo con SN "${found.sn}" ya ha sido vendido a ${found.soldTo || "un cliente"}.`);
      return;
    }

    if (found.status === "Defectuoso") {
      alert(`El equipo con SN "${found.sn}" está marcado como DEFECTUOSO.`);
      return;
    }

    if (salidaCartDevices.some(d => d.id === found.id)) {
      alert(`El equipo con SN "${found.sn}" ya está agregado en la lista de esta venta.`);
      return;
    }

    setSalidaCartDevices(prev => [
      ...prev,
      {
        ...found,
        customSalePrice: found.salePrice || 0
      }
    ]);
    setSalidaSearch("");
    setSalidaErrorMsg("");
  };

  const handleRemoveFromSalidaCart = (id) => {
    setSalidaCartDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateCartDevicePrice = (id, newPrice) => {
    setSalidaCartDevices(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, customSalePrice: parseFloat(newPrice) || 0 };
      }
      return d;
    }));
  };

  // Search Device for Salida (Sale of ONU)
  const handleSalidaSearch = (term) => {
    const val = term.trim().toLowerCase();
    if (!val) return;
    
    const found = devices.find(
      (d) =>
        d.sn.toLowerCase() === val ||
        d.mac.replace(/:/g, "").toLowerCase() === val.replace(/:/g, "") ||
        d.barcode.toLowerCase() === val
    );

    if (found) {
      handleAddDeviceToSalidaCart(found);
    } else {
      setSalidaErrorMsg(`Dispositivo "${term}" no encontrado en inventario disponible.`);
    }
  };

  // Submit Salida (Record Sale of ONU or Other)
  const handleSalidaSubmit = (e) => {
    e.preventDefault();

    let finalClientName = "";
    if (salidaClientMode === "select") {
      if (!salidaSelectedCustomerId) {
        alert("Por favor selecciona un cliente.");
        return;
      }
      const selected = customers.find(c => c.id === salidaSelectedCustomerId);
      finalClientName = selected ? selected.name : "Cliente General";
    } else {
      if (!salidaManualClient.trim()) {
        alert("Escribe el nombre del cliente.");
        return;
      }
      finalClientName = salidaManualClient.trim();
    }

    const currentTimestamp = getFormattedDateTime();

    if (salidaMode === "onu") {
      if (salidaCartDevices.length === 0) {
        alert("Agrega al menos un equipo ONU a la lista de despacho.");
        return;
      }

      const totalSaleVal = salidaCartDevices.reduce((sum, d) => sum + (d.customSalePrice || 0), 0);
      if (totalSaleVal <= 0) {
        alert("El monto total de la venta debe ser mayor a 0.");
        return;
      }

      const cartDeviceIds = salidaCartDevices.map(d => d.id);
      const snListStr = salidaCartDevices.map(d => d.sn).join(", ");

      const updatedDevices = devices.map((d) => {
        if (cartDeviceIds.includes(d.id)) {
          const cartItem = salidaCartDevices.find(ci => ci.id === d.id);
          return {
            ...d,
            status: "Vendido",
            soldPrice: cartItem ? cartItem.customSalePrice : d.salePrice,
            soldDate: currentTimestamp,
            soldTo: finalClientName
          };
        }
        return d;
      });

      let updatedCredits = [...credits];
      let updatedLedger = [...ledger];

      const itemSummary = salidaCartDevices.length === 1
        ? `${salidaCartDevices[0].brand} ${salidaCartDevices[0].model} (${salidaCartDevices[0].sn})`
        : `${salidaCartDevices.length} Equipos ONUs (SNs: ${snListStr})`;

      if (salidaPaymentCondition === "Credito") {
        const inicialVal = parseFloat(salidaInitialPayment) || 0;
        if (inicialVal > totalSaleVal) {
          alert(`La cuota inicial no puede ser mayor al precio total de venta de ${currency}${totalSaleVal.toFixed(2)}.`);
          return;
        }
        const balance = Math.max(0, totalSaleVal - inicialVal);
        const newCredit = {
          id: `cred-${Date.now()}`,
          type: "Cobrar",
          clientOrVendor: finalClientName,
          totalAmount: totalSaleVal,
          paidAmount: inicialVal,
          balance: balance,
          status: balance <= 0.001 ? "Pagado" : "Pendiente",
          date: currentTimestamp,
          description: `Venta a Crédito: ${itemSummary} - ${finalClientName}`,
          payments: inicialVal > 0 ? [
            {
              id: `pay-${Date.now()}`,
              date: currentTimestamp,
              amount: inicialVal,
              paymentMethod: "Efectivo",
              receiptImage: salidaReceiptImage || null,
              note: "Cuota inicial en la venta"
            }
          ] : []
        };

        updatedCredits.push(newCredit);

        if (inicialVal > 0) {
          updatedLedger.push({
            id: `tx-${Date.now()}`,
            type: "Ingreso",
            category: "Venta",
            description: `Venta a Crédito (Cuota Inicial): ${itemSummary} - ${finalClientName}`,
            amount: inicialVal,
            date: currentTimestamp
          });
        }
      } else {
        // Contado
        updatedLedger.push({
          id: `tx-${Date.now()}`,
          type: "Ingreso",
          category: "Venta",
          description: `Venta ${itemSummary} - ${finalClientName}`,
          amount: totalSaleVal,
          date: currentTimestamp
        });
      }

      updateLocalDB({
        newDevices: updatedDevices,
        newLedger: updatedLedger,
        newCredits: updatedCredits
      });

      fetch(API_URL + '/api/devices/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartDevices: salidaCartDevices,
          customerId: salidaSelectedCustomerId,
          customerName: finalClientName,
          paymentCondition: salidaPaymentCondition,
          initialPayment: salidaInitialPayment,
          receiptUrl: salidaReceiptImage
        })
      }).catch(err => console.error("Error guardando venta en MySQL:", err));

      setSalidaSuccessMsg(`¡Venta de ${salidaCartDevices.length} equipo(s) a ${finalClientName} registrada con éxito!`);
      setSalidaSearch("");
      setSalidaCartDevices([]);
      setSalidaManualClient("");
      setSalidaInitialPayment("0.00");
      setSalidaPaymentCondition("Contado");
      setSalidaReceiptImage(null);
      setTimeout(() => setSalidaSuccessMsg(""), 5000);
      setActiveTab("inventory");
      return;
    } else {
      if (!salidaSelectedProductId) {
        alert("Selecciona un producto.");
        return;
      }

      const product = catalog.find(p => p.id === salidaSelectedProductId);
      if (!product) {
        alert("Producto no válido.");
        return;
      }

      const qtyToSell = parseInt(salidaQty);
      const priceUnitVal = parseFloat(salidaPriceUnit);

      if (isNaN(qtyToSell) || qtyToSell <= 0) {
        alert("Ingresa una cantidad a vender válida.");
        return;
      }

      if (isNaN(priceUnitVal) || priceUnitVal <= 0) {
        alert("Ingresa un precio unitario de venta válido.");
        return;
      }

      const currentStockItem = nonSerialized.find(n => n.productId === product.id);
      const currentStockQty = currentStockItem ? currentStockItem.qtyAvailable : 0;

      if (qtyToSell > currentStockQty) {
        alert(`No hay stock suficiente. Solo hay ${currentStockQty} unidades disponibles.`);
        return;
      }

      const updatedNonSerialized = nonSerialized.map(n => {
        if (n.productId === product.id) {
          return { ...n, qtyAvailable: n.qtyAvailable - qtyToSell };
        }
        return n;
      });

      const totalSale = priceUnitVal * qtyToSell;

      if (salidaPaymentCondition === "Credito") {
        const inicialVal = parseFloat(salidaInitialPayment) || 0;
        if (inicialVal > totalSale) {
          alert(`La cuota inicial no puede ser mayor al precio total de ${currency}${totalSale.toFixed(2)}.`);
          return;
        }
        const balance = Math.max(0, totalSale - inicialVal);
        const newCredit = {
          id: `cred-${Date.now()}`,
          type: "Cobrar",
          clientOrVendor: finalClientName,
          totalAmount: totalSale,
          paidAmount: inicialVal,
          balance: balance,
          status: balance <= 0.001 ? "Pagado" : "Pendiente",
          date: currentTimestamp,
          description: `Venta a Crédito: ${qtyToSell} ${product.name} - ${finalClientName}`,
          payments: inicialVal > 0 ? [
            {
              id: `pay-${Date.now()}`,
              date: currentTimestamp,
              amount: inicialVal,
              paymentMethod: "Efectivo",
              receiptImage: salidaReceiptImage || null,
              note: "Cuota inicial en la venta"
            }
          ] : []
        };

        const updatedCredits = [...credits, newCredit];
        const updatedLedger = inicialVal > 0 ? [
          ...ledger,
          {
            id: `tx-${Date.now()}`,
            type: "Ingreso",
            category: "Venta",
            description: `Venta a Crédito (Cuota Inicial): ${qtyToSell} ${product.name} - ${finalClientName}`,
            amount: inicialVal,
            date: currentTimestamp
          }
        ] : ledger;

        updateLocalDB({
          newNonSerialized: updatedNonSerialized,
          newLedger: updatedLedger,
          newCredits: updatedCredits
        });

        setSalidaSuccessMsg(`¡Venta registrada a CRÉDITO a ${finalClientName}! Saldo por cobrar: ${currency}${balance.toFixed(2)}.`);
        setSalidaQty("");
        setSalidaInitialPayment("0.00");
        setSalidaPaymentCondition("Contado");
        setSalidaReceiptImage(null);
        return;
      }

      const newTx = {
        id: `tx-${Date.now()}`,
        type: "Ingreso",
        category: "Venta",
        description: `Venta: ${qtyToSell} ${product.name} - ${finalClientName}`,
        amount: totalSale,
        date: currentTimestamp
      };

      updateLocalDB({
        newNonSerialized: updatedNonSerialized,
        newLedger: [...ledger, newTx]
      });

      setSalidaSuccessMsg(`¡Venta registrada! ${qtyToSell} ${product.name} vendidos por ${currency}${totalSale}.`);

      setSalidaQty("");
      setSalidaInitialPayment("0.00");
      setSalidaPaymentCondition("Contado");
      setSalidaReceiptImage(null);
    }
  };

  // Submit Credit Payment (Abono)
  const handleSaveAbono = (e) => {
    e.preventDefault();
    if (!selectedCreditForPayment) return;

    const amountVal = parseFloat(abonoAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Ingresa un monto de abono válido mayor a cero.");
      return;
    }

    if (amountVal > selectedCreditForPayment.balance + 0.001) {
      alert(`El abono no puede superar el saldo pendiente de ${currency}${selectedCreditForPayment.balance.toFixed(2)}.`);
      return;
    }

    const currentTimestamp = getFormattedDateTime();
    const newPayment = {
      id: `pay-${Date.now()}`,
      date: currentTimestamp,
      amount: amountVal,
      paymentMethod: abonoMethod || "Yape",
      receiptImage: abonoImage || null,
      note: abonoNote.trim() || (selectedCreditForPayment.type === "Cobrar" ? "Abono a cuenta por cobrar" : "Abono a cuenta por pagar")
    };

    const newPaidAmount = selectedCreditForPayment.paidAmount + amountVal;
    const newBalance = Math.max(0, selectedCreditForPayment.totalAmount - newPaidAmount);
    const newStatus = newBalance <= 0.001 ? "Pagado" : "Pendiente";

    const updatedCredit = {
      ...selectedCreditForPayment,
      paidAmount: newPaidAmount,
      balance: newBalance,
      status: newStatus,
      payments: [...(selectedCreditForPayment.payments || []), newPayment]
    };

    const updatedCredits = credits.map(c => c.id === selectedCreditForPayment.id ? updatedCredit : c);

    const isCobrar = selectedCreditForPayment.type === "Cobrar";
    const newLedgerTx = {
      id: `tx-${Date.now()}`,
      type: isCobrar ? "Ingreso" : "Egreso",
      category: isCobrar ? "Venta" : "Compra",
      description: isCobrar
        ? `Abono de Crédito (${abonoMethod}): ${selectedCreditForPayment.clientOrVendor} - ${selectedCreditForPayment.description}`
        : `Pago de Crédito (${abonoMethod}): ${selectedCreditForPayment.clientOrVendor} - ${selectedCreditForPayment.description}`,
      amount: amountVal,
      date: currentTimestamp
    };

    updateLocalDB({
      newCredits: updatedCredits,
      newLedger: [...ledger, newLedgerTx]
    });

    setSelectedCreditForPayment(null);
    setAbonoAmount("");
    setAbonoImage(null);
    setAbonoNote("");
    alert(`¡Abono de ${currency}${amountVal.toFixed(2)} registrado correctamente!`);
  };

  const handleDeleteCredit = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro de crédito?")) {
      const updated = credits.filter(c => c.id !== id);
      updateLocalDB({ newCredits: updated });
      alert("Registro de crédito eliminado.");
    }
  };

  const clearSalidaForm = () => {
    setSalidaSelectedCustomerId("");
    setSalidaManualClient("");
    setTimeout(() => setSalidaSuccessMsg(""), 5000);
  };

  // Submit System Branding Customization (Configuración Tab - Admin only)
  const handleSaveBrandingSettings = (e) => {
    e.preventDefault();
    const name = editAppName.trim();
    if (!name) {
      alert("El nombre del sistema no puede estar vacío.");
      return;
    }

    const newLogo = editAppLogo || appLogo;
    const newSettings = {
      appName: name,
      appSubtitle: editAppSubtitle.trim(),
      appLogo: newLogo
    };

    setAppName(newSettings.appName);
    setAppSubtitle(newSettings.appSubtitle);
    setAppLogo(newSettings.appLogo);
    document.title = `${newSettings.appName} - ${newSettings.appSubtitle}`;

    fetch(API_URL + "/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings)
    }).then(res => res.json())
      .then(() => alert("¡Nombre y logo del sistema actualizados correctamente!"))
      .catch(err => console.error("Error guardando ajustes en MySQL:", err));
  };

  // Add custom manual Expense (Caja/Finanzas tab - Admin only)
  const handleAddExpense = (e) => {
    e.preventDefault();
    const desc = expenseDesc.trim();
    const amt = parseFloat(expenseAmount);

    if (!desc || isNaN(amt) || amt <= 0) {
      alert("Descripción y monto válido son requeridos.");
      return;
    }

    const currentTimestamp = getFormattedDateTime();
    const newTx = {
      id: `tx-${Date.now()}`,
      type: "Egreso",
      category: expenseCategory,
      description: desc,
      amount: amt,
      date: currentTimestamp
    };

    updateLocalDB({ newLedger: [...ledger, newTx] });

    setExpenseDesc("");
    setExpenseAmount("");
    alert(`Gasto "${desc}" por ${currency}${amt} registrado en caja.`);
  };

  const handleDeleteLedgerTx = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta transacción del historial de caja?")) {
      const updatedLedger = ledger.filter(tx => tx.id !== id);
      updateLocalDB({ newLedger: updatedLedger });
      alert("Transacción eliminada.");
    }
  };

  // Get current stock helper
  const getProductStock = (product) => {
    const isSerialized = product.controlMethod === "serialized" || product.type === "ONU";
    if (isSerialized) {
      return devices.filter(d => d.productId === product.id && d.status === "Disponible").length;
    } else {
      return nonSerialized.find(n => n.productId === product.id)?.qtyAvailable || 0;
    }
  };

  // Sync pricing defaults when changing product in Entrada/Salida
  const handleEntradaProductChange = (prodId) => {
    setEntradaSelectedProductId(prodId);
    const productLots = lots.filter(l => l.productId === prodId);
    if (productLots.length > 0) {
      const lastLot = productLots[productLots.length - 1];
      setEntradaPurchasePrice(String(lastLot.purchasePricePerUnit));
    } else {
      setEntradaPurchasePrice("");
    }
    setEntradaSalePrice("");
  };

  const handleSalidaProductChange = (prodId) => {
    setSalidaSelectedProductId(prodId);
    setSalidaPriceUnit("");
  };

  // Edit Mode Initializer (Device)
  const handleStartEditing = () => {
    setEditBrand(selectedDevice.brand);
    setEditModel(selectedDevice.model);
    setEditSn(selectedDevice.sn);
    setEditMac(selectedDevice.mac);
    setEditBarcode(selectedDevice.barcode || selectedDevice.sn);
    setEditPurchasePrice(selectedDevice.purchasePrice);
    setEditSalePrice(selectedDevice.salePrice);
    setEditStatus(selectedDevice.status);
    setEditSoldTo(selectedDevice.soldTo || "");
    setEditSoldPrice(selectedDevice.soldPrice || "");
    setEditSoldDate(selectedDevice.soldDate || "");
    setEditDateAdded(selectedDevice.dateAdded || "");
    setIsEditingDevice(true);
  };

  // Submit Device Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();

    const selectedBrand = editBrand.trim();
    if (!selectedBrand) {
      alert("Por favor indica la marca.");
      return;
    }

    if (!editModel.trim()) {
      alert("El modelo no puede estar vacío.");
      return;
    }

    if (!editSn.trim()) {
      alert("El SN/Serie es obligatorio.");
      return;
    }

    const cost = parseFloat(editPurchasePrice);
    const sale = parseFloat(editSalePrice);
    if (isNaN(cost) || isNaN(sale)) {
      alert("Los precios deben ser números válidos.");
      return;
    }

    const duplicate = devices.find(d => d.id !== selectedDevice.id && d.sn.toLowerCase() === editSn.trim().toLowerCase());
    if (duplicate) {
      alert("El SN ya está registrado en otro equipo.");
      return;
    }

    const isNowSold = editStatus === "Vendido";
    const updatedDevice = {
      ...selectedDevice,
      brand: selectedBrand,
      model: editModel.trim(),
      sn: editSn.trim(),
      mac: editMac.trim(),
      barcode: editBarcode.trim() || editSn.trim(),
      purchasePrice: cost,
      salePrice: sale,
      status: editStatus,
      soldTo: isNowSold ? editSoldTo.trim() || "Cliente General" : null,
      soldPrice: isNowSold ? parseFloat(editSoldPrice) || sale : null,
      soldDate: isNowSold ? editSoldDate.trim() || getFormattedDateTime() : null,
      dateAdded: editDateAdded.trim() || selectedDevice.dateAdded
    };

    const updatedList = devices.map(d => d.id === selectedDevice.id ? updatedDevice : d);
    updateLocalDB({ newDevices: updatedList });

    fetch(`${API_URL}/api/devices/${selectedDevice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDevice)
    }).catch(err => console.error("Error al guardar cambios de equipo en MySQL:", err));
    
    setSelectedDevice(updatedDevice);
    setIsEditingDevice(false);
    alert("Equipo actualizado correctamente.");
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este dispositivo del inventario de forma permanente?")) {
      const updatedList = devices.filter(d => d.id !== id);
      updateLocalDB({ newDevices: updatedList });

      fetch(`${API_URL}/api/devices/${id}`, { method: "DELETE" }).catch(() => {});
      setSelectedDevice(null);
      alert("Equipo eliminado del inventario.");
    }
  };

  const handleMarkStatus = (id, newStatus) => {
    const updated = devices.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: newStatus,
          soldTo: newStatus === "Vendido" ? d.soldTo || "Cliente General" : null,
          soldPrice: newStatus === "Vendido" ? d.soldPrice || d.salePrice : null,
          soldDate: newStatus === "Vendido" ? d.soldDate || getFormattedDateTime() : null
        };
      }
      return d;
    });

    updateLocalDB({ newDevices: updated });
    const found = updated.find(d => d.id === id);
    if (found) {
      setSelectedDevice(found);
      fetch(`${API_URL}/api/devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(found)
      }).catch(() => {});
    }
    alert(`Estado de equipo actualizado a: ${newStatus}`);
  };

  const openScanner = (target) => {
    setScannerTarget(target);
    setScannerActive(true);
  };

  const handleScanSuccess = (decodedText) => {
    setScannerActive(false);
    const cleanedText = decodedText.trim();
    if (!cleanedText) return;

    if (scannerTarget === "salida-search") {
      setSalidaSearch(cleanedText);
      handleSalidaSearch(cleanedText);
    } else if (scannerTarget === "edit-sn") {
      setEditSn(cleanedText.toUpperCase());
    } else if (scannerTarget === "edit-mac") {
      setEditMac(cleanedText.toUpperCase());
    } else if (scannerTarget === "edit-barcode") {
      setEditBarcode(cleanedText);
    } else if (scannerTarget.startsWith("entrada-sn-")) {
      const rowId = parseInt(scannerTarget.split("-")[2]);
      handleEntradaRowChange(rowId, "sn", cleanedText.toUpperCase());
    } else if (scannerTarget.startsWith("entrada-mac-")) {
      const rowId = parseInt(scannerTarget.split("-")[2]);
      handleEntradaRowChange(rowId, "mac", cleanedText.toUpperCase());
    }
  };

  // Financial calculations (Garantizando parsing a Number desde MySQL)
  const totalFinancialIncome = (ledger || []).filter(tx => tx.type === "Ingreso").reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const totalFinancialPurchases = (ledger || []).filter(tx => tx.type === "Egreso" && tx.category === "Compra").reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const totalFinancialOtherExpenses = (ledger || []).filter(tx => tx.type === "Egreso" && tx.category !== "Compra").reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const totalFinancialBalance = Number(totalFinancialIncome) - Number(totalFinancialPurchases) - Number(totalFinancialOtherExpenses);

  // Filtered Ledger list
  const filteredLedger = ledger.filter(tx => {
    const term = ledgerSearch.toLowerCase();
    const matchesSearch = tx.description.toLowerCase().includes(term) || tx.category.toLowerCase().includes(term);
    const matchesCategory = ledgerFilterCategory === "" || tx.category === ledgerFilterCategory || (ledgerFilterCategory === "Gasto" && tx.type === "Egreso" && tx.category !== "Compra");
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Filtered devices list
  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.sn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mac.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.type && d.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.barcode && d.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.soldTo && d.soldTo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand = filterBrand === "" || d.brand === filterBrand;
    const matchesStatus = filterStatus === "" || d.status === filterStatus;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  // Filtered non-serialized (by quantity) products list
  const filteredNonSerializedProducts = catalog.filter(p => {
    const isQty = p.controlMethod === "quantity" || (p.controlMethod !== "serialized" && p.type !== "ONU");
    if (!isQty) return false;

    const stockVal = getProductStock(p);
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand = filterBrand === "" || p.brand === filterBrand;

    let matchesStatus = true;
    if (filterStatus === "Disponible") matchesStatus = stockVal > 0;
    else if (filterStatus === "Vendido") matchesStatus = false;
    else if (filterStatus === "Defectuoso") matchesStatus = false;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  const filteredCustomers = customers.filter((c) => {
    const term = customerSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      (c.docId && c.docId.toLowerCase().includes(term))
    );
  });

  const filteredVendors = (vendors || []).filter((v) => {
    const term = vendorSearchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(term)) ||
      (v.phone && v.phone.toLowerCase().includes(term)) ||
      (v.email && v.email.toLowerCase().includes(term)) ||
      (v.address && v.address.toLowerCase().includes(term)) ||
      (v.docId && v.docId.toLowerCase().includes(term)) ||
      (v.notes && v.notes.toLowerCase().includes(term))
    );
  });

  // Unique Brands dynamically derived from catalog
  const uniqueBrands = Array.from(new Set(catalog.map(p => p.brand).filter(Boolean)));

  // Stock count metrics
  const availableCount = devices.filter((d) => d.status === "Disponible").length;
  const soldCount = devices.filter((d) => d.status === "Vendido").length;
  const defectiveCount = devices.filter((d) => d.status === "Defectuoso").length;
  const totalStock = devices.length;

  // Brands Stock count
  const brandMetrics = {};
  uniqueBrands.forEach(b => {
    brandMetrics[b] = { count: 0, sold: 0 };
  });
  devices.forEach(d => {
    if (!brandMetrics[d.brand]) {
      brandMetrics[d.brand] = { count: 0, sold: 0 };
    }
    if (d.status === "Disponible") {
      brandMetrics[d.brand].count++;
    } else if (d.status === "Vendido") {
      brandMetrics[d.brand].sold++;
    }
  });

  const maxBrandCount = Math.max(...Object.values(brandMetrics).map(m => m.count + m.sold), 1);

  return (
    <div className="app-container">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="sidebar glass" style={{ position: "relative", overflow: "hidden" }}>
        <img src="/logo-tunqui-monochrome.png" alt="Marca de Agua Tunqui" className="tunqui-logo-watermark" />
        <div className="sidebar-logo">
          <img src={appLogo} alt="Logo" className="tunqui-logo-sidebar" style={{ maxHeight: "40px", objectFit: "contain" }} />
          <span>{appName}</span>
        </div>
        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`sidebar-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab("catalog")}
            className={`sidebar-nav-item ${activeTab === "catalog" ? "active" : ""}`}
          >
            <Bookmark size={20} />
            Catálogo
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`sidebar-nav-item ${activeTab === "inventory" ? "active" : ""}`}
          >
            <Package size={20} />
            Ver Inventario
          </button>

          {!isAlmacenero && (
            <button
              onClick={() => setActiveTab("customers")}
              className={`sidebar-nav-item ${activeTab === "customers" ? "active" : ""}`}
            >
              <Users size={20} />
              Clientes
            </button>
          )}

          {!isAlmacenero && (
            <button
              onClick={() => setActiveTab("vendors")}
              className={`sidebar-nav-item ${activeTab === "vendors" ? "active" : ""}`}
            >
              <Truck size={20} />
              Proveedores
            </button>
          )}

          {!isEncargado && (
            <button
              onClick={() => setActiveTab("entrada")}
              className={`sidebar-nav-item ${activeTab === "entrada" ? "active" : ""}`}
            >
              <PlusCircle size={20} />
              Entrada (Compra)
            </button>
          )}

          {!isAlmacenero && (
            <button
              onClick={() => setActiveTab("salida")}
              className={`sidebar-nav-item ${activeTab === "salida" ? "active" : ""}`}
            >
              <MinusCircle size={20} />
              Salida (Venta)
            </button>
          )}

          {!isAlmacenero && (
            <button
              onClick={() => setActiveTab("credits")}
              className={`sidebar-nav-item ${activeTab === "credits" ? "active" : ""}`}
            >
              <CreditCard size={20} />
              Créditos / Cuentas
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("finance")}
              className={`sidebar-nav-item ${activeTab === "finance" ? "active" : ""}`}
            >
              <Briefcase size={20} />
              Caja / Finanzas
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("users")}
              className={`sidebar-nav-item ${activeTab === "users" ? "active" : ""}`}
            >
              <UserPlus size={20} />
              Usuarios
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("ajustes")}
              className={`sidebar-nav-item ${activeTab === "ajustes" ? "active" : ""}`}
            >
              <Settings size={20} />
              Configuración
            </button>
          )}
        </nav>

        {/* User profile footer */}
        <div className="user-profile-badge">
          <div className="user-profile-avatar">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-profile-details">
            <span className="user-profile-name" title={currentUser.name}>{currentUser.name}</span>
            <span className="user-profile-role">{currentUser.role}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ marginLeft: "auto", padding: "6px" }} title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV FOR MOBILE */}
      <nav className="bottom-nav">
        <button
          onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
        >
          <LayoutDashboard size={20} />
          Panel
        </button>
        <button
          onClick={() => { setActiveTab("catalog"); setMobileMenuOpen(false); }}
          className={`nav-item ${activeTab === "catalog" ? "active" : ""}`}
        >
          <Bookmark size={20} />
          Catálogo
        </button>
        <button
          onClick={() => { setActiveTab("inventory"); setMobileMenuOpen(false); }}
          className={`nav-item ${activeTab === "inventory" ? "active" : ""}`}
        >
          <Package size={20} />
          Stock
        </button>

        {isAlmacenero ? (
          <button
            onClick={() => { setActiveTab("entrada"); setMobileMenuOpen(false); }}
            className={`nav-item ${activeTab === "entrada" ? "active" : ""}`}
          >
            <PlusCircle size={20} />
            Compra
          </button>
        ) : (
          <button
            onClick={() => { setActiveTab("salida"); setMobileMenuOpen(false); }}
            className={`nav-item ${activeTab === "salida" ? "active" : ""}`}
          >
            <MinusCircle size={20} />
            Venta
          </button>
        )}

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`nav-item ${mobileMenuOpen ? "active" : ""}`}
        >
          <Menu size={20} />
          Menú
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* MOBILE HEADER USER BAR */}
        <div className="mobile-header-bar glass">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src={appLogo} alt="Logo" className="tunqui-logo-mobile" style={{ maxHeight: "30px", objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>{appName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{currentUser.name} ({currentUser.role})</span>
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Control de Inventario</h1>
                <p className="view-subtitle">Sesión iniciada como: <strong>{currentUser.name} ({currentUser.role})</strong></p>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="stats-grid">
              <div className="stat-card glass">
                <div className="stat-header">
                  <span>DISPONIBLES</span>
                  <Package size={16} />
                </div>
                <div className="stat-value text-primary">{availableCount}</div>
                <div className="stat-footer text-muted">Equipos listos para despacho</div>
              </div>

              <div className="stat-card glass">
                <div className="stat-header">
                  <span>EGRESOS COMPRAS</span>
                  <DollarSign size={16} />
                </div>
                {isAdmin ? (
                  <div className="stat-value text-danger">{currency}{totalFinancialPurchases.toFixed(2)}</div>
                ) : (
                  <div className="restricted-info-badge">
                    <Lock size={12} /> Restringido
                  </div>
                )}
                <div className="stat-footer text-muted">Total invertido en mercancía</div>
              </div>

              <div className="stat-card glass">
                <div className="stat-header">
                  <span>VENTAS COBRADAS</span>
                  <TrendingUp size={16} />
                </div>
                {!isAlmacenero ? (
                  <div className="stat-value text-success">{currency}{totalFinancialIncome.toFixed(2)}</div>
                ) : (
                  <div className="restricted-info-badge">
                    <Lock size={12} /> Restringido
                  </div>
                )}
                <div className="stat-footer text-muted">Ingresos totales de caja</div>
              </div>

              <div className="stat-card glass">
                <div className="stat-header">
                  <span>BALANCE NETO CAJA</span>
                  <DollarSign size={16} />
                </div>
                {isAdmin ? (
                  <div className={`stat-value ${totalFinancialBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {currency}{totalFinancialBalance.toFixed(2)}
                  </div>
                ) : (
                  <div className="restricted-info-badge">
                    <Lock size={12} /> Restringido
                  </div>
                )}
                <div className="stat-footer text-muted">Ingresos - Egresos - Gastos</div>
              </div>
            </div>

            {/* Graphic breakdown sections */}
            <div className="dashboard-sections">
              
              <div className="dashboard-panel glass">
                <div className="panel-header">
                  <span className="panel-title">Distribución de Equipos en Stock</span>
                  <span className="badge badge-warning">Activo</span>
                </div>
                <div className="simple-bar-chart">
                  {Object.entries(brandMetrics).map(([brand, metrics]) => {
                    const totalForBrand = metrics.count + metrics.sold;
                    if (totalForBrand === 0) return null;
                    const fillPercentage = (totalForBrand / maxBrandCount) * 100;
                    
                    return (
                      <div className="bar-row" key={brand}>
                        <div className="bar-label">{brand}</div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                        <div className="bar-value">
                          {metrics.count}{" "}
                          <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            {!isAlmacenero ? `(${metrics.sold} v)` : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {devices.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                      No hay equipos registrados para graficar.
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-panel glass">
                <div className="panel-header">
                  <span className="panel-title">Estado Físico de Equipos</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="detail-row">
                    <span className="detail-label">Disponible (Para ventas)</span>
                    <span className="detail-value text-primary">{availableCount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vendido (Salida realizada)</span>
                    <span className="detail-value text-success">{soldCount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Defectuoso (Dañado/Garantía)</span>
                    <span className="detail-value text-danger">{defectiveCount}</span>
                  </div>
                  <div className="detail-row" style={{ marginTop: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                    <span className="detail-label">Porcentaje de Venta</span>
                    <span className="detail-value">
                      {totalStock > 0 ? `${((soldCount / totalStock) * 100).toFixed(0)}%` : "0%"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* CATALOG / PRODUCTOS TAB */}
        {activeTab === "catalog" && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Catálogo de Productos</h1>
                <p className="view-subtitle">Definición de productos, categorías y métodos de control del catálogo</p>
              </div>
            </div>

            <div className="dashboard-sections">
              
              <div className="dashboard-panel glass" style={{ gridColumn: "1 / -1" }}>
                <div className="panel-header">
                  <span className="panel-title">Listado del Catálogo</span>
                  <span className="badge badge-success">{catalog.length} Items</span>
                </div>

                <div className="table-wrapper glass desktop-table-view">
                  <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Categoría / Tipo</th>
                        <th>Control</th>
                        <th>Marca</th>
                        <th>Nombre / Modelo</th>
                        <th>Stock Actual</th>
                        <th>Mínimo Alerta</th>
                        <th>Descripción</th>
                        {canManageCatalog && <th>Acción</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {catalog.map(prod => {
                        const stockVal = getProductStock(prod);
                        const isUnderStock = stockVal <= prod.minStockAlert;
                        const controlStr = prod.controlMethod === "serialized" || prod.type === "ONU" ? "Serializado" : "Por Cantidad";
                        return (
                          <tr key={prod.id}>
                            <td>
                              <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", textTransform: "none" }}>
                                {prod.type}
                              </span>
                            </td>
                            <td style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{controlStr}</td>
                            <td style={{ fontWeight: 700 }}>{prod.brand}</td>
                            <td style={{ fontWeight: 600, color: "var(--color-text-bright)" }}>{prod.name}</td>
                            <td>
                              <strong className={isUnderStock ? "text-danger animate-pulse" : "text-primary"}>
                                {stockVal}
                              </strong>
                              {isUnderStock && <span style={{ fontSize: "0.7rem", color: "var(--color-danger)", marginLeft: "6px" }}>¡Stock Bajo!</span>}
                            </td>
                            <td>{prod.minStockAlert}</td>
                            <td style={{ whiteSpace: "normal", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{prod.description || "-"}</td>
                            {canManageCatalog && (
                              <td>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button onClick={() => handleStartEditingProduct(prod)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                                    <Edit2 size={12} />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(prod.id, prod.name)} className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {catalog.length === 0 && (
                        <tr>
                          <td colSpan={canManageCatalog ? "8" : "7"} style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                            No hay productos registrados en el catálogo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Catalog view */}
                <div className="mobile-card-list">
                  {catalog.map(prod => {
                    const stockVal = getProductStock(prod);
                    const isUnderStock = stockVal <= prod.minStockAlert;
                    const controlStr = prod.controlMethod === "serialized" || prod.type === "ONU" ? "Serializado" : "Por Cantidad";
                    return (
                      <div key={prod.id} className="mobile-row-card glass" style={{ padding: "14px" }}>
                        <div className="card-header-row">
                          <div>
                            <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", textTransform: "none", marginRight: "6px", fontSize: "0.65rem", padding: "2px 6px" }}>
                              {prod.type}
                            </span>
                            <span className="card-brand-model">{prod.brand} - {prod.name}</span>
                          </div>
                          {canManageCatalog && (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => handleStartEditingProduct(prod)} className="btn btn-secondary btn-sm" style={{ padding: "6px" }}>
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id, prod.name)} className="btn btn-danger btn-sm" style={{ padding: "6px" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "8px 0" }}>
                          {prod.description || "Sin descripción"}
                        </div>

                        <div className="card-footer-row" style={{ marginTop: "4px" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                            Control: <strong style={{ color: "var(--color-text-bright)" }}>{controlStr}</strong>
                          </span>
                          <span>
                            Stock: <strong className={isUnderStock ? "text-danger animate-pulse" : "text-primary"}>
                              {stockVal}
                            </strong> / {prod.minStockAlert}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {catalog.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                      No hay productos registrados en el catálogo.
                    </div>
                  )}
                </div>
              </div>

              {canManageCatalog && (
                <div className="dashboard-panel glass" style={{ gridColumn: "1 / -1" }}>
                  <div className="panel-header">
                    <span className="panel-title">Registrar Nuevo Producto al Catálogo</span>
                  </div>

                  <form onSubmit={handleAddProduct}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Tipo / Categoría de Producto *</label>
                        <input
                          type="text"
                          placeholder="Ej. ONU, Router, Bobina, Caja NAP, Splitter"
                          value={addProdType}
                          onChange={(e) => setAddProdType(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Método de Control de Stock *</label>
                        <select
                          value={addProdControlMethod}
                          onChange={(e) => setAddProdControlMethod(e.target.value)}
                          className="form-control"
                        >
                          <option value="serialized">Serializado (Cada unidad tiene SN y MAC únicos)</option>
                          <option value="quantity">Por Cantidad (Control de stock simple por unidades)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Marca *</label>
                        <input
                          type="text"
                          placeholder="Ej. ZTE, Huawei, TP-Link"
                          value={addProdBrand}
                          onChange={(e) => setAddProdBrand(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Nombre / Modelo del Producto *</label>
                        <input
                          type="text"
                          placeholder="Ej. Archer C50, F670L Dual Band, Bobina Cat6 Outdoor"
                          value={addProdName}
                          onChange={(e) => setAddProdName(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Stock Mínimo de Alerta *</label>
                        <input
                          type="number"
                          value={addProdMinAlert}
                          onChange={(e) => setAddProdMinAlert(e.target.value)}
                          className="form-control"
                          min="0"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Descripción / Observación</label>
                        <input
                          type="text"
                          placeholder="Especificaciones técnicas rápidas..."
                          value={addProdDesc}
                          onChange={(e) => setAddProdDesc(e.target.value)}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "10px" }}>
                      Agregar Producto al Catálogo
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === "inventory" && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Inventario General de Stock</h1>
                <p className="view-subtitle">Consulta de existencias físicas tanto para productos serializados como por cantidad</p>
              </div>
            </div>

            {/* Sub-tabs toggle for Serialized vs Quantity products */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button
                onClick={() => setInventoryMode("serialized")}
                className={`btn ${inventoryMode === "serialized" ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: "8px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Package size={16} /> Serializados (SN/MAC) ({filteredDevices.length})
              </button>
              <button
                onClick={() => setInventoryMode("quantity")}
                className={`btn ${inventoryMode === "quantity" ? "btn-primary" : "btn-secondary"}`}
                style={{ borderRadius: "8px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Layers size={16} /> Por Cantidad ({filteredNonSerializedProducts.length})
              </button>
            </div>

            <div className="filters-panel glass">
              <div className="form-group" style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  placeholder="Buscar por Marca, Modelo, Tipo, SN o MAC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: "36px" }}
                />
              </div>

              <div className="form-group">
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="form-control"
                >
                  <option value="">Todas las marcas</option>
                  {uniqueBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="">Todos los estados</option>
                  <option value="Disponible">Disponible / En Stock</option>
                  {inventoryMode === "serialized" && <option value="Vendido">Vendido</option>}
                  {inventoryMode === "serialized" && <option value="Defectuoso">Defectuoso</option>}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Se encontraron {inventoryMode === "serialized" ? filteredDevices.length : filteredNonSerializedProducts.length} registros.
            </div>

            {/* SERIALIZED PRODUCTS VIEW */}
            {inventoryMode === "serialized" && (
              <>
                <div className="table-wrapper glass desktop-table-view">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>SN / Serie</th>
                        <th>MAC Address</th>
                        <th>Estado</th>
                        {!isAlmacenero && <th>Costo</th>}
                        <th>Registro</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDevices.map((d) => (
                        <tr key={d.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedDevice(d); setIsEditingDevice(false); }}>
                          <td>
                            <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", textTransform: "none" }}>
                              {d.type || catalog.find(p => p.id === d.productId)?.type || "ONU"}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{d.brand}</td>
                          <td>{d.model}</td>
                          <td style={{ fontFamily: "monospace", color: "var(--color-text-bright)" }}>{d.sn}</td>
                          <td style={{ fontFamily: "monospace" }}>{d.mac || "-"}</td>
                          <td>
                            <span className={`badge ${d.status === 'Disponible' ? 'badge-success' : d.status === 'Vendido' ? 'badge-warning' : 'badge-danger'}`}>
                              {d.status}
                            </span>
                          </td>
                          {!isAlmacenero && (
                            <td>
                              {isAdmin ? `${currency}${(Number(d.purchasePrice) || 0).toFixed(2)}` : <Lock size={12} className="text-warning" />}
                            </td>
                          )}
                          <td style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{formatShortDate(d.dateAdded)}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setSelectedDevice(d); setIsEditingDevice(false); }} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                              <Info size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredDevices.length === 0 && (
                        <tr>
                          <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)" }}>
                            Ningún equipo serializado coincide con los filtros.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-card-list">
                  {filteredDevices.map((d) => (
                    <div
                      key={d.id}
                      className="mobile-row-card glass glass-interactive"
                      onClick={() => { setSelectedDevice(d); setIsEditingDevice(false); }}
                    >
                      <div className="card-header-row">
                        <div>
                          <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", textTransform: "none", marginRight: "6px", fontSize: "0.65rem", padding: "2px 6px" }}>
                            {d.type || catalog.find(p => p.id === d.productId)?.type || "ONU"}
                          </span>
                          <span className="card-brand-model">{d.brand} - {d.model}</span>
                        </div>
                        <span className={`badge ${d.status === 'Disponible' ? 'badge-success' : d.status === 'Vendido' ? 'badge-warning' : 'badge-danger'}`}>
                          {d.status}
                        </span>
                      </div>
                      <div className="card-sn-mac">
                        <div>SN: {d.sn}</div>
                        {d.mac && <div>MAC: {d.mac}</div>}
                        <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>Reg: {formatShortDate(d.dateAdded)}</div>
                      </div>
                      <div className="card-footer-row">
                        <span style={{ color: "var(--color-text-muted)" }}>
                          Costo: <strong style={{ color: "var(--color-text-bright)" }}>{isAdmin ? `${currency}${(Number(d.purchasePrice) || 0).toFixed(2)}` : "[Restringido]"}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredDevices.length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)" }}>
                      Ningún equipo coincide con los filtros.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* QUANTITY PRODUCTS VIEW */}
            {inventoryMode === "quantity" && (
              <>
                <div className="table-wrapper glass desktop-table-view">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Categoría / Tipo</th>
                        <th>Marca</th>
                        <th>Nombre / Modelo</th>
                        <th>Stock Disponible</th>
                        <th>Mínimo Alerta</th>
                        <th>Estado de Stock</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNonSerializedProducts.map(prod => {
                        const stockVal = getProductStock(prod);
                        const isLow = stockVal <= prod.minStockAlert;
                        const isOut = stockVal === 0;
                        return (
                          <tr key={prod.id}>
                            <td>
                              <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", textTransform: "none" }}>
                                {prod.type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }}>{prod.brand}</td>
                            <td style={{ fontWeight: 600, color: "var(--color-text-bright)" }}>{prod.name}</td>
                            <td>
                              <strong style={{ fontSize: "1.05rem" }} className={isOut ? "text-danger" : isLow ? "text-warning animate-pulse" : "text-success"}>
                                {stockVal}
                              </strong>
                            </td>
                            <td>{prod.minStockAlert}</td>
                            <td>
                              {isOut ? (
                                <span className="badge badge-danger">Agotado</span>
                              ) : isLow ? (
                                <span className="badge badge-warning animate-pulse">¡Stock Bajo!</span>
                              ) : (
                                <span className="badge badge-success">Suficiente</span>
                              )}
                            </td>
                            <td style={{ whiteSpace: "normal", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                              {prod.description || "-"}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredNonSerializedProducts.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)" }}>
                            No se encontraron productos por cantidad en el inventario.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mobile-card-list">
                  {filteredNonSerializedProducts.map(prod => {
                    const stockVal = getProductStock(prod);
                    const isLow = stockVal <= prod.minStockAlert;
                    const isOut = stockVal === 0;
                    return (
                      <div key={prod.id} className="mobile-row-card glass" style={{ padding: "14px" }}>
                        <div className="card-header-row">
                          <div>
                            <span className="badge" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", textTransform: "none", marginRight: "6px", fontSize: "0.65rem", padding: "2px 6px" }}>
                              {prod.type}
                            </span>
                            <span className="card-brand-model">{prod.brand} - {prod.name}</span>
                          </div>
                          {isOut ? (
                            <span className="badge badge-danger">Agotado</span>
                          ) : isLow ? (
                            <span className="badge badge-warning animate-pulse">¡Stock Bajo!</span>
                          ) : (
                            <span className="badge badge-success">Suficiente</span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "8px 0" }}>
                          {prod.description || "Sin descripción"}
                        </div>

                        <div className="card-footer-row" style={{ marginTop: "4px" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                            Mínimo Alerta: <strong>{prod.minStockAlert}</strong>
                          </span>
                          <span style={{ fontSize: "0.9rem" }}>
                            Stock: <strong className={isOut ? "text-danger" : isLow ? "text-warning animate-pulse" : "text-success"}>
                              {stockVal}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredNonSerializedProducts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)" }}>
                      No se encontraron productos por cantidad en el inventario.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && !isAlmacenero && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Base de Datos de Clientes</h1>
                <p className="view-subtitle">Gestiona la agenda de clientes y técnicos que adquieren los equipos</p>
              </div>
            </div>

            <div className="filters-panel glass">
              <div className="form-group" style={{ position: "relative", width: "100%", margin: 0 }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  placeholder="Buscar clientes por nombre, teléfono, DNI o RUC..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Se encontraron {filteredCustomers.length} clientes.
            </div>

            <div className="table-wrapper glass desktop-table-view">
              <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th>Nombres o Razón Social</th>
                    <th>DNI o RUC</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Dirección</th>
                    <th>Registro</th>
                    {isAdmin && <th>Acción</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: "var(--color-text-bright)" }}>{c.name}</td>
                      <td>{c.docId || "-"}</td>
                      <td>{c.phone || "-"}</td>
                      <td>{c.email || "-"}</td>
                      <td style={{ whiteSpace: "normal", maxWidth: "200px" }}>{c.address || "-"}</td>
                      <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{c.dateAdded}</td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => handleStartEditingCustomer(c)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? "7" : "6"} style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                        No se encontraron clientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View for Clientes */}
            <div className="mobile-card-list">
              {filteredCustomers.map(c => (
                <div key={c.id} className="mobile-row-card glass" style={{ padding: "14px" }}>
                  <div className="card-header-row">
                    <div>
                      <strong style={{ fontSize: "1rem", color: "var(--color-text-bright)", display: "block" }}>{c.name}</strong>
                      {c.docId && (
                        <span className="badge" style={{ marginTop: "4px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", fontSize: "0.7rem", textTransform: "none" }}>
                          {c.docId.length === 8 ? "DNI: " : c.docId.length === 11 ? "RUC: " : "Doc: "}{c.docId}
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleStartEditingCustomer(c)} className="btn btn-secondary btn-sm" style={{ padding: "6px" }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteCustomer(c.id, c.name)} className="btn btn-danger btn-sm" style={{ padding: "6px" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "8px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {c.phone && <div><strong>Tel:</strong> {c.phone}</div>}
                    {c.email && <div><strong>Email:</strong> {c.email}</div>}
                    {c.address && <div><strong>Dirección:</strong> {c.address}</div>}
                  </div>

                  <div className="card-footer-row" style={{ marginTop: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Registrado: {c.dateAdded}
                    </span>
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                  No se encontraron clientes.
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="dashboard-panel glass" style={{ marginTop: "24px" }}>
                <div className="panel-header">
                  <span className="panel-title">Agregar Nuevo Cliente (Solo Admin)</span>
                </div>
                
                <form onSubmit={handleAddCustomer}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombres o Razón Social *</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez Ramos o Servicios SAC"
                        value={addCustName}
                        onChange={(e) => setAddCustName(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>DNI o RUC</label>
                      <input
                        type="text"
                        placeholder="8 dígitos (DNI) o 11 dígitos (RUC)"
                        maxLength={11}
                        value={addCustDocId}
                        onChange={(e) => setAddCustDocId(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono de Contacto</label>
                      <input
                        type="text"
                        placeholder="Ej. +51 987 654 321"
                        value={addCustPhone}
                        onChange={(e) => setAddCustPhone(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="cliente@email.com"
                        value={addCustEmail}
                        onChange={(e) => setAddCustEmail(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Dirección / Ubicación</label>
                    <input
                      type="text"
                      placeholder="Av. Los Pinos 456, Lima"
                      value={addCustAddress}
                      onChange={(e) => setAddCustAddress(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "10px" }}>
                    Registrar Cliente
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === "vendors" && !isAlmacenero && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Gestión de Proveedores</h1>
                <p className="view-subtitle">Directorio de proveedores y distribuidores mayoristas de equipos y materiales</p>
              </div>
            </div>

            <div className="filters-panel glass">
              <div className="form-group" style={{ position: "relative", width: "100%", margin: 0 }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  placeholder="Buscar proveedores por razón social, contacto, RUC, teléfono..."
                  value={vendorSearchQuery}
                  onChange={(e) => setVendorSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Se encontraron {filteredVendors.length} proveedores.
            </div>

            {/* Desktop Table View */}
            <div className="table-wrapper glass desktop-table-view">
              <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th>Nombres o Razón Social</th>
                    <th>DNI o RUC</th>
                    <th>Persona de Contacto</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Dirección</th>
                    <th>Lotes / Deuda</th>
                    {isAdmin && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map(v => {
                    const lotCount = lots.filter(l => l.vendor?.toLowerCase() === v.name.toLowerCase()).length;
                    const pendingDebt = credits
                      .filter(c => c.type === "Pagar" && c.status === "Pendiente" && c.clientOrVendor?.toLowerCase() === v.name.toLowerCase())
                      .reduce((acc, curr) => acc + curr.balance, 0);

                    return (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600, color: "var(--color-text-bright)" }}>
                          {v.name}
                          {v.notes && (
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "normal" }}>
                              {v.notes}
                            </div>
                          )}
                        </td>
                        <td>{v.docId || "-"}</td>
                        <td>{v.contactPerson || "-"}</td>
                        <td>{v.phone || "-"}</td>
                        <td>{v.email || "-"}</td>
                        <td style={{ whiteSpace: "normal", maxWidth: "200px" }}>{v.address || "-"}</td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.75rem" }}>
                            <span>{lotCount} lotes comprados</span>
                            {pendingDebt > 0 ? (
                              <span style={{ color: "var(--color-danger)", fontWeight: "bold" }}>
                                Deuda: {currency}{pendingDebt.toFixed(2)}
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-success)" }}>Al día</span>
                            )}
                          </div>
                        </td>
                        {isAdmin && (
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => handleStartEditingVendor(v)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => handleDeleteVendor(v.id, v.name)} className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredVendors.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? "8" : "7"} style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                        No se encontraron proveedores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="mobile-card-list">
              {filteredVendors.map(v => {
                const lotCount = lots.filter(l => l.vendor?.toLowerCase() === v.name.toLowerCase()).length;
                const pendingDebt = credits
                  .filter(c => c.type === "Pagar" && c.status === "Pendiente" && c.clientOrVendor?.toLowerCase() === v.name.toLowerCase())
                  .reduce((acc, curr) => acc + curr.balance, 0);

                return (
                  <div key={v.id} className="mobile-row-card glass" style={{ padding: "14px" }}>
                    <div className="card-header-row">
                      <div>
                        <strong style={{ fontSize: "1rem", color: "var(--color-text-bright)", display: "block" }}>{v.name}</strong>
                        {v.docId && (
                          <span className="badge" style={{ marginTop: "4px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", fontSize: "0.7rem", textTransform: "none" }}>
                            {v.docId.length === 8 ? "DNI: " : v.docId.length === 11 ? "RUC: " : "Doc: "}{v.docId}
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => handleStartEditingVendor(v)} className="btn btn-secondary btn-sm" style={{ padding: "6px" }}>
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteVendor(v.id, v.name)} className="btn btn-danger btn-sm" style={{ padding: "6px" }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "8px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                      {v.contactPerson && <div><strong>Contacto:</strong> {v.contactPerson}</div>}
                      {v.phone && <div><strong>Tel:</strong> {v.phone}</div>}
                      {v.email && <div><strong>Email:</strong> {v.email}</div>}
                      {v.address && <div><strong>Dirección:</strong> {v.address}</div>}
                      {v.notes && <div><strong>Nota:</strong> {v.notes}</div>}
                    </div>

                    <div className="card-footer-row" style={{ marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{lotCount} lotes comprados</span>
                      {pendingDebt > 0 ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-danger)", fontWeight: "bold" }}>
                          Deuda: {currency}{pendingDebt.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>Al día</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredVendors.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                  No se encontraron proveedores.
                </div>
              )}
            </div>

            {/* Add Vendor Form */}
            <div className="dashboard-panel glass" style={{ marginTop: "24px" }}>
              <div className="panel-header">
                <span className="panel-title">Registrar Nuevo Proveedor</span>
              </div>
                
                <form onSubmit={handleAddVendor}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombres o Razón Social *</label>
                      <input
                        type="text"
                        placeholder="Ej. Distribuidor Mayorista FiberTech S.A.C."
                        value={addVendorName}
                        onChange={(e) => setAddVendorName(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>DNI o RUC (Opcional)</label>
                      <input
                        type="text"
                        placeholder="8 dígitos (DNI) o 11 dígitos (RUC)"
                        maxLength={11}
                        value={addVendorDocId}
                        onChange={(e) => setAddVendorDocId(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Persona de Contacto</label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez (Ejecutivo de Ventas)"
                        value={addVendorContact}
                        onChange={(e) => setAddVendorContact(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono de Contacto</label>
                      <input
                        type="text"
                        placeholder="Ej. +51 987 654 321"
                        value={addVendorPhone}
                        onChange={(e) => setAddVendorPhone(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="ventas@proveedor.com"
                        value={addVendorEmail}
                        onChange={(e) => setAddVendorEmail(e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Dirección / Ubicación</label>
                      <input
                        type="text"
                        placeholder="Av. Argentina 1450, Lima"
                        value={addVendorAddress}
                        onChange={(e) => setAddVendorAddress(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notas u Observaciones</label>
                    <input
                      type="text"
                      placeholder="Ej. Distribuidor exclusivo de ONUs ZTE, envíos a provincia..."
                      value={addVendorNotes}
                      onChange={(e) => setAddVendorNotes(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "10px" }}>
                    Registrar Proveedor
                  </button>
                </form>
              </div>
          </div>
        )}

        {/* ENTRADA TAB */}
        {activeTab === "entrada" && !isEncargado && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Registro de Entrada (Compra)</h1>
                <p className="view-subtitle">Ingresa compras de mercancía al almacén vinculándolas con un producto del catálogo</p>
              </div>
            </div>

            <form onSubmit={handleEntradaSubmit} className="glass" style={{ padding: "20px" }}>
              <h3 style={{ marginBottom: "16px", color: "var(--color-text-bright)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} className="text-primary" /> Datos del Producto y Lote
              </h3>

              {catalog.length === 0 ? (
                <div className="glass text-warning" style={{ padding: "16px", background: "rgba(245,158,11,0.08)" }}>
                  <AlertTriangle size={18} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px" }} />
                  <span>Primero debes registrar productos en la pestaña de <strong>Catálogo</strong> para poder ingresar mercadería al almacén.</span>
                </div>
              ) : (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="entrada-select-product">Selecciona el Producto del Catálogo *</label>
                      <select
                        id="entrada-select-product"
                        value={entradaSelectedProductId}
                        onChange={(e) => handleEntradaProductChange(e.target.value)}
                        className="form-control"
                        required
                      >
                        {catalog.map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.type}] {p.brand} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="entrada-lot-name">Nombre / Identificador de Compra</label>
                      <input
                        id="entrada-lot-name"
                        type="text"
                        placeholder="Ej. Importación Routers ZTE"
                        value={entradaLotName}
                        onChange={(e) => setEntradaLotName(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="entrada-cost">Costo de Compra Unitario ({currency}) *</label>
                      <input
                        id="entrada-cost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={entradaPurchasePrice}
                        onChange={(e) => setEntradaPurchasePrice(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="entrada-sale">Precio de Venta Sugerido Unitario ({currency}) *</label>
                      <input
                        id="entrada-sale"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={entradaSalePrice}
                        onChange={(e) => setEntradaSalePrice(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="entrada-vendor">Proveedor / Distribuidor (Opcional)</label>
                    {vendors.length > 0 ? (
                      <div className="form-row" style={{ gap: "10px" }}>
                        <select
                          id="entrada-vendor-select"
                          value={vendors.some(v => v.name === entradaVendor) ? entradaVendor : ""}
                          onChange={(e) => { if (e.target.value) setEntradaVendor(e.target.value); }}
                          className="form-control"
                        >
                          <option value="">-- Seleccionar de la lista de Proveedores --</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                        <input
                          id="entrada-vendor"
                          type="text"
                          placeholder="O escribe nombre del proveedor..."
                          value={entradaVendor}
                          onChange={(e) => setEntradaVendor(e.target.value)}
                          className="form-control"
                        />
                      </div>
                    ) : (
                      <input
                        id="entrada-vendor"
                        type="text"
                        placeholder="Ej. Distribuidor Mayorista FiberTech S.A.C."
                        value={entradaVendor}
                        onChange={(e) => setEntradaVendor(e.target.value)}
                        className="form-control"
                      />
                    )}
                  </div>

                  {/* CONDITIONAL RENDER BY PRODUCT CONTROL METHOD */}
                  {(() => {
                    const currentProd = catalog.find(p => p.id === entradaSelectedProductId);
                    const isCurrentSerialized = currentProd?.controlMethod === "serialized" || currentProd?.type === "ONU";
                    
                    if (isCurrentSerialized) {
                      return (
                        <div>
                          <h3 style={{ margin: "24px 0 12px 0", color: "var(--color-text-bright)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Barcode size={18} className="text-primary" /> Identificación Física del Equipo (SN y MAC)
                          </h3>
                          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "12px" }}>
                            Los productos serializados requieren ingresar Series (SN) y direcciones MAC únicas.
                          </p>

                          <div className="multiple-entries">
                            {entradaRows.map((row, index) => (
                              <div className="entry-row" key={row.id}>
                                <span className="entry-number">{index + 1}</span>
                                
                                <div className="entry-input input-with-button">
                                  <input
                                    type="text"
                                    placeholder="Número de Serie (SN) *"
                                    value={row.sn}
                                    onChange={(e) => handleEntradaRowChange(row.id, "sn", e.target.value.toUpperCase())}
                                    className="form-control"
                                    style={{ fontFamily: "monospace" }}
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => openScanner(`entrada-sn-${row.id}`)}
                                    className="btn btn-secondary"
                                    style={{ padding: "10px" }}
                                  >
                                    <Scan size={16} />
                                  </button>
                                </div>

                                <div className="entry-input input-with-button">
                                  <input
                                    type="text"
                                    placeholder="MAC Address (Opcional)"
                                    value={row.mac}
                                    onChange={(e) => handleEntradaRowChange(row.id, "mac", e.target.value.toUpperCase())}
                                    className="form-control"
                                    style={{ fontFamily: "monospace" }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => openScanner(`entrada-mac-${row.id}`)}
                                    className="btn btn-secondary"
                                    style={{ padding: "10px" }}
                                  >
                                    <Scan size={16} />
                                  </button>
                                </div>

                                {entradaRows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEntradaRow(row.id)}
                                    className="btn btn-danger"
                                    style={{ padding: "10px" }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                            <button type="button" onClick={addEntradaRow} className="btn btn-secondary">
                              + Agregar Otra Unidad
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div style={{ marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                          <h3 style={{ marginBottom: "12px", color: "var(--color-text-bright)" }}>Cantidad de Unidades</h3>
                          <div className="form-group" style={{ maxWidth: "250px" }}>
                            <label htmlFor="entrada-qty">Cantidad Ingresada *</label>
                            <input
                              id="entrada-qty"
                              type="number"
                              placeholder="Ej. 50"
                              value={entradaNonSerializedQty}
                              onChange={(e) => setEntradaNonSerializedQty(e.target.value)}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {/* CONDICION Y FORMA DE PAGO EN COMPRA */}
                  <div className="form-group" style={{ marginTop: "16px", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <label style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "12px", display: "block" }}>
                      Condición y Forma de Pago
                    </label>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Condición de Pago *</label>
                        <select
                          value={entradaPaymentCondition}
                          onChange={(e) => setEntradaPaymentCondition(e.target.value)}
                          className="form-control"
                        >
                          <option value="Contado">Contado (Pago Completo Inmediato)</option>
                          <option value="Credito">Crédito (A Plazo / Por Pagar)</option>
                        </select>
                      </div>

                      {entradaPaymentCondition === "Credito" && (
                        <div className="form-group">
                          <label>Cuota Inicial / Abono Inmediato ({currency})</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entradaInitialPayment}
                            onChange={(e) => setEntradaInitialPayment(e.target.value)}
                            className="form-control"
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>

                    {entradaPaymentCondition === "Credito" && (
                      <div className="form-group" style={{ marginTop: "8px" }}>
                        <label>Adjuntar Foto / Captura del Comprobante (Opcional)</label>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <Camera size={16} />
                            <span>{entradaReceiptImage ? "Cambiar Foto" : "Tomar Foto / Subir Imagen"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden-file-input"
                              onChange={(e) => handleImageFileChange(e, setEntradaReceiptImage)}
                            />
                          </label>
                          {entradaReceiptImage && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className="badge badge-success">¡Foto cargada!</span>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setViewingReceiptImage(entradaReceiptImage)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => setEntradaReceiptImage(null)}
                              >
                                Quitar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "10px" }}>
                    Guardar Compra e Incrementar Stock
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* SALIDA TAB */}
        {activeTab === "salida" && !isAlmacenero && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Registro de Salida (Venta/Despacho)</h1>
                <p className="view-subtitle">Despacha equipos serializados por lote/múltiples series o vende cantidades de otros productos</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => { setSalidaMode("onu"); setSalidaCartDevices([]); }}
                className={`btn ${salidaMode === "onu" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
              >
                Vender Serializado (Equipos ONU por Lote / Series)
              </button>
              <button
                type="button"
                onClick={() => { setSalidaMode("other"); setSalidaCartDevices([]); }}
                className={`btn ${salidaMode === "other" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
              >
                Vender por Cantidad (Stock Simple)
              </button>
            </div>

            {salidaMode === "onu" && (
              <div>
                {/* SEARCH & ADD ONUs TO DISPATCH CART */}
                <div className="glass" style={{ padding: "20px", marginBottom: "20px" }}>
                  <h3 style={{ marginBottom: "16px", color: "var(--color-text-bright)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Layers size={18} className="text-primary" /> Agregar Equipos Serializados (ONUs) a la Venta
                  </h3>
                  
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Escanear o buscar por SN, MAC o Código de Barras:</label>
                      <div className="input-with-button">
                        <input
                          type="text"
                          placeholder="Escribe o escanea el SN..."
                          value={salidaSearch}
                          onChange={(e) => setSalidaSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSalidaSearch(salidaSearch);
                            }
                          }}
                          className="form-control"
                          style={{ fontFamily: "monospace" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSalidaSearch(salidaSearch)}
                          className="btn btn-primary"
                          style={{ padding: "8px 14px", gap: "4px" }}
                        >
                          <PlusCircle size={16} />
                          <span>Agregar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openScanner("salida-search")}
                          className="btn btn-secondary"
                          style={{ gap: "6px" }}
                        >
                          <Scan size={18} />
                          <span>Escanear</span>
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>O Seleccionar de Stock Disponible:</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const found = devices.find(d => d.id === e.target.value);
                            if (found) handleAddDeviceToSalidaCart(found);
                            e.target.value = "";
                          }
                        }}
                        className="form-control"
                      >
                        <option value="">-- Seleccionar Equipo Disponible --</option>
                        {devices.filter(d => d.status === "Disponible").map(d => (
                          <option key={d.id} value={d.id}>
                            [{d.brand} {d.model}] SN: {d.sn} ({currency}{d.salePrice.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {salidaErrorMsg && (
                    <p className="text-danger" style={{ fontSize: "0.85rem", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertTriangle size={14} /> {salidaErrorMsg}
                    </p>
                  )}
                </div>

                {/* DISPATCH CART & CHECKOUT FORM */}
                <form onSubmit={handleSalidaSubmit} className="glass" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                    <h3 style={{ margin: 0, color: "var(--color-text-bright)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Package size={18} className="text-primary" /> Lista de Equipos a Despachar
                    </h3>
                    <span className="badge badge-success" style={{ fontSize: "0.85rem" }}>
                      {salidaCartDevices.length} {salidaCartDevices.length === 1 ? "Equipo" : "Equipos"}
                    </span>
                  </div>

                  {salidaCartDevices.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", color: "var(--color-text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px dashed var(--border-color)", marginBottom: "20px" }}>
                      <Package size={32} style={{ opacity: 0.4, marginBottom: "8px" }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>No hay equipos agregados a la venta todavía.</p>
                      <span style={{ fontSize: "0.8rem" }}>Usa el buscador de arriba o el escáner para ir agregando 1 o varios equipos ONU a esta venta.</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: "24px" }}>
                      <div className="table-wrapper glass desktop-table-view" style={{ marginBottom: "12px" }}>
                        <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Marca / Modelo</th>
                              <th>SN / Serie</th>
                              <th>MAC</th>
                              <th>Precio Sugerido</th>
                              <th>Precio Venta ({currency})</th>
                              <th>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {salidaCartDevices.map((item, index) => (
                              <tr key={item.id}>
                                <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                                <td>
                                  <span style={{ fontWeight: 600, color: "var(--color-text-bright)" }}>{item.brand}</span> {item.model}
                                </td>
                                <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>{item.sn}</td>
                                <td style={{ fontFamily: "monospace" }}>{item.mac || "-"}</td>
                                <td>{currency}{item.salePrice?.toFixed(2)}</td>
                                <td style={{ width: "130px" }}>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={item.customSalePrice}
                                    onChange={(e) => handleUpdateCartDevicePrice(item.id, e.target.value)}
                                    className="form-control"
                                    style={{ padding: "4px 8px", fontSize: "0.85rem", fontWeight: "bold" }}
                                    required
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromSalidaCart(item.id)}
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: "4px 8px" }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mobile-card-list">
                        {salidaCartDevices.map((item, index) => (
                          <div key={item.id} className="mobile-row-card glass" style={{ padding: "12px" }}>
                            <div className="card-header-row">
                              <div>
                                <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "bold" }}>Item #{index + 1}</span>
                                <strong style={{ fontSize: "0.95rem", color: "var(--color-text-bright)", display: "block" }}>{item.brand} {item.model}</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromSalidaCart(item.id)}
                                className="btn btn-danger btn-sm"
                                style={{ padding: "6px" }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "6px 0" }}>
                              <div><strong>SN:</strong> <span style={{ fontFamily: "monospace", color: "var(--color-text-bright)" }}>{item.sn}</span></div>
                              {item.mac && <div><strong>MAC:</strong> <span style={{ fontFamily: "monospace" }}>{item.mac}</span></div>}
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: "0.75rem" }}>Precio de Venta Unid. ({currency}):</label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.customSalePrice}
                                onChange={(e) => handleUpdateCartDevicePrice(item.id, e.target.value)}
                                className="form-control"
                                style={{ padding: "6px", fontSize: "0.85rem", fontWeight: "bold" }}
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", padding: "12px 16px", background: "rgba(0, 242, 254, 0.05)", borderRadius: "8px", border: "1px solid var(--border-glow)", marginTop: "12px" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--color-text-bright)" }}>Monto Total de la Venta:</span>
                        <strong style={{ fontSize: "1.25rem", color: "var(--color-primary)" }}>
                          {currency}{salidaCartDevices.reduce((sum, d) => sum + (d.customSalePrice || 0), 0).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  )}

                  {salidaCartDevices.length > 0 && (
                    <div>
                      <h3 style={{ margin: "20px 0 12px 0", color: "var(--color-text-bright)", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                        Datos del Cliente y Facturación
                      </h3>

                      <div className="form-group">
                        <label>Modo de Registro de Cliente</label>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                          <button
                            type="button"
                            onClick={() => setSalidaClientMode("select")}
                            className={`btn ${salidaClientMode === "select" ? "btn-primary" : "btn-secondary"} btn-sm`}
                            style={{ flex: 1 }}
                          >
                            Seleccionar de Agenda
                          </button>
                          <button
                            type="button"
                            onClick={() => setSalidaClientMode("manual")}
                            className={`btn ${salidaClientMode === "manual" ? "btn-primary" : "btn-secondary"} btn-sm`}
                            style={{ flex: 1 }}
                          >
                            Escribir Manualmente
                          </button>
                        </div>
                      </div>

                      {salidaClientMode === "select" ? (
                        <div className="form-group">
                          <label htmlFor="salida-select-customer">Selecciona el Cliente *</label>
                          <select
                            id="salida-select-customer"
                            value={salidaSelectedCustomerId}
                            onChange={(e) => setSalidaSelectedCustomerId(e.target.value)}
                            className="form-control"
                            required
                          >
                            <option value="">-- Seleccionar cliente --</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="form-group">
                          <label htmlFor="salida-manual-customer">Nombre del Cliente / Técnico *</label>
                          <div className="input-with-button">
                            <User size={16} style={{ position: "absolute", marginLeft: "12px", marginTop: "14px", color: "var(--color-text-muted)" }} />
                            <input
                              id="salida-manual-customer"
                              type="text"
                              placeholder="Nombre completo..."
                              value={salidaManualClient}
                              onChange={(e) => setSalidaManualClient(e.target.value)}
                              className="form-control"
                              style={{ paddingLeft: "36px" }}
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div className="form-group" style={{ marginTop: "16px", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        <label style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "12px", display: "block" }}>
                          Condición y Forma de Pago
                        </label>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Condición de Pago *</label>
                            <select
                              value={salidaPaymentCondition}
                              onChange={(e) => setSalidaPaymentCondition(e.target.value)}
                              className="form-control"
                            >
                              <option value="Contado">Contado (Pago Completo Inmediato)</option>
                              <option value="Credito">Crédito (Fiado / Por Cobrar)</option>
                            </select>
                          </div>

                          {salidaPaymentCondition === "Credito" && (
                            <div className="form-group">
                              <label>Cuota Inicial / Abono Inmediato ({currency})</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={salidaInitialPayment}
                                onChange={(e) => setSalidaInitialPayment(e.target.value)}
                                className="form-control"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                        </div>

                        {salidaPaymentCondition === "Credito" && (
                          <div className="form-group" style={{ marginTop: "8px" }}>
                            <label>Adjuntar Foto / Captura del Comprobante (Opcional)</label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <Camera size={16} />
                                <span>{salidaReceiptImage ? "Cambiar Foto" : "Tomar Foto / Subir Imagen"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden-file-input"
                                  onChange={(e) => handleImageFileChange(e, setSalidaReceiptImage)}
                                />
                              </label>
                              {salidaReceiptImage && (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span className="badge badge-success">¡Foto cargada!</span>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setViewingReceiptImage(salidaReceiptImage)}
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => setSalidaReceiptImage(null)}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "16px" }}>
                        Confirmar Venta y Despachar {salidaCartDevices.length} Equipo(s)
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {salidaMode === "other" && (
              <form onSubmit={handleSalidaSubmit} className="glass" style={{ padding: "20px" }}>
                <h3 style={{ marginBottom: "16px", color: "var(--color-text-bright)" }}>Venta de Productos por Cantidad</h3>
                
                {catalog.filter(p => p.controlMethod !== "serialized" && p.type !== "ONU").length === 0 ? (
                  <p className="text-warning">No hay productos controlados por cantidad registrados en el catálogo.</p>
                ) : (
                  <div>
                    <div className="form-group">
                      <label htmlFor="salida-select-other-product">Selecciona el Producto *</label>
                      <select
                        id="salida-select-other-product"
                        value={salidaSelectedProductId}
                        onChange={(e) => handleSalidaProductChange(e.target.value)}
                        className="form-control"
                        required
                      >
                        <option value="">-- Seleccionar producto --</option>
                        {catalog.filter(p => p.controlMethod !== "serialized" && p.type !== "ONU").map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.type}] {p.brand} - {p.name} (Stock: {getProductStock(p)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {salidaSelectedProductId && (
                      <div>
                        <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "16px" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Stock Disponible: </span>
                          <strong className="text-primary">
                            {getProductStock(catalog.find(p => p.id === salidaSelectedProductId))} unidades
                          </strong>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="salida-qty">Cantidad a Vender *</label>
                            <input
                              id="salida-qty"
                              type="number"
                              placeholder="Ej. 2"
                              value={salidaQty}
                              onChange={(e) => setSalidaQty(e.target.value)}
                              className="form-control"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="salida-price-unit">Precio de Venta Unitario Real ({currency}) *</label>
                            <input
                              id="salida-price-unit"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={salidaPriceUnit}
                              onChange={(e) => setSalidaPriceUnit(e.target.value)}
                              className="form-control"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Modo de Registro de Cliente</label>
                          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                            <button
                              type="button"
                              onClick={() => setSalidaClientMode("select")}
                              className={`btn ${salidaClientMode === "select" ? "btn-primary" : "btn-secondary"} btn-sm`}
                              style={{ flex: 1 }}
                            >
                              Seleccionar de Agenda
                            </button>
                            <button
                              type="button"
                              onClick={() => setSalidaClientMode("manual")}
                              className={`btn ${salidaClientMode === "manual" ? "btn-primary" : "btn-secondary"} btn-sm`}
                              style={{ flex: 1 }}
                            >
                              Escribir Manualmente
                            </button>
                          </div>
                        </div>

                        {salidaClientMode === "select" ? (
                          <div className="form-group">
                            <label htmlFor="salida-select-customer-other">Selecciona el Cliente *</label>
                            <select
                              id="salida-select-customer-other"
                              value={salidaSelectedCustomerId}
                              onChange={(e) => setSalidaSelectedCustomerId(e.target.value)}
                              className="form-control"
                              required
                            >
                              <option value="">-- Seleccionar cliente --</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="form-group">
                            <label htmlFor="salida-manual-customer-other">Nombre del Cliente / Técnico *</label>
                            <div className="input-with-button">
                              <User size={16} style={{ position: "absolute", marginLeft: "12px", marginTop: "14px", color: "var(--color-text-muted)" }} />
                              <input
                                id="salida-manual-customer-other"
                                type="text"
                                placeholder="Nombre completo..."
                                value={salidaManualClient}
                                onChange={(e) => setSalidaManualClient(e.target.value)}
                                className="form-control"
                                style={{ paddingLeft: "36px" }}
                                required
                              />
                            </div>
                          </div>
                        )}

                        {/* CONDICION Y FORMA DE PAGO EN VENTA CANTIDAD */}
                        <div className="form-group" style={{ marginTop: "16px", background: "rgba(255, 255, 255, 0.02)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                          <label style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "12px", display: "block" }}>
                            Condición y Forma de Pago
                          </label>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Condición de Pago *</label>
                              <select
                                value={salidaPaymentCondition}
                                onChange={(e) => setSalidaPaymentCondition(e.target.value)}
                                className="form-control"
                              >
                                <option value="Contado">Contado (Pago Completo Inmediato)</option>
                                <option value="Credito">Crédito (Fiado / Por Cobrar)</option>
                              </select>
                            </div>

                            {salidaPaymentCondition === "Credito" && (
                              <div className="form-group">
                                <label>Cuota Inicial / Abono Inmediato ({currency})</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={salidaInitialPayment}
                                  onChange={(e) => setSalidaInitialPayment(e.target.value)}
                                  className="form-control"
                                  placeholder="0.00"
                                />
                              </div>
                            )}
                          </div>

                          {salidaPaymentCondition === "Credito" && (
                            <div className="form-group" style={{ marginTop: "8px" }}>
                              <label>Adjuntar Foto / Captura del Comprobante (Opcional)</label>
                              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  <Camera size={16} />
                                  <span>{salidaReceiptImage ? "Cambiar Foto" : "Tomar Foto / Subir Imagen"}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden-file-input"
                                    onChange={(e) => handleImageFileChange(e, setSalidaReceiptImage)}
                                  />
                                </label>
                                {salidaReceiptImage && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span className="badge badge-success">¡Foto cargada!</span>
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => setViewingReceiptImage(salidaReceiptImage)}
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => setSalidaReceiptImage(null)}
                                    >
                                      Quitar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <button type="submit" className="btn btn-success w-full" style={{ marginTop: "10px" }}>
                          Confirmar Venta y Decrementar Stock
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* FINANCE / CAJA TAB */}
        {activeTab === "finance" && isAdmin && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Módulo Financiero / Caja</h1>
                <p className="view-subtitle">Reporte general de ingresos, costos de inventario y otros gastos</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card glass" style={{ borderLeft: "4px solid var(--color-success)" }}>
                <div className="stat-header">
                  <span>INGRESOS (VENTAS)</span>
                  <ArrowUpRight className="text-success" size={16} />
                </div>
                <div className="stat-value text-success">{currency}{totalFinancialIncome.toFixed(2)}</div>
                <div className="stat-footer text-muted">Ventas facturadas en almacén</div>
              </div>

              <div className="stat-card glass" style={{ borderLeft: "4px solid var(--color-danger)" }}>
                <div className="stat-header">
                  <span>INVERSIÓN COMPRAS</span>
                  <ArrowDownRight className="text-danger" size={16} />
                </div>
                <div className="stat-value text-danger">{currency}{totalFinancialPurchases.toFixed(2)}</div>
                <div className="stat-footer text-muted">Gastado en compras de lotes</div>
              </div>

              <div className="stat-card glass" style={{ borderLeft: "4px solid var(--color-warning)" }}>
                <div className="stat-header">
                  <span>OTROS GASTOS (CAJA)</span>
                  <ArrowDownRight className="text-warning" size={16} />
                </div>
                <div className="stat-value text-warning">{currency}{totalFinancialOtherExpenses.toFixed(2)}</div>
                <div className="stat-footer text-muted">Servicios, courier, fletes, etc.</div>
              </div>

              <div className="stat-card glass" style={{ borderLeft: `4px solid ${totalFinancialBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
                <div className="stat-header">
                  <span>CAJA NETA / UTILIDAD</span>
                  <DollarSign size={16} />
                </div>
                <div className={`stat-value ${totalFinancialBalance >= 0 ? "text-success" : "text-danger"}`}>
                  {currency}{totalFinancialBalance.toFixed(2)}
                </div>
                <div className="stat-footer text-muted">Saldo neto disponible</div>
              </div>
            </div>

            <div className="filters-panel glass" style={{ marginTop: "20px" }}>
              <div className="form-group" style={{ position: "relative", flex: 2, marginBottom: 0 }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  placeholder="Buscar transacciones por descripción o categoría..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: "36px" }}
                />
              </div>

              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <select
                  value={ledgerFilterCategory}
                  onChange={(e) => setLedgerFilterCategory(e.target.value)}
                  className="form-control"
                >
                  <option value="">Todas las categorías</option>
                  <option value="Venta">Ventas</option>
                  <option value="Compra">Compras</option>
                  <option value="Gasto">Gastos Varios</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Se encontraron {filteredLedger.length} transacciones.
            </div>

            <div className="table-wrapper glass desktop-table-view">
              <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{tx.date}</td>
                      <td>
                        <span className={`badge ${tx.type === 'Ingreso' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: "0.65rem" }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{tx.category}</td>
                      <td style={{ whiteSpace: "normal", minWidth: "200px", maxWidth: "400px", wordBreak: "break-word" }}>{tx.description}</td>
                      <td style={{ fontWeight: 700 }} className={tx.type === 'Ingreso' ? 'text-success' : 'text-danger'}>
                        {tx.type === 'Ingreso' ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                      </td>
                      <td>
                        <button onClick={() => handleDeleteLedgerTx(tx.id)} className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} title="Eliminar transacción">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                        No hay transacciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Caja / Ledger view */}
            <div className="mobile-card-list">
              {filteredLedger.map(tx => (
                <div key={tx.id} className="mobile-row-card glass" style={{ padding: "14px" }}>
                  <div className="card-header-row">
                    <div>
                      <span className={`badge ${tx.type === 'Ingreso' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: "0.65rem", marginRight: "6px" }}>
                        {tx.type}
                      </span>
                      <strong style={{ color: "var(--color-text-bright)", fontSize: "0.95rem" }}>{tx.category}</strong>
                    </div>
                    <button onClick={() => handleDeleteLedgerTx(tx.id)} className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} title="Eliminar">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "8px 0" }}>
                    {tx.description}
                  </div>

                  <div className="card-footer-row" style={{ marginTop: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {tx.date}
                    </span>
                    <strong style={{ fontSize: "1rem" }} className={tx.type === 'Ingreso' ? 'text-success' : 'text-danger'}>
                      {tx.type === 'Ingreso' ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
              {filteredLedger.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                  No hay transacciones registradas.
                </div>
              )}
            </div>

            <div className="dashboard-panel glass" style={{ marginTop: "24px" }}>
              <div className="panel-header">
                <span className="panel-title">Registrar Gasto de Caja Directo</span>
              </div>
                <form onSubmit={handleAddExpense}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Categoría del Gasto *</label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="form-control"
                      >
                        <option value="Servicios">Servicios (Luz, Agua, Internet)</option>
                        <option value="Transporte">Transporte (Envío, Courier, Flete)</option>
                        <option value="Oficina">Oficina (Alquiler, Útiles, Limpieza)</option>
                        <option value="Personal">Personal (Sueldos, Viáticos)</option>
                        <option value="Otros">Otros Gastos Varios</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Monto del Gasto ({currency}) *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descripción del Gasto *</label>
                    <input
                      type="text"
                      placeholder="Ej. Pago de alquiler de local, Compra de café para oficina..."
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-danger w-full" style={{ marginTop: "6px" }}>
                    Registrar Egreso Financiero
                  </button>
                </form>
              </div>
          </div>
        )}

        {/* USERS MANAGEMENT TAB - Admin Only */}
        {activeTab === "users" && isAdmin && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Gestión de Usuarios</h1>
                <p className="view-subtitle">Registra o elimina cuentas de usuarios con accesos específicos al almacén</p>
              </div>
            </div>

            <div className="dashboard-sections" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              
              <div className="dashboard-panel glass">
                <div className="panel-header">
                  <span className="panel-title">Lista de Usuarios Registrados</span>
                  <span className="badge badge-success">{users.length} Cuentas</span>
                </div>

                <div className="table-wrapper">
                  <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Contraseña</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.username}>
                          <td style={{ fontWeight: 600, color: "var(--color-text-bright)" }}>{u.name}</td>
                          <td style={{ fontFamily: "monospace" }}>{u.username}</td>
                          <td>
                            <span className={`badge ${u.role === 'Administrador' ? 'badge-success' : u.role === 'Almacenero' ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: "0.65rem" }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ fontFamily: "monospace" }}>{u.password}</td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => handleStartEditUser(u)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }} title="Editar usuario">
                                <Edit2 size={12} />
                              </button>
                              {u.username !== currentUser.username ? (
                                <button onClick={() => handleDeleteUser(u.username)} className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} title="Eliminar usuario">
                                  <Trash2 size={12} />
                                </button>
                              ) : (
                                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", alignSelf: "center", marginLeft: "4px" }}>Sesión Activa</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dashboard-panel glass">
                <div className="panel-header">
                  <span className="panel-title">Agregar Nuevo Usuario</span>
                </div>

                <form onSubmit={handleAddUser}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="user-new-name">Nombre Completo *</label>
                      <input
                        id="user-new-name"
                        type="text"
                        placeholder="Ej. Carlos Almacenero"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="user-new-username">Nombre de Usuario *</label>
                      <input
                        id="user-new-username"
                        type="text"
                        placeholder="Ej. carlos99"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="user-new-password">Contraseña *</label>
                      <input
                        id="user-new-password"
                        type="password"
                        placeholder="Contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="user-new-role">Rol asignado *</label>
                      <select
                        id="user-new-role"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="form-control"
                      >
                        <option value="Administrador">Administrador (Acceso Total)</option>
                        <option value="Almacenero">Almacenero (Solo Entradas y Físico)</option>
                        <option value="Encargado">Encargado (Solo Ventas y Salidas)</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full" style={{ marginTop: "12px" }}>
                    Guardar Cuenta de Usuario
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* CONFIGURACION TAB */}
        {activeTab === "ajustes" && isAdmin && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Configuración del Sistema</h1>
                <p className="view-subtitle">Gestiona la moneda, paleta de colores y copias de seguridad de TUNKITEK</p>
              </div>
            </div>

            {/* BRANDING CONFIGURATION SECTION */}
            <div className="glass settings-action-card" style={{ display: "block" }}>
              <div className="settings-title" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Building size={18} className="text-primary" /> Personalización de Marca (Nombre del Sistema y Logo)
              </div>
              <p className="settings-description" style={{ marginBottom: "16px" }}>
                Modifica el nombre del sistema/empresa, eslogan y el logotipo oficial. Los cambios se guardarán en MySQL y se actualizarán instantáneamente en todas las pantallas.
              </p>

              <form onSubmit={handleSaveBrandingSettings}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre del Sistema / Empresa *</label>
                    <input
                      type="text"
                      value={editAppName}
                      onChange={(e) => setEditAppName(e.target.value)}
                      className="form-control"
                      placeholder="Ej. TUNKITEK"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Eslogan / Subtítulo del Sistema</label>
                    <input
                      type="text"
                      value={editAppSubtitle}
                      onChange={(e) => setEditAppSubtitle(e.target.value)}
                      className="form-control"
                      placeholder="Ej. Gestión de Almacén e Inventario"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label>Logo Oficial del Sistema</label>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <img src={editAppLogo || appLogo} alt="Preview Logo" style={{ height: "45px", objectFit: "contain" }} />
                    </div>

                    <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Camera size={16} />
                      <span>{editAppLogo ? "Cambiar Imagen" : "Subir Nuevo Logo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden-file-input"
                        onChange={(e) => handleImageFileChange(e, setEditAppLogo)}
                      />
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: "16px" }}>
                  Guardar Nombre y Logo del Sistema
                </button>
              </form>
            </div>

            {/* BACKGROUND COLOR PALETTE SECTION */}
            <div className="glass settings-action-card" style={{ display: "block" }}>
              <div className="settings-title" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} className="text-primary" /> Color de Fondo del Sistema (4 Paletas de Fondo)
              </div>
              <p className="settings-description" style={{ marginBottom: "16px" }}>
                Selecciona la paleta de color de fondo del sistema. Los cambios se guardarán en MySQL y se aplicarán en todas las pantallas.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {BACKGROUND_THEMES.map((bg) => (
                  <div
                    key={bg.id}
                    onClick={() => {
                      setBgTheme(bg.id);
                      applyBackgroundTheme(bg.id);
                      fetch(API_URL + "/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bgTheme: bg.id })
                      }).catch(() => {});
                    }}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      background: bgTheme === bg.id ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.02)",
                      border: bgTheme === bg.id ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: bg.previewColor,
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                      }}
                    ></div>
                    <div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", color: "var(--color-text-bright)" }}>{bg.name}</span>
                      {bgTheme === bg.id && <span style={{ fontSize: "0.7rem", color: "var(--color-primary)" }}>✓ Fondo Activo</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CURRENCY CONFIGURATION SECTION */}
            <div className="glass settings-action-card" style={{ display: "block" }}>
              <div className="settings-title" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <DollarSign size={18} className="text-primary" /> Moneda del Sistema (Predeterminada)
              </div>
              <p className="settings-description" style={{ marginBottom: "16px" }}>
                La moneda oficial predeterminada de TUNKITEK es <strong>S/. (Sol Peruano)</strong>. Se utiliza de forma uniforme en todos los costos, comprobantes, ventas y reportes financieros.
              </p>

              <div className="form-group" style={{ maxWidth: "300px" }}>
                <label>Símbolo de Moneda Activo</label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="form-control"
                  style={{ fontWeight: "bold" }}
                >
                  <option value="S/.">S/. (Sol Peruano)</option>
                  <option value="$">$ (Dólar estadounidense / Pesos)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="€">€ (Euro)</option>
                </select>
              </div>
            </div>

            {/* THEME COLOR PALETTE SECTION */}
            <div className="glass settings-action-card" style={{ display: "block" }}>
              <div className="settings-title" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} className="text-primary" /> Paleta de Colores del Tema (TUNKITEK)
              </div>
              <p className="settings-description" style={{ marginBottom: "16px" }}>
                Personaliza la apariencia visual de la interfaz. Los cambios se guardan y aplican instantáneamente en todo el sistema.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {THEME_PALETTES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => applyThemePalette(t.id)}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: themePalette === t.id ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      border: themePalette === t.id ? `2px solid ${t.primary}` : "1px solid var(--border-color)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: t.gradient,
                          boxShadow: t.shadowGlow
                        }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: themePalette === t.id ? "var(--color-text-bright)" : "var(--color-text-muted)" }}>
                        {t.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`btn ${themePalette === t.id ? "btn-primary" : "btn-secondary"} btn-sm`}
                      style={{ marginTop: "4px", width: "100%", padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      {themePalette === t.id ? "✓ Tema Activo" : "Seleccionar"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* BACKUP EXPORT */}
            <div className="glass settings-action-card">
              <div className="settings-text">
                <div className="settings-title">Exportar Datos (Copia de Seguridad)</div>
                <div className="settings-description">Descarga tu inventario, lotes, clientes, catálogo, finanzas y usuarios en JSON o CSV.</div>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                <button onClick={handleExportJSON} className="btn btn-secondary">
                  <Download size={16} /> Respaldar JSON
                </button>
                <button onClick={handleExportCSV} className="btn btn-secondary">
                  <Download size={16} /> Exportar Excel (CSV)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DETAIL AND MODIFY MODAL (DEVICE) */}
      {selectedDevice && (
        <div className="scanner-overlay" onClick={() => { if (!isEditingDevice) setSelectedDevice(null); }}>
          <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            
            {!isEditingDevice ? (
              <div>
                <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                  <h3>Detalles del Dispositivo</h3>
                  <p className="scanner-subtitle">ID Único: {selectedDevice.id}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="detail-row">
                    <span className="detail-label">Tipo de Producto:</span>
                    <span className="detail-value text-primary">{selectedDevice.type || catalog.find(p => p.id === selectedDevice.productId)?.type || "ONU"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Marca / Modelo:</span>
                    <span className="detail-value text-bright">{selectedDevice.brand} - {selectedDevice.model}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Número de Serie (SN):</span>
                    <span className="detail-value" style={{ fontFamily: "monospace" }}>{selectedDevice.sn}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">MAC Address:</span>
                    <span className="detail-value" style={{ fontFamily: "monospace" }}>{selectedDevice.mac || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Código de Barras:</span>
                    <span className="detail-value" style={{ fontFamily: "monospace" }}>{selectedDevice.barcode}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Estado Físico:</span>
                    <div>
                      <span className={`badge ${selectedDevice.status === 'Disponible' ? 'badge-success' : selectedDevice.status === 'Vendido' ? 'badge-warning' : 'badge-danger'}`}>
                        {selectedDevice.status}
                      </span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fecha Registro (Ingreso):</span>
                    <span className="detail-value" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={14} className="text-muted" /> {selectedDevice.dateAdded}
                    </span>
                  </div>

                  {(() => {
                    const devLot = lots.find(l => l.id === selectedDevice.lotId);
                    const vendorName = devLot ? (devLot.vendor || "No especificado") : "Sin lote asignado";
                    return (
                      <>
                        <div className="detail-row" style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px", borderRadius: "6px" }}>
                          <span className="detail-label" style={{ fontWeight: 600, color: "var(--color-text-bright)" }}>Proveedor de Origen:</span>
                          <span className="detail-value text-primary" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{vendorName}</span>
                        </div>
                        {devLot && (
                          <div className="detail-row">
                            <span className="detail-label">Lote de Ingreso:</span>
                            <span className="detail-value">{devLot.name}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="detail-row">
                    <span className="detail-label">Precio de Compra (Costo):</span>
                    <span className="detail-value">
                      {isAdmin ? `${currency}${selectedDevice.purchasePrice.toFixed(2)}` : <Lock size={12} className="text-warning" />}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Precio de Venta Sugerido:</span>
                    <span className="detail-value">
                      {!isAlmacenero ? `${currency}${selectedDevice.salePrice.toFixed(2)}` : <Lock size={12} className="text-warning" />}
                    </span>
                  </div>

                  {selectedDevice.status === "Vendido" && (
                    <div style={{ padding: "10px 0", borderTop: "1px solid var(--border-color)", marginTop: "10px" }}>
                      <h4 style={{ fontSize: "0.9rem", color: "var(--color-text-bright)", marginBottom: "8px" }}>Información de la Venta</h4>
                      <div className="detail-row">
                        <span className="detail-label">Vendido a (Cliente/Técnico):</span>
                        <span className="detail-value text-success">{selectedDevice.soldTo}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Fecha/Hora Venta:</span>
                        <span className="detail-value" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={14} className="text-muted" /> {selectedDevice.soldDate}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Precio de Venta Real:</span>
                        <span className="detail-value text-success">
                          {!isAlmacenero ? `${currency}${selectedDevice.soldPrice?.toFixed(2)}` : <Lock size={12} className="text-warning" />}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="detail-row">
                          <span className="detail-label">Ganancia Real:</span>
                          <span className="detail-value text-success">
                            {currency}{(selectedDevice.soldPrice - selectedDevice.purchasePrice).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {isAdmin && (
                    <div style={{ marginTop: "15px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "block", marginBottom: "8px" }}>Cambiar Estado Físico:</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {selectedDevice.status !== "Disponible" && (
                          <button
                            onClick={() => handleMarkStatus(selectedDevice.id, "Disponible")}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1 }}
                          >
                            Disponible
                          </button>
                        )}
                        {selectedDevice.status !== "Defectuoso" && (
                          <button
                            onClick={() => handleMarkStatus(selectedDevice.id, "Defectuoso")}
                            className="btn btn-danger btn-sm"
                            style={{ flex: 1 }}
                          >
                            Defectuoso
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                  {isAdmin && (
                    <button onClick={handleStartEditing} className="btn btn-primary" style={{ flex: 1, gap: "6px" }}>
                      <Edit2 size={16} />
                      <span>Editar Equipo</span>
                    </button>
                  )}
                  <button onClick={() => setSelectedDevice(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              
              isAdmin && (
                <form onSubmit={handleEditSubmit}>
                  <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                    <h3>Modificar Datos del Equipo</h3>
                    <p className="scanner-subtitle">Edita los campos del producto seleccionado</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    <div className="form-group">
                      <label>Tipo de Producto</label>
                      <input
                        type="text"
                        value={selectedDevice.type || catalog.find(p => p.id === selectedDevice.productId)?.type || "ONU"}
                        className="form-control"
                        disabled
                        style={{ opacity: 0.6, cursor: "not-allowed" }}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Marca *</label>
                        <input
                          type="text"
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Modelo *</label>
                        <input
                          type="text"
                          value={editModel}
                          onChange={(e) => setEditModel(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Número de Serie (SN) *</label>
                        <div className="input-with-button">
                          <input
                            type="text"
                            value={editSn}
                            onChange={(e) => setEditSn(e.target.value.toUpperCase())}
                            className="form-control"
                            style={{ fontFamily: "monospace" }}
                            required
                          />
                          <button type="button" onClick={() => openScanner("edit-sn")} className="btn btn-secondary" style={{ padding: "10px" }}>
                            <Scan size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>MAC Address</label>
                        <div className="input-with-button">
                          <input
                            type="text"
                            value={editMac}
                            onChange={(e) => setEditMac(e.target.value.toUpperCase())}
                            className="form-control"
                            style={{ fontFamily: "monospace" }}
                          />
                          <button type="button" onClick={() => openScanner("edit-mac")} className="btn btn-secondary" style={{ padding: "10px" }}>
                            <Scan size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Código de Barras</label>
                        <div className="input-with-button">
                          <input
                            type="text"
                            value={editBarcode}
                            onChange={(e) => setEditBarcode(e.target.value)}
                            className="form-control"
                            style={{ fontFamily: "monospace" }}
                          />
                          <button type="button" onClick={() => openScanner("edit-barcode")} className="btn btn-secondary" style={{ padding: "10px" }}>
                            <Scan size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Estado Físico *</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="form-control"
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Vendido">Vendido</option>
                          <option value="Defectuoso">Defectuoso</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Precio Compra (Costo) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editPurchasePrice}
                          onChange={(e) => setEditPurchasePrice(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Precio Venta Sugerido *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editSalePrice}
                          onChange={(e) => setEditSalePrice(e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Fecha y Hora de Registro *</label>
                      <input
                        type="text"
                        value={editDateAdded}
                        onChange={(e) => setEditDateAdded(e.target.value)}
                        className="form-control"
                        placeholder="YYYY-MM-DD HH:MM:SS"
                        required
                      />
                    </div>

                    {editStatus === "Vendido" && (
                      <div style={{ border: "1px solid var(--border-color)", padding: "12px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.02)" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-success)", display: "block", marginBottom: "8px" }}>
                          Datos de la Transacción de Venta
                        </span>
                        <div className="form-group">
                          <label>Vendido a (Cliente o Persona)</label>
                          <input
                            type="text"
                            value={editSoldTo}
                            onChange={(e) => setEditSoldTo(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Precio Venta Real ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editSoldPrice}
                              onChange={(e) => setEditSoldPrice(e.target.value)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label>Fecha y Hora Venta</label>
                            <input
                              type="text"
                              value={editSoldDate}
                              onChange={(e) => setEditSoldDate(e.target.value)}
                              className="form-control"
                              placeholder="YYYY-MM-DD HH:MM:SS"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                    <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                      Guardar Cambios
                    </button>
                    <button type="button" onClick={() => setIsEditingDevice(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                      Cancelar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDevice(selectedDevice.id)}
                    className="btn btn-danger w-full"
                    style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Trash2 size={16} />
                    <span>Eliminar del Inventario permanentemente</span>
                  </button>
                </form>
              )
            )}

          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {selectedProduct && isEditingProduct && canManageCatalog && (
        <div className="scanner-overlay" onClick={() => { setSelectedProduct(null); setIsEditingProduct(false); }}>
          <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <form onSubmit={handleEditProductSubmit}>
              <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                <h3>Editar Producto del Catálogo</h3>
                <p className="scanner-subtitle font-mono">ID: {selectedProduct.id}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo / Categoría *</label>
                    <input
                      type="text"
                      value={editProdType}
                      onChange={(e) => setEditProdType(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Método de Control *</label>
                    <select
                      value={editProdControlMethod}
                      onChange={(e) => setEditProdControlMethod(e.target.value)}
                      className="form-control"
                    >
                      <option value="serialized">Serializado (Por SN/MAC)</option>
                      <option value="quantity">Por Cantidad (Simple)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Marca *</label>
                    <input
                      type="text"
                      value={editProdBrand}
                      onChange={(e) => setEditProdBrand(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre / Modelo del Producto *</label>
                    <input
                      type="text"
                      value={editProdName}
                      onChange={(e) => setEditProdName(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Stock Mínimo de Alerta *</label>
                    <input
                      type="number"
                      value={editProdMinAlert}
                      onChange={(e) => setEditProdMinAlert(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <input
                      type="text"
                      value={editProdDesc}
                      onChange={(e) => setEditProdDesc(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                  Guardar Cambios
                </button>
                <button type="button" onClick={() => { setSelectedProduct(null); setIsEditingProduct(false); }} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL - ADMIN ONLY */}
      {selectedCustomer && isEditingCustomer && isAdmin && (
        <div className="scanner-overlay" onClick={() => { setSelectedCustomer(null); setIsEditingCustomer(false); }}>
          <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <form onSubmit={handleEditCustomerSubmit}>
              <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                <h3>Editar Datos del Cliente</h3>
                <p className="scanner-subtitle font-mono">ID: {selectedCustomer.id}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label>Nombres o Razón Social *</label>
                  <input
                    type="text"
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DNI o RUC</label>
                    <input
                      type="text"
                      placeholder="8 dígitos (DNI) o 11 dígitos (RUC)"
                      maxLength={11}
                      value={editCustDocId}
                      onChange={(e) => setEditCustDocId(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={editCustPhone}
                      onChange={(e) => setEditCustPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    value={editCustEmail}
                    onChange={(e) => setEditCustEmail(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={editCustAddress}
                    onChange={(e) => setEditCustAddress(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                  Guardar Cambios
                </button>
                <button type="button" onClick={() => { setSelectedCustomer(null); setIsEditingCustomer(false); }} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {selectedVendor && isEditingVendor && isAdmin && (
        <div className="scanner-overlay" onClick={() => { setSelectedVendor(null); setIsEditingVendor(false); }}>
          <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <form onSubmit={handleEditVendorSubmit}>
              <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                <h3>Editar Datos del Proveedor</h3>
                <p className="scanner-subtitle font-mono">ID: {selectedVendor.id}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label>Nombres o Razón Social *</label>
                  <input
                    type="text"
                    value={editVendorName}
                    onChange={(e) => setEditVendorName(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DNI o RUC</label>
                    <input
                      type="text"
                      placeholder="8 dígitos (DNI) o 11 dígitos (RUC)"
                      maxLength={11}
                      value={editVendorDocId}
                      onChange={(e) => setEditVendorDocId(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Persona de Contacto</label>
                    <input
                      type="text"
                      value={editVendorContact}
                      onChange={(e) => setEditVendorContact(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={editVendorPhone}
                      onChange={(e) => setEditVendorPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      value={editVendorEmail}
                      onChange={(e) => setEditVendorEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={editVendorAddress}
                    onChange={(e) => setEditVendorAddress(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Notas u Observaciones</label>
                  <input
                    type="text"
                    value={editVendorNotes}
                    onChange={(e) => setEditVendorNotes(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "15px" }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                  Guardar Cambios
                </button>
                <button type="button" onClick={() => { setSelectedVendor(null); setIsEditingVendor(false); }} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* CREDITS TAB */}
        {activeTab === "credits" && !isAlmacenero && (
          <div>
            <div className="view-title-container">
              <div>
                <h1 className="view-title">Gestión de Créditos y Cuentas</h1>
                <p className="view-subtitle">Control de ventas fiadas (cuentas por cobrar) y compras a crédito (cuentas por pagar)</p>
              </div>
            </div>

            {/* Metric Summary Cards */}
            {(() => {
              const totalPendingCobrar = credits
                .filter(c => c.type === "Cobrar" && c.status === "Pendiente")
                .reduce((acc, curr) => acc + curr.balance, 0);

              const totalPendingPagar = credits
                .filter(c => c.type === "Pagar" && c.status === "Pendiente")
                .reduce((acc, curr) => acc + curr.balance, 0);

              const totalCollected = credits
                .filter(c => c.type === "Cobrar")
                .reduce((acc, curr) => acc + curr.paidAmount, 0);

              const totalPaidOut = credits
                .filter(c => c.type === "Pagar")
                .reduce((acc, curr) => acc + curr.paidAmount, 0);

              const filteredCreditsList = credits.filter((cred) => {
                const matchesType = creditsFilterType === "" || cred.type === creditsFilterType;
                const matchesStatus = creditsFilterStatus === "" || cred.status === creditsFilterStatus;
                const term = creditsSearchQuery.toLowerCase();
                const matchesSearch =
                  cred.clientOrVendor.toLowerCase().includes(term) ||
                  cred.description.toLowerCase().includes(term);
                return matchesType && matchesStatus && matchesSearch;
              });

              return (
                <div>
                  <div className="stats-grid">
                    <div className="stat-card glass">
                      <div className="stat-header">
                        <span>Total Por Cobrar (Clientes)</span>
                        <ArrowUpRight size={18} style={{ color: "var(--color-warning)" }} />
                      </div>
                      <div className="stat-value text-warning">
                        {currency}{totalPendingCobrar.toFixed(2)}
                      </div>
                      <div className="stat-footer">
                        {credits.filter(c => c.type === "Cobrar" && c.status === "Pendiente").length} pendientes
                      </div>
                    </div>

                    <div className="stat-card glass">
                      <div className="stat-header">
                        <span>Total Por Pagar (Proveedores)</span>
                        <ArrowDownRight size={18} style={{ color: "var(--color-danger)" }} />
                      </div>
                      <div className="stat-value text-danger">
                        {currency}{totalPendingPagar.toFixed(2)}
                      </div>
                      <div className="stat-footer">
                        {credits.filter(c => c.type === "Pagar" && c.status === "Pendiente").length} pendientes
                      </div>
                    </div>

                    <div className="stat-card glass">
                      <div className="stat-header">
                        <span>Cobrado de Créditos</span>
                        <CreditCard size={18} style={{ color: "var(--color-success)" }} />
                      </div>
                      <div className="stat-value text-success">
                        {currency}{totalCollected.toFixed(2)}
                      </div>
                      <div className="stat-footer">Ingresos acumulados</div>
                    </div>

                    <div className="stat-card glass">
                      <div className="stat-header">
                        <span>Pagado de Créditos</span>
                        <CreditCard size={18} style={{ color: "var(--color-primary)" }} />
                      </div>
                      <div className="stat-value text-primary">
                        {currency}{totalPaidOut.toFixed(2)}
                      </div>
                      <div className="stat-footer">Egresos acumulados</div>
                    </div>
                  </div>

                  {/* Sub-tabs toggle */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px", marginBottom: "16px" }}>
                    <button
                      className={`btn ${creditsFilterType === "Cobrar" ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setCreditsFilterType("Cobrar")}
                      style={{ borderRadius: "8px", padding: "10px 16px" }}
                    >
                      Cuentas por Cobrar (Ventas)
                    </button>
                    <button
                      className={`btn ${creditsFilterType === "Pagar" ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setCreditsFilterType("Pagar")}
                      style={{ borderRadius: "8px", padding: "10px 16px" }}
                    >
                      Cuentas por Pagar (Compras)
                    </button>
                  </div>

                  <div className="filters-panel glass">
                    <div className="form-group" style={{ position: "relative", flex: 2, marginBottom: 0 }}>
                      <Search size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--color-text-muted)" }} />
                      <input
                        type="text"
                        placeholder="Buscar por cliente, proveedor, descripción..."
                        value={creditsSearchQuery}
                        onChange={(e) => setCreditsSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: "36px" }}
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <select
                        value={creditsFilterStatus}
                        onChange={(e) => setCreditsFilterStatus(e.target.value)}
                        className="form-control"
                      >
                        <option value="">Todos los Estados</option>
                        <option value="Pendiente">Solo Pendientes</option>
                        <option value="Pagado">Solo Pagados</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    Se encontraron {filteredCreditsList.length} registros de crédito.
                  </div>

                  {/* Desktop Table View */}
                  <div className="table-wrapper glass desktop-table-view">
                    <table className="custom-table" style={{ fontSize: "0.85rem" }}>
                        <thead>
                          <tr>
                            <th style={{ width: "16%" }}>{creditsFilterType === "Cobrar" ? "Cliente" : "Proveedor"}</th>
                            <th style={{ width: "12%" }}>Fecha</th>
                            <th style={{ width: "36%" }}>Descripción / Operación</th>
                            <th style={{ width: "9%", textAlign: "right" }}>Monto Total</th>
                            <th style={{ width: "9%", textAlign: "right" }}>Abonado</th>
                            <th style={{ width: "9%", textAlign: "right" }}>Saldo Pendiente</th>
                            <th style={{ width: "5%", textAlign: "center" }}>Estado</th>
                            <th style={{ width: "8%", textAlign: "center" }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCreditsList.map(cred => (
                            <tr key={cred.id}>
                              <td style={{ fontWeight: 600, color: "var(--color-text-bright)", whiteSpace: "normal", wordBreak: "break-word" }}>{cred.clientOrVendor}</td>
                              <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{cred.date}</td>
                              <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{cred.description}</td>
                              <td style={{ fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>{currency}{cred.totalAmount.toFixed(2)}</td>
                              <td style={{ color: "var(--color-success)", textAlign: "right", whiteSpace: "nowrap" }}>{currency}{cred.paidAmount.toFixed(2)}</td>
                              <td style={{ fontWeight: 700, color: cred.balance > 0 ? "var(--color-warning)" : "var(--color-text-muted)", textAlign: "right", whiteSpace: "nowrap" }}>
                                {currency}{cred.balance.toFixed(2)}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span className={`badge ${cred.status === "Pagado" ? "badge-success" : "badge-warning"}`}>
                                  {cred.status}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                  {cred.balance > 0 && (
                                    <button
                                      onClick={() => { setSelectedCreditForPayment(cred); setAbonoAmount(cred.balance.toFixed(2)); setAbonoImage(null); setAbonoNote(""); }}
                                      className="btn btn-success btn-sm"
                                      style={{ padding: "4px 8px" }}
                                    >
                                      Abonar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setSelectedCreditForHistory(cred)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                    title="Ver Historial y Comprobantes"
                                  >
                                    <Paperclip size={12} />
                                    <span>{cred.payments?.length || 0}</span>
                                  </button>
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteCredit(cred.id)}
                                      className="btn btn-danger btn-sm"
                                      style={{ padding: "4px 8px" }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredCreditsList.length === 0 && (
                            <tr>
                              <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                                No se encontraron registros de crédito.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="mobile-card-list" style={{ marginTop: "16px" }}>
                      {filteredCreditsList.map(cred => (
                        <div key={cred.id} className="mobile-row-card glass" style={{ padding: "14px" }}>
                          <div className="card-header-row">
                            <div>
                              <strong style={{ fontSize: "1rem", color: "var(--color-text-bright)", display: "block" }}>{cred.clientOrVendor}</strong>
                              <span className={`badge ${cred.status === "Pagado" ? "badge-success" : "badge-warning"}`} style={{ marginTop: "4px" }}>
                                {cred.status}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              {cred.balance > 0 && (
                                <button
                                  onClick={() => { setSelectedCreditForPayment(cred); setAbonoAmount(cred.balance.toFixed(2)); setAbonoImage(null); setAbonoNote(""); }}
                                  className="btn btn-success btn-sm"
                                  style={{ padding: "6px 10px" }}
                                >
                                  Abonar
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedCreditForHistory(cred)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              >
                                <Paperclip size={14} />
                                <span style={{ fontSize: "0.75rem" }}>{cred.payments?.length || 0}</span>
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteCredit(cred.id)}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: "6px" }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "8px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div><strong>Operación:</strong> {cred.description}</div>
                            <div><strong>Monto Total:</strong> {currency}{cred.totalAmount.toFixed(2)}</div>
                            <div><strong>Abonado:</strong> <span style={{ color: "var(--color-success)" }}>{currency}{cred.paidAmount.toFixed(2)}</span></div>
                            <div><strong>Saldo Pendiente:</strong> <span style={{ fontWeight: 700, color: cred.balance > 0 ? "var(--color-warning)" : "var(--color-text-muted)" }}>{currency}{cred.balance.toFixed(2)}</span></div>
                          </div>

                          <div className="card-footer-row" style={{ marginTop: "4px" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Fecha: {cred.date}</span>
                          </div>
                        </div>
                      ))}
                      {filteredCreditsList.length === 0 && (
                        <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                          No se encontraron registros de crédito.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        {/* PAYMENT MODAL */}
        {selectedCreditForPayment && (
          <div className="scanner-overlay" onClick={() => setSelectedCreditForPayment(null)}>
            <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <form onSubmit={handleSaveAbono}>
                <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                  <h3>Registrar Abono a Crédito</h3>
                  <p className="scanner-subtitle">
                    {selectedCreditForPayment.type === "Cobrar" ? "Cobro a " : "Pago a "}
                    <strong>{selectedCreditForPayment.clientOrVendor}</strong>
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                      <span>Monto Total Crédito:</span>
                      <strong>{currency}{selectedCreditForPayment.totalAmount.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                      <span>Abonado hasta hoy:</span>
                      <span style={{ color: "var(--color-success)" }}>{currency}{selectedCreditForPayment.paidAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", fontWeight: 700 }}>
                      <span>Saldo Pendiente:</span>
                      <span style={{ color: "var(--color-warning)" }}>{currency}{selectedCreditForPayment.balance.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Monto del Abono ({currency}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      max={selectedCreditForPayment.balance}
                      value={abonoAmount}
                      onChange={(e) => setAbonoAmount(e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Medio de Pago *</label>
                    <select
                      value={abonoMethod}
                      onChange={(e) => setAbonoMethod(e.target.value)}
                      className="form-control"
                    >
                      <option value="Yape">Yape</option>
                      <option value="Plin">Plin</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia BCP">Transferencia BCP</option>
                      <option value="Transferencia BBVA">Transferencia BBVA</option>
                      <option value="Transferencia Interbank">Transferencia Interbank</option>
                      <option value="Otros">Otro Medio</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nota / Observación</label>
                    <input
                      type="text"
                      placeholder="Ej. Abono parcial por Yape N° oper. 45879"
                      value={abonoNote}
                      onChange={(e) => setAbonoNote(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Foto / Captura del Comprobante (Voucher)</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Camera size={16} />
                        <span>{abonoImage ? "Cambiar Foto" : "Tomar Foto / Subir Voucher"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden-file-input"
                          onChange={(e) => handleImageFileChange(e, setAbonoImage)}
                        />
                      </label>
                      {abonoImage && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="badge badge-success">Foto adjunta</span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setViewingReceiptImage(abonoImage)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setAbonoImage(null)}
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-success w-full">
                    Registrar Abono
                  </button>
                  <button type="button" onClick={() => setSelectedCreditForPayment(null)} className="btn btn-secondary w-full">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PAYMENT HISTORY & RECEIPTS MODAL */}
        {selectedCreditForHistory && (
          <div className="scanner-overlay" onClick={() => setSelectedCreditForHistory(null)}>
            <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
              <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                <h3>Historial de Pagos y Comprobantes</h3>
                <p className="scanner-subtitle">
                  {selectedCreditForHistory.clientOrVendor} - {selectedCreditForHistory.description}
                </p>
              </div>

              <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {(selectedCreditForHistory.payments || []).map((pay, idx) => (
                  <div key={pay.id || idx} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ color: "var(--color-success)" }}>
                        Abono #{idx + 1}: {currency}{pay.amount.toFixed(2)}
                      </strong>
                      <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>{pay.paymentMethod || "Efectivo"}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                      Fecha: {pay.date}
                    </div>
                    {pay.note && (
                      <div style={{ fontSize: "0.85rem", marginBottom: "8px" }}>
                        <strong>Nota:</strong> {pay.note}
                      </div>
                    )}
                    {pay.receiptImage ? (
                      <div>
                        <button
                          onClick={() => setViewingReceiptImage(pay.receiptImage)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          <Eye size={14} />
                          <span>Ver Foto de Comprobante / Voucher</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>Sin foto de comprobante adjunta</span>
                    )}
                  </div>
                ))}
                {(!selectedCreditForHistory.payments || selectedCreditForHistory.payments.length === 0) && (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                    No se han registrado abonos todavía.
                  </div>
                )}
              </div>

              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <button onClick={() => setSelectedCreditForHistory(null)} className="btn btn-secondary">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL (Admin Only) */}
        {selectedUserToEdit && (
          <div className="scanner-overlay" onClick={() => setSelectedUserToEdit(null)}>
            <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
              <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                <h3>Editar Datos de Usuario</h3>
                <p className="scanner-subtitle">Modifica la información, el rol o actualiza la clave de acceso</p>
              </div>

              <form onSubmit={handleSaveEditUser} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label htmlFor="edit-user-fullname">Nombre Completo *</label>
                  <input
                    id="edit-user-fullname"
                    type="text"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-username">Nombre de Usuario *</label>
                  <input
                    id="edit-user-username"
                    type="text"
                    value={editUserUsername}
                    onChange={(e) => setEditUserUsername(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-role">Rol de Usuario *</label>
                  <select
                    id="edit-user-role"
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value)}
                    className="form-control"
                  >
                    <option value="Administrador">Administrador (Acceso Total)</option>
                    <option value="Almacenero">Almacenero (Solo Inventario/Entradas)</option>
                    <option value="Encargado">Encargado (Solo Ventas/Clientes)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-user-password">Nueva Contraseña (Opcional)</label>
                  <input
                    id="edit-user-password"
                    type="password"
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    placeholder="Deja en blanco para mantener la clave actual"
                    className="form-control"
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Guardar Cambios
                  </button>
                  <button type="button" onClick={() => setSelectedUserToEdit(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
        {viewingReceiptImage && (
          <div className="scanner-overlay" style={{ zIndex: 11000 }} onClick={() => setViewingReceiptImage(null)}>
            <div className="glass" onClick={(e) => e.stopPropagation()} style={{ padding: "16px", maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "12px", alignItems: "center" }}>
                <h4 style={{ margin: 0, color: "var(--color-text-bright)" }}>Comprobante de Pago / Voucher</h4>
                <button onClick={() => setViewingReceiptImage(null)} className="btn btn-secondary btn-sm">
                  Cerrar
                </button>
              </div>
              <img
                src={viewingReceiptImage}
                alt="Comprobante de pago"
                style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--border-color)" }}
              />
            </div>
          </div>
        )}

      {/* SCANNER OVERLAY FOR CAMERA CAPTURING */}
      {scannerActive && (
        <QrScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setScannerActive(false)}
        />
      )}

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="scanner-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="scanner-card glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "320px", padding: "20px" }}>
            <div className="scanner-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="/logo-tunqui-red.png" alt="Logo Tunqui" style={{ height: "24px" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Menú TUNKITEK</h3>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", color: "var(--color-text-bright)", cursor: "pointer", display: "flex" }}>
                <XCircle size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {!isEncargado && (
                <button
                  onClick={() => { setActiveTab("entrada"); setMobileMenuOpen(false); }}
                  className={`btn ${activeTab === "entrada" ? "btn-primary" : "btn-secondary"} w-full`}
                  style={{ justifyContent: "flex-start", padding: "12px" }}
                >
                  <PlusCircle size={18} /> Entrada (Compra)
                </button>
              )}

              {!isAlmacenero && (
                <button
                  onClick={() => { setActiveTab("customers"); setMobileMenuOpen(false); }}
                  className={`btn ${activeTab === "customers" ? "btn-primary" : "btn-secondary"} w-full`}
                  style={{ justifyContent: "flex-start", padding: "12px" }}
                >
                  <Users size={18} /> Clientes
                </button>
              )}

              {!isAlmacenero && (
                <button
                  onClick={() => { setActiveTab("vendors"); setMobileMenuOpen(false); }}
                  className={`btn ${activeTab === "vendors" ? "btn-primary" : "btn-secondary"} w-full`}
                  style={{ justifyContent: "flex-start", padding: "12px" }}
                >
                  <Truck size={18} /> Proveedores
                </button>
              )}

              {!isAlmacenero && (
                <button
                  onClick={() => { setActiveTab("credits"); setMobileMenuOpen(false); }}
                  className={`btn ${activeTab === "credits" ? "btn-primary" : "btn-secondary"} w-full`}
                  style={{ justifyContent: "flex-start", padding: "12px" }}
                >
                  <CreditCard size={18} /> Créditos / Cuentas
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => { setActiveTab("finance"); setMobileMenuOpen(false); }}
                  className={`btn ${activeTab === "finance" ? "btn-primary" : "btn-secondary"} w-full`}
                  style={{ justifyContent: "flex-start", padding: "12px" }}
                >
                  <Briefcase size={18} /> Caja / Finanzas
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => { setActiveTab("users"); setMobileMenuOpen(false); }}
                  className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"} w-full`}
                  style={{ justifyContent: "flex-start", padding: "12px" }}
                >
                  <UserPlus size={18} /> Usuarios
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => { setActiveTab("ajustes"); setMobileMenuOpen(false); }}
                  className={`btn ${activeTab === "ajustes" ? "btn-primary" : "btn-secondary"} w-full`}
                  style={{ justifyContent: "flex-start", padding: "12px" }}
                >
                  <Settings size={18} /> Configuración
                </button>
              )}

              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="btn btn-danger w-full"
                style={{ justifyContent: "flex-start", padding: "12px", marginTop: "10px" }}
              >
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
