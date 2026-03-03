@echo off
setlocal enabledelayedexpansion

REM JSON编辑器一键发布脚本
REM author: AI Assistant
REM date: 2026-03-03

echo.
echo ===========================================
echo    JSON Editor 一键发布脚本
echo ===========================================
echo.

REM 检查是否有安装 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Node.js，正在退出...
    pause
    exit /b 1
)

REM 检查是否有安装 Rust
rustc --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Rust，正在退出...
    pause
    exit /b 1
)

REM 检查是否有安装 Tauri CLI
cargo tauri --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Tauri CLI，正在退出...
    pause
    exit /b 1
)

echo 正在进入项目目录...

REM 确保在正确的目录
if not exist "package.json" (
    echo 错误: package.json 不存在于当前目录
    pause
    exit /b 1
)

echo 正在执行依赖安装...
npm install
if errorlevel 1 (
    echo 依赖安装失败，正在退出...
    pause
    exit /b 1
)

echo 正在构建项目...
npm run tauri build
if errorlevel 1 (
    echo 项目构建失败，正在退出...
    pause
    exit /b 1
)

echo.
echo ===========================================
echo    构建完成！
echo.
echo    生成的可执行文件位于：
echo    src-tauri\target\release\json-editor.exe
echo.
echo    生成的安装包位于：
echo    src-tauri\target\release\bundle\msi\JSON Editor_*.msi
echo    src-tauri\target\release\bundle\nsis\JSON Editor_*-setup.exe
echo ===========================================
echo.

pause