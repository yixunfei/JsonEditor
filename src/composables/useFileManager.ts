import { ref } from 'vue';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

/**
 * 文件管理组合函数
 * 处理JSON文件的打开、保存等操作
 */
export function useFileManager() {
  // 当前打开的文件路径
  const currentFilePath = ref('');

  /**
   * 打开JSON文件
   * 打开文件选择对话框，读取并返回文件内容
   * @returns Promise<string> 文件内容
   */
  async function openFile(): Promise<string | null> {
    const file = await open({
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (file) {
      const content = await readTextFile(file as string);
      currentFilePath.value = file as string;
      return content;
    }
    return null;
  }

  /**
   * 保存当前内容到现有文件
   * 如果不存在现有文件则另存为新文件
   */
  async function saveFile(content: string) {
    if (!currentFilePath.value) {
      await saveFileAs(content);
      return;
    }

    await writeTextFile(currentFilePath.value, content);
  }

  /**
   * 另存为新文件
   * 打开保存对话框，将内容写入选择的路径
   */
  async function saveFileAs(content: string) {
    const file = await save({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      defaultPath: 'untitled.json'
    });

    if (file) {
      await writeTextFile(file, content);
      currentFilePath.value = file;
    }
  }

  /**
   * 清空当前文件路径
   * 用于新建情况下的清理操作
   */
  function resetFile() {
    currentFilePath.value = '';
  }

  return {
    currentFilePath,
    openFile,
    saveFile,
    saveFileAs,
    resetFile
  };
}