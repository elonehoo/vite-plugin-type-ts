import { resolve } from 'path'
import { normalizeGlob, transformDynamicImport, transformAliasImport, removePureImport } from '~/transform'
import type { Alias } from 'vite'
import { describe, expect, test } from 'vitest'

describe('test transform',()=>{
  test('test: normalizeGlob',()=>{
    expect(normalizeGlob('')).toBe('/**')
    expect(normalizeGlob('/')).toBe('/**')
    expect(normalizeGlob('.')).toBe('./**')
    expect(normalizeGlob('..')).toBe('../**')
    expect(normalizeGlob('../..')).toBe('../../**')
    expect(normalizeGlob('a/b')).toBe('a/b/**')
    expect(normalizeGlob('a/b/')).toBe('a/b/**')
    expect(normalizeGlob('a/.b')).toBe('a/.b')
    expect(normalizeGlob('a/b.c')).toBe('a/b.c')
    expect(normalizeGlob('**/*')).toBe('**/*')
    expect(normalizeGlob('a/b*')).toBe('a/b*/**')
    expect(normalizeGlob('a/*')).toBe('a/*')
    expect(normalizeGlob('a/**')).toBe('a/**')
  })

  test('test: transformDynamicImport', () => {
    expect(transformDynamicImport('data: import("vexip-ui/lib/tree").InitDataOptions[];')).toBe(
      "import type { InitDataOptions } from 'vexip-ui/lib/tree';\ndata: InitDataOptions[];"
    )

    expect(
      transformDynamicImport(
        'declare const _default: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin>;\nexport default _default;\n'
      )
    ).toBe(
      "import type { DefineComponent, ComponentOptionsMixin } from 'vue';\ndeclare const _default: DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin>;\nexport default _default;\n"
    )

    expect(
      transformDynamicImport('}> & {} & {} & import("vue").ComponentCustomProperties) | null>;')
    ).toBe(
      "import type { ComponentCustomProperties } from 'vue';\n}> & {} & {} & ComponentCustomProperties) | null>;"
    )
  })

  test('test: transformAliasImport', () => {
    const aliases: Alias[] = [
      { find: /^@\/(.+)/, replacement: resolve(__dirname, '../$1') },
      { find: /^@components\/(.+)/, replacement: resolve(__dirname, '../src/components/$1') }
    ]
    const filePath = resolve(__dirname, '../src/index.ts')

    expect(
      transformAliasImport(
        filePath,
        'import type { TestBase } from "@/components/test";\n',
        aliases
      )
    ).toBe("import type { TestBase } from '../components/test';\n")

    expect(transformAliasImport(filePath, 'import("@/components/test").Test;\n', aliases)).toBe(
      "import('../components/test').Test;\n"
    )

    expect(
      transformAliasImport(
        filePath,
        'import VContainer from "@components/layout/container/VContainer.vue";\n',
        aliases
      )
    ).toBe("import VContainer from './components/layout/container/VContainer.vue';\n")
  })

  test('test: removePureImport', () => {
    expect(removePureImport('import "@/themes/common.scss";')).toBe('')
    expect(
      removePureImport('import "@/themes/common.scss";\nimport type { Ref } from "vue";')
    ).toBe('import type { Ref } from "vue";')
  })
})
