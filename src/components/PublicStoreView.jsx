/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
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
  ArrowLeft,
  AlertTriangle,
  LayoutDashboard,
  CreditCard,
  Package,
  LogOut,
  Paperclip
} from 'lucide-react';

export default function PublicStoreView({ 
  API_URL, 
  currentUser, 
  currency, 
  customerCredits = [], 
  customerPurchases = [], 
  customerOrders = [],
  devices = [],
  onLoginSuccess,
  onLogout,
  hideHeader
}) {
  const [activeSubTab, setActiveSubTab] = useState("home"); // "home" | "store" | "register" | "cart" | "login-customer" | "login-staff" | "account" | "about-us"
  const [accountSection, setAccountSection] = useState("summary"); // "summary" | "purchases" | "credits" | "orders"
  
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sidebar Filters
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  
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

  // Login Form states
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoad, setLoginLoad] = useState(false);

  // Customer purchase search state
  const [purchaseSearch, setPurchaseSearch] = useState("");

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

  // Handle Login (Customer or Staff)
  const executeLogin = (e, type) => {
    e.preventDefault();
    setLoginErr("");
    setLoginLoad(true);

    const isCustomer = type === "customer";
    const endpoint = isCustomer ? "/api/customers/portal/login" : "/api/auth/login";
    
    // Body layout: customer uses docId, staff uses username
    const payload = isCustomer 
      ? { docId: loginUser.trim(), password: loginPass }
      : { username: loginUser.trim(), password: loginPass };

    fetch(API_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setLoginErr(data.message || "Credenciales incorrectas.");
        } else {
          // Success
          setLoginUser("");
          setLoginPass("");
          
          if (isCustomer) {
            onLoginSuccess(data.customer, data.token, "customer");
            setActiveSubTab("store");
          } else {
            onLoginSuccess(data.user, data.token, "admin");
          }
        }
      })
      .catch(err => {
        console.error(err);
        setLoginErr("Error de red al conectar con el servidor.");
      })
      .finally(() => setLoginLoad(false));
  };

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
      setActiveSubTab("login-customer");
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
  const brandsList = [...new Set(catalog.map(p => p.brand))];

  const filteredCatalog = catalog.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Todos" || p.type === selectedCategory;
    const matchesStock = !onlyInStock || p.qtyAvailable > 0;
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);

    return matchesSearch && matchesCategory && matchesStock && matchesBrand;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  // Formatter helpers
  const formatShortDate = (dateStr) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
  };

  // Filter purchases list
  const filteredPurchases = customerPurchases.filter(d => {
    const term = purchaseSearch.toLowerCase();
    return (
      d.brand.toLowerCase().includes(term) ||
      d.model.toLowerCase().includes(term) ||
      d.sn.toLowerCase().includes(term) ||
      (d.notes && d.notes.toLowerCase().includes(term))
    );
  });

  return (
    <div className="store-wrapper">
      
      {/* 1. TOP RED BANNER (Chimbote Address + Staff login link) */}
      {!hideHeader && (
        <div className="store-top-banner">
          <span>📍 AV. JOSÉ GÁLVEZ 557, CHIMBOTE | 📞 Tel: 923030000</span>
          <button 
            onClick={() => {
              setLoginErr("");
              setLoginUser("");
              setLoginPass("");
              setActiveSubTab("login-staff");
            }}
            style={{ 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white', 
              padding: '3px 10px', 
              borderRadius: '4px', 
              fontSize: '0.7rem', 
              fontWeight: 'bold', 
              border: 'none', 
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
          >
            🏢 Acceso Personal (Chimbote)
          </button>
        </div>
      )}

      {/* 2. MAIN HEADER */}
      {!hideHeader && (
        <header className="store-header">
          {/* Logo */}
          <div className="store-logo" onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); }}>
            TUNKI<span>TEK</span>
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

            {/* User Account / My Account portal redirect */}
            <button 
              onClick={() => {
                if (isClient) {
                  setActiveSubTab("account");
                  setAccountSection("summary");
                } else {
                  setLoginErr("");
                  setLoginUser("");
                  setLoginPass("");
                  setActiveSubTab("login-customer");
                }
              }}
              className="store-action-btn"
            >
              <div className="store-action-icon">
                <User size={20} />
              </div>
              <div className="hidden md:block" style={{ marginLeft: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', fontWeight: 'bold' }}>{isClient ? "CLIENTE" : "INVITADO"}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1e293b' }}>{isClient ? "Mi Cuenta" : "Iniciar Sesión"}</span>
              </div>
            </button>
          </div>
        </header>
      )}

      {/* 3. NAVIGATION BAR */}
      {!hideHeader && (
        <div className="store-nav-strip">
          <div className="store-nav-links" style={{ gap: '10px' }}>
            <button 
              onClick={() => setActiveSubTab("home")}
              style={{
                background: activeSubTab === "home" ? 'white' : 'transparent',
                border: 'none',
                color: activeSubTab === "home" ? '#dc2626' : 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                padding: '6px 14px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              Inicio
            </button>
            
            <button 
              onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); setSelectedBrands([]); }}
              style={{
                background: activeSubTab === "store" ? 'white' : 'transparent',
                border: 'none',
                color: activeSubTab === "store" ? '#dc2626' : 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                padding: '6px 14px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              Tienda Online
            </button>

            <button 
              onClick={() => setActiveSubTab("about-us")}
              style={{
                background: activeSubTab === "about-us" ? 'white' : 'transparent',
                border: 'none',
                color: activeSubTab === "about-us" ? '#dc2626' : 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                padding: '6px 14px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              Nosotros
            </button>

            {isClient && (
              <button 
                onClick={() => { setActiveSubTab("account"); setAccountSection("summary"); }}
                style={{
                  background: activeSubTab === "account" ? 'white' : 'transparent',
                  border: 'none',
                  color: activeSubTab === "account" ? '#dc2626' : '#facc15',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                📊 Mi Panel de Distribuidor
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. EMBEDDED NAVIGATION (For Dashboard view in admin, although customers won't see it now) */}
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

      {/* 5. MAIN CONTENT AREA */}
      <div className="store-content-container" style={{ flex: 1 }}>
        
        {/* TAB: CORPORATE HOME PAGE */}
        {activeSubTab === "home" && (
          <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>
            {/* Hero Banner */}
            <div style={{ 
              background: '#0f172a', 
              color: 'white', 
              borderRadius: '12px', 
              padding: '60px 32px', 
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{ 
                  background: '#dc2626', 
                  color: 'white', 
                  fontSize: '0.65rem', 
                  fontWeight: 'bold', 
                  padding: '4px 12px', 
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  Infraestructura & Tecnología
                </span>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '16px 0 8px 0', letterSpacing: '-0.03em', color: '#ffffff' }}>
                  TUNKITEK
                </h1>
                <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 24px auto', lineHeight: '1.6rem', fontWeight: '500' }}>
                  Soluciones integrales en telecomunicaciones, comercialización de equipamiento de fibra óptica e integración de proyectos tecnológicos con verdadero ADN peruano.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); setSelectedBrands([]); }}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                  >
                    🛒 Explorar Catálogo
                  </button>
                  <a 
                    href="https://wa.me/51923030000?text=Hola,%20deseo%20cotizar%20servicios/equipos%20con%20Tunkitek."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#22c55e',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    💬 Contactar Asesor
                  </a>
                </div>
              </div>
              {/* Background watermark */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-20px',
                opacity: 0.05,
                fontSize: '12rem',
                fontWeight: 900,
                color: 'white',
                userSelect: 'none',
                fontStyle: 'italic'
              }}>
                TUNKI
              </div>
            </div>

            {/* Líneas de Negocio (Modules Grid) */}
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nuestras Líneas de Negocio
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
                Diseñamos, ejecutamos y suministramos todo lo que tu red y empresa necesitan para alcanzar el máximo rendimiento.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {/* Module 1 */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', borderTop: '4px solid #dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>📡</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                    Servicios de Telecomunicaciones
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.35rem' }}>
                    Ejecución, diseño, tendido y mantenimiento de redes de fibra óptica (FTTH/GPON), fusiones de precisión, empalmes mecánicos, enlaces inalámbricos de alta disponibilidad y soporte de planta externa.
                  </p>
                </div>

                {/* Module 2 */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', borderTop: '4px solid #dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>🔌</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                    Comercialización de Bienes
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.35rem' }}>
                    Distribución y venta directa de equipamiento de telecomunicaciones homologado: ONUs/ONTs, OLTs, switches, routers, conversores de medios, bandejas de distribución (ODF), cables y consumibles de fibra.
                  </p>
                </div>

                {/* Module 3 */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', borderTop: '4px solid #dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>⚙️</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                    Integración de Proyectos
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.35rem' }}>
                    Soluciones tecnológicas llave en mano para ISPs, operadores de cable y corporativos. Integramos sistemas uniendo hardware de alto rendimiento y software de aprovisionamiento optimizado.
                  </p>
                </div>

                {/* Module 4 */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', borderTop: '4px solid #dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>💻</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                    Servicios Informáticos
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.35rem' }}>
                    Soporte de sistemas, configuración y administración de servidores locales y en la nube (cloud), consultoría en seguridad de red y auditorías informáticas para garantizar la continuidad operativa de tu negocio.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats / Pitch */}
            <div style={{ 
              background: '#f1f5f9', 
              borderRadius: '8px', 
              padding: '24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '24px',
              textAlign: 'center'
            }}>
              <div>
                <strong style={{ fontSize: '1.5rem', color: '#dc2626', display: 'block', fontFamily: 'monospace' }}>100%</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Garantía y Soporte</span>
              </div>
              <div style={{ borderLeft: '1px solid #cbd5e1', height: '40px' }}></div>
              <div>
                <strong style={{ fontSize: '1.5rem', color: '#dc2626', display: 'block', fontFamily: 'monospace' }}>24/7</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Servicios de Emergencia</span>
              </div>
              <div style={{ borderLeft: '1px solid #cbd5e1', height: '40px' }}></div>
              <div>
                <strong style={{ fontSize: '1.5rem', color: '#dc2626', display: 'block', fontFamily: 'monospace' }}>ISPs y Empresas</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Clientes de Confianza</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STORE CATALOG */}
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

              {/* Brands Filter (Checkboxes) */}
              <div style={{ marginTop: '24px' }}>
                <h3 className="store-sidebar-title">Marcas</h3>
                <div className="store-sidebar-list">
                  {brandsList.map(brand => (
                    <label key={brand} className="store-sidebar-label">
                      <input 
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }
                        }}
                      />
                      <span style={{ 
                        fontWeight: selectedBrands.includes(brand) ? 'bold' : 'normal', 
                        color: selectedBrands.includes(brand) ? '#dc2626' : '#475569' 
                      }}>
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* PRODUCT CATALOG GRID */}
            <div className="store-catalog-section">
              {/* Client activation info */}
              {isClient && (
                <div className="store-client-banner">
                  <span>🔑 Distribuidor: <strong style={{ color: '#064e3b' }}>{currentUser.name}</strong>. Acceso exclusivo con precios autorizados.</span>
                  <span style={{ background: '#059669', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Precios Visibles</span>
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
                        {/* Rating Star Badge */}
                        <div className="store-card-rating">
                          <Star size={10} fill="currentColor" /> 5.0
                        </div>

                        <div>
                          {/* Image Box */}
                          <div className="store-card-img-placeholder" style={{ padding: '16px' }}>
                            <img 
                              src={product.imageUrl || "/logo-tunqui-red.png"} 
                              alt={product.name} 
                              style={{ 
                                maxHeight: '90px', 
                                maxWidth: '100%', 
                                objectFit: 'contain', 
                                opacity: product.imageUrl ? 1 : 0.9 
                              }}
                              onError={(e) => { 
                                if (product.imageUrl) {
                                  e.target.src = "/logo-tunqui-red.png";
                                  e.target.style.opacity = 0.9;
                                } else {
                                  e.target.style.display = 'none';
                                }
                              }}
                            />
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

                              {hasStock ? (
                                <button 
                                  onClick={() => addToCart(product)}
                                  className="store-card-btn-order"
                                >
                                  Pedir
                                </button>
                              ) : (
                                <a 
                                  href={`https://wa.me/51923030000?text=Hola,%20deseo%20cotizar/consultar%20el%20producto%20${encodeURIComponent(product.brand + ' ' + product.name)}%20que%20figura%20sin%20stock.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    background: '#22c55e',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    textTransform: 'uppercase',
                                    display: 'inline-block',
                                    textAlign: 'center'
                                  }}
                                >
                                  Cotizar
                                </a>
                              )}
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '4px 0' }}>
                              <span className="store-card-price-lbl" style={{ display: 'block', marginBottom: '4px' }}>Ver Precio especial</span>
                              <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                <button 
                                  onClick={() => {
                                    setLoginErr("");
                                    setLoginUser("");
                                    setLoginPass("");
                                    setActiveSubTab("login-customer");
                                  }}
                                  className="store-card-link-red"
                                >
                                  Iniciar sesión
                                </button>
                                <span style={{ color: '#94a3b8', display: 'block', fontWeight: 'normal', fontSize: '0.65rem', marginTop: '4px' }}>para ver precio de distribuidor</span>
                              </div>
                              
                              {/* Cotizar con Asesor (WhatsApp) for Guests */}
                              <div style={{ marginTop: '10px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                                <a 
                                  href={`https://wa.me/51923030000?text=Hola,%20deseo%20más%20información%20y%20cotizar%20el%20producto%20${encodeURIComponent(product.brand + ' ' + product.name)}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#16a34a',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  💬 Cotizar con Asesor
                                </a>
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

        {/* TAB: LOGIN CUSTOMER */}
        {activeSubTab === "login-customer" && (
          <div className="store-form-card">
            <div className="store-form-title">
              <User style={{ color: '#dc2626' }} size={24} />
              <span>Acceso de Clientes / Distribuidores</span>
            </div>
            <p className="store-form-subtitle">
              Ingresa tu documento tributario (DNI o RUC) y contraseña para acceder a precios de distribuidor y enviar pedidos.
            </p>

            {loginErr && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '16px', fontWeight: 'bold' }}>
                {loginErr}
              </div>
            )}

            <form onSubmit={(e) => executeLogin(e, "customer")} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="store-form-group">
                <label className="store-form-label">RUC o DNI del Cliente *</label>
                <div className="store-form-input-wrapper">
                  <FileText size={16} className="store-form-icon" />
                  <input 
                    type="text"
                    required
                    placeholder="Ej. RUC 20101010101"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="store-form-input"
                  />
                </div>
              </div>

              <div className="store-form-group">
                <label className="store-form-label">Contraseña de Distribuidor *</label>
                <div className="store-form-input-wrapper">
                  <Lock size={16} className="store-form-icon" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="store-form-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loginLoad} className="store-form-btn-submit">
                {loginLoad ? "Verificando..." : "Iniciar Sesión Cliente"}
              </button>
            </form>
          </div>
        )}

        {/* TAB: LOGIN STAFF */}
        {activeSubTab === "login-staff" && (
          <div className="store-form-card" style={{ border: '1px solid #cbd5e1' }}>
            <div className="store-form-title">
              <Building style={{ color: '#dc2626' }} size={24} />
              <span>Acceso de Personal - Sucursal Chimbote</span>
            </div>
            <p className="store-form-subtitle">
              Portal restringido para el personal administrativo y almaceneros de TUNKITEK.
            </p>

            {loginErr && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '16px', fontWeight: 'bold' }}>
                {loginErr}
              </div>
            )}

            <form onSubmit={(e) => executeLogin(e, "admin")} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="store-form-group">
                <label className="store-form-label">Usuario de Personal *</label>
                <div className="store-form-input-wrapper">
                  <User size={16} className="store-form-icon" />
                  <input 
                    type="text"
                    required
                    placeholder="Tu nombre de usuario"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="store-form-input"
                  />
                </div>
              </div>

              <div className="store-form-group">
                <label className="store-form-label">Contraseña *</label>
                <div className="store-form-input-wrapper">
                  <Lock size={16} className="store-form-icon" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="store-form-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loginLoad} className="store-form-btn-submit">
                {loginLoad ? "Ingresando..." : "Ingresar al Panel de Gestión"}
              </button>
            </form>
          </div>
        )}

        {/* TAB: REGISTER PUBLIC FORM */}
        {activeSubTab === "register" && !isClient && (
          <div className="store-form-card">
            <div className="store-form-title">
              <UserPlus style={{ color: '#dc2626' }} size={24} />
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

        {/* TAB: SHOPPING CART */}
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

        {/* TAB: CLIENT INTEGRATED PORTAL (accountSection) */}
        {activeSubTab === "account" && isClient && (
          <>
            {/* LEFT SIDEBAR: ACCOUNT ACTIONS */}
            <aside className="store-sidebar">
              <h3 className="store-sidebar-title">Mi Cuenta</h3>
              <div className="store-sidebar-list">
                <button 
                  onClick={() => setAccountSection("summary")}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: accountSection === "summary" ? '#fee2e2' : 'none',
                    color: accountSection === "summary" ? '#dc2626' : '#475569',
                    fontWeight: accountSection === "summary" ? 'bold' : 'normal',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <LayoutDashboard size={16} />
                  <span>Resumen General</span>
                </button>

                <button 
                  onClick={() => setAccountSection("purchases")}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: accountSection === "purchases" ? '#fee2e2' : 'none',
                    color: accountSection === "purchases" ? '#dc2626' : '#475569',
                    fontWeight: accountSection === "purchases" ? 'bold' : 'normal',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <Package size={16} />
                  <span>Equipos Adquiridos</span>
                </button>

                <button 
                  onClick={() => setAccountSection("credits")}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: accountSection === "credits" ? '#fee2e2' : 'none',
                    color: accountSection === "credits" ? '#dc2626' : '#475569',
                    fontWeight: accountSection === "credits" ? 'bold' : 'normal',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <CreditCard size={16} />
                  <span>Mis Deudas y Pagos</span>
                </button>

                <button 
                  onClick={() => setAccountSection("orders")}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: accountSection === "orders" ? '#fee2e2' : 'none',
                    color: accountSection === "orders" ? '#dc2626' : '#475569',
                    fontWeight: accountSection === "orders" ? 'bold' : 'normal',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>Mis Pedidos Tienda</span>
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm("¿Seguro que deseas cerrar tu sesión?")) {
                      onLogout();
                      setActiveSubTab("store");
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    background: 'none',
                    color: '#ef4444',
                    fontWeight: 'bold',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    marginTop: '16px',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '16px'
                  }}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </aside>

            {/* MAIN DATA RENDERING */}
            <div className="store-catalog-section" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
              
              {/* SUBSECTION: SUMMARY */}
              {accountSection === "summary" && (
                <div>
                  <h2 className="store-catalog-title" style={{ marginBottom: '16px' }}>Resumen de Cuenta Distribuidor</h2>
                  
                  {/* Financial Stats Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ border: '1px solid #fee2e2', padding: '16px', borderRadius: '8px', background: '#fffafb' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', fontWeight: 'bold', uppercase: 'true' }}>DEUDA PENDIENTE</span>
                      <strong style={{ fontSize: '1.6rem', color: '#ef4444', fontFamily: 'monospace' }}>
                        {currency}
                        {customerCredits
                          .filter(c => c.status === "Pendiente")
                          .reduce((sum, c) => sum + parseFloat(c.balance || 0), 0)
                          .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>

                    <div style={{ border: '1px solid #d1fae5', padding: '16px', borderRadius: '8px', background: '#f6fdfa' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', fontWeight: 'bold', uppercase: 'true' }}>TOTAL ABONADO</span>
                      <strong style={{ fontSize: '1.6rem', color: '#10b981', fontFamily: 'monospace' }}>
                        {currency}
                        {customerCredits
                          .reduce((sum, c) => sum + parseFloat(c.paidAmount || 0), 0)
                          .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <h3 className="store-sidebar-title" style={{ marginTop: '16px' }}>Información de la Cuenta</h3>
                  <div style={{ fontSize: '0.875rem', background: '#f8fafc', padding: '16px', borderRadius: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>👤 <strong>Nombre:</strong> {currentUser.name}</div>
                    <div>🏢 <strong>Documento:</strong> {currentUser.docId}</div>
                    <div>📞 <strong>Teléfono:</strong> {currentUser.phone || "-"}</div>
                    <div>✉️ <strong>Correo:</strong> {currentUser.email || "-"}</div>
                    <div style={{ gridColumn: 'span 2' }}>📍 <strong>Dirección de Entrega:</strong> {currentUser.address || "-"}</div>
                  </div>
                </div>
              )}

              {/* SUBSECTION: PURCHASES */}
              {accountSection === "purchases" && (
                <div>
                  <h2 className="store-catalog-title">Equipos Adquiridos</h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '16px' }}>Listado de equipos vendidos vinculados a tu cuenta.</p>

                  <input 
                    type="text"
                    placeholder="Buscar por SN, marca o modelo..."
                    value={purchaseSearch}
                    onChange={(e) => setPurchaseSearch(e.target.value)}
                    className="store-search-input"
                    style={{ marginBottom: '16px', background: '#f8fafc', maxWidth: '350px' }}
                  />

                  {filteredPurchases.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No se encontraron equipos registrados.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                      {filteredPurchases.map(dev => (
                        <div key={dev.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                          <span style={{ fontSize: '0.65rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>{dev.type}</span>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a', margin: '6px 0 2px 0' }}>{dev.brand} {dev.model}</h4>
                          <div style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '8px' }}>SN: {dev.sn}</div>
                          
                          <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #cbd5e1', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div>🏷️ <strong>Precio de Venta:</strong> {currency}{parseFloat(dev.soldPrice || 0).toFixed(2)}</div>
                            <div>📅 <strong>Fecha Venta:</strong> {formatShortDate(dev.soldDate)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBSECTION: CREDITS DEBTS AND PAYMENTS */}
              {accountSection === "credits" && (
                <div>
                  <h2 className="store-catalog-title" style={{ marginBottom: '16px' }}>Créditos y Estados de Pago</h2>
                  
                  {customerCredits.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No tienes deudas registradas.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {customerCredits.map(cred => {
                        const isPendiente = cred.status === "Pendiente";
                        return (
                          <div key={cred.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: '#f8fafc' }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
                              <div>
                                <span className={`store-card-stock-badge ${isPendiente ? "out" : "in"}`} style={{ display: 'inline-block', marginBottom: '6px' }}>{cred.status}</span>
                                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{cred.description}</h4>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Registrado: {formatShortDate(cred.date)}</span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Saldo Pendiente</span>
                                <strong style={{ fontSize: '1.25rem', color: isPendiente ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>
                                  {currency}{parseFloat(cred.balance || 0).toFixed(2)}
                                </strong>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                              <span>Monto Total: <strong style={{ color: '#0f172a' }}>{currency}{parseFloat(cred.totalAmount || 0).toFixed(2)}</strong></span>
                              <span>Total Abonado: <strong style={{ color: '#10b981' }}>{currency}{parseFloat(cred.paidAmount || 0).toFixed(2)}</strong></span>
                            </div>

                            {/* Payment history */}
                            <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px' }}>
                              <h5 className="store-sidebar-title" style={{ fontSize: '0.65rem', marginBottom: '10px' }}>Historial de Abonos</h5>
                              {cred.payments && cred.payments.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {cred.payments.map((pay, pIdx) => (
                                    <div key={pay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                      <div>
                                        <strong>Abono #{pIdx + 1} ({pay.paymentMethod || "Efectivo"})</strong>
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>{formatShortDate(pay.date)} - {pay.notes || "Sin observaciones"}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: '#10b981' }}>+{currency}{parseFloat(pay.amount).toFixed(2)}</strong>
                                        {pay.receiptUrl && (
                                          <a
                                            href={`${API_URL}${pay.receiptUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                                          >
                                            <Paperclip size={10} style={{ display: 'inline-block', marginRight: '2px' }} /> Recibo
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>No hay abonos registrados para esta cuenta.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUBSECTION: ORDERS HISTORY */}
              {accountSection === "orders" && (
                <div>
                  <h2 className="store-catalog-title" style={{ marginBottom: '16px' }}>Pedidos Tienda</h2>
                  
                  {customerOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <p style={{ color: '#94a3b8', marginBottom: '16px' }}>No has realizado ningún pedido todavía.</p>
                      <button 
                        onClick={() => setActiveSubTab("store")}
                        className="store-card-btn-order"
                      >
                        Ir a la Tienda
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {customerOrders.map(order => {
                        let badgeClass = "out";
                        if (order.status === "Entregado" || order.status === "Aprobado") badgeClass = "in";
                        if (order.status === "Rechazado") badgeClass = "out";

                        return (
                          <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
                              <div>
                                <span className={`store-card-stock-badge ${badgeClass}`} style={{ marginBottom: '6px', display: 'inline-block' }}>{order.status}</span>
                                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Pedido #{order.id}</h4>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fecha: {order.date}</span>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Total Pedido</span>
                                <strong style={{ fontSize: '1.25rem', color: '#10b981', fontFamily: 'monospace' }}>
                                  {currency}{parseFloat(order.totalAmount).toFixed(2)}
                                </strong>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <h5 className="store-sidebar-title" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>Artículos</h5>
                              {order.items.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: 'white', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px' }}>
                                  <span>{item.quantity}x {item.brand} {item.productName} ({item.productType})</span>
                                  <strong style={{ fontFamily: 'monospace' }}>{currency}{(item.quantity * item.priceUnit).toFixed(2)}</strong>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

        {/* TAB: ABOUT US */}
        {activeSubTab === "about-us" && (
          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flex: 1, alignSelf: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.5rem' }}>🇵🇪</span>
              <h2 className="store-catalog-title">Quiénes Somos - Tunkitek (Tunki Networks)</h2>
            </div>
            
            <p style={{ fontSize: '0.95rem', lineHeight: '1.65rem', color: '#334155', fontWeight: '500', marginBottom: '24px' }}>
              En Tunkitek (Tunki Networks), tomamos nuestro nombre del ave nacional del Perú porque compartimos su esencia: nacimos para conectar ecosistemas complejos. Así como el Tunki habita en la intersección de los Andes y la Amazonía, nosotros construimos los puentes tecnológicos que unen a las empresas con su futuro.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#f8fafc' }}>
                <h4 style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>⚡ Señal Clara</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.15rem' }}>Ofrecemos una comunicación sin interferencias y máxima estabilidad para interconectar tus operaciones.</p>
              </div>
              
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#f8fafc' }}>
                <h4 style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>⏱️ Servicio Ágil</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.15rem' }}>Nuestra prioridad es la atención rápida y eficiente de tus pedidos, cotizaciones y requerimientos.</p>
              </div>
              
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#f8fafc' }}>
                <h4 style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>🏗️ Infraestructura Robustas</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.15rem' }}>Soluciones duraderas y escalables diseñadas para soportar condiciones climáticas y geográficas diversas.</p>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: '1.5rem', color: '#475569', fontStyle: 'italic', background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '6px' }}>
              {"\"Destacamos por ofrecer una señal clara, un servicio ágil y soluciones de infraestructura robustas que se adaptan a cualquier entorno. Somos tecnología de alto rendimiento con verdadero ADN peruano.\""}
            </p>
          </div>
        )}

      </div>

      {/* 6. STORE FOOTER */}
      {!hideHeader && (
        <footer className="store-footer">
          <div className="store-footer-grid">
            <div className="store-footer-col">
              <h4>Tunkitek</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.3rem', color: '#64748b' }}>
                Tecnología de alto rendimiento con verdadero ADN peruano. Conectando ecosistemas complejos.
              </p>
            </div>
            
            <div className="store-footer-col">
              <h4>Enlaces Rápidos</h4>
              <div className="store-footer-links">
                <button className="store-footer-link" onClick={() => { setActiveSubTab("store"); setSelectedCategory("Todos"); setSelectedBrands([]); }}>Catálogo</button>
                <button className="store-footer-link" onClick={() => setActiveSubTab("about-us")}>Nosotros</button>
                <button className="store-footer-link" onClick={() => {
                  if (isClient) {
                    setActiveSubTab("account");
                    setAccountSection("summary");
                  } else {
                    setActiveSubTab("login-customer");
                  }
                }}>Mi Cuenta</button>
              </div>
            </div>
            
            <div className="store-footer-col">
              <h4>Contacto</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <div>📍 <strong>Dirección:</strong> Av. José Gálvez 557, Chimbote</div>
                <div>📞 <strong>Teléfono:</strong> 923030000</div>
              </div>
            </div>
            
            <div className="store-footer-col">
              <h4>Transparencia</h4>
              <div className="store-footer-links">
                <a 
                  href="https://wa.me/51923030000?text=Hola,%20deseo%20registrar%20un%20reclamo/queja%20en%20el%20Libro%20de%20Reclamaciones."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-footer-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#facc15', fontWeight: 'bold' }}
                >
                  📖 Libro de Reclamaciones
                </a>
              </div>
            </div>
          </div>
          
          <div className="store-footer-bottom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="store-footer-bottom-text" style={{ fontWeight: 'bold' }}>
                © {new Date().getFullYear()} Tunkitek (Tunki Networks). Todos los derechos reservados.
              </span>
              <span className="store-footer-bottom-text" style={{ fontSize: '0.7rem' }}>
                ARS CONSULTORES Y SERVICIOS S.A.C. | RUC: 20610569731
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Aceptamos transferencias y pagos directos.</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
