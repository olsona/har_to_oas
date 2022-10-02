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
  valueReplace: string[][]
  tags: string[][]
}

export {
  ExampleFile,
  SchemaFile,
  Config
}
