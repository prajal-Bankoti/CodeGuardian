import React from 'react';

interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'search';
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

const Input: React.FC<InputProps> = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    label,
    error,
    disabled = false,
    className = '',
    required = false,
}) => {
    const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
    ${className}
  `;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={inputClasses}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Input;
