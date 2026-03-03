# JSON Editor

一个功能实用的 JSON 可视化编辑工具，支持树形视图编辑、格式转换、主题定制等功能。

## 功能特性

### 核心功能
- **可视化编辑**: 树形结构展示 JSON 数据，支持展开/折叠
- **源码编辑**: 左侧源码区域，支持行号显示
- **格式化/压缩**: 一键美化 JSON 格式或压缩为单行
- **JSON 校验**: 实时语法检查，错误行号精确定位
- **右键菜单操作**: 
  - 复制值/键名/路径/节点
  - 粘贴节点
  - 添加子节点 (字符串/数字/布尔/Null/对象/数组)
  - 删除节点

### 格式转换
- JSON → XML
- JSON → YAML  
- JSON → CSV

### 个性化设置
- **主题模式**: 深色/浅色主题切换
- **背景图片**: 自定义编辑器背景
- **颜色配置**: 自定义键名(Key)和值(Value)的显示颜色
- **大括号彩虹**: 嵌套层级使用不同颜色区分

## 界面预览

```
┌─────────────────────────────────────────────────────────┐
│  📂 打开  💾 保存  📥 另存为  │ ✨ 格式化  📦 压缩  🔄 转换  │ ⚙️ 设置 │
├─────────────────────────────┬─────────────────────────────┤
│ 源代码                       │ 树形视图                     │
│ 1 {                        │ ▼ {                         │
│ 2   "name": "test",       │   ▼ name: "test" (string) │
│ 3   "value": 123          │   ▼ value: 123 (number)    │
│ 4 }                        │   ▼ items: [...] (array)    │
│                             │   }                         │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
```

## 安装运行

### 运行 EXE (推荐)

直接运行便携版可执行文件:
```
json-editor\src-tauri\target\release\json-editor.exe
```

### 安装版本

- MSI 安装包: `json-editor\src-tauri\target\release\bundle\msi\JSON Editor_1.0.0_x64_en-US.msi`
- NSIS 安装包: `json-editor\src-tauri\target\release\bundle\nsis\JSON Editor_1.0.0_x64-setup.exe`

## 开发环境搭建

### 环境要求
- Node.js 18+
- Rust 1.70+
- npm 9+

### 安装依赖
```bash
cd json-editor
npm install
```

### 开发模式
```bash
npm run tauri dev
```

### 构建发布
```bash
npm run tauri build
```

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **桌面**: Tauri 2.x
- **后端**: Rust

## 快捷操作

| 操作 | 说明 |
|------|------|
| 双击节点 | 编辑节点 |
| 右键节点 | 打开操作菜单 |
| 展开全部 | 展开所有嵌套节点 |
| 折叠全部 | 折叠所有嵌套节点 |

## 项目结构

```
json-editor/
├── src/                    # Vue 前端源码
│   ├── App.vue            # 主组件
│   └── main.ts            # 入口文件
├── src-tauri/             # Tauri 后端源码
│   ├── src/
│   │   ├── lib.rs        # 库文件
│   │   └── main.rs       # 入口文件
│   └── Cargo.toml        # Rust 依赖配置
├── package.json           # npm 配置
└── vite.config.ts        # Vite 配置
```

## 许可证

MIT License