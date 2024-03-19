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
const web3_js_1 = require("@solana/web3.js");
const getAuctionHouseAddressesForEnvironment_1 = __importDefault(require("address-lookup-table/addresses/getAuctionHouseAddressesForEnvironment"));
const getSolanaAddresses_1 = __importDefault(require("address-lookup-table/addresses/getSolanaAddresses"));
const getThirdPartyAddresses_1 = __importDefault(require("address-lookup-table/addresses/getThirdPartyAddresses"));
function getAddressesForEnvironment(environment, auctionHouseOverrideForTest) {
    return __awaiter(this, void 0, void 0, function* () {
        const allAddresses = [
            ...(0, getSolanaAddresses_1.default)(),
            ...(0, getThirdPartyAddresses_1.default)(),
            ...(yield (0, getAuctionHouseAddressesForEnvironment_1.default)(environment, auctionHouseOverrideForTest)),
        ];
        const uniqueSet = new Set(allAddresses.map((val) => val.toString()));
        const uniquePublicKeyAddressList = Array.from(uniqueSet).map((val) => new web3_js_1.PublicKey(val));
        return uniquePublicKeyAddressList;
    });
}
exports.default = getAddressesForEnvironment;
//# sourceMappingURL=getAddressesForEnvironment.js.map