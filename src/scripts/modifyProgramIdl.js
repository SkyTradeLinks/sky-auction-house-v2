"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const modifyProgramIdlScript_1 = __importDefault(require("@formfunction-hq/formfunction-program-shared/dist/scripts/modifyProgramIdlScript"));
(0, modifyProgramIdlScript_1.default)({
    decodedTransactionResultTypeFilePath: "src/types/DecodedAuctionHouseTransactionResult.ts",
    idlFilePath: "src/idl/AuctionHouse.ts",
    programName: "AuctionHouse",
});
