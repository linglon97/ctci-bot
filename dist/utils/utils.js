"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myAssert = void 0;
function myAssert(value, message) {
    if (value === null || value === undefined) {
        throw Error(message);
    }
}
exports.myAssert = myAssert;
