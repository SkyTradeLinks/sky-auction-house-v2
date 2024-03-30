use anchor_lang::prelude::*;
use anchor_spl::{token::{Mint, Token}, associated_token::AssociatedToken};
use crate::{
   AuctionHouse, LastBidPrice, constants::*,  utils::*,
};

#[derive(Accounts)]
#[instruction(trade_state_bump: u8, escrow_payment_bump: u8, leaf_index: u64)]
pub struct CancelOffer<'info> {
    /// CHECK: No need to deserialize.
    #[account(mut)]
    wallet: UncheckedAccount<'info>,

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

    rent: Sysvar<'info, Rent>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
    ata_program: Program<'info, AssociatedToken>,

}


pub fn handle_cancel_offer<'info>(ctx: Context<'_, '_, '_, 'info, CancelOffer<'info>>, _trade_state_bump: u8, escrow_payment_bump:u8, leaf_index: u64) -> Result<()>{
    let wallet = &ctx.accounts.wallet;

    let payment_account = &ctx.accounts.payment_account;

    let escrow_payment_account = &ctx.accounts.escrow_payment_account;

    let authority = &ctx.accounts.authority;

    let treasury_mint = &ctx.accounts.treasury_mint;
    
    let asset_id = &ctx.accounts.asset_id;

    let merkle_tree = &ctx.accounts.merkle_tree;

    let auction_house = &ctx.accounts.auction_house;

    let buyer_trade_state = &mut ctx.accounts.buyer_trade_state;

    let auction_house_fee_account = &ctx.accounts.auction_house_fee_account;

    let token_program = &ctx.accounts.token_program;

    let system_program = &ctx.accounts.system_program;

    let ata_program = &ctx.accounts.ata_program;

    let rent = &ctx.accounts.rent;
    
    assert_valid_auction_house(ctx.program_id, &auction_house.key())?;

    assert_valid_nft(&asset_id.key(), &merkle_tree.key(), leaf_index)?;


    let ts_info = buyer_trade_state.to_account_info();
    let buyer_trade_state_data = &mut ts_info.data.borrow_mut();

    let initial_trade_state_price = u64::from_le_bytes(buyer_trade_state_data[2..10].try_into().unwrap());


    withdraw_helper(
        wallet,
        payment_account,
        escrow_payment_account,
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
        escrow_payment_bump,
        initial_trade_state_price,
        false,
    )?;

    // set to 0 after offer has been cancelled

    buyer_trade_state_data[2..10].copy_from_slice(&0u64.to_le_bytes());

    Ok(())

}