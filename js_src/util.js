"use strict";
exports.__esModule = true;
exports.replaceValuesInPlace = exports.capitalize = exports.pad = void 0;
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
var constructJsonPath = function (partialPath) {
    if (_.isString(partialPath)) {
        return '$..' + partialPath;
    }
    return '$..' + partialPath.join('..');
};
var replaceValuesInPlace = function (config, object) {
    config.valueReplace.forEach(function (element) {
        var partialPath = element[0];
        var replacement = element[1];
        var paths = jsonPath.paths(object, constructJsonPath(partialPath));
        paths.forEach(function (path) {
            _.set(object, path.slice(1), replacement);
        });
    });
};
exports.replaceValuesInPlace = replaceValuesInPlace;
