$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'
Set-Location 'C:\Users\kazeo\usmamvb-volley'
$Base = 'https://beescott.github.io/usmamvb-volley'

function Test-CaseSensitive([string]$RelPath) {
  # Verifie que le fichier existe avec exactement la meme casse (Linux est sensible a la casse).
  $normalized = ($RelPath -replace '\\', '/')
  $parts = @($normalized.Split('/') | Where-Object { $_ -ne '' -and $_ -ne '.' })
  $cursor = (Get-Location).Path
  foreach ($part in $parts) {
    $kids = Get-ChildItem -Path $cursor -Force -ErrorAction SilentlyContinue
    $match = @($kids | Where-Object { $_.Name -ceq $part })
    if ($match.Count -eq 0) { return $false }
    $cursor = $match[0].FullName
  }
  return (Test-Path -LiteralPath $cursor)
}

$refs = New-Object System.Collections.Generic.HashSet[string]

foreach ($file in (Get-ChildItem -Path . -Filter '*.html' -File)) {
  $html = Get-Content $file.FullName -Raw
  foreach ($m in [regex]::Matches($html, '(?:src|href)\s*=\s*"([^"]+)"')) {
    $u = $m.Groups[1].Value
    if ($u -match '^(https?:|mailto:|tel:|#|data:)') { continue }
    [void]$refs.Add("$($file.Name)|$u")
  }
}

$css = Get-Content 'assets\css\style.css' -Raw
foreach ($m in [regex]::Matches($css, "url\(\s*'([^']+)'\s*\)")) {
  $u = $m.Groups[1].Value
  if ($u -match '^(https?:|data:)') { continue }
  $resolved = Join-Path 'assets\css' $u
  $clean = (Resolve-Path -Relative $resolved) -replace '^\\\.', ''
  [void]$refs.Add("style.css|$clean")
}

$seen = @{}
$problems = 0
foreach ($ref in ($refs | Sort-Object)) {
  $src, $u = $ref.Split('|', 2)
  $rel = ($u -replace '\\', '/')
  if ($src -ne 'style.css') {
    # chemin relatif a la page, sans ancre ni query
    $rel = ($rel -split '[?#]')[0]
  }
  if ($rel -eq '' -or $rel -eq '#') { continue }
  if (-not $seen.ContainsKey($rel)) {
    $localOk = Test-CaseSensitive $rel
    $url = "$Base/" + ($rel -replace '^/', '')
    $remoteStatus = '?'
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -Method Head
      $remoteStatus = "$($r.StatusCode)"
    } catch {
      if ($_.Exception.Response) { $remoteStatus = "$([int]$_.Exception.Response.StatusCode)" }
      else { $remoteStatus = 'ERR' }
    }
    $seen[$rel] = @($localOk, $remoteStatus, $src)
    $flag = ''
    if (-not $localOk -or $remoteStatus -ne '200') { $flag = '   <-- PROBLEME'; $problems++ }
    Write-Output ('{0,-40} local={1,-6} en-ligne={2,-6}{3}' -f $rel, $localOk, $remoteStatus, $flag)
  }
}
Write-Output ''
Write-Output ("cibles distinctes testees : {0}   problemes : {1}" -f $seen.Count, $problems)
