import { loadKeyPairV2 } from "./helper";
import "dotenv/config";

// HdgFFgSrfav2mmbacqY6yZa4kyvjaA4LQDvSPvphjPSP
export const auctionHouseAuthority = loadKeyPairV2(
  process.env.AUCTION_HOUSE_AUTHORITY
);

export const AUCTION_HOUSE = "auction_house";
export const FEE_PAYER = "fee_payer";
export const TREASURY = "treasury";
