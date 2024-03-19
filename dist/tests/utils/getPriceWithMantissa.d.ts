import { Idl, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
export default function getPriceWithMantissa<T extends Idl>(price: number, mint: PublicKey, anchorProgram: Program<T>): Promise<number>;
//# sourceMappingURL=getPriceWithMantissa.d.ts.map