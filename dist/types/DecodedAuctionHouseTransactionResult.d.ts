/**
 * NOTE: This is an auto-generated file. Don't edit it directly.
 */
import { DecodedInstructionAccount, GenericDecodedTransaction } from "@formfunction-hq/formfunction-program-shared";
import AuctionHouseInstructionName from "types/AuctionHouseInstructionName";
declare const AppendEditionAllowlistMerkleRootsAccounts: any;
declare const BuyEditionV2Accounts: any;
declare const BuyV2Accounts: any;
declare const CancelV2Accounts: any;
declare const ClearEditionAllowlistMerkleRootsAccounts: any;
declare const CloseEditionAllowlistSettingsAccountAccounts: any;
declare const CloseEditionDistributorAccounts: any;
declare const CloseEditionDistributorTokenAccountAccounts: any;
declare const CreateAuctionHouseAccounts: any;
declare const CreateEditionDistributorAccounts: any;
declare const CreateLastBidPriceAccounts: any;
declare const CreateTradeStateAccounts: any;
declare const DepositAccounts: any;
declare const ExecuteSaleV2Accounts: any;
declare const SellAccounts: any;
declare const SetEditionDistributorBotProtectionEnabledAccounts: any;
declare const SetEditionDistributorLimitPerAddressAccounts: any;
declare const SetHasBeenSoldAccounts: any;
declare const SetLastBidPriceAccounts: any;
declare const SetPreviousBidderAccounts: any;
declare const SetTickSizeAccounts: any;
declare const ThawDelegatedAccountAccounts: any;
declare const UpdateAuctionHouseAccounts: any;
declare const UpdateEditionDistributorAccounts: any;
declare const WithdrawAccounts: any;
declare const WithdrawBonkAccounts: any;
declare const WithdrawFromFeeAccounts: any;
declare const WithdrawFromTreasuryAccounts: any;
type DecodedAuctionHouseTransactionResult = {
    appendEditionAllowlistMerkleRoots?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof AppendEditionAllowlistMerkleRootsAccounts[0]]: DecodedInstructionAccount;
        };
    };
    buyEditionV2?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof BuyEditionV2Accounts[0]]: DecodedInstructionAccount;
        };
    };
    buyV2?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof BuyV2Accounts[0]]: DecodedInstructionAccount;
        };
    };
    cancelV2?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CancelV2Accounts[0]]: DecodedInstructionAccount;
        };
    };
    clearEditionAllowlistMerkleRoots?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof ClearEditionAllowlistMerkleRootsAccounts[0]]: DecodedInstructionAccount;
        };
    };
    closeEditionAllowlistSettingsAccount?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CloseEditionAllowlistSettingsAccountAccounts[0]]: DecodedInstructionAccount;
        };
    };
    closeEditionDistributor?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CloseEditionDistributorAccounts[0]]: DecodedInstructionAccount;
        };
    };
    closeEditionDistributorTokenAccount?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CloseEditionDistributorTokenAccountAccounts[0]]: DecodedInstructionAccount;
        };
    };
    createAuctionHouse?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CreateAuctionHouseAccounts[0]]: DecodedInstructionAccount;
        };
    };
    createEditionDistributor?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CreateEditionDistributorAccounts[0]]: DecodedInstructionAccount;
        };
    };
    createLastBidPrice?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CreateLastBidPriceAccounts[0]]: DecodedInstructionAccount;
        };
    };
    createTradeState?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof CreateTradeStateAccounts[0]]: DecodedInstructionAccount;
        };
    };
    deposit?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof DepositAccounts[0]]: DecodedInstructionAccount;
        };
    };
    executeSaleV2?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof ExecuteSaleV2Accounts[0]]: DecodedInstructionAccount;
        };
    };
    sell?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof SellAccounts[0]]: DecodedInstructionAccount;
        };
    };
    setEditionDistributorBotProtectionEnabled?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof SetEditionDistributorBotProtectionEnabledAccounts[0]]: DecodedInstructionAccount;
        };
    };
    setEditionDistributorLimitPerAddress?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof SetEditionDistributorLimitPerAddressAccounts[0]]: DecodedInstructionAccount;
        };
    };
    setHasBeenSold?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof SetHasBeenSoldAccounts[0]]: DecodedInstructionAccount;
        };
    };
    setLastBidPrice?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof SetLastBidPriceAccounts[0]]: DecodedInstructionAccount;
        };
    };
    setPreviousBidder?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof SetPreviousBidderAccounts[0]]: DecodedInstructionAccount;
        };
    };
    setTickSize?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof SetTickSizeAccounts[0]]: DecodedInstructionAccount;
        };
    };
    thawDelegatedAccount?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof ThawDelegatedAccountAccounts[0]]: DecodedInstructionAccount;
        };
    };
    updateAuctionHouse?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof UpdateAuctionHouseAccounts[0]]: DecodedInstructionAccount;
        };
    };
    updateEditionDistributor?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof UpdateEditionDistributorAccounts[0]]: DecodedInstructionAccount;
        };
    };
    withdraw?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof WithdrawAccounts[0]]: DecodedInstructionAccount;
        };
    };
    withdrawBonk?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof WithdrawBonkAccounts[0]]: DecodedInstructionAccount;
        };
    };
    withdrawFromFee?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof WithdrawFromFeeAccounts[0]]: DecodedInstructionAccount;
        };
    };
    withdrawFromTreasury?: GenericDecodedTransaction<AuctionHouseInstructionName> & {
        accountsMap: {
            [Key in typeof WithdrawFromTreasuryAccounts[0]]: DecodedInstructionAccount;
        };
    };
};
export default DecodedAuctionHouseTransactionResult;
//# sourceMappingURL=DecodedAuctionHouseTransactionResult.d.ts.map