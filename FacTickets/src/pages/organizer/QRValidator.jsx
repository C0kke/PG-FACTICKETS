import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { buildApiUrl, API_CONFIG } from '../../config/api';

const QRValidator = () => {
  const navigate = useNavigate();
  const [scannedQR, setScannedQR] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('text'); // 'text' or 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Función para validar QR code (modo texto)
  const validateQR = async () => {
    await validateQRData(scannedQR);
  };

  const clearForm = () => {
    setScannedQR('');
    setValidationResult(null);
  };

  // Función para verificar permisos de cámara
  const checkCameraPermissions = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Cámara no disponible');
      }
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Función para solicitar permisos manualmente
  const requestCameraPermissions = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
      setValidationResult({
        success: true,
        message: 'Permisos concedidos',
        error: false
      });
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Permisos denegados',
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Función mejorada para iniciar el escáner de cámara
  const startCamera = async () => {
    try {
      setLoading(true);
      await checkCameraPermissions();

      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }

      if (!videoRef.current) {
        throw new Error('Elemento de video no encontrado');
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setScannedQR(result.data);
          stopCamera();
          setTimeout(() => {
            validateQRData(result.data);
          }, 500);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      await qrScannerRef.current.start();
      setCameraActive(true);
      setValidationResult(null);
      
    } catch (error) {
      setValidationResult({
        success: false,
        message: 'Error al acceder a la cámara',
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para detener el escáner
  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setCameraActive(false);
  };

  // Función para cambiar de modo
  const switchMode = (mode) => {
    if (mode === 'camera' && scanMode !== 'camera') {
      setScanMode('camera');
      setTimeout(startCamera, 100);
    } else if (mode === 'text') {
      setScanMode('text');
      stopCamera();
    }
  };

  // Validar QR con datos específicos
  const validateQRData = async (qrData) => {
    if (!qrData.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.VALIDATE_QR), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `qrData=${encodeURIComponent(qrData)}`
      });

      if (response.ok) {
        setValidationResult({ 
          success: true, 
          message: 'QR Válido',
          error: false 
        });
      } else {
        setValidationResult({ 
          success: false, 
          message: 'QR Inválido',
          error: true 
        });
      }
    } catch (err) {
      setValidationResult({ 
        success: false, 
        message: 'Error de conexión',
        error: true 
      });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup al desmontar componente
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">
                <span className="text-orange-500">Fac</span>
                <span className="text-pink-500">Tickets</span>
              </h1>
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              <p className="hidden sm:block text-gray-600">Validador QR</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/event-owner')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                Panel Organizador
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🔍 Validador de QR
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          {/* Selector de modo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => switchMode('text')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  scanMode === 'text'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📝 Texto Manual
              </button>
              <button
                onClick={() => switchMode('camera')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  scanMode === 'camera'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📷 Escanear Cámara
              </button>
            </div>
          </div>

          {/* Formulario de validación */}
          <div className="space-y-6">
            {scanMode === 'camera' ? (
              /* Modo Cámara */
              <div className="text-center">
                <div className="relative inline-block">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-xl border-4 border-blue-300 shadow-lg"
                    style={{ maxHeight: '400px' }}
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <p className="text-gray-600">Presiona iniciar para usar la cámara</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-center gap-4">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Iniciar Cámara
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                        </svg>
                        Detener Cámara
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Modo Texto */
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  📱 Contenido del Código QR:
                </label>
                <textarea
                  value={scannedQR}
                  onChange={(e) => setScannedQR(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows="4"
                  placeholder="Pega aquí el contenido del código QR"
                />
              </div>
            )}

            {/* Botones de acción - Solo mostrar en modo texto */}
            {scanMode === 'text' && (
              <div className="flex gap-4">
                <button
                  onClick={validateQR}
                  disabled={!scannedQR.trim() || loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Validar QR Code
                    </span>
                  )}
                </button>
                
                <button
                  onClick={clearForm}
                  className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300"
                >
                  Limpiar
                </button>
              </div>
            )}

            {/* Botón de limpiar para modo cámara */}
            {scanMode === 'camera' && scannedQR && (
              <div className="flex justify-center">
                <button
                  onClick={clearForm}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Limpiar y Escanear Otro
                </button>
              </div>
            )}

            {/* Resultado de validación */}
            {validationResult && (
              <div className={`p-6 rounded-xl border-2 text-center ${
                validationResult.success 
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  validationResult.success ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {validationResult.success ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  )}
                </div>
                <h3 className={`text-2xl font-bold ${
                  validationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.success ? '✅ QR Válido' : '❌ QR Inválido'}
                </h3>
                <p className={`mt-2 ${
                  validationResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validationResult.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRValidator;
