import { existsSync, readFileSync, accessSync, constants } from 'node:fs'
import path from 'node:path'
import type { ComponentId, SetupComponent, SetupReport } from '../shared/setup'
import { compatibleRclone, resolveTool, runtimeVendorDirectory, selectRclone } from './runtime-tools'
import { runSetupTool, type ToolRunner } from './setup-process'

export const WINFSP_SHA256 = '073a70e00f77423e34bed98b86e600def93393ba5822204fac57a29324db9f7a'
function supportedDebian(text: string): boolean {
  const id = /^ID=["']?([^\s"']+)/m.exec(text)?.[1]
  return ['debian', 'ubuntu', 'linuxmint'].includes(id ?? '')
}
export function linuxInstallPlan(osRelease: string, missing: string[]): {executable: string; args: string[]} {
  if (!supportedDebian(osRelease)) throw new Error('Installazione automatica non supportata su questa distribuzione. Installa OpenSSH e FUSE tramite il gestore di pacchetti del sistema.')
  if (!missing.length || missing.some(id => !['ssh', 'filesystem'].includes(id))) throw new Error('Componente non installabile tramite il gestore di sistema.')
  const packages = [missing.includes('filesystem') ? 'fuse3' : '', missing.includes('ssh') ? 'openssh-client' : ''].filter(Boolean)
  return {executable: '/usr/bin/pkexec', args: ['/usr/bin/apt-get', '--assume-yes', '--no-remove', 'install', ...packages]}
}
function psString(value: string): string {
  if (/[\r\n\0]/.test(value)) throw new Error('Percorso del componente non valido.')
  return "'" + value.replace(/'/g, "''") + "'"
}
export function windowsInstallScript(missing: string[], msi: string): string {
  if (!missing.length || missing.some(id => !['ssh', 'filesystem'].includes(id))) throw new Error('Componente non installabile.')
  // This program is fixed by main, never supplied by IPC. Verify the MSI again AFTER elevation.
  return `$ErrorActionPreference = 'Stop'; $restart = $false; $payloadLock = $null; try {\n` +
    (missing.includes('ssh') ? `$r = Add-WindowsCapability -Online -Name 'OpenSSH.Client~~~~0.0.1.0'; if ($r.RestartNeeded) { $restart = $true };\n` : '') +
    (missing.includes('filesystem') ? `$msi = ${psString(msi)}; $payloadLock = [System.IO.File]::Open($msi, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read); if ((Get-FileHash -LiteralPath $msi -Algorithm SHA256).Hash.ToLowerInvariant() -ne '${WINFSP_SHA256}') { throw 'Integrita installer WinFsp non verificata' };\n` +
      `if ((Get-AuthenticodeSignature -LiteralPath $msi).Status -ne 'Valid') { throw 'Firma installer WinFsp non valida' };\n` +
      `$p = Start-Process -FilePath "$env:SystemRoot\\System32\\msiexec.exe" -ArgumentList @('/i', ('"' + $msi + '"'), '/passive', '/norestart') -Wait -PassThru;\n` +
      `if ($p.ExitCode -eq 3010 -or $p.ExitCode -eq 1641) { $restart = $true } elseif ($p.ExitCode -ne 0) { exit $p.ExitCode };\n` : '') +
    `if ($restart) { exit 3010 }; exit 0\n} catch { Write-Error $_; exit 1 } finally { if ($payloadLock) { $payloadLock.Dispose() } }`
}
export interface DependencyEnvironment {
  platform: string
  run: ToolRunner
  exists: (file: string) => boolean
  osRelease: () => string
  fuseAccessible: () => boolean
}
const system: DependencyEnvironment = {
  platform: process.platform, run: runSetupTool, exists: existsSync,
  osRelease: () => { try { return readFileSync('/etc/os-release','utf8') } catch { return '' } },
  fuseAccessible: () => { try { accessSync('/dev/fuse', constants.R_OK | constants.W_OK); return true } catch { return false } }
}
export async function inspectComponents(rclone: string, env: DependencyEnvironment = system): Promise<SetupReport> {
  const components: SetupComponent[] = []
  async function executable(id: ComponentId, name: string, binary: string, args: string[], optional = false): Promise<void> {
    try {
      const r = await env.run(binary, args, {timeoutMs: 9000})
      const version = (r.stdout || r.stderr).trim().split('\n')[0]
      const old = id === 'rclone' && r.code === 0 && !compatibleRclone(version)
      components.push({id, name, optional, state: old ? 'incompatible' : r.code === 0 ? 'ready' : 'error',
        detail: old ? `${version || 'Versione sconosciuta'}. Serve rclone 1.64.0 o successivo; usa quello incluso nell'app.` : r.code === 0 ? version : `${name} non risponde correttamente.`, installable: false})
    } catch { components.push({id, name, optional, state:'missing', detail:`${name} non trovato.`, installable: false}) }
  }
  await executable('rclone','rclone',selectRclone(rclone),['version'])
  await executable('ssh','OpenSSH',resolveTool('ssh'),['-V'])
  await executable('cloudflared','Cloudflare Tunnel',resolveTool('cloudflared'),['--version'],true)
  let fsReady = false, fsPackage = false
  if (env.platform === 'linux') {
    try { fsPackage = (await env.run('/usr/bin/fusermount3',['--version'],{timeoutMs:9000})).code === 0 } catch { /* missing */ }
    fsReady = fsPackage && env.fuseAccessible()
  } else if (env.platform === 'win32') {
    for (const key of ['HKLM\\SOFTWARE\\WOW6432Node\\WinFsp','HKLM\\SOFTWARE\\WinFsp']) {
      try {
        const r = await env.run(path.join(process.env.SystemRoot || 'C:\\Windows','System32','reg.exe'),['query',key,'/v','InstallDir'],{timeoutMs:9000})
        const dir = /InstallDir\s+REG_SZ\s+(.+)/i.exec(r.stdout)?.[1].trim()
        if (r.code === 0 && dir && env.exists(path.win32.join(dir,'bin','winfsp-x64.dll'))) fsReady = true
      } catch { /* other registry view */ }
    }
  }
  components.push({id:'filesystem',name:env.platform === 'win32' ? 'WinFsp' : 'FUSE 3',state:fsReady?'ready':fsPackage?'error':'missing',
    detail:fsReady?'Componente rilevato. Il montaggio sara verificato al collegamento.':fsPackage?'FUSE e installato ma /dev/fuse non e accessibile. Verifica i permessi o riavvia il computer.':'Componente di montaggio non trovato.',installable:false})
  const supported = env.platform === 'win32' || (env.platform === 'linux' && supportedDebian(env.osRelease()) && env.exists('/usr/bin/pkexec') && env.exists('/usr/bin/apt-get'))
  for (const c of components) c.installable = supported && ['ssh','filesystem'].includes(c.id) && c.state === 'missing'
  return {platform:env.platform, components, canInstall:components.some(c=>c.installable), installationNote:
    supported ? 'Verranno installati solo i componenti mancanti. Il sistema chiedera la tua autorizzazione; Drive Tambu non raccoglie password amministrative.' :
      'Installazione automatica disponibile su Windows e su Mint, Ubuntu e Debian con pkexec. Su altre distribuzioni usa il gestore pacchetti per OpenSSH e FUSE.'}
}
export async function installComponents(rclone: string, env: DependencyEnvironment = system): Promise<SetupReport> {
  const before = await inspectComponents(rclone,env)
  const missing = before.components.filter(c=>c.installable).map(c=>c.id)
  if (!missing.length) return before
  let result
  if (env.platform === 'linux') {
    const plan = linuxInstallPlan(env.osRelease(),missing)
    // A privileged package manager must never be killed on an application timeout.
    result = await env.run(plan.executable,plan.args,{timeoutMs:0,discardOutput:true})
  } else if (env.platform === 'win32') {
    const vendor = runtimeVendorDirectory()
    if (missing.includes('filesystem') && (!vendor || !env.exists(path.join(vendor,'winfsp.msi')))) throw new Error('Installer WinFsp non incluso. Reinstalla il pacchetto completo di Drive Tambu.')
    const inner = Buffer.from(windowsInstallScript(missing,path.join(vendor || '', 'winfsp.msi')),'utf16le').toString('base64')
    const outer = `$ErrorActionPreference='Stop'; try { $p=Start-Process -FilePath "$PSHOME\\powershell.exe" -ArgumentList @('-NoProfile','-NonInteractive','-EncodedCommand','${inner}') -Verb RunAs -Wait -PassThru; exit $p.ExitCode } catch { exit 1 }`
    result = await env.run(path.join(process.env.SystemRoot || 'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'),
      ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(outer,'utf16le').toString('base64')],{timeoutMs:0,discardOutput:true})
  } else throw new Error('Installazione automatica non supportata.')
  if (![0,3010,1641].includes(result.code)) throw new Error('Installazione annullata o non riuscita. Controlla la finestra del sistema, la rete e che non siano in corso altri aggiornamenti. Nessun componente e stato forzato.')
  const after = await inspectComponents(rclone,env)
  after.restartRequired = [3010,1641].includes(result.code)
  return after // never turn a zero exit code into a fabricated green check
}
