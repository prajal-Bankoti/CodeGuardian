import React, { useState } from 'react';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
    title,
    children,
    defaultOpen = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border border-gray-200 rounded-lg ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 bg-white border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
