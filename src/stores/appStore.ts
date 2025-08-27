import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppStore, EditorConfig } from '../types';

// 默认编辑器配置
const defaultEditorConfig: EditorConfig = {
  theme: 'paper',
  fontSize: 16, // 增加默认字体大小
  lineHeight: 1.7, // 稍微增加行高
  tabSize: 2,
  wordWrap: true,
  lineNumbers: false, // 默认隐藏行号，更简洁
  minimap: false,
};

// 创建 MarkZen 应用状态 store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        // 初始状态
        currentFile: null,
        openFiles: [],
        fileTree: [],
        editorConfig: defaultEditorConfig,
        content: '',
        cursorPosition: { line: 0, column: 0 },
        layout: 'editor', // 默认仅编辑器模式
        sidebarVisible: false, // 默认关闭侧边栏
        focusMode: false,
        typewriterMode: false,
        theme: 'paper',
        previewContent: '',
        scrollSync: true,
        
        // 文件操作状态
        isFileModified: false,
        currentWorkingDirectory: null,
        recentFiles: [],

        // 文件操作
        setCurrentFile: (file) =>
          set({ currentFile: file }, false, 'setCurrentFile'),

        addOpenFile: (file) =>
          set(
            (state) => {
              const isAlreadyOpen = state.openFiles.some(f => f.id === file.id);
              if (isAlreadyOpen) return state;
              return { openFiles: [...state.openFiles, file] };
            },
            false,
            'addOpenFile'
          ),

        removeOpenFile: (fileId) =>
          set(
            (state) => ({
              openFiles: state.openFiles.filter(f => f.id !== fileId),
              currentFile: state.currentFile?.id === fileId ? null : state.currentFile,
            }),
            false,
            'removeOpenFile'
          ),

        setFileTree: (tree) =>
          set({ fileTree: tree }, false, 'setFileTree'),

        // 文件修改状态管理
        setFileModified: (isModified) =>
          set({ isFileModified: isModified }, false, 'setFileModified'),

        // 工作目录管理
        setCurrentWorkingDirectory: (dir) =>
          set({ currentWorkingDirectory: dir }, false, 'setCurrentWorkingDirectory'),

        // 最近文件管理
        addRecentFile: (file) =>
          set(
            (state) => {
              const filtered = state.recentFiles.filter(f => f.path !== file.path);
              return {
                recentFiles: [file, ...filtered].slice(0, 10) // 保持最近10个
              };
            },
            false,
            'addRecentFile'
          ),

        // 编辑器操作
        setContent: (content) =>
          set(() => ({ 
            content, 
            isFileModified: true // 简化修改状态检测
          }), false, 'setContent'),

        updateEditorConfig: (config) =>
          set(
            (state) => ({
              editorConfig: { ...state.editorConfig, ...config },
            }),
            false,
            'updateEditorConfig'
          ),

        setCursorPosition: (position) =>
          set({ cursorPosition: position }, false, 'setCursorPosition'),

        // 界面操作
        setLayout: (layout) =>
          set({ layout }, false, 'setLayout'),

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarVisible: !state.sidebarVisible }),
            false,
            'toggleSidebar'
          ),

        toggleFocusMode: () =>
          set(
            (state) => ({ 
              focusMode: !state.focusMode,
              sidebarVisible: state.focusMode ? true : false, // 退出专注模式时恢复侧边栏
            }),
            false,
            'toggleFocusMode'
          ),

        toggleTypewriterMode: () =>
          set(
            (state) => ({ typewriterMode: !state.typewriterMode }),
            false,
            'toggleTypewriterMode'
          ),

        // 主题操作
        setTheme: (theme) =>
          set(
            (state) => ({
              theme,
              editorConfig: { ...state.editorConfig, theme },
            }),
            false,
            'setTheme'
          ),

        // 预览操作
        setPreviewContent: (previewContent) =>
          set({ previewContent }, false, 'setPreviewContent'),

        toggleScrollSync: () =>
          set(
            (state) => ({ scrollSync: !state.scrollSync }),
            false,
            'toggleScrollSync'
          ),
      }),
      {
        name: 'markzen-app-store',
        // 只持久化用户偏好设置
        partialize: (state) => ({
          editorConfig: state.editorConfig,
          theme: state.theme,
          layout: state.layout,
          sidebarVisible: state.sidebarVisible,
          scrollSync: state.scrollSync,
        }),
      }
    ),
    {
      name: 'MarkZen App Store',
    }
  )
);

// 选择器 hooks 用于性能优化
export const useCurrentFile = () => useAppStore(state => state.currentFile);
export const useOpenFiles = () => useAppStore(state => state.openFiles);
export const useFileTree = () => useAppStore(state => state.fileTree);
export const useEditorConfig = () => useAppStore(state => state.editorConfig);
export const useContent = () => useAppStore(state => state.content);
export const useLayout = () => useAppStore(state => state.layout);
export const useTheme = () => useAppStore(state => state.theme);
export const useFocusMode = () => useAppStore(state => state.focusMode);
export const useTypewriterMode = () => useAppStore(state => state.typewriterMode);
export const useSidebarVisible = () => useAppStore(state => state.sidebarVisible);

// 主题相关的选择器
export const useIsDarkTheme = () => useAppStore(state => 
  state.theme === 'midnight' || state.theme === 'black'
);

export const useThemeClass = () => useAppStore(state => {
  switch (state.theme) {
    case 'midnight':
      return 'dark';
    case 'black':
      return 'dark theme-black';
    case 'paper':
    default:
      return '';
  }
});