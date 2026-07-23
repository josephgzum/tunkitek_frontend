import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CameraOff, Camera, RefreshCw, Zap, ZapOff } from "lucide-react";

// Loader dinámico para Tesseract.js (OCR de textos impresos)
const loadTesseract = () => {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) {
      resolve(window.Tesseract);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/tesseract.js@5.0.3/dist/tesseract.min.js";
    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        reject(new Error("Librería Tesseract cargada pero no definida globalmente."));
      }
    };
    script.onerror = () => reject(new Error("No se pudo cargar el motor OCR. Revisa tu conexión a internet."));
    document.head.appendChild(script);
  });
};

export default function QrScanner({ scannerTarget = "", onScanSuccess, onClose }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  
  // Zoom settings
  const [hasZoomSupport, setHasZoomSupport] = useState(false);
  const [zoomMin, setZoomMin] = useState(1);
  const [zoomMax, setZoomMax] = useState(3);
  const [zoomVal, setZoomVal] = useState(1);

  // Flashlight (Torch) settings
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const scannerRef = useRef(null);
  const isStoppingRef = useRef(false);
  const elementId = "camera-scanner-view";

  useEffect(() => {
    setIsInitializing(true);
    setErrorMsg("");

    // 1. Enumerate available camera devices
    Html5Qrcode.getCameras()
      .then((cameraDevices) => {
        setDevices(cameraDevices);
        if (cameraDevices && cameraDevices.length > 0) {
          // Find back camera by matching label keywords ('back', 'rear', 'trasera')
          let backCam = cameraDevices.find(dev => {
            const label = (dev.label || "").toLowerCase();
            return label.includes("back") || label.includes("rear") || label.includes("trasera") || label.includes("environment");
          });

          // Fallback to the last camera in list if no label keyword matched
          if (!backCam) {
            backCam = cameraDevices[cameraDevices.length - 1];
          }

          setSelectedCameraId(backCam.id);
          startScanner(backCam.id);
        } else {
          // If empty list, attempt start via environment constraint
          startScanner({ facingMode: "environment" });
        }
      })
      .catch((err) => {
        console.warn("getCameras falló, intentando con facingMode environment: ", err);
        startScanner({ facingMode: "environment" });
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = (cameraParam) => {
    setIsInitializing(true);
    setErrorMsg("");
    setHasZoomSupport(false);
    setHasTorchSupport(false);
    setTorchOn(false);
    isStoppingRef.current = false;
    
    // 1. Cleanly stop existing scanner & force release hardware tracks
    stopScanner().then(() => {
      // 2. Add 250ms release delay to allow Android WebRTC drivers to free camera hardware
      setTimeout(() => {
        const html5Qrcode = new Html5Qrcode(elementId);
        scannerRef.current = html5Qrcode;

        const config = {
          fps: 15,
          // Visor dinámico adaptado al ancho real de la pantalla para evitar desbordes y ocultamiento del recuadro
          qrbox: (width, height) => {
            const boxWidth = Math.floor(width * 0.85);
            const boxHeight = Math.floor(boxWidth * 0.22);
            return {
              width: boxWidth,
              height: boxHeight
            };
          },
          aspectRatio: 1.333334
        };

        html5Qrcode
          .start(
            cameraParam,
            config,
            (decodedText) => {
              if (isStoppingRef.current) return;
              isStoppingRef.current = true;

              if (navigator.vibrate) {
                navigator.vibrate(100);
              }
              stopScanner().then(() => {
                onScanSuccess(decodedText);
              });
            },
            (errorMessage) => {
              // Keep failures silent as they occur on every non-decoding frame
            }
          )
          .then(() => {
            setIsInitializing(false);
            
            // Query camera track capabilities for zoom & flash (torch)
            setTimeout(() => {
              const videoElem = document.querySelector(`#${elementId} video`);
              if (videoElem && videoElem.srcObject) {
                const stream = videoElem.srcObject;
                const tracks = stream.getVideoTracks();
                if (tracks && tracks.length > 0) {
                  const track = tracks[0];
                  try {
                    const capabilities = track.getCapabilities();
                    
                    // Zoom support check
                    if (capabilities && capabilities.zoom) {
                      setHasZoomSupport(true);
                      const minZoom = capabilities.zoom.min || 1;
                      const maxZoom = capabilities.zoom.max || 3;
                      setZoomMin(minZoom);
                      setZoomMax(maxZoom);
                      
                      // Ajustar a 2.0x por defecto (acotado entre min y max del hardware)
                      const defaultZoom = Math.min(Math.max(2.0, minZoom), maxZoom);
                      setZoomVal(defaultZoom);
                      
                      track.applyConstraints({
                        advanced: [{ zoom: defaultZoom }]
                      }).catch(e => console.error("Error aplicando zoom inicial 2x:", e));
                    }

                    // Flashlight support check
                    if (capabilities && capabilities.torch) {
                      setHasTorchSupport(true);
                    }
                  } catch (e) {
                    console.warn("getCapabilities no soportado en este navegador: ", e);
                  }
                }
              }
            }, 800);
          })
          .catch((err) => {
            console.error("Error al iniciar cámara con parámetro: ", cameraParam, err);
            
            // Fallback logic if starting by ID failed
            if (typeof cameraParam === "string") {
              console.log("Reintentando con constraint facingMode environment...");
              startScanner({ facingMode: "environment" });
            } else {
              setErrorMsg("No se pudo iniciar la transmisión de video de la cámara seleccionada.");
              setIsInitializing(false);
            }
          });
      }, 250);
    });
  };

  const stopScanner = () => {
    // Forcefully stop underlying DOM video tracks to free camera hardware immediately
    const videoElem = document.querySelector(`#${elementId} video`);
    if (videoElem && videoElem.srcObject) {
      try {
        const stream = videoElem.srcObject;
        const tracks = stream.getVideoTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
        });
        videoElem.srcObject = null;
      } catch (err) {
        console.warn("Error deteniendo tracks nativos de video: ", err);
      }
    }

    if (scannerRef.current && scannerRef.current.isScanning) {
      return scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
        })
        .catch((err) => {
          console.error("Error al detener escáner html5qrcode: ", err);
          scannerRef.current = null;
        });
    }
    scannerRef.current = null;
    return Promise.resolve();
  };

  const handleClose = () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    stopScanner().then(() => {
      onClose();
    });
  };

  const handleCameraChange = (e) => {
    const newCameraId = e.target.value;
    setSelectedCameraId(newCameraId);
    if (newCameraId) {
      startScanner(newCameraId);
    }
  };

  const handleZoomChange = (e) => {
    const val = parseFloat(e.target.value);
    setZoomVal(val);
    
    const videoElem = document.querySelector(`#${elementId} video`);
    if (videoElem && videoElem.srcObject) {
      const stream = videoElem.srcObject;
      const tracks = stream.getVideoTracks();
      if (tracks && tracks.length > 0) {
        const track = tracks[0];
        try {
          track.applyConstraints({
            advanced: [{ zoom: val }]
          });
        } catch (err) {
          console.error("Error al aplicar zoom: ", err);
        }
      }
    }
  };

  const handleTorchToggle = () => {
    const nextTorch = !torchOn;
    setTorchOn(nextTorch);
    
    const videoElem = document.querySelector(`#${elementId} video`);
    if (videoElem && videoElem.srcObject) {
      const stream = videoElem.srcObject;
      const tracks = stream.getVideoTracks();
      if (tracks && tracks.length > 0) {
        const track = tracks[0];
        try {
          track.applyConstraints({
            advanced: [{ torch: nextTorch }]
          });
        } catch (err) {
          console.error("Error al activar linterna: ", err);
        }
      }
    }
  };

  const captureFrame = () => {
    const video = document.querySelector(`#${elementId} video`);
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  const handleOcrScan = async () => {
    setIsOcrProcessing(true);
    try {
      const dataUrl = captureFrame();
      if (!dataUrl) throw new Error("No se pudo capturar la imagen de la cámara.");

      const Tesseract = await loadTesseract();
      console.log("Iniciando escaneo OCR...");
      const result = await Tesseract.recognize(dataUrl, 'eng');
      const text = result.data.text;
      console.log("Texto extraído por OCR:", text);

      // Algoritmo de extracción por Regex según el tipo de campo
      const targetField = scannerTarget.toLowerCase();
      let foundValue = "";

      if (targetField.includes("mac")) {
        // Expresión regular para buscar direcciones MAC en el bloque de texto
        const cleanOcrText = text.toUpperCase().replace(/\s/g, "");
        // Buscar 12 caracteres hex continuos o separados
        const matches = cleanOcrText.match(/([0-9A-F]{2}[:-]){5}[0-9A-F]{2}|[0-9A-F]{12}/i);
        if (matches) {
          // Si tiene delimitadores los dejamos limpios para isMacFormat
          const val = matches[0];
          foundValue = val;
        }
      } else if (targetField.includes("sn")) {
        // Buscar cadenas después de SN o S/N o GPON SN
        const cleanLines = text.toUpperCase().split("\n");
        for (let line of cleanLines) {
          // Buscar patrones de SN o S/N
          const matches = line.match(/(?:SN|S\/N|GPON\s*SN|SERIE)[:\-\s]*([0-9A-Z]{8,20})/i);
          if (matches && matches[1]) {
            foundValue = matches[1].trim();
            break;
          }
        }
        
        // Si no se encontró por etiqueta, hacer barrido de palabras buscando prefijos conocidos (ZTE, HWTC, ASKY, ALCL, MSTC, ACHG)
        if (!foundValue) {
          const words = text.toUpperCase().split(/[\s,]+/);
          for (let w of words) {
            const cleanW = w.replace(/[^A-Z0-9]/gi, "").trim();
            if (/^(ZTE|HWTC|ASKY|ALCL|FHTT|MSTC|48575443|5A544547|41434847)/i.test(cleanW) && cleanW.length >= 8 && cleanW.length <= 20) {
              foundValue = cleanW;
              break;
            }
          }
        }
      }

      if (foundValue) {
        if (navigator.vibrate) navigator.vibrate(100);
        stopScanner().then(() => {
          onScanSuccess(foundValue);
        });
      } else {
        alert("⚠️ No se detectó ningún texto con formato de MAC o SN válido en la etiqueta. Intenta centrar el texto impreso, sostener el celular firme y tomar la foto de nuevo.");
      }
    } catch (err) {
      console.error("Error en OCR:", err);
      alert("Error procesando imagen: " + err.message);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-card glass" style={{ maxWidth: "560px", width: "95%" }}>
        <div className="scanner-header">
          <h3>Escanear Código de Barras / SN</h3>
          <p className="scanner-subtitle">Apunta con la cámara. Mantén distancia y haz zoom si es necesario.</p>
        </div>

        <div className="camera-viewport-wrapper">
          <div id={elementId} className="camera-viewport"></div>
          {isInitializing && (
            <div className="camera-status-overlay">
              <RefreshCw className="spinner text-primary" size={32} />
              <span>Iniciando cámara...</span>
            </div>
          )}
          {errorMsg && (
            <div className="camera-status-overlay error-bg">
              <CameraOff className="text-danger" size={32} />
              <span>{errorMsg}</span>
            </div>
          )}
          
          {/* Torch Button float inside camera */}
          {!isInitializing && !errorMsg && hasTorchSupport && (
            <button
              onClick={handleTorchToggle}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 100,
                background: torchOn ? "var(--color-primary)" : "rgba(10, 11, 14, 0.7)",
                border: "1px solid var(--border-color)",
                color: torchOn ? "var(--bg-main)" : "var(--color-text-bright)",
                padding: "8px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
              }}
              title="Encender linterna"
            >
              {torchOn ? <Zap size={18} /> : <ZapOff size={18} />}
            </button>
          )}

          {/* Custom HTML/CSS Scanner Bounding Box Overlay (100% Reliable on Mobiles) */}
          {!isInitializing && !errorMsg && (
            <div className="custom-scanner-mask">
              <div className="custom-focus-box">
                <div className="custom-laser-line"></div>
              </div>
            </div>
          )}
        </div>

        {/* Zoom controller slider */}
        {!isInitializing && !errorMsg && hasZoomSupport && (
          <div style={{ margin: "4px 0 10px 0", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              <span>Zoom: <strong>{zoomVal.toFixed(1)}x</strong></span>
              <span>Límite: <strong>{zoomMax.toFixed(1)}x</strong></span>
            </div>
            <input
              type="range"
              min={zoomMin}
              max={zoomMax}
              step="0.1"
              value={zoomVal}
              onChange={handleZoomChange}
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "3px",
                background: "rgba(255,255,255,0.08)",
                accentColor: "var(--color-primary)",
                outline: "none"
              }}
            />
          </div>
        )}

        {devices.length > 1 && (
          <div className="camera-select-wrapper" style={{ marginTop: "4px" }}>
            <label htmlFor="camera-select">Cambiar cámara:</label>
            <select
              id="camera-select"
              value={selectedCameraId}
              onChange={handleCameraChange}
              className="form-control"
            >
              {devices.map((device, idx) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Cámara ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="scanner-actions" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {!isInitializing && !errorMsg && (
            <button
              type="button"
              onClick={handleOcrScan}
              disabled={isOcrProcessing}
              className="btn btn-primary w-full"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px" }}
            >
              {isOcrProcessing ? (
                <>
                  <RefreshCw className="spinner" size={16} />
                  <span>Procesando Texto (OCR)...</span>
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <span>Escanear Texto de Etiqueta (OCR)</span>
                </>
              )}
            </button>
          )}
          <button onClick={handleClose} disabled={isOcrProcessing} className="btn btn-secondary w-full">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
