# NextUps Windows Automated Build & Digital Signing Pipeline
param(
    [string]$Version = ""
)

$ErrorActionPreference = "Stop"

# 1. Resolve Target Version from version.json if not provided
$rootPath = Resolve-Path "$PSScriptRoot\.."
$versionJsonPath = Join-Path $rootPath "version.json"

if (-not $Version) {
    if (Test-Path $versionJsonPath) {
        $vConfig = Get-Content $versionJsonPath -Raw | ConvertFrom-Json
        $Version = $vConfig.windows.version
    } else {
        $Version = "1.0.3"
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " NextUps Windows Build & Authenticode Signing Pipeline" -ForegroundColor Cyan
Write-Host " Target Version: v$Version" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 2. Pack desktop-app into app.asar
Write-Host "`n[1/5] Packing desktop-app into app.asar..." -ForegroundColor Yellow
npx -y @electron/asar pack "$rootPath\desktop-app" "$rootPath\desktop-dist\NextUps-win32-x64\resources\app.asar"
Write-Host " -> app.asar successfully packed." -ForegroundColor Green

# 3. Retrieve or Create Code Signing Certificate
Write-Host "`n[2/5] Locating Code Signing Certificate..." -ForegroundColor Yellow
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*NextUps Official Publisher*" } | Select-Object -First 1

if (-not $cert) {
    $cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -like "*NextUps*" } | Select-Object -First 1
}

if (-not $cert) {
    Write-Host "Generating self-signed publisher certificate..." -ForegroundColor DarkYellow
    $cert = New-SelfSignedCertificate -Subject "CN=NextUps Official Publisher, O=Team Light, C=KR" -Type CodeSigningCert -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(5)
}

Write-Host " -> Code Signing Certificate:" $cert.Subject -ForegroundColor Green
Write-Host " -> Certificate Thumbprint:" $cert.Thumbprint -ForegroundColor Gray

# 4. Sign NextUps.exe executable with Authenticode & Timestamp
Write-Host "`n[3/5] Digitally signing executable binary (NextUps.exe)..." -ForegroundColor Yellow
$targetExe = "$rootPath\desktop-dist\NextUps-win32-x64\NextUps.exe"
if (Test-Path $targetExe) {
    Set-AuthenticodeSignature -FilePath $targetExe -Certificate $cert -TimestampServer "http://timestamp.digicert.com" -HashAlgorithm SHA256
    $sigExe = Get-AuthenticodeSignature $targetExe
    Write-Host " -> NextUps.exe Signature: $($sigExe.SignerCertificate.Subject) (Status: $($sigExe.Status))" -ForegroundColor Green
} else {
    throw "Target EXE not found at $targetExe"
}

# 5. Compile Inno Setup 7 Installer
Write-Host "`n[4/5] Compiling Inno Setup 7 Installer (v$Version)..." -ForegroundColor Yellow
$isccPath = "C:\Program Files\Inno Setup 7\ISCC.exe"
if (-not (Test-Path $isccPath)) {
    throw "Inno Setup compiler not found at $isccPath"
}

& $isccPath "/DMyAppVersion=$Version" "$rootPath\installer\nextups-setup.iss"

# 6. Sign Setup Installer executable with Authenticode & Timestamp
Write-Host "`n[5/5] Digitally signing installer (NextUps-Setup-v$Version.exe)..." -ForegroundColor Yellow
$installerPath = "$rootPath\public\downloads\NextUps-Setup-v$Version.exe"
if (Test-Path $installerPath) {
    Set-AuthenticodeSignature -FilePath $installerPath -Certificate $cert -TimestampServer "http://timestamp.digicert.com" -HashAlgorithm SHA256
    $sigInst = Get-AuthenticodeSignature $installerPath
    Write-Host " -> Setup Signature: $($sigInst.SignerCertificate.Subject) (Status: $($sigInst.Status))" -ForegroundColor Green
    Write-Host " -> File Size:" (Get-Item $installerPath).Length "bytes" -ForegroundColor Gray

    # Mirror to backward-compatible legacy filenames
    $legacyVersions = @("1.0.2", "1.0.1", "1.0.0")
    foreach ($leg in $legacyVersions) {
        $legPath = "$rootPath\public\downloads\NextUps-Setup-v$leg.exe"
        Copy-Item -Path $installerPath -Destination $legPath -Force
    }
    Write-Host " -> Mirrored to backward-compatible endpoints (v1.0.2, v1.0.1, v1.0.0)" -ForegroundColor Green
} else {
    throw "Installer was not generated at $installerPath"
}

# 7. Create Portable Standalone ZIP package
$zipTarget = "$rootPath\public\downloads\NextUps-Windows-v$Version.zip"
if (Test-Path $zipTarget) {
    Remove-Item -Force $zipTarget
}
Compress-Archive -Path "$rootPath\desktop-dist\NextUps-win32-x64\*" -DestinationPath $zipTarget -CompressionLevel Optimal
Write-Host "`n -> Standalone ZIP archive created: $zipTarget (" (Get-Item $zipTarget).Length "bytes)" -ForegroundColor Green

# Mirror ZIP
Copy-Item -Path $zipTarget -Destination "$rootPath\public\downloads\NextUps-Windows-v1.0.2.zip" -Force
Copy-Item -Path $zipTarget -Destination "$rootPath\public\downloads\NextUps-Windows-v1.0.1.zip" -Force

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " SUCCESS: NextUps Windows v$Version built & signed!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
