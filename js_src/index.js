"use strict";
exports.__esModule = true;
var process_1 = require("process");
var lib_1 = require("./lib");
var recursive = require("recursive-readdir");
if (process_1.argv.length < 3) {
    console.log("Usage: node ".concat(process_1.argv[1], " examples inputHarFile1.json inputHarFile2.json inputHarFile3.json..."));
    console.log("Usage: node ".concat(process_1.argv[1], " schema"));
    console.log("Usage: node ".concat(process_1.argv[1], " xcode"));
    console.log("Usage: node ".concat(process_1.argv[1], " merge masterFilename.json toMergeFilename.json outputFilename.json"));
}
else {
    var config_1;
    try {
        config_1 = require('../config.json');
    }
    catch (_a) {
        console.log('File config.json not found. Please copy config.json.template to config.json');
        (0, process_1.exit)(0);
    }
    switch (process_1.argv[2]) {
        case 'examples': {
            // grab input and output filenames
            if (process_1.argv.length < 4) {
                console.log("Usage: node ".concat(process_1.argv[1], " ").concat(process_1.argv[2], " inputHarFile1.json inputHarFile2.json inputHarFile3.json..."));
                (0, process_1.exit)(0);
            }
            var outputFilename = 'output/examples.spec.json';
            var inputFilenames = process_1.argv.slice(3);
            config_1.pathReplace[config_1.apiBasePath] = ''; // add base path to replace out
            // generate spec file
            (0, lib_1.generateSpec)(inputFilenames, outputFilename, config_1);
            break;
        }
        case 'schema': {
            if (process_1.argv.length < 4) {
                console.log("Usage: node ".concat(process_1.argv[1], " ").concat(process_1.argv[2], " examplesFilename.json"));
                (0, process_1.exit)(0);
            }
            var exampleFile = process_1.argv[3];
            (0, lib_1.generateSchema)(exampleFile)
                .then(function (spec) {
                (0, lib_1.generateSamples)(spec, 'output/schema.spec.json', config_1);
            })["catch"](function (err) { console.log(err); });
            break;
        }
        case 'xcode': {
            // xcode samples need to be generated at the end after the examples have been QAed and changed
            // loop through all openapi files
            // TODO: find another way to get these files
            recursive('/home/dcarr/git/crunch/zoom/server/src/cr/server/api', ['*.py*'], function (err, files) {
                for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                    var file = files_1[_i];
                    if (file.includes('openapi'))
                        (0, lib_1.updateXcode)(file, config_1);
                }
            });
            break;
        }
        case 'post': {
            (0, lib_1.postProduction)(config_1);
            break;
        }
        case 'list': {
            (0, lib_1.listEndpoints)();
            break;
        }
        case 'merge': {
            if (process_1.argv.length < 6) {
                console.log("Usage: node ".concat(process_1.argv[1], " ").concat(process_1.argv[2], " masterFilename.json toMergeFilename.json outputFilename.json"));
                (0, process_1.exit)(0);
            }
            var masterFilename = process_1.argv[3];
            var toMergeFilename = process_1.argv[4];
            var mergeOutput = process_1.argv[5];
            (0, lib_1.mergeFiles)(masterFilename, toMergeFilename, mergeOutput);
            break;
        }
        case 'individual': {
            (0, lib_1.parseHarFileIntoIndividualFiles)(process_1.argv[3]);
            break;
        }
        default:
            console.log("Command ".concat(process_1.argv[2], " not recognized"));
    }
}
