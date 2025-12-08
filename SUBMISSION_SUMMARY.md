# Bankr Final Project - Submission Summary

## What I Created For You

### 1. PROJECT_REPORT.md
A comprehensive project report including:
- Title page with course info
- Table of contents
- Complete system design and architecture explanation
- Implementation details with code examples
- Database schema documentation
- Security implementation details
- Screenshots section (you'll need to add actual images)
- Results and discussion
- Future enhancements
- Properly cited references

**This is ready to be converted to PDF for submission.**

### 2. SUBMISSION_GUIDE.md
Step-by-step instructions for:
- Converting the markdown report to PDF
- Taking and adding screenshots
- Creating the ZIP file properly
- What to include/exclude from the ZIP
- Final submission checklist
- Verification steps

### 3. prepare_submission.ps1
An automated PowerShell script that:
- Copies all necessary files
- Excludes node_modules, .git, .env, etc.
- Creates a screenshots folder with instructions
- Generates a ZIP file ready for submission
- Provides a checklist of remaining tasks
- Names files appropriately for submission

## How to Use These Files

### Step 1: Convert Report to PDF

**Option A: Using VS Code (Recommended)**
1. Install "Markdown PDF" extension in VS Code
2. Open `PROJECT_REPORT.md`
3. Press Ctrl+Shift+P
4. Type "Markdown PDF: Export (pdf)"
5. Save as `PROJECT_REPORT.pdf`

**Option B: Online Converter**
1. Go to https://www.markdowntopdf.com/
2. Upload `PROJECT_REPORT.md`
3. Download the PDF
4. Save as `PROJECT_REPORT.pdf` in the project root

### Step 2: Add Screenshots

1. Start your application:
   ```powershell
   docker-compose up
   ```

2. Open http://localhost:5174

3. Login with: `free@bankr.local` / `password123`

4. Take screenshots of:
   - Login page
   - Dashboard
   - Transaction list
   - Budget view
   - Goals page
   - Any other features you want to showcase

5. Use Windows Snipping Tool (Win + Shift + S)

6. Save screenshots in a `screenshots/` folder

7. Insert them into your PDF report at the marked screenshot sections

### Step 3: Create ZIP File

**Option A: Use the automated script (Easiest)**
```powershell
cd c:\Users\Lukas\Desktop\ToDoList\bankr
.\prepare_submission.ps1
```

Follow the prompts and it will create:
- `bankr_yourname_final_project.zip` on your Desktop

**Option B: Manual ZIP creation**
1. Follow instructions in `SUBMISSION_GUIDE.md`
2. Exclude: node_modules, .git, .env, dist, build
3. Include: all source code, README.md, docker-compose.yml, .env.example

### Step 4: Verify Everything

Before submitting, check:

- [ ] PDF report is complete with all sections
- [ ] Screenshots are in the PDF
- [ ] Code examples are properly formatted in PDF
- [ ] ZIP file contains all source code
- [ ] ZIP file does NOT contain node_modules
- [ ] README.md has setup instructions
- [ ] Test that project runs from extracted ZIP

Test the ZIP:
1. Extract it to a test folder
2. Run: `cp .env.example .env && docker-compose up --build`
3. Make sure it works!

## What Your Submission Should Include

### PDF Report (Required)
- File: `bankr_final_report_lukas.pdf`
- All sections from PROJECT_REPORT.md
- Screenshots inserted
- Properly formatted with headings and tables

### ZIP File (Required)
- File: `bankr_source_code_lukas.zip`
- All source code (frontend/ and backend/)
- Configuration files (docker-compose.yml, .env.example)
- Documentation (README.md, LICENSE)
- Project structure intact
- NO node_modules, NO .env, NO .git

## Quick Commands Reference

```powershell
# Convert report to PDF (if using VS Code extension)
# Just open PROJECT_REPORT.md and use Ctrl+Shift+P > Markdown PDF: Export

# Run the app to take screenshots
docker-compose up

# Create submission ZIP automatically
.\prepare_submission.ps1

# Test the ZIP (after extracting to a test folder)
cp .env.example .env
docker-compose up --build
```

## File Sizes (Approximate)

- PDF Report: 1-2 MB (with screenshots)
- ZIP File: 5-10 MB (without node_modules)
- Total Submission: ~15 MB or less

## Important Notes

1. **DO NOT include node_modules** - They're huge and can be reinstalled with `npm install`
2. **DO NOT include .env** - It contains development secrets
3. **DO include .env.example** - Shows what environment variables are needed
4. **DO include screenshots** - Makes your report much better
5. **DO test your ZIP** - Extract and run it before submitting

## Questions?

- Check `SUBMISSION_GUIDE.md` for detailed instructions
- Read `PROJECT_REPORT.md` for technical content
- Review your course rubric for specific requirements

## Timeline Suggestion

1. **Day 1:** Convert report to PDF, take screenshots (1-2 hours)
2. **Day 2:** Insert screenshots into PDF, review report (1 hour)
3. **Day 3:** Run prepare_submission.ps1, test ZIP, submit (30 min)

## Contact

If you need to update anything in the report or have questions about the submission process, let me know!

Good luck with your submission! 🎓
