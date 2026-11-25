import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import assert from 'node:assert/strict'
const application = process.env.ELINEA_PANEL_APP || process.env.ELINEA_PRODUCT || 'ecommerce-admin'
assert.ok(['ecommerce-admin', 'gestao'].includes(application), 'Unsupported panel fixture')
const screenshotPrefix = application === 'gestao' ? 'gestao' : 'admin'
const workspace = fileURLToPath(new URL('../../../', import.meta.url))
const beforeDir = process.env.ELINEA_PANEL_BEFORE_DIR || process.env.ELINEA_ADMIN_BEFORE_DIR
assert.ok(beforeDir, 'Set ELINEA_ADMIN_BEFORE_DIR to the saved pre-migration Nuxt .output directory')
const afterDir = process.env.ELINEA_ADMIN_AFTER_DIR || join(workspace, `elinea-${application}/.output`)
const artifacts = process.env.ELINEA_UI_ARTIFACTS_DIR || join(tmpdir(), 'elinea-ui-regression')

const routePath = application === 'gestao' ? '/platform/users' : '/customers'
const heading = application === 'gestao' ? 'Usuários' : 'Clientes'

const modules = ['dashboard','reports','orders','revenue','customers','coupons','promotions','marketing','products','categories','brands','inventory','reviews','tickets','integrations','settings','security','automations','messaging']
const site = { id: 1, name: 'Loja de exemplo', slug: 'example', domain: 'example.test', status: 'active', theme: null }
const user = { id: 1, site_id: 1, name: 'Operador de exemplo', email: 'example@example.test', role: application === 'gestao' ? 'super' : 'admin', is_active: true, phone: null, cpf: null, avatar_url: null }
const meta = { current_page: 1, per_page: 10, total: 1, last_page: 1, unread_count: 0 }
const results = []
await mkdir(artifacts, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
try {
 for (const [label, directory, port] of [['before', beforeDir, 4101], ['after', afterDir, 4102]]) {
  const server = spawn(process.execPath, [directory + '/server/index.mjs'], { cwd: directory, env: { ...process.env, NITRO_HOST: '127.0.0.1', NITRO_PORT: String(port) }, stdio: 'ignore' })
  try {
   let ready = false
   for (let i = 0; i < 100; i++) { try { const response = await fetch(`http://127.0.0.1:${port}/login`); if (response.ok) { ready = true; break } } catch {} await new Promise(resolve => setTimeout(resolve, 100)) }
   assert.ok(ready, `${label} server failed to start`)
   for (const [theme, width, height] of [['light',1440,1000],['dark',1440,1000],['light',390,844]]) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme === 'dark' ? 'dark' : 'light', reducedMotion: 'reduce' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', async route => {
     const url = new URL(route.request().url())
     if (url.pathname.startsWith('/api/v1/')) {
      const path = url.pathname.slice('/api/v1'.length)
      const body = path === '/auth/me' ? { data: user } : path === '/configuration/permissions' ? { data: { plan_modules: modules, roles: [], permissions: [], matrix: {} } } : path === '/site' ? { data: site } : path === '/sites' ? { data: [site] } : (path === '/users' || path === '/platform/users') ? { data: [{ ...user, site, is_super: false, role: application === 'gestao' ? 'admin' : 'customer', orders_count: 0, ltv: 0, created_at: '2026-11-25T12:00:00Z', last_order_at: null }], meta } : { data: [], meta }
      return route.fulfill({ json: body, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } })
     }
     if (url.hostname === '127.0.0.1' && Number(url.port) === port) return route.continue()
     return route.fulfill({ status: 200, body: '', contentType: url.pathname.endsWith('.css') ? 'text/css' : 'text/plain' })
    })
    await page.addInitScript(({ user, theme, application }) => { localStorage.setItem('api_token', 'example-test-token'); localStorage.setItem('admin_user', JSON.stringify(user)); localStorage.setItem('admin_site', 'example'); localStorage.setItem(application === 'gestao' ? 'elinea-gestao-theme' : 'elinea-theme', theme) }, { user, theme, application })
    await page.clock.setFixedTime(new Date('2026-11-25T12:00:00Z'))
    await page.goto(`http://127.0.0.1:${port}${routePath}`)
    await page.getByRole('heading', { name: heading, exact: true }).waitFor({timeout:10000}).catch(async error => { await page.screenshot({path: join(artifacts,'failure.png'),fullPage:true}); console.log(JSON.stringify({label,errors,body:(await page.locator('body').innerText()).slice(0,1800)})); throw error })
    await page.getByRole('cell', { name: 'Operador de exemplo', exact: false }).first().waitFor()
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), theme === 'dark', 'Requested theme must actually be active')
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    const screenshot = join(artifacts,`${screenshotPrefix}-${label}-${theme}-${width}.png`)
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
    assert.equal(horizontalOverflow, false, `${label} document overflows at ${width}px`)
    assert.deepEqual(errors, [], `${label} browser runtime errors`)
    results.push({ label, theme, width, height, errors, horizontalOverflow, screenshot })
    if (label === 'after' && application === 'ecommerce-admin') {
      if (width < 640) {
        await page.getByRole('button', { name: 'Abrir menu', exact: true }).click()
        assert.equal(await page.locator('input.drawer-toggle').isChecked(), true)
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('input.drawer-toggle').isChecked(), false)
      }
      const rowAction = page.getByRole('button', { name: 'Abrir ações do cliente', exact: true })
      await rowAction.scrollIntoViewIfNeeded()
      // Scroll closes floating menus in the original app; settle it before opening.
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await rowAction.click()
      await page.getByRole('button', { name: 'Excluir', exact: true }).click()
      const dialog = page.getByRole('dialog', { name: 'Excluir cliente', exact: true })
      await dialog.waitFor()
      assert.equal(await dialog.evaluate(node => node.contains(document.activeElement)), true)
      for (let tab = 0; tab < 4; tab++) {
        await page.keyboard.press('Tab')
        assert.equal(await dialog.evaluate(node => node.contains(document.activeElement)), true)
      }
      await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
      await dialog.waitFor({ state: 'hidden' })
      results.push({ check: 'menu and native modal interactions', theme, width })
    }
    await context.close()
   }
  } finally { server.kill('SIGTERM') }
 }
} finally { await browser.close(); await writeFile(join(artifacts,'results.json'), JSON.stringify(results, null, 2)) }
// PNG bytes can differ at antialiased gradient edges. Keep a strict pixel bound
// and channel delta bound, so color changes and layout shifts still fail.
const comparisonBrowser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
try {
 const page = await comparisonBrowser.newPage()
 for (const [theme, width] of [['light', 1440], ['dark', 1440], ['light', 390]]) {
  const before = await readFile(join(artifacts, `${screenshotPrefix}-before-${theme}-${width}.png`))
  const after = await readFile(join(artifacts, `${screenshotPrefix}-after-${theme}-${width}.png`))
  const difference = before.equals(after) ? { changedPixels: 0, maxChannelDelta: 0, equalDimensions: true } : await page.evaluate(async ({ before, after }) => {
   const decode = (data) => new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = `data:image/png;base64,${data}`
   })
   const a = await decode(before)
   const b = await decode(after)
   if (a.width !== b.width || a.height !== b.height) return { equalDimensions: false, changedPixels: Infinity, maxChannelDelta: 255 }
   const canvas = document.createElement('canvas'); canvas.width = a.width; canvas.height = a.height
   const context = canvas.getContext('2d', { willReadFrequently: true })
   context.drawImage(a, 0, 0); const expected = context.getImageData(0, 0, a.width, a.height).data
   context.clearRect(0, 0, a.width, a.height)
   context.drawImage(b, 0, 0); const actual = context.getImageData(0, 0, a.width, a.height).data
   let changedPixels = 0, maxChannelDelta = 0
   for (let offset = 0; offset < expected.length; offset += 4) {
    let changed = false
    for (let channel = 0; channel < 4; channel++) {
     const delta = Math.abs(expected[offset + channel] - actual[offset + channel])
     if (delta) changed = true
     maxChannelDelta = Math.max(maxChannelDelta, delta)
    }
    if (changed) changedPixels++
   }
   return { changedPixels, maxChannelDelta, equalDimensions: true }
  }, { before: before.toString('base64'), after: after.toString('base64') })
  assert.ok(difference.equalDimensions && difference.changedPixels <= 16 && difference.maxChannelDelta <= 8,
   `Visual regression: ${theme} at ${width}px (${JSON.stringify(difference)}); inspect artifacts`)
  results.push({ check: 'visual comparison', theme, width, ...difference, sha256: createHash('sha256').update(after).digest('hex') })
 }
} finally { await comparisonBrowser.close() }
await writeFile(join(artifacts,'results.json'), JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
