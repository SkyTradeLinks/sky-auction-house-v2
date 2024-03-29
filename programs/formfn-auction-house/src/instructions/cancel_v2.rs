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
pub struct CancelV2<'info> {
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

pub fn handle_cancel_v2<'info>(
    ctx: Context<'_, '_, '_, 'info, CancelV2<'info>>,
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

    let ts_info = buyer_trade_state.to_account_info();
    let buyer_trade_state_data = &mut ts_info.data.borrow_mut();
    let buyer_sale_type = buyer_trade_state_data[1];

    //let sale_type = get_trade_state_sale_type(&buyer_trade_state.to_account_info());
    msg!("buyer_sale_type = {}", buyer_sale_type);
     //add checks for updating the bid.
     let initial_trade_state_price = u64::from_le_bytes(buyer_trade_state_data[2..10].try_into().unwrap());

     msg!("initial buyer trade state data  = {}",initial_trade_state_price.to_string().as_str());
     // keep current price
     let new_buyer_price:u64=0;
     buyer_trade_state_data[2..10].copy_from_slice(&new_buyer_price.to_le_bytes());

     let current_trade_state_price = u64::from_le_bytes(buyer_trade_state_data[2..10].try_into().unwrap());

     msg!("current buyer trade state data  = {}",current_trade_state_price.to_string().as_str());
     msg!("current price  = {}",buyer_price.to_string().as_str());


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





  
    // Execute various checks and other business logic based on the type of sale

        // Manually "deserialize" data here instead of relying on anchor since we
        // use `create_or_allocate_account_raw` to initialize these accounts using a
        // dynamic fee_payer (vs. Anchor where we need to specify fee_payer)
   
        // https://stackoverflow.com/a/28029667
        withdraw_helper(
            previous_bidder_wallet,//bidder wallet
            previous_bidder_refund_account,//bidder refund acc
            escrow_payment_account,//escrow acc
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
            previous_bidder_escrow_payment_bump,//escrow acc bump
            initial_trade_state_price,//price
            false,
        )?;
   
    Ok(())
}
