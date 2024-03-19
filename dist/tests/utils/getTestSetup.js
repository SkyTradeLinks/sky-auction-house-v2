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
const createAuctionHouse_1 = __importDefault(require("tests/utils/createAuctionHouse"));
const fundSplTokenAccount_1 = __importDefault(require("tests/utils/fundSplTokenAccount"));
const getTestMetadata_1 = __importDefault(require("tests/utils/getTestMetadata"));
const getTestWallets_1 = __importDefault(require("tests/utils/getTestWallets"));
const getTreasuryWithdrawalDestination_1 = __importDefault(require("tests/utils/getTreasuryWithdrawalDestination"));
function getTestSetup(connection, auctionHouseConfig, programCreatorWallet, numSellers, numBuyers, tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        if (numSellers != null && numSellers < 2) {
            throw new Error("numSellers must be at least 2");
        }
        if (numBuyers != null && numBuyers < 2) {
            throw new Error("numBuyers must be at least 2");
        }
        const { antiBotAuthority, creator: auctionHouseProgramCreator, basisPoints, basisPointsSecondary, feeWithdrawalDestination, treasuryWithdrawalDestinationOwner: treasuryWithdrawalDestinationOwnerArg, treasuryMint, } = auctionHouseConfig;
        const auctionHouseSdk = AuctionHouseSdk_1.default.init(auctionHouseProgramCreator, {
            antiBotAuthority: antiBotAuthority !== null && antiBotAuthority !== void 0 ? antiBotAuthority : formfunction_program_shared_1.ANTI_BOT_DEV_AUTHORITY_KEYPAIR.publicKey,
            treasuryMint: treasuryMint,
            walletAuthority: programCreatorWallet.publicKey,
            walletCreator: programCreatorWallet.publicKey,
        });
        const [sellers, buyers] = yield Promise.all([
            (0, getTestWallets_1.default)(connection, numSellers !== null && numSellers !== void 0 ? numSellers : 2),
            (0, getTestWallets_1.default)(connection, numBuyers !== null && numBuyers !== void 0 ? numBuyers : 2),
        ]);
        //
        // Fund accounts
        //
        yield (0, formfunction_program_shared_1.requestAirdrops)({ connection, wallets: [...sellers, ...buyers] });
        yield (0, fundSplTokenAccount_1.default)(connection, [...sellers, ...buyers]);
        //
        // Auction house setup
        //
        yield connection.requestAirdrop(auctionHouseSdk.feeAccount, 5 * web3_js_1.LAMPORTS_PER_SOL);
        const seller = sellers[0];
        const buyer = buyers[0];
        //
        // Token setup
        //
        let tokenMint = tokenMintAddress;
        if (tokenMint == null) {
            (0, formfunction_program_shared_1.logIfDebug)("creating token mint");
            tokenMint = yield (0, formfunction_program_shared_1.createNftMint)(connection, seller);
            (0, formfunction_program_shared_1.logIfDebug)(`token mint created at ${tokenMint.toString()}`, tokenMint);
        }
        (0, formfunction_program_shared_1.logIfDebug)("creating token account for seller");
        const tokenAccount = yield (0, formfunction_program_shared_1.createTokenAccount)(connection, tokenMint, seller);
        (0, formfunction_program_shared_1.logIfDebug)("creating token account for buyer");
        const buyerTokenAccount = yield (0, formfunction_program_shared_1.createTokenAccount)(connection, tokenMint, buyer);
        const [metadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(tokenMint);
        const metadataExists = yield connection.getAccountInfo(metadata);
        const metadataData = (0, getTestMetadata_1.default)({ address: sellers[0].publicKey, share: 90, verified: true }, { address: sellers[1].publicKey, share: 10, verified: false });
        if (!metadataExists) {
            (0, formfunction_program_shared_1.logIfDebug)("creating metadata");
            yield (0, formfunction_program_shared_1.createMetadata)(connection, seller, tokenMint, seller.publicKey, seller.publicKey, metadataData);
            (0, formfunction_program_shared_1.logIfDebug)("after creating metadata");
        }
        const tokenAmount = yield (0, formfunction_program_shared_1.getTokenAmount)(connection, tokenAccount);
        if (tokenAmount < 1) {
            (0, formfunction_program_shared_1.logIfDebug)(`minting one token to ${tokenAccount.toString()}`);
            yield (0, formfunction_program_shared_1.mintTo)(connection, tokenMint, tokenAccount, seller.publicKey, [seller], 1);
        }
        const [editionPda] = (0, formfunction_program_shared_1.findEditionPda)(tokenMint);
        const masterEditionExists = yield connection.getAccountInfo(editionPda);
        if (!masterEditionExists) {
            (0, formfunction_program_shared_1.logIfDebug)(`creating master edition ${editionPda}`);
            yield (0, formfunction_program_shared_1.createMasterEdition)(connection, seller, editionPda, tokenMint, seller.publicKey, seller.publicKey, metadata);
        }
        const { treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner } = yield (0, getTreasuryWithdrawalDestination_1.default)(treasuryWithdrawalDestinationOwnerArg !== null && treasuryWithdrawalDestinationOwnerArg !== void 0 ? treasuryWithdrawalDestinationOwnerArg : undefined);
        yield (0, createAuctionHouse_1.default)(connection, auctionHouseSdk, programCreatorWallet, {
            basisPoints,
            basisPointsSecondary,
            feeWithdrawalDestination,
            treasuryWithdrawalDestination,
            treasuryWithdrawalDestinationOwner,
        });
        return [
            auctionHouseSdk,
            buyerTokenAccount,
            tokenAccount,
            tokenMint,
            sellers,
            buyers,
            metadataData,
        ];
    });
}
exports.default = getTestSetup;
//# sourceMappingURL=getTestSetup.js.map