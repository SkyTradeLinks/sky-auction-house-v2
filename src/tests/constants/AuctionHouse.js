"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT_TAX = exports.SPL_TOKEN_DECIMALS = exports.BASIS_POINTS_100_PERCENT = exports.BASIS_POINTS_SECONDARY = exports.BASIS_POINTS = exports.BUY_PRICE = exports.ZERO_PUBKEY = exports.TREASURY_WITHDRAWAL_DESTINATION_OWNER = exports.FEE_WITHDRAWAL_DESTINATION = exports.AUCTION_HOUSE_PROGRAM_ID = exports.TREASURY_LABEL = exports.FEE_PAYER_LABEL = exports.AUCTION_HOUSE_LABEL = void 0;
const web3_js_1 = require("@solana/web3.js");
const Wallets_1 = require("tests/constants/Wallets");
///
/// LABELS
///
exports.AUCTION_HOUSE_LABEL = "auction_house";
exports.FEE_PAYER_LABEL = "fee_payer";
exports.TREASURY_LABEL = "treasury";
///
/// PROGRAM IDS
///
exports.AUCTION_HOUSE_PROGRAM_ID = new web3_js_1.PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
///
/// ACCOUNTS
///
exports.FEE_WITHDRAWAL_DESTINATION = Wallets_1.WALLET_CREATOR.publicKey;
exports.TREASURY_WITHDRAWAL_DESTINATION_OWNER = Wallets_1.WALLET_CREATOR.publicKey;
exports.ZERO_PUBKEY = new web3_js_1.PublicKey(Buffer.from(Array(32).fill(0)));
///
/// PRICES
///
exports.BUY_PRICE = 10;
exports.BASIS_POINTS = 1000;
exports.BASIS_POINTS_SECONDARY = 100;
exports.BASIS_POINTS_100_PERCENT = 10000;
exports.SPL_TOKEN_DECIMALS = 9;
exports.BOT_TAX = 10000000;
