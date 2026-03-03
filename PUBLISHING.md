# 发布脚本使用说明

## 脚本概述

本项目包含三个一键发布脚本，用于自动化构建和打包JSON编辑器：

1. `build-release.bat` - 基础构建脚本
2. `build-release.ps1` - PowerShell版本的构建脚本
3. `publish-release.bat` - 增强版发布脚本，包含输出整理和版本标记

## 环境要求

运行这些脚本前，请确保已满足以下前提条件：

- Windows操作系统 (7 或更高版本)
- Node.js 16+
- Rust 工具链
- Tauri CLI

## 脚本说明

### build-release.bat

基础的一键构建脚本，执行以下步骤：
1. 检查系统依赖项 (Node.js, Rust, Tauri CLI)
2. 安装项目依赖 (`npm install`)
3. 执行 Tauri 构建 (`npm run tauri build`)

### build-release.ps1

PowerShell版本的构建脚本，功能与bat版本相同，但采用PowerShell语法编写。

### publish-release.bat (推荐)

增强版发布脚本，包含额外功能：
- 自动检测并清理旧构建产物
- 自动提取项目版本号
- 使用包含时间戳和版本信息的命名规则
- 自动收集所有构建产物到单独的发布目录
- 自动复制相关文档文件

## 使用方法

### Windows命令提示符 (CMD)

双击运行 `.bat` 文件，或者使用命令提示符运行：

```cmd
.\build-release.bat
```

或

```cmd
.\publish-release.bat
```

### PowerShell

右键单击 `.ps1` 文件选择“使用PowerShell运行”，或在PowerShell中执行：

```powershell
.\build-release.ps1
```

**注意:** 如果遇到执行策略错误，请先在PowerShell中运行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 构建产物

构建完成后，以下产品文件将会生成：

- 主程序: `src-tauri\target\release\json-editor.exe`
- MSI安装包: `src-tauri\target\release\bundle\msi\*.msi`
- NSIS安装包: `src-tauri\target\release\bundle\nsis\*.exe`

使用 `publish-release.bat` 脚本时，所有构建产物会被收集到一个以时间戳命名的单独目录中。

## 故障排除

如果构建失败，请检查：

1. 所有先决条件是否已正确安装
2. 项目文件是否完整
3. 是否有足够的磁盘空间

构建失败时请查看错误信息进行相应的修复。