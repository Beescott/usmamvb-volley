Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem 'c:\Users\kazeo\usmamvb-volley\assets\img' -File |
  Where-Object { $_.Name -like 'Remisetro*' -or $_.Name -like 'meryplouz*' -or $_.Name -like 'Emblemem*' -or $_.Name -like 'emblemeauvers*' -or $_.Name -like 'emblememeriel*' } |
  Select-Object -ExpandProperty FullName
$chars = ' .:-=+*#%@'
foreach ($p in $files) {
  $f = [System.IO.Path]::GetFileName($p)
  $img = [System.Drawing.Image]::FromFile($p)
  $w = 46; $h = 24
  $bmp = New-Object System.Drawing.Bitmap $w,$h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h)
  Write-Output "=== $f ($($img.Width)x$($img.Height)) ==="
  for ($y=0; $y -lt $h; $y++) {
    $line = ''
    for ($x=0; $x -lt $w; $x++) {
      $px = $bmp.GetPixel($x,$y)
      $lum = (0.299*$px.R + 0.587*$px.G + 0.114*$px.B) * ($px.A/255)
      $idx = [math]::Min(9, [int][math]::Round($lum/255*9))
      if ($px.A -lt 128) { $line += '?' } else { $line += $chars[$idx] }
    }
    Write-Output $line
  }
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}
