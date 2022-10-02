interface ExampleFile {
  [path: string]: {
    [method: string]: {
      request: {
        [exampleName: string]: any
      }
      response: {
        [statusCode: string]: {
          [exampleName: string]: any
        }
      }
    }
  }
}

interface SchemaFile {
  [path: string]: {
    [method: string]: {
      request: any
      response: {
        [statusCode: string]: any
      }
    }
  }
}

interface Config {
  apiBasePath: string
  pathReplace: {
    [search: string]: string
  }
  replace: {
    [search: string]: any
  }
  valueReplace: ObjectPathRule[]
  xCodeScrub: RegexRule[]
  tags: string[][]
}

interface RegexRule {
  regex: string
  replacement: string
}

interface ObjectPathRule {
  path: string | string[]
  replacement: any
}

export {
  ExampleFile,
  SchemaFile,
  Config,
  RegexRule,
  ObjectPathRule
}
