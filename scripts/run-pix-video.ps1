# Grava fluxo PIX (PAY-P4) e exporta video para docs/reports/videos/
# Uso: .\scripts\run-pix-video.ps1
# Requisitos: VPN Youse, Chrome instalado, npx playwright install ffmpeg

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host '=== PIX video: instalando ffmpeg (se necessario) ===' -ForegroundColor Cyan
npx playwright install ffmpeg

$env:PW_VIDEO = 'on'
$env:PW_SLOW_MO = '40'

Write-Host '=== PIX video: gravando PAY-P4 (funil ate PIX pendente) ===' -ForegroundColor Cyan
npx playwright test tests/spec/e2e/payment/checkout-pix.spec.ts -g 'PAY-P4' `
  --project=chromium --headed --reporter=list --workers=1

if ($LASTEXITCODE -ne 0) {
  Write-Host "Teste falhou (exit $LASTEXITCODE) — exportando video parcial se existir..." -ForegroundColor Yellow
}

Write-Host '=== PIX video: exportando ===' -ForegroundColor Cyan
npx ts-node scripts/export-pix-video.ts

$latest = Join-Path $PWD 'docs\reports\videos\pix-checkout-emission-latest.webm'
if (Test-Path $latest) {
  Write-Host "`nVideo pronto: $latest" -ForegroundColor Green
  explorer.exe '/select,' + $latest
} else {
  Write-Host '`nVideo nao encontrado. Verifique VPN e reports/pix-p4-record.log' -ForegroundColor Red
  exit 1
}
