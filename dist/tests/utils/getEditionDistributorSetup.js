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
const findEditionDistributor_1 = __importDefault(require("solana/pdas/findEditionDistributor"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const createAuctionHouse_1 = __importDefault(require("tests/utils/createAuctionHouse"));
const fundSplTokenAccount_1 = __importDefault(require("tests/utils/fundSplTokenAccount"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getEditionDistributorPriceFunction_1 = __importDefault(require("tests/utils/getEditionDistributorPriceFunction"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTestMetadata_1 = __importDefault(require("tests/utils/getTestMetadata"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const getTreasuryWithdrawalDestination_1 = __importDefault(require("tests/utils/getTreasuryWithdrawalDestination"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const programCreator = web3_js_1.Keypair.generate();
const program = (0, getProgram_1.default)(programCreator);
const connection = (0, getConnectionForTest_1.default)();
function getEditionDistributorSetup({ antiBotAuthority = formfunction_program_shared_1.ANTI_BOT_DEV_AUTHORITY_KEYPAIR.publicKey, antiBotProtectionEnabled = false, auctionHouseConfigArg, maxSupply = 10, multipleCreators = false, priceFunctionType, priceParams, limitPerAddress, publicSaleStartTime, saleEndTime, allowlistSalePrice, allowlistSaleStartTime, startingPriceLamports, }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const auctionHouseConfig = auctionHouseConfigArg != null
            ? Object.assign(Object.assign({}, auctionHouseConfigArg), (yield (0, getTreasuryWithdrawalDestination_1.default)(auctionHouseConfigArg.treasuryWithdrawalDestinationOwner))) : Object.assign({ basisPoints: AuctionHouse_1.BASIS_POINTS, basisPointsSecondary: AuctionHouse_1.BASIS_POINTS_SECONDARY }, (yield (0, getTreasuryWithdrawalDestination_1.default)()));
        const nftOwner = web3_js_1.Keypair.generate();
        const collaborator = web3_js_1.Keypair.generate();
        yield (0, formfunction_program_shared_1.requestAirdrops)({
            connection: connection,
            wallets: [nftOwner, collaborator, programCreator],
        });
        yield (0, fundSplTokenAccount_1.default)(connection, [nftOwner, collaborator]);
        const auctionHouseSdk = AuctionHouseSdk_1.default.init(program, {
            antiBotAuthority,
            treasuryMint: yield (0, getTreasuryMint_1.default)(),
            walletAuthority: programCreator.publicKey,
            walletCreator: programCreator.publicKey,
        });
        (0, formfunction_program_shared_1.logIfDebug)("creating mint");
        const tokenMint = yield (0, formfunction_program_shared_1.createNftMint)(connection, nftOwner);
        (0, formfunction_program_shared_1.logIfDebug)("creating token account");
        const tokenAccount = yield (0, formfunction_program_shared_1.createTokenAccount)(connection, tokenMint, nftOwner);
        (0, formfunction_program_shared_1.logIfDebug)("minting token");
        yield (0, formfunction_program_shared_1.mintTo)(connection, tokenMint, tokenAccount, nftOwner.publicKey, [nftOwner], 1);
        const [metadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(tokenMint);
        (0, formfunction_program_shared_1.logIfDebug)("creating metadata");
        const metadataData = multipleCreators
            ? (0, getTestMetadata_1.default)({ address: nftOwner.publicKey, share: 90, verified: true }, { address: collaborator.publicKey, share: 10, verified: false })
            : (0, getTestMetadata_1.default)({
                address: nftOwner.publicKey,
                share: 100,
                verified: true,
            });
        yield (0, formfunction_program_shared_1.createMetadata)(connection, nftOwner, tokenMint, nftOwner.publicKey, nftOwner.publicKey, metadataData);
        const [editionPda] = (0, formfunction_program_shared_1.findEditionPda)(tokenMint);
        (0, formfunction_program_shared_1.logIfDebug)("creating master edition");
        yield (0, formfunction_program_shared_1.createMasterEdition)(connection, nftOwner, editionPda, tokenMint, nftOwner.publicKey, nftOwner.publicKey, metadata, maxSupply);
        // Necessary for any following instructions which include the auction_house
        // account, such as SetEditionDistributorLimitPerAddress.
        yield (0, createAuctionHouse_1.default)(connection, auctionHouseSdk, programCreator, auctionHouseConfig);
        (0, formfunction_program_shared_1.logIfDebug)("creating edition distributor tx");
        const tx = yield auctionHouseSdk.createEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
            tokenAccount,
        }, {
            allowlistSalePrice: allowlistSalePrice !== null && allowlistSalePrice !== void 0 ? allowlistSalePrice : null,
            allowlistSaleStartTime: allowlistSaleStartTime !== null && allowlistSaleStartTime !== void 0 ? allowlistSaleStartTime : null,
            antiBotProtectionEnabled,
            limitPerAddress,
            priceFunctionType,
            priceParams,
            publicSaleStartTime: publicSaleStartTime !== null && publicSaleStartTime !== void 0 ? publicSaleStartTime : null,
            saleEndTime: saleEndTime !== null && saleEndTime !== void 0 ? saleEndTime : null,
            startingPriceLamports,
        }, 
        // Transfer the NFT to the distributor
        true);
        yield (0, sendTransactionWithWallet_1.default)(connection, tx, nftOwner);
        const [editionDistributor, editionDistributorBump] = (0, findEditionDistributor_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const [editionDistributorAta] = (0, formfunction_program_shared_1.findAtaPda)(editionDistributor, tokenMint);
        const editionDistributorAtaAccountInfo = yield (0, formfunction_program_shared_1.getTokenAccountInfo)(connection, editionDistributorAta);
        // NFT should have been transferred to distributor's ATA
        expect(Number(editionDistributorAtaAccountInfo.amount)).toEqual(1);
        const [editionDistributorAccount, priceFunction] = yield Promise.all([
            auctionHouseSdk.program.account.editionDistributor.fetch(editionDistributor),
            (0, getEditionDistributorPriceFunction_1.default)(auctionHouseSdk.program, editionDistributor),
        ]);
        (0, formfunction_program_shared_1.logIfDebug)("editionDistributorAccount", JSON.stringify(editionDistributorAccount));
        expect(editionDistributorAccount.bump).toEqual(editionDistributorBump);
        expect(editionDistributorAccount.masterEditionMint.toString()).toEqual(tokenMint.toString());
        expect((_a = editionDistributorAccount.treasuryMint) === null || _a === void 0 ? void 0 : _a.toString()).toEqual((yield (0, getTreasuryMint_1.default)()).toString());
        expect(priceFunction.startingPriceLamports).toEqual(startingPriceLamports);
        expect(priceFunction.priceFunctionType).toEqual(priceFunctionType);
        expect(priceFunction.params).toEqual(priceParams);
        const auctionHouseAccount = yield program.account.auctionHouse.fetch(auctionHouseSdk.auctionHouse);
        return {
            auctionHouseAccount,
            auctionHouseSdk,
            editionDistributor,
            metadataData,
            nftOwner,
            nftOwnerTokenAccount: tokenAccount,
            programCreator,
            remainingAccounts: metadataData.creators.map((creator) => ({
                isSigner: false,
                isWritable: true,
                pubkey: new web3_js_1.PublicKey(creator.address),
            })),
            tokenMint,
        };
    });
}
exports.default = getEditionDistributorSetup;
//# sourceMappingURL=getEditionDistributorSetup.js.map