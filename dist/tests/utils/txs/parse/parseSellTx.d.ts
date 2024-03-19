import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import NftTransaction from "tests/types/NftTransaction";
export default function parseSellTx(tx: ParsedTransactionWithMeta, signature: string, tokenMint?: PublicKey): Maybe<NftTransaction>;
//# sourceMappingURL=parseSellTx.d.ts.map