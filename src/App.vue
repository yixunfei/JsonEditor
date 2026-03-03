<script setup lang="ts">
// @ts-nocheck
import { h, defineComponent, PropType, ref } from 'vue';
import { JsonNode } from './types/json';
import { useJsonDataManager } from './composables/useJsonDataManager';
import { useThemeManager } from './composables/useThemeManager';
import { useFileManager } from './composables/useFileManager';
import { useJsonNodeOperations } from './composables/useJsonNodeOperations';
import { useConvertManager } from './composables/useConvertManager';
import { reconstructJson } from './utils/jsonParser';
// 导入背景图片功能相关（暂时保留但禁用）
import { open } from '@tauri-apps/plugin-dialog';

// 初始化各模块
const {
  jsonContent,
  jsonData,
  errorMsg,
  errorLine,
  lineCount,
  parseJson,
  formatJson,
  compressJson
} = useJsonDataManager();

const {
  themeMode,
  bgColor,
  panelOpacity,
  keyColorDark,
  keyColorLight,
  valueColorDark, 
  valueColorLight,
  switchToDarkTheme,
  switchToLightTheme,
  getKeyColor,
  getValueColor
} = useThemeManager();

const {
  currentFilePath,
  openFile: openJsonFile,
  saveFile,
  saveFileAs
} = useFileManager();

const {
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
} = useJsonNodeOperations(jsonContent, jsonData, errorMsg);

const {
  showConvertDialog,
  convertFormat,
  convertResult,
  convertJson,
  copyConvertResult,
  saveConvertResult
} = useConvertManager();

// 背景功能相关（暂时保留但禁用）
const bgImage = ref('');
async function selectBgImage() {
  const file = await open({
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'] }]
  });
  if (file) {
    bgImage.value = 'asset://localhost/' + (file as string).replace(/\\/g, '/');
  }
}
function clearBgImage() {
  bgImage.value = '';
}

// 在初始化时调用转换函数以确保可用性
function triggerConversion() {
  if (showConvertDialog.value) {
    convertJson(jsonContent.value);
  }
}

// TreeNode 组件定义
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: { type: Object as PropType<JsonNode>, required: true },
    depth: { type: Number, default: 0 },
    isLight: { type: Boolean, default: false },
    keyColor: { type: String, default: '#7dd3fc' },
    valueColor: { type: String, default: '#94a3b8' }
  },
  emits: ['toggle', 'edit', 'contextmenu'],
  setup(props, { emit }): () => any {
    const bracketColors = props.isLight
      ? ['#dc2626', '#d97706', '#2563eb', '#7c3aed', '#0891b2', '#be185d', '#047857', '#b45309']
      : ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
    const getColor = (d: number) => bracketColors[d % bracketColors.length];
    const hasCh = () => props.node.children !== undefined && props.node.children!.length > 0;
    const getVal = (n: JsonNode): string => {
      if (n.type === 'string') { 
        const v = n.value as string; 
        return v.length > 40 ? `"${v.substring(0, 40)}..."` : `"${v}"`; 
      }
      if (n.type === 'null') return 'null';
      if (n.type === 'boolean') return String(n.value);
      if (n.type === 'number') return String(n.value);
      if (n.type === 'object') return `{ ${n.children?.length || 0} }`;
      if (n.type === 'array') return `[ ${n.children?.length || 0} ]`;
      return '';
    };
    const textColor = props.isLight ? '#1e293b' : '#e2e8f0';

    return () => h('div', { class: 'tree-node' }, [
      h('div', { 
        class: 'node-row', 
        style: { paddingLeft: props.depth * 20 + 'px', color: textColor },
        onContextmenu: (e: MouseEvent) => { e.preventDefault(); emit('contextmenu', e, props.node); },
        onDblclick: () => emit('edit', props.node)
      }, [
        hasCh() ? h('span', { 
          class: 'expand-btn', 
          onClick: (e: Event) => { e.stopPropagation(); emit('toggle', props.node); }
        }, props.node.expanded ? '▼' : '▶') : h('span', { class: 'expand-placeholder' }),
        h('span', { class: 'type-bracket', style: { color: getColor(props.depth) } }, 
          props.node.type === 'object' ? '{' : props.node.type === 'array' ? '[' : ''
        ),
        props.node.key !== 'root' ? h('span', { class: 'node-key', style: { color: props.keyColor } }, props.node.key) : null,
        props.node.key !== 'root' ? h('span', { class: 'colon' }, ':') : null,
        h('span', { class: 'node-value', style: { color: props.valueColor } }, getVal(props.node)),
        h('span', { class: 'type-badge', style: { backgroundColor: getColor(props.depth), color: '#fff' } }, props.node.type)
      ]),
      props.node.expanded && props.node.children ? h('div', { class: 'children-container' }, 
        props.node.children!.map((child, index) => 
          h(TreeNode, { 
            key: child.key + child.path + index, 
            node: child, 
            depth: props.depth + 1,
            isLight: props.isLight,
            keyColor: props.keyColor,
            valueColor: props.valueColor,
            onToggle: (n: JsonNode) => emit('toggle', n),
            onEdit: (n: JsonNode) => emit('edit', n),
            onContextmenu: (e: MouseEvent, n: JsonNode) => emit('contextmenu', e, n)
          })
        )
      ) : null,
      props.node.expanded && (props.node.type === 'object' || props.node.type === 'array') ? 
        h('div', { class: 'node-row closing-row', style: { paddingLeft: props.depth * 20 + 'px', color: textColor } }, [
          h('span', { class: 'expand-placeholder' }),
          h('span', { class: 'closing-bracket', style: { color: getColor(props.depth) } }, 
            props.node.type === 'object' ? '}' : ']'
          )
        ]) : null
    ])
  }
});

// 便捷函数
function getEditorStyle() {
  const style: any = { backgroundColor: bgColor.value };
  if (bgImage.value) {
    style.backgroundImage = `url(${bgImage.value})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }
  return style;
}

// 文件操作包装函数 
async function openFile() {
  const content = await openJsonFile();
  if (content) {
    jsonContent.value = content;
  }
}

function updateJsonContent() {
  if (jsonData.value) {
    try {
      const data = reconstructJson(jsonData.value);
      jsonContent.value = JSON.stringify(data, null, 2);
      parseJson();
    } catch (e: any) {
      errorMsg.value = e.message;
    }
  }
}
</script>

<template>
  <div 
    class="editor" 
    :class="{ 'light-theme': themeMode === 'light' }"
    :style="getEditorStyle()"
    @click="hideMenu"
  >
    <div class="content-layer">
      <div class="toolbar">
        <button @click="openFile">📂 打开</button>
        <button @click="() => saveFile(jsonContent)">💾 保存</button>
        <button @click="() => saveFileAs(jsonContent)">📥 另存为</button>
        <span class="separator"></span>
        <button @click="formatJson(2)">✨ 格式化</button>
        <button @click="compressJson">📦 压缩</button>
        <button @click="showConvertDialog = true; convertJson(jsonContent)">🔄 转换</button>
        <button @click="jsonData && expandAll(jsonData)">⬇ 展开</button>
        <button @click="jsonData && collapseAll(jsonData)">⬆ 折叠</button>
        <span class="separator"></span>
        <button @click="switchToDarkTheme">🌙 深色</button>
        <button @click="switchToLightTheme">☀️ 浅色</button>
      </div>
      
      <div class="main">
        <div class="source-panel">
          <div class="panel-header">源代码</div>
          <div class="editor-container">
            <div class="line-numbers">
              <span v-for="n in lineCount" :key="n" class="line-number" :class="{ 'error-line': errorLine === n }">{{ n }}</span>
            </div>
            <textarea 
              v-model="jsonContent" 
              class="source-editor"
              placeholder="在此粘贴或输入 JSON..."
              spellcheck="false"
            ></textarea>
          </div>
          <div v-if="errorMsg" class="error-bar">
            <span v-if="errorLine">第 {{ errorLine }} 行: </span>{{ errorMsg }}
          </div>
        </div>
        
        <div class="tree-panel">
          <div class="panel-header">
            树形视图
            <span v-if="jsonData" class="node-count">
              {{ jsonData.children?.length || 0 }} 个属性
            </span>
          </div>
          <div class="tree-view">
            <div v-if="jsonData" class="tree-root">
              <TreeNode 
                :node="jsonData" 
                :depth="0"
                :isLight="themeMode === 'light'"
                :keyColor="getKeyColor()"
                :valueColor="getValueColor()"
                @toggle="toggleExpand"
                @edit="openEditDialog"
                @contextmenu="showAddMenu"
              />
            </div>
            <div v-else class="empty-hint">
              请输入或粘贴 JSON 数据
            </div>
          </div>
        </div>
      </div>
      
      <div 
        v-if="showContextMenu" 
        class="context-menu"
        :style="{ left: contextMenuPos.x + 'px', top: contextMenuPos.y + 'px' }"
      >
        <div class="menu-title">操作</div>
        <div class="menu-item" @click="copyValue(contextMenuNode!)">📋 复制值</div>
        <div class="menu-item" @click="copyKey(contextMenuNode!)">🔑 复制键名</div>
        <div class="menu-item" @click="copyPath(contextMenuNode!)">📍 复制路径</div>
        <div class="menu-item" @click="copyNode(contextMenuNode!)">📄 复制节点</div>
        <div class="menu-item" v-if="copiedData !== null" @click="pasteValue(contextMenuNode!)">📥 粘贴</div>
        <div class="menu-separator"></div>
        <div class="menu-title">添加子节点</div>
        <div class="menu-item" @click="openAddDialog('string')">➕ 字符串</div>
        <div class="menu-item" @click="openAddDialog('number')">➕ 数字</div>
        <div class="menu-item" @click="openAddDialog('boolean')">➕ 布尔值</div>
        <div class="menu-item" @click="openAddDialog('null')">➕ Null</div>
        <div class="menu-item" @click="openAddDialog('object')">➕ 对象</div>
        <div class="menu-item" @click="openAddDialog('array')">➕ 数组</div>
        <div class="menu-separator"></div>
        <div class="menu-item danger" @click="deleteNode(contextMenuNode!)" v-if="contextMenuNode?.key !== 'root'">🗑️ 删除节点</div>
      </div>
      
      <div v-if="editingNode" class="modal-overlay" @click.self="cancelEdit">
        <div class="dialog">
          <h3>编辑节点</h3>
          <div class="form-group">
            <label>键名 (Key)</label>
            <input v-model="editKey" placeholder="请输入键名" />
          </div>
          <div class="form-group">
            <label>值 (Value) - {{ editingNode.type }}</label>
            <textarea v-model="editValue" rows="8" placeholder="请输入值"></textarea>
          </div>
          <div class="dialog-buttons">
            <button @click="cancelEdit">取消</button>
            <button class="primary" @click="saveEdit">保存</button>
          </div>
        </div>
      </div>
      
      <div v-if="showAddDialog" class="modal-overlay" @click.self="showAddDialog = false">
        <div class="dialog">
          <h3>添加 {{ addDialogType === 'string' ? '字符串' : addDialogType === 'number' ? '数字' : addDialogType === 'boolean' ? '布尔值' : addDialogType === 'null' ? 'Null' : addDialogType === 'object' ? '对象' : '数组' }}</h3>
          <div class="form-group">
            <label>键名 (Key)</label>
            <input v-model="newKeyName" :placeholder="parentNodeForAdd?.type === 'array' ? '数组索引将自动生成' : '请输入键名'" :disabled="parentNodeForAdd?.type === 'array'" />
          </div>
          <div class="form-group">
            <label>值 (Value)</label>
            <textarea v-model="newValueStr" rows="5" :placeholder="addDialogType === 'string' ? '输入字符串' : addDialogType === 'number' ? '输入数字' : addDialogType === 'boolean' ? 'true 或 false' : addDialogType === 'null' ? 'null' : addDialogType === 'object' ? '{}' : '[]'"></textarea>
          </div>
          <div class="dialog-buttons">
            <button @click="showAddDialog = false">取消</button>
            <button class="primary" @click="confirmAdd">添加</button>
          </div>
        </div>
      </div>
      
      <div v-if="showConvertDialog" class="modal-overlay" @click.self="showConvertDialog = false">
        <div class="dialog convert-dialog">
          <h3>🔄 格式转换</h3>
          
          <div class="format-select">
            <button 
              :class="{ active: convertFormat === 'xml' }" 
              @click="convertFormat = 'xml'; convertJson(jsonContent)"
            >
              XML
            </button>
            <button 
              :class="{ active: convertFormat === 'yml' }" 
              @click="convertFormat = 'yml'; convertJson(jsonContent)"
            >
              YAML
            </button>
            <button 
              :class="{ active: convertFormat === 'csv' }" 
              @click="convertFormat = 'csv'; convertJson(jsonContent)"
            >
              CSV
            </button>
          </div>
          
          <textarea 
            v-model="convertResult" 
            class="convert-result"
            readonly
          ></textarea>
          
          <div class="dialog-buttons">
            <button @click="copyConvertResult">📋 复制</button>
            <button class="primary" @click="saveConvertResult">💾 保存文件</button>
            <button @click="showConvertDialog = false">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.editor {
  width: 100%;
  height: 100vh;
  background: #1e1e1e;
  color: #e2e8f0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.content-layer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.editor.light-theme {
  background: #f8fafc;
  color: #1e293b;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(30, 30, 30, v-bind(panelOpacity));
  border-bottom: 1px solid #3e3e3e;
  gap: 8px;
}

.light-theme .toolbar {
  background: rgba(241, 245, 249, v-bind(panelOpacity));
  border-bottom-color: #cbd5e1;
}

.toolbar button {
  padding: 6px 12px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.toolbar button:hover {
  background: #2563eb;
}

.separator {
  width: 1px;
  height: 20px;
  background: #3e3e3e;
  margin: 0 8px;
}

.light-theme .separator {
  background: #cbd5e1;
}

.main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.source-panel, .tree-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: rgba(30, 30, 30, v-bind(panelOpacity));
}

.light-theme .source-panel,
.light-theme .tree-panel {
  background: rgba(255, 255, 255, v-bind(panelOpacity));
}

.source-panel {
  border-right: 1px solid #3e3e3e;
}

.light-theme .source-panel {
  border-right-color: #cbd5e1;
}

.panel-header {
  padding: 8px 16px;
  background: rgba(37, 37, 38, v-bind(panelOpacity));
  font-weight: 500;
  border-bottom: 1px solid #3e3e3e;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.light-theme .panel-header {
  background: rgba(241, 245, 249, v-bind(panelOpacity));
  border-bottom-color: #cbd5e1;
}

.node-count {
  font-size: 12px;
  color: #94a3b8;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.line-numbers {
  padding: 16px 8px 16px 12px;
  background: #1a1a1a;
  color: #6b7280;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: right;
  user-select: none;
  min-width: 45px;
  overflow: hidden;
}

.light-theme .line-numbers {
  background: #f1f5f9;
  color: #94a3b8;
}

.line-number {
  display: block;
}

.line-number.error-line {
  background: #ef4444;
  color: #fff;
}

.source-editor {
  flex: 1;
  background: transparent;
  color: #e2e8f0;
  border: none;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  overflow: auto;
}

.light-theme .source-editor {
  color: #1e293b;
}

.source-editor::placeholder {
  color: #6b7280;
}

.error-bar {
  padding: 8px 16px;
  background: #7f1d1d;
  color: #fca5a5;
  font-size: 13px;
}

.tree-view {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

.empty-hint {
  color: #6b7280;
  text-align: center;
  padding: 40px;
}

.light-theme .empty-hint {
  color: #94a3b8;
}

.tree-root {
  padding-left: 0;
}

.tree-node {
  user-select: none;
}

.node-row {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: default;
}

.node-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.light-theme .node-row:hover {
  background: rgba(0, 0, 0, 0.05);
}

.expand-btn {
  width: 16px;
  cursor: pointer;
  color: #64748b;
  font-size: 10px;
  flex-shrink: 0;
}

.expand-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.type-bracket, .closing-bracket {
  margin-right: 2px;
  font-weight: bold;
}

.node-key {
  font-weight: 500;
}

.colon {
  margin: 0 4px;
  color: #94a3b8;
}

.light-theme .colon {
  color: #64748b;
}

.node-value {
  flex: 1;
  word-break: break-all;
}

.type-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  margin-left: 8px;
  text-transform: lowercase;
  flex-shrink: 0;
  color: #fff;
}

.children-container {
  margin-left: 0;
}

.context-menu {
  position: fixed;
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  padding: 4px 0;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.light-theme .context-menu {
  background: #fff;
  border-color: #e2e8f0;
}

.menu-title {
  padding: 6px 12px;
  font-size: 11px;
  color: #a1a1aa;
  text-transform: uppercase;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
}

.menu-item:hover {
  background: #3b82f6;
  color: #fff;
}

.light-theme .menu-item:hover {
  background: #3b82f6;
}

.menu-separator {
  height: 1px;
  background: #3f3f46;
  margin: 4px 0;
}

.light-theme .menu-separator {
  background: #e2e8f0;
}

.danger {
  color: #f87171;
}

.danger:hover {
  background: #dc2626 !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 8px;
  padding: 24px;
  min-width: 450px;
}

.light-theme .dialog {
  background: #fff;
  border-color: #e2e8f0;
}

.dialog h3 {
  margin-bottom: 20px;
  color: #fafafa;
}

.light-theme .dialog h3 {
  color: #1e293b;
}

.convert-dialog {
  min-width: 600px;
}

.format-select {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.format-select button {
  flex: 1;
  padding: 10px;
  background: #3f3f46;
  color: #e2e8f0;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.light-theme .format-select button {
  background: #e2e8f0;
  color: #1e293b;
}

.format-select button.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: #fff;
}

.convert-result {
  width: 100%;
  height: 300px;
  background: #18181b;
  color: #e2e8f0;
  border: 1px solid #3f3f46;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  resize: none;
  margin-bottom: 16px;
}

.light-theme .convert-result {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #7dd3fc;
  font-size: 13px;
}

.light-theme .form-group label {
  color: #0369a1;
}

.form-group input,
.form-group textarea {
  width: 100%;
  background: #18181b;
  color: #e2e8f0;
  border: 1px solid #3f3f46;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Consolas', monospace;
  font-size: 14px;
}

.light-theme .form-group input,
.light-theme .form-group textarea {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group input:disabled {
  color: #6b7280;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.dialog-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background: #3f3f46;
  color: #e2e8f0;
}

.light-theme .dialog-buttons button {
  background: #e2e8f0;
  color: #1e293b;
}

.dialog-buttons button.primary {
  background: #3b82f6;
  color: #fff;
}

.dialog-buttons button:hover {
  background: #52525b;
}

.light-theme .dialog-buttons button:hover {
  background: #cbd5e1;
}

.dialog-buttons button.primary:hover {
  background: #2563eb;
}
</style>