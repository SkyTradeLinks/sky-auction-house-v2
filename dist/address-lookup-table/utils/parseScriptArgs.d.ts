import { Environment, Maybe, MaybeUndef } from "@formfunction-hq/formfunction-program-shared";
import { PublicKey } from "@solana/web3.js";
type Options = {
    environment: Environment;
    saveTableAddressFilename: MaybeUndef<string>;
    tableAddress: Maybe<PublicKey>;
};
export default function parseScriptArgs(): Options;
export {};
//# sourceMappingURL=parseScriptArgs.d.ts.map