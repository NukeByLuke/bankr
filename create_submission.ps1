# creates submission zip on desktop
$desktop = [Environment]::GetFolderPath("Desktop")
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "bankr_submission_$timestamp.zip"
$zipPath = Join-Path $desktop $zipName

# temp folder
$tempDir = Join-Path $env:TEMP "bankr_temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# copy everything except junk
Get-ChildItem -Path . -Recurse | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|\.env$|postgres_data' -and
    $_.Name -notmatch '^\.env$'
} | ForEach-Object {
    $destination = $_.FullName.Replace($PWD.Path, $tempDir)
    if ($_.PSIsContainer) {
        if (!(Test-Path $destination)) {
            New-Item -ItemType Directory -Path $destination -Force | Out-Null
        }
    } else {
        Copy-Item $_.FullName -Destination $destination -Force
    }
}

# zip it
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "`nZIP created: $zipPath" -ForegroundColor Green
Write-Host "Size: $([math]::Round((Get-Item $zipPath).Length/1MB, 2)) MB" -ForegroundColor Cyan

# show what's inside
Write-Host "`nContents:" -ForegroundColor Yellow
$zipContents = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$zipContents.Entries | Select-Object -First 20 | ForEach-Object { Write-Host "  $_" }
if ($zipContents.Entries.Count -gt 20) {
    Write-Host "  ... and $($zipContents.Entries.Count - 20) more files"
}
$zipContents.Dispose()

Write-Host "`nReady to submit!" -ForegroundColor Green
