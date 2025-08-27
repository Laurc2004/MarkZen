import { useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { FileSystemService } from '../services/FileSystemService';
import { generateId, pathUtils } from '../utils';
import type { FileNode } from '../types';

export interface FileManagerHook {
  // 基础文件操作
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  saveAsFile: () => Promise<void>;
  newFile: () => void;
  
  // 导出功能
  exportAsHTML: () => Promise<void>;
  exportAsPDF: () => Promise<void>;
  
  // 最近文件
  openRecentFile: (file: FileNode) => Promise<void>;
  
  // 工作目录
  openWorkingDirectory: () => Promise<void>;
  
  // 文件状态检查
  checkUnsavedChanges: () => boolean;
}

export const useFileManager = (): FileManagerHook => {
  const {
    currentFile,
    content,
    isFileModified,
    setCurrentFile,
    setContent,
    setFileModified,
    addRecentFile,
    setCurrentWorkingDirectory,
  } = useAppStore();

  // 打开文件
  const openFile = useCallback(async () => {
    try {
      // 检查未保存的更改
      if (isFileModified && currentFile) {
        const shouldContinue = confirm('当前文件有未保存的更改，是否继续打开新文件？');
        if (!shouldContinue) return;
      }

      const filePath = await FileSystemService.openFile();
      if (!filePath) return;

      const fileContent = await FileSystemService.readFile(filePath);
      if (fileContent === null) {
        alert('无法读取文件内容');
        return;
      }

      const fileNode: FileNode = {
        id: generateId(),
        name: pathUtils.basename(filePath),
        path: filePath,
        type: 'file',
        content: fileContent,
      };

      setCurrentFile(fileNode);
      setContent(fileContent);
      setFileModified(false);
      addRecentFile(fileNode);
    } catch (error) {
      console.error('打开文件失败:', error);
      alert('打开文件失败');
    }
  }, [isFileModified, currentFile, setCurrentFile, setContent, setFileModified, addRecentFile]);

  // 保存文件
  const saveFile = useCallback(async () => {
    try {
      if (!currentFile) {
        // 如果没有当前文件，执行另存为
        await saveAsFile();
        return;
      }

      const success = await FileSystemService.writeFile(currentFile.path, content);
      if (success) {
        setFileModified(false);
        // 更新文件内容引用
        const updatedFile = { ...currentFile, content };
        setCurrentFile(updatedFile);
        addRecentFile(updatedFile);
      } else {
        alert('保存文件失败');
      }
    } catch (error) {
      console.error('保存文件失败:', error);
      alert('保存文件失败');
    }
  }, [currentFile, content, setFileModified, setCurrentFile, addRecentFile]);

  // 另存为文件
  const saveAsFile = useCallback(async () => {
    try {
      const filePath = await FileSystemService.saveAsFile(content, currentFile?.path);
      if (!filePath) return;

      const fileNode: FileNode = {
        id: generateId(),
        name: pathUtils.basename(filePath),
        path: filePath,
        type: 'file',
        content,
      };

      setCurrentFile(fileNode);
      setFileModified(false);
      addRecentFile(fileNode);
    } catch (error) {
      console.error('另存为失败:', error);
      alert('另存为失败');
    }
  }, [content, currentFile, setCurrentFile, setFileModified, addRecentFile]);

  // 新建文件
  const newFile = useCallback(() => {
    try {
      // 检查未保存的更改
      if (isFileModified && currentFile) {
        const shouldContinue = confirm('当前文件有未保存的更改，是否继续新建文件？');
        if (!shouldContinue) return;
      }

      setCurrentFile(null);
      setContent('');
      setFileModified(false);
    } catch (error) {
      console.error('新建文件失败:', error);
    }
  }, [isFileModified, currentFile, setCurrentFile, setContent, setFileModified]);

  // 导出为 HTML
  const exportAsHTML = useCallback(async () => {
    try {
      // 这里需要将 Markdown 转换为 HTML
      // 简单实现，可以集成 markdown-it 或其他库
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${currentFile?.name || '导出文档'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; }
    </style>
</head>
<body>
    <pre>${content}</pre>
</body>
</html>`;

      const success = await FileSystemService.exportAsHTML(htmlContent, currentFile?.path);
      if (success) {
        alert('导出 HTML 成功');
      } else {
        alert('导出 HTML 失败');
      }
    } catch (error) {
      console.error('导出 HTML 失败:', error);
      alert('导出 HTML 失败');
    }
  }, [content, currentFile]);

  // 导出为 PDF
  const exportAsPDF = useCallback(async () => {
    try {
      alert('PDF 导出功能即将推出');
    } catch (error) {
      console.error('导出 PDF 失败:', error);
      alert('导出 PDF 失败');
    }
  }, []);

  // 打开最近文件
  const openRecentFile = useCallback(async (file: FileNode) => {
    try {
      // 检查未保存的更改
      if (isFileModified && currentFile) {
        const shouldContinue = confirm('当前文件有未保存的更改，是否继续打开？');
        if (!shouldContinue) return;
      }

      const fileContent = await FileSystemService.readFile(file.path);
      if (fileContent === null) {
        alert('无法读取文件内容');
        return;
      }

      const updatedFile = { ...file, content: fileContent };
      setCurrentFile(updatedFile);
      setContent(fileContent);
      setFileModified(false);
      addRecentFile(updatedFile);
    } catch (error) {
      console.error('打开最近文件失败:', error);
      alert('打开文件失败');
    }
  }, [isFileModified, currentFile, setCurrentFile, setContent, setFileModified, addRecentFile]);

  // 打开工作目录
  const openWorkingDirectory = useCallback(async () => {
    try {
      const dirPath = await FileSystemService.openDirectory();
      if (!dirPath) return;

      setCurrentWorkingDirectory(dirPath);
      
      // 读取目录内容并更新文件树
      // 这里可以在 FileTree 组件中实现
      console.log('工作目录已设置:', dirPath);
    } catch (error) {
      console.error('打开工作目录失败:', error);
      alert('打开工作目录失败');
    }
  }, [setCurrentWorkingDirectory]);

  // 检查未保存的更改
  const checkUnsavedChanges = useCallback(() => {
    return isFileModified;
  }, [isFileModified]);

  return {
    openFile,
    saveFile,
    saveAsFile,
    newFile,
    exportAsHTML,
    exportAsPDF,
    openRecentFile,
    openWorkingDirectory,
    checkUnsavedChanges,
  };
};