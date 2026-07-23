import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CameraOff, Camera, RefreshCw, Zap, ZapOff } from "lucide-react";

export default function QrScanner({ onScanSuccess, onClose }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
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
          // Visor extremadamente angosto verticalmente para aislar códigos en etiquetas agrupadas (SN / MAC)
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.8;
            return {
              width: size * 1.6,
              height: size * 0.22
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

          {/* Animated Scanning Line */}
          {!isInitializing && !errorMsg && <div className="scanner-laser"></div>}
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

        <div className="scanner-actions" style={{ marginTop: "10px" }}>
          <button onClick={handleClose} className="btn btn-secondary w-full">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
