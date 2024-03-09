import { PdaResult } from "../../../formfunction-program-shared/src";
import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "../../constants/SolanaConstants";

export default function findAuctionHouse(
  creator: PublicKey,
  treasuryMint: PublicKey,
  auctionHouseProgramId: PublicKey
): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(AUCTION_HOUSE), creator.toBuffer(), treasuryMint.toBuffer()],
    auctionHouseProgramId
  );
}
