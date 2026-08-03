import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const WAV = path.join(OUT, 'asr-qu-tiananmen.wav')
const lines = []
const log = (m) => { console.log(m); lines.push(m) }

async function login(page) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  if (!page.url().includes('/chat')) {
    if (await page.locator('input[type="email"]').count()) {
      await page.locator('input[type="email"]').fill('admin@life-coach.ai')
      await page.locator('input[type="password"]').fill('admin')
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(2000)
    }
    await page.goto('http://localhost:3000/chat', { waitUntil: 'domcontentloaded' })
  }
  await page.waitForTimeout(800)
}

async function ttsNet(channel, name) {
  log(`\n=== ${name} TTS ===`)
  const browser = await chromium.launch({ channel, headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on('response', async (res) => {
    if (!res.url().includes('/api/voice/')) return
    let body = ''
    try { body = await res.text() } catch {}
    const safe = body.replace(/"audioBase64"\s*:\s*"[^"]+"/g, '"audioBase64":"<redacted>"').slice(0, 500)
    log(`${name} NET ${res.status()} ${res.url()} :: ${safe}`)
  })
  try {
    await login(page)
    // ensure there is assistant message; if not send
    let speak = page.getByRole('button', { name: /^朗读$/ })
    if ((await speak.count()) === 0) {
      const box = page.locator('textarea').last()
      await box.fill('用五个字回答：今天天气')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(15000)
      speak = page.getByRole('button', { name: /^朗读$/ })
    }
    await speak.last().click()
    await page.waitForTimeout(12000)
    const stop = page.getByRole('button', { name: /停止/ })
    const stopVis = (await stop.count()) > 0 && await stop.first().isVisible().catch(() => false)
    log(`${name} stopVisible=${stopVis}`)
    if (stopVis) await stop.first().click()
    // toast area
    const body = await page.locator('body').innerText()
    const hints = body.split('\n').filter((l) => /朗读|失败|成功|保存|音频|耗时|错误|502|不可用/.test(l)).slice(0, 12)
    log(`${name} hints=${JSON.stringify(hints)}`)
    await page.screenshot({ path: path.join(OUT, `${name}-tts2.png`), fullPage: true })
  } catch (e) {
    log(`${name} TTS ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function asrFakeWav(channel, name) {
  log(`\n=== ${name} ASR fake wav ===`)
  const userData = path.join(OUT, `.prof-${name}`)
  fs.rmSync(userData, { recursive: true, force: true })
  fs.mkdirSync(userData, { recursive: true })
  const context = await chromium.launchPersistentContext(userData, {
    channel,
    headless: false,
    permissions: ['microphone'],
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      `--use-file-for-fake-audio-capture=${WAV}`,
      '--autoplay-policy=no-user-gesture-required',
      '--disable-features=AudioServiceOutOfProcess',
    ],
    locale: 'zh-CN',
  })
  const page = context.pages()[0] || await context.newPage()
  page.on('console', (m) => log(`${name} CONSOLE ${m.type()}: ${m.text()}`))
  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1200)
    await page.evaluate(() => {
      window.__asr = []
      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!Ctor) return
      const start = Ctor.prototype.start
      Ctor.prototype.start = function (...a) {
        ;['audiostart', 'soundstart', 'speechstart', 'result', 'error', 'end', 'nomatch'].forEach((ev) => {
          this.addEventListener(ev, (e) => {
            if (ev === 'result') {
              const t = e.results?.[e.results.length - 1]?.[0]?.transcript
              window.__asr.push(`result:${t}`)
            } else if (ev === 'error') window.__asr.push(`error:${e.error}`)
            else window.__asr.push(ev)
          })
        })
        this.lang = 'zh-CN'
        return start.apply(this, a)
      }
    })
    const mic = page.getByRole('button', { name: /语音输入|停止语音输入/ })
    await mic.click()
    // wait longer; fake wav is ~1.6s, may need multiple cycles
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(2500)
      const val = await page.locator('textarea').first().inputValue()
      const asr = await page.evaluate(() => window.__asr || [])
      log(`${name} t=${(i + 1) * 2.5}s val="${val}" asr=${JSON.stringify(asr)}`)
      if (val.trim()) break
    }
    await page.screenshot({ path: path.join(OUT, `${name}-asr2.png`), fullPage: true })
    const stop = page.getByRole('button', { name: /停止语音输入/ })
    if (await stop.count()) await stop.click().catch(() => {})
  } catch (e) {
    log(`${name} ASR ERR ${e.message}`)
  } finally {
    await context.close()
  }
}

async function asrDeny(channel, name) {
  log(`\n=== ${name} ASR deny ===`)
  const browser = await chromium.launch({ channel, headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  const client = await context.newCDPSession(page)
  await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
  await client.send('Browser.setPermission', {
    origin: 'http://localhost:5173',
    permission: { name: 'audioCapture' },
    setting: 'denied',
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  // Hook recognition error
  await page.evaluate(() => {
    window.__deny = []
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Ctor) return
    const start = Ctor.prototype.start
    Ctor.prototype.start = function (...a) {
      this.addEventListener('error', (e) => window.__deny.push(e.error))
      return start.apply(this, a)
    }
  })
  await page.getByRole('button', { name: /语音输入/ }).click()
  await page.waitForTimeout(3500)
  const deny = await page.evaluate(() => window.__deny || [])
  const body = await page.locator('body').innerText()
  const linesBody = body.split('\n').filter((l) => /麦克|权限|拒绝|不允许|不可用|失败|not-allowed|denied/i.test(l))
  log(`${name} denyEvents=${JSON.stringify(deny)} bodyHits=${JSON.stringify(linesBody.slice(0, 8))}`)
  await page.screenshot({ path: path.join(OUT, `${name}-deny3.png`), fullPage: true })
  await browser.close()
}

async function main() {
  log(`wav exists=${fs.existsSync(WAV)}`)
  await ttsNet('chrome', 'chrome')
  await ttsNet('msedge', 'edge')
  await asrFakeWav('chrome', 'chrome')
  await asrFakeWav('msedge', 'edge')
  await asrDeny('chrome', 'chrome')
  fs.writeFileSync(path.join(OUT, 'm18-retest2-log.txt'), lines.join('\n'), 'utf8')
}

main().catch((e) => { console.error(e); process.exit(1) })
