import { loadKeyPairV2 } from "./helper";
import * as anchor from "@coral-xyz/anchor";
import fs from 'fs';
import "dotenv/config";

// HdgFFgSrfav2mmbacqY6yZa4kyvjaA4LQDvSPvphjPSP
export const getAuthorityKeypair = () => {
  const walletFile = '/home/chuksud77/.config/solana/id.json';
  const decodedKey = new Uint8Array(
    JSON.parse(fs.readFileSync(walletFile).toString())
  );
  // const walletContents = fs.readFileSync(walletFile, 'utf-8');
  // const walletData = JSON.parse(walletContents);
  let keyPair = anchor.web3.Keypair.fromSecretKey(decodedKey);
  
  // console.log("AUTHORITY", keyPair)
  return keyPair;

}
export const auctionHouseAuthority = loadKeyPairV2(
  process.env.AUCTION_HOUSE_AUTHORITY
);

// export const auctionHouseAuthority = loadKeyPairV2(getAuthorityKeypair());

export const AUCTION_HOUSE = "auction_house";
export const LAST_BID_PRICE = "last_bid_price";
export const FEE_PAYER = "fee_payer";
export const TREASURY = "treasury";
export const BUY_PRICE = 10;
export const BASIS_POINTS = 1_000;
export const BASIS_POINTS_SECONDARY = 100;
export const BASIS_POINTS_100_PERCENT = 10_000;


export const SPL_TOKEN_DECIMALS = 9;
