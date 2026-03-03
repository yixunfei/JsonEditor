# JSON编辑器一键发布脚本 (PowerShell版本)
# author: AI Assistant
# date: 2026-03-03

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "    JSON Editor 一键发布脚本 (PowerShell)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否已安装
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0 -or !$nodeVersion) {
        Write-Host "错误: 未找到 Node.js，正在退出..." -ForegroundColor Red
        Pause
        exit 1
    }
    Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到 Node.js，正在退出..." -ForegroundColor Red
    Pause
    exit 1
}

# 检查 Rust 是否已安装
try {
    $rustVersion = rustc --version 2>$null
    if ($LASTEXITCODE -ne 0 -or !$rustVersion) {
        Write-Host "错误: 未找到 Rust，正在退出..." -ForegroundColor Red
        Pause
        exit 1
    }
    Write-Host "Rust 版本: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到 Rust，正在退出..." -ForegroundColor Red
    Pause
    exit 1
}

# 检查 Tauri CLI 是否已安装
try {
    $tauriVersion = cargo tauri --version 2>$null
    if ($LASTEXITCODE -ne 0 -or !$tauriVersion) {
        Write-Host "错误: 未找到 Tauri CLI，正在退出..." -ForegroundColor Red
        Pause
        exit 1
    }
    Write-Host "Tauri CLI 版本: $tauriVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: 未找到 Tauri CLI，正在退出..." -ForegroundColor Red
    Pause
    exit 1
}

Write-Host "`n正在检查项目文件..." -ForegroundColor Yellow

# 检查 package.json 是否存在
if (!(Test-Path "package.json")) {
    Write-Host "错误: package.json 不存在于当前目录" -ForegroundColor Red
    Pause
    exit 1
}

Write-Host "正在执行依赖安装..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "依赖安装失败，正在退出..." -ForegroundColor Red
    Pause
    exit 1
}

Write-Host "正在构建项目..." -ForegroundColor Yellow
npm run tauri build
if ($LASTEXITCODE -ne 0) {
    Write-Host "项目构建失败，正在退出..." -ForegroundColor Red
    Pause
    exit 1
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "    构建完成！" -ForegroundColor Green
Write-Host ""
Write-Host "    生成的可执行文件位于：" -ForegroundColor Green
Write-Host "    src-tauri\target\release\json-editor.exe" -ForegroundColor White
Write-Host ""
Write-Host "    生成的安装包位于：" -ForegroundColor Green
Write-Host "    src-tauri\target\release\bundle\msi\JSON Editor_*.msi" -ForegroundColor White
Write-Host "    src-tauri\target\release\bundle\nsis\JSON Editor_*-setup.exe" -ForegroundColor White
Write-Host "===========================================" -ForegroundColor Green

Pause