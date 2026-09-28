param([string]$Repo = 'C:\Users\kazeo\usmamvb-volley')
$map = @{
  'bureau.html'         = 'bureau.html'
  'index.html'          = 'index.html'
  'assets/css/style.css' = 'assets\css\style.css'
  'assets/js/main.js'   = 'assets\js\main.js'
}
$sha = [System.Security.Cryptography.SHA256]::Create()
function Get-NormHash([string]$Path) {
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  $text = $text -replace "`r`n", "`n"
  $nb = [System.Text.Encoding]::UTF8.GetBytes($text)
  return (($sha.ComputeHash($nb) | ForEach-Object { $_.ToString('x2') }) -join '')
}
foreach ($key in $map.Keys | Sort-Object) {
  $remote = Join-Path $Repo ('.cmp\' + (Split-Path $key -Leaf))
  $local = Join-Path $Repo $map[$key]
  $hr = Get-NormHash $remote
  $hl = Get-NormHash $local
  $same = ($hr -eq $hl)
  Write-Output ("{0,-22} identique={1}" -f $key, $same)
  if (-not $same) {
    Write-Output ("   local  sha={0}  octets={1}" -f $hl.Substring(0,12), (Get-Item $local).Length)
    Write-Output ("   remote sha={0}  octets={1}" -f $hr.Substring(0,12), (Get-Item $remote).Length)
  }
}
