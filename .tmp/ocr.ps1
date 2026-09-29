$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime

$methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskOp = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
$asTaskProg = ($methods | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperationWithProgress`2' })[0]

function AwaitOp($winrt, $type) {
  $m = $asTaskOp.MakeGenericMethod($type)
  $t = $m.Invoke($null, @($winrt))
  $t.Wait(-1) | Out-Null
  $t.Result
}
function AwaitProg($winrt, $resType, $progType) {
  $m = $asTaskProg.MakeGenericMethod(@($resType, $progType))
  $t = $m.Invoke($null, @($winrt))
  $t.Wait(-1) | Out-Null
  $t.Result
}

[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Foundation.UniversalApiContract,ContentType=WindowsRuntime] | Out-Null
[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime] | Out-Null

Write-Output ("AVAILABLE LANGS: " + (([Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages | ForEach-Object { $_.LanguageTag }) -join ', '))

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'fr-FR'))
if ($null -eq $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages() }
if ($null -eq $engine) { throw 'no OCR engine' }
Write-Output ("ENGINE: " + $engine.RecognizerLanguage.LanguageTag)

$lines = @()
foreach ($f in (Get-ChildItem 'c:\Users\kazeo\usmamvb-volley\.tmp\va_*.png' | Sort-Object Name)) {
  $lines += "`n########## $($f.Name) ##########"
  $file = AwaitOp ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
  $stream = AwaitOp ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $decoder = AwaitOp ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $bitmap = AwaitOp ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $res = AwaitProg ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult]) ([Windows.Media.Ocr.OcrResult])
  foreach ($line in $res.Lines) { $lines += $line.Text }
  $stream.Dispose()
}
$lines -join "`r`n" | Set-Content -Encoding UTF8 'c:\Users\kazeo\usmamvb-volley\.tmp\ocr_out.txt'
Write-Output 'OCR DONE'
