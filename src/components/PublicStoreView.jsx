import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  UserPlus, 
  Lock, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  User,
  Heart,
  Grid,
  List,
  ChevronRight,
  Star,
  Info,
  ArrowLeft
} from 'lucide-react';

export default function PublicStoreView({ API_URL, currentUser, currency, onRequireLogin, onBackToLogin, hideHeader }) {
  const [activeSubTab, setActiveSubTab] = useState("store"); // "store" | "register" | "cart"
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sidebar Filters
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [onlyInStock, setOnlyInStock] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState([]);

  // Pre-registration Form state
  const [regName, setRegName] = useState("");
  const [regDocId, setRegDocId] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regError, setRegError] = useState("");

  const isClient = currentUser?.role === "Cliente";
  const token = localStorage.getItem("tunkitek_token");

  // Load catalog
  const loadCatalog = () => {
    setLoading(true);
    const endpoint = isClient ? "/api/store/client/catalog" : "/api/store/catalog";
    const headers = token && isClient ? { "Authorization": `Bearer ${token}` } : {};

    fetch(API_URL + endpoint, { headers })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCatalog(data);
        }
      })
      .catch(e => console.error("Error loading store catalog:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCatalog();
  }, [isClient, token]);

  // Handle registration submission
  const handleRegister = (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regName.trim() || !regDocId.trim() || !regPassword) {
      setRegError("El Nombre/Razón Social, Documento (DNI/RUC) y Contraseña son requeridos.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Las contraseñas no coinciden.");
      return;
    }

    fetch(API_URL + "/api/store/pre-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: regName.trim(),
        docId: regDocId.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(),
        address: regAddress.trim(),
        password: regPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setRegError(data.message || "Error al procesar el registro.");
        } else {
          setRegSuccess(data.message || "Solicitud de registro enviada con éxito.");
          // Clear inputs
          setRegName("");
          setRegDocId("");
          setRegPhone("");
          setRegEmail("");
          setRegAddress("");
          setRegPassword("");
          setRegConfirmPassword("");
        }
      })
      .catch(err => {
        console.error(err);
        setRegError("Error de red al conectar con el servidor.");
      });
  };

  // Cart operations
  const addToCart = (product) => {
    const qtyToAdd = 1;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.qtyAvailable) {
        alert("No hay suficiente stock disponible de este producto.");
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      if (product.qtyAvailable <= 0) {
        alert("Este producto no cuenta con stock disponible.");
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQty) => {
    const product = catalog.find(p => p.id === productId);
    const qty = parseInt(newQty) || 1;
    if (qty > product.qtyAvailable) {
      alert(`Solo hay ${product.qtyAvailable} unidades disponibles.`);
      return;
    }
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: qty } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const checkoutOrder = () => {
    if (!isClient) {
      alert("Debes iniciar sesión como cliente para enviar un pedido.");
      onRequireLogin();
      return;
    }

    if (cart.length === 0) {
      alert("Tu carrito de pedidos está vacío.");
      return;
    }

    const payload = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    fetch(API_URL + "/api/store/client/orders", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.message || "Error al registrar el pedido.");
        } else {
          alert("¡Tu pedido ha sido registrado con éxito! El administrador se comunicará para el despacho.");
          setCart([]);
          setActiveSubTab("store");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error de conexión al enviar el pedido.");
      });
  };

  // Filter and Category mappings
  const categories = ["Todos", ...new Set(catalog.map(p => p.type))];

  const filteredCatalog = catalog.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Todos" || p.type === selectedCategory;
    const matchesStock = !onlyInStock || p.qtyAvailable > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800 font-sans">
      
      {/* 1. TOP RED BANNER (SEGO-inspired) */}
      {!hideHeader && (
        <div className="bg-red-600 text-white text-xs py-1.5 px-4">
          <div className="container mx-auto flex justify-between items-center flex-wrap gap-2 font-medium">
            <span>📍 Av. Francisco Bolognesi 536, Chiclayo | 📞 319-2669</span>
            <span className="bg-slate-900/40 px-2 py-0.5 rounded">Sucursal Chiclayo</span>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER */}
      {!hideHeader && (
        <header className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveSubTab("store")}>
              <span className="text-3xl font-black italic tracking-tighter text-red-600">TUNQUI</span>
              <span className="text-2xl font-bold tracking-tight text-slate-800">TEK</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 relative hidden sm:block">
              <input 
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 pr-12 text-slate-800 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition"
              />
              <button className="absolute right-1 top-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded transition">
                <Search size={16} />
              </button>
            </div>

            {/* Quick Actions / Exchange Rate */}
            <div className="flex items-center gap-6">
              {/* Exchange Rate Badge */}
              <div className="bg-red-600 text-white font-bold text-xs px-3 py-2 rounded flex items-center gap-1.5 shadow-sm">
                <span>Tipo de Cambio</span>
                <span className="font-mono text-sm">S/. 3.820</span>
              </div>

              {/* Cart */}
              <button 
                onClick={() => setActiveSubTab("cart")}
                className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition relative"
              >
                <div className="bg-slate-100 p-2 rounded-full relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-3xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-2xs text-slate-400 block font-semibold uppercase">Mi Carrito</span>
                  <span className="text-xs font-bold text-slate-800">Ver Carro</span>
                </div>
              </button>

              {/* User Account / Require Login */}
              <button 
                onClick={isClient ? undefined : onRequireLogin}
                className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition"
              >
                <div className="bg-slate-100 p-2 rounded-full">
                  <User size={20} />
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-2xs text-slate-400 block font-semibold uppercase">{isClient ? "Cliente" : "Invitado"}</span>
                  <span className="text-xs font-bold text-slate-800">{isClient ? currentUser.name : "Mi Cuenta"}</span>
                </div>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 3. NAVIGATION BAR */}
      {!hideHeader && (
        <div className="bg-slate-900 text-white text-sm py-2 px-4 shadow">
          <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-6 font-medium">
              <button 
                onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); }}
                className="bg-red-600 text-white font-bold py-1.5 px-4 rounded text-xs flex items-center gap-1.5 hover:bg-red-700 uppercase"
              >
                Categorías
              </button>
              <button onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); }} className="hover:text-red-500 transition">Todos los Productos</button>
              {!isClient && (
                <button onClick={() => setActiveSubTab("register")} className="text-yellow-400 hover:text-yellow-300 font-bold transition flex items-center gap-1">
                  💡 ¿Quieres ser Distribuidor? ¡Regístrate aquí!
                </button>
              )}
            </div>
            
            <button 
              onClick={onBackToLogin}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 py-1.5 px-3 rounded flex items-center gap-1 font-bold border border-slate-700 uppercase"
            >
              <ArrowLeft size={12} /> Regresar al Login
            </button>
          </div>
        </div>
      )}

      {/* 4. EMBEDDED NAVIGATION (For Dashboard view) */}
      {hideHeader && (
        <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveSubTab("store")}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition ${activeSubTab === "store" ? "bg-red-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
            >
              Ver Catálogo
            </button>
            <button 
              onClick={() => setActiveSubTab("cart")}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition flex items-center gap-2 relative ${activeSubTab === "cart" ? "bg-red-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
            >
              <ShoppingCart size={14} />
              <span>Mi Carrito</span>
              {cartCount > 0 && (
                <span className="bg-red-600 text-white rounded-full text-3xs font-bold px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <div className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full border border-red-200 font-bold font-mono">
            💵 Tipo de Cambio: S/. 3.820
          </div>
        </div>
      )}

      {/* 5. MAIN SECTION */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        
        {/* LOGGED IN CLIENT BANNER */}
        {isClient && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center flex-wrap gap-2 shadow-sm">
            <span className="text-sm text-emerald-800 font-medium">
              🔑 Sesión activa: <strong className="text-emerald-950 font-bold">{currentUser.name}</strong>. Acceso exclusivo con precios autorizados.
            </span>
            <span className="text-2xs bg-emerald-600 text-white px-2 py-1 rounded font-bold uppercase">
              Precios Visibles
            </span>
          </div>
        )}

        {activeSubTab === "store" && (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* LEFT SIDEBAR (SEGO style) */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-5 shadow-sm self-start">
              
              {/* Category radio filter */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase text-xs tracking-wider">Categorías</h3>
                <div className="space-y-2.5">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 text-sm cursor-pointer select-none hover:text-red-600 transition">
                      <input 
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500 accent-red-600"
                      />
                      <span className={selectedCategory === cat ? "font-bold text-red-600" : "text-slate-600"}>
                        {cat === "Todos" ? "Todos los productos" : cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter checkbox */}
              <div>
                <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase text-xs tracking-wider">Disponibilidad</h3>
                <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none hover:text-red-600 transition">
                  <input 
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500 accent-red-600"
                  />
                  <span className={onlyInStock ? "font-bold text-red-600" : "text-slate-600"}>
                    Solo productos con stock
                  </span>
                </label>
              </div>
            </aside>

            {/* PRODUCT CATALOG GRID */}
            <div className="flex-1">
              
              {/* Search mobile / count */}
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {selectedCategory === "Todos" ? "Todos los productos" : selectedCategory}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium font-mono">{filteredCatalog.length} artículos encontrados</p>
                </div>

                <div className="block sm:hidden w-full">
                  <input 
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 text-slate-400 font-medium">Cargando catálogo de productos...</div>
              ) : filteredCatalog.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm">
                  No se encontraron productos con los filtros seleccionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.map(product => {
                    const hasStock = product.qtyAvailable > 0;
                    const sku = `SKU: TK-${product.brand.substring(0,3).toUpperCase()}-${product.id.toString().padStart(4, '0')}`;

                    return (
                      <div 
                        key={product.id}
                        className="bg-white border border-slate-200 hover:border-red-500 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200 relative group"
                      >
                        {/* Rating Star Badge (SEGO style) */}
                        <div className="absolute top-4 right-4 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full px-2 py-0.5 text-3xs font-extrabold flex items-center gap-1">
                          <Star size={10} fill="currentColor" /> 5.0
                        </div>

                        <div>
                          {/* Image Box */}
                          <div className="w-full h-40 bg-slate-100 rounded-lg mb-4 flex items-center justify-center border border-slate-100 group-hover:bg-slate-50/50 transition">
                            <span className="text-slate-300 font-black text-4xl tracking-tighter uppercase italic select-none">
                              {product.type}
                            </span>
                          </div>

                          {/* Category and Stock Badge */}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-3xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                              {product.type}
                            </span>
                            <span className={`text-3xs px-2 py-0.5 rounded font-extrabold uppercase ${hasStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                              {hasStock ? `${product.qtyAvailable} En Stock` : 'Agotado'}
                            </span>
                          </div>

                          {/* Title & Brand */}
                          <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-red-600 uppercase tracking-tight line-clamp-2 min-h-[40px] mb-1">
                            {product.brand} {product.name}
                          </h3>
                          
                          {/* SKU */}
                          <p className="text-3xs text-slate-400 font-mono font-bold mb-3">{sku}</p>

                          {/* Description snippet */}
                          {product.description && (
                            <p className="text-2xs text-slate-400 line-clamp-2 bg-slate-50 p-2 rounded mb-4">
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                          {/* Pricing and Action */}
                          {isClient ? (
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <span className="text-3xs text-slate-400 font-bold block uppercase">Precio</span>
                                <span className="text-lg font-black text-slate-850 font-mono">
                                  {currency}{product.price?.toFixed(2)}
                                </span>
                              </div>

                              <button 
                                onClick={() => addToCart(product)}
                                disabled={!hasStock}
                                className={`px-4 py-2 rounded text-xs font-bold uppercase transition shadow-sm ${hasStock ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                              >
                                Pedir
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-1">
                              <span className="text-3xs text-slate-400 font-bold block uppercase mb-1">Ver Precio especial</span>
                              <div className="text-xs font-bold">
                                <button 
                                  onClick={onRequireLogin}
                                  className="text-red-600 hover:text-red-700 hover:underline transition"
                                >
                                  Iniciar sesión
                                </button>
                                <span className="text-slate-300 mx-1.5">|</span>
                                <button 
                                  onClick={() => setActiveSubTab("register")}
                                  className="text-red-600 hover:text-red-700 hover:underline transition"
                                >
                                  Registro
                                </button>
                                <span className="text-slate-400 block font-normal text-3xs mt-1">para ver precio de distribuidor</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === "register" && !isClient && (
          <div className="max-w-lg mx-auto bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <UserPlus className="text-red-600" size={26} />
              <h2 className="text-xl font-extrabold text-slate-900">Solicitud de Registro de Cliente</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              Rellena este formulario para solicitar tu acceso al portal de compras de TUNKITEK. Al ser aprobado por el administrador, podrás ingresar, ver precios especiales y generar pedidos directamente.
            </p>

            {regSuccess && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-start gap-2">
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {regError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-250 text-red-600 rounded-lg text-sm font-medium">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-2xs text-slate-400 font-bold uppercase block mb-1">Nombre / Razón Social *</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Telecomunicaciones SAC"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 pl-10 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-2xs text-slate-400 font-bold uppercase block mb-1">Documento (RUC o DNI) *</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text"
                    required
                    maxLength={11}
                    placeholder="Ej. 20101010101"
                    value={regDocId}
                    onChange={(e) => setRegDocId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 pl-10 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-2xs text-slate-400 font-bold uppercase block mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Ej. 987654321"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 pl-10 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-2xs text-slate-400 font-bold uppercase block mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="email"
                      placeholder="Ej. cliente@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 pl-10 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-2xs text-slate-400 font-bold uppercase block mb-1">Dirección de Entrega</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <textarea 
                    rows={2}
                    placeholder="Calle, Avenida, Distrito..."
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 pl-10 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-2xs text-slate-400 font-bold uppercase block mb-1">Contraseña *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Mín. 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-2xs text-slate-400 font-bold uppercase block mb-1">Repetir Contraseña *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Confirmar"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 p-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg shadow-sm uppercase text-sm tracking-wider transition"
              >
                Enviar Solicitud de Registro
              </button>
            </form>
          </div>
        )}

        {activeSubTab === "cart" && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="text-red-600" /> Carrito de Pedido
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                {cartCount} artículo(s)
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-6 font-medium">No tienes ningún artículo agregado a tu carrito.</p>
                <button 
                  onClick={() => setActiveSubTab("store")}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              <div>
                <div className="space-y-4">
                  {cart.map(item => {
                    const sku = `SKU: TK-${item.brand.substring(0,3).toUpperCase()}-${item.id.toString().padStart(4, '0')}`;
                    return (
                      <div 
                        key={item.id}
                        className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between flex-wrap gap-4"
                      >
                        <div className="flex-1">
                          <span className="text-3xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider mb-1 inline-block">
                            {item.type}
                          </span>
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase">{item.brand} {item.name}</h4>
                          <p className="text-3xs text-slate-400 font-mono font-bold">{sku}</p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold uppercase">Cant:</span>
                            <input 
                              type="number"
                              min="1"
                              max={item.qtyAvailable}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, e.target.value)}
                              className="bg-white border border-slate-350 rounded p-1 w-16 text-center focus:outline-none focus:border-red-600 text-sm font-bold font-mono"
                            />
                          </div>

                          <div className="text-right min-w-[100px]">
                            {isClient ? (
                              <div>
                                <span className="text-sm font-extrabold text-slate-800 font-mono block">
                                  {currency}{(item.price * item.quantity).toFixed(2)}
                                </span>
                                <span className="text-3xs text-slate-400 font-mono font-bold">
                                  ({currency}{item.price.toFixed(2)} c/u)
                                </span>
                              </div>
                            ) : (
                              <span className="text-3xs text-red-500 font-bold flex items-center gap-1 justify-end">
                                <Lock size={10} /> Precios Privados
                              </span>
                            )}
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-slate-200 transition"
                            title="Quitar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    {isClient ? (
                      <div className="text-left">
                        <span className="text-3xs text-slate-450 font-bold block uppercase tracking-wider">Total Estimado</span>
                        <span className="text-2xl font-black text-red-600 font-mono">
                          {currency}{cartTotal.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-sm">
                        <p className="text-3xs text-yellow-700 font-semibold">
                          ⚠️ Podrás ver el total y enviar el pedido una vez que el administrador apruebe tu registro de distribuidor e inicies sesión.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setCart([])}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold text-xs uppercase transition tracking-wider"
                    >
                      Vaciar Carrito
                    </button>
                    <button 
                      onClick={checkoutOrder}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition"
                    >
                      {isClient ? "Enviar Pedido" : "Inicia Sesión para Pedir"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
