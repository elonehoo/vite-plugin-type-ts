import { resolve, normalize } from 'path'
import { isNativeObj, isRegExp, isPromise, mergeObjects, ensureAbsolute, ensureArray, queryPublicPath } from '~/util'

import { describe, expect, test } from 'vitest'

describe('test util',()=>{
  test('test: isNativeObj',()=>{
    expect(isNativeObj({})).toBe(true)
    expect(isNativeObj([])).toBe(false)
    expect(isNativeObj('' as any)).toBe(false)
  })

  test('test: isRegExp',()=>{
    expect(isRegExp('')).toBe(false)
    expect(isRegExp(/1/)).toBe(true)
    expect(isRegExp(new RegExp(''))).toBe(true)
    expect(isRegExp({})).toBe(false)
  })

  test('test: isPromise', () => {
    expect(isPromise(false)).toBe(false)
    expect(isPromise('')).toBe(false)
    expect(
      isPromise(
        new Promise<void>(r => {
          r()
        })
      )
    ).toBe(true)
    expect(isPromise({ then: () => {} })).toBe(false)
    expect(isPromise({ catch: () => {} })).toBe(false)
    expect(isPromise({ then: () => {}, catch: () => {} })).toBe(true)
  })

  test('test: mergeObjects', () => {
    expect(mergeObjects({ a: '1' }, { b: '3' })).toEqual({ a: '1', b: '3' })
    expect(mergeObjects({ a: '1', b: '2' }, { b: '3' })).toEqual({ a: '1', b: '3' })
    expect(mergeObjects({ a: '1', b: '2' }, { b: ['3'] })).toEqual({ a: '1', b: ['3'] })
    expect(mergeObjects({ a: '1', b: { c: '2' } }, { b: { d: '4' } })).toEqual({
      a: '1',
      b: { c: '2', d: '4' }
    })
    expect(mergeObjects({ a: '1', b: 1 }, { b: { d: '4' } })).toEqual({ a: '1', b: { d: '4' } })
  })

  test('test: ensureAbsolute', () => {
    const root = resolve(__dirname, '..')

    expect(ensureAbsolute('', root)).toBe(root)
    expect(ensureAbsolute('./src/index.ts', root)).toBe(resolve(root, 'src/index.ts'))
    expect(ensureAbsolute('/src/index.ts', root)).toBe('/src/index.ts')
    expect(ensureAbsolute('/vite-plugin-dts', root)).toBe('/vite-plugin-dts')
  })

  test('test: ensureArray', () => {
    expect(ensureArray(1)).toEqual([1])
    expect(ensureArray({ a: 1 })).toEqual([{ a: 1 }])
    expect(ensureArray([1, 2])).toEqual([1, 2])
  })

  test('test: queryPublicPath', () => {
    const n = <T extends string | string[]>(p: T) =>
      (Array.isArray(p) ? p.map(normalize) : normalize(p)) as T

    expect(queryPublicPath([])).toBe('')
    expect(queryPublicPath(n(['/project/src/test/a.d.ts', '/project/src/test/b.d.ts']))).toBe(
      n('/project/src/test')
    )
    expect(
      queryPublicPath(
        n(['/project/src/test/a.d.ts', '/project/src/test/b.d.ts', '/project/src/c.d.ts'])
      )
    ).toBe(n('/project/src'))
    expect(
      queryPublicPath(
        n(['/project/src/common/a.d.ts', '/project/src/test/b.d.ts', '/project/src/test/c.d.ts'])
      )
    ).toBe(n('/project/src'))
    expect(
      queryPublicPath(
        n(['/project/src/test/a.d.ts', '/project/src/test1/b.d.ts', '/project/src/test/c.d.ts'])
      )
    ).toBe(n('/project/src'))
  })
})
