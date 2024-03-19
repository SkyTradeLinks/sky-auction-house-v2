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
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const web3_js_1 = require("@solana/web3.js");
const AuctionHouseSdk_1 = __importDefault(require("solana/auction-house/AuctionHouseSdk"));
const findEditionBuyerInfoAccountPda_1 = __importDefault(require("solana/pdas/findEditionBuyerInfoAccountPda"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const setup_1 = require("tests/setup");
const buyEditionForTest_1 = __importDefault(require("tests/utils/buyEditionForTest"));
const createAuctionHouseHelper_1 = __importDefault(require("tests/utils/createAuctionHouseHelper"));
const expectFunctionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectFunctionToFailWithErrorCode"));
const expectSlightlyGreaterThan_1 = __importDefault(require("tests/utils/expectSlightlyGreaterThan"));
const expectSlightlyLessThan_1 = __importDefault(require("tests/utils/expectSlightlyLessThan"));
const fundSplTokenAccount_1 = __importDefault(require("tests/utils/fundSplTokenAccount"));
const getBalance_1 = __importDefault(require("tests/utils/getBalance"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getEditionDistributorSetup_1 = __importDefault(require("tests/utils/getEditionDistributorSetup"));
const getProgram_1 = __importDefault(require("tests/utils/getProgram"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
const buyerKeypair = web3_js_1.Keypair.generate();
const buyer2Keypair = web3_js_1.Keypair.generate();
const connection = (0, getConnectionForTest_1.default)();
function getEdition(mint) {
    return __awaiter(this, void 0, void 0, function* () {
        const [edition] = (0, formfunction_program_shared_1.findEditionPda)(mint);
        const editionAccount = yield mpl_token_metadata_1.Edition.fromAccountAddress(connection, edition);
        return typeof editionAccount.edition === "number"
            ? editionAccount.edition
            : editionAccount.edition.toNumber();
    });
}
function verifyEdition(mint, expectedEdition) {
    return __awaiter(this, void 0, void 0, function* () {
        const actualEdition = yield getEdition(mint);
        expect(actualEdition).toEqual(expectedEdition);
    });
}
describe("buy edition v2", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, formfunction_program_shared_1.requestAirdrops)({
            connection,
            wallets: [buyerKeypair, buyer2Keypair],
        });
        yield (0, fundSplTokenAccount_1.default)(connection, [buyerKeypair, buyer2Keypair]);
    }));
    it.each(["single creator", "anti-botting"])("buy edition (%s)", 
    // @ts-ignore
    (test) => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            antiBotProtectionEnabled: test === "anti-botting",
            multipleCreators: false,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        const [buyerAccountBalanceBefore, creatorAccountBalanceBefore, treasuryAccountBalanceBefore,] = yield Promise.all([
            (0, getBalance_1.default)(connection, { wallet: buyerKeypair.publicKey }),
            (0, getBalance_1.default)(connection, { wallet: remainingAccounts[0].pubkey }),
            (0, getBalance_1.default)(connection, { account: auctionHouseSdk.treasuryAccount }),
        ]);
        const { newMintKeypair } = yield (0, buyEditionForTest_1.default)({
            auctionHouseAccount,
            auctionHouseSdk,
            buyerKeypair,
            connection,
            metadataData,
            nftOwner,
            price,
            remainingAccounts,
            signers: test === "anti-botting" ? [formfunction_program_shared_1.ANTI_BOT_DEV_AUTHORITY_KEYPAIR] : [],
            tokenMint,
        });
        const [buyerAta] = (0, formfunction_program_shared_1.findAtaPda)(buyerKeypair.publicKey, newMintKeypair.publicKey);
        yield verifyEdition(newMintKeypair.publicKey, 1);
        const [buyerAtaAccountAfter, buyerAccountBalanceAfter, creatorAccountBalanceAfter, treasuryAccountBalanceAfter,] = yield Promise.all([
            (0, formfunction_program_shared_1.getTokenAccountInfo)(connection, buyerAta),
            (0, getBalance_1.default)(connection, { wallet: buyerKeypair.publicKey }),
            (0, getBalance_1.default)(connection, { wallet: remainingAccounts[0].pubkey }),
            (0, getBalance_1.default)(connection, { account: auctionHouseSdk.treasuryAccount }),
        ]);
        const fees = (price * auctionHouseAccount.sellerFeeBasisPoints) /
            AuctionHouse_1.BASIS_POINTS_100_PERCENT;
        (0, expectSlightlyGreaterThan_1.default)(buyerAccountBalanceBefore - buyerAccountBalanceAfter, price, 
        // For SPL token transactions, no fees are deducted from the balance
        // so we can check the exact amount
        setup_1.IS_NATIVE ? undefined : 0);
        expect(creatorAccountBalanceAfter - creatorAccountBalanceBefore).toEqual(price - fees);
        expect(treasuryAccountBalanceAfter - treasuryAccountBalanceBefore).toEqual(fees);
        expect(Number(buyerAtaAccountAfter.amount)).toEqual(1);
    }));
    it("buy edition (multiple creators)", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            multipleCreators: true,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        const { newMintKeypair } = yield (0, buyEditionForTest_1.default)({
            auctionHouseAccount,
            auctionHouseSdk,
            buyerKeypair,
            connection,
            metadataData,
            nftOwner,
            price,
            remainingAccounts,
            tokenMint,
        });
        yield verifyEdition(newMintKeypair.publicKey, 1);
    }));
    it("multiple buyers", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        // First buy
        const { newMintKeypair: newMint1Keypair } = yield (0, buyEditionForTest_1.default)({
            auctionHouseAccount,
            auctionHouseSdk,
            buyerKeypair,
            connection,
            metadataData,
            nftOwner,
            price,
            remainingAccounts,
            tokenMint,
        });
        yield verifyEdition(newMint1Keypair.publicKey, 1);
        // Second buy (same buyer as first buy)
        const { newMintKeypair: newMint2Keypair } = yield (0, buyEditionForTest_1.default)({
            auctionHouseAccount,
            auctionHouseSdk,
            buyerKeypair,
            connection,
            metadataData,
            nftOwner,
            price,
            remainingAccounts,
            tokenMint,
        });
        yield verifyEdition(newMint2Keypair.publicKey, 2);
        // Third buy (different buyer)
        const { newMintKeypair: newMint3Keypair } = yield (0, buyEditionForTest_1.default)({
            auctionHouseAccount,
            auctionHouseSdk,
            buyerKeypair: buyer2Keypair,
            connection,
            metadataData,
            nftOwner,
            price,
            remainingAccounts,
            tokenMint,
        });
        yield verifyEdition(newMint3Keypair.publicKey, 3);
    }));
    it("try buying when no more supply", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            maxSupply: 1,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        // First buy should succeed
        const { newMintKeypair: newMint1Keypair } = yield (0, buyEditionForTest_1.default)({
            auctionHouseAccount,
            auctionHouseSdk,
            buyerKeypair: buyer2Keypair,
            connection,
            metadataData,
            nftOwner,
            price,
            remainingAccounts,
            tokenMint,
        });
        yield verifyEdition(newMint1Keypair.publicKey, 1);
        // Second buy should fail, since supply is only 1
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "Edition Number greater than max supply",
            fn: () => (0, buyEditionForTest_1.default)({
                auctionHouseAccount,
                auctionHouseSdk,
                buyerKeypair: buyer2Keypair,
                connection,
                metadataData,
                nftOwner,
                price,
                remainingAccounts,
                tokenMint,
            }),
        });
    }));
    it("concurrent purchases", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            maxSupply: 3,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        const buy = () => __awaiter(void 0, void 0, void 0, function* () {
            return (0, buyEditionForTest_1.default)({
                auctionHouseAccount,
                auctionHouseSdk,
                buyerKeypair,
                connection,
                metadataData,
                nftOwner,
                price,
                remainingAccounts,
                tokenMint,
            });
        });
        // Needs to be sequential for correct balance change assessment.
        const txResults = [yield buy(), yield buy(), yield buy()];
        const editions = yield Promise.all(txResults
            .map((result) => result.newMintKeypair)
            .map((kp) => getEdition(kp.publicKey)));
        expect(editions.sort()).toEqual([1, 2, 3]);
        const txs = yield Promise.all(txResults
            .map((result) => result.txid)
            .map((txid) => connection.getParsedTransaction(txid, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        })));
        const editionNumbersFromTxs = yield Promise.all(txs.map((tx) => AuctionHouseSdk_1.default.getEditionNumberFromTx(tx)));
        expect(editionNumbersFromTxs.sort()).toEqual([1, 2, 3]);
    }));
    it("buy edition properly imposes bot taxes if wrong antiBotAuthority is used", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const intentionallyIncorrectAntiBotAuthority = web3_js_1.Keypair.generate();
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            antiBotAuthority: intentionallyIncorrectAntiBotAuthority.publicKey,
            antiBotProtectionEnabled: true,
            multipleCreators: false,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        const buyerAccountBefore = (yield connection.getAccountInfo(buyerKeypair.publicKey));
        const treasuryAccountBefore = (yield connection.getAccountInfo(auctionHouseSdk.treasuryAccount));
        const { txid } = yield (0, buyEditionForTest_1.default)({
            auctionHouseAccount,
            auctionHouseSdk,
            buyerKeypair,
            connection,
            metadataData,
            nftOwner,
            price,
            remainingAccounts,
            sendOptions: { skipPreflight: true },
            signers: [intentionallyIncorrectAntiBotAuthority],
            tokenMint,
        });
        const result = yield connection.getParsedTransaction(txid, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        expect((_b = (_a = result === null || result === void 0 ? void 0 : result.meta) === null || _a === void 0 ? void 0 : _a.logMessages) === null || _b === void 0 ? void 0 : _b.some((log) => log.includes("BotTaxCollected") && log.includes("6053"))).toEqual(true);
        const [editionPda] = (0, formfunction_program_shared_1.findEditionPda)(tokenMint);
        const editionAfter = yield mpl_token_metadata_1.MasterEditionV2.fromAccountAddress(connection, editionPda);
        const buyerAccountAfter = (yield connection.getAccountInfo(buyerKeypair.publicKey));
        const treasuryAccountAfter = (yield connection.getAccountInfo(auctionHouseSdk.treasuryAccount));
        // No editions should have been printed.
        expect(typeof editionAfter.supply === "number"
            ? editionAfter.supply
            : editionAfter.supply.toNumber()).toEqual(0);
        // Buyer wallet lamports should be less than the original balance minus the bot fee.
        (0, expectSlightlyLessThan_1.default)(buyerAccountAfter.lamports, buyerAccountBefore.lamports - AuctionHouse_1.BOT_TAX);
        // Bot fee should have been credited to the auction house treasury.
        expect(treasuryAccountBefore.lamports + AuctionHouse_1.BOT_TAX).toEqual(treasuryAccountAfter.lamports);
    }));
    it("enforces limit per address correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const limitPerAddress = 2;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            limitPerAddress,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        for (let i = 0; i <= limitPerAddress; i++) {
            if (i < limitPerAddress) {
                const { newMintKeypair } = yield (0, buyEditionForTest_1.default)({
                    auctionHouseAccount,
                    auctionHouseSdk,
                    buyerKeypair,
                    connection,
                    metadataData,
                    nftOwner,
                    price,
                    remainingAccounts,
                    tokenMint,
                });
                yield verifyEdition(newMintKeypair.publicKey, i + 1);
                continue;
            }
            yield (0, expectFunctionToFailWithErrorCode_1.default)({
                errorName: "EditionLimitPerAddressExceeded",
                fn: () => (0, buyEditionForTest_1.default)({
                    auctionHouseAccount,
                    auctionHouseSdk,
                    buyerKeypair,
                    connection,
                    metadataData,
                    nftOwner,
                    price,
                    remainingAccounts,
                    sendOptions: { skipPreflight: true },
                    tokenMint,
                }),
            });
        }
    }));
    it("handles cases where the EditionBuyerInfoAccount already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const limitPerAddress = 2;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            limitPerAddress,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        const [editionBuyerInfoAccount] = (0, findEditionBuyerInfoAccountPda_1.default)(tokenMint, buyerKeypair.publicKey, auctionHouseSdk.program.programId);
        // Fund the PDA account, which will create it, before buying the editions
        // to ensure the program handles this edge case correctly. See:
        // https://github.com/solana-labs/solana-program-library/blob/master/governance/tools/src/account.rs#L145
        yield (0, formfunction_program_shared_1.requestAirdrops)({ connection, wallets: [editionBuyerInfoAccount] });
        for (let i = 0; i < limitPerAddress; i++) {
            const { newMintKeypair } = yield (0, buyEditionForTest_1.default)({
                auctionHouseAccount,
                auctionHouseSdk,
                buyerKeypair,
                connection,
                metadataData,
                nftOwner,
                price,
                remainingAccounts,
                tokenMint,
            });
            yield verifyEdition(newMintKeypair.publicKey, i + 1);
        }
    }));
    it("mismatched treasury mint throws error", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, metadataData, nftOwner, programCreator, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: price,
        });
        const program = (0, getProgram_1.default)(programCreator);
        // Create other auction house so we can test trying to call
        // buy_edition_v2 with the wrong SDK
        yield (0, createAuctionHouseHelper_1.default)(connection, program, programCreator, !setup_1.IS_NATIVE);
        const auctionHouseSdk = AuctionHouseSdk_1.default.init(program, {
            antiBotAuthority: formfunction_program_shared_1.ANTI_BOT_DEV_AUTHORITY_KEYPAIR.publicKey,
            treasuryMint: yield (0, getTreasuryMint_1.default)(!setup_1.IS_NATIVE),
            walletAuthority: programCreator.publicKey,
            walletCreator: programCreator.publicKey,
        });
        yield (0, expectFunctionToFailWithErrorCode_1.default)({
            errorName: "InvalidTreasuryMintForBuyEdition",
            fn: () => (0, buyEditionForTest_1.default)({
                auctionHouseAccount,
                auctionHouseSdk,
                buyerKeypair,
                connection,
                metadataData,
                nftOwner,
                price,
                remainingAccounts,
                tokenMint,
            }),
        });
    }));
    it("minimum price function type", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Minimum,
            priceParams: [],
            startingPriceLamports: price,
        });
        // First iteration buys at the price.
        // Second iteration buys at double the price.
        for (let i = 0; i < 2; i++) {
            const { newMintKeypair } = yield (0, buyEditionForTest_1.default)({
                auctionHouseAccount,
                auctionHouseSdk,
                buyerKeypair,
                connection,
                metadataData,
                nftOwner,
                price,
                remainingAccounts,
                tokenMint,
            });
            yield verifyEdition(newMintKeypair.publicKey, i + 1);
        }
    }));
});
//# sourceMappingURL=buyEdition.test.js.map