import { ref } from 'vue';
import { JsonNode } from '../types/json';
import { parseJsonToTree, reconstructJson, getValueType } from '../utils/jsonParser';
import { Ref } from 'vue';

/**
 * JSON节点编辑与操作的组合函数
 * 管理对JSON树结构的修改和操作
 */
export function useJsonNodeOperations(
  jsonContent: Ref<string>,
  jsonData: Ref<JsonNode | null>,
  errorMsg: Ref<string>
) {
  /**
   * 更新JSON文本内容
   */
  function updateJsonContent() {
    if (jsonData.value) {
      try {
        const data = reconstructJson(jsonData.value);
        jsonContent.value = JSON.stringify(data, null, 2);
      } catch (e: any) {
        errorMsg.value = e.message;
      }
    }
  }

  // 当前编辑的节点
  const editingNode = ref<JsonNode | null>(null);
  
  // 编辑状态下的键值
  const editValue = ref('');
  const editKey = ref('');

  // 调用上下文菜单
  const showContextMenu = ref(false);
  const contextMenuPos = ref({ x: 0, y: 0 });
  const contextMenuNode = ref<JsonNode | null>(null);

  // 复制的数据  
  const copiedData = ref<any>(null);

  // "添加节点"对话框相关
  const showAddDialog = ref(false);
  const addDialogType = ref<string>('string');
  const newKeyName = ref('');
  const newValueStr = ref('');
  const parentNodeForAdd = ref<JsonNode | null>(null);

  /**
   * 打开节点编辑对话框
   * @param node 要编辑的节点
   */
  function openEditDialog(node: JsonNode) {
    editingNode.value = node;
    editKey.value = node.key;
    editValue.value = node.type === 'string' ? node.value : JSON.stringify(node.value, null, 2);
  }

  /**
   * 保存编辑结果
   */
  function saveEdit() {
    if (!editingNode.value) return;

    try {
      editingNode.value.key = editKey.value;
      if (editingNode.value.type === 'string') {
        editingNode.value.value = editValue.value;
      } else {
        editingNode.value.value = JSON.parse(editValue.value);
        editingNode.value.type = getValueType(editingNode.value.value);

        if (editingNode.value.type === 'object' || editingNode.value.type === 'array') {
          const path = editingNode.value.path;
          editingNode.value.children = editingNode.value.type === 'array'
            ? editingNode.value.value.map((item: any, i: number) => parseJsonToTree(item, String(i), `${path}[${i}]`))
            : Object.keys(editingNode.value.value).map(k => parseJsonToTree(editingNode.value.value[k], k, `${path}.${k}`));
        }
      }

      updateJsonContent();
    } catch (e: any) {
      errorMsg.value = e.message;
    }

    editingNode.value = null;
  }

  /**
   * 取消编辑
   */
  function cancelEdit() {
    editingNode.value = null;
  }

  /**
   * 显示添加菜单
   */
  function showAddMenu(event: MouseEvent, node: JsonNode) {
    event.preventDefault();
    contextMenuNode.value = node;
    contextMenuPos.value = { x: event.clientX, y: event.clientY };
    showContextMenu.value = true;
  }

  /**
   * 隐藏菜单
   */
  function hideMenu() {
    showContextMenu.value = false;
  }

  /**
   * 打开添加对话框
   */
  function openAddDialog(type: string) {
    parentNodeForAdd.value = contextMenuNode.value;
    addDialogType.value = type;
    newKeyName.value = parentNodeForAdd.value?.type === 'array' ? String(parentNodeForAdd.value.children?.length || 0) : '';
    newValueStr.value = type === 'object' ? '{}' : type === 'array' ? '[]' : type === 'string' ? '' : type === 'number' ? '0' : type === 'boolean' ? 'true' : 'null';
    showAddDialog.value = true;
    hideMenu();
  }

  /**
   * 确认添加新节点
   */
  function confirmAdd() {
    if (!parentNodeForAdd.value) return;

    let newValue: any;
    try {
      if (addDialogType.value === 'string') {
        newValue = newValueStr.value;
      } else if (addDialogType.value === 'number') {
        newValue = parseFloat(newValueStr.value);
      } else if (addDialogType.value === 'boolean') {
        newValue = newValueStr.value === 'true';
      } else if (addDialogType.value === 'null') {
        newValue = null;
      } else if (addDialogType.value === 'object') {
        newValue = JSON.parse(newValueStr.value || '{}');
      } else if (addDialogType.value === 'array') {
        newValue = JSON.parse(newValueStr.value || '[]');
      }
    } catch (e: any) {
      errorMsg.value = '值解析失败: ' + e.message;
      return;
    }

    if (parentNodeForAdd.value.type === 'array') {
      if (!parentNodeForAdd.value.children) parentNodeForAdd.value.children = [];
      const newIndex = parentNodeForAdd.value.children.length;
      const newNode = parseJsonToTree(newValue, String(newIndex), `${parentNodeForAdd.value.path}[${newIndex}]`);
      parentNodeForAdd.value.children.push(newNode);
    } else if (parentNodeForAdd.value.type === 'object') {
      if (!parentNodeForAdd.value.children) parentNodeForAdd.value.children = [];
      if (!newKeyName.value.trim()) {
        errorMsg.value = '请输入键名';
        return;
      }
      const newNode = parseJsonToTree(newValue, newKeyName.value, `${parentNodeForAdd.value.path}.${newKeyName.value}`);
      parentNodeForAdd.value.children.push(newNode);
    }

    updateJsonContent();
    showAddDialog.value = false;
  }

  /**
   * 删除节点
   */
  function deleteNode(node: JsonNode) {
    if (!jsonData.value || node.key === 'root') return;

    function removeFromParent(parent: JsonNode, target: JsonNode): boolean {
      if (!parent.children) return false;
      const index = parent.children!.indexOf(target);
      if (index !== -1) {
        parent.children!.splice(index, 1);
        return true;
      }
      for (const child of parent.children!) {
        if (removeFromParent(child, target)) return true;
      }
      return false;
    }

    removeFromParent(jsonData.value, node);

    updateJsonContent();
    hideMenu();
  }

  /**
   * 展开全部节点
   */
  function expandAll(node: JsonNode) {
    if (!node) return;
    node.expanded = true;
    node.children?.forEach(expandAll);
  }

  /**
   * 收起全部节点
   */
  function collapseAll(node: JsonNode) {
    if (!node) return;
    node.expanded = false;
    node.children?.forEach(collapseAll);
  }

  /**
   * 切换节点展开状态
   */
  function toggleExpand(node: JsonNode) {
    node.expanded = !node.expanded;
  }

  /**
   * 复制节点值
   */
  function copyValue(node: JsonNode) {
    const value = node.type === 'string' ? node.value : JSON.stringify(node.value, null, 2);
    navigator.clipboard.writeText(value);
    hideMenu();
  }

  /**
   * 复制键名
   */
  function copyKey(node: JsonNode) {
    navigator.clipboard.writeText(node.key);
    hideMenu();
  }

  /**
   * 复制路径
   */
  function copyPath(node: JsonNode) {
    navigator.clipboard.writeText(node.path);
    hideMenu();
  }

  /**
   * 复制整个节点
   */
  function copyNode(node: JsonNode) {
    copiedData.value = reconstructJson(node);
    hideMenu();
  }

  /**
   * 粘贴复制数据到节点
   */
  function pasteValue(node: JsonNode) {
    if (copiedData.value === null) return;

    if (node.type === 'array') {
      if (!node.children) node.children = [];
      const newIndex = node.children.length;
      const newNode = parseJsonToTree(copiedData.value, String(newIndex), `${node.path}[${newIndex}]`);
      node.children.push(newNode);
    } else if (node.type === 'object') {
      if (!node.children) node.children = [];
      const newKey = 'pasted_' + Date.now();
      const newNode = parseJsonToTree(copiedData.value, newKey, `${node.path}.${newKey}`);
      node.children.push(newNode);
    }

    updateJsonContent();
    hideMenu();
  }

  return {
    editingNode,
    editValue,
    editKey,
    showContextMenu,
    contextMenuPos,
    contextMenuNode,
    copiedData,
    showAddDialog,
    addDialogType,
    newKeyName,
    newValueStr,
    parentNodeForAdd,
    openEditDialog,
    saveEdit,
    cancelEdit,
    showAddMenu,
    hideMenu,
    openAddDialog,
    confirmAdd,
    deleteNode,
    expandAll,
    collapseAll,
    toggleExpand,
    copyValue,
    copyKey,
    copyPath,
    copyNode,
    pasteValue
  };
}