# NextUps Windows Installer Build & Digital Signing Script (Non-WebView2, Standalone Chromium)
$ErrorActionPreference = "Stop"

Write-Host "==> Step 1: Getting Code Signing Certificate..."
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*NextUps*" } | Select-Object -First 1

if (-not $cert) {
    $cert = New-SelfSignedCertificate -Subject "CN=NextUps Official Publisher, O=Team Light, C=KR" -Type CodeSigningCert -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(5)
    Write-Host "Created new Code Signing Certificate:" $cert.Thumbprint
} else {
    Write-Host "Using existing Code Signing Certificate:" $cert.Thumbprint
}

Write-Host "`n==> Step 2: Digitally signing NextUps.exe..."
$targetExe = "desktop-dist\NextUps-win32-x64\NextUps.exe"
if (Test-Path $targetExe) {
    Set-AuthenticodeSignature -FilePath $targetExe -Certificate $cert -HashAlgorithm SHA256
    $sig = Get-AuthenticodeSignature $targetExe
    Write-Host "NextUps.exe Signature Status:" $sig.Status
} else {
    throw "Target EXE not found at $targetExe"
}

Write-Host "`n==> Step 3: Compiling Inno Setup 7 Installer (v1.0.1)..."
$isccPath = "C:\Program Files\Inno Setup 7\ISCC.exe"
if (-not (Test-Path $isccPath)) {
    throw "ISCC.exe not found at $isccPath"
}

& $isccPath "installer\nextups-setup.iss"

Write-Host "`n==> Step 4: Digitally signing Setup Installer (v1.0.1)..."
$installerPath = "public\downloads\NextUps-Setup-v1.0.1.exe"
if (Test-Path $installerPath) {
    Set-AuthenticodeSignature -FilePath $installerPath -Certificate $cert -HashAlgorithm SHA256
    $sigInstaller = Get-AuthenticodeSignature $installerPath
    Write-Host "Installer Signature Status:" $sigInstaller.Status
    Write-Host "Installer File Size:" (Get-Item $installerPath).Length "bytes"
} else {
    throw "Installer was not created at $installerPath"
}

Write-Host "`n==> Step 5: Creating Standalone ZIP Archive (v1.0.1)..."
$zipTarget = "public\downloads\NextUps-Windows-v1.0.1.zip"
if (Test-Path $zipTarget) {
    Remove-Item -Force $zipTarget
}
Compress-Archive -Path "desktop-dist\NextUps-win32-x64\*" -DestinationPath $zipTarget -CompressionLevel Optimal
Write-Host "ZIP Archive created at $zipTarget (" (Get-Item $zipTarget).Length "bytes)"

Write-Host "`nSUCCESS: Windows Installer & ZIP Package built and signed with Authenticode!"
