/**
 * Precise retest: capture /api/voice/tts response + longer real-mic ASR
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const lines = []
const log = (m) => { console.log(m); lines.push(m) }

async function login(page) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  if (!page.url().includes('/chat')) {
    const email = page.locator('input[type="email"]').first()
    if (await email.count()) {
      await email.fill('admin@life-coach.ai')
      await page.locator('input[type="password"]').first().fill('admin')
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(2000)
    }
    await page.goto('http://localhost:3000/chat', { waitUntil: 'domcontentloaded' })
  }
  await page.waitForTimeout(1000)
}

async function ttsWithNetwork(channel, name) {
  log(`\n=== ${name} TTS network ===`)
  const browser = await chromium.launch({ channel, headless: false })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const ttsHits = []
  page.on('response', async (res) => {
    if (res.url().includes('/api/voice/')) {
      let body = ''
      try { body = await res.text() } catch {}
      const slim = body.length > 400 ? body.slice(0, 400) + `...[len=${body.length}]` : body
      // redact base64
      const safe = slim.replace(/"audioBase64"\s*:\s*"[^"]+"/g, '"audioBase64":"<redacted>"')
      ttsHits.push(`${res.status()} ${res.url()} ${safe}`)
    }
  })
  try {
    await login(page)
    // click latest 朗读
    const speak = page.getByRole('button', { name: /^朗读$/ }).last()
    await speak.waitFor({ timeout: 15000 })
    await speak.click()
    await page.waitForTimeout(10000)
    const stop = page.getByRole('button', { name: /停止/ }).first()
    const stopVisible = (await stop.count()) > 0 && (await stop.isVisible().catch(() => false))
    log(`${name} stop visible after click: ${stopVisible}`)
    if (stopVisible) {
      await stop.click()
      log(`${name} stop clicked OK`)
    }
    await page.screenshot({ path: path.join(OUT, `${name}-tts-network.png`), fullPage: true })
    for (const h of ttsHits) log(`${name} NET ${h}`)
    if (!ttsHits.length) log(`${name} NET no /api/voice/* responses`)
  } catch (e) {
    log(`${name} TTS ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function asrRealMic(channel, name) {
  log(`\n=== ${name} ASR real mic (15s listen) ===`)
  const userData = path.join(OUT, `.profile-${name}-asr`)
  fs.mkdirSync(userData, { recursive: true })
  const context = await chromium.launchPersistentContext(userData, {
    channel,
    headless: false,
    viewport: { width: 1280, height: 900 },
    permissions: ['microphone'],
    args: ['--autoplay-policy=no-user-gesture-required'],
  })
  const page = context.pages()[0] || await context.newPage()
  page.on('console', (m) => log(`${name} CONSOLE [${m.type()}] ${m.text()}`))
  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    // Inject recognition event logger
    await page.evaluate(() => {
      window.__asrLog = []
      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!Ctor) { window.__asrLog.push('no-ctor'); return }
      const orig = Ctor.prototype.start
      Ctor.prototype.start = function (...args) {
        this.addEventListener('result', (e) => {
          try {
            const t = e.results?.[e.results.length - 1]?.[0]?.transcript
            window.__asrLog.push('result:' + t)
          } catch {}
        })
        this.addEventListener('error', (e) => window.__asrLog.push('error:' + e.error))
        this.addEventListener('end', () => window.__asrLog.push('end'))
        this.addEventListener('audiostart', () => window.__asrLog.push('audiostart'))
        this.addEventListener('speechstart', () => window.__asrLog.push('speechstart'))
        return orig.apply(this, args)
      }
    })

    const mic = page.getByRole('button', { name: /语音输入|停止语音输入/ })
    await mic.click()
    log(`${name} mic clicked, waiting 15s — speak now if possible`)
    await page.waitForTimeout(15000)
    const val = await page.locator('textarea').first().inputValue()
    const asrLog = await page.evaluate(() => window.__asrLog || [])
    log(`${name} textarea="${val}"`)
    log(`${name} asrLog=${JSON.stringify(asrLog)}`)
    await page.screenshot({ path: path.join(OUT, `${name}-asr-real.png`), fullPage: true })
    // stop
    const stop = page.getByRole('button', { name: /停止语音输入/ })
    if (await stop.count()) await stop.click().catch(() => {})
  } catch (e) {
    log(`${name} ASR ERR ${e.message}`)
  } finally {
    await context.close()
  }
}

async function asrDenyFriendly(channel, name) {
  log(`\n=== ${name} ASR deny permission ===`)
  const browser = await chromium.launch({ channel, headless: false })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  // Explicitly deny mic for origin before navigation
  await context.grantPermissions([], { origin: 'http://localhost:5173' })
  const page = await context.newPage()
  const client = await context.newCDPSession(page)
  await client.send('Browser.setPermission', {
    permission: { name: 'audioCapture' },
    setting: 'denied',
    origin: 'http://localhost:5173',
  })
  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    const mic = page.getByRole('button', { name: /语音输入|停止语音输入/ })
    await mic.click()
    await page.waitForTimeout(3000)
    const body = await page.locator('body').innerText()
    const toastish = body.split('\n').filter((l) => /麦克|权限|拒绝|不允许|不可用|错误/.test(l)).slice(0, 10)
    log(`${name} deny hints: ${JSON.stringify(toastish)}`)
    // also check title on mic
    const title = await mic.getAttribute('title')
    log(`${name} mic title after deny click: ${title}`)
    await page.screenshot({ path: path.join(OUT, `${name}-asr-deny2.png`), fullPage: true })
  } catch (e) {
    log(`${name} deny ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function main() {
  await ttsWithNetwork('chrome', 'chrome')
  await ttsWithNetwork('msedge', 'edge')
  await asrRealMic('chrome', 'chrome')
  await asrRealMic('msedge', 'edge')
  await asrDenyFriendly('chrome', 'chrome')
  fs.writeFileSync(path.join(OUT, 'm18-retest-precise-log.txt'), lines.join('\n'), 'utf8')
  log('done')
}

main().catch((e) => { console.error(e); process.exit(1) })
