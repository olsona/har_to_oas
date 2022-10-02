import * as jsonPath from 'jsonPath'
import * as _ from 'lodash'
import { Config } from './lib'

function pad (m: number, width: number, z = '0'): string {
  const n = m.toString()
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

function capitalize (s: string): string {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function replaceApos (s: string): string { return s } // rapidoc now supports single quote
// const replaceApos = (s: string): string => s{regex: '/'/g', "&apos;")

function constructJsonPath (partialPath: string | string[]): string {
  if (_.isString(partialPath)) {
    return '$..' + partialPath
  }
  return '$..' + partialPath.join('..')
}

function replaceValuesInPlace (object: object, config: Config): void {
  config.valueReplace.forEach(rule => {
    const partialPath = rule.path
    const replacement = rule.replacement
    const paths = jsonPath.paths(object, constructJsonPath(partialPath))
    paths.forEach((path) => {
      _.set(object, path.slice(1), replacement)
    })
  })
}

function overwriteMerge (destinationArray: any[], sourceArray: any[]): any[] { return sourceArray }

export {
  pad,
  capitalize,
  replaceValuesInPlace,
  replaceApos,
  overwriteMerge
}
