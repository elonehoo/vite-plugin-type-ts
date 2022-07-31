import { transferSetupPosition } from '~/transform'
import type { SFCDescriptor } from 'vue/compiler-sfc'

const exportDefaultRE = /export\s+default/
const exportDefaultClassRE = /(?:(?:^|\n|;)\s*)export\s+default\s+class\s+([\w$]+)/
const noScriptContent = "import { defineComponent } from 'vue'\nexport default defineComponent({})"

let index = 1
let compileRoot: string | null = null
let compiler: typeof import('vue/compiler-sfc') | null
let vue: typeof import('vue') | null

function requireCompiler() {
  if (!compiler) {
    if (compileRoot) {
      try {
        compiler = require(require.resolve('vue/compiler-sfc', { paths: [compileRoot] }))
      } catch (e) {}
    }

    if (!compiler) {
      try {
        compiler = require('vue/compiler-sfc')
      } catch (e) {
        try {
          compiler = require('@vue/compiler-sfc')
        } catch (e) {
          throw new Error('@vue/compiler-sfc is not present in the dependency tree.\n')
        }
      }
    }
  }

  return compiler!
}

function isVue3() {
  if (!vue) {
    if (compileRoot) {
      try {
        vue = require(require.resolve('vue', { paths: [compileRoot] }))
      } catch (e) {}
    }

    if (!vue) {
      try {
        vue = require('vue')
      } catch (e) {
        throw new Error('vue is not present in the dependency tree.\n')
      }
    }
  }

  return vue!.version.startsWith('3')
}

export function setCompileRoot(root: string) {
  if (root && root !== compileRoot) {
    compileRoot = root
    compiler = null
  }
}

function parseCode(code: string) {
  const { parse } = requireCompiler()
  let descriptor: any

  if (isVue3()) {
    descriptor = parse(code).descriptor
  } else {
    descriptor = (parse as any)({ source: code })
  }

  return descriptor as SFCDescriptor
}

export function compileVueCode(code: string) {
  const { compileScript, rewriteDefault } = requireCompiler()
  const descriptor = parseCode(code)
  const { script, scriptSetup } = descriptor

  let content: string | null = null
  let ext: string | null = null

  if (script || scriptSetup) {
    if (scriptSetup) {
      const compiled = compileScript(descriptor, {
        id: `${index++}`
      })

      const classMatch = compiled.content.match(exportDefaultClassRE)
      const plugins = scriptSetup.lang === 'ts' ? ['typescript' as const] : undefined

      if (classMatch) {
        content =
          compiled.content.replace(exportDefaultClassRE, '\nclass $1') +
          `\nconst _sfc_main = ${classMatch[1]}`

        if (exportDefaultRE.test(content)) {
          content = rewriteDefault(compiled.content, '_sfc_main', plugins)
        }
      } else {
        content = rewriteDefault(compiled.content, '_sfc_main', plugins)
      }

      content = transferSetupPosition(content)
      content += '\nexport default _sfc_main\n'

      ext = scriptSetup.lang || 'js'
    } else if (script && script.content) {
      content = rewriteDefault(
        script.content,
        '_sfc_main',
        script.lang === 'ts' ? ['typescript'] : undefined
      )
      content += '\nexport default _sfc_main\n'

      ext = script.lang || 'js'
    }
  } else {
    content = noScriptContent
    ext = 'ts'
  }

  return { content, ext }
}

