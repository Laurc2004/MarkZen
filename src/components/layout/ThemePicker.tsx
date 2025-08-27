import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useThemeToggle } from '../../hooks';
import { themeUtils } from '../../utils';

interface ThemePickerProps {
  className?: string;
}

interface ThemeOption {
  id: 'paper' | 'black';
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
  };
}

// Clean theme options for zen experience
const themeOptions: ThemeOption[] = [
  {
    id: 'paper',
    name: '☀️ Light',
    description: 'Clean white theme for daytime writing',
    preview: 'bg-gradient-to-br from-gray-50 to-white',
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      background: '#ffffff',
      surface: '#f8fafc',
    },
  },
  {
    id: 'black',
    name: '🌙 Dark',
    description: 'Soft dark theme for comfortable writing',
    preview: 'bg-gradient-to-br from-gray-800 to-gray-900',
    colors: {
      primary: '#ffffff',
      secondary: '#e5e7eb',
      background: '#1f2937',
      surface: '#374151',
    },
  },
];

export const ThemePicker: React.FC<ThemePickerProps> = ({ className = '' }) => {
  const { theme, setTheme } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themeOptions.find(t => t.id === theme) || themeOptions[0];

  const handleThemeChange = (newTheme: 'paper' | 'black') => {
    setTheme(newTheme);
    themeUtils.applyTheme(newTheme);
    setIsOpen(false);
  };

  // Get current theme button styles
  const getButtonStyles = () => {
    const baseStyles = `
      inline-flex items-center space-x-2 px-3 py-1.5
      rounded-lg text-sm font-medium transition-all duration-200
      border focus:outline-none focus:ring-2 focus:ring-gray-400/50
      hover:scale-105 active:scale-95
    `;
    
    if (theme === 'black') {
      return `${baseStyles} bg-gray-800/90 text-white border-gray-600/50 hover:bg-gray-700/90`;
    }
    return `${baseStyles} bg-white/90 text-gray-900 border-gray-200/50 hover:bg-gray-50/90`;
  };

  // Get dropdown menu styles
  const getMenuStyles = () => {
    const baseStyles = `
      absolute top-full right-0 mt-2 w-72
      backdrop-blur-md rounded-xl shadow-2xl border
      animate-slide-up overflow-hidden z-50
    `;
    
    if (theme === 'black') {
      return `${baseStyles} bg-gray-800/95 border-gray-600/50 text-white`;
    }
    return `${baseStyles} bg-white/95 border-gray-200/50 text-gray-900`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 主题选择按钮 */}
      <button
        className={getButtonStyles()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Switch Theme"
      >
        {/* 主题预览色块 */}
        <div className={`w-4 h-4 rounded-md ${currentTheme.preview} border border-gray-300/50`} />
        
        {/* 主题名称 */}
        <span>{currentTheme.name.split(' ')[1] || currentTheme.name.split(' ')[0]}</span>
        
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

      {/* 主题选择面板 */}
      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div 
            className="fixed inset-0" 
            style={{ zIndex: 49 }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单内容 */}
          <div className={getMenuStyles()}>
            <div className="p-3">
              {/* Title */}
              <div className="mb-3">
                <h3 className={`text-sm font-semibold mb-1 ${
                  theme === 'black' ? 'text-white' : 'text-gray-900'
                }`}>
                  Choose Theme
                </h3>
                <p className={`text-xs ${
                  theme === 'black' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Select your preferred color scheme
                </p>
              </div>
              
              {/* Theme options */}
              <div className="space-y-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`
                      w-full p-3 text-left transition-all duration-200
                      rounded-lg border-2
                      ${theme === option.id 
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
                      handleThemeChange(option.id);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {/* 主题预览 */}
                      <div className="relative">
                        <div className={`w-10 h-8 rounded-lg ${option.preview} border border-gray-300/50 shadow-sm`} />
                        
                        {/* Selected indicator */}
                        {theme === option.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Theme info */}
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${
                          theme === 'black' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {option.name}
                        </h4>
                        <p className={`text-xs mt-0.5 ${
                          theme === 'black' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {option.description}
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

// 主题状态指示器组件
export const ThemeIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme } = useAppStore();
  const currentTheme = themeOptions.find(t => t.id === theme) || themeOptions[0];
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${currentTheme.preview} border border-white/20`} />
      <span className="text-xs opacity-70">{currentTheme.name}</span>
    </div>
  );
};

// 主题切换快捷按钮
export const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { nextTheme } = useThemeToggle();
  const { theme } = useAppStore();
  
  const getIcon = () => {
    switch (theme) {
      case 'paper':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'midnight':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'black':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <button
      className={`
        ${className}
        p-2 rounded-lg transition-all duration-200
        hover:bg-white/10 dark:hover:bg-white/5
        focus:outline-none focus:ring-2 focus:ring-gray-500/50
        active:scale-95
      `}
      onClick={nextTheme}
      title="切换主题"
    >
      {getIcon()}
    </button>
  );
};

export default ThemePicker;