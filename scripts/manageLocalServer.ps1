param(
  [ValidateSet("start", "restart", "stop", "status")]
  [string]$Mode = "start"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$port = 3000
$nextCli = Join-Path $root "node_modules\next\dist\bin\next"
$outputLog = Join-Path $root ".next\local-server.stdout.log"
$errorLog = Join-Path $root ".next\local-server.stderr.log"

function Get-PortListeners {
  @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique)
}

function Test-LocalServer {
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -TimeoutSec 3 -UseBasicParsing
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Stop-LocalServer {
  $listeners = Get-PortListeners
  foreach ($listenerPid in $listeners) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $listenerPid"
    $nextPattern = 'node_modules[\\/]+next[\\/]+dist[\\/]+bin[\\/]+next'
    if (-not $processInfo -or $processInfo.Name -ne "node.exe" -or
      $processInfo.CommandLine -notmatch $nextPattern -or
      $processInfo.CommandLine -notmatch "--port\s+$port") {
      throw "Port $port is owned by an unrelated process (PID $listenerPid). It was not stopped."
    }
    Stop-Process -Id $listenerPid -Force
  }

  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    if ((Get-PortListeners).Count -eq 0) { return }
    Start-Sleep -Milliseconds 250
  }
  throw "The previous Next.js server did not release port $port."
}

if ($Mode -eq "status") {
  $listeners = Get-PortListeners
  if ((Test-LocalServer) -and $listeners.Count -gt 0) {
    Write-Output "http://localhost:$port is responding (PID $($listeners -join ', '))."
    return
  }
  throw "No responsive local server is running on port $port."
}

if ($Mode -eq "stop") {
  Stop-LocalServer
  Write-Output "Stopped the local Next.js server on port $port."
  return
}

if ($Mode -eq "restart") {
  Stop-LocalServer
} elseif ((Get-PortListeners).Count -gt 0) {
  if (Test-LocalServer) {
    Write-Output "http://localhost:$port is already responding."
    return
  }
  throw "Port $port is occupied by a non-responsive process; it was not stopped."
}

if (-not (Test-Path -LiteralPath $nextCli)) {
  throw "Next.js executable not found: $nextCli"
}

New-Item -ItemType Directory -Path (Split-Path -Parent $outputLog) -Force | Out-Null
foreach ($log in @($outputLog, $errorLog)) {
  if (Test-Path -LiteralPath $log) {
    Remove-Item -LiteralPath $log -Force
  }
}

$arguments = "`"$nextCli`" start --hostname 127.0.0.1 --port $port"
$server = Start-Process -FilePath (Get-Command node.exe -ErrorAction Stop).Source `
  -ArgumentList $arguments -WorkingDirectory $root -WindowStyle Hidden `
  -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog -PassThru

for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Seconds 1
  $server.Refresh()
  if ($server.HasExited) { break }
  if ((Get-PortListeners) -contains $server.Id -and (Test-LocalServer)) {
    Write-Output "http://localhost:$port is responding (PID $($server.Id))."
    return
  }
}

$details = if (Test-Path -LiteralPath $errorLog) {
  (Get-Content -LiteralPath $errorLog -Tail 30) -join [Environment]::NewLine
} else {
  "No server error log was produced."
}
if (-not $server.HasExited) {
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}
throw "Next.js did not become responsive on port $port within 30 seconds. $details"
