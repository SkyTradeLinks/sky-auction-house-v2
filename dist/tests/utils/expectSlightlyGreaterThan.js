"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function expectSlightlyGreaterThan(a, b, numDigits = -8) {
    if (numDigits === 0) {
        expect(a).toEqual(b);
    }
    else {
        expect(a).toBeGreaterThan(b);
        expect(a).toBeCloseTo(b, numDigits);
    }
}
exports.default = expectSlightlyGreaterThan;
//# sourceMappingURL=expectSlightlyGreaterThan.js.map