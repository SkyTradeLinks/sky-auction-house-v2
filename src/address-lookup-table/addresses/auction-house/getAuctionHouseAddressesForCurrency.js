"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAntiBotAuthorityForEnvironment_1 = __importDefault(require("address-lookup-table/addresses/auction-house/getAntiBotAuthorityForEnvironment"));
const getAuctionHouseAccountKeyForCurrency_1 = __importDefault(require("address-lookup-table/addresses/auction-house/getAuctionHouseAccountKeyForCurrency"));
const getAuctionHouseAuthorityForEnvironment_1 = __importDefault(require("address-lookup-table/addresses/auction-house/getAuctionHouseAuthorityForEnvironment"));
const getAuctionHouseProgramIdForEnvironment_1 = __importDefault(require("address-lookup-table/addresses/auction-house/getAuctionHouseProgramIdForEnvironment"));
const getTreasuryMintForCurrency_1 = __importDefault(require("address-lookup-table/addresses/auction-house/getTreasuryMintForCurrency"));
const findAuctionHouseFeeAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseFeeAccount"));
const findAuctionHouseTreasuryAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseTreasuryAccount"));
function getAuctionHouseAddressesForCurrency(environment, currency, auctionHouseOverrideForTest) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const programId = (0, getAuctionHouseProgramIdForEnvironment_1.default)(environment);
        const antiBotAuthority = (0, getAntiBotAuthorityForEnvironment_1.default)(environment);
        const authority = (_a = auctionHouseOverrideForTest === null || auctionHouseOverrideForTest === void 0 ? void 0 : auctionHouseOverrideForTest.authority) !== null && _a !== void 0 ? _a : (0, getAuctionHouseAuthorityForEnvironment_1.default)(environment);
        const treasuryMint = (_b = auctionHouseOverrideForTest === null || auctionHouseOverrideForTest === void 0 ? void 0 : auctionHouseOverrideForTest.treasuryMint) !== null && _b !== void 0 ? _b : (0, getTreasuryMintForCurrency_1.default)(environment, currency);
        const auctionHouse = (_c = auctionHouseOverrideForTest === null || auctionHouseOverrideForTest === void 0 ? void 0 : auctionHouseOverrideForTest.auctionHouse) !== null && _c !== void 0 ? _c : (0, getAuctionHouseAccountKeyForCurrency_1.default)(environment, currency);
        const [feeAccount] = (0, findAuctionHouseFeeAccount_1.default)(auctionHouse, programId);
        const [treasuryAccount] = (0, findAuctionHouseTreasuryAccount_1.default)(auctionHouse, programId);
        return {
            antiBotAuthority,
            auctionHouse,
            authority,
            feeAccount,
            programId,
            treasuryAccount,
            treasuryMint,
        };
    });
}
exports.default = getAuctionHouseAddressesForCurrency;
