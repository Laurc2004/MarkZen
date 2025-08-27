import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: 'left' | 'right';
  width?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  className = '',
  align = 'right',
  width = '240px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        className={`dropdown-trigger ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      {/* Dropdown Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="dropdown-menu show"
            style={{
              position: 'fixed',
              top: position.top,
              ...(align === 'right' 
                ? { right: position.right } 
                : { left: position.left }
              ),
              width,
              zIndex: 1000,
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                className={`dropdown-item ${item.active ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center gap-3 w-full">
                  {item.icon && (
                    <div className="flex-shrink-0">{item.icon}</div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs opacity-60 mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.active && (
                    <div className="w-2 h-2 bg-current rounded-full flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default Dropdown;