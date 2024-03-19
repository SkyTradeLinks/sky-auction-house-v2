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
const findEditionDistributor_1 = __importDefault(require("solana/pdas/findEditionDistributor"));
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const setup_1 = require("tests/setup");
const expectSlightlyLessThan_1 = __importDefault(require("tests/utils/expectSlightlyLessThan"));
const getBalance_1 = __importDefault(require("tests/utils/getBalance"));
const getTreasuryMint_1 = __importDefault(require("tests/utils/getTreasuryMint"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
function buyEditionForTest({ auctionHouseAccount, auctionHouseSdk, buyerKeypair, buyerWithAllowlistProofData = null, connection, metadataData, nftOwner, price, proofTreeIndex = null, remainingAccounts, sendOptions, signers = [], tokenMint, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const newMintKeypair = web3_js_1.Keypair.generate();
        const treasuryMint = yield (0, getTreasuryMint_1.default)();
        const [editionDistributor] = (0, findEditionDistributor_1.default)(tokenMint, auctionHouseSdk.program.programId);
        const creatorAccountBalancesBefore = yield Promise.all(remainingAccounts.map(({ pubkey }) => __awaiter(this, void 0, void 0, function* () { return (0, getBalance_1.default)(connection, { wallet: pubkey }); })));
        const [buyerAccountBefore, creatorAccountBefore, treasuryAccountBefore, editionDistributorAccountBefore,] = yield Promise.all([
            (0, formfunction_program_shared_1.getBalanceForMint)({
                connection,
                mint: treasuryMint,
                wallet: buyerKeypair.publicKey,
            }),
            (0, formfunction_program_shared_1.getBalanceForMint)({
                connection,
                mint: treasuryMint,
                wallet: nftOwner.publicKey,
            }),
            setup_1.IS_NATIVE
                ? (0, formfunction_program_shared_1.getBalanceForMint)({
                    connection,
                    mint: treasuryMint,
                    wallet: auctionHouseSdk.treasuryAccount,
                })
                : (0, formfunction_program_shared_1.getBalanceForMint)({
                    connection,
                    mint: treasuryMint,
                    tokenAccount: auctionHouseSdk.treasuryAccount,
                }),
            auctionHouseSdk.program.account.editionDistributor.fetch(editionDistributor),
        ]);
        const options = { buyerWithAllowlistProofData, priceInLamports: price };
        const accounts = {
            buyer: buyerKeypair.publicKey,
            mint: tokenMint,
            newMint: newMintKeypair.publicKey,
        };
        (0, formfunction_program_shared_1.logIfDebug)(`Buying edition for address ${buyerKeypair.publicKey.toString()}${buyerWithAllowlistProofData != null ? " with allowlist proof" : ""}${proofTreeIndex != null ? ` for proof tree index = ${proofTreeIndex}` : ""}`);
        const tx = yield auctionHouseSdk.buyEditionV2Tx(accounts, options, remainingAccounts);
        const txSigners = signers.concat(newMintKeypair);
        const txid = yield (0, sendTransactionWithWallet_1.default)(connection, tx, buyerKeypair, txSigners, sendOptions);
        // If skipPreflight: true is provided the caller expects the transaction
        // to fail so we want to short circuit to skip the normal balance checks below.
        const isTransactionExpectedToFail = sendOptions != null && sendOptions.skipPreflight;
        if (isTransactionExpectedToFail) {
            return { newMintKeypair, txid };
        }
        const creatorAccountBalancesAfter = yield Promise.all(remainingAccounts.map(({ pubkey }) => __awaiter(this, void 0, void 0, function* () { return (0, getBalance_1.default)(connection, { wallet: pubkey }); })));
        const [buyerAccountAfter, creatorAccountAfter, treasuryAccountAfter, editionDistributorAccountAfter,] = yield Promise.all([
            (0, formfunction_program_shared_1.getBalanceForMint)({
                connection,
                mint: treasuryMint,
                wallet: buyerKeypair.publicKey,
            }),
            (0, formfunction_program_shared_1.getBalanceForMint)({
                connection,
                mint: treasuryMint,
                wallet: nftOwner.publicKey,
            }),
            setup_1.IS_NATIVE
                ? (0, formfunction_program_shared_1.getBalanceForMint)({
                    connection,
                    mint: treasuryMint,
                    wallet: auctionHouseSdk.treasuryAccount,
                })
                : (0, formfunction_program_shared_1.getBalanceForMint)({
                    connection,
                    mint: treasuryMint,
                    tokenAccount: auctionHouseSdk.treasuryAccount,
                }),
            auctionHouseSdk.program.account.editionDistributor.fetch(editionDistributor),
        ]);
        const fees = (price * auctionHouseAccount.sellerFeeBasisPoints) /
            AuctionHouse_1.BASIS_POINTS_100_PERCENT;
        if (setup_1.IS_NATIVE) {
            (0, expectSlightlyLessThan_1.default)(buyerAccountAfter, buyerAccountBefore - price);
            expect(treasuryAccountAfter - treasuryAccountBefore).toEqual(fees);
        }
        else {
            (0, formfunction_program_shared_1.expectNumbersEqual)(buyerAccountAfter, buyerAccountBefore - price);
            expect(treasuryAccountAfter - treasuryAccountBefore).toEqual(fees);
        }
        if (remainingAccounts.length > 0) {
            creatorAccountBalancesAfter.forEach((creatorAccountBalanceAfter, index) => {
                // May be null if account had 0 lamports before the sale
                const creatorAccountBalanceBefore = creatorAccountBalancesBefore[index];
                expect(creatorAccountBalanceAfter - creatorAccountBalanceBefore).toBeCloseTo((price - fees) * (metadataData.creators[index].share / 100));
            });
        }
        else {
            expect(creatorAccountAfter - creatorAccountBefore).toEqual(price - fees);
        }
        // If the purchase is using an allowlist, then the allowlistNumberSold should
        // have been incremented, otherwise it should not have changed.
        if (buyerWithAllowlistProofData != null) {
            (0, formfunction_program_shared_1.expectNumbersEqual)(editionDistributorAccountBefore.allowlistNumberSold.toNumber() + 1, editionDistributorAccountAfter.allowlistNumberSold);
        }
        else {
            (0, formfunction_program_shared_1.expectNumbersEqual)(editionDistributorAccountBefore.allowlistNumberSold, editionDistributorAccountAfter.allowlistNumberSold);
        }
        return { newMintKeypair, txid };
    });
}
exports.default = buyEditionForTest;
