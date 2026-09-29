$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$log = 'c:\Users\kazeo\usmamvb-volley\.tmp\ocr_log.txt'
$outFile = 'c:\Users\kazeo\usmamvb-volley\.tmp\ocr_out.txt'
function Log($m) { [System.IO.File]::AppendAllText($log, (Get-Date -Format 'HH:mm:ss') + ' ' + $m + "`r`n") }
Set-Content -Path $log -Value 'start6' -Encoding UTF8
if (Test-Path $outFile) { Remove-Item $outFile }

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
Log ("engine = " + $(if ($null -eq $engine) { 'NULL' } else { $engine.RecognizerLanguage.LanguageTag }))

foreach ($f in (Get-ChildItem 'c:\Users\kazeo\usmamvb-volley\.tmp\va_*.png' | Sort-Object Name)) {
  try {
    Log ("begin " + $f.Name)
    $file = AwaitOp ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
    $stream = AwaitOp ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $dec = AwaitOp ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = AwaitOp ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $async = $engine.RecognizeAsync($bmp)
    $res = $null
    for ($i = 0; $i -lt 900; $i++) {
      try { $res = $async.GetResults(); break }
      catch {
        $msg = $_.Exception.Message
        if ($msg -notmatch 'pending|PENDING|0x8000400E') { Log ("getresults msg: " + $msg) }
        Start-Sleep -Milliseconds 200
      }
    }
    if ($null -eq $res) { Log ("NO RESULT for " + $f.Name); continue }
    $txt = @("`n########## " + $f.Name + " ##########")
    foreach ($line in $res.Lines) { $txt += $line.Text }
    [System.IO.File]::AppendAllText($outFile, ($txt -join "`r`n") + "`r`n", [System.Text.Encoding]::UTF8)
    Log ("wrote " + $res.Lines.Count + " lines for " + $f.Name)
    $stream.Dispose()
  } catch {
    Log ("ERROR " + $f.Name + " :: " + $_.Exception.Message)
  }
}
Log 'ALL DONE'
