\$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
\$methods=[System.WindowsRuntimeSystemExtensions].GetMethods()
\$asTaskOp=(\$methods|Where-Object{\$_.Name -eq 'AsTask' -and \$_.IsGenericMethod -and \$_.GetParameters().Count -eq 1 -and \$_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1'})[0]
function AwaitOp(\$w,\$t){\$m=\$asTaskOp.MakeGenericMethod(\$t);\$x=\$m.Invoke(\$null,@(\$w));\$x.Wait(-1)|Out-Null;\$x.Result}
[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]|Out-Null
[Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime]|Out-Null
[Windows.Media.Ocr.OcrEngine,Windows.Foundation.UniversalApiContract,ContentType=WindowsRuntime]|Out-Null
[Windows.Globalization.Language,Windows.Globalization,ContentType=WindowsRuntime]|Out-Null
\$f=AwaitOp ([Windows.Storage.StorageFile]::GetFileFromPathAsync('c:\Users\kazeo\usmamvb-volley\.tmp\va_01.png')) ([Windows.Storage.StorageFile])
\$s=AwaitOp (\$f.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
\$d=AwaitOp ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync(\$s)) ([Windows.Graphics.Imaging.BitmapDecoder])
\$b=AwaitOp (\$d.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
\$e=[Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'fr-FR'))
\$a=\$e.RecognizeAsync(\$b)
Write-Output ("TYPE: "+\$a.GetType().FullName)
Write-Output ("STATUS TYPE: "+\$a.Status)
while (\$a.Status -ne 1 -and \$a.Status -ne 2 -and \$a.Status -ne 3) { Start-Sleep -Milliseconds 100 }
\$r=\$a.GetResults()
(\$r.Lines | ForEach-Object { \$_.Text }) -join \"`r`n\" | Set-Content -Encoding UTF8 'c:\Users\kazeo\usmamvb-volley\.tmp\ocr_01.txt'
Write-Output 'OK ONE'
