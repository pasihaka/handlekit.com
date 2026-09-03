# Deploy Script: Publish Sensory Labs to GitHub (pasihaka/sensory-labs)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Publishing Sensory Labs Open-Source Repository to GitHub" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Ensure we are in the sensory-labs directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not found in PATH. Please install Git to proceed."
    exit 1
}

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing new Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

Write-Host "Staging files..." -ForegroundColor Yellow
git add .

Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "feat: Initial release of Sensory Labs clinical psychophysics and Web Audio screening engines"

Write-Host ""
Write-Host "IMPORTANT: Please ensure you have created a public repository on GitHub:" -ForegroundColor Green
Write-Host "👉 https://github.com/new" -ForegroundColor White
Write-Host "Repository name: sensory-labs (or handlekit-sensory-labs)" -ForegroundColor White
Write-Host "Description: Client-side clinical Pelli-Robson contrast sensitivity, high-frequency presbycusis hearing test, and tinnitus notched sound therapy engines." -ForegroundColor White
Write-Host "Website: https://handlekit.com" -ForegroundColor White
Write-Host ""

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Configuring remote origin: https://github.com/pasihaka/sensory-labs.git" -ForegroundColor Yellow
    git remote add origin https://github.com/pasihaka/sensory-labs.git
} else {
    Write-Host "Current origin remote: $remote" -ForegroundColor Yellow
}

Write-Host "Pushing to GitHub main branch..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "✅ Done! If your repo has GitHub Pages enabled, index.html will be live immediately!" -ForegroundColor Cyan
