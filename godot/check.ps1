param(
	[Parameter(Mandatory = $true)]
	[string]$GodotPath
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $GodotPath -PathType Leaf)) {
	throw "Godot executable not found: $GodotPath"
}

& $GodotPath --headless --editor --path $PSScriptRoot --quit
if ($LASTEXITCODE -ne 0) {
	exit $LASTEXITCODE
}

& $GodotPath --headless --check-only --path $PSScriptRoot --script res://scripts/port_bootstrap.gd
if ($LASTEXITCODE -ne 0) {
	exit $LASTEXITCODE
}

& $GodotPath --headless --path $PSScriptRoot --script res://tests/port_bootstrap_smoke.gd
exit $LASTEXITCODE
