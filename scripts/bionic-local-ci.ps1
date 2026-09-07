#!/usr/bin/env pwsh
param([switch]$InstallDependencies)
$ErrorActionPreference = 'Stop'

Write-Host 'UPDS local CI-equivalent gate'
Write-Host (git status --short --branch)

if ($InstallDependencies) {
  Write-Host 'Installing dependencies as explicitly requested.'
  npm.cmd ci --ignore-scripts
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host 'Using the existing dependency tree; no install performed.'
}

npm.cmd run check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Local CI-equivalent gate passed.'
