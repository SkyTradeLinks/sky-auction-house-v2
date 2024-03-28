use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount},
};

use crate::{
    constants::*, utils::*, AuctionHouse, AuctionHouseError, LastBidPrice, TradeStateSaleType,
};

// Supports on-chain refunds
#[derive(Accounts)]
#[instruction(trade_state_bump: u8, escrow_payment_bump: u8, buyer_price: u64, leaf_index: u64, auction_end_time: Option<i64>, previous_bidder_escrow_payment_bump: u8)]
pub struct BuyV2<'info> {
    #[account(mut)]
    wallet: Signer<'info>,
    /// CHECK: No need to deserialize.
    #[account(mut)]
    payment_account: UncheckedAccount<'info>,
    /// CHECK: No need to deserialize.
    transfer_authority: UncheckedAccount<'info>,
    treasury_mint: Box<Account<'info, Mint>>,

    /// CHECK: No need to deserialize.
    asset_id: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    merkle_tree: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.key().as_ref(),
            wallet.key().as_ref(),
            asset_id.key().as_ref()
        ],
        bump = escrow_payment_bump
    )]
    escrow_payment_account: UncheckedAccount<'info>,
    /// CHECK: No need to deserialize.
    authority: UncheckedAccount<'info>,
    #[account(
        has_one = authority,
        has_one = treasury_mint,
        has_one = auction_house_fee_account,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.creator.as_ref(),
            auction_house.treasury_mint.as_ref()
        ],
        bump = auction_house.bump,
    )]
    auction_house: Box<Account<'info, AuctionHouse>>,
    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.key().as_ref(),
            FEE_PAYER.as_bytes()
        ],
        bump = auction_house.fee_payer_bump
    )]
    auction_house_fee_account: UncheckedAccount<'info>,
    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            wallet.key().as_ref(),
            auction_house.key().as_ref(),
            asset_id.key().as_ref(),
            treasury_mint.key().as_ref(),
            merkle_tree.key().as_ref(),
            &buyer_price.to_le_bytes(),
        ],
        bump = trade_state_bump
    )]
    buyer_trade_state: UncheckedAccount<'info>,

    #[account(mut)]
    last_bid_price: Box<Account<'info, LastBidPrice>>,

    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,

    rent: Sysvar<'info, Rent>,
    clock: Sysvar<'info, Clock>,

    /// CHECK: No need to deserialize.
    previous_bidder_wallet: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.key().as_ref(),
            previous_bidder_wallet.key().as_ref(),
            
            asset_id.key().as_ref()
        ],
        bump = previous_bidder_escrow_payment_bump
    )]
    previous_bidder_escrow_payment_account: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    #[account(mut)]
    previous_bidder_refund_account: UncheckedAccount<'info>,
    ata_program: Program<'info, AssociatedToken>,
}

pub fn handle_buy_v2<'info>(
    ctx: Context<'_, '_, '_, 'info, BuyV2<'info>>,
    trade_state_bump: u8,
    escrow_payment_bump: u8,
    buyer_price: u64,
    leaf_index: u64,
    // Unix time (seconds since epoch)
    auction_end_time: Option<i64>,
    previous_bidder_escrow_payment_bump: u8,
) -> Result<()> {
     let wallet = &ctx.accounts.wallet;
    let payment_account = &ctx.accounts.payment_account;
    let transfer_authority = &ctx.accounts.transfer_authority;
    let treasury_mint = &ctx.accounts.treasury_mint;

    let asset_id = &ctx.accounts.asset_id;
    let merkle_tree = &ctx.accounts.merkle_tree;

    let escrow_payment_account = &ctx.accounts.escrow_payment_account;
    let authority = &ctx.accounts.authority;
    let auction_house = &ctx.accounts.auction_house;
    let auction_house_fee_account = &ctx.accounts.auction_house_fee_account;
    let buyer_trade_state = &mut ctx.accounts.buyer_trade_state;

    let last_bid_price = &mut ctx.accounts.last_bid_price;
    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let rent = &ctx.accounts.rent;
    let clock = &ctx.accounts.clock;

    assert_valid_auction_house(ctx.program_id, &auction_house.key())?;

    assert_valid_nft(&asset_id.key(), &merkle_tree.key(), leaf_index)?;

    assert_valid_last_bid_price(
        ctx.program_id,
        &last_bid_price.to_account_info(),
        &auction_house.key(),
        &asset_id.key(),
    )?;

    let is_native = treasury_mint.key() == spl_token::native_mint::id();
    let previous_bidder_wallet = &ctx.accounts.previous_bidder_wallet;
    let previous_bidder_refund_account = &ctx.accounts.previous_bidder_refund_account;
    let previous_bidder_escrow_payment_account =
        &ctx.accounts.previous_bidder_escrow_payment_account;
    let ata_program = &ctx.accounts.ata_program;

    let sale_type = get_trade_state_sale_type(&buyer_trade_state.to_account_info());
    msg!("buyer_sale_type = {}", sale_type);

    match auction_end_time {
        None => {
            // Do nothing
        }
        Some(auction_end_time_val) => {
            if clock.unix_timestamp >= auction_end_time_val {
                return Err(AuctionHouseError::BidTooLate.into());
            }
        }
    }

    let auction_house_key = auction_house.key();
    let seeds = [
        PREFIX.as_bytes(),
        auction_house_key.as_ref(),
        FEE_PAYER.as_bytes(),
        &[auction_house.fee_payer_bump],
    ];

    let (fee_payer, fee_seeds) = get_fee_payer(
        authority,
        auction_house,
        wallet.to_account_info(),
        auction_house_fee_account.to_account_info(),
        &seeds,
    )?;

    let auction_house_key = auction_house.key();
    let wallet_key = wallet.key();
    let merkle_tree_key = merkle_tree.key();
    let asset_id_key=asset_id.key();
    let escrow_signer_seeds = [
        PREFIX.as_bytes(),
        auction_house_key.as_ref(),
        wallet_key.as_ref(),
        
        asset_id_key.as_ref(),
        &[escrow_payment_bump],
    ];

    create_program_token_account_if_not_present(
        escrow_payment_account,
        system_program,
        &fee_payer,
        token_program,
        &treasury_mint.to_account_info(),
        &auction_house.to_account_info(),
        rent,
        &escrow_signer_seeds,
        fee_seeds,
        is_native,
    )?;

    if is_native {
        assert_keys_equal(wallet.key(), payment_account.key())?;

        invoke(
            &system_instruction::transfer(
                &payment_account.key(),
                &escrow_payment_account.key(),
                buyer_price,
            ),
            &[
                payment_account.to_account_info(),
                escrow_payment_account.to_account_info(),
                system_program.to_account_info(),
            ],
        )?;
    } else {
        invoke(
            &spl_token::instruction::transfer(
                &token_program.key(),
                &payment_account.key(),
                &escrow_payment_account.key(),
                &transfer_authority.key(),
                &[],
                buyer_price,
            )?,
            &[
                transfer_authority.to_account_info(),
                payment_account.to_account_info(),
                escrow_payment_account.to_account_info(),
                token_program.to_account_info(),
            ],
        )?;
    }

    let ts_info = buyer_trade_state.to_account_info();
    if ts_info.data_is_empty() {
        let wallet_key = wallet.key();

        let asset_id_key = asset_id.key;
        let ts_seeds = [
            PREFIX.as_bytes(),
            wallet_key.as_ref(),
            auction_house_key.as_ref(),
            asset_id_key.as_ref(),
            auction_house.treasury_mint.as_ref(),
            merkle_tree.key.as_ref(),
            &buyer_price.to_le_bytes(),
            &[trade_state_bump],
        ];
        create_or_allocate_account_raw(
            *ctx.program_id,
            &ts_info,
            &rent.to_account_info(),
            &system_program,
            &fee_payer,
            1 as usize,
            fee_seeds,
            &ts_seeds,
        )?;
    }
    let buyer_trade_state_data_len = ts_info.data_len();
    let buyer_trade_state_data = &mut ts_info.data.borrow_mut();
    buyer_trade_state_data[0] = trade_state_bump;

    // Execute various checks and other business logic based on the type of sale
     if buyer_trade_state_data_len > 1 {
        // Manually "deserialize" data here instead of relying on anchor since we
        // use `create_or_allocate_account_raw` to initialize these accounts using a
        // dynamic fee_payer (vs. Anchor where we need to specify fee_payer)
        let buyer_sale_type = buyer_trade_state_data[1];

        // https://stackoverflow.com/a/28029667
        match buyer_sale_type {
            sale_type if sale_type == TradeStateSaleType::Auction as u8 => {
                if last_bid_price.price > 0 {
                    let min_price_diff = get_min_price_diff_in_lamports(
                        last_bid_price.price,
                        last_bid_price.tick_size_constant_in_lamports,
                        treasury_mint.decimals,
                    )?;
                    let min_price = last_bid_price
                        .price
                        .checked_add(min_price_diff)
                        .ok_or(AuctionHouseError::NumericalOverflow)?;
                    if buyer_price < min_price {
                        return Err(AuctionHouseError::BidTooLow.into());
                    }
                }

                if let Some(last_bid_price_bidder) = last_bid_price.bidder {
                    if last_bid_price.price > 0 && last_bid_price_bidder != ZERO_PUBKEY {
                        if previous_bidder_wallet.key() != last_bid_price_bidder {
                            return Err(AuctionHouseError::PreviousBidderIncorrect.into());
                        }

                        withdraw_helper(
                            previous_bidder_wallet,
                            previous_bidder_refund_account,
                            previous_bidder_escrow_payment_account,
                            authority,
                            auction_house,
                            auction_house_fee_account,
                            &treasury_mint.to_account_info(),
                            merkle_tree,
                            asset_id,
                            system_program,
                            token_program,
                            ata_program,
                            rent,
                            previous_bidder_escrow_payment_bump,
                            last_bid_price.price,
                            false,
                        )?;
                    }
                }

                // Only set last bid price if this is for an auction
                last_bid_price.price = buyer_price;
                last_bid_price.bidder = Some(wallet.key());
            }
            sale_type if sale_type == TradeStateSaleType::Offer as u8 => {
                if last_bid_price.price > 0 || last_bid_price.bidder != Some(ZERO_PUBKEY) {
                    // If sale type for buy is not auction and auction is already
                    // in progress, do not allow
                    return Err(AuctionHouseError::CannotPlaceOfferWhileOnAuction.into());
                }else{
                    //add checks for updating the bid.
                }
            }
            _ => {
                // Do nothing
            }
        }
    } else {
        // Keep legacy logic around to not break old listings
        if last_bid_price.price > 0 {
            let min_price_diff = get_min_price_diff_in_lamports(
                last_bid_price.price,
                last_bid_price.tick_size_constant_in_lamports,
                treasury_mint.decimals,
            )?;
            let min_price = last_bid_price
                .price
                .checked_add(min_price_diff)
                .ok_or(AuctionHouseError::NumericalOverflow)?;
            if buyer_price < min_price {
                return Err(AuctionHouseError::BidTooLow.into());
            }
        }

        if let Some(last_bid_price_bidder) = last_bid_price.bidder {
            if last_bid_price.price > 0 && last_bid_price_bidder != ZERO_PUBKEY {
                if previous_bidder_wallet.key() != last_bid_price_bidder {
                    return Err(AuctionHouseError::PreviousBidderIncorrect.into());
                }

                withdraw_helper(
                    previous_bidder_wallet,
                    previous_bidder_refund_account,
                    previous_bidder_escrow_payment_account,
                    authority,
                    auction_house,
                    auction_house_fee_account,
                    &treasury_mint.to_account_info(),
                    merkle_tree,
                    asset_id,
                    system_program,
                    token_program,
                    ata_program,
                    rent,
                    previous_bidder_escrow_payment_bump,
                    last_bid_price.price,
                    false,
                )?;
            }
        }

        last_bid_price.price = buyer_price;
        last_bid_price.bidder = Some(wallet.key());
    } 
 
    Ok(())
}
