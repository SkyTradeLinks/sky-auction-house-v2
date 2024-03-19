"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getProgrammableNftCreateArgs({ assetData, printSupply, }) {
    const args = {
        __kind: "V1",
        assetData,
        decimals: 0,
        printSupply: printSupply == 0
            ? { __kind: "Zero" }
            : { __kind: "Limited", fields: [printSupply] },
    };
    return args;
}
exports.default = getProgrammableNftCreateArgs;
//# sourceMappingURL=getProgrammableNftCreateArgs.js.map