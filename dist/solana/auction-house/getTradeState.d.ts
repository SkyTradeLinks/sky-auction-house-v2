import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
export default function getTradeState({ wallet, tokenAccount, tokenMint, priceInLamports, auctionHouse, treasuryMint, auctionHouseProgramId, tokenSize, }: {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    priceInLamports: number;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    tokenSize?: number;
    treasuryMint: PublicKey;
    wallet: PublicKey;
}): Promise<[PublicKey, number, BN]>;
//# sourceMappingURL=getTradeState.d.ts.map