import React from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary'
}) => {
  const baseClasses = "group relative inline-flex items-center justify-center text-base rounded-md px-8 py-2 text-lg font-semibold transition-all duration-200";
  
  const variantClasses = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30",
    secondary: "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
  };

  const gradientClasses = "bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400";

  return (
    <div className="relative inline-flex items-center justify-center gap-4 group">
      <div
        className={`absolute inset-0 duration-1000 opacity-60 transitiona-all ${gradientClasses} rounded-md blur-lg filter group-hover:opacity-100 group-hover:duration-200`}
      />
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
        <svg
          viewBox="0 0 10 10"
          height="10"
          width="10"
          fill="none"
          className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
        >
          <path
            d="M0 5h7"
            className="transition opacity-0 group-hover:opacity-100"
          />
          <path
            d="M1 1l4 4-4 4"
            className="transition group-hover:translate-x-[3px]"
          />
        </svg>
      </button>
    </div>
  );
};
