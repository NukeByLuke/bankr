# Bankr - Submission Instructions

## How to Prepare Your Submission

### Step 1: Convert Report to PDF

1. Open `PROJECT_REPORT.md` in Visual Studio Code
2. Install the "Markdown PDF" extension if you haven't already
3. Right-click in the editor and select "Markdown PDF: Export (pdf)"
4. Or use an online converter: https://www.markdowntopdf.com/

**Alternative method:**
- Copy the content of `PROJECT_REPORT.md`
- Paste into Google Docs or Microsoft Word
- Format with proper styles (headings, tables, code blocks)
- Export as PDF

### Step 2: Add Screenshots

**To make your report complete, add screenshots of:**

1. Login page
2. Dashboard with sample data
3. Transaction list
4. Budget view
5. Goals page
6. Any other key features

**How to take screenshots:**
1. Run the application: `docker-compose up`
2. Open http://localhost:5174
3. Login with test account: `free@bankr.local` / `password123`
4. Use Windows Snipping Tool (Win + Shift + S) to capture screenshots
5. Save them to a `screenshots/` folder
6. Insert them into your PDF report at the appropriate sections

### Step 3: Create ZIP File

**What to include in the ZIP:**

1. All source code (frontend/, backend/)
2. Configuration files (docker-compose.yml, .env.example)
3. Documentation (README.md)
4. License file
5. Project report (PDF version)
6. Screenshots folder (optional but recommended)

**What NOT to include:**
- `node_modules/` folders (too large)
- `.env` file (contains secrets)
- `.git/` folder (version control data)
- Docker volumes data
- Any build artifacts in `dist/` or `build/` folders

### Step 4: ZIP the Project

**Option 1: Using Windows Explorer**
1. Navigate to the `bankr` folder in File Explorer
2. Select all files EXCEPT: `node_modules/`, `.env`, `.git/`
3. Right-click > Send to > Compressed (zipped) folder
4. Name it: `bankr_lukas_final_project.zip`

**Option 2: Using PowerShell (from project root)**
```powershell
# Create a clean copy without excluded folders
$exclude = @('node_modules', '.git', 'dist', 'build', '.env')
$source = Get-Location
$destination = "$env:USERPROFILE\Desktop\bankr_submission"

# Copy files
Copy-Item -Path $source -Destination $destination -Recurse -Exclude $exclude

# Create ZIP
Compress-Archive -Path $destination -DestinationPath "$env:USERPROFILE\Desktop\bankr_lukas_final_project.zip"

# Clean up temp folder
Remove-Item -Path $destination -Recurse -Force
```

### Step 5: Verify Your ZIP File

**Check that the ZIP contains:**
```
bankr_lukas_final_project.zip
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── ... (all other files except node_modules)
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ... (all other files except node_modules)
├── screenshots/ (if included)
├── docker-compose.yml
├── .env.example
├── README.md
├── LICENSE
└── PROJECT_REPORT.pdf
```

**Verify the instructor can run your project:**
1. Extract your ZIP to a test folder
2. Follow the README instructions:
   ```bash
   cd bankr
   cp .env.example .env
   docker-compose up --build
   ```
3. Make sure it works!

### Step 6: Final Checklist

Before submitting, verify:

- [ ] PDF report is complete with all sections
- [ ] Screenshots are included in the PDF
- [ ] All figures and tables are properly numbered and captioned
- [ ] Code examples in the report are formatted correctly
- [ ] References are properly cited
- [ ] ZIP file contains all necessary source code
- [ ] ZIP file does NOT contain node_modules or .env
- [ ] README.md has clear setup instructions
- [ ] Project can be run successfully from the ZIP files
- [ ] File naming follows submission guidelines (if specified)
- [ ] Both PDF and ZIP are ready to upload

### Submission File Names

- PDF Report: `bankr_final_report_lukas.pdf`
- ZIP File: `bankr_source_code_lukas.zip`

---

## Quick Test Run Script

Save this as `test_submission.ps1` and run it to verify your submission:

```powershell
Write-Host "Testing Bankr Submission..." -ForegroundColor Cyan

# Check if PDF exists
if (Test-Path "PROJECT_REPORT.pdf") {
    Write-Host "✓ PDF report found" -ForegroundColor Green
} else {
    Write-Host "✗ PDF report NOT found" -ForegroundColor Red
}

# Check for required files
$required = @(
    "README.md",
    "LICENSE",
    "docker-compose.yml",
    ".env.example",
    "frontend/package.json",
    "backend/package.json"
)

foreach ($file in $required) {
    if (Test-Path $file) {
        Write-Host "✓ $file found" -ForegroundColor Green
    } else {
        Write-Host "✗ $file NOT found" -ForegroundColor Red
    }
}

# Check for files that should NOT be included
$excluded = @(
    ".env",
    "frontend/node_modules",
    "backend/node_modules"
)

foreach ($file in $excluded) {
    if (Test-Path $file) {
        Write-Host "⚠ Warning: $file should be excluded from ZIP" -ForegroundColor Yellow
    } else {
        Write-Host "✓ $file properly excluded" -ForegroundColor Green
    }
}

Write-Host "`nSubmission check complete!" -ForegroundColor Cyan
```

---

## Need Help?

If you have questions about the submission:
1. Review the rubric provided by your instructor
2. Check the README.md for technical setup questions
3. Refer to PROJECT_REPORT.md for detailed explanations

Good luck with your submission!
