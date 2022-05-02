"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cheapId = void 0;
function cheapId() {
    return new Date().getTime().toString(36).split('').reverse().join('');
}
exports.cheapId = cheapId;
