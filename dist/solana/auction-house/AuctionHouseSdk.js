"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const web3_js_1 = require("@solana/web3.js");
const getSolAuctionHouseAccountByProgramId_1 = __importDefault(require("solana/auction-house/getSolAuctionHouseAccountByProgramId"));
const getTradeState_1 = __importDefault(require("solana/auction-house/getTradeState"));
const auctionHouseAppendEditionAllowlistMerkleRootsIx_1 = __importDefault(require("solana/instructions/auctionHouseAppendEditionAllowlistMerkleRootsIx"));
const auctionHouseBuyEditionV2Ix_1 = __importDefault(require("solana/instructions/auctionHouseBuyEditionV2Ix"));
const auctionHouseBuyV2Ix_1 = __importDefault(require("solana/instructions/auctionHouseBuyV2Ix"));
const auctionHouseCancelV2Ix_1 = __importDefault(require("solana/instructions/auctionHouseCancelV2Ix"));
const auctionHouseClearEditionAllowlistMerkleRootsIx_1 = __importDefault(require("solana/instructions/auctionHouseClearEditionAllowlistMerkleRootsIx"));
const auctionHouseCloseEditionAllowlistSettingsAccountIx_1 = __importDefault(require("solana/instructions/auctionHouseCloseEditionAllowlistSettingsAccountIx"));
const auctionHouseCloseEditionDistributorIx_1 = __importDefault(require("solana/instructions/auctionHouseCloseEditionDistributorIx"));
const auctionHouseCloseEditionDistributorTokenAccountIx_1 = __importDefault(require("solana/instructions/auctionHouseCloseEditionDistributorTokenAccountIx"));
const auctionHouseCreateEditionDistributorIx_1 = __importDefault(require("solana/instructions/auctionHouseCreateEditionDistributorIx"));
const auctionHouseCreateIx_1 = __importDefault(require("solana/instructions/auctionHouseCreateIx"));
const auctionHouseCreateLastBidPriceIx_1 = __importDefault(require("solana/instructions/auctionHouseCreateLastBidPriceIx"));
const auctionHouseCreateTradeStateIx_1 = __importDefault(require("solana/instructions/auctionHouseCreateTradeStateIx"));
const auctionHouseDepositIx_1 = __importDefault(require("solana/instructions/auctionHouseDepositIx"));
const auctionHouseExecuteSaleV2Ix_1 = __importDefault(require("solana/instructions/auctionHouseExecuteSaleV2Ix"));
const auctionHouseSellIx_1 = __importDefault(require("solana/instructions/auctionHouseSellIx"));
const auctionHouseSetEditionDistributorAntiBotProtectionEnabledIx_1 = __importDefault(require("solana/instructions/auctionHouseSetEditionDistributorAntiBotProtectionEnabledIx"));
const auctionHouseSetEditionDistributorLimitPerAddressIx_1 = __importDefault(require("solana/instructions/auctionHouseSetEditionDistributorLimitPerAddressIx"));
const auctionHouseSetHasBeenSoldIx_1 = __importDefault(require("solana/instructions/auctionHouseSetHasBeenSoldIx"));
const auctionHouseSetPreviousBidderIx_1 = __importDefault(require("solana/instructions/auctionHouseSetPreviousBidderIx"));
const auctionHouseSetTickSizeIx_1 = __importDefault(require("solana/instructions/auctionHouseSetTickSizeIx"));
const auctionHouseThawDelegatedAccountIx_1 = __importDefault(require("solana/instructions/auctionHouseThawDelegatedAccountIx"));
const auctionHouseUpdateEditionDistributorIx_1 = __importDefault(require("solana/instructions/auctionHouseUpdateEditionDistributorIx"));
const auctionHouseUpdateIx_1 = __importDefault(require("solana/instructions/auctionHouseUpdateIx"));
const auctionHouseWithdrawBonkIx_1 = __importDefault(require("solana/instructions/auctionHouseWithdrawBonkIx"));
const auctionHouseWithdrawFromTreasuryIx_1 = __importDefault(require("solana/instructions/auctionHouseWithdrawFromTreasuryIx"));
const auctionHouseWithdrawIx_1 = __importDefault(require("solana/instructions/auctionHouseWithdrawIx"));
const findAuctionHouse_1 = __importDefault(require("solana/pdas/findAuctionHouse"));
const findAuctionHouseBuyerEscrow_1 = __importDefault(require("solana/pdas/findAuctionHouseBuyerEscrow"));
const findAuctionHouseFeeAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseFeeAccount"));
const findAuctionHouseProgramAsSigner_1 = __importDefault(require("solana/pdas/findAuctionHouseProgramAsSigner"));
const findAuctionHouseTreasuryAccount_1 = __importDefault(require("solana/pdas/findAuctionHouseTreasuryAccount"));
const findEditionAllowlistSettingsAccount_1 = __importDefault(require("solana/pdas/findEditionAllowlistSettingsAccount"));
const findEditionDistributor_1 = __importDefault(require("solana/pdas/findEditionDistributor"));
const findLastBidPrice_1 = __importDefault(require("solana/pdas/findLastBidPrice"));
const getRemainingAccounts_1 = __importDefault(require("solana/utils/getRemainingAccounts"));
const getWalletIfNativeElseAta_1 = __importDefault(require("solana/utils/getWalletIfNativeElseAta"));
const SaleType_1 = __importDefault(require("types/enum/SaleType"));
class AuctionHouseSdk {
    constructor(program, { antiBotAuthority, auctionHouse, auctionHouseBump, feeAccount, feeBump, treasuryAccount, treasuryBump, treasuryMint, walletAuthority, walletCreator, }) {
        this.program = program;
        this.antiBotAuthority = antiBotAuthority;
        this.auctionHouse = auctionHouse;
        this.auctionHouseBump = auctionHouseBump;
        this.feeAccount = feeAccount;
        this.feeBump = feeBump;
        this.treasuryAccount = treasuryAccount;
        this.treasuryBump = treasuryBump;
        this.treasuryMint = treasuryMint;
        this.walletAuthority = walletAuthority;
        this.walletCreator = walletCreator;
    }
    static init(program, { antiBotAuthority, treasuryMint, walletAuthority, walletCreator, }) {
        const [auctionHouse, auctionHouseBump] = (0, findAuctionHouse_1.default)(walletCreator, treasuryMint, program.programId);
        const [feeAccount, feeBump] = (0, findAuctionHouseFeeAccount_1.default)(auctionHouse, program.programId);
        const [treasuryAccount, treasuryBump] = (0, findAuctionHouseTreasuryAccount_1.default)(auctionHouse, program.programId);
        return new this(program, {
            antiBotAuthority,
            auctionHouse,
            auctionHouseBump,
            feeAccount,
            feeBump,
            treasuryAccount,
            treasuryBump,
            treasuryMint,
            walletAuthority,
            walletCreator,
        });
    }
    createTradeState({ tokenAccount, tokenMint, wallet, }, { allocationSize, priceInLamports, saleType, tokenSize, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, auctionHouseCreateTradeStateIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseFeeAccount: this.feeAccount,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                program: this.program,
                tokenAccount,
                tokenMint,
                treasuryMint: this.treasuryMint,
                wallet,
            }, {
                allocationSize,
                priceInLamports,
                saleType,
                tokenSize,
            });
        });
    }
    buyV2(saleType, { previousBidderWallet, priceInLamports, tokenAccount, tokenMint, wallet, }, { auctionEndTime, tokenSize = 1, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tradeStateIx = yield this.createTradeState({
                tokenAccount,
                tokenMint,
                wallet,
            }, {
                priceInLamports,
                saleType,
                tokenSize,
            });
            const buyIx = yield (0, auctionHouseBuyV2Ix_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                feeAccount: this.feeAccount,
                previousBidderRefundAccount: yield (0, getWalletIfNativeElseAta_1.default)(previousBidderWallet, this.treasuryMint),
                previousBidderWallet,
                priceInLamports,
                program: this.program,
                tokenAccount,
                tokenMint,
                treasuryMint: this.treasuryMint,
                walletBuyer: wallet,
            }, { auctionEndTime, tokenSize });
            return (0, formfunction_program_shared_1.ixToTx)(tradeStateIx).add(buyIx);
        });
    }
    buyV2Tx(accounts, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.buyV2(SaleType_1.default.Auction, accounts, args);
        });
    }
    buyV2InstantSaleTx(accounts, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.buyV2(SaleType_1.default.InstantSale, accounts, args);
        });
    }
    buyV2MakeOfferTx(accounts, args, shouldCreateLastBidPriceIfNotExists = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const [buyTx, createLastBidPriceTx] = yield Promise.all([
                this.buyV2(SaleType_1.default.Offer, accounts, args),
                shouldCreateLastBidPriceIfNotExists
                    ? this.createLastBidPriceIfNotExistsTx({
                        tokenMint: accounts.tokenMint,
                        wallet: accounts.wallet,
                    })
                    : null,
            ]);
            return (0, formfunction_program_shared_1.ixsToTx)([
                // Placing an offer requires the last_bid_price account to be
                // initialized, so we create it if needed.
                ...(createLastBidPriceTx == null
                    ? []
                    : createLastBidPriceTx.instructions),
                ...buyTx.instructions,
            ]);
        });
    }
    buyAndCancelTx({ oldPriceInLamports, previousBidderWallet, priceInLamports, tokenAccount, tokenMint, wallet, }, { auctionEndTime, tokenSize = 1, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [cancelTradeState] = yield this.findTradeState(wallet, tokenAccount, tokenMint, oldPriceInLamports !== null && oldPriceInLamports !== void 0 ? oldPriceInLamports : 0);
            const cancelTradeStateAccountInfo = yield this.program.provider.connection.getAccountInfo(cancelTradeState, "finalized");
            const cancelIx = oldPriceInLamports == null || cancelTradeStateAccountInfo == null
                ? null
                : yield (0, auctionHouseCancelV2Ix_1.default)({
                    auctionHouse: this.auctionHouse,
                    auctionHouseProgramId: this.program.programId,
                    authority: this.walletAuthority,
                    feeAccount: this.feeAccount,
                    priceInLamports: oldPriceInLamports,
                    program: this.program,
                    tokenAccount,
                    tokenMint,
                    treasuryMint: this.treasuryMint,
                    wallet,
                }, { tokenSize });
            const buyTx = yield this.buyV2(SaleType_1.default.Auction, {
                previousBidderWallet,
                priceInLamports,
                tokenAccount,
                tokenMint,
                wallet,
            }, { auctionEndTime, tokenSize });
            const tx = new web3_js_1.Transaction();
            tx.add(...(0, formfunction_program_shared_1.filterNulls)([cancelIx, ...buyTx.instructions]));
            return tx;
        });
    }
    cancelTx({ priceInLamports, tokenAccount, tokenMint, wallet, }, { tokenSize = 1 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseCancelV2Ix_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                feeAccount: this.feeAccount,
                priceInLamports,
                program: this.program,
                tokenAccount,
                tokenMint,
                treasuryMint: this.treasuryMint,
                wallet,
            }, { tokenSize });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    buyEditionV2Tx({ buyer, mint, newMint, }, { buyerWithAllowlistProofData, priceInLamports, }, 
    // Creators
    remainingAccounts) {
        return __awaiter(this, void 0, void 0, function* () {
            const computeLimitIx = web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                units: 400000,
            });
            const buyIx = yield (0, auctionHouseBuyEditionV2Ix_1.default)({
                antiBotAuthority: this.antiBotAuthority,
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                buyer,
                mint,
                newMint,
                program: this.program,
                treasuryMint: this.treasuryMint,
            }, { buyerWithAllowlistProofData, priceInLamports }, (yield (0, getRemainingAccounts_1.default)(remainingAccounts, this.treasuryMint)));
            return (0, formfunction_program_shared_1.ixsToTx)([computeLimitIx, buyIx]);
        });
    }
    createLastBidPriceTx({ tokenMint, wallet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const auctionHouseAddressKey = (0, getSolAuctionHouseAccountByProgramId_1.default)(this.program.programId);
            const ix = yield (0, auctionHouseCreateLastBidPriceIx_1.default)({
                auctionHouse: auctionHouseAddressKey,
                auctionHouseProgramId: this.program.programId,
                program: this.program,
                tokenMint,
                wallet,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    createLastBidPriceIfNotExistsTx({ tokenMint, wallet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [lastBidPrice] = yield this.findLastBidPrice(tokenMint);
            const lastBidPriceAccount = yield this.program.provider.connection.getAccountInfo(lastBidPrice);
            if (lastBidPriceAccount != null) {
                return null;
            }
            return this.createLastBidPriceTx({ tokenMint, wallet });
        });
    }
    closeEditionDistributor({ mint, owner, rentReceiver, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseCloseEditionDistributorIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                mint,
                owner,
                program: this.program,
                rentReceiver,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    closeEditionDistributorTokenAccount({ mint, owner, rentReceiver, tokenReceiver, wallet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [ownerAta] = (0, formfunction_program_shared_1.findAtaPda)(owner, mint);
            const ownerAtaAccount = yield this.program.provider.connection.getAccountInfo(ownerAta);
            const createAtaInstruction = ownerAtaAccount != null ? null : yield (0, formfunction_program_shared_1.createAtaIx)(mint, owner, wallet);
            const ix = yield (0, auctionHouseCloseEditionDistributorTokenAccountIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                mint,
                owner,
                program: this.program,
                rentReceiver,
                tokenReceiver,
            });
            return (0, formfunction_program_shared_1.ixsToTx)((0, formfunction_program_shared_1.filterNulls)([createAtaInstruction, ix]));
        });
    }
    createTradeStateTx({ allocationSize, priceInLamports, saleType, tokenAccount, tokenMint, wallet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield this.createTradeState({
                tokenAccount,
                tokenMint,
                wallet,
            }, {
                allocationSize,
                priceInLamports,
                saleType,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    createEditionDistributorTx({ mint, owner, tokenAccount, }, { allowlistSalePrice, allowlistSaleStartTime, antiBotProtectionEnabled, limitPerAddress, priceFunctionType, priceParams, publicSaleStartTime, saleEndTime, startingPriceLamports, }, shouldTransferMasterEdition = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseCreateEditionDistributorIx_1.default)({
                mint,
                owner,
                program: this.program,
                tokenAccount,
                treasuryMint: this.treasuryMint,
            }, {
                allowlistSalePrice,
                allowlistSaleStartTime,
                priceFunctionType,
                priceParams,
                publicSaleStartTime,
                saleEndTime,
                startingPriceLamports,
            });
            const setAntiBotProtectionEnabledIx = antiBotProtectionEnabled
                ? [
                    yield (0, auctionHouseSetEditionDistributorAntiBotProtectionEnabledIx_1.default)({
                        auctionHouse: this.auctionHouse,
                        authority: this.walletAuthority,
                        mint,
                        owner,
                        program: this.program,
                    }, {
                        antiBotProtectionEnabled,
                    }),
                ]
                : [];
            const setLimitPerAddressIx = limitPerAddress != null
                ? [
                    yield (0, auctionHouseSetEditionDistributorLimitPerAddressIx_1.default)({
                        auctionHouse: this.auctionHouse,
                        authority: this.walletAuthority,
                        mint,
                        owner,
                        program: this.program,
                    }, {
                        limitPerAddress,
                    }),
                ]
                : [];
            const extraIxs = [
                ...setLimitPerAddressIx,
                ...setAntiBotProtectionEnabledIx,
            ];
            if (!shouldTransferMasterEdition) {
                return (0, formfunction_program_shared_1.ixsToTx)([ix, ...extraIxs]);
            }
            const transferTx = yield this.transferMasterEditionToDistributorTx({
                mint,
                sourceTokenAccount: tokenAccount,
                wallet: owner,
            });
            return (0, formfunction_program_shared_1.ixsToTx)([ix, ...extraIxs, ...transferTx.instructions]);
        });
    }
    createTx({ feeWithdrawalDestination, payer, treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner, }, { basisPoints, basisPointsSecondary, canChangePrice, payAllFees, requiresSignOff, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseCreateIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                feeAccount: this.feeAccount,
                feeWithdrawalDestination,
                payer,
                program: this.program,
                treasuryAccount: this.treasuryAccount,
                treasuryMint: this.treasuryMint,
                treasuryWithdrawalDestination,
                treasuryWithdrawalDestinationOwner,
            }, {
                auctionHouseBump: this.auctionHouseBump,
                basisPoints,
                basisPointsSecondary,
                canChangePrice,
                feeBump: this.feeBump,
                payAllFees,
                requiresSignOff,
                treasuryBump: this.treasuryBump,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    depositTx({ paymentAccount, tokenMint, transferAuthority, wallet, }, { amount }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseDepositIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                feeAccount: this.feeAccount,
                paymentAccount: paymentAccount !== null && paymentAccount !== void 0 ? paymentAccount : (yield (0, getWalletIfNativeElseAta_1.default)(wallet, this.treasuryMint)),
                program: this.program,
                tokenMint,
                transferAuthority,
                treasuryMint: this.treasuryMint,
                wallet,
            }, { amount });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    executeSaleV2Tx({ buyerPriceInLamports, buyerReceiptTokenAccount, sellerPriceInLamports, tokenAccount, tokenMint, wallet, walletBuyer, walletCreator, walletSeller, }, { tokenSize = 1 }, remainingAccounts, computeUnitLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            const computeLimitIx = computeUnitLimit == null
                ? null
                : web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                    units: computeUnitLimit,
                });
            const updateMetadataIxs = [];
            // If this is a primary sale, should update the metadata
            if (walletCreator.equals(wallet)) {
                const [metadataPda] = (0, formfunction_program_shared_1.findTokenMetadataPda)(tokenMint);
                const metadataIx = (0, mpl_token_metadata_1.createUpdateMetadataAccountInstruction)({
                    metadata: metadataPda,
                    updateAuthority: wallet,
                }, {
                    updateMetadataAccountArgs: {
                        data: null,
                        primarySaleHappened: true,
                        updateAuthority: wallet,
                    },
                });
                updateMetadataIxs.push(metadataIx);
            }
            const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, this.program.programId);
            const executeIx = yield (0, auctionHouseExecuteSaleV2Ix_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                buyerPriceInLamports,
                buyerReceiptTokenAccount,
                lastBidPrice,
                program: this.program,
                sellerPriceInLamports,
                tokenAccount,
                tokenMint,
                treasuryMint: this.treasuryMint,
                walletBuyer,
                walletCreator,
                walletSeller,
            }, { tokenSize }, yield (0, getRemainingAccounts_1.default)(remainingAccounts, this.treasuryMint));
            const tx = new web3_js_1.Transaction();
            // Important to update the metadata AFTER the sale is executed, so fees get
            // taken accordingly.
            const ixs = (0, formfunction_program_shared_1.filterNulls)([computeLimitIx, executeIx, ...updateMetadataIxs]);
            tx.add(...ixs);
            return tx;
        });
    }
    getNextEditionNumber(mint) {
        return __awaiter(this, void 0, void 0, function* () {
            const supply = yield (0, formfunction_program_shared_1.getMasterEditionSupply)(this.program.provider.connection, mint);
            return supply + 1;
        });
    }
    sell(saleType, shouldCreateLastBidPriceIfNotExists, { priceInLamports, tokenAccount, tokenMint, wallet, }, { tokenSize = 1 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tradeStateIx = yield this.createTradeState({
                tokenAccount,
                tokenMint,
                wallet,
            }, {
                priceInLamports,
                saleType,
                tokenSize,
            });
            const [createLastBidPriceTx, sellIx] = yield Promise.all([
                shouldCreateLastBidPriceIfNotExists
                    ? this.createLastBidPriceIfNotExistsTx({ tokenMint, wallet })
                    : null,
                (0, auctionHouseSellIx_1.default)({
                    auctionHouse: this.auctionHouse,
                    auctionHouseProgramId: this.program.programId,
                    authority: this.walletAuthority,
                    feeAccount: this.feeAccount,
                    priceInLamports,
                    program: this.program,
                    tokenAccount,
                    tokenMint,
                    treasuryMint: this.treasuryMint,
                    walletSeller: wallet,
                }, { tokenSize }),
            ]);
            return (0, formfunction_program_shared_1.ixsToTx)([
                // Executing a sale requires the last_bid_price account to be
                // created. Thus, we initialize the account during listing if
                // needed.
                ...(createLastBidPriceTx == null
                    ? []
                    : createLastBidPriceTx.instructions),
                tradeStateIx,
                sellIx,
            ]);
        });
    }
    sellTx(accounts, args, shouldCreateLastBidPriceIfNotExists = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sell(SaleType_1.default.Auction, shouldCreateLastBidPriceIfNotExists, accounts, args);
        });
    }
    sellInstantSaleTx(accounts, args, shouldCreateLastBidPriceIfNotExists = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sell(SaleType_1.default.InstantSale, shouldCreateLastBidPriceIfNotExists, accounts, args);
        });
    }
    sellAcceptOfferTx(accounts, args, remainingAccounts) {
        return __awaiter(this, void 0, void 0, function* () {
            // For accepting offers, we don't need to do anything in the `sell` ix
            // so we just create the trade state to indicate that the seller authorizes
            // the offer acceptance
            const { buyerReceiptTokenAccount, tokenAccount, tokenMint, wallet, walletBuyer, walletCreator, walletSeller, priceInLamports, } = accounts;
            const [[tradeStateAccountAddress], tradeStateIx, executeSaleTx] = yield Promise.all([
                this.findTradeState(wallet, tokenAccount, tokenMint, priceInLamports),
                this.createTradeState({
                    tokenAccount,
                    tokenMint,
                    wallet,
                }, {
                    priceInLamports,
                    saleType: SaleType_1.default.Offer,
                    tokenSize: args.tokenSize,
                }),
                this.executeSaleV2Tx({
                    buyerPriceInLamports: priceInLamports,
                    buyerReceiptTokenAccount,
                    sellerPriceInLamports: priceInLamports,
                    tokenAccount,
                    tokenMint,
                    wallet,
                    walletBuyer,
                    walletCreator,
                    walletSeller,
                }, args, remainingAccounts),
            ]);
            const tradeStateAccount = yield this.program.provider.connection.getAccountInfo(tradeStateAccountAddress);
            if (tradeStateAccount == null) {
                return (0, formfunction_program_shared_1.ixToTx)(tradeStateIx).add(...executeSaleTx.instructions);
            }
            return executeSaleTx;
        });
    }
    sellAndCancel(saleType, { oldPriceInLamports, priceInLamports, tokenAccount, tokenMint, wallet, }, { tokenSize = 1 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [cancelTradeState] = yield this.findTradeState(wallet, tokenAccount, tokenMint, oldPriceInLamports);
            const cancelTradeStateAccountInfo = yield this.program.provider.connection.getAccountInfo(cancelTradeState, "finalized");
            const cancelIx = cancelTradeStateAccountInfo == null
                ? null
                : yield (0, auctionHouseCancelV2Ix_1.default)({
                    auctionHouse: this.auctionHouse,
                    auctionHouseProgramId: this.program.programId,
                    authority: this.walletAuthority,
                    feeAccount: this.feeAccount,
                    priceInLamports: oldPriceInLamports,
                    program: this.program,
                    tokenAccount,
                    tokenMint,
                    treasuryMint: this.treasuryMint,
                    wallet,
                }, { tokenSize });
            const sellTx = yield this.sell(saleType, false, {
                priceInLamports,
                tokenAccount,
                tokenMint,
                wallet,
            }, { tokenSize });
            const tx = new web3_js_1.Transaction();
            tx.add(...(0, formfunction_program_shared_1.filterNulls)([cancelIx, ...sellTx.instructions]));
            return tx;
        });
    }
    sellAndCancelTx(accounts, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sellAndCancel(SaleType_1.default.Auction, accounts, args);
        });
    }
    sellInstantSaleAndCancelTx(accounts, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sellAndCancel(SaleType_1.default.InstantSale, accounts, args);
        });
    }
    setEditionDistributorAntiBotProtectionEnabledTx(accounts, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseSetEditionDistributorAntiBotProtectionEnabledIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                mint: accounts.mint,
                program: this.program,
            }, args);
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    setEditionDistributorLimitPerAddressTx(accounts, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseSetEditionDistributorLimitPerAddressIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                mint: accounts.mint,
                program: this.program,
            }, args);
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    setPreviousBidderTx({ tokenMint, }, { bidder }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseSetPreviousBidderIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                program: this.program,
                tokenMint,
            }, { bidder });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    setHasBeenSoldTx({ tokenMint, }, { hasBeenSold }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseSetHasBeenSoldIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                program: this.program,
                tokenMint,
            }, { hasBeenSold });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    setTickSizeTx({ owner, tokenAccount, tokenMint, }, { tickSizeConstantInLamports }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseSetTickSizeIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                owner,
                program: this.program,
                tokenAccount,
                tokenMint,
                treasuryMint: this.treasuryMint,
            }, { tickSizeConstantInLamports });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    thawDelegatedAccountTx({ tokenAccount, tokenMint, walletSeller, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const thawDelegatedAccountIx = yield (0, auctionHouseThawDelegatedAccountIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                program: this.program,
                tokenAccount,
                tokenMint,
                walletSeller,
            });
            return (0, formfunction_program_shared_1.ixToTx)(thawDelegatedAccountIx);
        });
    }
    transferMasterEditionToDistributorTx({ mint, sourceTokenAccount, wallet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [editionDistributor] = (0, findEditionDistributor_1.default)(mint, this.program.programId);
            const [editionDistributorAta] = (0, formfunction_program_shared_1.findAtaPda)(editionDistributor, mint);
            const transferMasterEditionIx = yield (0, formfunction_program_shared_1.createTransferAtaIx)(editionDistributorAta, sourceTokenAccount, wallet, [], 1);
            const ataAccountInfo = yield this.program.provider.connection.getAccountInfo(editionDistributorAta);
            // It's possible the ATA is already created, in which case we
            // don't need the createAtaIx here.
            if (ataAccountInfo == null) {
                const createDistributorAtaIx = yield (0, formfunction_program_shared_1.createAtaIx)(mint, editionDistributor, wallet);
                return (0, formfunction_program_shared_1.ixsToTx)([createDistributorAtaIx, transferMasterEditionIx]);
            }
            else {
                return (0, formfunction_program_shared_1.ixToTx)(transferMasterEditionIx);
            }
        });
    }
    withdrawFromTreasuryTx({ treasuryWithdrawalDestination, }, { amount }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseWithdrawFromTreasuryIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                program: this.program,
                treasuryAccount: this.treasuryAccount,
                treasuryMint: this.treasuryMint,
                treasuryWithdrawalDestination,
            }, { amount });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    updateEditionDistributorTx({ mint, owner, }, { allowlistSalePrice, allowlistSaleStartTime, saleEndTime, newOwner, priceFunctionType, priceParams, startingPriceLamports, publicSaleStartTime, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseUpdateEditionDistributorIx_1.default)({
                mint,
                owner,
                program: this.program,
                treasuryMint: this.treasuryMint,
            }, {
                allowlistSalePrice,
                allowlistSaleStartTime,
                newOwner,
                priceFunctionType,
                priceParams,
                publicSaleStartTime,
                saleEndTime,
                startingPriceLamports,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    updateTx({ feeWithdrawalDestination, newAuthority, payer, treasuryWithdrawalDestination, treasuryWithdrawalDestinationOwner, }, { basisPoints, requiresSignOff, canChangePrice, basisPointsSecondary, payAllFees, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseUpdateIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                feeWithdrawalDestination,
                newAuthority,
                payer,
                program: this.program,
                treasuryMint: this.treasuryMint,
                treasuryWithdrawalDestination,
                treasuryWithdrawalDestinationOwner,
            }, {
                basisPoints,
                basisPointsSecondary,
                canChangePrice,
                payAllFees,
                requiresSignOff,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    withdrawTx({ receiptAccount, tokenMint, wallet, }, { amount }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseWithdrawIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                program: this.program,
                receiptAccount: receiptAccount !== null && receiptAccount !== void 0 ? receiptAccount : (yield (0, getWalletIfNativeElseAta_1.default)(wallet, this.treasuryMint)),
                tokenMint,
                treasuryMint: this.treasuryMint,
                wallet,
            }, { amount });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    withdrawAndCancelTx({ receiptAccount, tokenAccount, tokenMint, wallet, }, { amount, tokenSize = 1, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const cancelIx = yield (0, auctionHouseCancelV2Ix_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                feeAccount: this.feeAccount,
                priceInLamports: amount,
                program: this.program,
                tokenAccount,
                tokenMint,
                treasuryMint: this.treasuryMint,
                wallet,
            }, { tokenSize });
            const withdrawIx = yield (0, auctionHouseWithdrawIx_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                authority: this.walletAuthority,
                program: this.program,
                receiptAccount,
                tokenMint,
                treasuryMint: this.treasuryMint,
                wallet,
            }, { amount });
            const tx = new web3_js_1.Transaction();
            tx.add(...(0, formfunction_program_shared_1.filterNulls)([cancelIx, withdrawIx]));
            return tx;
        });
    }
    withdrawBonkTx({ bonkTokenAccount, mint, tokenReceiver, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseWithdrawBonkIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                bonkTokenAccount,
                mint,
                program: this.program,
                tokenReceiver,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    appendEditionAllowlistMerkleRootsTx({ mint }, { merkleRoots }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseAppendEditionAllowlistMerkleRootsIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                mint,
                program: this.program,
            }, {
                merkleRoots,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    clearEditionAllowlistMerkleRootsTx({ mint, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [editionDistributorPda] = (0, findEditionDistributor_1.default)(mint, this.program.programId);
            const [editionAllowlistSettingsPda] = (0, findEditionAllowlistSettingsAccount_1.default)(editionDistributorPda, this.program.programId);
            try {
                // This will throw if the account doesn't exist.
                yield this.program.account.editionAllowlistSettings.fetch(editionAllowlistSettingsPda, "confirmed");
            }
            catch (err) {
                // The account lookup will throw if the account doesn't exist yet.
                return null;
            }
            const ix = yield (0, auctionHouseClearEditionAllowlistMerkleRootsIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                mint,
                program: this.program,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    closeEditionAllowlistSettingsAccountTx({ mint }) {
        return __awaiter(this, void 0, void 0, function* () {
            const ix = yield (0, auctionHouseCloseEditionAllowlistSettingsAccountIx_1.default)({
                auctionHouse: this.auctionHouse,
                authority: this.walletAuthority,
                mint,
                program: this.program,
            });
            return (0, formfunction_program_shared_1.ixToTx)(ix);
        });
    }
    ///
    /// PDAs
    ///
    findBuyerEscrow(wallet, tokenMint) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, findAuctionHouseBuyerEscrow_1.default)(this.auctionHouse, wallet, tokenMint, this.program.programId);
        });
    }
    findEditionDistributor(tokenMint) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, findEditionDistributor_1.default)(tokenMint, this.program.programId);
        });
    }
    findLastBidPrice(tokenMint) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, findLastBidPrice_1.default)(tokenMint, this.program.programId);
        });
    }
    findProgramAsSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, findAuctionHouseProgramAsSigner_1.default)(this.program.programId);
        });
    }
    findTradeState(wallet, tokenAccount, tokenMint, priceInLamports, tokenSize = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getTradeState_1.default)({
                auctionHouse: this.auctionHouse,
                auctionHouseProgramId: this.program.programId,
                priceInLamports,
                tokenAccount,
                tokenMint,
                tokenSize,
                treasuryMint: this.treasuryMint,
                wallet,
            });
        });
    }
    ///
    /// Static
    ///
    static getEditionNumberFromTx(tx) {
        var _a;
        const logs = (_a = tx.meta) === null || _a === void 0 ? void 0 : _a.logMessages;
        if (logs == null) {
            return null;
        }
        const logLine = logs.find((line) => line.includes("Bought edition #"));
        if (logLine == null) {
            return null;
        }
        const regex = /Bought edition #(\d+)/;
        const matches = logLine.match(regex);
        if (matches == null || matches.length < 2) {
            return null;
        }
        return Number(matches[1]);
    }
}
exports.default = AuctionHouseSdk;
//# sourceMappingURL=AuctionHouseSdk.js.map