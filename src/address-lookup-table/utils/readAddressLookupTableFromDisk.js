"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const fs_1 = require("fs");
function readAddressLookupTableFromDisk(filepath) {
    const file = (0, fs_1.readFileSync)(filepath, "utf-8");
    const data = JSON.parse(file);
    const address = (0, formfunction_program_shared_1.stringToPublicKey)(data.tableAddress);
    if (address == null) {
        throw new Error(`Error reading and parsing local address lookup table file data at: ${filepath}`);
    }
    return address;
}
exports.default = readAddressLookupTableFromDisk;
