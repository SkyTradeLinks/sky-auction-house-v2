import { PdaResult } from "../../../formfunction-program-shared/src";
import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "../../constants/SolanaConstants";

export default function findAuctionHouseProgramAsSigner(
  auctionHouseProgramId: PublicKey
): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(AUCTION_HOUSE), Buffer.from("signer")],
    auctionHouseProgramId
  );
}
