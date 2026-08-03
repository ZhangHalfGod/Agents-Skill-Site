/**
 * Retry: fake-device ASR, SAPI speak, mic-deny, TTS net capture
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn, spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const WAV = path.join(OUT, 'asr-qu-tiananmen.wav')
const lines = []
const log = (m) => {
  console.log(m)
  lines.push(m)
}

function redact(body) {
  return String(body || '')
    .replace(/"audioBase64"\s*:\s*"[^"]+"/g, '"audioBase64":"<redacted>"')
    .slice(0, 500)
}

async function loginExtern(page) {
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
  await page.waitForTimeout(600)
}

async function ttsWithNet(channel, name) {
  log(`\n=== ${name} TTS net ===`)
  const browser = await chromium.launch({ channel, headless: false })
  const page = await browser.newPage()
  const ttsHits = []
  page.on('response', async (res) => {
    if (!/\/api\/voice\/tts/.test(res.url())) return
    let body = ''
    try {
      body = await res.text()
    } catch {}
    ttsHits.push(`${res.status()} ${redact(body)}`)
  })
  try {
    await loginExtern(page)
    let speak = page.getByRole('button', { name: /^朗读$/ })
    if ((await speak.count()) === 0) {
      await page.locator('textarea').last().fill('用五个字回答：天气')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(20000)
      speak = page.getByRole('button', { name: /^朗读$/ })
    }
    // wait for tts response after click
    const waitTts = page.waitForResponse((r) => /\/api\/voice\/tts/.test(r.url()), { timeout: 30000 }).catch(() => null)
    await speak.last().click()
    const resp = await waitTts
    if (resp) {
      const body = redact(await resp.text().catch(() => ''))
      log(`${name} ttsStatus=${resp.status()} body=${body}`)
    } else {
      log(`${name} ttsResponse=timeout`)
    }
    await page.waitForTimeout(3000)
    const stopVis =
      (await page.getByRole('button', { name: /停止/ }).count()) > 0 &&
      (await page.getByRole('button', { name: /停止/ }).first().isVisible().catch(() => false))
    const bodyText = await page.locator('body').innerText()
    const hints = bodyText
      .split('\n')
      .filter((l) => /朗读|失败|成功|音频|耗时|错误|502|不可用|toast/i.test(l))
      .slice(0, 12)
    log(`${name} stopVisible=${stopVis} hints=${JSON.stringify(hints)} hits=${JSON.stringify(ttsHits)}`)
    await page.screenshot({ path: path.join(OUT, `h3-${name}-tts-retry.png`), fullPage: true })
    if (stopVis) await page.getByRole('button', { name: /停止/ }).first().click().catch(() => {})
  } catch (e) {
    log(`${name} TTS ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function asrFakeFile(channel, name) {
  log(`\n=== ${name} ASR fake-file ===`)
  const userData = path.join(OUT, `.prof-fake-${name}`)
  fs.rmSync(userData, { recursive: true, force: true })
  fs.mkdirSync(userData, { recursive: true })
  // Chromium expects absolute path with forward slashes sometimes
  const wavArg = WAV.replace(/\\/g, '/')
  const context = await chromium.launchPersistentContext(userData, {
    channel,
    headless: false,
    permissions: ['microphone'],
    locale: 'zh-CN',
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      `--use-file-for-fake-audio-capture=${wavArg}`,
      '--autoplay-policy=no-user-gesture-required',
      '--disable-features=AudioServiceOutOfProcess,WebRtcAllowInputVolumeAdjustment',
    ],
  })
  const page = context.pages()[0] || (await context.newPage())
  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
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
        this.continuous = true
        this.interimResults = true
        return start.apply(this, a)
      }
    })
    await page.getByRole('button', { name: /语音输入/ }).click()
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(2000)
      const val = await page.locator('textarea').first().inputValue()
      const asr = await page.evaluate(() => window.__asr || [])
      const hintEl = await page.locator('text=未检测到语音').count()
      const hint2 = await page.locator('text=麦克风权限').count()
      log(`${name} t=${(i + 1) * 2}s val="${val}" asr=${JSON.stringify(asr)} noSpeechHint=${hintEl} micDenyHint=${hint2}`)
      if (val.trim()) break
    }
    await page.screenshot({ path: path.join(OUT, `h3-${name}-asr-fake.png`), fullPage: true })
  } catch (e) {
    log(`${name} ASR fake ERR ${e.message}`)
  } finally {
    await context.close()
  }
}

async function asrWithSapi(channel, name) {
  log(`\n=== ${name} ASR + SAPI ===`)
  const userData = path.join(OUT, `.prof-sapi-${name}`)
  fs.rmSync(userData, { recursive: true, force: true })
  fs.mkdirSync(userData, { recursive: true })
  const context = await chromium.launchPersistentContext(userData, {
    channel,
    headless: false,
    permissions: ['microphone'],
    locale: 'zh-CN',
  })
  const page = context.pages()[0] || (await context.newPage())
  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
    await page.evaluate(() => {
      window.__asr = []
      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!Ctor) return
      const start = Ctor.prototype.start
      Ctor.prototype.start = function (...a) {
        ;['result', 'error', 'end', 'audiostart', 'speechstart'].forEach((ev) => {
          this.addEventListener(ev, (e) => {
            if (ev === 'result') window.__asr.push(`result:${e.results?.[e.results.length - 1]?.[0]?.transcript}`)
            else if (ev === 'error') window.__asr.push(`error:${e.error}`)
            else window.__asr.push(ev)
          })
        })
        this.lang = 'zh-CN'
        return start.apply(this, a)
      }
    })
    await page.getByRole('button', { name: /语音输入/ }).click()
    await page.waitForTimeout(800)
    // Speak Chinese via SAPI (system speakers -> hopefully mic)
    const ps = `
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.Rate = -2
$s.Volume = 100
$s.Speak('去天安门')
Start-Sleep -Milliseconds 400
$s.Speak('去天安门')
`
    spawnSync('powershell', ['-NoProfile', '-Command', ps], { timeout: 20000 })
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(1500)
      const val = await page.locator('textarea').first().inputValue()
      const asr = await page.evaluate(() => window.__asr || [])
      log(`${name} t=${(i + 1) * 1.5}s val="${val}" asr=${JSON.stringify(asr)}`)
      if (val.trim()) break
    }
    const body = await page.locator('body').innerText()
    const hits = body.split('\n').filter((l) => /语音|麦克|未检测|权限/.test(l)).slice(0, 8)
    log(`${name} bodyHits=${JSON.stringify(hits)}`)
    await page.screenshot({ path: path.join(OUT, `h3-${name}-asr-sapi.png`), fullPage: true })
  } catch (e) {
    log(`${name} ASR SAPI ERR ${e.message}`)
  } finally {
    await context.close()
  }
}

async function asrDeny(name = 'chrome') {
  log(`\n=== ${name} ASR deny mic ===`)
  const browser = await chromium.launch({ channel: 'chrome', headless: false })
  const context = await browser.newContext({ locale: 'zh-CN' })
  const page = await context.newPage()
  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded' })
    const client = await context.newCDPSession(page)
    // try both permission names
    for (const perm of ['microphone', 'audioCapture']) {
      try {
        await client.send('Browser.setPermission', {
          origin: 'http://localhost:5173',
          permission: { name: perm },
          setting: 'denied',
        })
        log(`${name} setPermission ${perm}=ok`)
      } catch (e) {
        log(`${name} setPermission ${perm}=fail ${e.message}`)
      }
    }
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
    const body = await page.locator('body').innerText()
    const hits = body
      .split('\n')
      .filter((l) => /麦克|权限|拒绝|不允许|不可用|失败|not-allowed|语音|未检测/i.test(l))
      .slice(0, 10)
    log(`${name} denyEvents=${JSON.stringify(deny)} hits=${JSON.stringify(hits)}`)
    await page.screenshot({ path: path.join(OUT, 'h3-chrome-deny-retry.png'), fullPage: true })
  } catch (e) {
    log(`${name} deny ERR ${e.message}`)
  } finally {
    await browser.close()
  }
}

async function main() {
  log(`time=${new Date().toISOString()}`)
  await ttsWithNet('chrome', 'chrome')
  await ttsWithNet('msedge', 'edge')
  await asrFakeFile('chrome', 'chrome')
  await asrFakeFile('msedge', 'edge')
  await asrWithSapi('chrome', 'chrome')
  await asrDeny('chrome')
  fs.writeFileSync(path.join(OUT, 'm18-h3-retry-log.txt'), lines.join('\n'), 'utf8')
  log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
