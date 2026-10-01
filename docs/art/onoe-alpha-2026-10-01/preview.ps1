$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root='C:\git\UPDS-local-ai\output\art-review\onoe-alpha-v1'
$jobs=@(
 @{label='Pose A';file='rig/pose_a/frames/frame-neutral.png';crop=[Drawing.Rectangle]::new(300,225,450,260)},
 @{label='Pose B';file='poses/pose_b_evidence_bag.png';crop=[Drawing.Rectangle]::new(300,225,450,260)},
 @{label='Portrait';file='medallions/portrait_neutral_256.png';crop=[Drawing.Rectangle]::new(20,100,230,130)}
)
$board=[Drawing.Bitmap]::new(1200,990)
$g=[Drawing.Graphics]::FromImage($board)
$font=[Drawing.Font]::new('Segoe UI',14)
for($row=0;$row -lt 3;$row++) {for($col=0;$col -lt 2;$col++) {
 $bg=@([Drawing.Color]::White,[Drawing.Color]::FromArgb(128,128,128),[Drawing.Color]::FromArgb(28,28,28))[$row]
 $brush=[Drawing.SolidBrush]::new($bg);$g.FillRectangle($brush,$col*600,$row*330,600,330);$brush.Dispose()
 $folder=if($col -eq 0){'backup'}else{'candidate'}
 $im=[Drawing.Bitmap]::new((Join-Path $root "$folder/public/assets/characters/onoe/$($jobs[$row].file)"))
 $c=$jobs[$row].crop;$g.DrawImage($im,[Drawing.Rectangle]::new($col*600,$row*330+35,600,290),$c.X,$c.Y,$c.Width,$c.Height,[Drawing.GraphicsUnit]::Pixel);$im.Dispose()
 $ink=if($row -eq 2){[Drawing.Brushes]::White}else{[Drawing.Brushes]::Black}
 $g.DrawString("$($jobs[$row].label) - $folder",$font,$ink,$col*600+10,$row*330+5)
}}
$board.Save((Join-Path $root 'shoulders-review.png'),[Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$font.Dispose();$board.Dispose()
