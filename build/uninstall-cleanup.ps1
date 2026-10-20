# Drive Tambu optional-data cleanup. Standalone Windows PowerShell 5.1 helper staged
# into the NSIS plugin directory BEFORE installed application files are removed.
# No Electron/rclone dependency; no mounts or remote directory traversal.
[CmdletBinding()]
param(
  [string]$InstallDir = '',
  [int]$RemovePreferences = 0,
  [int]$RemoveShortcuts = 0,
  [int]$RemoveBackups = 0,
  [switch]$SelfTest
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Windows file ID/volume identity. All handles are opened with OPEN_REPARSE_POINT.
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
public static class DriveTambuFileId {
    [StructLayout(LayoutKind.Sequential)]
    public struct ByHandleFileInformation {
        public uint Attributes;
        public System.Runtime.InteropServices.ComTypes.FILETIME CreationTime;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastAccessTime;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWriteTime;
        public uint VolumeSerial;
        public uint FileSizeHigh;
        public uint FileSizeLow;
        public uint Links;
        public uint FileIndexHigh;
        public uint FileIndexLow;
    }
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern SafeFileHandle CreateFileW(string path, uint access, uint share, IntPtr security, uint disposition, uint flags, IntPtr template);
    [DllImport("kernel32.dll", SetLastError=true)]
    static extern bool GetFileInformationByHandle(SafeFileHandle file, out ByHandleFileInformation info);
    public static string Identity(string path) {
        using (var h = CreateFileW(path, 0x80, 7, IntPtr.Zero, 3, 0x02200000, IntPtr.Zero)) { // FILE_READ_ATTRIBUTES, SHARE_ALL, OPEN_EXISTING, BACKUP_SEMANTICS|OPEN_REPARSE_POINT
            if (h.IsInvalid) throw new InvalidOperationException("Non posso aprire l'identita del percorso (Windows error " + Marshal.GetLastWin32Error() + ")");
            ByHandleFileInformation info;
            if (!GetFileInformationByHandle(h, out info)) throw new InvalidOperationException("Impossibile leggere volume e FileId.");
            return info.VolumeSerial.ToString("X8") + ":" + info.FileIndexHigh.ToString("X8") + info.FileIndexLow.ToString("X8");
        }
    }
}
'@ -ErrorAction Stop

function Canonical([string]$p) {
  if ([string]::IsNullOrWhiteSpace($p)) {throw 'Percorso vuoto.'}
  if ($p -match '(^|[\\/])\.\.?([\\/]|$)') {throw 'Segmenti di percorso ambigui.'}
  $v=[IO.Path]::GetFullPath($p)
  if ($v -match '^[A-Za-z]:\\$') {return $v}
  return $v.TrimEnd([char]'\')
}
function Overlaps([string]$a,[string]$b) {
  $x=Canonical $a; $y=Canonical $b
  return $x.Equals($y,[StringComparison]::OrdinalIgnoreCase) -or
    $x.StartsWith($y+'\',[StringComparison]::OrdinalIgnoreCase) -or
    $y.StartsWith($x+'\',[StringComparison]::OrdinalIgnoreCase)
}
function PathSafe([string]$p) {
  $full=Canonical $p
  if ($full.StartsWith('\\') -or $full.StartsWith('\\?') -or $full -notmatch '^[A-Za-z]:\\') {throw 'Non accetto UNC, path relativi o device path.'}
  if ($full -match '^[A-Za-z]:\\?$') {throw 'La radice del disco non e eliminabile.'}
  $drive = New-Object System.IO.DriveInfo ($full.Substring(0,1))
  if ($drive.DriveType -ne [IO.DriveType]::Fixed) {throw 'Sono consentiti soltanto volumi locali fissi.'}
  $current=$full
  while ($true) {
    if ([IO.File]::Exists($current) -or [IO.Directory]::Exists($current)) {
      $attr=[IO.File]::GetAttributes($current)
      if (($attr -band [IO.FileAttributes]::ReparsePoint) -ne 0) {throw ('ReparsePoint o junction nel percorso: '+$current)}
    }
    $parent=[IO.Directory]::GetParent($current)
    if ($null -eq $parent) {break}
    $next=Canonical $parent.FullName
    if ($next -eq $current) {break}
    $current=$next
  }
  return $full
}
function HashText([string]$text) {
  $sha=[Security.Cryptography.SHA256]::Create()
  try {return [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($text))).Replace('-','')} finally {$sha.Dispose()}
}
function SummarizeTree([string]$root) {
  $entries=New-Object 'System.Collections.Generic.List[string]'
  [long]$bytes=0; [long]$files=0
  $stack=New-Object 'System.Collections.Generic.Stack[string]'
  $stack.Push($root)
  while ($stack.Count -gt 0) {
    $current=$stack.Pop()
    $children=@([IO.Directory]::EnumerateFileSystemEntries($current))
    foreach ($child in $children) {
      $attr=[IO.File]::GetAttributes($child)
      if (($attr -band [IO.FileAttributes]::ReparsePoint) -ne 0) {throw ('ReparsePoint, junction o symlink nel backup: '+$child)}
      $relative=$child.Substring($root.Length).TrimStart([char]'\')
      if (($attr -band [IO.FileAttributes]::Directory) -ne 0) {
        [void]$entries.Add('D|'+$relative)
        $stack.Push($child)
      } else {
        $f=New-Object System.IO.FileInfo ($child)
        $length=[long]$f.Length; $bytes+=$length; $files++
        [void]$entries.Add('F|'+$relative+'|'+$length+'|'+$f.LastWriteTimeUtc.Ticks)
      }
      if ($entries.Count -gt 500000) {throw 'Troppi elementi per verificare la cancellazione in sicurezza.'}
    }
  }
  $entries.Sort([StringComparer]::OrdinalIgnoreCase)
  return [pscustomobject]@{ Files=$files; Bytes=$bytes; Digest=(HashText ([string]::Join("`n",$entries))) }
}
function Get-BackupCheck([string]$root,[string]$id,[string[]]$allBackupRoots,[string[]]$allMountRoots,[string]$installation) {
  $record=[ordered]@{Path=$root; Id=$id; Ok=$false; Reason=''; Identity=''; Digest=''; Files=0; Bytes=0}
  try {
    $full=PathSafe $root; $record.Path=$full
    if (![IO.Directory]::Exists($full)) {throw 'La destinazione non esiste.'}
    $protected=@($installation,$env:WINDIR,$env:ProgramFiles,${env:ProgramFiles(x86)},$env:APPDATA,$env:LOCALAPPDATA)
    foreach ($bad in $protected) {if ($bad -and (Overlaps $full $bad)) {throw 'La destinazione si sovrappone a una cartella protetta.'}}
    foreach ($bad in @($env:USERPROFILE,[Environment]::GetFolderPath('DesktopDirectory'),[Environment]::GetFolderPath('MyDocuments'))) {
      if ($bad -and (Canonical $full) -eq (Canonical $bad)) {throw 'La directory dell utente non puo essere una destinazione eliminabile.'}
    }
    foreach ($mounted in $allMountRoots) {if ($mounted -and (Overlaps $full $mounted)) {throw 'Percorso sovrapposto a una cartella montata.'}}
    foreach ($other in $allBackupRoots) {
      if ($other -and !$other.Equals($root,[StringComparison]::OrdinalIgnoreCase) -and (Overlaps $full $other)) {throw 'Destinazioni backup sovrapposte.'}
    }
    $marker=Join-Path $full '.drive-tambu-backup.json'
    if (![IO.File]::Exists($marker)) {throw 'Marker Drive Tambu assente.'}
    [void](PathSafe $marker)
    $info=Get-Content -LiteralPath $marker -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($info.format -cne 'drive-tambu-backup-v1' -or $info.mountId -cne $id) {throw 'Marker formato o ID non corrispondente alla configurazione.'}
    $record.Identity=[DriveTambuFileId]::Identity($full)
    $summary=SummarizeTree $full
    $record.Digest=$summary.Digest;$record.Files=$summary.Files;$record.Bytes=$summary.Bytes
    $record.Ok=$true
  } catch {$record.Reason=$_.Exception.Message}
  return [pscustomobject]$record
}
function Check-Shortcut([string]$filename,[string]$installation,[hashtable]$ids,[hashtable]$inventoried=@{}) {
  $r=[ordered]@{Path=$filename; Ok=$false; Reason=''; Id=''; Identity=''}
  try {
    $file=PathSafe $filename
    if (![IO.File]::Exists($file) -or !($file.EndsWith('.lnk',[StringComparison]::OrdinalIgnoreCase))) {throw 'Non e un file .lnk regolare.'}
    $parent=Canonical ([IO.Path]::GetDirectoryName($file))
    if ($parent -eq (Canonical $installation)) {throw 'Collegamento interno alla installazione.'}
    $link=(New-Object -ComObject WScript.Shell).CreateShortcut($file)
    $target=Canonical $link.TargetPath
    $linkArgs=[string]$link.Arguments
    $oldTarget=Canonical (Join-Path $installation 'Drive Tambu.exe')
    $newTarget=Canonical (Join-Path $installation 'DriveTambuShortcut.exe')
    if ($target.Equals($oldTarget,[StringComparison]::OrdinalIgnoreCase)) {
      if ($linkArgs -cmatch '^-- --open-folder ([a-zA-Z0-9-]{6,80})$') {$id=$Matches[1]} else {throw 'Argomenti legacy non riconosciuti.'}
    } elseif ($target.Equals($newTarget,[StringComparison]::OrdinalIgnoreCase)) {
      if ($linkArgs -cmatch '^--open-folder ([a-zA-Z0-9-]{6,80})$') {$id=$Matches[1]} else {throw 'Argomenti launcher non riconosciuti.'}
    } else {throw 'Target estraneo a Drive Tambu.'}
    if (!$ids.ContainsKey($id)) {
      # A newly inventoried shortcut may survive after its saved folder was deleted.
      # The inventory alone is never proof: target and strict arguments were checked above.
      $expected=$inventoried[$file]
      if($null -eq $expected -or [string]$expected.id -cne $id -or
         [string]$expected.args -cne $linkArgs -or
         !(Canonical ([string]$expected.target)).Equals($target,[StringComparison]::OrdinalIgnoreCase)) {
        throw 'ID assente dalla configurazione e inventario non corrispondente.'
      }
    }
    $r.Id=$id; $r.Identity=[DriveTambuFileId]::Identity($file);$r.Ok=$true
  } catch {$r.Reason=$_.Exception.Message}
  return [pscustomobject]$r
}
function Remove-VerifiedTree([string]$root) {
  # Remove only individually verified entries; never bulk-delete supplied directories.
  foreach ($entry in @([IO.Directory]::EnumerateFileSystemEntries($root))) {
    $attributes=[IO.File]::GetAttributes($entry)
    if (($attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {throw ('Nuovo reparse point durante cancellazione: '+$entry)}
    if (($attributes -band [IO.FileAttributes]::Directory) -ne 0) {Remove-VerifiedTree $entry}
    else {[IO.File]::Delete($entry)}
  }
  if (([IO.File]::GetAttributes($root) -band [IO.FileAttributes]::ReparsePoint) -ne 0) {throw 'La directory e diventata un reparse point.'}
  [IO.Directory]::Delete($root,$false)
}
function ShowText([string]$title,[string]$message,[bool]$requireDeleteWord) {
  if ($message.Length -gt 30000) {throw 'Anteprima troppo lunga per mostrare tutti i percorsi. Nessuna pulizia automatica eseguita.'}
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  $form=New-Object System.Windows.Forms.Form
  $form.Text=$title;$form.Width=850;$form.Height=620;$form.StartPosition='CenterScreen'
  $form.FormBorderStyle='FixedDialog';$form.MaximizeBox=$false
  $description=New-Object System.Windows.Forms.Label
  $description.Left=15;$description.Top=12;$description.Width=805;$description.Height=44
  $description.Text=if($requireDeleteWord){'Conferma la cancellazione IRREVERSIBILE di TUTTO il contenuto delle directory elencate, inclusi file aggiunti manualmente.'}else{'Anteprima delle operazioni richieste. Gli elementi non riconosciuti saranno conservati.'}
  $form.Controls.Add($description)
  $box=New-Object System.Windows.Forms.TextBox
  $box.Left=15;$box.Top=60;$box.Width=805;$box.Height=445
  $box.Multiline=$true;$box.ScrollBars='Both';$box.ReadOnly=$true;$box.WordWrap=$false
  $box.Text=$message;$form.Controls.Add($box)
  $word=New-Object System.Windows.Forms.TextBox
  $word.Left=15;$word.Top=516;$word.Width=185
  if($requireDeleteWord){$form.Controls.Add($word)}
  $hint=New-Object System.Windows.Forms.Label
  $hint.Left=210;$hint.Top=520;$hint.Width=390;$hint.Height=32
  if($requireDeleteWord){$hint.Text='Scrivi ELIMINA per confermare';$form.Controls.Add($hint)}
  $ok=New-Object System.Windows.Forms.Button
  $ok.Text=if($requireDeleteWord){'Elimina definitivamente'}else{'Procedi'}
  $ok.Left=620;$ok.Top=516;$ok.Width=105;$ok.Height=30
  $ok.Add_Click({if(!$requireDeleteWord -or $word.Text -ceq 'ELIMINA'){$form.DialogResult=[System.Windows.Forms.DialogResult]::OK;$form.Close()}else{[System.Windows.Forms.MessageBox]::Show('Digita esattamente ELIMINA.','Drive Tambu') | Out-Null}})
  $form.Controls.Add($ok)
  $cancel=New-Object System.Windows.Forms.Button
  $cancel.Text='Annulla';$cancel.Left=730;$cancel.Top=516;$cancel.Width=90;$cancel.Height=30
  $cancel.DialogResult=[System.Windows.Forms.DialogResult]::Cancel;$form.Controls.Add($cancel)
  $form.CancelButton=$cancel
  try{return ($form.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK)}finally{$form.Dispose()}
}
function Run-SelfTest {
  $tmp=Join-Path $env:USERPROFILE ('dt-cleanup-test-'+[guid]::NewGuid().ToString('N'))
  [IO.Directory]::CreateDirectory($tmp) | Out-Null
  try {
    $backup=Join-Path $tmp 'backup';[IO.Directory]::CreateDirectory($backup) | Out-Null
    [IO.File]::WriteAllText((Join-Path $backup '.drive-tambu-backup.json'),'{"format":"drive-tambu-backup-v1","mountId":"sample-123"}')
    [IO.File]::WriteAllText((Join-Path $backup 'file.txt'),'safe')
    $good=Get-BackupCheck $backup 'sample-123' @($backup) @() ''
    if(!$good.Ok -or $good.Files -ne 2) {throw ('Backup self-test valid failure: '+$good.Reason)}
    $bad=Get-BackupCheck $backup 'other-123' @($backup) @() ''
    if($bad.Ok) {throw 'Marker mismatch unexpectedly accepted.'}
    if(!(Overlaps $backup (Join-Path $backup 'inside'))) {throw 'Overlap not detected.'}
    $fakeInstall=Join-Path $tmp 'install';[IO.Directory]::CreateDirectory($fakeInstall) | Out-Null
    $exe=Join-Path $fakeInstall 'Drive Tambu.exe';[IO.File]::WriteAllText($exe,'fixture')
    $testLink=Join-Path $tmp 'legacy.lnk'
    $shell=New-Object -ComObject WScript.Shell
    $shortcut=$shell.CreateShortcut($testLink);$shortcut.TargetPath=$exe
    $shortcut.Arguments='-- --open-folder sample-123';$shortcut.Save()
    $found=Check-Shortcut $testLink $fakeInstall @{ 'sample-123' = $true }
    if(!$found.Ok -or $found.Id -cne 'sample-123') {throw ('Legacy shortcut self-test failed: '+$found.Reason)}
    $shortcut=$shell.CreateShortcut($testLink);$shortcut.Arguments='-- --open-folder sample-123 --extra';$shortcut.Save()
    $rejected=Check-Shortcut $testLink $fakeInstall @{ 'sample-123' = $true }
    if($rejected.Ok) {throw 'Modified shortcut accepted.'}
    $shortcut=$shell.CreateShortcut($testLink);$shortcut.Arguments='-- --open-folder unknown-inventory-id';$shortcut.Save()
    $known=@{};$known[$testLink]=[pscustomobject]@{id='unknown-inventory-id';target=$exe;args='-- --open-folder unknown-inventory-id'}
    $inventoriedLink=Check-Shortcut $testLink $fakeInstall @{} $known
    if(!$inventoriedLink.Ok -or $inventoriedLink.Id -cne 'unknown-inventory-id') {throw ('Inventory shortcut test failed: '+$inventoriedLink.Reason)}
    if(!(Test-Path $backup)) {throw 'Self-test unexpectedly removed data.'}
    Remove-VerifiedTree $backup
    if([IO.Directory]::Exists($backup)) {throw 'Verified disposable backup deletion failed.'}
    Write-Output 'Drive Tambu uninstall cleanup self-test PASS'
  } finally {if(Test-Path -LiteralPath $tmp) {[IO.Directory]::Delete($tmp,$true)}}
}
if($SelfTest) {Run-SelfTest;exit 0}
if ($RemovePreferences -notin @(0,1) -or $RemoveShortcuts -notin @(0,1) -or $RemoveBackups -notin @(0,1)) {exit 3}
if (($RemovePreferences+$RemoveShortcuts+$RemoveBackups) -eq 0) {exit 0}
if ([string]::IsNullOrWhiteSpace($InstallDir)) {exit 4}
try {
  $installation=PathSafe $InstallDir
  if (![IO.File]::Exists((Join-Path $installation 'Drive Tambu.exe'))) {throw 'Installazione Drive Tambu non riconosciuta.'}
  $roots=@((Join-Path $env:APPDATA 'Drive Tambu'),(Join-Path $env:APPDATA 'drive-tambu'))
  $configs=@();$ids=@{};$backups=@();$mounts=@();$inventory=@();$inventoried=@{}
  foreach ($root in $roots) {
    $root=Canonical $root
    if (![IO.Directory]::Exists($root)) {continue}
    [void](PathSafe $root)
    $file=Join-Path $root 'config.json'
    if ([IO.File]::Exists($file)) {
      try {
        [void](PathSafe $file)
        $data=Get-Content -LiteralPath $file -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($data.schemaVersion -ne 1 -or $null -eq $data.mounts) {throw 'Schema impostazioni sconosciuto.'}
        foreach($m in $data.mounts) {
          if ([string]$m.id -cnotmatch '^[a-zA-Z0-9-]{6,80}$') {throw 'Identificativo cartella non valido.'}
          $id=[string]$m.id;$ids[$id]=$true
          if ($m.localPath) {$mounts+=([string]$m.localPath)}
          if ($m.backup.destination) {$backups+=([pscustomobject]@{Path=[string]$m.backup.destination;Id=$id})}
        }
        $configs+=([pscustomobject]@{Path=$file;Ok=$true})
      } catch {$configs+=([pscustomobject]@{Path=$file;Ok=$false;Reason=$_.Exception.Message})}
    }
    $inventoryFile=Join-Path $root 'shortcuts-v1.json'
    if ([IO.File]::Exists($inventoryFile)) {
      try {[void](PathSafe $inventoryFile);$saved=Get-Content -LiteralPath $inventoryFile -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($saved.version -eq 1 -and $saved.shortcuts) {foreach($item in $saved.shortcuts) {
          if($item.path -and $item.id -and $item.target -and $item.args) {
            $entryPath=Canonical ([string]$item.path)
            $inventory+=$entryPath
            if($inventoried.ContainsKey($entryPath)){$inventoried[$entryPath]=$null}
            else {$inventoried[$entryPath]=$item}
          }
        }}
      } catch {}
    }
  }
  $configFault=@($configs | Where-Object {!$_.Ok}).Count -gt 0
  $checkedBackups=@();$checkedLinks=@();$lines=New-Object 'System.Collections.Generic.List[string]'
  if($RemoveBackups -eq 1) {
    $allRoots=@($backups | ForEach-Object {$_.Path})
    foreach($candidate in $backups){
      $check=Get-BackupCheck $candidate.Path $candidate.Id $allRoots $mounts $installation
      $duplicates=@($backups | Where-Object { $_.Path -and (Canonical $_.Path).Equals((Canonical $candidate.Path),[StringComparison]::OrdinalIgnoreCase) })
      if($duplicates.Count -gt 1){$check.Ok=$false;$check.Reason='La destinazione compare piu volte nella configurazione.'}
      if($configFault){$check.Ok=$false;$check.Reason='Configurazione non leggibile completamente: non posso verificare le sovrapposizioni.'}
      $checkedBackups+= $check
      $prefix=if($check.Ok){'[BACKUP ELIMINABILE]'}else{'[BACKUP CONSERVATO]'}
      [void]$lines.Add($prefix)
      [void]$lines.Add($check.Path+' (ID: '+$check.Id+')')
      if($check.Ok){[void]$lines.Add(('  File: {0}, dimensione: {1} byte. TUTTO il contenuto verra eliminato.' -f $check.Files,$check.Bytes))}
      else {[void]$lines.Add('  Motivo: '+$check.Reason)}
    }
    if($backups.Count -eq 0){[void]$lines.Add('Nessuna destinazione backup registrata.')}
  }
  if($RemoveShortcuts -eq 1){
    $desktop=[Environment]::GetFolderPath('DesktopDirectory')
    $candidates=New-Object 'System.Collections.Generic.List[string]'
    if([IO.Directory]::Exists($desktop)){foreach($f in [IO.Directory]::EnumerateFiles($desktop,'*.lnk')){[void]$candidates.Add($f)}}
    foreach($f in $inventory){[void]$candidates.Add($f)}
    foreach($file in @($candidates | Sort-Object -Unique)) {
      $check=Check-Shortcut $file $installation $ids $inventoried
      $checkedLinks+= $check
      if($check.Ok){[void]$lines.Add('[COLLEGAMENTO ELIMINABILE] '+$check.Path+' (ID: '+$check.Id+')')}
      else {[void]$lines.Add('[COLLEGAMENTO CONSERVATO] '+$check.Path+' - '+$check.Reason)}
    }
    if($candidates.Count -eq 0){[void]$lines.Add('Nessun collegamento candidato nel Desktop o inventario.')}
  }
  if($RemovePreferences -eq 1){[void]$lines.Add('Impostazioni: rimozione di file e profili gestiti dopo le altre operazioni, se sicura.')}
  if(!(ShowText 'Drive Tambu - anteprima disinstallazione' ([string]::Join("`r`n",$lines)) $false)){exit 0}
  $approved=@($checkedBackups | Where-Object {$_.Ok})
  $confirmedBackup=$false
  if($RemoveBackups -eq 1 -and $approved.Count -gt 0) {
    $confirmLines=@($approved | ForEach-Object {$_.Path+' (ID: '+$_.Id+')'})
    $confirmedBackup=ShowText 'Drive Tambu - CONFERMA ELIMINAZIONE TOTALE' ([string]::Join("`r`n",$confirmLines)) $true
  }
  $report=New-Object 'System.Collections.Generic.List[string]'
  $failed=$false
  foreach($b in $checkedBackups){
    if(!$b.Ok){[void]$report.Add('[CONSERVATO] '+$b.Path+' - '+$b.Reason);$failed=$true;continue}
    if(!$confirmedBackup){[void]$report.Add('[CONSERVATO] '+$b.Path+' - cancellazione non confermata.');$failed=$true;continue}
    $quarantine=''
    try {
      $current=Get-BackupCheck $b.Path $b.Id @($backups | ForEach-Object {$_.Path}) $mounts $installation
      if(!$current.Ok -or $current.Identity -cne $b.Identity -or $current.Digest -cne $b.Digest) {throw 'La directory o il contenuto sono cambiati dopo l anteprima.'}
      $quarantine=Join-Path ([IO.Path]::GetDirectoryName($b.Path)) ('.drive-tambu-removing-'+[guid]::NewGuid().ToString('N'))
      [IO.Directory]::Move($b.Path,$quarantine) # same parent/volume; isolate path before deleting
      $after=Get-BackupCheck $quarantine $b.Id @($quarantine) $mounts $installation
      if(!$after.Ok -or $after.Identity -cne $b.Identity -or $after.Digest -cne $b.Digest) {throw 'Identita modificata durante l isolamento del backup.'}
      Remove-VerifiedTree $quarantine
      [void]$report.Add('[ELIMINATO] '+$b.Path)
    } catch {
      if($quarantine -and [IO.Directory]::Exists($quarantine) -and ![IO.Directory]::Exists($b.Path)) {
        try{[IO.Directory]::Move($quarantine,$b.Path);$quarantine=''}catch{}
      }
      $failed=$true;[void]$report.Add('[ERRORE, CONSERVARE] '+$b.Path+' - '+$_.Exception.Message+$(if($quarantine){' - residuo: '+$quarantine}else{''}))
    }
  }
  foreach($l in $checkedLinks){
    if(!$l.Ok){
      [void]$report.Add('[CONSERVATO] '+$l.Path+' - '+$l.Reason)
      # Unrelated Desktop .lnk files are expected; only an inventoried missing link holds settings back.
      if([IO.File]::Exists($l.Path) -and @($inventory | Where-Object {$_ -eq $l.Path}).Count -gt 0){$failed=$true}
      continue
    }
    try {
      $after=Check-Shortcut $l.Path $installation $ids $inventoried
      if(!$after.Ok -or $after.Identity -cne $l.Identity -or $after.Id -cne $l.Id) {throw 'Il collegamento e cambiato dopo l anteprima.'}
      [IO.File]::Delete($l.Path)
      [void]$report.Add('[ELIMINATO] '+$l.Path)
    }catch{$failed=$true;[void]$report.Add('[CONSERVATO] '+$l.Path+' - '+$_.Exception.Message)}
  }
  if($RemovePreferences -eq 1){
    if($failed) {[void]$report.Add('[CONSERVATE] Impostazioni: altre operazioni incomplete; mantengo la mappa dei backup e collegamenti.')}
    else {
      foreach($root in $roots){
        if(![IO.Directory]::Exists($root)){continue}
        try {
          [void](PathSafe $root)
          foreach($name in @('config.json','config.json.before-0.2.bak','config.json.before-0.3.bak','shortcuts-v1.json')){
            $f=Join-Path $root $name
            if([IO.File]::Exists($f)){[void](PathSafe $f);[IO.File]::Delete($f)}
          }
          $profiles=Join-Path $root 'connections-v1'
          if([IO.Directory]::Exists($profiles)){[void](PathSafe $profiles);[void](SummarizeTree $profiles);Remove-VerifiedTree $profiles}
          [void]$report.Add('[ELIMINATE] Impostazioni: '+$root)
        }catch{[void]$report.Add('[CONSERVATE] Impostazioni in '+$root+': '+$_.Exception.Message)}
      }
    }
  }
  [void](ShowText 'Drive Tambu - esito disinstallazione' ([string]::Join("`r`n",$report)) $false)
  exit 0
} catch {
  # Fail closed: if a clean snapshot cannot be made, no optional deletion proceeds.
  Add-Type -AssemblyName System.Windows.Forms
  [void][System.Windows.Forms.MessageBox]::Show('Pulizia facoltativa non eseguita: '+$_.Exception.Message,'Drive Tambu')
  exit 5
}
