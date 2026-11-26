// Structural/CSS migration checks. This does not replace browser pixel comparison.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { createHash } from 'node:crypto'
const workspace = fileURLToPath(new URL('../../../', import.meta.url))
const ui = join(workspace, 'elinea-ui')
const gestao = join(workspace, 'elinea-gestao')
const requireUI = createRequire(join(ui, 'package.json'))
const requireGestao = createRequire(join(gestao, 'package.json'))
const { build } = requireGestao('esbuild')
const { parse, compileScript, compileStyle } = requireUI('@vue/compiler-sfc')
const { JSDOM } = requireUI('jsdom')
const { createSSRApp, defineComponent, h, computed, ref, onMounted, onBeforeUnmount } = requireUI('vue')
const { renderToString } = requireUI('vue/server-renderer')
const revision = 'e05c7c73e48857b40c6dbd0e80f7dffa0deaf160'
const reference = process.env.ELINEA_GESTAO_REFERENCE_DIR
assert.ok(reference, 'Set ELINEA_GESTAO_REFERENCE_DIR to the pre-migration app directory (see README)')
const original = path => readFileSync(join(reference, path), 'utf8')
const vuePath = requireUI.resolve('vue')
const Link = defineComponent({ props: { to: String, href: String }, setup: (props, { slots }) => () => h('a', { href: props.to || props.href }, slots.default?.()) })
const compiledStyles = {}
const legacyNames = ['Button', 'DataTable', 'FilterToolbar', 'FilterSearch', 'FilterSelect', 'Pagination']
const bundle = await build({
  stdin: { contents: `${legacyNames.map(name => `export { default as Old${name} } from 'legacy:components/ui/Elinea${name}.vue'`).join(';')}; export * from '${ui}/src/painel.ts'; export { default as OldShell } from 'legacy:components/layout/AppShell.vue'; export { default as NewShell } from '${gestao}/app/components/layout/AppShell.vue'`, resolveDir: workspace },
  bundle: true, write: false, platform: 'node', format: 'cjs', logLevel: 'silent',
  plugins: [{ name: 'migration-sfc', setup(builder) {
    builder.onResolve({ filter: /^vue$/ }, () => ({ path: vuePath, external: true }))
    builder.onResolve({ filter: /^@elinea\/ui\/painel$/ }, () => ({ path: join(ui, 'src/painel.ts') }))
    builder.onResolve({ filter: /^@lucide\/vue$/ }, () => ({ path: requireGestao.resolve('@lucide/vue') }))
    builder.onResolve({ filter: /^#components$/ }, () => ({ path: 'nuxt-links', namespace: 'stub' }))
    builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: `import { defineComponent,h } from 'vue';export const NuxtLink=defineComponent({props:{to:String,href:String},setup:(p,{slots})=>()=>h('a',{href:p.to||p.href},slots.default?.())});`, resolveDir: ui }))
    builder.onResolve({ filter: /^legacy:/ }, args => ({ path: args.path.slice(7), namespace: 'legacy' }))
    function compile(source, filename, legacy = false) {
      if (legacy) source = source.replace(/<script setup[^>]*>/, opening => opening + '\nimport { ref, computed, watch, useId, nextTick, onMounted, onBeforeUnmount } from "vue"')
      if (!source.includes('<script')) source = '<script setup>const parity = true</script>' + source
      const { descriptor } = parse(source, { filename })
      const id = 'parity-' + createHash('sha256').update(filename).digest('hex').slice(0, 8)
      const compiled = compileScript(descriptor, { id, inlineTemplate: true })
      for (const style of descriptor.styles) {
        const result = compileStyle({ source: style.content, filename, id, scoped: style.scoped })
        assert.deepEqual(result.errors, [])
        compiledStyles[filename] = result.code.replaceAll(id, 'normalized-scope').replace(/\s+/g, ' ').trim()
      }
      return { contents: compiled.content, loader: 'ts', resolveDir: dirname(filename) }
    }
    builder.onLoad({ filter: /\.vue$/, namespace: 'legacy' }, args => compile(original(args.path), join(gestao, 'app', args.path), true))
    builder.onLoad({ filter: /\.vue$/ }, args => compile(readFileSync(args.path, 'utf8'), args.path))
  } }],
})
mkdirSync('/tmp/elinea-gestao-ui', { recursive: true })
writeFileSync('/tmp/elinea-gestao-ui/parity-bundle.cjs', bundle.outputFiles[0].text)
const components = requireUI('/tmp/elinea-gestao-ui/parity-bundle.cjs')
// Stubs are deliberately limited to presentation context and fictitious data.
Object.assign(globalThis, { ref, computed, onMounted, onBeforeUnmount,
  useRoute: () => ({ path: '/gestao-financeira/receitas' }),
  useAuth: () => ({ user: ref({ name: 'Operador de exemplo', email: 'example@example.test', role: 'super' }), loadStoredUser() {}, logout() {} }),
  useHead() {},
  usePaginationWindow: (page, total) => computed(() => Array.from({ length: Math.max(0, Math.min(total.value, page.value + 2) - Math.max(1, page.value - 2) + 1) }, (_, index) => Math.max(1, page.value - 2) + index)),
})
function canonical(html) {
  const document = new JSDOM(html).window.document
  function node(element) {
    if (element.nodeType === 8) return null
    if (element.nodeType === 3) return element.textContent.replace(/\s+/g, ' ').trim() || null
    const attrs = [...element.attributes].filter(attr => !attr.name.startsWith('data-v-') && !(element.tagName.toLowerCase() === 'svg' && attr.name === 'aria-hidden')).map(attr => [attr.name, attr.name === 'class' ? attr.value.split(/\s+/).filter(Boolean).sort().join(' ') : attr.value]).sort(([a], [b]) => a.localeCompare(b))
    return { tag: element.tagName.toLowerCase(), attrs, children: [...element.childNodes].map(node).filter(value => value !== null) }
  }
  return [...document.body.childNodes].map(node).filter(value => value !== null)
}
async function render(component, props, slots, before) {
  const app = createSSRApp({ render: () => h(component, props, slots) })
  for (const [name, impl] of Object.entries({ NuxtLink: Link, ElineaCard: components.PainelCard, UiElineaEmptyTableState: components.PainelEmptyTableState, UiElineaButton: before ? components.OldButton : defineComponent({ setup: (_, { attrs, slots }) => () => h(components.PainelButton, { ...attrs, variant: attrs.variant ?? 'outline', linkComponent: Link }, slots) }), UiElineaFilterToolbar: components.OldFilterToolbar, UiElineaPagination: components.OldPagination })) app.component(name, impl)
  return canonical(await renderToString(app))
}
const results = []
async function compare(name, old, updated, props, slots = {}, updatedProps = props, normalize = value => value) {
  const before = normalize(await render(old, props, slots, true))
  const after = normalize(await render(updated, updatedProps, slots, false))
  try { assert.deepEqual(after, before) } catch (error) {
    mkdirSync('/tmp/elinea-gestao-ui/parity', { recursive: true })
    writeFileSync(`/tmp/elinea-gestao-ui/parity/${name}.json`, JSON.stringify({ before, after }, null, 2))
    throw error
  }
  results.push({ name, passing: true })
}
for (const variant of ['primary', 'outline', 'ghost', 'danger', 'danger-outline']) {
  for (const size of ['xs', 'sm', 'md', 'lg']) {
    await compare(`button-${variant}-${size}`, components.OldButton, components.PainelButton, { variant, size }, { default: () => 'Exemplo' })
  }
}
for (const state of [{ disabled: true }, { loading: true }]) await compare(`button-${Object.keys(state)[0]}`, components.OldButton, components.PainelButton, { variant: 'outline', ...state }, { default: () => 'Exemplo' })
await compare('search', components.OldFilterSearch, components.PainelFilterSearch, { modelValue: 'exemplo', placeholder: 'Buscar exemplos' })
await compare('select', components.OldFilterSelect, components.PainelFilterSelect, { modelValue: 'a', label: 'Status', options: [{ value: 'a', label: 'Ativo' }] })
const columns = [{ key: 'name', label: 'Nome' }]
for (const [name, rows, extra] of [['filled', [{ id: 1, name: 'Exemplo' }], {}], ['empty', [], {}], ['loading', [], { loading: true }], ['server', [{ id: 11, name: 'Página dois' }], { pagination: { page: 2, totalPages: 4, totalRecords: 32 } }]]) {
  await compare(`grid-${name}`, components.OldDataTable, components.PainelDataGrid, { columns, rows, caption: 'Exemplos', refreshable: true, ...extra }, { 'cell-name': ({ value }) => h('strong', value), actions: () => h('button', 'Abrir') })
}
// Explicit semantic changes: keyboard menu trigger, menu labels and active-page hints.
// Sidebar padding is preserved by the consumer compatibility rule.
function normalizeShell(nodes) {
  function visit(node) {
    if (typeof node === 'string') return
    const attrs = new Map(node.attrs)
    let classes = attrs.get('class') || ''
    if (classes.includes('drawer-toggle')) { attrs.set('id', 'drawer'); attrs.delete('aria-label') }
    if (classes.includes('drawer-overlay')) attrs.set('for', 'drawer')
    if (classes.includes('btn-square')) {
      node.tag = 'button'
      for (const key of ['for', 'type', 'aria-expanded']) attrs.delete(key)
    }
    if (node.tag === 'nav') attrs.delete('aria-label')
    attrs.delete('aria-current')
    if (classes) {
      classes = classes.split(' ').filter(value => value !== 'gestao-shell').map(value => value === 'pb-14' ? 'pb-8' : value).sort().join(' ')
      attrs.set('class', classes)
    }
    node.attrs = [...attrs].sort(([a], [b]) => a.localeCompare(b))
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return nodes
}
await compare('shell', components.OldShell, components.NewShell, {}, { default: () => h('p', 'Conteúdo de exemplo') }, {}, normalizeShell)
// The button style is moved without a declaration change; scoped IDs are normalized.
assert.equal(compiledStyles[join(gestao, 'app/components/ui/ElineaButton.vue')], compiledStyles[join(ui, 'src/painel/PainelButton.vue')])
results.push({ name: 'button-scoped-css', passing: true })
// Every theme rule is unchanged except shared heading typography, overridden by the consumer.
const oldTheme = original('assets/css/main.css').replace(/@source[^;]+;/, '').trim()
const sharedTheme = readFileSync(join(ui, 'src/painel/styles.css'), 'utf8').replace(/^\/\*[^\n]*\*\/\n/, '').replace(/  --font-heading:[^\n]*\n/, '').replace(/  h1, h2, h3, h4, h5, h6 \{\n    font-family: var\(--font-heading\);\n  \}\n/, '').replace(/@source[^;]+;/, '').trim()
assert.equal(sharedTheme, oldTheme)
results.push({ name: 'shared-theme-source', passing: true })
const report = { passing: true, referenceCommit: revision, checks: results, limitation: 'Structural SSR and CSS source comparison only; no browser layout, pixels, fonts, overflow or native focus validation.' }
const destination = process.env.ELINEA_PARITY_RESULT || '/tmp/elinea-gestao-ui/parity-results.json'
writeFileSync(destination, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
