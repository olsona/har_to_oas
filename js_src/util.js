"use strict";
exports.__esModule = true;
exports.overwriteMerge = exports.replaceApos = exports.replaceValuesInPlace = exports.capitalize = exports.pad = void 0;
var jsonPath = require("jsonPath");
var _ = require("lodash");
function pad(m, width, z) {
    if (z === void 0) { z = '0'; }
    var n = m.toString();
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
exports.pad = pad;
function capitalize(s) {
    if (typeof s !== 'string')
        return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}
exports.capitalize = capitalize;
function replaceApos(s) { return s; } // rapidoc now supports single quote
exports.replaceApos = replaceApos;
// const replaceApos = (s: string): string => s{regex: '/'/g', "&apos;")
function constructJsonPath(partialPath) {
    if (_.isString(partialPath)) {
        return '$..' + partialPath;
    }
    return '$..' + partialPath.join('..');
}
function replaceValuesInPlace(object, config) {
    config.valueReplace.forEach(function (rule) {
        var partialPath = rule.path;
        var replacement = rule.replacement;
        var paths = jsonPath.paths(object, constructJsonPath(partialPath));
        paths.forEach(function (path) {
            _.set(object, path.slice(1), replacement);
        });
    });
}
exports.replaceValuesInPlace = replaceValuesInPlace;
function overwriteMerge(destinationArray, sourceArray) { return sourceArray; }
exports.overwriteMerge = overwriteMerge;
