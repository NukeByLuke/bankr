# Bankr Submission Preparation Script
# This script helps create the ZIP file for course submission

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Bankr Submission Preparation      " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get student name
$studentName = Read-Host "Enter your name (for file naming)"
$studentName = $studentName -replace '\s+', '_'

# Create output directory
$outputDir = "$env:USERPROFILE\Desktop\bankr_submission"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "Creating submission package..." -ForegroundColor Yellow
Write-Host ""

# Create temp directory
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

# Files and folders to exclude
$excludePatterns = @(
    'node_modules',
    '.git',
    '.env',
    'dist',
    'build',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '.vscode',
    '*.zip'
)

# Copy project files
Write-Host "Copying project files..." -ForegroundColor Yellow

$sourceDir = Get-Location
Get-ChildItem -Path $sourceDir -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($item.FullName -like "*\$pattern\*" -or $item.Name -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
} | ForEach-Object {
    $targetPath = $_.FullName.Replace($sourceDir, $outputDir)
    $targetDir = Split-Path $targetPath -Parent
    
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    if ($_.PSIsContainer -eq $false) {
        Copy-Item $_.FullName -Destination $targetPath -Force
    }
}

Write-Host "✓ Project files copied" -ForegroundColor Green

# Create screenshots directory if it doesn't exist
$screenshotsDir = Join-Path $outputDir "screenshots"
if (-not (Test-Path $screenshotsDir)) {
    New-Item -ItemType Directory -Path $screenshotsDir | Out-Null
    
    # Create placeholder file
    $placeholderPath = Join-Path $screenshotsDir "README.txt"
    @"
Screenshots Directory
====================

Please add your application screenshots here before creating the final ZIP.

Recommended screenshots:
1. login_page.png - Login screen
2. dashboard.png - Main dashboard view
3. transactions.png - Transaction list
4. budgets.png - Budget management
5. goals.png - Goals tracking
6. subscriptions.png - Subscription management

Take screenshots using Windows Snipping Tool (Win + Shift + S)
"@ | Out-File -FilePath $placeholderPath -Encoding UTF8
    
    Write-Host "✓ Screenshots directory created (add your screenshots here)" -ForegroundColor Yellow
}

# Check for PDF report
$pdfReportSource = Join-Path $sourceDir "PROJECT_REPORT.pdf"
$pdfReportDest = Join-Path $outputDir "PROJECT_REPORT.pdf"

if (Test-Path $pdfReportSource) {
    Copy-Item $pdfReportSource -Destination $pdfReportDest
    Write-Host "✓ PDF report included" -ForegroundColor Green
} else {
    Write-Host "⚠ PDF report not found - please convert PROJECT_REPORT.md to PDF" -ForegroundColor Yellow
    Write-Host "  Use: https://www.markdowntopdf.com/ or VS Code Markdown PDF extension" -ForegroundColor Gray
}

# Create README for submission
$submissionReadme = @"
# Bankr - Final Course Project Submission

**Student:** $studentName
**Date:** $(Get-Date -Format "MMMM dd, yyyy")

## Contents

This submission package contains:

1. **Source Code**
   - frontend/ - React frontend application
   - backend/ - Node.js backend API
   - docker-compose.yml - Container orchestration

2. **Documentation**
   - README.md - Project overview and setup instructions
   - PROJECT_REPORT.pdf - Detailed project report
   - LICENSE - MIT License

3. **Screenshots** (in screenshots/ folder)
   - Application interface screenshots

## Running the Application

### Prerequisites
- Docker and Docker Compose installed
- Ports 3002, 5174, and 5433 available

### Quick Start

1. Extract the ZIP file
2. Open terminal in the project directory
3. Run the following commands:

``````bash
# Copy environment template
cp .env.example .env

# Start all services
docker-compose up --build
``````

4. Access the application:
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3002

### Test Accounts

| Email | Password |
|-------|----------|
| free@bankr.local | password123 |
| premium@bankr.local | password123 |
| admin@bankr.local | password123 |

## Project Structure

See README.md for detailed project structure and API documentation.

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Fastify, Prisma ORM
- **Database:** PostgreSQL 15
- **Containerization:** Docker & Docker Compose

## Notes

- node_modules folders are excluded (install with npm install)
- .env file is excluded (use .env.example as template)
- All secrets in .env.example are for development only

For detailed information, please refer to PROJECT_REPORT.pdf
"@

$submissionReadmePath = Join-Path $outputDir "SUBMISSION_README.txt"
$submissionReadme | Out-File -FilePath $submissionReadmePath -Encoding UTF8
Write-Host "✓ Submission README created" -ForegroundColor Green

# Create the ZIP file
Write-Host ""
Write-Host "Creating ZIP file..." -ForegroundColor Yellow

$zipFileName = "bankr_${studentName}_final_project.zip"
$zipPath = Join-Path "$env:USERPROFILE\Desktop" $zipFileName

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$outputDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host "✓ ZIP file created: $zipFileName" -ForegroundColor Green

# Calculate ZIP size
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "  File size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Gray

# Generate submission checklist
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "         Submission Checklist         " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$checklist = @(
    @{ Item = "Convert PROJECT_REPORT.md to PDF"; Status = (Test-Path $pdfReportSource) },
    @{ Item = "Add screenshots to screenshots/ folder"; Status = ((Get-ChildItem $screenshotsDir -Filter "*.png").Count -gt 0) },
    @{ Item = "Review PDF report for completeness"; Status = $false },
    @{ Item = "Test ZIP extraction and project run"; Status = $false },
    @{ Item = "Verify all code is included"; Status = $true },
    @{ Item = "Check that node_modules are excluded"; Status = $true },
    @{ Item = "Ensure .env is not included"; Status = $true }
)

foreach ($item in $checklist) {
    if ($item.Status) {
        Write-Host "[✓]" -ForegroundColor Green -NoNewline
    } else {
        Write-Host "[  ]" -ForegroundColor Red -NoNewline
    }
    Write-Host " $($item.Item)"
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Submission package created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add screenshots to: $screenshotsDir" -ForegroundColor Gray
Write-Host "2. Convert PROJECT_REPORT.md to PDF if not done" -ForegroundColor Gray
Write-Host "3. Re-run this script to update the ZIP with screenshots" -ForegroundColor Gray
Write-Host "4. Submit the ZIP file from your Desktop: $zipFileName" -ForegroundColor Gray
Write-Host ""

# Open output directory
$openFolder = Read-Host "Open output folder? (y/n)"
if ($openFolder -eq 'y') {
    Start-Process $outputDir
}

# Clean up temp directory
Write-Host ""
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item $outputDir -Recurse -Force
Write-Host "✓ Done!" -ForegroundColor Green

Write-Host ""
Write-Host "ZIP file location: $zipPath" -ForegroundColor Cyan
Write-Host ""
