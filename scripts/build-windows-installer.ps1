# NextUps Windows Installer Build & Digital Signing Script
$ErrorActionPreference = "Stop"

Write-Host "==> Step 1: Getting or generating Code Signing Certificate..."
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*NextUps*" } | Select-Object -First 1

if (-not $cert) {
    $cert = New-SelfSignedCertificate -Subject "CN=NextUps Official Publisher, O=Team Light, C=KR" -Type CodeSigningCert -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(5)
    Write-Host "Created new Code Signing Certificate:" $cert.Thumbprint
} else {
    Write-Host "Using existing Code Signing Certificate:" $cert.Thumbprint
}

Write-Host "`n==> Step 2: Digitally signing NextUps.exe..."
$targetExe = "desktop-windows\publish\NextUps.exe"
if (Test-Path $targetExe) {
    Set-AuthenticodeSignature -FilePath $targetExe -Certificate $cert -HashAlgorithm SHA256
    $sig = Get-AuthenticodeSignature $targetExe
    Write-Host "NextUps.exe Signature Status:" $sig.Status
} else {
    throw "Target EXE not found at $targetExe"
}

Write-Host "`n==> Step 3: Compiling Inno Setup 7 Installer..."
$isccPath = "C:\Program Files\Inno Setup 7\ISCC.exe"
if (-not (Test-Path $isccPath)) {
    throw "ISCC.exe not found at $isccPath"
}

& $isccPath "installer\nextups-setup.iss"

Write-Host "`n==> Step 4: Digitally signing Setup Installer..."
$installerPath = "public\downloads\NextUps-Setup-v1.0.0.exe"
if (Test-Path $installerPath) {
    Set-AuthenticodeSignature -FilePath $installerPath -Certificate $cert -HashAlgorithm SHA256
    $sigInstaller = Get-AuthenticodeSignature $installerPath
    Write-Host "Installer Signature Status:" $sigInstaller.Status
    Write-Host "Installer File Size:" (Get-Item $installerPath).Length "bytes"
    Write-Host "`nSUCCESS: Windows Installer NextUps-Setup-v1.0.0.exe built and digitally signed!"
} else {
    throw "Installer was not created at $installerPath"
}
