"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const PriceFunctionType_1 = __importDefault(require("types/enum/PriceFunctionType"));
function deserializePriceFunctionType(serialized) {
    return PriceFunctionType_1.default[(0, formfunction_program_shared_1.uppercaseFirstLetter)(Object.keys(
    // Anchor gives us back an object, e.g. {"constant": {}}
    serialized)[0])];
}
exports.default = deserializePriceFunctionType;
//# sourceMappingURL=deserializePriceFunctionType.js.map