# ──────────────────────────────────────────────────────────────
# TenderEase — Run Single Service Script
# ──────────────────────────────────────────────────────────────

param(
    [string]$ServicePath = ""
)

$ErrorActionPreference = "Stop"

# Load environment variables from the .env file in the same folder as this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFilePath = Join-Path $scriptDir ".env"

if (Test-Path $envFilePath) {
    Write-Host "Loading environment variables from $envFilePath..." -ForegroundColor Gray
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split '=', 2
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $val = $parts[1].Trim().Trim("'").Trim('"')
                [System.Environment]::SetEnvironmentVariable($name, $val, [System.EnvironmentVariableTarget]::Process)
            }
        }
    }
} else {
    Write-Warning ".env file not found at $envFilePath!"
}

# Change directory to the target service path and execute spring-boot:run
$targetDir = Resolve-Path $ServicePath
Write-Host "Navigating to $targetDir and running spring-boot:run..." -ForegroundColor Cyan
cd $targetDir
mvn spring-boot:run
