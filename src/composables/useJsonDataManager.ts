import { ref, computed, watch } from 'vue';
import { JsonNode } from '../types/json';
import { parseJsonToTree, reconstructJson, getValueType } from '../utils/jsonParser';

/**
 * JSON数据处理的组合函数
 * 管理JSON编辑的核心逻辑：解析、格式化、错误处理等
 */
export function useJsonDataManager() {
  // JSON原始内容
  const jsonContent = ref('');
  
  // 解析后的JSON树结构
  const jsonData = ref<JsonNode | null>(null);
  
  // 错误信息
  const errorMsg = ref('');
  
  // 错误发生时的行号
  const errorLine = ref<number | null>(null);
  
  // 计算属性：行数
  const lineCount = computed(() => {
    if (!jsonContent.value) return 1;
    return jsonContent.value.split('\n').length;
  });

  /**
   * 解析JSON内容
   * 将文本内容解析成树状结构，捕获错误
   */
  function parseJson() {
    errorLine.value = null;
    if (!jsonContent.value.trim()) {
      jsonData.value = null;
      errorMsg.value = '';
      return;
    }

    try {
      const parsed = JSON.parse(jsonContent.value);
      jsonData.value = parseJsonToTree(parsed);
      errorMsg.value = '';
    } catch (e: any) {
      const msg = e.message;
      errorMsg.value = msg;
      const posMatch = msg.match(/position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const lines = jsonContent.value.substring(0, pos).split('\n');
        errorLine.value = lines.length;
      } else {
        const lineMatch = msg.match(/line (\d+)/);
        if (lineMatch) {
          errorLine.value = parseInt(lineMatch[1]);
        }
      }
      jsonData.value = null;
    }
  }

  /**
   * 格式化JSON
   * 按指定缩进级别格式化JSON内容
   * @param indent 缩进大小，默认为2
   */
  function formatJson(indent: number = 2) {
    if (!jsonData.value) return;
    try {
      const data = reconstructJson(jsonData.value);
      jsonContent.value = JSON.stringify(data, null, indent);
      parseJson();
    } catch (e: any) {
      errorMsg.value = e.message;
    }
  }

  /**
   * 压缩JSON
   * 将JSON内容转换成无空白字符的紧凑形式
   */
  function compressJson() {
    if (!jsonData.value) return;
    try {
      const data = reconstructJson(jsonData.value);
      jsonContent.value = JSON.stringify(data);
      parseJson();
    } catch (e: any) {
      errorMsg.value = e.message;
    }
  }

  // 监听文本内容变化，实时解析
  watch(jsonContent, parseJson);

  return {
    jsonContent,
    jsonData,
    errorMsg,
    errorLine,
    lineCount,
    parseJson,
    formatJson,
    compressJson
  };
}