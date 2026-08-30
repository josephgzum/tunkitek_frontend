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
    <div className="store-wrapper">
      
      {/* 1. TOP RED BANNER (SEGO-inspired) */}
      {!hideHeader && (
        <div className="store-top-banner">
          <span>📍 Av. Francisco Bolognesi 536, Chiclayo | 📞 319-2669</span>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '4px' }}>Sucursal Chiclayo</span>
        </div>
      )}

      {/* 2. MAIN HEADER */}
      {!hideHeader && (
        <header className="store-header">
          {/* Logo */}
          <div className="store-logo" onClick={() => setActiveSubTab("store")}>
            TUNQUI<span>TEK</span>
          </div>

          {/* Search Bar */}
          <div className="store-search-container">
            <input 
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="store-search-input"
            />
            <button className="store-search-btn">
              <Search size={16} />
            </button>
          </div>

          {/* Quick Actions / Exchange Rate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Exchange Rate Badge */}
            <div className="store-rate-badge">
              <span>Tipo de Cambio</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>S/. 3.820</span>
            </div>

            {/* Cart */}
            <button 
              onClick={() => setActiveSubTab("cart")}
              className="store-action-btn"
            >
              <div className="store-action-icon">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-4px', 
                    right: '-4px', 
                    background: '#dc2626', 
                    color: 'white', 
                    fontSize: '0.65rem', 
                    fontWeight: 'bold', 
                    borderRadius: '50%', 
                    width: '18px', 
                    height: '18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden md:block" style={{ marginLeft: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', fontWeight: 'bold' }}>MI CARRITO</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1e293b' }}>Ver Carro</span>
              </div>
            </button>

            {/* User Account / Require Login */}
            <button 
              onClick={isClient ? undefined : onRequireLogin}
              className="store-action-btn"
            >
              <div className="store-action-icon">
                <User size={20} />
              </div>
              <div className="hidden md:block" style={{ marginLeft: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', fontWeight: 'bold' }}>{isClient ? "CLIENTE" : "INVITADO"}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1e293b' }}>{isClient ? currentUser.name : "Mi Cuenta"}</span>
              </div>
            </button>
          </div>
        </header>
      )}

      {/* 3. NAVIGATION BAR */}
      {!hideHeader && (
        <div className="store-nav-strip">
          <div className="store-nav-links">
            <button 
              onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); }}
              className="store-nav-categories-btn"
            >
              Categorías
            </button>
            <button 
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 550 }} 
              onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); }}
            >
              Todos los Productos
            </button>
            {!isClient && (
              <button 
                style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', fontWeight: 'bold' }} 
                onClick={() => setActiveSubTab("register")}
              >
                💡 ¿Quieres ser Distribuidor? ¡Regístrate aquí!
              </button>
            )}
          </div>
          
          <button 
            onClick={onBackToLogin}
            style={{ 
              background: 'none', 
              border: '1px solid #475569', 
              color: '#22d3ee', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              padding: '6px 12px', 
              borderRadius: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}
          >
            <ArrowLeft size={12} /> Regresar al Login
          </button>
        </div>
      )}

      {/* 4. EMBEDDED NAVIGATION (For Dashboard view) */}
      {hideHeader && (
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveSubTab("store")}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                background: activeSubTab === "store" ? "#dc2626" : "#f1f5f9",
                color: activeSubTab === "store" ? "white" : "#475569"
              }}
            >
              Ver Catálogo
            </button>
            <button 
              onClick={() => setActiveSubTab("cart")}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeSubTab === "cart" ? "#dc2626" : "#f1f5f9",
                color: activeSubTab === "cart" ? "white" : "#475569"
              }}
            >
              <ShoppingCart size={14} />
              <span>Mi Carrito</span>
              {cartCount > 0 && (
                <span style={{ background: '#dc2626', color: 'white', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', px: '12px', py: '6px', borderRadius: '16px', border: '1px solid #fee2e2', fontWeight: 'bold', fontFamily: 'monospace', marginLeft: 'auto' }}>
            💵 Tipo de Cambio: S/. 3.820
          </div>
        </div>
      )}

      {/* 5. MAIN SECTION */}
      <div className="store-content-container" style={{ flex: 1 }}>
        
        {activeSubTab === "store" && (
          <>
            {/* LEFT SIDEBAR (SEGO style) */}
            <aside className="store-sidebar">
              {/* Category radio filter */}
              <div>
                <h3 className="store-sidebar-title">Categorías</h3>
                <div className="store-sidebar-list">
                  {categories.map(cat => (
                    <label key={cat} className="store-sidebar-label">
                      <input 
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                      />
                      <span style={{ fontWeight: selectedCategory === cat ? 'bold' : 'normal', color: selectedCategory === cat ? '#dc2626' : '#475569' }}>
                        {cat === "Todos" ? "Todos los productos" : cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Filter checkbox */}
              <div style={{ marginTop: '24px' }}>
                <h3 className="store-sidebar-title">Disponibilidad</h3>
                <label className="store-sidebar-label">
                  <input 
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                  />
                  <span style={{ fontWeight: onlyInStock ? 'bold' : 'normal', color: onlyInStock ? '#dc2626' : '#475569' }}>
                    Solo productos con stock
                  </span>
                </label>
              </div>
            </aside>

            {/* PRODUCT CATALOG GRID */}
            <div className="store-catalog-section">
              {/* Client activation info */}
              {isClient && (
                <div className="store-client-banner">
                  <span>🔑 Sesión activa: <strong style={{ color: '#064e3b' }}>{currentUser.name}</strong>. Acceso exclusivo con precios autorizados.</span>
                  <span style={{ background: '#059669', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', uppercase: 'true' }}>Precios Visibles</span>
                </div>
              )}

              {/* Header section */}
              <div className="store-catalog-header">
                <div>
                  <h2 className="store-catalog-title">
                    {selectedCategory === "Todos" ? "Todos los productos" : selectedCategory}
                  </h2>
                  <div className="store-catalog-subtitle">{filteredCatalog.length} artículos encontrados</div>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontWeight: 500 }}>Cargando catálogo de productos...</div>
              ) : filteredCatalog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  No se encontraron productos con los filtros seleccionados.
                </div>
              ) : (
                <div className="store-grid">
                  {filteredCatalog.map(product => {
                    const hasStock = product.qtyAvailable > 0;
                    const sku = `SKU: TK-${product.brand.substring(0,3).toUpperCase()}-${product.id.toString().padStart(4, '0')}`;

                    return (
                      <div key={product.id} className="store-card">
                        {/* Rating Star Badge (SEGO style) */}
                        <div className="store-card-rating">
                          <Star size={10} fill="currentColor" /> 5.0
                        </div>

                        <div>
                          {/* Image Box */}
                          <div className="store-card-img-placeholder">
                            {product.type}
                          </div>

                          {/* Category and Stock Badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="store-card-type-badge">
                              {product.type}
                            </span>
                            <span className={"store-card-stock-badge " + (hasStock ? "in" : "out")}>
                              {hasStock ? `${product.qtyAvailable} En Stock` : 'Agotado'}
                            </span>
                          </div>

                          {/* Title & Brand */}
                          <h3 className="store-card-title">
                            {product.brand} {product.name}
                          </h3>
                          
                          {/* SKU */}
                          <div className="store-card-sku">{sku}</div>

                          {/* Description snippet */}
                          {product.description && (
                            <p className="store-card-desc">
                              {product.description}
                            </p>
                          )}
                        </div>

                        {/* Pricing and Action */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                          {isClient ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <div>
                                <span className="store-card-price-lbl">Precio</span>
                                <div className="store-card-price-val">
                                  {currency}{product.price?.toFixed(2)}
                                </div>
                              </div>

                              <button 
                                onClick={() => addToCart(product)}
                                disabled={!hasStock}
                                className="store-card-btn-order"
                              >
                                Pedir
                              </button>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '4px 0' }}>
                              <span className="store-card-price-lbl" style={{ display: 'block', marginBottom: '4px' }}>Ver Precio especial</span>
                              <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                <button 
                                  onClick={onRequireLogin}
                                  className="store-card-link-red"
                                >
                                  Iniciar sesión
                                </button>
                                <span style={{ color: '#cbd5e1', margin: '0 8px' }}>|</span>
                                <button 
                                  onClick={() => setActiveSubTab("register")}
                                  className="store-card-link-red"
                                >
                                  Registro
                                </button>
                                <span style={{ color: '#94a3b8', display: 'block', fontWeight: 'normal', fontSize: '0.65rem', marginTop: '4px' }}>para ver precio de distribuidor</span>
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
          </>
        )}

        {activeSubTab === "register" && !isClient && (
          <div className="store-form-card">
            <div className="store-form-title">
              <UserPlus className="text-red-650" style={{ color: '#dc2626' }} size={24} />
              <span>Solicitud de Registro de Cliente</span>
            </div>
            <p className="store-form-subtitle">
              Rellena este formulario para solicitar tu acceso al portal de compras de TUNKITEK. Al ser aprobado por el administrador, podrás ingresar, ver precios especiales y generar pedidos directamente.
            </p>

            {regSuccess && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{regSuccess}</span>
              </div>
            )}

            {regError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '16px', fontWeight: 'bold' }}>
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="store-form-group">
                <label className="store-form-label">Nombre / Razón Social *</label>
                <div className="store-form-input-wrapper">
                  <Building size={16} className="store-form-icon" />
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Telecomunicaciones SAC"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="store-form-input"
                  />
                </div>
              </div>

              <div className="store-form-group">
                <label className="store-form-label">Documento (RUC o DNI) *</label>
                <div className="store-form-input-wrapper">
                  <FileText size={16} className="store-form-icon" />
                  <input 
                    type="text"
                    required
                    maxLength={11}
                    placeholder="Ej. 20101010101"
                    value={regDocId}
                    onChange={(e) => setRegDocId(e.target.value)}
                    className="store-form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="store-form-group">
                  <label className="store-form-label">Teléfono</label>
                  <div className="store-form-input-wrapper">
                    <Phone size={16} className="store-form-icon" />
                    <input 
                      type="text"
                      placeholder="Ej. 987654321"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="store-form-input"
                    />
                  </div>
                </div>
                <div className="store-form-group">
                  <label className="store-form-label">Email</label>
                  <div className="store-form-input-wrapper">
                    <Mail size={16} className="store-form-icon" />
                    <input 
                      type="email"
                      placeholder="Ej. cliente@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="store-form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="store-form-group">
                <label className="store-form-label">Dirección de Entrega</label>
                <div className="store-form-input-wrapper">
                  <MapPin size={16} className="store-form-icon" style={{ top: '14px' }} />
                  <textarea 
                    rows={2}
                    placeholder="Calle, Avenida, Distrito..."
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="store-form-input"
                    style={{ minHeight: '60px', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="store-form-group">
                    <label className="store-form-label">Contraseña *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Mín. 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="store-form-input-noicon"
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Repetir Contraseña *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Confirmar"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="store-form-input-noicon"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="store-form-btn-submit">
                Enviar Solicitud de Registro
              </button>
            </form>
          </div>
        )}

        {activeSubTab === "cart" && (
          <div className="store-cart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="store-catalog-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart className="text-red-600" style={{ color: '#dc2626' }} /> 
                <span>Carrito de Pedido</span>
              </h2>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {cartCount} artículo(s)
              </span>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <p style={{ color: '#94a3b8', marginBottom: '24px', fontWeight: 500 }}>No tienes ningún artículo agregado a tu carrito.</p>
                <button 
                  onClick={() => setActiveSubTab("store")}
                  className="store-card-btn-order"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cart.map(item => {
                    const sku = `SKU: TK-${item.brand.substring(0,3).toUpperCase()}-${item.id.toString().padStart(4, '0')}`;
                    return (
                      <div key={item.id} className="store-cart-item">
                        <div style={{ flex: 1 }}>
                          <span className="store-card-type-badge" style={{ marginBottom: '4px', display: 'inline-block' }}>
                            {item.type}
                          </span>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b', margin: 0, textTransform: 'uppercase' }}>{item.brand} {item.name}</h4>
                          <span className="store-card-sku">{sku}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>CANT:</span>
                            <input 
                              type="number"
                              min="1"
                              max={item.qtyAvailable}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, e.target.value)}
                              className="store-cart-qty-input"
                            />
                          </div>

                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            {isClient ? (
                              <div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 900, color: '#1e293b', fontFamily: 'monospace', display: 'block' }}>
                                  {currency}{(item.price * item.quantity).toFixed(2)}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                  ({currency}{item.price.toFixed(2)} c/u)
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                <Lock size={10} /> Precios Privados
                              </span>
                            )}
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                            title="Quitar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '24px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    {isClient ? (
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', display: 'block', uppercase: 'true' }}>Total Estimado</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626', fontFamily: 'monospace' }}>
                          {currency}{cartTotal.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div style={{ background: '#fefbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '6px', maxWidth: '350px' }}>
                        <p style={{ fontSize: '0.65rem', color: '#b45309', margin: 0, fontWeight: 600 }}>
                          ⚠️ Podrás ver el total y enviar el pedido una vez que el administrador apruebe tu registro de distribuidor e inicies sesión.
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flex: '1', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setCart([])}
                      style={{
                        padding: '10px 20px',
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#475569',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    >
                      Vaciar Carrito
                    </button>
                    <button 
                      onClick={checkoutOrder}
                      style={{
                        padding: '10px 24px',
                        background: '#dc2626',
                        border: 'none',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textTransform: 'uppercase'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                    >
                      {isClient ? "Enviar Pedido" : "Inicia Sesión para Pedir"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
