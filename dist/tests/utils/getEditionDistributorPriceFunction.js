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
const deserializePriceFunctionType_1 = __importDefault(require("solana/utils/deserializePriceFunctionType"));
function getEditionDistributorPriceFunction(program, editionDistributor) {
    return __awaiter(this, void 0, void 0, function* () {
        const editionDistributorAccount = yield program.account.editionDistributor.fetch(editionDistributor);
        return {
            params: editionDistributorAccount.priceFunction.params,
            priceFunctionType: (0, deserializePriceFunctionType_1.default)(editionDistributorAccount.priceFunction.priceFunctionType),
            startingPriceLamports: editionDistributorAccount.priceFunction.startingPriceLamports.toNumber(),
        };
    });
}
exports.default = getEditionDistributorPriceFunction;
//# sourceMappingURL=getEditionDistributorPriceFunction.js.map