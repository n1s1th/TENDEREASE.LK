# ──────────────────────────────────────────────────────────────
# TenderEase — Run Selected Services for CAO & Officer Registration
# ──────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# Load Environment Variables from backend\.env
$envFilePath = Join-Path $PSScriptRoot "backend\.env"
if (Test-Path $envFilePath) {
    Write-Host "Loading environment variables from backend\.env..." -ForegroundColor Gray
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split '=', 2
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $val = $parts[1].Trim()
                # Remove quotes if present
                $val = $val -replace "^['`"]", "" -replace "['`"]$", ""
                [System.Environment]::SetEnvironmentVariable($name, $val, [System.EnvironmentVariableTarget]::Process)
            }
        }
    }
} else {
    Write-Warning "backend\.env file not found!"
}

# Define services to launch (in order)
$selectedServices = @(
    @{ name = "eureka-server"; path = "backend\eureka-server"; sleep = 6 },
    @{ name = "api-gateway"; path = "backend\api-gateway"; sleep = 4 },
    @{ name = "user-service"; path = "backend\user-service"; sleep = 3 },
    @{ name = "tender-service"; path = "backend\tender-service"; sleep = 3 },
    @{ name = "evaluation-service"; path = "backend\evaluation-service"; sleep = 3 },
    @{ name = "reporting-service"; path = "backend\reporting-service"; sleep = 3 },
    @{ name = "notification-service"; path = "backend\notification-service"; sleep = 3 }
)

Write-Host "Launching selected backend microservices..." -ForegroundColor Cyan
foreach ($srv in $selectedServices) {
    $workingDir = Join-Path $PSScriptRoot $srv.path
    Write-Host "Starting $($srv.name)..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "mvn spring-boot:run" -WorkingDirectory $workingDir
    Start-Sleep -Seconds $srv.sleep
}

# Launch Frontend
Write-Host "`nStarting Next.js Frontend..." -ForegroundColor Cyan
$frontendDir = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cmd /c npm run dev" -WorkingDirectory $frontendDir

Write-Host "`nSelected services and Next.js frontend have been launched!" -ForegroundColor Green
