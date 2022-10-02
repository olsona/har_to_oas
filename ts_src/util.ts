import * as jsonPath from 'jsonPath'
import * as _ from 'lodash'
import { Config } from './lib'

const pad = (m: number, width: number, z = '0'): string => {
  const n = m.toString()
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

const capitalize = (s: string): string => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const constructJsonPath = (partialPath: string | string[]): string => {
  if (_.isString(partialPath)) {
    return '$..' + partialPath
  }
  return '$..' + partialPath.join('..')
}

const replaceValuesInPlace = (config: Config, object: object): void => {
  config.valueReplace.forEach((element) => {
    const partialPath = element[0]
    const replacement = element[1]
    const paths = jsonPath.paths(object, constructJsonPath(partialPath))
    paths.forEach((path) => {
      _.set(object, path.slice(1), replacement)
    })
  })
}

export {
  pad,
  capitalize,
  replaceValuesInPlace
}
