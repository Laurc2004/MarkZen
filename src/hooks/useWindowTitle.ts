import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useAppStore } from '../stores/appStore';

export const useWindowTitle = () => {
  const { currentFile, isFileModified } = useAppStore();

  useEffect(() => {
    const updateTitle = async () => {
      try {
        const window = getCurrentWindow();
        let title = 'MarkZen';

        if (currentFile) {
          const fileName = currentFile.name || 'Untitled';
          const modifiedIndicator = isFileModified ? ' •' : '';
          title = `${fileName}${modifiedIndicator} - MarkZen`;
        } else if (isFileModified) {
          title = 'Untitled • - MarkZen';
        }

        await window.setTitle(title);
      } catch (error) {
        console.error('Failed to update window title:', error);
        // Fallback to document title for web version
        document.title = currentFile 
          ? `${currentFile.name}${isFileModified ? ' •' : ''} - MarkZen`
          : isFileModified 
            ? 'Untitled • - MarkZen'
            : 'MarkZen';
      }
    };

    updateTitle();
  }, [currentFile, isFileModified]);
};