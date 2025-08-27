import React, { useState, useCallback } from 'react';
import { contentUtils } from '../../utils';

interface TableOfContentsProps {
  content: string;
  theme: string;
  className?: string;
  onItemClick?: (anchor: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  theme,
  className = '',
  onItemClick,
}) => {
  const [activeId, setActiveId] = useState<string>('');

  // 生成目录
  const toc = React.useMemo(() => {
    return contentUtils.generateTOC(content);
  }, [content]);

  // 处理目录项点击
  const handleItemClick = useCallback((anchor: string) => {
    setActiveId(anchor);
    onItemClick?.(anchor);
    
    // 滚动到对应位置
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [onItemClick]);

  // 获取缩进样式
  const getIndentStyle = (level: number) => {
    return {
      paddingLeft: `${(level - 1) * 16}px`,
    };
  };

  // 获取主题样式
  const getThemeClasses = () => {
    const baseClasses = 'text-sm transition-colors duration-200';
    
    switch (theme) {
      case 'midnight':
        return {
          container: 'bg-midnight-900/50 border-midnight-700',
          item: `${baseClasses} text-gray-300 hover:text-white`,
          active: 'text-accent-blue bg-accent-blue/10',
        };
      case 'black':
        return {
          container: 'bg-black/50 border-gray-800',
          item: `${baseClasses} text-gray-400 hover:text-white`,
          active: 'text-accent-blue bg-accent-blue/10',
        };
      case 'paper':
      default:
        return {
          container: 'bg-white/80 border-gray-200',
          item: `${baseClasses} text-gray-600 hover:text-gray-900`,
          active: 'text-accent-blue bg-accent-blue/10',
        };
    }
  };

  const themeClasses = getThemeClasses();

  if (toc.length === 0) {
    return (
      <div className={`
        ${themeClasses.container}
        ${className}
        border rounded-lg p-4 backdrop-blur-sm
      `}>
        <div className="text-center text-gray-500 text-sm">
          暂无目录
        </div>
      </div>
    );
  }

  return (
    <div className={`
      ${themeClasses.container}
      ${className}
      border rounded-lg backdrop-blur-sm
      max-h-96 overflow-y-auto scrollbar-thin
    `}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          目录大纲
        </h3>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {toc.map((item, index) => (
            <li key={index}>
              <button
                className={`
                  ${themeClasses.item}
                  ${activeId === item.anchor ? themeClasses.active : ''}
                  w-full text-left px-2 py-1 rounded
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  focus:outline-none focus:ring-2 focus:ring-accent-blue/50
                  transition-all duration-200
                `}
                style={getIndentStyle(item.level)}
                onClick={() => handleItemClick(item.anchor)}
                title={item.title}
              >
                <span className="block truncate">
                  {item.title}
                </span>
                {item.level === 1 && (
                  <div className="h-px bg-gradient-to-r from-accent-blue/50 to-transparent mt-1" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// 文档统计组件
export const DocumentStats: React.FC<{
  content: string;
  theme: string;
  className?: string;
}> = ({ content, theme, className = '' }) => {
  const stats = React.useMemo(() => {
    return contentUtils.getStats(content);
  }, [content]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'midnight':
        return 'bg-midnight-900/50 border-midnight-700 text-gray-300';
      case 'black':
        return 'bg-black/50 border-gray-800 text-gray-400';
      case 'paper':
      default:
        return 'bg-white/80 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className={`
      ${getThemeClasses()}
      ${className}
      border rounded-lg p-3 backdrop-blur-sm
    `}>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
        文档统计
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span>字数:</span>
          <span className="font-mono">{stats.words.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>字符:</span>
          <span className="font-mono">{stats.characters.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>段落:</span>
          <span className="font-mono">{stats.paragraphs}</span>
        </div>
        <div className="flex justify-between">
          <span>行数:</span>
          <span className="font-mono">{stats.lines}</span>
        </div>
      </div>
    </div>
  );
};

// 组合侧边栏组件
export const PreviewSidebar: React.FC<{
  content: string;
  theme: string;
  className?: string;
  onTOCItemClick?: (anchor: string) => void;
}> = ({ content, theme, className = '', onTOCItemClick }) => {
  return (
    <div className={`${className} space-y-4`}>
      <TableOfContents
        content={content}
        theme={theme}
        onItemClick={onTOCItemClick}
      />
      
      <DocumentStats
        content={content}
        theme={theme}
      />
    </div>
  );
};

export default TableOfContents;