// src/components/worksheets-new/controls/NavigationControls.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "px-6 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
  isBackDisabled: boolean;
  isNextDisabled: boolean;
  nextButtonText?: string;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ onBack, onNext, isBackDisabled, isNextDisabled, nextButtonText = "Next" }) => {
  return (
    <div className="flex justify-between items-center p-4 sm:p-6 bg-gray-100 border-t">
      <Button onClick={onBack} disabled={isBackDisabled} variant="secondary">Back</Button>
      <Button onClick={onNext} disabled={isNextDisabled} variant="primary">{nextButtonText}</Button>
    </div>
  );
};
export default NavigationControls;
