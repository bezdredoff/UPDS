param(
	[Parameter(Mandatory = $true)]
	[string]$GodotPath,
	[string]$CapturePath
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $GodotPath -PathType Leaf)) {
	throw "Godot executable not found: $GodotPath"
}
$projectPath = $PSScriptRoot
$stdoutPath = [System.IO.Path]::GetTempFileName()
$stderrPath = [System.IO.Path]::GetTempFileName()
$previousCapture = $env:UPDS_ART_CAPTURE
try {
	$env:UPDS_ART_CAPTURE = $CapturePath
	$arguments = @('--path', ('"' + $projectPath + '"'), '--rendering-method', 'gl_compatibility',
		'--script', 'res://tests/art_compositing_render_smoke.gd', '--quit-after', '120')
	$process = Start-Process -FilePath $GodotPath -ArgumentList $arguments -WindowStyle Hidden -PassThru `
		-RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
	if (-not $process.WaitForExit(60000)) {
		$process.Kill()
		throw 'Godot render smoke timed out after 60 seconds.'
	}
	$stdout = Get-Content -LiteralPath $stdoutPath -Raw
	$stderr = Get-Content -LiteralPath $stderrPath -Raw
	Write-Output $stdout
	if ($stderr) { Write-Output $stderr }
	if ($process.ExitCode -ne 0 -or ($stdout + $stderr) -match 'SCRIPT ERROR:|ERROR:' -or
		$stdout -notmatch 'UPDS Godot art compositing render smoke passed\.') {
		throw 'Godot art compositing render smoke failed.'
	}
} finally {
	$env:UPDS_ART_CAPTURE = $previousCapture
	Remove-Item -LiteralPath $stdoutPath, $stderrPath
}
