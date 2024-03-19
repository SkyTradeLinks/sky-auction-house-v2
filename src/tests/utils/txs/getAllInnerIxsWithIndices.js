"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAllInnerIxsWithIndices(parsedTx) {
    var _a, _b;
    return (_b = (_a = parsedTx.meta) === null || _a === void 0 ? void 0 : _a.innerInstructions) === null || _b === void 0 ? void 0 : _b.reduce((acc, currVal) => [
        ...acc,
        ...currVal.instructions.map((ix, ixInnerIndex) => ({
            ix,
            ixIndex: currVal.index,
            ixInnerIndex,
        })),
    ], []);
}
exports.default = getAllInnerIxsWithIndices;
