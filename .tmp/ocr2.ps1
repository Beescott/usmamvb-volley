$ErrorActionPreference = 'Stop'
$src = @'
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Globalization;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;
using Windows.Storage.Streams;

public static class OcrHelper
{
    public static async Task<string> Recognize(string path)
    {
        var file = await StorageFile.GetFileFromPathAsync(path);
        using (IRandomAccessStream stream = await file.OpenAsync(FileAccessMode.Read))
        {
            BitmapDecoder decoder = await BitmapDecoder.CreateAsync(stream);
            SoftwareBitmap bmp = await decoder.GetSoftwareBitmapAsync();
            OcrEngine engine = OcrEngine.TryCreateFromLanguage(new Language("fr-FR"));
            if (engine == null) engine = OcrEngine.TryCreateFromUserProfileLanguages();
            OcrResult res = await engine.RecognizeAsync(bmp);
            var sb = new StringBuilder();
            foreach (OcrLine line in res.Lines) sb.AppendLine(line.Text);
            return sb.ToString();
        }
    }
}
'@

$refs = @(
  'C:\Windows\System32\WinMetadata\Windows.winmd',
  'System.Runtime',
  'System.Runtime.WindowsRuntime',
  'System.Threading.Tasks',
  'System.Collections',
  'System.Runtime.InteropServices',
  'mscorlib'
)
Add-Type -TypeDefinition $src -ReferencedAssemblies $refs -Language CSharp

$out = @()
foreach ($f in (Get-ChildItem 'c:\Users\kazeo\usmamvb-volley\.tmp\va_*.png' | Sort-Object Name)) {
  $out += "`n########## $($f.Name) ##########"
  $out += [OcrHelper]::Recognize($f.FullName).GetAwaiter().GetResult()
}
$out -join "`r`n" | Set-Content -Encoding UTF8 'c:\Users\kazeo\usmamvb-volley\.tmp\ocr_out.txt'
Write-Output 'OCR DONE'
