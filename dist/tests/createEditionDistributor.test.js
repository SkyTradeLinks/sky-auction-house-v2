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
const web3_js_1 = require("@solana/web3.js");
const getEditionDistributorSetup_1 = __importDefault(require("tests/utils/getEditionDistributorSetup"));
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
describe("create edition distributor tests", () => {
    it("create no params", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Constant,
            priceParams: [],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
    }));
    it("create single param", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, getEditionDistributorSetup_1.default)({
            priceFunctionType: PriceFunctionType_1.default.Linear,
            priceParams: [5],
            startingPriceLamports: web3_js_1.LAMPORTS_PER_SOL,
        });
    }));
});
//# sourceMappingURL=createEditionDistributor.test.js.map