import { lowercaseFirstLetter } from "../../../formfunction-program-shared/src";
import PriceFunctionType from "../../types/enum/PriceFunctionType";

export default function convertPriceFunctionTypeToAnchorArg(
  priceFunctionType: PriceFunctionType
) {
  // Anchor enum args are weird... this gets the name of the enum and lowercases the first letter
  return { [lowercaseFirstLetter(PriceFunctionType[priceFunctionType])]: {} };
}
