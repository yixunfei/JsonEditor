@echo off
setlocal enabledelayedexpansion

REM JSON编辑器增强版一键发布脚本
REM author: AI Assistant
REM date: 2026-03-03

echo.
echo =================================================
echo    JSON Editor 增强版一键发布脚本
echo =================================================
echo.

REM 获取当前日期
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do Set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

REM 构造日期时间戳
set "datestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%"
set "timestamp=%HH%-%Min%"
set "fullstamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

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

REM 检查当前目录是否有项目文件
if not exist "package.json" (
    echo 错误: package.json 不存在于当前目录
    pause
    exit /b 1
)

REM 提取当前版本号
for /f "tokens=*" %%i in ('type package.json ^| findstr "version"') do set "pkg_version_line=%%i"
for /f "tokens=2 delims=:," %%a in ("!pkg_version_line!") do set /p ="%%a"<nul > temp_version
set /p pkg_version=<temp_version
del temp_version
set pkg_version=!pkg_version:"=!
set pkg_version=!pkg_version: =!
echo 当前项目版本: !pkg_version!

echo.
echo 正在清理之前的构建缓存...
if exist "dist" rd /s /q "dist" 2>nul
if exist "src-tauri\target" rd /s /q "src-tauri\target" 2>nul

echo 正在安装依赖...
call npm install --quiet
if errorlevel 1 (
    echo 依赖安装失败，正在退出...
    pause
    exit /b 1
)

echo 正在执行 TypeScript 类型检查...
npm run build >nul 2>&1
if errorlevel 1 (
    echo TypeScript 类型检查失败，正在退出...
    pause
    exit /b 1
)

echo 正在构建 Tauri 应用...
call npm run tauri build
if errorlevel 1 (
    echo 项目构建失败，正在退出...
    pause
    exit /b 1
)

REM 创建发布目录
set "release_dir=release_%fullstamp%"
if not exist "!release_dir!" mkdir "!release_dir!"

echo.
echo 正在收集构建产物...

REM 复制主可执行文件
if exist "src-tauri\target\release\json-editor.exe" (
    copy "src-tauri\target\release\json-editor.exe" "!release_dir!\json-editor-!pkg_version!-!datestamp!.exe" >nul
    echo 主程序已复制到 !release_dir!
)

REM 复制 MSI 安装包
for %%f in (src-tauri\target\release\bundle\msi\*.msi) do (
    copy "%%f" "!release_dir!\json-editor-!pkg_version!-!datestamp!.msi" >nul
    echo MSI 安装包已复制到 !release_dir!
    goto msi_done
)
:msi_done

REM 复制 NSIS 安装包
for %%f in (src-tauri\target\release\bundle\nsis\*.exe) do (
    copy "%%f" "!release_dir!\json-editor-!pkg_version!-!datestamp!-setup.exe" >nul
    echo NSIS 安装包已复制到 !release_dir!
    goto nsis_done
)
:nsis_done

REM 复制许可证和 README 文件到发布目录(如果存在)
if exist "README.md" copy "README.md" "!release_dir!\" >nul
if exist "LICENSE" copy "LICENSE" "!release_dir!\" >nul
if exist "licences.txt" copy "licences.txt" "!release_dir!\" >nul

echo.
echo =================================================
echo    发布完成！
echo =================================================
echo.
echo    产物已存储在: !release_dir!\
echo.
for %%f in ("!release_dir!\*") do (
    echo    * %%~nxf
)
echo.
echo    构建时间: %datestamp%
echo =================================================

REM 询问是否打开发布目录
set /p openFolder="是否打开发布目录? (y/n): "
if /i "!openFolder!" == "y" (
    explorer "!release_dir!"
)

pause