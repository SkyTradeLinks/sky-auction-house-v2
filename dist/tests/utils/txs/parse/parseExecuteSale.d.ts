import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import NftTransaction from "tests/types/NftTransaction";
export default function parseExecuteSaleTx(tx: ParsedTransactionWithMeta, signature: string, tokenMint?: PublicKey): Maybe<NftTransaction>;
//# sourceMappingURL=parseExecuteSale.d.ts.map