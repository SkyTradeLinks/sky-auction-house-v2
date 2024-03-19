"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
function convertPriceFunctionTypeToAnchorArg(priceFunctionType) {
    // Anchor enum args are weird... this gets the name of the enum and lowercases the first letter
    return { [(0, formfunction_program_shared_1.lowercaseFirstLetter)(PriceFunctionType_1.default[priceFunctionType])]: {} };
}
exports.default = convertPriceFunctionTypeToAnchorArg;
