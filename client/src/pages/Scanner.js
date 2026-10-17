import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

function Scanner() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const html5QrcodeScannerRef = useRef(null);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  };

  const startScanner = () => {
    const scannerId = 'reader';
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    html5QrcodeScannerRef.current = html5QrcodeScanner;

    html5QrcodeScanner.render(
      async (decodedText, decodedResult) => {
        await handleScan(decodedText);
      },
      (errorMessage) => {
        // scanning in progress
      }
    );
  };

  const stopScanner = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error);
    }
  };

  useEffect(() => {
    checkAuth();
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const handleScan = async (qrCode) => {
    setScanning(false);
    stopScanner();

    try {
      const response = await axios.post('/api/scan', { qr_code: qrCode });
      setScanResult(response.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.error || 'Eroare la scanare');
      setScanResult(null);
    }
  };

  const handleManualInput = async (e) => {
    e.preventDefault();
    const qrCode = e.target.qr_code.value;
    await handleScan(qrCode);
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    setScanning(true);
    startScanner();
  };

  return (
    <div className="scanner-container">
      <header className="scanner-header">
        <h1>📷 Scanner QR</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          Înapoi la Dashboard
        </button>
      </header>

      <div className="scanner-content">
        {scanning && (
          <div className="scanner-active">
            <div id="reader" className="qr-reader"></div>
            <p className="scanner-instruction">Apropie camera de codul QR</p>
          </div>
        )}

        {!scanning && (
          <div className="scanner-paused">
            <button onClick={resetScanner} className="resume-button">
              Reia Scanarea
            </button>
          </div>
        )}

        <div className="manual-input">
          <h3>Introducere manuală</h3>
          <form onSubmit={handleManualInput}>
            <input
              type="text"
              name="qr_code"
              placeholder="Introdu codul QR manual"
              required
            />
            <button type="submit">Verifică</button>
          </form>
        </div>

        {error && (
          <div className="scan-error">
            <h3>❌ Eroare</h3>
            <p>{error}</p>
          </div>
        )}

        {scanResult && (
          <div className="scan-result">
            {scanResult.scanned ? (
              <div className="already-scanned">
                <h3>⚠️ Deja Scanat</h3>
                <p>Acest cod QR a fost deja scanat anterior.</p>
                <div className="registration-details">
                  <p><strong>Nume:</strong> {scanResult.registration.name}</p>
                  <p><strong>Email:</strong> {scanResult.registration.email}</p>
                  <p><strong>Vârstă:</strong> {scanResult.registration.age} ani</p>
                  <p><strong>Film:</strong> {scanResult.registration.movie_title}</p>
                  <p><strong>Scanat la:</strong> {new Date(scanResult.registration.scanned_at).toLocaleString('ro-RO')}</p>
                </div>
              </div>
            ) : (
              <div className="scan-success">
                <h3>✅ Scanare Reușită</h3>
                <div className="registration-details">
                  <p><strong>Nume:</strong> {scanResult.registration.name}</p>
                  <p><strong>Email:</strong> {scanResult.registration.email}</p>
                  <p><strong>Vârstă:</strong> {scanResult.registration.age} ani</p>
                  <p><strong>Film:</strong> {scanResult.registration.movie_title}</p>
                  <p><strong>Data:</strong> {new Date(scanResult.registration.show_date).toLocaleDateString('ro-RO')}</p>
                  <p><strong>Ora:</strong> {scanResult.registration.show_time}</p>
                  <p><strong>Locație:</strong> {scanResult.registration.location || 'CRT Cinema Donduseni'}</p>
                </div>
                <p className="access-granted">Acces ACORDAT</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Scanner;
