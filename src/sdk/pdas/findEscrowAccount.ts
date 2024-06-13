import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "../utils/constants";

const findEscrowAccount = (
  auctionHouse: PublicKey,
  wallet: PublicKey,
  assetId: PublicKey,
  auctionHouseProgramId: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      wallet.toBuffer(),
      assetId.toBuffer(),
    ],
    auctionHouseProgramId
  );
};

export default findEscrowAccount;
