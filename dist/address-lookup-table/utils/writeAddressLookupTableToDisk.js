"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function writeTableAddressToDisk(tableAddress, filepath) {
    const data = {
        tableAddress: tableAddress.toString(),
    };
    (0, fs_1.writeFileSync)(filepath, JSON.stringify(data), "utf-8");
}
exports.default = writeTableAddressToDisk;
//# sourceMappingURL=writeAddressLookupTableToDisk.js.map