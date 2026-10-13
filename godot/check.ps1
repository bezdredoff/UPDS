param(
	[Parameter(Mandatory = $true)]
	[string]$GodotPath
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $GodotPath -PathType Leaf)) {
	throw "Godot executable not found: $GodotPath"
}

function Invoke-GodotCheck {
	param(
		[string]$Stage,
		[string[]]$Arguments,
		[string]$ExpectedOutput = ''
	)

	$stdoutPath = [System.IO.Path]::GetTempFileName()
	$stderrPath = [System.IO.Path]::GetTempFileName()
	$escapedArguments = $Arguments | ForEach-Object {
		if ($_ -match '[\s"]') { '"' + $_.Replace('"', '\"') + '"' } else { $_ }
	}
	try {
		$process = Start-Process -FilePath $GodotPath -ArgumentList ($escapedArguments -join ' ') `
			-Wait -PassThru -NoNewWindow -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
		$stdout = Get-Content -LiteralPath $stdoutPath -Raw
		$stderr = Get-Content -LiteralPath $stderrPath -Raw
		if ($process.ExitCode -ne 0) {
			throw "$Stage failed (exit $($process.ExitCode)).`n$stdout`n$stderr"
		}
		if ($stderr -match 'SCRIPT ERROR:') {
			throw "$Stage reported a GDScript error.`n$stdout`n$stderr"
		}
		if ($ExpectedOutput -and -not $stdout.Contains($ExpectedOutput)) {
			throw "$Stage did not report success marker '$ExpectedOutput'.`n$stdout`n$stderr"
		}
		Write-Output "$Stage passed."
	}
	finally {
		Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
	}
}

$projectPath = $PSScriptRoot
Invoke-GodotCheck -Stage 'Project import' -Arguments @('--headless', '--editor', '--path', $projectPath, '--quit')
Invoke-GodotCheck -Stage 'Bootstrap script parse' -Arguments @('--headless', '--check-only', '--path', $projectPath, '--script', 'res://scripts/port_bootstrap.gd')
Invoke-GodotCheck -Stage 'Menu copy script parse' -Arguments @('--headless', '--check-only', '--path', $projectPath, '--script', 'res://scripts/menu_copy.gd')
Invoke-GodotCheck -Stage 'Main menu script parse' -Arguments @('--headless', '--check-only', '--path', $projectPath, '--script', 'res://scripts/main_menu.gd')
Invoke-GodotCheck -Stage 'Audio synthesis script parse' -Arguments @('--headless', '--check-only', '--path', $projectPath, '--script', 'res://scripts/audio_synthesis.gd')
Invoke-GodotCheck -Stage 'Audio runtime script parse' -Arguments @('--headless', '--check-only', '--path', $projectPath, '--script', 'res://scripts/menu_audio.gd')
Invoke-GodotCheck -Stage 'Bootstrap scene smoke test' -ExpectedOutput 'UPDS Godot bootstrap smoke test passed.' `
	-Arguments @('--headless', '--path', $projectPath, '--script', 'res://tests/port_bootstrap_smoke.gd', '--quit-after', '120')
Invoke-GodotCheck -Stage 'Main menu smoke test' -ExpectedOutput 'UPDS Godot main menu smoke test passed (locale:' `
	-Arguments @('--headless', '--path', $projectPath, '--script', 'res://tests/main_menu_smoke.gd', '--quit-after', '120')
Invoke-GodotCheck -Stage 'Settings smoke test' -ExpectedOutput 'UPDS Godot settings smoke test passed.' `
	-Arguments @('--headless', '--path', $projectPath, '--script', 'res://tests/settings_smoke.gd', '--quit-after', '120')
Invoke-GodotCheck -Stage 'Audio smoke test' -ExpectedOutput 'UPDS Godot audio smoke test passed.' `
	-Arguments @('--headless', '--path', $projectPath, '--script', 'res://tests/audio_smoke.gd', '--quit-after', '120')
