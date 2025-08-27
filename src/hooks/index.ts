import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { debounce, throttle } from '../utils';
import FileSystemService from '../services/FileSystemService';
import type { FileNode } from '../types';

// 导出文件管理器 hook
export { useFileManager } from './useFileManager';
export { useWindowTitle } from './useWindowTitle';

// 文件系统操作 hook
export const useFileSystem = () => {
  const { setFileTree, setCurrentFile, addOpenFile, setContent } = useAppStore();
  
  const openFile = useCallback(async (filePath?: string) => {
    try {
      let targetPath = filePath;
      if (!targetPath) {
        const result = await FileSystemService.openFile();
        targetPath = result ?? undefined;
      }
      
      if (!targetPath) return;
      
      const content = await FileSystemService.readFile(targetPath);
      if (content === null) {
        console.error('Failed to read file content');
        return;
      }
      
      const fileInfo = await FileSystemService.getFileInfo(targetPath);
      const file: FileNode = {
        id: targetPath,
        name: fileInfo?.name || targetPath.split(/[\\\/]/).pop() || '',
        path: targetPath,
        type: 'file',
      };
      
      setCurrentFile(file);
      addOpenFile(file);
      setContent(content);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, [setCurrentFile, addOpenFile, setContent]);
  
  const saveFile = useCallback(async (filePath?: string, content?: string) => {
    try {
      const { currentFile, content: currentContent } = useAppStore.getState();
      const targetPath = filePath || currentFile?.path;
      const targetContent = content || currentContent;
      
      if (!targetPath) {
        // 另存为
        const success = await FileSystemService.saveFile(targetContent);
        if (success) {
          console.log('File saved successfully');
        }
        return success;
      } else {
        // 保存到现有文件
        const success = await FileSystemService.writeFile(targetPath, targetContent);
        if (success) {
          console.log('File saved successfully');
        }
        return success;
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  }, []);
  
  const loadDirectory = useCallback(async (dirPath?: string) => {
    try {
      let targetPath = dirPath;
      if (!targetPath) {
        const result = await FileSystemService.openDirectory();
        targetPath = result ?? undefined;
      }
      
      if (!targetPath) return;
      
      const entries = await FileSystemService.readDirectory(targetPath);
      setFileTree(entries);
    } catch (error) {
      console.error('Failed to load directory:', error);
    }
  }, [setFileTree]);
  
  const createFile = useCallback(async (dirPath: string, fileName: string) => {
    try {
      const filePath = `${dirPath}/${fileName}`;
      const success = await FileSystemService.createFile(filePath, '');
      if (success) {
        // 重新加载目录
        await loadDirectory(dirPath);
      }
      return success;
    } catch (error) {
      console.error('Failed to create file:', error);
      return false;
    }
  }, [loadDirectory]);
  
  const createDirectory = useCallback(async (parentPath: string, dirName: string) => {
    try {
      const dirPath = `${parentPath}/${dirName}`;
      const success = await FileSystemService.createDirectory(dirPath);
      if (success) {
        // 重新加载父目录
        await loadDirectory(parentPath);
      }
      return success;
    } catch (error) {
      console.error('Failed to create directory:', error);
      return false;
    }
  }, [loadDirectory]);
  
  const deleteFile = useCallback(async (filePath: string) => {
    try {
      const success = await FileSystemService.deleteFile(filePath);
      if (success) {
        // 重新加载目录
        const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
        await loadDirectory(dirPath);
      }
      return success;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }, [loadDirectory]);
  
  return { 
    openFile, 
    saveFile, 
    loadDirectory, 
    createFile, 
    createDirectory, 
    deleteFile 
  };
};

// 编辑器内容同步 hook
export const useContentSync = (delay: number = 300) => {
  const { content, setContent, setPreviewContent } = useAppStore();
  
  // 防抖更新预览内容
  const debouncedUpdatePreview = useCallback(
    debounce((newContent: string) => {
      // 这里将来集成 remark 解析
      setPreviewContent(newContent);
    }, delay),
    [setPreviewContent, delay]
  );
  
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    debouncedUpdatePreview(newContent);
  }, [setContent, debouncedUpdatePreview]);
  
  return { content, updateContent };
};

// 滚动同步 hook
export const useScrollSync = (enabled: boolean = true) => {
  const editorRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const [isEditorScrolling, setIsEditorScrolling] = useState(false);
  const [isPreviewScrolling, setIsPreviewScrolling] = useState(false);
  
  // 节流滚动同步
  const throttledSyncScroll = useCallback(
    throttle((source: 'editor' | 'preview', scrollTop: number, scrollHeight: number, clientHeight: number) => {
      if (!enabled) return;
      
      const target = source === 'editor' ? previewRef.current : editorRef.current;
      if (!target) return;
      
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);
      const targetScrollTop = scrollRatio * (target.scrollHeight - target.clientHeight);
      
      target.scrollTop = targetScrollTop;
    }, 16), // 60 FPS
    [enabled]
  );
  
  const handleEditorScroll = useCallback((e: Event) => {
    if (isPreviewScrolling) return;
    setIsEditorScrolling(true);
    
    const target = e.target as HTMLElement;
    throttledSyncScroll('editor', target.scrollTop, target.scrollHeight, target.clientHeight);
    
    setTimeout(() => setIsEditorScrolling(false), 100);
  }, [isPreviewScrolling, throttledSyncScroll]);
  
  const handlePreviewScroll = useCallback((e: Event) => {
    if (isEditorScrolling) return;
    setIsPreviewScrolling(true);
    
    const target = e.target as HTMLElement;
    throttledSyncScroll('preview', target.scrollTop, target.scrollHeight, target.clientHeight);
    
    setTimeout(() => setIsPreviewScrolling(false), 100);
  }, [isEditorScrolling, throttledSyncScroll]);
  
  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    if (editor && enabled) {
      editor.addEventListener('scroll', handleEditorScroll);
    }
    
    if (preview && enabled) {
      preview.addEventListener('scroll', handlePreviewScroll);
    }
    
    return () => {
      if (editor) {
        editor.removeEventListener('scroll', handleEditorScroll);
      }
      if (preview) {
        preview.removeEventListener('scroll', handlePreviewScroll);
      }
    };
  }, [enabled, handleEditorScroll, handlePreviewScroll]);
  
  return { editorRef, previewRef };
};

// 键盘快捷键 hook - 对标 Typora
export const useKeyboardShortcuts = () => {
  const { 
    toggleSidebar, 
    toggleFocusMode, 
    toggleTypewriterMode,
    setLayout,
    setTheme,
    layout,
    theme 
  } = useAppStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;
      
      // 文件操作快捷键 - 使用全局事件处理
      if (isCtrl && !isShift && !isAlt) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            // 新建文件 - 在组件中处理
            console.log('新建文件');
            break;
          case 'o':
            e.preventDefault();
            // 打开文件 - 在组件中处理
            console.log('打开文件');
            break;
          case 's':
            e.preventDefault();
            // 保存文件 - 在组件中处理
            console.log('保存文件');
            break;
          case 'w':
            e.preventDefault();
            // 关闭文件/退出应用
            console.log('关闭文件');
            break;
          case ',':
            e.preventDefault();
            // 打开设置
            console.log('打开设置');
            break;
        }
      }
      
      // Ctrl+Shift 组合键
      if (isCtrl && isShift && !isAlt) {
        switch (e.key) {
          case 'S':
            e.preventDefault();
            console.log('另存为');
            break;
          case 'E':
            e.preventDefault();
            console.log('导出 HTML');
            break;
          case 'P':
            e.preventDefault();
            console.log('导出 PDF');
            break;
          case 'N':
            e.preventDefault();
            // 新建窗口
            console.log('新建窗口');
            break;
        }
      }
      
      // 视图和布局快捷键
      if (isCtrl && !isShift && !isAlt) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setLayout('editor');
            break;
          case '2':
            e.preventDefault();
            setLayout('split');
            break;
          case '3':
            e.preventDefault();
            setLayout('preview');
            break;
          case '\\':
            e.preventDefault();
            toggleSidebar();
            break;
          case '/':
            e.preventDefault();
            // 切换源码/预览模式
            if (layout === 'editor') {
              setLayout('split');
            } else if (layout === 'split') {
              setLayout('preview');
            } else {
              setLayout('editor');
            }
            break;
        }
      }
      
      // 主题切换
      if (isCtrl && isAlt && !isShift) {
        switch (e.key) {
          case 't':
            e.preventDefault();
            // 循环切换主题
            const themes: Array<'paper' | 'midnight' | 'black' | 'glass'> = ['paper', 'midnight', 'black', 'glass'];
            const currentIndex = themes.indexOf(theme);
            const nextIndex = (currentIndex + 1) % themes.length;
            setTheme(themes[nextIndex]);
            break;
        }
      }
      
      // 特殊功能键
      switch (e.key) {
        case 'F11':
          e.preventDefault();
          toggleFocusMode();
          break;
        case 'F12':
          e.preventDefault();
          toggleTypewriterMode();
          break;
        case 'Escape':
          e.preventDefault();
          // 退出专注模式
          const currentState = useAppStore.getState();
          if (currentState.focusMode) {
            toggleFocusMode();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, toggleFocusMode, toggleTypewriterMode, setLayout, setTheme, layout, theme]);
};

// 主题切换 hook
export const useThemeToggle = () => {
  const { theme, setTheme } = useAppStore();
  
  const nextTheme = useCallback(() => {
    const themes: Array<'paper' | 'midnight' | 'black' | 'glass'> = ['paper', 'midnight', 'black', 'glass'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme, setTheme]);
  
  const toggleDarkMode = useCallback(() => {
    setTheme(theme === 'paper' ? 'midnight' : 'paper');
  }, [theme, setTheme]);
  
  return { theme, nextTheme, toggleDarkMode };
};

// 窗口大小变化 hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
};

// 自动保存 hook
export const useAutoSave = (delay: number = 2000) => {
  const { content, currentFile } = useAppStore();
  const { saveFile } = useFileSystem();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const debouncedSave = useCallback(
    debounce(async (filePath: string, content: string) => {
      if (!filePath) return;
      
      setIsSaving(true);
      try {
        await saveFile(filePath, content);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay),
    [saveFile, delay]
  );
  
  useEffect(() => {
    if (currentFile?.path && content) {
      debouncedSave(currentFile.path, content);
    }
  }, [content, currentFile?.path, debouncedSave]);
  
  return { isSaving, lastSaved };
};