// src/components/GlobalAlert.jsx
import { useState, useEffect } from 'react';
import Alert from '../alert/Alert';// Seu componente de alerta

const GlobalAlert = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const handleGlobalAlert = (event) => {
      setAlert({
        type: event.detail.type,
        message: event.detail.message
      });
    };

    window.addEventListener('showGlobalAlert', handleGlobalAlert);

    return () => {
      window.removeEventListener('showGlobalAlert', handleGlobalAlert);
    };
  }, []);

  const handleCloseAlert = () => {
    setAlert(null);
  };

  if (!alert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={handleCloseAlert}
        duration={4000}
      />
    </div>
  );
};

export default GlobalAlert;