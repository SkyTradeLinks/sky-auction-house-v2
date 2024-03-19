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
const MerkleTreeLeafCountLimit_1 = __importDefault(require("constants/MerkleTreeLeafCountLimit"));
const dayjs_1 = __importDefault(require("dayjs"));
const buyEditionForTest_1 = __importDefault(require("tests/utils/buyEditionForTest"));
const cloneKeypair_1 = __importDefault(require("tests/utils/cloneKeypair"));
const createEditionAllowlist_1 = __importDefault(require("tests/utils/createEditionAllowlist"));
const createKeypairAddressMap_1 = __importDefault(require("tests/utils/createKeypairAddressMap"));
const fundSplTokenAccount_1 = __importDefault(require("tests/utils/fundSplTokenAccount"));
const getConnectionForTest_1 = __importDefault(require("tests/utils/getConnectionForTest"));
const getEditionDistributorSetup_1 = __importDefault(require("tests/utils/getEditionDistributorSetup"));
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
const connection = (0, getConnectionForTest_1.default)();
// This corresponds to the same named program constant.
const NUMBER_OF_MERKLE_ROOTS_TO_STORE = 100;
const uniqueBuyers = (0, formfunction_program_shared_1.generateKeypairArray)(NUMBER_OF_MERKLE_ROOTS_TO_STORE);
const ALLOWLIST_SIZE = NUMBER_OF_MERKLE_ROOTS_TO_STORE * MerkleTreeLeafCountLimit_1.default;
/**
 * Instead of generating a ton of unique Keypairs, which will take a while,
 * this generates 1 for each tree, and just duplicates it (each tree will have
 * all the same leaves, but be the same size as a tree with unique leaves).
 *
 * This is to more quickly generate a giant allowlist for testing.
 *
 * The test will mint 1 edition for each stored merkle tree (each unique
 * keypair generated here).
 */
function generateGiantBuyersList() {
    return uniqueBuyers
        .map((keypair) => (0, formfunction_program_shared_1.range)(MerkleTreeLeafCountLimit_1.default).map((_) => (0, cloneKeypair_1.default)(keypair)))
        .flat();
}
const buyers = generateGiantBuyersList();
const buyersKeypairMap = (0, createKeypairAddressMap_1.default)(uniqueBuyers);
describe("buy edition v2 giant allowlist", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, formfunction_program_shared_1.requestAirdrops)({
            connection,
            wallets: uniqueBuyers,
        });
        yield (0, fundSplTokenAccount_1.default)(connection, uniqueBuyers);
    }));
    test(`buy edition with the max sized allowlist of ${ALLOWLIST_SIZE} addresses`, () => __awaiter(void 0, void 0, void 0, function* () {
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
        const buyersToMint = allowlistedBuyers.map((allowlistSection) => allowlistSection.buyersChunk[0]);
        yield (0, formfunction_program_shared_1.forEachAsync)(buyersToMint, (proofData, index) => __awaiter(void 0, void 0, void 0, function* () {
            const buyerKeypair = buyersKeypairMap[proofData.address.toString()];
            yield (0, buyEditionForTest_1.default)({
                auctionHouseAccount,
                auctionHouseSdk,
                buyerKeypair,
                buyerWithAllowlistProofData: proofData,
                connection,
                metadataData,
                nftOwner,
                price,
                proofTreeIndex: index,
                remainingAccounts,
                tokenMint,
            });
        }));
    }));
});
//# sourceMappingURL=buyEditionAllowlistGiant.test.js.map