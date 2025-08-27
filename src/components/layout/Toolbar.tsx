import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { useFileManager } from '../../hooks';
import StyleModeToggle from './StyleModeToggle';
import ThemePicker from './ThemePicker';

// Notion风格的工具栏组件
export const Toolbar: React.FC = () => {
  const {
    layout,
    setLayout,
    theme,
    currentFile,
    isFileModified,
  } = useAppStore();

  const {
    newFile,
    openFile,
    saveFile,
  } = useFileManager();

  // Clean theme styles
  const getThemeStyles = () => {
    if (theme === 'black') {
      return 'bg-gray-800/95 text-white border-gray-600/50';
    }
    return 'bg-white/95 text-gray-900 border-gray-200/50';
  };

  // Notion风格的按钮组件
  const ToolbarButton: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
    isActive?: boolean;
    variant?: 'default' | 'primary' | 'ghost';
  }> = ({ children, onClick, title, isActive = false, variant = 'default' }) => {
    const baseClasses = `
      inline-flex items-center justify-center
      px-3 py-1.5 text-sm font-medium
      rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500/50
      active:scale-95 whitespace-nowrap
    `;
    
    const variantClasses = {
      default: `
        ${isActive 
          ? (theme === 'black'
             ? 'bg-white/15 text-white border border-white/25 shadow-sm'
             : 'bg-gray-100 text-gray-800 border border-gray-300 shadow-sm')
          : (theme === 'black'
             ? 'text-gray-300 hover:bg-white/10 hover:text-white'
             : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800')
        }
      `,
      primary: `
        ${theme === 'black'
          ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30 shadow-sm'
          : 'bg-gray-700 text-white hover:bg-gray-800 border border-gray-700 shadow-sm'
        }
      `,
      ghost: `
        ${theme === 'black'
          ? 'text-gray-300 hover:bg-white/10 hover:text-white'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
        }
      `
    };

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]}`}
        onClick={onClick}
        title={title}
      >
        {children}
      </button>
    );
  };

  // 分隔线组件
  const Divider: React.FC = () => (
    <div className="w-px h-4 bg-gray-300/60 dark:bg-gray-600/60" />
  );

  return (
    <div className={`
      ${getThemeStyles()}
      h-14 px-4 flex items-center justify-between
      border-b backdrop-blur-sm relative z-10
      shadow-sm
    `}>
      {/* Brand and file info */}
      <div className="flex items-center space-x-4">
        {/* App title */}
        <div className="flex items-center space-x-2">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            MarkZen
          </div>
        </div>

        <Divider />

        {/* File status */}
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currentFile ? (
              <div className="flex items-center space-x-2">
                <span>{currentFile.name}</span>
                {isFileModified && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes" />
                )}
              </div>
            ) : (
              <span className="text-gray-400">Untitled Document</span>
            )}
          </div>
        </div>
      </div>

      {/* Main actions */}
      <div className="flex items-center space-x-1">
        {/* File operations */}
        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={newFile}
            variant="ghost"
          >
            New
          </ToolbarButton>

          <ToolbarButton
            onClick={openFile}
            variant="ghost"
          >
            Open
          </ToolbarButton>

          <ToolbarButton
            onClick={saveFile}
            variant={isFileModified ? 'primary' : 'ghost'}
          >
            Save
          </ToolbarButton>
        </div>

        <Divider />

        {/* View switching */}
        <div className="flex items-center space-x-1">
          <ToolbarButton
            onClick={() => setLayout('editor')}
            isActive={layout === 'editor'}
          >
            Editor
          </ToolbarButton>

          <ToolbarButton
            onClick={() => setLayout('split')}
            isActive={layout === 'split'}
          >
            Split
          </ToolbarButton>

          <ToolbarButton
            onClick={() => setLayout('preview')}
            isActive={layout === 'preview'}
          >
            Preview
          </ToolbarButton>
        </div>
      </div>

      {/* Settings and tools */}
      <div className="flex items-center space-x-2">
        <StyleModeToggle />
        
        <Divider />
        
        <ThemePicker />
      </div>
    </div>
  );
};

export default Toolbar;