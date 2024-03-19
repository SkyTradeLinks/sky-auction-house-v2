"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function getIdl() {
    return JSON.parse((0, fs_1.readFileSync)("./target/idl/auction_house.json", "utf8"));
}
exports.default = getIdl;
