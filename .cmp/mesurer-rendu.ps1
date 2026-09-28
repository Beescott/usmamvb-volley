$ErrorActionPreference = 'SilentlyContinue'
$ProgressPreference = 'SilentlyContinue'
$Repo = 'C:\Users\kazeo\usmamvb-volley'
$Edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$Shots = "$env:TEMP\shots"
New-Item -ItemType Directory -Force -Path $Shots | Out-Null

$Snippet = @'
<script>
window.addEventListener('load', function () {
  function dim(sel) {
    var el = document.querySelector(sel);
    if (!el) { return sel + ' = ABSENT'; }
    var r = el.getBoundingClientRect();
    return sel + ' = ' + Math.round(r.width) + ' x ' + Math.round(r.height);
  }
  var lignes = [
    'MESURE',
    dim('.membre__contact svg'),
    dim('.membre__photo'),
    dim('.membre'),
    dim('.membre__body'),
    dim('.bureau__grid'),
    dim('.contact svg'),
    dim('.socials svg'),
    dim('.brand__mark'),
    'display .membre = ' + getComputedStyle(document.querySelector('.membre')).display,
    'display .bureau__grid = ' + getComputedStyle(document.querySelector('.bureau__grid')).display,
    'colonnes .membre = ' + getComputedStyle(document.querySelector('.membre')).gridTemplateColumns
  ];
  var pre = document.createElement('pre');
  pre.id = 'MESURE';
  pre.textContent = lignes.join('\n');
  document.body.appendChild(pre);
});
</script>
'@

function New-Sandbox([string]$Name, [string]$CssSource) {
  $root = Join-Path $env:TEMP $Name
  Remove-Item $root -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path "$root\assets\css", "$root\assets\js" | Out-Null
  foreach ($d in @('img', 'fonts')) {
    Copy-Item "$Repo\assets\$d" "$root\assets\$d" -Recurse -Force
  }
  Copy-Item "$Repo\assets\js\main.js" "$root\assets\js\main.js" -Force
  $html = (Get-Content "$Repo\bureau.html" -Raw) -replace '</body>', ($Snippet + '</body>')
  Set-Content -Path "$root\bureau.html" -Value $html -Encoding UTF8 -NoNewline
  Set-Content -Path "$root\assets\css\style.css" -Value $CssSource -Encoding UTF8 -NoNewline
  return $root
}

$newCss = (Get-Content "$Repo\assets\css\style.css" -Raw)
$oldCss = (git -C $Repo -c safe.directory='*' show 'HEAD~1:assets/css/style.css') -join "`n"

$sandboxes = [ordered]@{
  'CSS-A-JOUR (deploye)' = New-Sandbox 'sandbox-new' $newCss
  'CSS EN CACHE (v. precedente)' = New-Sandbox 'sandbox-old' $oldCss
}

foreach ($label in $sandboxes.Keys) {
  $path = $sandboxes[$label]
  $url = (($path -replace '\\', '/') + '/bureau.html')
  $prof = "$env:TEMP\prof-$([System.IO.Path]::GetRandomFileName())"
  $domFile = "$Shots\dom-$($path.Split('\')[-1]).txt"
  $a = @('--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
         '--force-device-scale-factor=1', '--window-size=1280,900',
         "--user-data-dir=$prof", '--virtual-time-budget=9000', '--dump-dom',
         "file:///$url")
  Start-Process -FilePath $Edge -ArgumentList $a -Wait -NoNewWindow -RedirectStandardOutput $domFile
  Write-Output "================= $label ================="
  $dom = Get-Content $domFile -Raw
  $m = [regex]::Match($dom, '(?s)id="MESURE"[^>]*>(.*?)</pre>')
  if ($m.Success) {
    ($m.Groups[1].Value -split "`n" | Select-Object -Skip 1) | ForEach-Object { '   ' + $_.Trim() }
  } else {
    '   (mesure non trouvee)'
  }
  Write-Output ''
}
