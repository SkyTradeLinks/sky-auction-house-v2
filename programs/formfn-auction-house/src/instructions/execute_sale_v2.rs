use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke_signed, system_instruction},
};
use anchor_spl::{associated_token::AssociatedToken, token::Token};
use mpl_bubblegum::types::MetadataArgs;

use crate::{
    constants::*, utils::*, AuctionHouse, AuctionHouseError, LastBidPrice, LeafData,
    TradeStateSaleType,
};

// Required since we need to make `program_as_signer` mutable to pass into `thaw_delegated_account`
#[derive(Accounts)]
#[instruction(escrow_payment_bump: u8, leaf_data: LeafData,)]
pub struct ExecuteSaleV2<'info> {
    /// CHECK: No need to deserialize.
    #[account(mut)]
    buyer: UncheckedAccount<'info>,
    /// CHECK: No need to deserialize.
    #[account(mut)]
    seller: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    treasury_mint: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    asset_id: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.key().as_ref(),
            buyer.key().as_ref(),
            asset_id.key().as_ref()
        ],
        bump = escrow_payment_bump
    )]
    escrow_payment_account: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    #[account(mut)]
    seller_payment_receipt_account: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    merkle_tree: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    authority: UncheckedAccount<'info>,
    
    #[account(
        has_one = authority,
        has_one = treasury_mint,
        has_one = auction_house_treasury,
        has_one = auction_house_fee_account,
        seeds = [
            PREFIX.as_bytes(),
            auction_house.creator.as_ref(),
            auction_house.treasury_mint.as_ref()
        ],
        bump = auction_house.bump,
    )]
    // Wrap in Box to put on the heap
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
            auction_house.key().as_ref(),
            TREASURY.as_bytes()
        ],
        bump = auction_house.treasury_bump
    )]
    auction_house_treasury: UncheckedAccount<'info>,

    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            buyer.key().as_ref(),
            auction_house.key().as_ref(),
            asset_id.key().as_ref(),
            auction_house.treasury_mint.as_ref(),
            merkle_tree.key().as_ref(),
        ],
        bump = buyer_trade_state.to_account_info().data.borrow()[0]
    )]
    buyer_trade_state: UncheckedAccount<'info>,
    /// CHECK: No need to deserialize.
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            seller.key().as_ref(),
            auction_house.key().as_ref(),
            asset_id.key().as_ref(),
            auction_house.treasury_mint.as_ref(),
            merkle_tree.key().as_ref(),
        ],
        bump = seller_trade_state.to_account_info().data.borrow()[0]
    )]
    seller_trade_state: UncheckedAccount<'info>,

    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
    ata_program: Program<'info, AssociatedToken>,

    rent: Sysvar<'info, Rent>,

    #[account(mut)]
    last_bid_price: Account<'info, LastBidPrice>,

    /// CHECK: No need to deserialize.
    nft_delegate: UncheckedAccount<'info>,
}

pub fn handle_execute_sale_v2<'info>(
    ctx: Context<'_, '_, '_, 'info, ExecuteSaleV2<'info>>,
    escrow_payment_bump: u8,
    leaf_data: LeafData,
) -> Result<()> {
    let buyer = &ctx.accounts.buyer;
    let seller = &ctx.accounts.seller;

    let treasury_mint = &ctx.accounts.treasury_mint;
    let seller_payment_receipt_account = &ctx.accounts.seller_payment_receipt_account;

    let escrow_payment_account = &ctx.accounts.escrow_payment_account;
    let authority = &ctx.accounts.authority;
    let auction_house = &ctx.accounts.auction_house;
    let auction_house_fee_account = &ctx.accounts.auction_house_fee_account;
    let auction_house_treasury = &ctx.accounts.auction_house_treasury;
    let buyer_trade_state = &ctx.accounts.buyer_trade_state;
    let seller_trade_state = &ctx.accounts.seller_trade_state;

    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let ata_program = &ctx.accounts.ata_program;

    let last_bid_price = &mut ctx.accounts.last_bid_price;

    let rent = &ctx.accounts.rent;

    let asset_id = &ctx.accounts.asset_id;

    assert_valid_auction_house(ctx.program_id, &auction_house.key())?;

    // fix
    // assert_valid_last_bid_price(
    //     &last_bid_price.to_account_info(),
    //     ctx.program_id,
    //     &token_mint.key(),
    // )?;

    let escrow_clone = escrow_payment_account.to_account_info();
    let auction_house_clone = auction_house.to_account_info();
    let ata_clone = ata_program.to_account_info();
    let token_clone = token_program.to_account_info();
    let sys_clone = system_program.to_account_info();
    let rent_clone = rent.to_account_info();
    let treasury_clone = auction_house_treasury.to_account_info();
    let authority_clone = authority.to_account_info();

    let seller_trade_state_clone = seller_trade_state.to_account_info();
    let buyer_trade_state_clone = buyer_trade_state.to_account_info();

    let buyer_trade_state_data = buyer_trade_state_clone.data.borrow();
    let buyer_price = u64::from_le_bytes(buyer_trade_state_data[2..10].try_into().unwrap());

    let seller_trade_state_data = seller_trade_state_clone.data.borrow();
    let seller_price = u64::from_le_bytes(seller_trade_state_data[2..10].try_into().unwrap());

    let is_native = treasury_mint.key() == spl_token::native_mint::id();

    if buyer_price < seller_price {
        return Err(AuctionHouseError::MismatchedPrices.into());
    }

    if buyer_trade_state.data_is_empty() || seller_trade_state.data_is_empty() {
        return Err(AuctionHouseError::BothPartiesNeedToAgreeToSale.into());
    }

    if seller_trade_state_data[0] == 0 || buyer_trade_state_data[0] == 0 {
        return Err(AuctionHouseError::CanOnlyExecuteSaleOnce.into());
    }

    let seller_or_authority_signed = seller.is_signer || authority_clone.is_signer;

    let seller_sale_type = get_trade_state_sale_type(&seller_trade_state.to_account_info());
    let buyer_sale_type = get_trade_state_sale_type(&buyer_trade_state.to_account_info());
    msg!("seller_sale_type = {}", seller_sale_type);
    msg!("buyer_sale_type = {}", buyer_sale_type);

    // Make sure seller and buyer sale types match except if seller is
    // accepting offer
    if buyer_sale_type != TradeStateSaleType::Offer && seller_sale_type != buyer_sale_type {
        return Err(AuctionHouseError::SellerBuyerSaleTypeMustMatch.into());
    }

    if buyer_sale_type == TradeStateSaleType::Offer
        && (last_bid_price.price != 0 || last_bid_price.bidder != Some(ZERO_PUBKEY))
    {
        return Err(AuctionHouseError::CannotAcceptOfferWhileOnAuction.into());
    }

    match buyer_sale_type {
        TradeStateSaleType::Auction => {
            // Only let seller or auction house authority execute sale for auctions and offers
            if !seller_or_authority_signed {
                return Err(AuctionHouseError::SellerOrAuctionHouseMustSign.into());
            }

            // Make sure buyer_price is right
            if buyer_price != last_bid_price.price {
                return Err(AuctionHouseError::MismatchedPrices.into());
            }
        }
        TradeStateSaleType::Offer => {
            // Only let seller or auction house authority execute sale for auctions and offers
            if !seller_or_authority_signed {
                return Err(AuctionHouseError::SellerOrAuctionHouseMustSign.into());
            }
        }
        TradeStateSaleType::InstantSale => {
            // Allow buyer to sign and execute sale for instant sales
            if !authority_clone.is_signer && !buyer.is_signer {
                return Err(AuctionHouseError::BuyerOrAuctionHouseMustSign.into());
            }
        }
    }

    let nft_delegate = &ctx.accounts.nft_delegate;

    if nft_delegate.key() != authority.key() && !seller.is_signer {
        msg!("No delegate detected on nft.");
        return Err(AuctionHouseError::BothPartiesNeedToAgreeToSale.into());
    }

    let auction_house_key = auction_house.key();
    let seeds = [
        PREFIX.as_bytes(),
        auction_house_key.as_ref(),
        FEE_PAYER.as_bytes(),
        &[auction_house.fee_payer_bump],
    ];

    let wallet_to_use = if buyer.is_signer { buyer } else { seller };

    let (fee_payer, fee_payer_seeds) = get_fee_payer(
        authority,
        auction_house,
        wallet_to_use.to_account_info(),
        auction_house_fee_account.to_account_info(),
        &seeds,
    )?;

    let fee_payer_clone = fee_payer.to_account_info();

    let auction_house_key = auction_house.key();
    let wallet_key = buyer.key();
    let asset_id_key = asset_id.key();

    let escrow_signer_seeds = [
        PREFIX.as_bytes(),
        auction_house_key.as_ref(),
        wallet_key.as_ref(),
        asset_id_key.as_ref(),
        &[escrow_payment_bump],
    ];

    let ah_seeds = [
        PREFIX.as_bytes(),
        auction_house.creator.as_ref(),
        auction_house.treasury_mint.as_ref(),
        &[auction_house.bump],
    ];

    // with the native account, the escrow is it's own owner,
    // whereas with token, it is the auction house that is owner.
    let signer_seeds_for_royalties = if is_native {
        escrow_signer_seeds.to_vec()
    } else {
        ah_seeds.to_vec()
    };

    // remaining_accounts are metadata_creators
    let metadata = MetadataArgs::try_from_slice(leaf_data.leaf_metadata.as_slice())?;

    let buyer_leftover_after_royalties = pay_creator_fees_cnft(
        &mut ctx.remaining_accounts.iter(),
        &metadata,
        &escrow_clone,
        &auction_house_clone,
        &fee_payer_clone,
        treasury_mint,
        &ata_clone,
        &token_clone,
        &sys_clone,
        &rent_clone,
        &signer_seeds_for_royalties,
        &fee_payer_seeds,
        buyer_price,
        is_native,
    )?;

    let has_been_sold = get_has_been_sold_cnft(&metadata, Some(last_bid_price));

    let auction_house_fee_paid = pay_auction_house_fees(
        &auction_house,
        &treasury_clone,
        &escrow_clone,
        &token_clone,
        &sys_clone,
        &signer_seeds_for_royalties,
        buyer_price,
        is_native,
        has_been_sold,
    )?;

    let buyer_leftover_after_royalties_and_house_fee = buyer_leftover_after_royalties
        .checked_sub(auction_house_fee_paid)
        .ok_or(AuctionHouseError::NumericalOverflow)?;

    let should_split_primary =
        should_split_primary_sale_cnft(&metadata, &seller.key(), has_been_sold);

    if should_split_primary {
        if !is_native {
            split_primary_sale_between_creators_non_native_cnft(
                &mut ctx.remaining_accounts.iter(),
                &metadata,
                &escrow_clone,
                &auction_house_clone,
                &fee_payer_clone,
                treasury_mint,
                &ata_clone,
                &token_clone,
                &sys_clone,
                &rent_clone,
                &signer_seeds_for_royalties,
                &fee_payer_seeds,
                buyer_leftover_after_royalties_and_house_fee,
            )?;
        } else {
            split_primary_sale_between_creators_native_cnft(
                &mut ctx.remaining_accounts.iter(),
                &metadata,
                &escrow_clone,
                &sys_clone,
                &signer_seeds_for_royalties,
                buyer_leftover_after_royalties_and_house_fee,
            )?;
        }
    } else {
        if !is_native {
            if seller_payment_receipt_account.data_is_empty() {
                make_ata(
                    seller_payment_receipt_account.to_account_info(),
                    seller.to_account_info(),
                    treasury_mint.to_account_info(),
                    fee_payer.to_account_info(),
                    ata_program.to_account_info(),
                    token_program.to_account_info(),
                    system_program.to_account_info(),
                    rent.to_account_info(),
                    &fee_payer_seeds,
                )?;
            }

            let seller_rec_acct = assert_is_ata(
                &seller_payment_receipt_account.to_account_info(),
                &seller.key(),
                &treasury_mint.key(),
            )?;

            if seller_rec_acct.delegate.is_some() {
                // NOTE: this used to throw an error in the original
                // auction house code for supposed "rug" protection
                // but we think it's not necessary so we are logging
                // a warning instead
                msg!("WARNING: seller ATA has delegate");
            }

            invoke_signed(
                &spl_token::instruction::transfer(
                    token_program.key,
                    &escrow_payment_account.key(),
                    &seller_payment_receipt_account.key(),
                    &auction_house.key(),
                    &[],
                    buyer_leftover_after_royalties_and_house_fee,
                )?,
                &[
                    escrow_payment_account.to_account_info(),
                    seller_payment_receipt_account.to_account_info(),
                    token_program.to_account_info(),
                    auction_house.to_account_info(),
                ],
                &[&ah_seeds],
            )?;
        } else {
            assert_keys_equal(seller_payment_receipt_account.key(), seller.key())?;
            invoke_signed(
                &system_instruction::transfer(
                    &escrow_payment_account.key,
                    seller_payment_receipt_account.key,
                    buyer_leftover_after_royalties_and_house_fee,
                ),
                &[
                    escrow_payment_account.to_account_info(),
                    seller_payment_receipt_account.to_account_info(),
                    system_program.to_account_info(),
                ],
                &[&escrow_signer_seeds],
            )?;
        }
    }

    let curr_seller_lamp = seller_trade_state.lamports();
    **seller_trade_state.lamports.borrow_mut() = 0;
    seller_trade_state_clone.data.borrow_mut()[0] = 0;

    **fee_payer.lamports.borrow_mut() = fee_payer
        .lamports()
        .checked_add(curr_seller_lamp)
        .ok_or(AuctionHouseError::NumericalOverflow)?;

    let curr_buyer_lamp = buyer_trade_state.lamports();
    **buyer_trade_state.lamports.borrow_mut() = 0;
    buyer_trade_state_clone.data.borrow_mut()[0] = 0;

    **fee_payer.lamports.borrow_mut() = fee_payer
        .lamports()
        .checked_add(curr_buyer_lamp)
        .ok_or(AuctionHouseError::NumericalOverflow)?;

    last_bid_price.price = 0;
    last_bid_price.bidder = Some(ZERO_PUBKEY);
    last_bid_price.has_been_sold = 1;
    last_bid_price.tick_size_constant_in_lamports = 0;

    Ok(())
}
