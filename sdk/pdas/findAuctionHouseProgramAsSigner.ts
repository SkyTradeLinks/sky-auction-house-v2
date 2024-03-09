import * as anchor from "@coral-xyz/anchor";
import PdaResult from "../types/PdaResult";
import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "../utils/constants";

export default function findAuctionHouseProgramAsSigner(auctionHouseProgramId: PublicKey): PdaResult {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(AUCTION_HOUSE), Buffer.from("signer")],
    auctionHouseProgramId
  );
}