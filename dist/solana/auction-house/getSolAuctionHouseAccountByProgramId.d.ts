import { PublicKey } from "@solana/web3.js";
/**
 * In some cases, we (mistakenly) use the auction house account key as one of the
 * seeds for a PDA (e.g., last_bid_price) but we want to maintain the
 * same PDA across auction houses. For these cases, we use the following helper
 * to fix the auction house account key.
 */
export default function getSolAuctionHouseAccountByProgramId(programId: PublicKey): PublicKey;
//# sourceMappingURL=getSolAuctionHouseAccountByProgramId.d.ts.map