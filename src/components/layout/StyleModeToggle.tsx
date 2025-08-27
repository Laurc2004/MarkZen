import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/appStore';

// Clean editing mode types
export type StyleMode = 'normal' | 'zen';

interface StyleModeToggleProps {
  className?: string;
}

export const StyleModeToggle: React.FC<StyleModeToggleProps> = ({ className = '' }) => {
  const { 
    focusMode, 
    typewriterMode, 
    theme,
    toggleFocusMode, 
    toggleTypewriterMode,
    setLayout 
  } = useAppStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const getCurrentMode = (): StyleMode => {
    if (focusMode) return 'zen';
    return 'normal';
  };

  const setStyleMode = (mode: StyleMode) => {
    // Reset all modes first
    if (focusMode) toggleFocusMode();
    if (typewriterMode) toggleTypewriterMode();
    
    switch (mode) {
      case 'normal':
        setLayout('split');
        break;
      case 'zen':
        toggleFocusMode();
        setLayout('editor');
        break;
    }
    setIsOpen(false);
  };

  // Simple editing mode options
  const styleOptions = [
    { 
      id: 'normal' as StyleMode, 
      name: '🗺️ Normal Mode', 
      description: 'Full editor with toolbar and preview',
      details: 'Complete writing environment'
    },
    { 
      id: 'zen' as StyleMode, 
      name: '🧘 Zen Mode', 
      description: 'Minimal interface for focused writing',
      details: 'Hide all distractions, press ESC to exit'
    },
  ];

  const currentMode = getCurrentMode();
  const currentOption = styleOptions.find(opt => opt.id === currentMode) || styleOptions[0];

  // Get button styles
  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center space-x-2 px-3 py-1.5
      rounded-lg text-sm font-medium transition-all duration-200
      border focus:outline-none focus:ring-2 focus:ring-gray-400/50
      hover:scale-105 active:scale-95 min-w-[140px]
    `;
    
    if (theme === 'black') {
      return `${baseStyles} bg-gray-800/90 text-white border-gray-600/50 hover:bg-gray-700/90`;
    }
    return `${baseStyles} bg-white/90 text-gray-900 border-gray-200/50 hover:bg-gray-50/90`;
  };

  // Get dropdown menu styles
  const getMenuStyles = () => {
    const baseStyles = `
      absolute top-full right-0 mt-2 w-80
      backdrop-blur-md rounded-xl shadow-2xl border
      animate-slide-up overflow-hidden z-50
    `;
    
    if (theme === 'black') {
      return `${baseStyles} bg-gray-800/95 border-gray-600/50`;
    }
    return `${baseStyles} bg-white/95 border-gray-200/50`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 模式切换按钮 */}
      <button
        ref={buttonRef}
        className={getButtonStyles()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {/* 模式图标 */}
        <span>{currentOption.name.split(' ')[0]}</span>
        
        {/* 模式名称 */}
        <span className="truncate">
          {currentOption.name.split(' ').slice(1).join(' ')}
        </span>
        
        {/* 下拉箭头 */}
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 模式选择面板 */}
      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单内容 */}
          <div className={getMenuStyles()}>
            <div className="p-4">
              {/* Title */}
              <div className="mb-4">
                <h3 className={`text-sm font-semibold mb-1 ${
                  theme === 'black' ? 'text-white' : 'text-gray-900'
                }`}>
                  Writing Mode
                </h3>
                <p className={`text-xs ${
                  theme === 'black' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Choose your preferred editing experience
                </p>
              </div>
              
              {/* Mode options */}
              <div className="space-y-2">
                {styleOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`
                      w-full p-3 text-left transition-all duration-200
                      rounded-lg border-2
                      ${currentMode === option.id 
                        ? (theme === 'black'
                           ? 'bg-gray-700/50 border-gray-500 shadow-sm'
                           : 'bg-gray-100 border-gray-300 shadow-sm')
                        : (theme === 'black'
                           ? 'border-transparent hover:bg-gray-700/30'
                           : 'border-transparent hover:bg-gray-50')
                      }
                      focus:outline-none focus:ring-2 focus:ring-gray-400/50
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setStyleMode(option.id);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Mode icon */}
                      <div className="text-lg mt-0.5">
                        {option.name.split(' ')[0]}
                      </div>
                      
                      {/* Mode info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium text-sm ${
                            theme === 'black' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {option.name.split(' ').slice(1).join(' ')}
                          </h4>
                          
                          {/* Selected indicator */}
                          {currentMode === option.id && (
                            <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <p className={`text-xs mt-1 ${
                          theme === 'black' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                        
                        <p className={`text-xs mt-1 italic ${
                          theme === 'black' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {option.details}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StyleModeToggle;