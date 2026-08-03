import { chromium } from "playwright"
import fs from "fs"
import path from "path"
const OUT = process.cwd()
const log = []
const L = (m)=>{console.log(m); log.push(m)}
function redact(s){return String(s||"").replace(/"audioBase64"\s*:\s*"[^"]+"/g,'"audioBase64":"<redacted>"').slice(0,400)}

async function login(page){
  await page.goto("http://localhost:3000/login",{waitUntil:"domcontentloaded"})
  await page.waitForTimeout(400)
  if(!page.url().includes("/chat")){
    if(await page.locator('input[type="email"]').count()){
      await page.locator('input[type="email"]').fill("admin@life-coach.ai")
      await page.locator('input[type="password"]').fill("admin")
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(1500)
    }
    await page.goto("http://localhost:3000/chat",{waitUntil:"domcontentloaded"})
  }
}

async function tts(channel,name){
  L(`\n=== ${name} TTS force ===`)
  const b=await chromium.launch({channel, headless:false})
  const p=await b.newPage()
  try{
    await login(p)
    const speak=p.getByRole("button",{name:/^朗读$/}).first()
    await speak.scrollIntoViewIfNeeded()
    const wait=p.waitForResponse(r=>/\/api\/voice\/tts/.test(r.url()),{timeout:25000}).catch(()=>null)
    await speak.click({force:true})
    const resp=await wait
    if(resp){ L(`${name} status=${resp.status()} body=${redact(await resp.text())}`) }
    else L(`${name} no /tts response`)
    await p.waitForTimeout(4000)
    const stop=await p.getByRole("button",{name:/停止/}).count()
    L(`${name} stopCount=${stop}`)
    await p.screenshot({path:path.join(OUT,`h3-${name}-tts-force.png`), fullPage:true})
    if(stop) await p.getByRole("button",{name:/停止/}).first().click({force:true}).catch(()=>{})
  }catch(e){ L(`${name} ERR ${e.message}`) }
  finally{ await b.close() }
}

async function deny(){
  L("\n=== chrome deny fresh ===")
  const userData=path.join(OUT,".prof-deny-fresh")
  fs.rmSync(userData,{recursive:true,force:true})
  fs.mkdirSync(userData,{recursive:true})
  const ctx=await chromium.launchPersistentContext(userData,{channel:"chrome", headless:false, locale:"zh-CN"})
  const p=ctx.pages()[0]||await ctx.newPage()
  try{
    const client=await ctx.newCDPSession(p)
    await p.goto("http://localhost:5173/chat",{waitUntil:"domcontentloaded"})
    await client.send("Browser.setPermission",{origin:"http://localhost:5173", permission:{name:"microphone"}, setting:"denied"})
    await p.reload({waitUntil:"domcontentloaded"})
    await p.waitForTimeout(600)
    await p.evaluate(()=>{
      window.__deny=[]
      const C=window.SpeechRecognition||window.webkitSpeechRecognition
      if(!C) return
      const s=C.prototype.start
      C.prototype.start=function(...a){
        this.addEventListener("error",e=>window.__deny.push(e.error))
        return s.apply(this,a)
      }
    })
    await p.getByRole("button",{name:/语音输入/}).click()
    await p.waitForTimeout(4000)
    const deny=await p.evaluate(()=>window.__deny||[])
    const body=await p.locator("body").innerText()
    const hits=body.split("\n").filter(l=>/麦克|权限|拒绝|不允许|not-allowed|语音|未检测/i.test(l)).slice(0,10)
    L(`denyEvents=${JSON.stringify(deny)} hits=${JSON.stringify(hits)}`)
    await p.screenshot({path:path.join(OUT,"h3-chrome-deny-fresh.png"), fullPage:true})
  }catch(e){ L(`deny ERR ${e.message}`) }
  finally{ await ctx.close() }
}

await tts("chrome","chrome")
await tts("msedge","edge")
await deny()
fs.writeFileSync(path.join(OUT,"m18-h3-force-log.txt"), log.join("\n"), "utf8")
L("done")
