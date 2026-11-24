# ShieldMesh Hybrid AI — 一鍵部署至 Firebase Hosting（免全域安裝 firebase-tools）
param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== 1. 執行自動化契約與資安測試（uv .venv） ===" -ForegroundColor Cyan
& .\.venv\Scripts\python.exe tests\test_hybrid_app.py
if ($LASTEXITCODE -ne 0) { throw "測試未通過，中止部署" }

Write-Host "`n=== 2. 登入 Firebase（透過 npx 免全域安裝） ===" -ForegroundColor Cyan
npx --yes firebase-tools login

if (-not $ProjectId) {
    Write-Host "`n=== 3. 列出可用 Firebase 專案 ===" -ForegroundColor Cyan
    npx --yes firebase-tools projects:list
    $ProjectId = Read-Host "請輸入要部署的 Firebase Project ID"
}

Write-Host "`n=== 4. 部署至 Firebase Hosting ($ProjectId) ===" -ForegroundColor Cyan
npx --yes firebase-tools deploy --only hosting --project $ProjectId

Write-Host "`n✅ 部署完成！請複製上方 Hosting URL 貼入 Devpost 提交表單。" -ForegroundColor Green
