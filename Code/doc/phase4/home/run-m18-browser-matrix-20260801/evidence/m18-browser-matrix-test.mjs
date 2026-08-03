/**
 * M18 browser matrix — Win Chrome/Edge ASR+TTS smoke (H3)
 * Evidence only; does not modify MechAssist-Fusion business code.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const ASR_AUDIO = path.join(OUT, 'asr-qu-tiananmen.mp3')
const results = []

function log(msg) {
  console.log(msg)
  results.push(msg)
}

async function shot(page, name) {
  const p = path.join(OUT, name)
  await page.screenshot({ path: p, fullPage: true })
  log(`SCREENSHOT ${p}`)
  return p
}

async function loginExtern(page) {
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(800)
  // already logged in?
  if (page.url().includes('/chat')) return
  const email = page.locator('input[type="email"], input[name="email"]').first()
  const pass = page.locator('input[type="password"], input[name="password"]').first()
  if (await email.count()) {
    await email.fill('admin@life-coach.ai')
    await pass.fill('admin')
    await page.locator('button[type="submit"]').first().click()
    await page.waitForURL(/\/chat|\/dashboard/, { timeout: 20000 }).catch(() => {})
  }
  if (!page.url().includes('/chat')) {
    await page.goto('http://localhost:3000/chat', { waitUntil: 'domcontentloaded', timeout: 30000 })
  }
  await page.waitForTimeout(1000)
}

async function testExternChatAndTts(browserName, channel) {
  log(`\n=== ${browserName} extern-api /chat TTS ===`)
  const context = await chromium.launchPersistentContext('', {
    channel,
    headless: false,
    args: [
      '--use-fake-ui-for-media-stream',
      `--use-file-for-fake-audio-capture=${ASR_AUDIO}`,
      '--autoplay-policy=no-user-gesture-required',
    ],
    viewport: { width: 1280, height: 900 },
  })
  const page = context.pages()[0] || (await context.newPage())
  const consoleMsgs = []
  page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`))
  const toasts = []

  try {
    await loginExtern(page)
    await shot(page, `${browserName}-extern-chat-loaded.png`)

    // Smoke #1: send text
    const input = page.locator('textarea, input[type="text"]').last()
    await input.waitFor({ timeout: 15000 })
    await input.fill('你好，请用一句话介绍你自己')
    // find send button
    const sendBtn = page.getByRole('button', { name: /发送|Send/i }).first()
    if (await sendBtn.count()) {
      await sendBtn.click()
    } else {
      await input.press('Enter')
    }
    await page.waitForTimeout(12000)
    await shot(page, `${browserName}-extern-after-send.png`)

    // Look for 朗读 button
    const speakBtn = page.getByRole('button', { name: /朗读/ }).first()
    const speakVisible = (await speakBtn.count()) > 0 && (await speakBtn.isVisible().catch(() => false))
    log(`${browserName} TTS button visible: ${speakVisible}`)

    if (speakVisible) {
      await speakBtn.click()
      await page.waitForTimeout(8000)
      await shot(page, `${browserName}-extern-after-tts-click.png`)
      // stop if available
      const stopBtn = page.getByRole('button', { name: /停止/ }).first()
      if ((await stopBtn.count()) && (await stopBtn.isVisible().catch(() => false))) {
        await stopBtn.click()
        log(`${browserName} TTS stop clicked`)
        await page.waitForTimeout(500)
      }
    } else {
      log(`${browserName} TTS: no 朗读 button (capabilities may hide it or provider failed)`)
    }

    // Check toast / body text for errors
    const bodyText = await page.locator('body').innerText()
    const errHints = ['朗读失败', '音频播放失败', '失败', '错误', '不可用']
    const hit = errHints.filter((h) => bodyText.includes(h))
    log(`${browserName} body error hints: ${hit.join('|') || 'none'}`)
    log(`${browserName} console sample: ${consoleMsgs.slice(-8).join(' | ')}`)

    // ASR probe on extern: mic button?
    const mic = page.getByRole('button', { name: /语音|麦克|mic/i })
    const micCount = await mic.count()
    log(`${browserName} extern ASR mic buttons: ${micCount}`)
  } catch (e) {
    log(`${browserName} extern ERROR: ${e.message}`)
    await shot(page, `${browserName}-extern-error.png`).catch(() => {})
  } finally {
    await context.close()
  }
}

async function testMcpGaodeAsr(browserName, channel, denyMic = false) {
  log(`\n=== ${browserName} mcp-gaode /chat ASR ${denyMic ? '(deny mic)' : ''} ===`)
  const args = [
    '--autoplay-policy=no-user-gesture-required',
  ]
  if (!denyMic) {
    args.push('--use-fake-ui-for-media-stream')
    if (fs.existsSync(ASR_AUDIO)) {
      args.push(`--use-file-for-fake-audio-capture=${ASR_AUDIO}`)
    }
  }

  const context = await chromium.launchPersistentContext('', {
    channel,
    headless: false,
    args,
    viewport: { width: 1280, height: 900 },
    permissions: denyMic ? [] : ['microphone'],
  })
  const page = context.pages()[0] || (await context.newPage())
  if (denyMic) {
    await context.clearPermissions()
    // Force deny via CDP
    const client = await context.newCDPSession(page)
    await client.send('Browser.setPermission', {
      origin: 'http://localhost:5173',
      permission: { name: 'audioCapture' },
      setting: 'denied',
    }).catch(() => {})
  }

  try {
    await page.goto('http://localhost:5173/chat', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(1500)
    await shot(page, `${browserName}-gaode-chat${denyMic ? '-deny' : ''}.png`)

    // Probe SpeechRecognition support
    const support = await page.evaluate(() => {
      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
      return {
        hasCtor: !!Ctor,
        ua: navigator.userAgent,
      }
    })
    log(`${browserName} SpeechRecognition ctor: ${support.hasCtor}`)

    const micBtn = page.getByRole('button', { name: /语音输入|停止语音输入/ })
    await micBtn.waitFor({ timeout: 10000 })
    const disabled = await micBtn.isDisabled()
    log(`${browserName} mic disabled: ${disabled}`)

    if (!disabled) {
      await micBtn.click()
      await page.waitForTimeout(denyMic ? 2500 : 6000)
      await shot(page, `${browserName}-gaode-after-mic${denyMic ? '-deny' : ''}.png`)

      const textarea = page.locator('textarea').first()
      const val = await textarea.inputValue().catch(() => '')
      log(`${browserName} input after mic: "${val.slice(0, 80)}"`)

      // toast / alert text
      const body = await page.locator('body').innerText()
      const permHints = ['权限', '麦克风', '拒绝', '不允许', 'not-allowed', 'denied']
      const hits = permHints.filter((h) => body.toLowerCase().includes(h.toLowerCase()))
      log(`${browserName} permission/body hints: ${hits.join('|') || 'none'}`)

      // stop if still listening
      if (!denyMic) {
        const stop = page.getByRole('button', { name: /停止语音输入/ })
        if (await stop.count()) await stop.click().catch(() => {})
      }
    } else {
      const title = await micBtn.getAttribute('title')
      log(`${browserName} mic title: ${title}`)
    }
  } catch (e) {
    log(`${browserName} gaode ASR ERROR: ${e.message}`)
    await shot(page, `${browserName}-gaode-error${denyMic ? '-deny' : ''}.png`).catch(() => {})
  } finally {
    await context.close()
  }
}

async function main() {
  log(`ASR audio exists: ${fs.existsSync(ASR_AUDIO)}`)
  // Layer1 Chrome
  await testExternChatAndTts('chrome', 'chrome')
  await testMcpGaodeAsr('chrome', 'chrome', false)
  await testMcpGaodeAsr('chrome', 'chrome', true)
  // Layer2 Edge
  await testExternChatAndTts('edge', 'msedge')
  await testMcpGaodeAsr('edge', 'msedge', false)

  const reportPath = path.join(OUT, 'm18-browser-matrix-runlog.txt')
  fs.writeFileSync(reportPath, results.join('\n'), 'utf8')
  console.log(`\nWrote ${reportPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
