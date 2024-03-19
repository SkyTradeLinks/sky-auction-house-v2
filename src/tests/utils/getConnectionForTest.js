"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const web3_js_1 = require("@solana/web3.js");
const getRpcFromEnvironment_1 = __importDefault(require("address-lookup-table/utils/getRpcFromEnvironment"));
function getConnectionForTest() {
    return new web3_js_1.Connection((0, getRpcFromEnvironment_1.default)(formfunction_program_shared_1.Environment.Local), "processed");
}
exports.default = getConnectionForTest;
