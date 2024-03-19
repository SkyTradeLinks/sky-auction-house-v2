"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lintProgramIdlScript_1 = __importDefault(require("@formfunction-hq/formfunction-program-shared/dist/scripts/lintProgramIdlScript"));
function lintProgramIdl() {
    (0, lintProgramIdlScript_1.default)("src/idl/AuctionHouse.ts");
}
lintProgramIdl();
