"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAST_BID_PRICE = exports.TREASURY = exports.FEE_PAYER = exports.AUCTION_HOUSE = exports.auctionHouseAuthority = void 0;
const helper_1 = require("./helper");
require("dotenv/config");
// HdgFFgSrfav2mmbacqY6yZa4kyvjaA4LQDvSPvphjPSP
exports.auctionHouseAuthority = (0, helper_1.loadKeyPairV2)(process.env.AUCTION_HOUSE_AUTHORITY);
exports.AUCTION_HOUSE = "auction_house";
exports.FEE_PAYER = "fee_payer";
exports.TREASURY = "treasury";
exports.LAST_BID_PRICE = "last_bid_price";
