"use strict";
exports.__esModule = true;
exports.xCodeScrubRules = exports.replaceApos = exports.replaceValuesInPlace = exports.capitalize = exports.pad = void 0;
var jsonPath = require("jsonPath");
var _ = require("lodash");
var pad = function (m, width, z) {
    if (z === void 0) { z = '0'; }
    var n = m.toString();
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
exports.pad = pad;
var capitalize = function (s) {
    if (typeof s !== 'string')
        return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};
exports.capitalize = capitalize;
var replaceApos = function (s) { return s; }; // rapidoc now supports single quote
exports.replaceApos = replaceApos;
// const replaceApos = (s: string): string => s{regex: '/'/g', "&apos;")
var constructJsonPath = function (partialPath) {
    if (_.isString(partialPath)) {
        return '$..' + partialPath;
    }
    return '$..' + partialPath.join('..');
};
var replaceValuesInPlace = function (object, config) {
    config.valueReplace.forEach(function (rule) {
        var partialPath = rule.path;
        var replacement = rule.replacement;
        var paths = jsonPath.paths(object, constructJsonPath(partialPath));
        paths.forEach(function (path) {
            _.set(object, path.slice(1), replacement);
        });
    });
};
exports.replaceValuesInPlace = replaceValuesInPlace;
var xCodeScrubRules = [
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
];
exports.xCodeScrubRules = xCodeScrubRules;
