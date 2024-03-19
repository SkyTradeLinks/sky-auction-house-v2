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
const buyEditionForTest_1 = __importDefault(require("tests/utils/buyEditionForTest"));
const createEditionAllowlist_1 = __importDefault(require("tests/utils/createEditionAllowlist"));
const createKeypairAddressMap_1 = __importDefault(require("tests/utils/createKeypairAddressMap"));
const expectFunctionToFailWithErrorCode_1 = __importDefault(require("tests/utils/errors/expectFunctionToFailWithErrorCode"));
const fundSplTokenAccount_1 = __importDefault(require("tests/utils/fundSplTokenAccount"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getEditionDistributorSetup_1 = __importDefault(require("tests/utils/getEditionDistributorSetup"));
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
const connection = (0, getConnectionForTest_1.default)();
const buyers = (0, formfunction_program_shared_1.generateKeypairArray)(5);
const buyersKeypairMap = (0, createKeypairAddressMap_1.default)(buyers);
// Note: We wait for this time in the test after minting from the allowlist.
// If the number of buyers changes (or if the tests start failing for other
// reasons), this time may need to be adjusted.
function getPublicSaleStartTimeForTest() {
    return (0, dayjs_1.default)().add(20, "seconds").unix();
}
// Recursively get a proof randomly from another buyer, which should be
// invalid, for the currentBuyer.
function getOtherBuyersProof(buyersList, currentBuyer) {
    const randomChunkIndex = (0, formfunction_program_shared_1.randomNumberInRange)(0, buyersList.length - 1);
    const { buyersChunk } = buyersList[randomChunkIndex];
    const randomBuyerIndex = (0, formfunction_program_shared_1.randomNumberInRange)(0, buyersChunk.length - 1);
    const randomBuyer = buyersChunk[randomBuyerIndex];
    if ((0, formfunction_program_shared_1.arePublicKeysEqual)(randomBuyer.address, currentBuyer)) {
        return getOtherBuyersProof(buyersList, currentBuyer);
    }
    return randomBuyer;
}
function waitForPublicSale(publicSaleStartTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = (0, dayjs_1.default)().unix();
        const remainingTimeUntilPublicSale = now < publicSaleStartTime ? publicSaleStartTime - now : 0;
        const extraBufferTime = 2; // This is a bit arbitrary.
        const timeToWait = remainingTimeUntilPublicSale + extraBufferTime;
        (0, formfunction_program_shared_1.logIfDebug)(`Waiting ${timeToWait} seconds for public sale to start.`);
        yield (0, formfunction_program_shared_1.sleep)(timeToWait);
    });
}
describe("buy edition v2 allowlist", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, formfunction_program_shared_1.requestAirdrops)({
            connection,
            wallets: buyers,
        });
        yield (0, fundSplTokenAccount_1.default)(connection, buyers);
    }));
    test("buy edition with an allowlist", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, programCreator, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            allowlistSaleStartTime: (0, dayjs_1.default)().unix(),
            antiBotProtectionEnabled: false,
            maxSupply: 500,
            multipleCreators: false,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            publicSaleStartTime: 0,
            startingPriceLamports: price,
        });
        const allowlistedBuyers = yield (0, createEditionAllowlist_1.default)({
            auctionHouseAuthorityKeypair: programCreator,
            auctionHouseSdk,
            buyers,
            connection,
            mint: tokenMint,
        });
        yield (0, formfunction_program_shared_1.forEachAsync)(allowlistedBuyers, (allowlistSection, index) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, formfunction_program_shared_1.forEachAsync)(allowlistSection.buyersChunk, (proofData) => __awaiter(void 0, void 0, void 0, function* () {
                const buyerKeypair = buyersKeypairMap[proofData.address.toString()];
                const handleBuy = (buyerWithAllowlistProofData) => __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, buyEditionForTest_1.default)({
                        auctionHouseAccount,
                        auctionHouseSdk,
                        buyerKeypair,
                        buyerWithAllowlistProofData,
                        connection,
                        metadataData,
                        nftOwner,
                        price,
                        proofTreeIndex: index,
                        remainingAccounts,
                        tokenMint,
                    });
                });
                // A proof is required, because this is an allowlist sale.
                yield (0, expectFunctionToFailWithErrorCode_1.default)({
                    errorName: "AllowlistProofRequired",
                    fn: () => handleBuy(null),
                });
                // Invalid proofs are rejected.
                const randomInvalidProofData = getOtherBuyersProof(allowlistedBuyers, proofData.address);
                yield (0, expectFunctionToFailWithErrorCode_1.default)({
                    errorName: "InvalidAllowlistProof",
                    fn: () => handleBuy(randomInvalidProofData),
                });
                // Valid proofs are accepted, up to the allowlisted amount.
                yield (0, formfunction_program_shared_1.forEachAsync)((0, formfunction_program_shared_1.range)(0, proofData.amount), () => __awaiter(void 0, void 0, void 0, function* () {
                    yield handleBuy(proofData);
                }));
                // Minting past the allowlisted amount fails.
                yield (0, expectFunctionToFailWithErrorCode_1.default)({
                    errorName: "AllowlistAmountAlreadyMinted",
                    fn: () => handleBuy(proofData),
                });
            }));
        }));
    }));
    test("buy edition with an allowlist before the allowlist start time fails", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, programCreator, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            allowlistSaleStartTime: (0, dayjs_1.default)().add(1, "day").unix(),
            antiBotProtectionEnabled: false,
            multipleCreators: false,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            publicSaleStartTime: 0,
            startingPriceLamports: price,
        });
        const allowlistedBuyers = yield (0, createEditionAllowlist_1.default)({
            auctionHouseAuthorityKeypair: programCreator,
            auctionHouseSdk,
            buyers,
            connection,
            mint: tokenMint,
        });
        yield (0, formfunction_program_shared_1.forEachAsync)(allowlistedBuyers, (allowlistSection, index) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, formfunction_program_shared_1.forEachAsync)(allowlistSection.buyersChunk, (proofData) => __awaiter(void 0, void 0, void 0, function* () {
                const buyerKeypair = buyersKeypairMap[proofData.address.toString()];
                const handleBuy = (buyerWithAllowlistProofData) => __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, buyEditionForTest_1.default)({
                        auctionHouseAccount,
                        auctionHouseSdk,
                        buyerKeypair,
                        buyerWithAllowlistProofData,
                        connection,
                        metadataData,
                        nftOwner,
                        price,
                        proofTreeIndex: index,
                        remainingAccounts,
                        tokenMint,
                    });
                });
                // Allowlist sale hasn't started yet so buying attempts should fail.
                yield (0, expectFunctionToFailWithErrorCode_1.default)({
                    errorName: "BuyEditionTooEarly",
                    fn: () => handleBuy(proofData),
                });
            }));
        }));
    }));
    test("buy edition with an allowlist can be followed by a public sale with buy limits", () => __awaiter(void 0, void 0, void 0, function* () {
        const price = web3_js_1.LAMPORTS_PER_SOL;
        const limitPerAddress = 3;
        const publicSaleStartTime = getPublicSaleStartTimeForTest();
        const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, programCreator, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
            allowlistSaleStartTime: (0, dayjs_1.default)().unix(),
            antiBotProtectionEnabled: false,
            limitPerAddress,
            maxSupply: 500,
            multipleCreators: false,
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            publicSaleStartTime,
            startingPriceLamports: price,
        });
        const allowlistedBuyers = yield (0, createEditionAllowlist_1.default)({
            auctionHouseAuthorityKeypair: programCreator,
            auctionHouseSdk,
            buyers,
            connection,
            mint: tokenMint,
        });
        const handleBuy = (buyerKeypair, buyerWithAllowlistProofData, proofTreeIndex) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, buyEditionForTest_1.default)({
                auctionHouseAccount,
                auctionHouseSdk,
                buyerKeypair,
                buyerWithAllowlistProofData,
                connection,
                metadataData,
                nftOwner,
                price,
                proofTreeIndex,
                remainingAccounts,
                tokenMint,
            });
        });
        yield (0, formfunction_program_shared_1.forEachAsync)(allowlistedBuyers, (allowlistSection, index) => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, formfunction_program_shared_1.forEachAsync)(allowlistSection.buyersChunk, (proofData) => __awaiter(void 0, void 0, void 0, function* () {
                const buyerKeypair = buyersKeypairMap[proofData.address.toString()];
                // Mint all the allowlisted editions for each buyer.
                yield (0, formfunction_program_shared_1.forEachAsync)((0, formfunction_program_shared_1.range)(0, proofData.amount), () => __awaiter(void 0, void 0, void 0, function* () {
                    yield handleBuy(buyerKeypair, proofData, index);
                }));
            }));
        }));
        yield waitForPublicSale(publicSaleStartTime);
        yield (0, formfunction_program_shared_1.forEachAsync)(buyers, (buyer) => __awaiter(void 0, void 0, void 0, function* () {
            // Buy up to the limit per address for each buyer.
            yield (0, formfunction_program_shared_1.forEachAsync)((0, formfunction_program_shared_1.range)(0, limitPerAddress), () => __awaiter(void 0, void 0, void 0, function* () {
                yield handleBuy(buyer, null, null);
            }));
            // Additional buys should fail.
            yield (0, expectFunctionToFailWithErrorCode_1.default)({
                errorName: "EditionLimitPerAddressExceeded",
                fn: () => handleBuy(buyer, null, null),
            });
        }));
    }));
    test("buy edition with an allowlist can be priced separately from the public sale, and can be priced at 0", () => __awaiter(void 0, void 0, void 0, function* () {
        const ALLOWLIST_PRICES = [0, web3_js_1.LAMPORTS_PER_SOL / 2];
        for (const allowlistSalePrice of ALLOWLIST_PRICES) {
            const publicSalePrice = web3_js_1.LAMPORTS_PER_SOL;
            const limitPerAddress = 3;
            const publicSaleStartTime = getPublicSaleStartTimeForTest();
            const { auctionHouseAccount, auctionHouseSdk, metadataData, nftOwner, programCreator, remainingAccounts, tokenMint, } = yield (0, getEditionDistributorSetup_1.default)({
                allowlistSalePrice,
                allowlistSaleStartTime: (0, dayjs_1.default)().unix(),
                antiBotProtectionEnabled: false,
                limitPerAddress,
                maxSupply: 500,
                multipleCreators: false,
                priceFunctionType: PriceFunctionType_1.default.Constant,
                priceParams: [],
                publicSaleStartTime,
                startingPriceLamports: publicSalePrice,
            });
            const allowlistedBuyers = yield (0, createEditionAllowlist_1.default)({
                auctionHouseAuthorityKeypair: programCreator,
                auctionHouseSdk,
                buyers,
                connection,
                mint: tokenMint,
            });
            const handleBuy = (buyerKeypair, buyerWithAllowlistProofData, price, proofTreeIndex) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, buyEditionForTest_1.default)({
                    auctionHouseAccount,
                    auctionHouseSdk,
                    buyerKeypair,
                    buyerWithAllowlistProofData,
                    connection,
                    metadataData,
                    nftOwner,
                    price,
                    proofTreeIndex,
                    remainingAccounts,
                    tokenMint,
                });
            });
            yield (0, formfunction_program_shared_1.forEachAsync)(allowlistedBuyers, (allowlistSection, index) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, formfunction_program_shared_1.forEachAsync)(allowlistSection.buyersChunk, (proofData) => __awaiter(void 0, void 0, void 0, function* () {
                    const buyerKeypair = buyersKeypairMap[proofData.address.toString()];
                    yield handleBuy(buyerKeypair, proofData, allowlistSalePrice, index);
                }));
            }));
            yield waitForPublicSale(publicSaleStartTime);
            yield (0, formfunction_program_shared_1.forEachAsync)(buyers, (buyer) => __awaiter(void 0, void 0, void 0, function* () {
                yield handleBuy(buyer, null, publicSalePrice, null);
            }));
        }
    }));
});
