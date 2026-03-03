import { ref } from 'vue';
import { open, save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { jsonToXml, jsonToYaml, jsonToCsv } from '../utils/converters';

/**
 * JSON转换功能的组合函数
 * 管理JSON向其他格式的转化和保存
 */
export function useConvertManager() {
  // 转换相关的状态
  const showConvertDialog = ref(false);
  const convertFormat = ref<'xml' | 'yml' | 'csv'>('xml');
  const convertResult = ref('');

  /**
   * 执行转换
   * 根据设定的格式将JSON内容转换为目标格式
   * @param jsonContent JSON内容字符串
   */
  function convertJson(jsonContent: string) {
    if (!jsonContent.trim()) {
      convertResult.value = '';
      return;
    }

    try {
      const parsed = JSON.parse(jsonContent);

      switch (convertFormat.value) {
        case 'xml':
          convertResult.value = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n' + jsonToXml(parsed, '  ') + '</root>';
          break;
        case 'yml':
          convertResult.value = jsonToYaml(parsed);
          break;
        case 'csv':
          convertResult.value = jsonToCsv(parsed);
          break;
      }
    } catch (e: any) {
      convertResult.value = '转换失败: ' + e.message;
    }
  }

  /**
   * 复制转换结果到剪贴板
   */
  function copyConvertResult() {
    navigator.clipboard.writeText(convertResult.value);
  }

  /**
   * 保存转换结果到文件
   */
  async function saveConvertResult() {
    const ext = convertFormat.value === 'xml' ? 'xml' : convertFormat.value === 'yml' ? 'yaml' : 'csv';
    const file = await save({
      filters: [{ name: convertFormat.value.toUpperCase(), extensions: [ext] }],
      defaultPath: `output.${ext}`
    });

    if (file) {
      await writeTextFile(file, convertResult.value);
    }
  }

  return {
    showConvertDialog,
    convertFormat,
    convertResult,
    convertJson,
    copyConvertResult,
    saveConvertResult
  };
}