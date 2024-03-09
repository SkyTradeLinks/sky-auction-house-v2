import { uppercaseFirstLetter } from "../../../formfunction-program-shared/src";
import PriceFunctionType from "../../types/enum/PriceFunctionType";

export default function deserializePriceFunctionType(
  serialized: any
): PriceFunctionType {
  return PriceFunctionType[
    uppercaseFirstLetter(
      Object.keys(
        // Anchor gives us back an object, e.g. {"constant": {}}
        serialized as {
          [key: string]: any;
        }
      )[0]
    ) as any
  ] as any;
}
