"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const getAuctionHouseProgramIdForEnvironment_1 = __importDefault(require("address-lookup-table/addresses/auction-house/getAuctionHouseProgramIdForEnvironment"));
const getRpcFromEnvironment_1 = __importDefault(require("address-lookup-table/utils/getRpcFromEnvironment"));
const AuctionHouse_1 = require("idl/AuctionHouse");
const TestMainnetTxids_1 = __importStar(require("tests/constants/TestMainnetTxids"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const decodeAuctionHouseTransaction_1 = __importDefault(require("utils/decodeAuctionHouseTransaction"));
const KNOWN_ACCOUNTS = {
    antiBotAuthority: "antiScHGm8NAqfpdFNYbv3c9ntY6xksvvTN3B9cDf5Y",
    ataProgram: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    metaplexTokenMetadataProgram: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    rent: "SysvarRent111111111111111111111111111111111",
    systemProgram: "11111111111111111111111111111111",
    tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
};
/**
 * Sanity check some of the decoded accounts match expected known account pubkeys.
 * This is just a rough heuristic for checking the decoded instruction accounts
 * because the names in KNOWN_ACCOUNTS need to match the account names used in
 * the program instructions, which are arbitrary, e.g. metaplexTokenMetadataProgram
 * could be called that or something else, like 'metadata'.
 */
function sanityCheckLabelledInstructionAccounts(labelledIxAccounts) {
    for (const account of labelledIxAccounts) {
        const knownAccount = KNOWN_ACCOUNTS[account.name];
        if (knownAccount) {
            // This is for debugging test failures.
            if (!(0, formfunction_program_shared_1.arePublicKeysEqual)(account.pubkey, new web3_js_1.PublicKey(knownAccount))) {
                console.error(`PublicKey mismatch: account pubkey = ${account.pubkey} but expected known account ${account.name} key ${knownAccount}`);
            }
            (0, formfunction_program_shared_1.expectPublicKeysEqual)(account.pubkey, new web3_js_1.PublicKey(knownAccount));
        }
    }
}
function expectInstructionDataFieldsToBeDefined(fields, data) {
    fields.forEach((field) => {
        if (!(field in data)) {
            // This is for debugging test failures.
            console.error(`Didn't find field ${field} in ix data: ${JSON.stringify(data)}`);
        }
        expect(data[field]).toBeDefined();
    });
}
function expectInstructionLogMessageToExist(logs, instructionName) {
    expect(logs.find((log) => log.includes(`Instruction: ${(0, formfunction_program_shared_1.uppercaseFirstLetter)(instructionName)}`))).toBeDefined();
}
function expectDecodedInstructionToBeValid(decodedInstruction, instructionName) {
    expect(decodedInstruction.name).toBe(instructionName);
    sanityCheckLabelledInstructionAccounts(Object.values(decodedInstruction.accountsMap));
    expectInstructionLogMessageToExist(decodedInstruction === null || decodedInstruction === void 0 ? void 0 : decodedInstruction.logs, instructionName);
}
function handleDecodeTransaction(connection, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsedTransaction = yield connection.getParsedTransaction(txid, {
            maxSupportedTransactionVersion: 0,
        });
        (0, tiny_invariant_1.default)(parsedTransaction != null, "parsedTransaction should not be null.");
        const decodedTx = (0, decodeAuctionHouseTransaction_1.default)(auctionHouseProgramId, parsedTransaction);
        (0, tiny_invariant_1.default)(decodedTx, "DecodedTx should not be null.");
        return decodedTx;
    });
}
// Handle some legacy instructions where certain current IDL instruction accounts
// were not present, and therefore will not be present on the decoded instruction,
// if the transaction is a legacy transaction.
const OMITTED_LEGACY_ACCOUNTS = {
    sell: new Set(["masterEdition", "metaplexTokenMetadataProgram"]),
    updateEditionDistributor: new Set(["treasuryMint"]),
};
function expectDecodedInstructionAccountNameMapToBeValid(instructionName, decodedInstruction) {
    const instruction = AuctionHouse_1.IDL.instructions.find((ix) => ix.name === instructionName);
    (0, tiny_invariant_1.default)(instruction != null, "Instruction should exist");
    for (const { name } of instruction.accounts) {
        if (instructionName in OMITTED_LEGACY_ACCOUNTS &&
            OMITTED_LEGACY_ACCOUNTS[instructionName].has(name)) {
            continue;
        }
        if (!(name in decodedInstruction.accountsMap)) {
            console.warn(`account "${name}" missing for instruction ${instructionName}`);
        }
        expect(decodedInstruction.accountsMap[name]).toBeDefined();
    }
}
const env = formfunction_program_shared_1.Environment.Production;
const rpc = (0, getRpcFromEnvironment_1.default)(env); // NOTE: Switch to Quicknode if needed.
const connection = new web3_js_1.Connection(rpc, "confirmed");
const auctionHouseProgramId = (0, getAuctionHouseProgramIdForEnvironment_1.default)(env);
// Note: This is skipped by default because it's just for testing the transaction
// parsing code and also slams mainnet RPCs to get parsed transactions. Unskip it
// if you need to run these tests for some reason.
describe.skip("Test decodeAuctionHouseTransaction", () => {
    test.each(TestMainnetTxids_1.default.SELL_OLD)("Decode legacy Sell txid (%s)", (txid) => __awaiter(void 0, void 0, void 0, function* () {
        const decodedTx = yield handleDecodeTransaction(connection, txid);
        const expectedIxName = "sell";
        const decodedIx = decodedTx[expectedIxName];
        (0, tiny_invariant_1.default)(decodedIx != null, "decodedIx should not be null.");
        expectDecodedInstructionToBeValid(decodedIx, expectedIxName);
        expectInstructionDataFieldsToBeDefined([
            "tradeStateBump",
            "freeTradeStateBump",
            "programAsSignerBump",
            "buyerPrice",
            "tokenSize",
        ], decodedIx.data);
        expectDecodedInstructionAccountNameMapToBeValid(expectedIxName, decodedIx);
    }));
    test.each([
        ...TestMainnetTxids_1.default.BUY_EDITION_V2_OLD,
        ...TestMainnetTxids_1.default.BUY_EDITION_V2,
    ])("Decode BuyEditionV2 txid (%s)", (txid) => __awaiter(void 0, void 0, void 0, function* () {
        const decodedTx = yield handleDecodeTransaction(connection, txid);
        const expectedIxName = "buyEditionV2";
        const decodedIx = decodedTx[expectedIxName];
        (0, tiny_invariant_1.default)(decodedIx != null, "decodedIx should not be null.");
        expectDecodedInstructionToBeValid(decodedIx, expectedIxName);
        expectInstructionDataFieldsToBeDefined([
            "editionBump",
            "requestedEditionNumber",
            "priceInLamports",
            "buyerEditionInfoAccountBump",
        ], decodedIx.data);
        // Only recent transactions include the allowlist info, and will match the
        // expected instruction accounts in the most recent IDL.
        if (TestMainnetTxids_1.BUY_EDITION_V2_SET.has(txid)) {
            expect(decodedIx.data.buyerMerkleAllowlistProofData).toBeDefined();
            expectDecodedInstructionAccountNameMapToBeValid(expectedIxName, decodedIx);
        }
        else {
            expect(decodedIx.data.buyerMerkleAllowlistProofData).not.toBeDefined();
        }
        expect(decodedIx === null || decodedIx === void 0 ? void 0 : decodedIx.logs.find((log) => /Bought edition #(.*) for mint (.*)/.test(log))).toBeDefined();
    }));
    test.each(TestMainnetTxids_1.default.EXECUTE_SALE_V2)("Decode ExecuteSaleV2 txid (%s)", (txid) => __awaiter(void 0, void 0, void 0, function* () {
        const decodedTx = yield handleDecodeTransaction(connection, txid);
        const expectedIxName = "executeSaleV2";
        const decodedIx = decodedTx[expectedIxName];
        (0, tiny_invariant_1.default)(decodedIx != null, "decodedIx should not be null.");
        expectDecodedInstructionToBeValid(decodedIx, expectedIxName);
        expectDecodedInstructionAccountNameMapToBeValid(expectedIxName, decodedIx);
        expectInstructionDataFieldsToBeDefined([
            "escrowPaymentBump",
            "freeTradeStateBump",
            "programAsSignerBump",
            "buyerPrice",
            "sellerPrice",
            "tokenSize",
        ], decodedIx.data);
    }));
    test.each([
        ...TestMainnetTxids_1.default.CREATE_EDITION_DISTRIBUTOR_OLD,
        ...TestMainnetTxids_1.default.CREATE_EDITION_DISTRIBUTOR,
    ])("Decode CreateEditionDistributor txid (%s)", (txid) => __awaiter(void 0, void 0, void 0, function* () {
        const decodedTx = yield handleDecodeTransaction(connection, txid);
        const expectedIxName = "createEditionDistributor";
        const decodedIx = decodedTx[expectedIxName];
        (0, tiny_invariant_1.default)(decodedIx != null, "decodedIx should not be null.");
        expectDecodedInstructionToBeValid(decodedIx, expectedIxName);
        expectDecodedInstructionAccountNameMapToBeValid(expectedIxName, decodedIx);
        // All transactions should include these fields.
        expectInstructionDataFieldsToBeDefined([
            "editionBump",
            "startingPriceLamports",
            "priceFunctionType",
            "priceParams",
        ], decodedIx.data);
        // Legacy transactions should include these other fields.
        if (!TestMainnetTxids_1.CREATE_EDITION_DISTRIBUTOR_SET.has(txid)) {
            expectInstructionDataFieldsToBeDefined(["startTime", "endTime"], decodedIx.data);
        }
        // Allowlist settings should only be in the current txid set.
        if (TestMainnetTxids_1.CREATE_EDITION_DISTRIBUTOR_SET.has(txid)) {
            expectInstructionDataFieldsToBeDefined([
                "allowlistSaleStartTime",
                "publicSaleStartTime",
                "saleEndTime",
                "allowlistSalePrice",
            ], decodedIx.data);
        }
    }));
    test.each(TestMainnetTxids_1.default.UPDATE_EDITION_DISTRIBUTOR)("Decode UpdateEditionDistributor txid (%s)", (txid) => __awaiter(void 0, void 0, void 0, function* () {
        const decodedTx = yield handleDecodeTransaction(connection, txid);
        const expectedIxName = "updateEditionDistributor";
        const decodedIx = decodedTx[expectedIxName];
        (0, tiny_invariant_1.default)(decodedIx != null, "decodedIx should not be null.");
        expectDecodedInstructionToBeValid(decodedIx, expectedIxName);
        expectDecodedInstructionAccountNameMapToBeValid(expectedIxName, decodedIx);
        expectInstructionDataFieldsToBeDefined([
            "editionBump",
            "startingPriceLamports",
            "priceFunctionType",
            "priceParams",
            "newOwner",
            "startTime",
            "endTime",
        ], decodedIx.data);
    }));
    test.each(TestMainnetTxids_1.default.CLOSE_EDITION_DISTRIBUTOR_TOKEN_ACCOUNT)("Decode CloseEditionDistributorTokenAccount txid (%s)", (txid) => __awaiter(void 0, void 0, void 0, function* () {
        const decodedTx = yield handleDecodeTransaction(connection, txid);
        const expectedIxName = "closeEditionDistributorTokenAccount";
        const decodedIx = decodedTx[expectedIxName];
        (0, tiny_invariant_1.default)(decodedIx != null, "decodedIx should not be null.");
        expectDecodedInstructionToBeValid(decodedIx, expectedIxName);
        expectDecodedInstructionAccountNameMapToBeValid(expectedIxName, decodedIx);
    }));
});
