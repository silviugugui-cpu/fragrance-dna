$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manageServer = Join-Path $PSScriptRoot "manageLocalServer.ps1"
$npm = (Get-Command npm.cmd -ErrorAction Stop).Source

& $manageServer -Mode stop

Push-Location $root
try {
  & $npm run build
  $buildExitCode = $LASTEXITCODE
} finally {
  Pop-Location
}

if ($buildExitCode -ne 0) {
  exit $buildExitCode
}

& $manageServer -Mode start
