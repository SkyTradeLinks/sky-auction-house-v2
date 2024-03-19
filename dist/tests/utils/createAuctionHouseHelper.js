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
const web3_js_1 = require("@solana/web3.js");
const AuctionHouseSdk_1 = __importDefault(require("solana/auction-house/AuctionHouseSdk"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const createAuctionHouse_1 = __importDefault(require("tests/utils/createAuctionHouse"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const getTreasuryWithdrawalDestination_1 = __importDefault(require("tests/utils/getTreasuryWithdrawalDestination"));
function createAuctionHouseHelper(connection, programCreator, creatorWallet, isNativeOverride) {
    return __awaiter(this, void 0, void 0, function* () {
        const treasuryMint = yield (0, getTreasuryMint_1.default)(isNativeOverride);
        const auctionHouseSdk = AuctionHouseSdk_1.default.init(programCreator, {
            antiBotAuthority: formfunction_program_shared_1.ANTI_BOT_DEV_AUTHORITY_KEYPAIR.publicKey,
            treasuryMint,
            walletAuthority: creatorWallet.publicKey,
            walletCreator: creatorWallet.publicKey,
        });
        yield connection.requestAirdrop(auctionHouseSdk.feeAccount, 5 * web3_js_1.LAMPORTS_PER_SOL);
        const { treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner } = yield (0, getTreasuryWithdrawalDestination_1.default)(AuctionHouse_1.TREASURY_WITHDRAWAL_DESTINATION_OWNER, isNativeOverride);
        const auctionHouse = yield (0, createAuctionHouse_1.default)(connection, auctionHouseSdk, creatorWallet, {
            basisPoints: AuctionHouse_1.BASIS_POINTS,
            basisPointsSecondary: AuctionHouse_1.BASIS_POINTS_SECONDARY,
            treasuryWithdrawalDestination,
            treasuryWithdrawalDestinationOwner,
        });
        return { auctionHouse, treasuryMint };
    });
}
exports.default = createAuctionHouseHelper;
//# sourceMappingURL=createAuctionHouseHelper.js.map