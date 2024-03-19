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
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const setup_1 = require("tests/setup");
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const treasuryWithdrawalDestinationMap = {};
function getTreasuryWithdrawalDestination(wallet = AuctionHouse_1.TREASURY_WITHDRAWAL_DESTINATION_OWNER, isNativeOverride) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isNativeOverride === true || (isNativeOverride == null && setup_1.IS_NATIVE)) {
            return {
                treasuryWithdrawalDestination: wallet,
                treasuryWithdrawalDestinationOwner: wallet,
            };
        }
        const treasuryWithdrawalDestination = treasuryWithdrawalDestinationMap[wallet.toString()];
        if (treasuryWithdrawalDestination != null) {
            return {
                treasuryWithdrawalDestination,
                treasuryWithdrawalDestinationOwner: wallet,
            };
        }
        const [treasuryWithdrawalDestinationAta] = (0, formfunction_program_shared_1.findAtaPda)(wallet, yield (0, getTreasuryMint_1.default)(isNativeOverride));
        treasuryWithdrawalDestinationMap[wallet.toString()] =
            treasuryWithdrawalDestinationAta;
        return {
            treasuryWithdrawalDestination: treasuryWithdrawalDestinationAta,
            treasuryWithdrawalDestinationOwner: wallet,
        };
    });
}
exports.default = getTreasuryWithdrawalDestination;
