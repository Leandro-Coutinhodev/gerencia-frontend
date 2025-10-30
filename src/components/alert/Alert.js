import { useEffect, useState } from "react";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const variants = {
  info: {
    icon: <Info className="w-5 h-5 text-blue-600" />,
    border: "border-l-4 border-blue-500",
    text: "text-blue-800",
    bg: "bg-blue-50"
  },
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    border: "border-l-4 border-green-600",
    text: "text-green-800",
    bg: "bg-green-50"
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    border: "border-l-4 border-yellow-500",
    text: "text-yellow-800",
    bg: "bg-yellow-50"
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    border: "border-l-4 border-red-600",
    text: "text-red-800",
    bg: "bg-red-50"
  }
};

function Alert({ type = "info", message, onClose, duration = 4000 }) {
  const style = variants[type] || variants.info;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!visible) return null;

  return (
  <div className="w-full flex justify-center">
    <div
      className={`flex items-center gap-2 px-4 py-2 mb-4 ${style.bg} ${style.border} ${style.text} rounded-[4px] shadow-sm`}
      style={{ maxWidth: "442px", width: "100%" }}
    >
      {style.icon}
      <span className="text-sm font-medium truncate">{message}</span>
    </div>
  </div>
);

}

export default Alert;