import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "../utils/constants";

const findTradeState = (
  auctionHouse: PublicKey,
  wallet: PublicKey,
  assetId: PublicKey,
  treasuryMint: PublicKey,
  merkleTree: PublicKey,
  auctionHouseProgramId: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      assetId.toBuffer(),
      treasuryMint.toBuffer(),
      merkleTree.toBuffer(),
    ],
    auctionHouseProgramId
  );
};

export default findTradeState;
