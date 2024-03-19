import { Connection, Keypair, PublicKey } from "@solana/web3.js";
export default function verifyDelegateAndFrozen(connection: Connection, tokenMint: PublicKey, tokenAccount: PublicKey, wallet: Keypair, auctionHouseProgramId: PublicKey, expectedIsFrozen: boolean, expectedDelegate?: PublicKey): Promise<void>;
//# sourceMappingURL=verifyDelegateAndFrozen.d.ts.map