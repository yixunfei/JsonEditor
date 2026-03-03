@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   JSON Editor 一键打包发布脚本
echo ========================================
echo.

set "PROJECT_DIR=%~dp0json-editor"
set "RELEASE_DIR=%PROJECT_DIR%\src-tauri\target\release"
set "BUNDLE_DIR=%RELEASE_DIR%\bundle"

echo [1/3] 检查环境...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 npm，请先安装 Node.js
    pause
    exit /b 1
)

where cargo >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Rust，请先安装 Rust
    pause
    exit /b 1
)

echo [2/3] 开始构建...
cd /d "%PROJECT_DIR%"
call npm run tauri build

if %errorlevel% neq 0 (
    echo 构建失败!
    pause
    exit /b 1
)

echo.
echo [3/3] 构建完成!
echo.
echo ========================================
echo   输出文件:
echo ========================================
echo.
echo 便携版 EXE:
echo   %RELEASE_DIR%\json-editor.exe
echo.
echo MSI 安装包:
if exist "%BUNDLE_DIR%\msi\JSON Editor_1.0.0_x64_en-US.msi" (
    echo   %BUNDLE_DIR%\msi\JSON Editor_1.0.0_x64_en-US.msi
) else (
    echo   (未生成)
)
echo.
echo NSIS 安装包:
if exist "%BUNDLE_DIR%\nsis\JSON Editor_1.0.0_x64-setup.exe" (
    echo   %BUNDLE_DIR%\nsis\JSON Editor_1.0.0_x64-setup.exe
) else (
    echo   (未生成)
)
echo.

:: 复制到发布目录
set "DIST_DIR=%PROJECT_DIR%\dist-release"
if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"

echo 复制文件到发布目录...
copy /Y "%RELEASE_DIR%\json-editor.exe" "%DIST_DIR%\" >nul

if exist "%BUNDLE_DIR%\msi\JSON Editor_1.0.0_x64_en-US.msi" (
    copy /Y "%BUNDLE_DIR%\msi\JSON Editor_1.0.0_x64_en-US.msi" "%DIST_DIR%\" >nul
)

if exist "%BUNDLE_DIR%\nsis\JSON Editor_1.0.0_x64-setup.exe" (
    copy /Y "%BUNDLE_DIR%\nsis\JSON Editor_1.0.0_x64-setup.exe" "%DIST_DIR%\" >nul
)

echo.
echo 发布目录: %DIST_DIR%
echo.
echo ========================================
echo   打包完成!
echo ========================================
echo.

:: 打开发布目录
explorer.exe "%DIST_DIR%"

pause
