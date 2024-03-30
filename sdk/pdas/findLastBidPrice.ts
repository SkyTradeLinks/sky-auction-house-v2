import { PublicKey } from "@solana/web3.js";
import { LAST_BID_PRICE } from "../utils/constants";

const findLastBidPrice = (
  auctionHouse: PublicKey,
  assetId: PublicKey,
  auctionHouseProgramId: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(LAST_BID_PRICE), auctionHouse.toBuffer(), assetId.toBuffer()],
    auctionHouseProgramId
  );
};

export default findLastBidPrice;
