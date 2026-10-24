# NextUps Windows Installer Build & Digital Signing Script (v1.0.2)
$ErrorActionPreference = "Stop"

Write-Host "==> Step 0: Packing desktop-app into app.asar..."
npx -y @electron/asar pack desktop-app desktop-dist\NextUps-win32-x64\resources\app.asar
Write-Host "app.asar packed successfully."

Write-Host "`n==> Step 1: Getting Code Signing Certificate..."
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*NextUps Official Publisher*" } | Select-Object -First 1

if (-not $cert) {
    $cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*NextUps*" } | Select-Object -First 1
}

if (-not $cert) {
    throw "Code Signing Certificate not found!"
}
Write-Host "Using Certificate:" $cert.Thumbprint

Write-Host "`n==> Step 2: Digitally signing NextUps.exe..."
$targetExe = "desktop-dist\NextUps-win32-x64\NextUps.exe"
if (Test-Path $targetExe) {
    Set-AuthenticodeSignature -FilePath $targetExe -Certificate $cert -TimestampServer "http://timestamp.digicert.com" -HashAlgorithm SHA256
    $sig = Get-AuthenticodeSignature $targetExe
    Write-Host "NextUps.exe Signature Status:" $sig.Status
} else {
    throw "Target EXE not found at $targetExe"
}

Write-Host "`n==> Step 3: Compiling Inno Setup 7 Installer (v1.0.2)..."
$isccPath = "C:\Program Files\Inno Setup 7\ISCC.exe"
if (-not (Test-Path $isccPath)) {
    throw "ISCC.exe not found at $isccPath"
}

& $isccPath "installer\nextups-setup.iss"

Write-Host "`n==> Step 4: Digitally signing Setup Installer (v1.0.2)..."
$installerPath = "public\downloads\NextUps-Setup-v1.0.2.exe"
if (Test-Path $installerPath) {
    Set-AuthenticodeSignature -FilePath $installerPath -Certificate $cert -TimestampServer "http://timestamp.digicert.com" -HashAlgorithm SHA256
    $sigInstaller = Get-AuthenticodeSignature $installerPath
    Write-Host "Installer Signature Status:" $sigInstaller.Status
    Write-Host "Installer File Size:" (Get-Item $installerPath).Length "bytes"

    # Copy to v1.0.1 and v1.0.0 paths for backwards compatibility with legacy download links
    Copy-Item -Path $installerPath -Destination "public\downloads\NextUps-Setup-v1.0.1.exe" -Force
    Copy-Item -Path $installerPath -Destination "public\downloads\NextUps-Setup-v1.0.0.exe" -Force
    Write-Host "Mirrored to legacy exe endpoints for backwards compatibility."
} else {
    throw "Installer was not created at $installerPath"
}

Write-Host "`n==> Step 5: Creating Standalone ZIP Archive (v1.0.2)..."
$zipTarget = "public\downloads\NextUps-Windows-v1.0.2.zip"
if (Test-Path $zipTarget) {
    Remove-Item -Force $zipTarget
}
Compress-Archive -Path "desktop-dist\NextUps-win32-x64\*" -DestinationPath $zipTarget -CompressionLevel Optimal
Write-Host "ZIP Archive created at $zipTarget (" (Get-Item $zipTarget).Length "bytes)"

# Also mirror to v1.0.1.zip
Copy-Item -Path $zipTarget -Destination "public\downloads\NextUps-Windows-v1.0.1.zip" -Force

Write-Host "`nSUCCESS: Windows Installer & ZIP Package v1.0.2 built and digitally signed with Authenticode!"
