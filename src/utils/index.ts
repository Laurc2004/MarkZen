import type { DebounceFunction, ThrottleFunction, FileNode } from '../types';

// 防抖函数 - 用于编辑器内容更新
export const debounce: DebounceFunction = (func, wait) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数 - 用于滚动同步
export const throttle: ThrottleFunction = (func, limit) => {
  let inThrottle: boolean;
  return (...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 生成唯一 ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// 文件路径处理
export const pathUtils = {
  // 获取文件名
  basename: (path: string): string => {
    return path.split(/[\\/]/).pop() || '';
  },
  
  // 获取目录名
  dirname: (path: string): string => {
    const parts = path.split(/[\\/]/);
    return parts.slice(0, -1).join('/');
  },
  
  // 连接路径
  join: (...paths: string[]): string => {
    return paths
      .join('/')
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');
  },
  
  // 获取文件扩展名
  extname: (path: string): string => {
    const name = pathUtils.basename(path);
    const dotIndex = name.lastIndexOf('.');
    return dotIndex > 0 ? name.substr(dotIndex) : '';
  },
  
  // 检查是否为 Markdown 文件
  isMarkdown: (path: string): boolean => {
    const ext = pathUtils.extname(path).toLowerCase();
    return ['.md', '.markdown', '.mdown', '.mkd'].includes(ext);
  }
};

// 文件树操作工具
export const fileTreeUtils = {
  // 查找文件节点
  findNode: (tree: FileNode[], id: string): FileNode | null => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children) {
        const found = fileTreeUtils.findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  },
  
  // 查找父节点
  findParent: (tree: FileNode[], childId: string): FileNode | null => {
    for (const node of tree) {
      if (node.children?.some(child => child.id === childId)) {
        return node;
      }
      if (node.children) {
        const found = fileTreeUtils.findParent(node.children, childId);
        if (found) return found;
      }
    }
    return null;
  },
  
  // 排序文件树（目录在前，文件在后，按字母顺序）
  sortTree: (tree: FileNode[]): FileNode[] => {
    return tree.slice().sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    }).map(node => ({
      ...node,
      children: node.children ? fileTreeUtils.sortTree(node.children) : undefined
    }));
  },
  
  // 展开/折叠目录
  toggleDirectory: (tree: FileNode[], id: string): FileNode[] => {
    return tree.map(node => {
      if (node.id === id && node.type === 'directory') {
        return { ...node, isOpen: !node.isOpen };
      }
      if (node.children) {
        return { ...node, children: fileTreeUtils.toggleDirectory(node.children, id) };
      }
      return node;
    });
  }
};

// 内容处理工具
export const contentUtils = {
  // 计算文档统计信息
  getStats: (content: string) => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const lines = content.split('\n').length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    return {
      words,
      characters,
      charactersNoSpaces,
      lines,
      paragraphs
    };
  },
  
  // 提取文档标题
  getTitle: (content: string): string => {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
    }
    return '无标题文档';
  },
  
  // 生成目录大纲
  generateTOC: (content: string) => {
    const lines = content.split('\n');
    const toc: Array<{ level: number; title: string; anchor: string }> = [];
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const title = match[2].trim();
        const anchor = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        toc.push({ level, title, anchor });
      }
    });
    
    return toc;
  }
};

// 主题工具
export const themeUtils = {
  // 应用主题到 document
  applyTheme: (theme: 'paper' | 'midnight' | 'black' | 'glass') => {
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, '');
    
    switch (theme) {
      case 'midnight':
        root.classList.add('dark');
        break;
      case 'black':
        root.classList.add('dark', 'theme-black');
        break;
      case 'glass':
        root.classList.add('theme-glass');
        break;
      case 'paper':
      default:
        root.classList.remove('dark');
        break;
    }
  },
  
  // 获取主题颜色
  getThemeColors: (theme: 'paper' | 'midnight' | 'black' | 'glass') => {
    switch (theme) {
      case 'midnight':
        return {
          background: '#0f172a',
          foreground: '#ffffff',
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#8b5cf6',
          border: '#334155',
          muted: '#475569'
        };
      case 'black':
        return {
          background: '#000000',
          foreground: '#ffffff',
          primary: '#3b82f6',
          secondary: '#666666',
          accent: '#8b5cf6',
          border: '#333333',
          muted: '#555555'
        };
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          foreground: '#ffffff',
          primary: '#3b82f6',
          secondary: 'rgba(255, 255, 255, 0.9)',
          accent: '#8b5cf6',
          border: 'rgba(255, 255, 255, 0.2)',
          muted: 'rgba(255, 255, 255, 0.7)'
        };
      case 'paper':
      default:
        return {
          background: '#ffffff',
          foreground: '#1f2937',
          primary: '#3b82f6',
          secondary: '#6b7280',
          accent: '#8b5cf6',
          border: '#e5e7eb',
          muted: '#9ca3af'
        };
    }
  }
};

// 性能工具
export const performanceUtils = {
  // 测量函数执行时间
  measure: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`[MarkZen] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
  
  // 内存使用情况监控
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
};