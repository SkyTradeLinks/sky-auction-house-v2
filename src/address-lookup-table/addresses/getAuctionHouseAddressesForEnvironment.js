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
const getAuctionHouseAddressesForCurrency_1 = __importDefault(require("address-lookup-table/addresses/auction-house/getAuctionHouseAddressesForCurrency"));
const Currency_1 = __importDefault(require("address-lookup-table/types/Currency"));
function getAuctionHouseAddressesForEnvironment(environment, auctionHouseOverrideForTest) {
    return __awaiter(this, void 0, void 0, function* () {
        const auctionHouseAddressesAllCurrencies = yield Promise.all(Object.values(Currency_1.default).map((currency) => (0, getAuctionHouseAddressesForCurrency_1.default)(environment, currency)));
        const auctionHouseAddressesForTest = yield (0, getAuctionHouseAddressesForCurrency_1.default)(environment, Currency_1.default.Solana, // Will get overwritten by auctionHouseOverrideForTest.
        auctionHouseOverrideForTest);
        const auctionHouseAddresses = auctionHouseAddressesAllCurrencies.concat(auctionHouseAddressesForTest);
        return auctionHouseAddresses.reduce((addresses, addressesForCurrency) => addresses.concat(Object.values(addressesForCurrency)), []);
    });
}
exports.default = getAuctionHouseAddressesForEnvironment;
