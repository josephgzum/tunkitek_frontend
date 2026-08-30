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
  FileText 
} from 'lucide-react';

export default function PublicStoreView({ API_URL, currentUser, currency, onRequireLogin, onBackToLogin, hideHeader }) {
  const [activeSubTab, setActiveSubTab] = useState("store"); // "store" | "register" | "cart"
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  
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

  const filteredCatalog = catalog.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "" || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const productTypes = [...new Set(catalog.map(p => p.type))];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white font-sans">
      {/* Navigation Header */}
      {!hideHeader ? (
        <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
          <div className="container mx-auto flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo-tunqui-red.png" className="h-9" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
              <div>
                <h1 className="text-xl font-bold tracking-wider text-cyan-400">TIENDA TUNKITEK</h1>
                <p className="text-xs text-slate-400">Catálogo y Pedidos en Línea</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveSubTab("store")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${activeSubTab === "store" ? "bg-cyan-500 text-slate-950 font-bold" : "hover:bg-slate-800 text-slate-300"}`}
              >
                Catálogo
              </button>
              {!isClient && (
                <button 
                  onClick={() => setActiveSubTab("register")}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-1.5 ${activeSubTab === "register" ? "bg-emerald-500 text-slate-950 font-bold" : "hover:bg-slate-800 text-slate-300"}`}
                >
                  <UserPlus size={16} /> Solicitar Registro
                </button>
              )}
              <button 
                onClick={() => setActiveSubTab("cart")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2 relative ${activeSubTab === "cart" ? "bg-amber-500 text-slate-950 font-bold" : "hover:bg-slate-800 text-slate-300"}`}
              >
                <ShoppingCart size={16} />
                <span>Pedido</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-2xs px-1.5 py-0.5 font-bold shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                onClick={onBackToLogin}
                className="ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-sm text-cyan-400 transition"
              >
                Regresar al Login
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* Subtab Selector for Embedded Mode inside Customer Portal */
        <div className="flex items-center gap-2 mb-6 bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <button 
            onClick={() => setActiveSubTab("store")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition ${activeSubTab === "store" ? "bg-cyan-500 text-slate-950 font-bold" : "hover:bg-slate-800 text-slate-300"}`}
          >
            Ver Catálogo de Productos
          </button>
          <button 
            onClick={() => setActiveSubTab("cart")}
            className={`px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2 relative ${activeSubTab === "cart" ? "bg-amber-500 text-slate-950 font-bold" : "hover:bg-slate-800 text-slate-300"}`}
          >
            <ShoppingCart size={16} />
            <span>Ver mi Carrito de Pedido</span>
            {cartCount > 0 && (
              <span className="bg-red-500 text-white rounded-full text-xs px-2 py-0.5 font-bold shadow-lg">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Section */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        
        {/* CLIENT STATUS BADGE */}
        {isClient && (
          <div className="mb-6 p-3 bg-cyan-950/40 border border-cyan-800/80 rounded flex justify-between items-center flex-wrap gap-2">
            <span className="text-sm text-cyan-200">
              Sesión Iniciada: <strong className="text-cyan-400 font-semibold">{currentUser.name}</strong> (Cliente verificado)
            </span>
            <span className="text-xs bg-cyan-900/60 text-cyan-300 px-2 py-1 rounded">
              Precios Visibles
            </span>
          </div>
        )}

        {activeSubTab === "store" && (
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar por marca, modelo o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 pl-10 text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded p-2 text-white min-w-[150px] focus:outline-none"
              >
                <option value="">Todos los Tipos</option>
                {productTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Catalog Grid */}
            {loading ? (
              <div className="text-center py-12 text-slate-400">Cargando catálogo de productos...</div>
            ) : filteredCatalog.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No se encontraron productos en el catálogo de la tienda.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCatalog.map(product => {
                  const hasStock = product.qtyAvailable > 0;
                  return (
                    <div 
                      key={product.id}
                      className="bg-slate-900 border border-slate-800 hover:border-cyan-800 rounded-lg p-4 flex flex-col justify-between shadow-lg transition duration-200"
                    >
                      <div>
                        {/* Type Badge */}
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xs bg-slate-800 px-2 py-0.5 rounded text-cyan-400 uppercase font-semibold">
                            {product.type}
                          </span>
                          <span className={`text-2xs px-2 py-0.5 rounded font-bold ${hasStock ? 'bg-emerald-950/60 text-emerald-400' : 'bg-red-950/60 text-red-400'}`}>
                            {hasStock ? `${product.qtyAvailable} Disponible` : 'Agotado'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-lg text-white mb-1">{product.name}</h3>
                        <p className="text-xs text-slate-400 mb-2">Marca: {product.brand}</p>
                        
                        {/* Description */}
                        {product.description && (
                          <p className="text-xs text-slate-400 line-clamp-3 mb-4 bg-slate-950/40 p-2 rounded border border-slate-950">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        {/* Pricing and Action */}
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-2xs text-slate-500 block">Precio sugerido</span>
                            {isClient ? (
                              <span className="text-xl font-bold text-emerald-400 font-mono">
                                {currency}{product.price?.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-400 flex items-center gap-1">
                                <Lock size={12} /> Privado
                              </span>
                            )}
                          </div>

                          <button 
                            onClick={() => addToCart(product)}
                            disabled={!hasStock}
                            className={`px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition ${hasStock ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                          >
                            <ShoppingCart size={14} /> Pedir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "register" && !isClient && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="text-emerald-400" size={24} />
              <h2 className="text-xl font-bold text-white">Solicitud de Registro de Cliente</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Rellena este formulario para solicitar tu acceso al portal de compras de TUNKITEK. Al ser aprobado por el administrador, podrás ingresar, ver precios especiales y generar pedidos directamente.
            </p>

            {regSuccess && (
              <div className="mb-4 p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded text-sm flex items-start gap-2">
                <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {regError && (
              <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-300 rounded text-sm">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Nombre / Razón Social *</label>
                <div className="relative">
                  <Building size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Telecomunicaciones SAC"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Documento (RUC o DNI) *</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input 
                    type="text"
                    required
                    maxLength={11}
                    placeholder="Ej. 20101010101"
                    value={regDocId}
                    onChange={(e) => setRegDocId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Teléfono de Contacto</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Ej. 987654321"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                      type="email"
                      placeholder="Ej. cliente@correo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-10 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Dirección de Entrega / Despacho</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-slate-500" />
                  <textarea 
                    rows={2}
                    placeholder="Calle, Avenida, Distrito..."
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-10 text-white focus:outline-none focus:border-emerald-500 text-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Contraseña *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Mín. 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Confirmar Contraseña *</label>
                    <input 
                      type="password"
                      required
                      placeholder="Repite la contraseña"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 p-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded shadow transition"
              >
                Enviar Solicitud de Registro
              </button>
            </form>
          </div>
        )}

        {activeSubTab === "cart" && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="text-amber-400" /> Carrito de Pedido
              </h2>
              <span className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono">
                {cartCount} artículo(s)
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No tienes ningún artículo agregado a tu carrito.</p>
                <button 
                  onClick={() => setActiveSubTab("store")}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded text-sm transition"
                >
                  Ver Catálogo de Productos
                </button>
              </div>
            ) : (
              <div>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div 
                      key={item.id}
                      className="bg-slate-950 border border-slate-850 p-4 rounded flex items-center justify-between flex-wrap gap-4"
                    >
                      <div className="flex-1">
                        <span className="text-xs text-cyan-400 font-mono uppercase">{item.type}</span>
                        <h4 className="font-bold text-white text-base">{item.name}</h4>
                        <p className="text-xs text-slate-500">Marca: {item.brand}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Cant:</span>
                          <input 
                            type="number"
                            min="1"
                            max={item.qtyAvailable}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded p-1 w-16 text-center focus:outline-none focus:border-cyan-400 text-sm font-mono"
                          />
                        </div>

                        <div className="text-right min-w-[80px]">
                          {isClient ? (
                            <div>
                              <span className="text-sm font-bold text-white font-mono block">
                                {currency}{(item.price * item.quantity).toFixed(2)}
                              </span>
                              <span className="text-2xs text-slate-500 font-mono">
                                ({currency}{item.price.toFixed(2)} c/u)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-400 flex items-center gap-1 justify-end">
                              <Lock size={12} /> Precios Privados
                            </span>
                          )}
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-500 p-1 rounded hover:bg-slate-900 transition"
                          title="Quitar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    {isClient ? (
                      <div className="text-left">
                        <span className="text-xs text-slate-400 block">Total Estimado:</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">
                          {currency}{cartTotal.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-950/40 border border-amber-900/60 rounded max-w-sm">
                        <p className="text-2xs text-amber-400 font-medium">
                          ⚠️ Podrás ver el total y enviar el pedido una vez que el administrador apruebe tu registro e inicies sesión como cliente.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setCart([])}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded font-medium text-sm transition"
                    >
                      Vaciar Carrito
                    </button>
                    <button 
                      onClick={checkoutOrder}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded text-sm transition uppercase tracking-wider"
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
