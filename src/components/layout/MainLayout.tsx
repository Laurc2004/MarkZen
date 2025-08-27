import React, { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useWindowSize } from '../../hooks';
import { useFileManager } from '../../hooks';
import MarkdownEditor from '../editor/MarkdownEditor';
import MarkdownPreview from '../preview/MarkdownPreview';
import Toolbar from './Toolbar';

export const MainLayout: React.FC = () => {
  const {
    layout,
    focusMode,
    typewriterMode,
    theme,
    content,
    editorConfig,
    setContent,
    setCursorPosition,
    toggleFocusMode,
  } = useAppStore();

  const windowSize = useWindowSize();
  const { saveFile } = useFileManager();
  
  // Basic keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S for save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
        return;
      }
      
      // ESC to exit zen mode
      if (e.key === 'Escape' && focusMode) {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveFile, focusMode, toggleFocusMode]);

  // Apply theme to body class
  useEffect(() => {
    const body = document.body;
    body.className = ''; // Clear existing classes
    
    switch (theme) {
      case 'midnight':
        body.classList.add('theme-dark');
        break;
      case 'black':
        body.classList.add('theme-black');
        break;
      case 'glass':
        body.classList.add('theme-glass');
        break;
      case 'paper':
      default:
        body.classList.add('theme-light');
        break;
    }
    
    if (focusMode) {
      body.classList.add('focus-mode');
    }
    
    if (typewriterMode) {
      body.classList.add('typewriter-mode');
    }
  }, [theme, focusMode, typewriterMode]);

  // Responsive layout logic
  const isMobile = windowSize.width < 768;
  
  const getLayoutClasses = () => {
    if (focusMode) {
      return {
        mainContent: 'main-content focus-mode',
        editorContainer: 'editor-container',
        showPreview: false,
      };
    }

    if (isMobile) {
      // Mobile: single column only
      return {
        mainContent: 'main-content mobile-stack',
        editorContainer: layout === 'preview' ? 'hidden' : 'editor-container',
        previewContainer: layout === 'editor' ? 'hidden' : 'preview-container',
        showPreview: layout !== 'editor',
        showEditor: layout !== 'preview',
      };
    }

    // Desktop: handle split view
    switch (layout) {
      case 'split':
        return {
          mainContent: 'main-content',
          editorContainer: 'editor-container split-view',
          previewContainer: 'preview-container',
          showPreview: true,
          showEditor: true,
        };
      case 'preview':
        return {
          mainContent: 'main-content',
          previewContainer: 'preview-container',
          showPreview: true,
          showEditor: false,
        };
      case 'editor':
      default:
        return {
          mainContent: 'main-content',
          editorContainer: 'editor-container',
          showPreview: false,
          showEditor: true,
        };
    }
  };

  const layoutClasses = getLayoutClasses();

  return (
    <div className="app-container">
      {/* Toolbar - hidden in focus mode */}
      {!focusMode && <Toolbar />}

      {/* Main Content Area */}
      <div className={layoutClasses.mainContent}>
        {/* Editor */}
        {layoutClasses.showEditor !== false && (
          <div className={layoutClasses.editorContainer}>
            <div className="editor-content">
              <MarkdownEditor
                content={content}
                onChange={setContent}
                config={editorConfig}
                theme={theme}
                onCursorChange={setCursorPosition}
              />
            </div>
          </div>
        )}

        {/* Preview */}
        {layoutClasses.showPreview && (
          <div className={layoutClasses.previewContainer}>
            <div className="preview-content">
              <MarkdownPreview
                content={content}
                className="markdown-body"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;