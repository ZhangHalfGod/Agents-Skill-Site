/**
 * M18 H3 browser matrix — ASR/TTS evidence runner (no secrets logged)
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const WAV = path.join(OUT, 'asr-qu-tiananmen.wav')
const MP3 = path.join(OUT, 'asr-qu-tiananmen.mp3')
const lines = []
const log = (m) => {
  console.log(m)
  lines.push(m)
}

async function loginExtern(page) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
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

function redact(body) {
  return String(body || '')
    .replace(/"audioBase64"\s*:\s*"[^"]+"/g, '"audioBase64":"<redacted>"')
    .replace(/(APP_ID|ACCESS_KEY|Token|api[_-]?key)["']?\s*[:=]\s*["'][^"']+/gi, '$1=<redacted>')
    .slice(0, 600)
}

async function probeCapabilities() {
  log('\n=== E4/E5 capabilities ===')
  for (const url of [
    'http://localhost:3002/api/voice/capabilities',
    'http://localhost:3000/api/voice/capabilities',
    'http://localhost:3001/api/voice/capabilities',
  ]) {
    try {
      const r = await fetch(url)
      const j = await r.json()
      log(`${url} -> ${r.status} ${JSON.stringify(j)}`)
    } catch (e) {
      log(`${url} -> ERR ${e.message}`)
    }
  }
  // short TTS probe (redacted)
  try {
    const r = await fetch('http://localhost:3002/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '测试' }),
    })
    const t = await r.text()
    log(`POST /api/voice/tts -> ${r.status} ${redact(t)}`)
  } catch (e) {
    log(`POST /api/voice/tts -> ERR ${e.message}`)
  }
}

async function smokeTextChrome() {
  log('\n=== smoke #1 Chrome extern text ===')
  const browser = await chromium.launch({ channel: 'chrome', headless: false })
  const page = await browser.newPage()
  try {
    await loginExtern(page)
    await page.screenshot({ path: path.join(OUT, 'h3-chrome-extern-loaded.png'), fullPage: true })
    const box = page.locator('textarea').last()
    await box.fill('用五个字回答：你好')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(18000)
    const body = await page.locator('body').innerText()
    const hasAssistant = /助手|你好|您好|机械|维修|天气|问题/.test(body)
    const speakCount = await page.getByRole('button', { name: /^朗读$/ }).count()
    log(`chrome textSmoke hasReplyHint=${hasAssistant} speakButtons=${speakCount}`)
    await page.screenshot({ path: path.join(OUT, 'h3-chrome-extern-after-send.png'), fullPage: true })
  } catch (e) {
    log(`chrome textSmoke ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function ttsClick(channel, name) {
  log(`\n=== ${name} TTS click extern ===`)
  const browser = await chromium.launch({ channel, headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  const net = []
  page.on('response', async (res) => {
    if (!res.url().includes('/api/voice/')) return
    let body = ''
    try {
      body = await res.text()
    } catch {}
    net.push(`${res.status()} ${res.url()} :: ${redact(body)}`)
  })
  try {
    await loginExtern(page)
    let speak = page.getByRole('button', { name: /^朗读$/ })
    if ((await speak.count()) === 0) {
      await page.locator('textarea').last().fill('用五个字回答：朗读测试')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(20000)
      speak = page.getByRole('button', { name: /^朗读$/ })
    }
    const before = await speak.count()
    log(`${name} speakBeforeClick=${before}`)
    if (before === 0) {
      log(`${name} TTS ⏭ no speak button`)
      await page.screenshot({ path: path.join(OUT, `h3-${name}-tts-nospeak.png`), fullPage: true })
      return
    }
    await speak.last().click()
    await page.waitForTimeout(12000)
    const stopVis =
      (await page.getByRole('button', { name: /停止/ }).count()) > 0 &&
      (await page
        .getByRole('button', { name: /停止/ })
        .first()
        .isVisible()
        .catch(() => false))
    const body = await page.locator('body').innerText()
    const hints = body
      .split('\n')
      .filter((l) => /朗读|失败|成功|音频|耗时|错误|502|不可用|配置|豆包|local/.test(l))
      .slice(0, 15)
    log(`${name} stopVisible=${stopVis}`)
    log(`${name} hints=${JSON.stringify(hints)}`)
    log(`${name} net=${JSON.stringify(net)}`)
    await page.screenshot({ path: path.join(OUT, `h3-${name}-tts.png`), fullPage: true })
    if (stopVis) {
      await page.getByRole('button', { name: /停止/ }).first().click().catch(() => {})
    }
  } catch (e) {
    log(`${name} TTS ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function asrRealMicPlayAudio(channel, name) {
  log(`\n=== ${name} ASR real-mic + play wav ===`)
  const userData = path.join(OUT, `.prof-h3-${name}`)
  fs.rmSync(userData, { recursive: true, force: true })
  fs.mkdirSync(userData, { recursive: true })
  const context = await chromium.launchPersistentContext(userData, {
    channel,
    headless: false,
    permissions: ['microphone'],
    locale: 'zh-CN',
    args: ['--autoplay-policy=no-user-gesture-required'],
  })
  const page = context.pages()[0] || (await context.newPage())
  page.on('console', (m) => {
    const t = m.text()
    if (/语音|麦克|识别|asr|Speech|not-allowed|error/i.test(t)) log(`${name} CONSOLE ${m.type()}: ${t}`)
  })
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
    const ctor = await page.evaluate(
      () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    )
    log(`${name} SpeechRecognition=${ctor}`)
    const mic = page.getByRole('button', { name: /语音输入|停止语音输入/ })
    await mic.click()
    // play wav via PowerShell SoundPlayer in parallel
    const audioFile = fs.existsSync(WAV) ? WAV : MP3
    log(`${name} playAudio=${audioFile} exists=${fs.existsSync(audioFile)}`)
    let player
    if (fs.existsSync(WAV)) {
      player = spawn('powershell', [
        '-NoProfile',
        '-Command',
        `$p=New-Object System.Media.SoundPlayer '${WAV.replace(/'/g, "''")}'; $p.PlaySync()`,
      ])
    }
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(2000)
      const val = await page.locator('textarea').first().inputValue()
      const asr = await page.evaluate(() => window.__asr || [])
      const hint = await page.evaluate(() => {
        const el = document.querySelector('.text-amber-100\\/90, [class*="amber"]')
        return el ? el.textContent : ''
      })
      log(`${name} t=${(i + 1) * 2}s val="${val}" asr=${JSON.stringify(asr)} hint="${hint}"`)
      if (val.trim()) break
    }
    await page.screenshot({ path: path.join(OUT, `h3-${name}-asr.png`), fullPage: true })
    const stop = page.getByRole('button', { name: /停止语音输入/ })
    if (await stop.count()) await stop.click().catch(() => {})
    if (player) player.kill()
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
  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
    const client = await context.newCDPSession(page)
    await client.send('Browser.setPermission', {
      origin: 'http://localhost:5173',
      permission: { name: 'audioCapture' },
      setting: 'denied',
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
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
    await page.waitForTimeout(4000)
    const deny = await page.evaluate(() => window.__deny || [])
    const hint = await page.locator('body').innerText()
    const hits = hint
      .split('\n')
      .filter((l) => /麦克|权限|拒绝|不允许|不可用|失败|not-allowed|denied|语音/i.test(l))
      .slice(0, 10)
    log(`${name} denyEvents=${JSON.stringify(deny)} bodyHits=${JSON.stringify(hits)}`)
    await page.screenshot({ path: path.join(OUT, `h3-${name}-deny.png`), fullPage: true })
  } catch (e) {
    log(`${name} deny ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function main() {
  log(`time=${new Date().toISOString()}`)
  log(`wav=${fs.existsSync(WAV)} mp3=${fs.existsSync(MP3)}`)
  await probeCapabilities()
  await smokeTextChrome()
  await ttsClick('chrome', 'chrome')
  await ttsClick('msedge', 'edge')
  await asrRealMicPlayAudio('chrome', 'chrome')
  await asrRealMicPlayAudio('msedge', 'edge')
  await asrDeny('chrome', 'chrome')
  const logPath = path.join(OUT, 'm18-h3-final-log.txt')
  fs.writeFileSync(logPath, lines.join('\n'), 'utf8')
  log(`wrote ${logPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
