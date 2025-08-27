// MarkZen 核心类型定义

import { EditorState, Transaction } from "@codemirror/state";

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  parent?: string;
  isOpen?: boolean;
  isSelected?: boolean;
  content?: string; // 文件内容
}

export interface EditorConfig {
  theme: 'paper' | 'midnight' | 'black' | 'glass';
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  typewriterMode?: boolean;
}

export interface AppState {
  // 文件管理
  currentFile: FileNode | null;
  openFiles: FileNode[];
  fileTree: FileNode[];
  
  // 文件操作状态
  isFileModified: boolean;
  currentWorkingDirectory: string | null;
  recentFiles: FileNode[];
  
  // 编辑器状态
  editorConfig: EditorConfig;
  content: string;
  cursorPosition: { line: number; column: number };
  
  // 界面状态
  layout: 'split' | 'editor' | 'preview';
  sidebarVisible: boolean;
  focusMode: boolean;
  typewriterMode: boolean;
  
  // 主题
  theme: 'paper' | 'midnight' | 'black' | 'glass';
  
  // 预览
  previewContent: string;
  scrollSync: boolean;
}

export interface EditorView {
  state: EditorState;
  dispatch: (transaction: Transaction) => void;
  dom: HTMLElement;
  scrollDOM: HTMLElement;
}

export interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onFileCreate: (path: string, type: 'file' | 'directory') => void;
  onFileDelete: (file: FileNode) => void;
  onFileRename: (file: FileNode, newName: string) => void;
}

export interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  config: EditorConfig;
  theme: string;
  onCursorChange?: (position: { line: number; column: number }) => void;
}

export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    muted: string;
  };
  editorTheme: any; // CodeMirror theme
}

// Tauri API 类型
export interface TauriFileSystem {
  readTextFile: (path: string) => Promise<string>;
  writeTextFile: (path: string, content: string) => Promise<void>;
  readDir: (path: string) => Promise<FileEntry[]>;
  mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
  remove: (path: string, options?: { recursive?: boolean }) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
}

export interface FileEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
}

// Zustand Store 类型
export interface AppStore extends AppState {
  // 文件操作
  setCurrentFile: (file: FileNode | null) => void;
  addOpenFile: (file: FileNode) => void;
  removeOpenFile: (fileId: string) => void;
  setFileTree: (tree: FileNode[]) => void;
  
  // 文件修改状态管理
  setFileModified: (isModified: boolean) => void;
  
  // 工作目录管理
  setCurrentWorkingDirectory: (dir: string | null) => void;
  
  // 最近文件管理
  addRecentFile: (file: FileNode) => void;
  
  // 编辑器操作
  setContent: (content: string) => void;
  updateEditorConfig: (config: Partial<EditorConfig>) => void;
  setCursorPosition: (position: { line: number; column: number }) => void;
  
  // 界面操作
  setLayout: (layout: AppState['layout']) => void;
  toggleSidebar: () => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
  
  // 主题操作
  setTheme: (theme: AppState['theme']) => void;
  
  // 预览操作
  setPreviewContent: (content: string) => void;
  toggleScrollSync: () => void;
}

// 工具函数类型
export type DebounceFunction = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
) => (...args: Parameters<T>) => void;

export type ThrottleFunction = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
) => (...args: Parameters<T>) => void;