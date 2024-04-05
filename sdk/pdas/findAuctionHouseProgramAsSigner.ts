import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "../utils/constants";

export default function findAuctionHouseProgramAsSigner(
  auctionHouseProgramId: PublicKey
) {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(AUCTION_HOUSE), Buffer.from("signer")],
    auctionHouseProgramId
  );
}
