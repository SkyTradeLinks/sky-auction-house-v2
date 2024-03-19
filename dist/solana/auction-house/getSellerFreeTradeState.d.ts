import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
export default function getFreeTradeState({ wallet, tokenAccount, tokenMint, auctionHouse, treasuryMint, auctionHouseProgramId, tokenSize, }: {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    tokenSize?: number;
    treasuryMint: PublicKey;
    wallet: PublicKey;
}): Promise<[PublicKey, number, BN]>;
//# sourceMappingURL=getSellerFreeTradeState.d.ts.map