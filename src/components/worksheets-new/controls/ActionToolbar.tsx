// src/components/worksheets-new/controls/ActionToolbar.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}
const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props}>{children}</button>; // The variant type is not strictly enforced by the ButtonHTMLAttributes
};

interface ActionToolbarProps {
  onResetAll: () => void;
  onExportPDF: () => void;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({ onResetAll, onExportPDF }) => {
  return (
    <div className="p-4 bg-gray-50 border-b flex items-center justify-end space-x-3">
      <Button onClick={onExportPDF} variant="ghost">Export to PDF</Button>
      <Button onClick={onResetAll} variant="danger">Reset All Tasks</Button>
    </div>
  );
};
export default ActionToolbar;
