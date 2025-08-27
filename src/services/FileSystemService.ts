import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, readDir, mkdir, remove, exists } from '@tauri-apps/plugin-fs';
import type { FileNode } from '../types';
import { generateId, pathUtils } from '../utils';

export class FileSystemService {
  // 打开文件对话框
  static async openFile(): Promise<string | null> {
    try {
      const filePath = await open({
        multiple: false,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx']
          },
          {
            name: 'Text',
            extensions: ['txt']
          },
          {
            name: 'All',
            extensions: ['*']
          }
        ]
      });
      return filePath;
    } catch (error) {
      console.error('Failed to open file dialog:', error);
      return null;
    }
  }

  // 保存文件对话框
  static async saveFile(content: string, defaultPath?: string): Promise<string | null> {
    try {
      const filePath = await save({
        defaultPath,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md']
          },
          {
            name: 'Text',
            extensions: ['txt']
          }
        ]
      });
      
      if (filePath) {
        await writeTextFile(filePath, content);
        return filePath;
      }
      return null;
    } catch (error) {
      console.error('Failed to save file:', error);
      return null;
    }
  }

  // 另存为文件
  static async saveAsFile(content: string, currentPath?: string): Promise<string | null> {
    const defaultName = currentPath ? pathUtils.basename(currentPath) : '新文件.md';
    return await this.saveFile(content, defaultName);
  }

  // 导出为 HTML
  static async exportAsHTML(htmlContent: string, defaultPath?: string): Promise<boolean> {
    try {
      const filePath = await save({
        defaultPath: defaultPath?.replace(/\.(md|markdown)$/i, '.html') || '导出.html',
        filters: [
          {
            name: 'HTML',
            extensions: ['html']
          }
        ]
      });
      
      if (filePath) {
        await writeTextFile(filePath, htmlContent);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to export as HTML:', error);
      return false;
    }
  }

  // 导出为 PDF (需要额外实现)
  static async exportAsPDF(): Promise<boolean> {
    try {
      // 这里需要集成 PDF 生成库或使用浏览器打印 API
      console.log('导出 PDF 功能尚未实现');
      return false;
    } catch (error) {
      console.error('Failed to export as PDF:', error);
      return false;
    }
  }

  // 读取文件内容
  static async readFile(filePath: string): Promise<string | null> {
    try {
      const content = await readTextFile(filePath);
      return content;
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  // 写入文件内容
  static async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      await writeTextFile(filePath, content);
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }

  // 读取目录内容
  static async readDirectory(dirPath: string): Promise<FileNode[]> {
    try {
      const entries = await readDir(dirPath);
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        const fullPath = `${dirPath}/${entry.name}`;
        const node: FileNode = {
          id: generateId(),
          name: entry.name,
          path: fullPath,
          type: entry.isDirectory ? 'directory' : 'file',
          isOpen: false,
        };

        // 如果是目录，递归读取子目录（可选，为了性能可以按需加载）
        if (entry.isDirectory) {
          // 暂时不递归读取，改为按需加载
          node.children = [];
        }

        nodes.push(node);
      }

      // 排序：目录在前，文件在后，按字母顺序
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Failed to read directory:', error);
      return [];
    }
  }

  // 创建新文件
  static async createFile(filePath: string, content: string = ''): Promise<boolean> {
    try {
      await writeTextFile(filePath, content);
      return true;
    } catch (error) {
      console.error('Failed to create file:', error);
      return false;
    }
  }

  // 创建新目录
  static async createDirectory(dirPath: string): Promise<boolean> {
    try {
      await mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.error('Failed to create directory:', error);
      return false;
    }
  }

  // 删除文件
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await remove(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  // 删除目录
  static async deleteDirectory(dirPath: string): Promise<boolean> {
    try {
      await remove(dirPath, { recursive: true });
      return true;
    } catch (error) {
      console.error('Failed to delete directory:', error);
      return false;
    }
  }

  // 检查文件/目录是否存在
  static async fileExists(path: string): Promise<boolean> {
    try {
      return await exists(path);
    } catch (error) {
      console.error('Failed to check file existence:', error);
      return false;
    }
  }

  // 重命名文件/目录（通过读取、创建、删除实现）
  static async rename(oldPath: string, newPath: string): Promise<boolean> {
    try {
      // 检查旧文件是否存在
      if (!(await this.fileExists(oldPath))) {
        throw new Error('Source file does not exist');
      }

      // 检查新文件是否已存在
      if (await this.fileExists(newPath)) {
        throw new Error('Target file already exists');
      }

      // 判断是文件还是目录
      const entries = await readDir(pathUtils.dirname(oldPath));
      const entry = entries.find(e => `${pathUtils.dirname(oldPath)}/${e.name}` === oldPath);
      
      if (!entry) {
        throw new Error('Unable to determine file type');
      }

      if (entry.isDirectory) {
        // 目录重命名（简单实现，可能需要递归复制）
        await mkdir(newPath);
        // 这里需要递归复制所有内容，然后删除原目录
        // 为简化实现，暂时使用系统调用
        throw new Error('Directory rename not fully implemented');
      } else {
        // 文件重命名
        const content = await readTextFile(oldPath);
        await writeTextFile(newPath, content);
        await remove(oldPath);
      }

      return true;
    } catch (error) {
      console.error('Failed to rename:', error);
      return false;
    }
  }

  // 获取文件信息
  static async getFileInfo(filePath: string) {
    try {
      // Tauri 可能没有直接的 stat API，需要通过其他方式获取
      // 这里先返回基本信息
      return {
        path: filePath,
        name: pathUtils.basename(filePath),
        extension: pathUtils.extname(filePath),
        isMarkdown: pathUtils.isMarkdown(filePath),
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  // 打开文件夹对话框
  static async openDirectory(): Promise<string | null> {
    try {
      const dirPath = await open({
        directory: true,
        multiple: false,
      });
      return dirPath;
    } catch (error) {
      console.error('Failed to open directory dialog:', error);
      return null;
    }
  }

  // 监听文件变化（需要 Tauri 文件监听插件）
  static async watchDirectory() {
    try {
      // 这里需要集成 Tauri 的文件监听功能
      // 暂时留空，后续实现
      console.log('File watching not implemented yet');
    } catch (error) {
      console.error('Failed to watch directory:', error);
    }
  }
}

export default FileSystemService;