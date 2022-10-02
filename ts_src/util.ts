import * as jsonPath from 'jsonPath'
import * as _ from 'lodash'
import { Config } from './lib'
import { RegexRule } from './interfaces'

const pad = (m: number, width: number, z = '0'): string => {
  const n = m.toString()
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

const capitalize = (s: string): string => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const replaceApos = (s: string): string => s // rapidoc now supports single quote
// const replaceApos = (s: string): string => s{regex: '/'/g', "&apos;")

const constructJsonPath = (partialPath: string | string[]): string => {
  if (_.isString(partialPath)) {
    return '$..' + partialPath
  }
  return '$..' + partialPath.join('..')
}

const replaceValuesInPlace = (object: object, config: Config): void => {
  config.valueReplace.forEach(rule => {
    const partialPath = rule.path
    const replacement = rule.replacement
    const paths = jsonPath.paths(object, constructJsonPath(partialPath))
    paths.forEach((path) => {
      _.set(object, path.slice(1), replacement)
    })
  })
}

const xCodeScrubRules: RegexRule[] = [
  { regex: '/{dataset_id}/g', replacement: '0001a' },
  { regex: '/{variable_id}/g', replacement: '0001b' },
  { regex: '/{user_id}/g', replacement: '0001c' },
  { regex: '/{subvariable_id}/g', replacement: '0001d' },
  { regex: '/{folder_id}/g', replacement: '0001e' },
  { regex: '/{slide_id}/g', replacement: '0001f' },
  { regex: '/{deck_id}/g', replacement: '0001g' },
  { regex: '/{analysis_id}/g', replacement: '0001h' },
  { regex: '/{tag_name}/g', replacement: '0001i' },
  { regex: '/{project_id}/g', replacement: '0001j' },
  { regex: '/{integration_id}/g', replacement: '0001k' },
  { regex: '/{integration_partner}/g', replacement: '0001l' },
  { regex: '/{team_id}/g', replacement: '0001m' },
  { regex: '/{savepoint_id}/g', replacement: '0001n' },
  { regex: '/{script_id}/g', replacement: '0001o' },
  { regex: '/{multitable_id}/g', replacement: '0001p' },
  { regex: '/{subdomain}/g', replacement: '0001q' },
  { regex: '/{account_id}/g', replacement: '0001r' },
  { regex: '/{filter_id}/g', replacement: '0001s' },
  { regex: '/{geodata_id}/g', replacement: '0001t' },
  { regex: '/{task_id}/g', replacement: '0001u' },
  { regex: '/{flag_id}/g', replacement: '0001v' },
  { regex: '/{source_id}/g', replacement: '0001w' },
  { regex: '/{batch_id}/g', replacement: '0001x' },
  { regex: '/{action_hash}/g', replacement: '0001y' },
  { regex: '/{boxdata_id}/g', replacement: '0001z' },
  { regex: '/{datasetName}/g', replacement: '0001aa' },
  { regex: '/{format}/g', replacement: '0001ab' },
  { regex: '/{dashboard_id}/g', replacement: '0001ac' }
]

export {
  pad,
  capitalize,
  replaceValuesInPlace,
  replaceApos,
  xCodeScrubRules
}
