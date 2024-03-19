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
const dayjs_1 = __importDefault(require("dayjs"));
const expectTransactionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectTransactionToFailWithErrorCode"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getEditionDistributorPriceFunction_1 = __importDefault(require("tests/utils/getEditionDistributorPriceFunction"));
const getEditionDistributorSetup_1 = __importDefault(require("tests/utils/getEditionDistributorSetup"));
const sendTransactionWithWallet_1 = __importDefault(require("tests/utils/txs/sendTransactionWithWallet"));
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
const connection = (0, getConnectionForTest_1.default)();
describe("update edition distributor tests", () => {
    it("invalid signer", () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidSigner = web3_js_1.Keypair.generate();
        const { auctionHouseSdk, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const newPrice = web3_js_1.LAMPORTS_PER_SOL * 2;
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            publicSaleStartTime: null,
            saleEndTime: null,
            startingPriceLamports: newPrice,
        });
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "SignatureVerificationFailed",
            signers: [invalidSigner],
            transaction: updateTx,
        });
    }));
    it("update starting price", () => __awaiter(void 0, void 0, void 0, function* () {
        const priceFunctionType = PriceFunctionType_1.default.Constant;
        const priceParams = [];
        const { auctionHouseSdk, editionDistributor, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: priceFunctionType,
            priceParams: priceParams,
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const newPrice = web3_js_1.LAMPORTS_PER_SOL * 2;
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            publicSaleStartTime: null,
            saleEndTime: null,
            startingPriceLamports: newPrice,
        });
        yield (0, sendTransactionWithWallet_1.default)(auctionHouseSdk.program.provider.connection, updateTx, nftOwner);
        const priceFunction = yield (0, getEditionDistributorPriceFunction_1.default)(auctionHouseSdk.program, editionDistributor);
        expect(priceFunction.startingPriceLamports).toEqual(newPrice);
        // Other fields shouldn't change
        expect(priceFunction.params).toEqual(priceParams);
        expect(priceFunction.priceFunctionType).toEqual(priceFunctionType);
    }));
    it("update entire price function", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, editionDistributor, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const newPrice = web3_js_1.LAMPORTS_PER_SOL * 2;
        const newPriceFunctionType = PriceFunctionType_1.default.Linear;
        const newParams = [5];
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            priceFunctionType: newPriceFunctionType,
            priceParams: newParams,
            publicSaleStartTime: null,
            saleEndTime: null,
            startingPriceLamports: newPrice,
        });
        yield (0, sendTransactionWithWallet_1.default)(auctionHouseSdk.program.provider.connection, updateTx, nftOwner);
        const priceFunction = yield (0, getEditionDistributorPriceFunction_1.default)(auctionHouseSdk.program, editionDistributor);
        expect(priceFunction.priceFunctionType).toEqual(newPriceFunctionType);
        expect(priceFunction.params).toEqual(newParams);
        expect(priceFunction.startingPriceLamports).toEqual(newPrice);
    }));
    it("update the owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, editionDistributor, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const newOwnerKeypair = web3_js_1.Keypair.generate();
        const newOwner = newOwnerKeypair.publicKey;
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            newOwner,
            publicSaleStartTime: null,
            saleEndTime: null,
        });
        yield (0, sendTransactionWithWallet_1.default)(auctionHouseSdk.program.provider.connection, updateTx, nftOwner);
        const editionDistributorUpdated = yield auctionHouseSdk.program.account.editionDistributor.fetch(editionDistributor);
        (0, formfunction_program_shared_1.expectPublicKeysEqual)(editionDistributorUpdated.owner, newOwner);
        // Trying to update with the old owner should fail
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "ConstraintHasOne",
            signers: [nftOwner],
            transaction: updateTx,
        });
        // Make sure the new owner is able to update the distributor
        yield (0, formfunction_program_shared_1.requestAirdrops)({ connection, wallets: [newOwnerKeypair] });
        const updateTx2 = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: newOwner,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            newOwner: nftOwner.publicKey,
            publicSaleStartTime: null,
            saleEndTime: null,
        });
        yield expect((0, sendTransactionWithWallet_1.default)(auctionHouseSdk.program.provider.connection, updateTx2, newOwnerKeypair)).resolves.not.toThrow();
    }));
    it("update start time (valid)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, editionDistributor, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const startTime = (0, dayjs_1.default)().add(1, "day").unix();
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            publicSaleStartTime: startTime,
            saleEndTime: null,
        });
        yield (0, sendTransactionWithWallet_1.default)(auctionHouseSdk.program.provider.connection, updateTx, nftOwner);
        const editionDistributorAccount = yield auctionHouseSdk.program.account.editionDistributor.fetch(editionDistributor);
        expect(editionDistributorAccount.publicSaleStartTime.toNumber()).toEqual(startTime);
    }));
    it("update end time (valid)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, editionDistributor, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const endTime = (0, dayjs_1.default)().add(1, "day").unix();
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            publicSaleStartTime: null,
            saleEndTime: endTime,
        });
        yield (0, sendTransactionWithWallet_1.default)(auctionHouseSdk.program.provider.connection, updateTx, nftOwner);
        const editionDistributorAccount = yield auctionHouseSdk.program.account.editionDistributor.fetch(editionDistributor);
        expect(editionDistributorAccount.saleEndTime.toNumber()).toEqual(endTime);
    }));
    it("update end time (invalid)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const endTime = (0, dayjs_1.default)().subtract(1, "day").unix();
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            publicSaleStartTime: null,
            saleEndTime: endTime,
        });
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "EndTimeMustBeInFuture",
            signers: [nftOwner],
            transaction: updateTx,
        });
    }));
    it("update start time and end time (valid)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, editionDistributor, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const startTime = (0, dayjs_1.default)().add(1, "day").unix();
        const endTime = (0, dayjs_1.default)().add(2, "day").unix();
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            publicSaleStartTime: startTime,
            saleEndTime: endTime,
        });
        yield (0, sendTransactionWithWallet_1.default)(auctionHouseSdk.program.provider.connection, updateTx, nftOwner);
        const editionDistributorAccount = yield auctionHouseSdk.program.account.editionDistributor.fetch(editionDistributor);
        expect(editionDistributorAccount.publicSaleStartTime.toNumber()).toEqual(startTime);
        expect(editionDistributorAccount.saleEndTime.toNumber()).toEqual(endTime);
    }));
    it("update start time and end time (invalid)", () => __awaiter(void 0, void 0, void 0, function* () {
        const { auctionHouseSdk, nftOwner, tokenMint } = yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
        const startTime = (0, dayjs_1.default)().add(2, "day").unix();
        const endTime = (0, dayjs_1.default)().add(1, "day").unix();
        const updateTx = yield auctionHouseSdk.updateEditionDistributorTx({
            mint: tokenMint,
            owner: nftOwner.publicKey,
        }, {
            allowlistSalePrice: null,
            allowlistSaleStartTime: null,
            publicSaleStartTime: startTime,
            saleEndTime: endTime,
        });
        yield (0, expectTransactionToFailWithErrorCode_1.default)({
            connection,
            errorName: "EndTimeMustComeAfterStartTime",
            signers: [nftOwner],
            transaction: updateTx,
        });
    }));
});
//# sourceMappingURL=updateEditionDistributor.test.js.map