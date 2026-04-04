import React, { useState, useEffect } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmButtonProps {
  onConfirm: () => void;
  className?: string;
  icon?: React.ReactNode;
  confirmIcon?: React.ReactNode;
  cancelIcon?: React.ReactNode;
  label?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export default function ConfirmButton({
  onConfirm,
  className,
  icon = <Trash2 size={18} />,
  confirmIcon = <Check size={18} />,
  cancelIcon = <X size={18} />,
  label,
  confirmLabel = "Confirm",
  variant = 'danger'
}: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isConfirming) {
      const timer = setTimeout(() => setIsConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirming]);

  const variants = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-orange-600 hover:bg-orange-700 text-white",
    primary: "bg-blue-600 hover:bg-blue-700 text-white"
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
            setIsConfirming(false);
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95",
            variants[variant]
          )}
        >
          {confirmIcon}
          {confirmLabel}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsConfirming(false);
          }}
          className="w-10 h-10 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
        >
          {cancelIcon}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsConfirming(true);
      }}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl active:scale-95",
        variants[variant],
        className
      )}
      title={label || "Delete"}
    >
      {icon}
      {label && <span className="ml-2">{label}</span>}
    </button>
  );
}
