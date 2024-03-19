"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function expectSlightlyLessThan(a, b, numDigits = -8) {
    expect(a).toBeLessThan(b);
    expect(a).toBeCloseTo(b, numDigits);
}
exports.default = expectSlightlyLessThan;
