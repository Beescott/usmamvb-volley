$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskOp = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function AwaitOp($w, $t) {
  $m = $asTaskOp.MakeGenericMethod($t)
  $x = $m.Invoke($null, @($w))
  $x.Wait(-1) | Out-Null
  $x.Result
}

[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Foundation.UniversalApiContract,ContentType=WindowsRuntime] | Out-Null
[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime] | Out-Null

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'fr-FR'))
if ($null -eq $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages() }

$out = @()
foreach ($f in (Get-ChildItem 'c:\Users\kazeo\usmamvb-volley\.tmp\va_*.png' | Sort-Object Name)) {
  $out += "`n########## $($f.Name) ##########"
  $file = AwaitOp ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
  $stream = AwaitOp ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $dec = AwaitOp ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bmp = AwaitOp ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $async = $engine.RecognizeAsync($bmp)
  $guard = 0
  while ($guard -lt 600) {
    $st = $async.Status
    if ($st -eq 'Completed' -or $st -eq 'Canceled' -or $st -eq 'Error') { break }
    Start-Sleep -Milliseconds 100
    $guard++
  }
  $out += ("[status " + $async.Status + " guard " + $guard + "]")
  $res = $async.GetResults()
  foreach ($line in $res.Lines) { $out += $line.Text }
  $stream.Dispose()
}
$out -join "`r`n" | Set-Content -Encoding UTF8 'c:\Users\kazeo\usmamvb-volley\.tmp\ocr_out.txt'
Write-Output 'OCR DONE'
