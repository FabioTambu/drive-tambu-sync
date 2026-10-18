import http from 'node:http'
import net from 'node:net'
import { randomBytes } from 'node:crypto'

export type ControlMethod = 'core/pid' | 'core/version' | 'core/stats' | 'core/quit' | 'vfs/stats' | 'vfs/queue'
  | 'mount/types' | 'mount/mount' | 'mount/unmount' | 'mount/listmounts'
const METHODS = new Set<ControlMethod>(['core/pid','core/version','core/stats','core/quit','vfs/stats','vfs/queue','mount/types','mount/mount','mount/unmount','mount/listmounts'])

/** Private to the main process. No arbitrary URL, no renderer RPC proxy, no redirects. */
export class ControlClient {
  constructor(readonly port: number, private readonly secret: string) {
    if (!Number.isInteger(port) || port < 1 || port > 65535 || !secret) throw new Error('Controllo locale non valido.')
  }
  call(method: ControlMethod, parameters: Record<string, unknown> = {}, timeoutMs = 4000): Promise<Record<string, unknown>> {
    if (!METHODS.has(method)) return Promise.reject(new Error('Comando di controllo non consentito.'))
    const body = JSON.stringify(parameters)
    return new Promise((resolve, reject) => {
      let done = false
      const finish = (error?: Error, value?: Record<string, unknown>): void => {
        if (done) return
        done = true; clearTimeout(timer)
        error ? reject(error) : resolve(value!)
      }
      const request = http.request({hostname:'127.0.0.1', port:this.port, path:`/${method}`, method:'POST', agent:false,
        headers:{Authorization:`Basic ${Buffer.from(`drive-tambu:${this.secret}`).toString('base64')}`, 'Content-Type':'application/json', 'Content-Length':Buffer.byteLength(body)}}, response => {
        let text = '', size = 0
        response.setEncoding('utf8')
        response.on('data', (data: string) => {
          size += Buffer.byteLength(data)
          if (size > 2 * 1024 * 1024) { finish(new Error('Risposta del controllo troppo grande.')); response.destroy(); request.destroy(); return }
          text += data
        })
        response.on('error', () => finish(new Error('Risposta del controllo interrotta.')))
        response.on('end', () => {
          // Backend error bodies can contain paths, parameters and credentials. Never forward them.
          if (response.statusCode !== 200) { finish(new Error(`Il controllo ${method} non e riuscito (HTTP ${response.statusCode}).`)); return }
          try {
            const value: unknown = JSON.parse(text)
            if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error()
            finish(undefined, value as Record<string, unknown>)
          } catch { finish(new Error('Il componente ha restituito una risposta non valida.')) }
        })
      })
      const timer = setTimeout(() => { finish(new Error('Il controllo locale non ha risposto in tempo.')); request.destroy() }, timeoutMs)
      request.on('error', () => finish(new Error('Il componente di collegamento non risponde.')))
      request.end(body)
    })
  }
}
export async function createControl(): Promise<{client:ControlClient; env:NodeJS.ProcessEnv; secret:string}> {
  const port = await new Promise<number>((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') { server.close(); reject(new Error('Porta locale non disponibile.')); return }
      server.close(error => error ? reject(error) : resolve(address.port))
    })
  })
  const secret = randomBytes(32).toString('hex')
  // Do not inherit flags that could expose RC, serve files or launch a web GUI.
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^RCLONE_RC_/i.test(k)))
  return {client:new ControlClient(port,secret), secret, env:{...env,RCLONE_RC_USER:'drive-tambu',RCLONE_RC_PASS:secret}}
}
