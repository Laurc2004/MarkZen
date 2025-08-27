import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { themeUtils } from './utils';
import { useWindowTitle } from './hooks';
import MainLayout from './components/layout/MainLayout';

function App() {
  const { theme } = useAppStore();
  
  // 动态更新窗口标题
  useWindowTitle();

  // 应用主题到 DOM
  useEffect(() => {
    // 移除所有主题类
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-black', 'theme-glass');
    // 添加当前主题类
    document.body.classList.add(`theme-${theme}`);
    
    // 应用主题工具
    themeUtils.applyTheme(theme);
  }, [theme]);

  // 确保默认主题应用
  useEffect(() => {
    if (!document.body.classList.contains('theme-light') && 
        !document.body.classList.contains('theme-dark') && 
        !document.body.classList.contains('theme-black') && 
        !document.body.classList.contains('theme-glass')) {
      document.body.classList.add('theme-light');
    }
  }, []);

  return (
    <div className="app-container">
      <MainLayout />
    </div>
  );
}

export default App;
