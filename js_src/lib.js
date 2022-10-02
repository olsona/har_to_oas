"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.listEndpoints = exports.postProduction = exports.parseHarFileIntoIndividualFiles = exports.updateXcode = exports.mergeFiles = exports.generateSchema = exports.generateSpec = exports.generateSamples = void 0;
var openapi_v3_types_1 = require("@loopback/openapi-v3-types");
var merge = require("deepmerge");
var fs_1 = require("fs");
var YAML = require("js-yaml");
var parseJson = require("parse-json");
var pluralize = require("pluralize");
var process_1 = require("process");
var sortJson = require("sort-json");
var quicktype_core_1 = require("quicktype-core");
var deref = require("json-schema-deref-sync");
var toOpenApiSchema = require("@openapi-contrib/json-schema-to-openapi-schema");
var recursive = require("recursive-readdir");
var _ = require("lodash");
var util_1 = require("./util");
function quicktypeJSON(targetLanguage, typeName, sampleArray) {
    return __awaiter(this, void 0, void 0, function () {
        var jsonInput, inputData, result, returnJSON;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jsonInput = (0, quicktype_core_1.jsonInputForTargetLanguage)(targetLanguage);
                    return [4 /*yield*/, jsonInput.addSource({
                            name: typeName,
                            samples: sampleArray
                        })];
                case 1:
                    _a.sent();
                    inputData = new quicktype_core_1.InputData();
                    inputData.addInput(jsonInput);
                    return [4 /*yield*/, (0, quicktype_core_1.quicktype)({
                            inputData: inputData,
                            lang: targetLanguage,
                            alphabetizeProperties: true,
                            allPropertiesOptional: true,
                            ignoreJsonRefs: true
                        })];
                case 2:
                    result = _a.sent();
                    returnJSON = JSON.parse(result.lines.join('\n'));
                    // return refParser.dereference(returnJSON) // this one contains references
                    return [2 /*return*/, deref(returnJSON)]; // this one does not contain references
            }
        });
    });
}
function addMethod(method, filteredUrl, originalPath, methodList, spec, config) {
    // generate operation id
    var operationId = filteredUrl.replace(/(^\/|\/$|{|})/g, '').replace(/\//g, '-');
    operationId = "".concat(method, "-").concat(operationId);
    // create method
    var summary = deriveSummary(method, filteredUrl);
    var tag = deriveTag(filteredUrl, config);
    spec.paths[filteredUrl][method] = {
        operationId: operationId,
        summary: summary,
        description: '',
        parameters: [],
        responses: {},
        tags: [tag],
        meta: {
            originalPath: originalPath,
            element: ''
        }
    };
    methodList.push("".concat(tag, "\t").concat(filteredUrl, "\t").concat(method, "\t").concat(summary));
}
function addPath(filteredUrl, spec) {
    // identify what parameters this path has
    var parameters = [];
    var parameterList = filteredUrl.match(/{.*?}/g);
    if (parameterList != null) {
        parameterList.forEach(function (parameter) {
            var variable = parameter.replace(/[{}]/g, '');
            var variableType = variable.replace(/_id/, '');
            parameters.push({
                description: "Unique ID of the ".concat(variableType, " you are working with"),
                "in": 'path',
                name: variable,
                required: true,
                schema: {
                    type: 'string'
                }
            });
        });
    }
    // create path with parameters
    spec.paths[filteredUrl] = {
        parameters: parameters
    };
}
function addQueryStringParams(specMethod, harParams) {
    var methodQueryParameters = [];
    specMethod.parameters.forEach(function (param) {
        if (param["in"] === 'query')
            methodQueryParameters.push(param.name);
    });
    harParams.forEach(function (param) {
        if (!methodQueryParameters.includes(param.name)) {
            // add query parameter
            specMethod.parameters.push({
                schema: {
                    type: 'string',
                    "default": param.value,
                    example: param.value
                },
                "in": 'query',
                name: param.name,
                description: param.name
            });
        }
    });
}
function addResponse(status, method, specPath) {
    switch (status) {
        case 200:
            switch (method) {
                case 'get':
                    specPath.responses['200'] = { description: 'Success' };
                    break;
                case 'delete':
                    specPath.responses['200'] = { description: 'Item deleted' };
                    break;
                case 'patch':
                    specPath.responses['200'] = { description: 'Item updated' };
                    break;
                case 'post':
                    specPath.responses['200'] = { description: 'Item created' };
                    break;
            }
            break;
        case 201:
            switch (method) {
                case 'post':
                    specPath.responses['201'] = { description: 'Item created' };
                    break;
            }
            break;
        case 202:
            switch (method) {
                case 'post':
                    specPath.responses['202'] = { description: 'Item created' };
                    break;
            }
            break;
        case 204:
            switch (method) {
                case 'get':
                    specPath.responses['204'] = { description: 'Success' };
                    break;
                case 'delete':
                    specPath.responses['204'] = { description: 'Item deleted' };
                    break;
                case 'patch':
                case 'put':
                    specPath.responses['204'] = { description: 'Item updated' };
                    break;
                case 'post':
                    specPath.responses['202'] = { description: 'Item created' };
                    break;
            }
            break;
        case 400:
            switch (method) {
                case 'delete':
                    specPath.responses['400'] = { description: 'Deletion failed - item in use' };
                    break;
                default:
                    specPath.responses['400'] = { description: 'Bad request' };
            }
            break;
        case 401:
            specPath.responses['401'] = { description: 'Unauthorized' };
            break;
        case 404:
            specPath.responses['404'] = { description: 'Item not found' };
            break;
        case 405:
            specPath.responses['405'] = { description: 'Not allowed' };
            break;
    }
}
function createXcodeSamples(spec, config) {
    Object.keys(spec.paths).forEach(function (path) {
        Object.keys(spec.paths[path]).forEach(function (lMethod) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
            if (lMethod === 'parameters')
                return;
            var method = spec.paths[path][lMethod];
            var scrubbedPath;
            config.xCodeScrub.forEach(function (rule) {
                scrubbedPath = path.replace(rule.regex, rule.replacement);
            });
            method['x-code-samples'] = (_a = method['x-code-samples']) !== null && _a !== void 0 ? _a : [];
            // create curl code
            var data;
            var originalPath = "https://app.crunch.io/api".concat(((_b = method === null || method === void 0 ? void 0 : method.meta) === null || _b === void 0 ? void 0 : _b.originalPath) || scrubbedPath);
            var curlCode = "curl -X ".concat(lMethod.toUpperCase(), " ").concat(originalPath);
            if (!originalPath.includes('public'))
                curlCode += ' \\\n  -H \'Authorization: Bearer 598d9e1105\'';
            var examples = (_e = (_d = (_c = method.requestBody) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d['application/json']) === null || _e === void 0 ? void 0 : _e.examples;
            if (examples) {
                var exampleList = Object.keys(examples);
                if (exampleList.length > 0) {
                    var firstExample = exampleList[0];
                    data = (_k = (_j = (_h = (_g = (_f = method.requestBody) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g['application/json']) === null || _h === void 0 ? void 0 : _h.examples) === null || _j === void 0 ? void 0 : _j[firstExample]) === null || _k === void 0 ? void 0 : _k.value;
                }
            }
            if (data) {
                curlCode += ' \\\n  -H \'Content-Type: application/json\'';
                // which data style do you prefer?
                curlCode += " -d '\n".concat(JSON.stringify(data, null, 2), "\n'");
                // curlCode += ` \\\n  -d '${JSON.stringify(data)}'`
                // curlCode += ` \\\n  --data-binary @- << EOF \n${JSON.stringify(data, null, 2)}\nEOF`
                // curlCode += ` -d '\n  ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')}\n'`
            }
            // overwrite existing SHELL array element if exists
            var found = false;
            var shellCodeSample = {
                lang: 'SHELL',
                source: (0, util_1.replaceApos)(curlCode),
                syntaxLang: 'bash'
            };
            for (var codeSample in method['x-code-samples']) {
                if (method['x-code-samples'][codeSample].lang === 'SHELL') {
                    found = true;
                    method['x-code-samples'][codeSample] = shellCodeSample;
                }
            }
            if (!found) {
                method['x-code-samples'].push(shellCodeSample);
            }
            // create javascript code
            var operationVariable = method.operationId.split('-')
                .map(function (part, index) { return index ? (0, util_1.capitalize)(part) : part; }).join('').trim();
            var jsCode = [];
            // turn query string into search params
            var urlVar = '';
            if (originalPath.includes('?')) {
                var pieces = originalPath.split('?');
                urlVar = operationVariable + 'URL';
                jsCode.push("const ".concat(urlVar, " = new URL('").concat(pieces[0], "')"));
                jsCode.push("".concat(urlVar, ".search = new URLSearchParams({"));
                pieces[1].split('&').forEach(function (keyval) {
                    var smallPieces = keyval.split('=');
                    jsCode.push("  ".concat(smallPieces[0], ": '").concat(smallPieces[1], "'"));
                });
                jsCode.push('})');
            }
            jsCode.push("const ".concat(operationVariable, " = await fetch("));
            jsCode.push("  ".concat(urlVar || "'" + originalPath + "'", ", {"));
            jsCode.push("   method: '".concat(lMethod.toUpperCase(), "',"));
            if (!originalPath.includes('public')) {
                jsCode.push('   headers: {');
                jsCode.push('    \'Authorization\': \'Bearer 598d9e1105\'');
                if (data) {
                    jsCode[jsCode.length - 1] += ',';
                    jsCode.push('    \'Content-Type\': \'application/json\'');
                }
                jsCode.push('   }');
            }
            if (data) {
                jsCode[jsCode.length - 1] += ',';
                var lines = "   body: JSON.stringify(".concat(JSON.stringify(data, null, 2), ")").replace(/\n/g, '\n   ').split('\n');
                jsCode = jsCode.concat(lines);
            }
            jsCode.push(' })');
            var firstResponse = Object.keys(method.responses)[0] || '';
            if ((_r = (_q = (_p = (_o = (_m = (_l = method.responses) === null || _l === void 0 ? void 0 : _l[firstResponse]) === null || _m === void 0 ? void 0 : _m.content) === null || _o === void 0 ? void 0 : _o['application/json']) === null || _p === void 0 ? void 0 : _p.examples) === null || _q === void 0 ? void 0 : _q['example-1']) === null || _r === void 0 ? void 0 : _r.value) {
                jsCode.push(' .then(response => response.json())');
                switch ((_y = (_x = (_w = (_v = (_u = (_t = (_s = method.responses) === null || _s === void 0 ? void 0 : _s[firstResponse]) === null || _t === void 0 ? void 0 : _t.content) === null || _u === void 0 ? void 0 : _u['application/json']) === null || _v === void 0 ? void 0 : _v.examples) === null || _w === void 0 ? void 0 : _w['example-1']) === null || _x === void 0 ? void 0 : _x.value) === null || _y === void 0 ? void 0 : _y.element) {
                    case 'shoji:catalog':
                        jsCode.push(' .then(jsonResponse => jsonResponse.index)');
                        break;
                    case 'shoji:entity':
                        jsCode.push(' .then(jsonResponse => jsonResponse.body)');
                        break;
                    case 'shoji:view':
                        jsCode.push(' .then(jsonResponse => jsonResponse.value)');
                        break;
                }
            }
            // overwrite existing JAVASCRIPT array element if exists
            found = false;
            var jsCodeSample = {
                lang: 'JAVASCRIPT',
                source: (0, util_1.replaceApos)(jsCode.join('\n')),
                syntaxLang: 'javascript'
            };
            for (var codeSample in method['x-code-samples']) {
                if (method['x-code-samples'][codeSample].lang === 'JAVASCRIPT') {
                    found = true;
                    method['x-code-samples'][codeSample] = jsCodeSample;
                }
            }
            if (!found) {
                method['x-code-samples'].push(jsCodeSample);
            }
            // set x-code-samples
            // if you do this you'll overwrite any R or python code samples by mistake
            // method['x-code-samples'] = samples
        });
    });
}
function deriveSummary(method, path) {
    var pathParts = path.split('/');
    var lastParam = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
    var lastLastParam = pathParts.length > 3 ? pathParts[pathParts.length - 4] : '';
    var obj = lastParam.includes('_id') ? lastParam.replace(/[{}]|_id/g, '') : '';
    switch (lastParam) {
        case 'login':
            return 'Log in';
        case 'logout':
            return 'Log out';
    }
    if (obj) {
        switch (method) {
            case 'get':
                return "".concat((0, util_1.capitalize)(obj), " details");
            case 'post':
                return "Create ".concat(obj);
            case 'patch':
            case 'put':
                return "Update ".concat(obj);
            case 'delete':
                return "Delete ".concat(obj);
        }
    }
    switch (method) {
        case 'get':
            return "List ".concat(pluralize(lastLastParam, 1)).concat(lastLastParam ? ' ' : '').concat(pluralize(lastParam));
        case 'post':
            return "Create ".concat(pluralize(lastLastParam, 1)).concat(lastLastParam ? ' ' : '').concat(pluralize(lastParam, 1));
        case 'put':
        case 'patch':
            return "Update ".concat(pluralize(lastLastParam, 1)).concat(lastLastParam ? ' ' : '').concat(pluralize(lastParam));
        case 'delete':
            return "Delete ".concat(pluralize(lastLastParam, 1)).concat(lastLastParam ? ' ' : '').concat(pluralize(lastParam));
    }
    return 'SUMMARY';
}
function deriveTag(path, config) {
    for (var _i = 0, _a = config.tags; _i < _a.length; _i++) {
        var item = _a[_i];
        if (path.includes(item[0]))
            return item.length > 1 ? item[1] : (0, util_1.capitalize)(item[0]);
    }
    return 'Miscellaneous';
}
function filterUrl(config, inputUrl) {
    var filteredUrl = inputUrl;
    // filteredUrl = filteredUrl.replace(/by_name\/.*\//, 'by_name/{dataset-name}/')
    for (var key in config.pathReplace) {
        var re = new RegExp(key, 'g');
        filteredUrl = filteredUrl.replace(re, config.pathReplace[key]);
    }
    return filteredUrl;
}
function generateSamples(spec, outputFilename, config) {
    // createJsonSchemas(spec)
    createXcodeSamples(spec, config);
    // perform the final strip where we take out things we don't want to see in final spec
    Object.keys(spec.paths).forEach(function (path) {
        Object.keys(spec.paths[path]).forEach(function (lMethod) {
            delete spec.paths[path][lMethod].meta;
        });
    });
    var stripedSpec = JSON.parse(JSON.stringify(spec)
        .replace(/stable\.crunch\.io/g, 'app.crunch.io')
        .replace(/A\$dfasdfasdf/g, 'abcdef')
        .replace(/captain@crunch.io/g, 'user@crunch.io'));
    (0, fs_1.writeFileSync)(outputFilename, JSON.stringify(stripedSpec, null, 2));
    (0, fs_1.writeFileSync)(outputFilename + '.yaml', YAML.dump(stripedSpec));
    console.log("".concat(outputFilename, " created"));
}
exports.generateSamples = generateSamples;
function shouldIncludeEntry(item, apiBasePath) {
    var _a, _b, _c;
    if (item.request.url.includes(apiBasePath)) {
        return true;
    }
    else {
        // requests to superadmin will not have url in path
        // I also check instead for html vs json response
        if (item.request.url.includes('api') || ((_c = (_b = (_a = item.response) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.mimeType) === null || _c === void 0 ? void 0 : _c.includes('application/json'))) {
            console.log('apiBasePath mismatch', item.request.url);
            return false;
        }
        return true;
    }
}
function harEntryToSpec(item, spec, methodList, config) {
    if (!shouldIncludeEntry(item, config.apiBasePath))
        return;
    // filter and collapse path urls
    var filteredUrl = filterUrl(config, item.request.url);
    // continue if url is blank
    if (filteredUrl === '')
        return;
    // create path
    if (!spec.paths[filteredUrl])
        addPath(filteredUrl, spec);
    // create method
    var method = item.request.method.toLowerCase();
    if (!spec.paths[filteredUrl][method]) {
        addMethod(method, filteredUrl, item.request.url, methodList, spec, config);
    }
    var specMethod = spec.paths[filteredUrl][method];
    // set original path to last request received
    specMethod.meta.originalPath = item.request.url;
    // generate response
    addResponse(item.response.status, method, specMethod);
    // add query string parameters
    addQueryStringParams(specMethod, item.request.queryString);
    // merge request example
    if (item.request.bodySize > 0 && item.response.status < 400) {
        mergeRequestExample(specMethod, item.request.postData);
    }
    // merge response example
    if (item.response.bodySize > 0) {
        mergeResponseExample(specMethod, item.response.status.toString(), item.response.content, method, filteredUrl);
    }
}
function normalizeSpec(spec, config) {
    // sort paths
    spec.paths = sortJson(spec.paths, { depth: 200 });
    // global replace
    var specString = JSON.stringify(spec);
    for (var key in config.replace) {
        var re = new RegExp(key, 'g');
        specString = specString.replace(re, config.replace[key]);
    }
    var outputSpec = parseJson(specString);
    (0, util_1.replaceValuesInPlace)(outputSpec, config);
    return outputSpec;
}
function writeSpecToFiles(spec, methodList, outputFilename) {
    (0, fs_1.writeFileSync)(outputFilename, JSON.stringify(spec, null, 2));
    (0, fs_1.writeFileSync)(outputFilename + '.yaml', YAML.dump(spec));
    writeExamples(spec);
    // write path list to debug
    (0, fs_1.writeFileSync)('output/pathList.txt', Object.keys(spec.paths).join('\n'));
    // write method list to debug
    (0, fs_1.writeFileSync)('output/methodList.txt', methodList.sort().join('\n'));
}
function generateSpec(inputFilenames, outputFilename, config) {
    // load input files into memory
    var inputHars = inputFilenames.map(function (filename) { return parseHarFile(filename); });
    var har = merge.all(inputHars);
    console.log("Network requests found in har file(s): ".concat(har.log.entries.length));
    // Loop through HAR entries and get spec
    var spec = (0, openapi_v3_types_1.createEmptyApiSpec)();
    var methodList = [];
    har.log.entries.sort().forEach(function (item) {
        harEntryToSpec(item, spec, methodList, config);
    });
    // ia am removing this for now because full examples will give us better json schema detection
    // shortenExamples(spec);
    var outputSpec = normalizeSpec(spec, config);
    writeSpecToFiles(outputSpec, methodList, outputFilename);
    console.log('Paths created:', Object.keys(outputSpec.paths).length);
    console.log('Operations created:', methodList.length);
}
exports.generateSpec = generateSpec;
function mergeFiles(masterFilename, toMergeFilename, outputFilename) {
    // load input file into memory
    var master = parseJsonFile(masterFilename);
    var toMerge = parseJsonFile(toMergeFilename);
    // only copy over methods that do not exist in master
    for (var path in toMerge.paths) {
        if (!master.paths[path]) {
            master.paths[path] = toMerge.paths[path];
        }
        else {
            for (var method in toMerge.paths[path]) {
                if (!master.paths[path][method])
                    master.paths[path][method] = toMerge.paths[path][method];
            }
        }
    }
    master.paths = sortJson(master.paths, { depth: 200 });
    (0, fs_1.writeFileSync)(outputFilename, JSON.stringify(master, null, 2));
    (0, fs_1.writeFileSync)(outputFilename + '.yaml', YAML.safeDump(master));
    console.log("".concat(outputFilename, " created"));
}
exports.mergeFiles = mergeFiles;
function mergeRequestExample(specMethod, postData) {
    // if (postData.mimeType === null) { // data sent
    if (_.has(postData, 'text')) { // data sent
        try {
            var toParse = postData.encoding === 'base64'
                ? Buffer.from(postData.text, 'base64').toString
                : postData.text;
            var data = JSON.parse(toParse);
            if (specMethod.requestBody == null) {
                specMethod.requestBody = {
                    content: {
                        'application/json': {
                            examples: {
                                'example-0001': {
                                    value: {}
                                }
                            },
                            schema: {
                                properties: {},
                                type: 'object'
                            }
                        }
                    }
                };
            }
            var examples = void 0;
            if ('content' in specMethod.requestBody) {
                examples = specMethod.requestBody.content['application/json'].examples;
            }
            // do not add example if it is duplicate of another example
            var dataString = JSON.stringify(data);
            for (var example in examples) {
                var compare = JSON.stringify(examples[example].value);
                if (dataString === compare)
                    return;
            }
            // merge this object with other objects found
            examples['example-0001'].value = merge(examples['example-0001'].value, data, { arrayMerge: util_1.overwriteMerge });
            // also add a new example
            examples["example-".concat((0, util_1.pad)(Object.keys(examples).length + 1, 4))] = {
                value: data
            };
        }
        catch (err) {
        }
    }
    else { // binary file sent
        if (specMethod.requestBody == null) {
            specMethod.requestBody = {
                content: {
                    'multipart/form-data': {
                        schema: {
                            properties: {
                                filename: {
                                    description: '',
                                    format: 'binary',
                                    type: 'string'
                                }
                            },
                            type: 'object'
                        }
                    }
                }
            };
        }
    }
}
function mergeResponseExample(specMethod, statusString, content, method, filteredUrl) {
    try {
        var data = JSON.parse(content.encoding === 'base64' ? Buffer.from(content.text, 'base64').toString() : content.text);
        // remove data traceback if exists
        delete data.traceback;
        if (data !== null && Object.keys(data).length > 1) {
            // create response example if it doesn't exist
            if (!specMethod.responses[statusString].content) {
                specMethod.responses[statusString].content = {
                    'application/json': {
                        examples: {
                            'example-0001': {
                                value: {}
                            }
                        },
                        schema: {
                            properties: {},
                            type: 'object'
                        }
                    }
                };
            }
            // const examples = specMethod.responses[statusString].content["application/json"].examples['example-1']
            var examples = specMethod.responses[statusString].content['application/json'].examples;
            // do not add example if it is duplicate of another example
            var dataString = JSON.stringify(data);
            for (var example in examples) {
                var compare = JSON.stringify(examples[example].value);
                if (dataString === compare)
                    return;
            }
            // merge current response into other response examples
            examples['example-0001'].value = merge(examples['example-0001'].value, data, { arrayMerge: util_1.overwriteMerge });
            // also add a new example
            examples["example-".concat((0, util_1.pad)(Object.keys(examples).length + 1, 4))] = {
                value: data
            };
            // set endpoint description from shoji description
            if (data.description)
                specMethod.description = data.description;
            // capture metadata
            if (data.element)
                specMethod.meta.element = data.element;
        }
    }
    catch (err) {
    }
}
function parseHarFileIntoIndividualFiles(filename) {
    var file = (0, fs_1.readFileSync)("input/".concat(filename), 'utf8');
    try {
        var data_1 = JSON.parse(file);
        if (!_.has(data_1, 'log')) {
            console.log('Invalid har file');
            (0, process_1.exit)(1);
        }
        // decode base64 now before writing pretty har file
        data_1.log.entries.forEach(function (item, index) {
            if (item.response.content.encoding === 'base64' && item.response.content.text) {
                data_1.log.entries[index].response.content.text = Buffer.from(item.response.content.text, 'base64').toString();
                delete data_1.log.entries[index].response.content.encoding;
            }
            (0, fs_1.writeFileSync)("output/individualHars/".concat(filename.replace(/\//g, '-'), "-").concat(index, ".json"), JSON.stringify(data_1.log.entries[index], null, 2));
        });
    }
    catch (err) {
        console.log("".concat(filename, " contains invalid json"));
        (0, process_1.exit)(1);
    }
}
exports.parseHarFileIntoIndividualFiles = parseHarFileIntoIndividualFiles;
function parseHarFile(filename) {
    var file = (0, fs_1.readFileSync)(filename, 'utf8');
    try {
        var data_2 = JSON.parse(file);
        if (!_.has(data_2, 'log')) {
            console.log('Invalid har file');
            (0, process_1.exit)(1);
        }
        // decode base64 now before writing pretty har file
        data_2.log.entries.forEach(function (item, index) {
            if (item.response.content.encoding === 'base64' && item.response.content.text) {
                data_2.log.entries[index].response.content.text = Buffer.from(item.response.content.text, 'base64').toString();
                delete data_2.log.entries[index].response.content.encoding;
            }
        });
        // save pretty har file
        (0, fs_1.writeFileSync)("output/".concat(filename.replace(/\//g, '-')), JSON.stringify(data_2, null, 2));
        return data_2;
    }
    catch (err) {
        console.log("".concat(filename, " contains invalid json"));
        (0, process_1.exit)(1);
    }
}
function parseJsonFile(filename) {
    var file = (0, fs_1.readFileSync)(filename, 'utf8');
    try {
        return JSON.parse(file);
    }
    catch (err) {
        console.log("".concat(filename, " contains invalid json"));
        (0, process_1.exit)(1);
    }
}
function writeExamples(spec) {
    var specExamples = {};
    Object.keys(spec.paths).forEach(function (path) {
        specExamples[path] = {};
        Object.keys(spec.paths[path]).forEach(function (lMethod) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            if (lMethod === 'parameters')
                return;
            if (lMethod === 'options')
                return;
            specExamples[path][lMethod] = {
                request: {},
                response: {}
            };
            var method = spec.paths[path][lMethod];
            // find request examples
            var examples = (_c = (_b = (_a = method.requestBody) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b['application/json']) === null || _c === void 0 ? void 0 : _c.examples;
            if (examples) {
                // if valid examples contain contain shoji and non-shoji requests then we have to delete the non-shoji
                // requests in order to not display them as examples and not pollute our json schema
                var shoji = false;
                for (var example in examples) {
                    if ((_d = examples[example].value.element) === null || _d === void 0 ? void 0 : _d.includes('shoji'))
                        shoji = true;
                }
                // add examples to list
                var exampleCount = Object.keys(examples).length;
                var exampleNum = 0;
                for (var example in examples) {
                    exampleNum++;
                    if (exampleNum < 2 || exampleCount !== 2) {
                        if (!shoji || ((_e = examples[example].value.element) === null || _e === void 0 ? void 0 : _e.includes('shoji'))) {
                            specExamples[path][lMethod].request[example] = examples[example].value;
                        }
                        else {
                            // console.log('non-shoji found in', path, lMethod)
                        }
                    }
                }
            }
            // look at responses
            for (var status_1 in method.responses) {
                examples = (_j = (_h = (_g = (_f = method.responses) === null || _f === void 0 ? void 0 : _f[status_1]) === null || _g === void 0 ? void 0 : _g.content) === null || _h === void 0 ? void 0 : _h['application/json']) === null || _j === void 0 ? void 0 : _j.examples;
                if (examples) {
                    specExamples[path][lMethod].response[status_1] = {};
                    var exampleCount = Object.keys(examples).length;
                    var exampleNum = 0;
                    for (var example in examples) {
                        exampleNum++;
                        if (exampleNum < 2 || exampleCount !== 2)
                            specExamples[path][lMethod].response[status_1][example] = examples[example].value;
                    }
                }
            }
        });
    });
    // sort examples
    var sortedExamples = sortJson(specExamples, { depth: 200 });
    // dump as yaml
    (0, fs_1.writeFileSync)('output/examples.yaml', YAML.dump(sortedExamples));
    (0, fs_1.writeFileSync)('output/examples.json', JSON.stringify(sortedExamples, null, 2));
}
function validateExampleList(exampleObject, exampleObjectName, exampleFilename) {
    var allExamples = [];
    var publishExamplesArray = [];
    for (var exampleName in exampleObject) {
        allExamples.push(JSON.stringify(exampleObject[exampleName]));
        publishExamplesArray.push(exampleObject[exampleName]);
    }
    // renumber examples
    var padWidth = Math.floor(publishExamplesArray.length / 10) + 1;
    var publishExamples = {};
    var firstExample;
    for (var i = 0; i < publishExamplesArray.length; i++) {
        var exampleName = "example-".concat((0, util_1.pad)(i + 1, padWidth));
        if (firstExample === undefined)
            firstExample = publishExamplesArray[i];
        publishExamples[exampleName] = { value: publishExamplesArray[i] };
    }
    return {
        allExamples: allExamples,
        publishExamples: publishExamples,
        firstExample: firstExample
    };
}
function generateSchema(exampleFilename) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var masterExamples, oldSpec, newSpec, _c, _d, _i, path, _loop_1, _e, _f, _g, method;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    masterExamples = parseJsonFile(exampleFilename);
                    oldSpec = parseJsonFile('output/examples.spec.json');
                    newSpec = {
                        openapi: oldSpec.openapi,
                        info: oldSpec.info,
                        servers: oldSpec.servers,
                        paths: {}
                    };
                    _c = [];
                    for (_d in masterExamples)
                        _c.push(_d);
                    _i = 0;
                    _h.label = 1;
                case 1:
                    if (!(_i < _c.length)) return [3 /*break*/, 6];
                    path = _c[_i];
                    // start with path object from examples spec
                    if (oldSpec.paths[path]) {
                        newSpec.paths[path] = oldSpec.paths[path];
                    }
                    else {
                        newSpec.paths[path] = {};
                    }
                    _loop_1 = function (method) {
                        var operationId, methodObject, numExamples, _j, allExamples, publishExamples, firstExample, jsonSchema_1, _k, _loop_2, _l, _m, _o, statusCode;
                        return __generator(this, function (_p) {
                            switch (_p.label) {
                                case 0:
                                    // create a spec if none exists. i.e. we added an example where there was no unit test
                                    if (!newSpec.paths[path][method]) {
                                        operationId = path.replace(/(^\/|\/$|{|})/g, '').replace(/\//g, '-');
                                        operationId = "".concat(method, "-").concat(operationId);
                                        newSpec.paths[path][method] = {
                                            operationId: operationId,
                                            summary: operationId,
                                            description: '',
                                            parameters: [],
                                            responses: {},
                                            tags: ['UNKNOWN'],
                                            meta: {
                                                originalPath: "https://app.crunch.io/api".concat(path)
                                            }
                                        };
                                    }
                                    methodObject = newSpec.paths[path][method];
                                    numExamples = Object.keys(masterExamples[path][method].request).length;
                                    console.log(path, method, 'request', numExamples);
                                    if (!numExamples) return [3 /*break*/, 3];
                                    _j = validateExampleList(masterExamples[path][method].request, "".concat(path, " ").concat(method, " requests"), exampleFilename), allExamples = _j.allExamples, publishExamples = _j.publishExamples, firstExample = _j.firstExample;
                                    return [4 /*yield*/, quicktypeJSON('schema', [path, method, 'request'].join('-'), allExamples)];
                                case 1:
                                    jsonSchema_1 = _p.sent();
                                    if ((_a = jsonSchema_1.properties) === null || _a === void 0 ? void 0 : _a.element) {
                                        switch (firstExample.element) {
                                            case 'shoji:entity':
                                                jsonSchema_1.properties.element = {
                                                    $ref: '#/components/schemas/Shoji-entity-element'
                                                };
                                                break;
                                            case 'shoji:catalog':
                                                jsonSchema_1.properties.element = {
                                                    $ref: '#/components/schemas/Shoji-catalog-element'
                                                };
                                                break;
                                            case 'shoji:view':
                                                jsonSchema_1.properties.element = {
                                                    $ref: '#/components/schemas/Shoji-view-element'
                                                };
                                                break;
                                        }
                                    }
                                    if (!methodObject.requestBody) {
                                        methodObject.requestBody = {
                                            content: {
                                                'application/json': {}
                                            }
                                        };
                                    }
                                    _k = methodObject.requestBody.content['application/json'];
                                    return [4 /*yield*/, toOpenApiSchema(jsonSchema_1)["catch"](function (err) {
                                            console.log('ERROR CONVERTING TO OPENAPI SCHEMA, USING JSON SCHEMA');
                                            methodObject.requestBody.content['application/json'].schema = jsonSchema_1;
                                        })];
                                case 2:
                                    _k.schema = _p.sent();
                                    methodObject.requestBody.content['application/json'].examples = publishExamples;
                                    _p.label = 3;
                                case 3:
                                    _loop_2 = function (statusCode) {
                                        var numExamples_1, exampleStats, jsonSchema_2, _q;
                                        return __generator(this, function (_r) {
                                            switch (_r.label) {
                                                case 0:
                                                    numExamples_1 = Object.keys(masterExamples[path][method].response[statusCode]).length;
                                                    console.log(path, method, statusCode, numExamples_1);
                                                    if (!numExamples_1) return [3 /*break*/, 3];
                                                    exampleStats = validateExampleList(masterExamples[path][method].response[statusCode], "".concat(path, " ").concat(method, " requests"), exampleFilename);
                                                    return [4 /*yield*/, quicktypeJSON('schema', [path, method, 'request'].join('-'), exampleStats.allExamples)];
                                                case 1:
                                                    jsonSchema_2 = _r.sent();
                                                    if ((_b = jsonSchema_2.properties) === null || _b === void 0 ? void 0 : _b.element) {
                                                        switch (exampleStats.firstExample.element) {
                                                            case 'shoji:entity':
                                                                jsonSchema_2.properties.element = {
                                                                    $ref: '#/components/schemas/Shoji-entity-element'
                                                                };
                                                                break;
                                                            case 'shoji:catalog':
                                                                jsonSchema_2.properties.element = {
                                                                    $ref: '#/components/schemas/Shoji-catalog-element'
                                                                };
                                                                break;
                                                            case 'shoji:view':
                                                                jsonSchema_2.properties.element = {
                                                                    $ref: '#/components/schemas/Shoji-view-element'
                                                                };
                                                                break;
                                                        }
                                                    }
                                                    if (!methodObject.responses[statusCode]) {
                                                        methodObject.responses[statusCode] = {
                                                            content: {
                                                                'application/json': {}
                                                            }
                                                        };
                                                    }
                                                    _q = methodObject.responses[statusCode].content['application/json'];
                                                    return [4 /*yield*/, toOpenApiSchema(jsonSchema_2)["catch"](function (err) {
                                                            console.log('ERROR CONVERTING TO OPENAPI SCHEMA, USING JSON SCHEMA');
                                                            methodObject.responses[statusCode].content['application/json'].schema = jsonSchema_2;
                                                        })];
                                                case 2:
                                                    _q.schema = _r.sent();
                                                    methodObject.responses[statusCode].content['application/json'].examples = exampleStats.publishExamples;
                                                    _r.label = 3;
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _l = [];
                                    for (_m in masterExamples[path][method].response)
                                        _l.push(_m);
                                    _o = 0;
                                    _p.label = 4;
                                case 4:
                                    if (!(_o < _l.length)) return [3 /*break*/, 7];
                                    statusCode = _l[_o];
                                    return [5 /*yield**/, _loop_2(statusCode)];
                                case 5:
                                    _p.sent();
                                    _p.label = 6;
                                case 6:
                                    _o++;
                                    return [3 /*break*/, 4];
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    _e = [];
                    for (_f in masterExamples[path])
                        _e.push(_f);
                    _g = 0;
                    _h.label = 2;
                case 2:
                    if (!(_g < _e.length)) return [3 /*break*/, 5];
                    method = _e[_g];
                    return [5 /*yield**/, _loop_1(method)];
                case 3:
                    _h.sent();
                    _h.label = 4;
                case 4:
                    _g++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, newSpec];
            }
        });
    });
}
exports.generateSchema = generateSchema;
function updateXcode(filename, config) {
    console.log(filename);
    // input file yaml to json object
    var file = YAML.safeLoad((0, fs_1.readFileSync)(filename));
    // generate new samples
    createXcodeSamples(file, config);
    // write file back to orig yaml
    (0, fs_1.writeFileSync)(filename, YAML.safeDump(file));
}
exports.updateXcode = updateXcode;
function QAPaths(spec) {
    Object.keys(spec.paths).forEach(function (path) {
        Object.keys(spec.paths[path]).forEach(function (lMethod) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            if (lMethod === 'parameters')
                return;
            var method = spec.paths[path][lMethod];
            var examples = (_c = (_b = (_a = method.requestBody) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b['application/json']) === null || _c === void 0 ? void 0 : _c.examples;
            var firstExample;
            if (examples) {
                var exampleList = Object.keys(examples);
                for (var _i = 0, exampleList_1 = exampleList; _i < exampleList_1.length; _i++) {
                    var exampleName = exampleList_1[_i];
                    var exampleData = (_h = (_g = (_f = (_e = (_d = method.requestBody) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e['application/json']) === null || _f === void 0 ? void 0 : _f.examples) === null || _g === void 0 ? void 0 : _g[exampleName]) === null || _h === void 0 ? void 0 : _h.value;
                    if (!firstExample)
                        firstExample = exampleData; // to use later
                    // log places where examples do not use shoji elements so we can correct them manually
                    var elementType = exampleData.element;
                    if (!elementType) {
                        console.log(path, lMethod, exampleName, 'NO SHOJI ELEMENT');
                    }
                }
            }
            // search json schema for element is string not ref and change them
            var requestSchemaElement = (_o = (_m = (_l = (_k = (_j = method.requestBody) === null || _j === void 0 ? void 0 : _j.content) === null || _k === void 0 ? void 0 : _k['application/json']) === null || _l === void 0 ? void 0 : _l.schema) === null || _m === void 0 ? void 0 : _m.properties) === null || _o === void 0 ? void 0 : _o.element;
            if (requestSchemaElement) {
                if (!requestSchemaElement.$ref) {
                    console.log(requestSchemaElement);
                    console.log('element', firstExample.element);
                    switch (firstExample.element) {
                        case 'shoji:order':
                            method.requestBody.content['application/json'].schema.properties.element = { $ref: '#/components/schemas/Shoji-order-element' };
                            break;
                        case 'shoji:entity':
                            method.requestBody.content['application/json'].schema.properties.element = { $ref: '#/components/schemas/Shoji-entity-element' };
                            break;
                        case 'shoji:catalog':
                            method.requestBody.content['application/json'].schema.properties.element = { $ref: '#/components/schemas/Shoji-catalog-element' };
                            break;
                        case 'shoji:view':
                            method.requestBody.content['application/json'].schema.properties.element = { $ref: '#/components/schemas/Shoji-view-element' };
                            break;
                    }
                }
            }
            if (method.responses) {
                for (var responseCode in method.responses) {
                    // delete 404 where nothing matches URI
                    if (responseCode === '404') {
                        var responseExampleMessage = (_s = (_r = (_q = (_p = method.responses[responseCode].content) === null || _p === void 0 ? void 0 : _p['application/json']) === null || _q === void 0 ? void 0 : _q.examples['example-1']) === null || _r === void 0 ? void 0 : _r.value) === null || _s === void 0 ? void 0 : _s.message;
                        if (responseExampleMessage === 'Nothing matches the given URI') {
                            console.log(responseExampleMessage);
                            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                            delete method.responses[responseCode];
                        }
                    }
                    // turn 202 responses into standard object
                    if (responseCode === '202') {
                        method.responses[responseCode] = {
                            content: {
                                'application/json': {
                                    examples: {
                                        'example-1': {
                                            value: {
                                                element: 'shoji:view',
                                                self: 'https://app.crunch.io/api/datasets/a5a3d3890a6e453d85662e9c66a9b7e9/decks/5f9720247f1145d6918d0a4463b17131/export/',
                                                value: 'https://app.crunch.io/api/progress/3Aa5a3d3890a6e453d85662e9c66a9b7e9%24a3af7cb7765f3fee01c49225bf34415d/'
                                            }
                                        }
                                    },
                                    schema: {
                                        $ref: '#/components/schemas/202-response'
                                    }
                                }
                            },
                            description: 'Asynchronous task started. \n\nThe `location` header contains a URL for the resource requested, which will become available when the asynchronous task has completed.\n\nThe `value` element in the JSON response contains a progress URL which you can query to monitor task completion. See **Task progress** endpoint for more details.',
                            headers: {
                                Location: {
                                    description: 'URL for resource requested, available when the asynchronous task has completed.',
                                    schema: {
                                        type: 'string'
                                    }
                                }
                            }
                        };
                    }
                }
            }
        });
    });
}
function postProduction(config) {
    recursive('/home/dcarr/git/crunch/zoom/server/src/cr/server/api', ['*.py*'], 
    // eslint-disable-next-line n/handle-callback-err
    function (err, files) {
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var filename = files_1[_i];
            if (filename.includes('openapi') && !filename.includes('openapi.json')) {
                console.log("ANALYZING OPENAPI FILE ".concat(filename));
                var file = YAML.safeLoad((0, fs_1.readFileSync)(filename));
                // generate new samples
                createXcodeSamples(file, config);
                QAPaths(file);
                // write file back to orig yaml
                (0, fs_1.writeFileSync)(filename, YAML.safeDump(file));
            }
        }
    });
}
exports.postProduction = postProduction;
function listEndpoints() {
    var file = (0, fs_1.readFileSync)('/home/dcarr/git/crunch/zoom/server/src/cr/server/api/static/openapi.json', 'utf8');
    var spec = JSON.parse(file);
    Object.keys(spec.paths).forEach(function (path) {
        Object.keys(spec.paths[path]).forEach(function (lMethod) {
            if (lMethod !== 'parameters') {
                var method = spec.paths[path][lMethod];
                var methodPath = "".concat(lMethod.toUpperCase(), " ").concat(path);
                var url = "https://crunch.io/api/reference/#".concat(lMethod, "-").concat(path.replace(/[{}]/g, '-'));
                console.log([
                    methodPath,
                    method.summary,
                    url
                ].join('\t'));
            }
        });
    });
}
exports.listEndpoints = listEndpoints;
