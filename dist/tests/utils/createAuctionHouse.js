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
const extendAddressLookupTableForTest_1 = __importDefault(require("address-lookup-table/utils/extendAddressLookupTableForTest"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const setup_1 = require("tests/setup");
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
function createAuctionHouse(connection, sdk, programCreator, auctionHouseConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const { basisPoints: auctionHouseBasisPoints, basisPointsSecondary: auctionHouseBasisPointsSecondary, feeWithdrawalDestination, treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner, } = auctionHouseConfig;
        //
        // Create auction house
        //
        const accountInfo = yield connection.getAccountInfo(sdk.auctionHouse);
        if (accountInfo != null) {
            (0, formfunction_program_shared_1.logIfDebug)(`auction house already created, has address ${sdk.auctionHouse.toString()}`);
            return sdk.auctionHouse;
        }
        (0, formfunction_program_shared_1.logIfDebug)(`creating auction house at address ${sdk.auctionHouse.toString()} for treasuryMint ${sdk.treasuryMint.toString()}`);
        const tx = yield sdk.createTx({
            feeWithdrawalDestination: feeWithdrawalDestination !== null && feeWithdrawalDestination !== void 0 ? feeWithdrawalDestination : AuctionHouse_1.FEE_WITHDRAWAL_DESTINATION,
            payer: programCreator.publicKey,
            treasuryWithdrawalDestination: treasuryWithdrawalDestination !== null && treasuryWithdrawalDestination !== void 0 ? treasuryWithdrawalDestination : AuctionHouse_1.TREASURY_WITHDRAWAL_DESTINATION_OWNER,
            treasuryWithdrawalDestinationOwner: treasuryWithdrawalDestinationOwner !== null && treasuryWithdrawalDestinationOwner !== void 0 ? treasuryWithdrawalDestinationOwner : AuctionHouse_1.TREASURY_WITHDRAWAL_DESTINATION_OWNER,
        }, {
            basisPoints: auctionHouseBasisPoints,
            basisPointsSecondary: auctionHouseBasisPointsSecondary,
            canChangePrice: false,
            payAllFees: true,
            requiresSignOff: false,
        });
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, programCreator);
        (0, formfunction_program_shared_1.logIfDebug)(`created auction house at address ${sdk.auctionHouse.toString()}`);
        (0, tiny_invariant_1.default)(setup_1.ADDRESS_LOOKUP_TABLE_ADDRESS != null);
        const overrideForTest = {
            auctionHouse: sdk.auctionHouse,
            authority: sdk.walletAuthority,
            treasuryMint: sdk.treasuryMint,
        };
        yield (0, extendAddressLookupTableForTest_1.default)(connection, setup_1.ADDRESS_LOOKUP_TABLE_ADDRESS, overrideForTest);
        return sdk.auctionHouse;
    });
}
exports.default = createAuctionHouse;
//# sourceMappingURL=createAuctionHouse.js.map