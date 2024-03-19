"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuctionHouse_1 = require("idl/AuctionHouse");
const AuctionHouseIdlWithDeprecatedInstructions0_1 = require("idl/AuctionHouseIdlWithDeprecatedInstructions0");
const AuctionHouseIdlWithDeprecatedInstructions1_1 = __importDefault(require("idl/AuctionHouseIdlWithDeprecatedInstructions1"));
const AuctionHouseIdlWithDeprecatedInstructions2_1 = __importDefault(require("idl/AuctionHouseIdlWithDeprecatedInstructions2"));
const AuctionHouseIdlWithDeprecatedInstructions3_1 = __importDefault(require("idl/AuctionHouseIdlWithDeprecatedInstructions3"));
// This includes older program IDLs which are now deprecated but still needed
// for legacy transaction parsing.
const AUCTION_HOUSE_PROGRAM_IDLS = [
    AuctionHouse_1.IDL,
    AuctionHouseIdlWithDeprecatedInstructions3_1.default,
    AuctionHouseIdlWithDeprecatedInstructions2_1.default,
    AuctionHouseIdlWithDeprecatedInstructions1_1.default,
    AuctionHouseIdlWithDeprecatedInstructions0_1.AUCTION_HOUSE_IDL_WITH_DEPRECATED_INSTRUCTIONS_0, // This is the oldest deprecated IDL.
];
exports.default = AUCTION_HOUSE_PROGRAM_IDLS;
//# sourceMappingURL=AuctionHouseProgramIdls.js.map