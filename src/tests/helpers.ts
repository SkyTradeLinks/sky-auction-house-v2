// it("should mint land token for testing", async () => {
//   let collectionMint = publicKey(
//     "DQikrsLze2cUEdgqTM9vngcJZwMdD12sfwYZeGor5cva"
//   );
//   for (let i = 1; i <= 1; i++) {
//     // Your loop body here
//     const tester = new anchor.web3.PublicKey(
//       "31CrX4MeibEHjrZpCz341HxqcMRdyaYTtTL9iSxHF2Kn"
//     );
//     const assetOwner = owner.publicKey;

//     let sx = await mintV1(umi, {
//       leafOwner: fromWeb3JsPublicKey(assetOwner),
//       merkleTree: publicKey(landTree),
//       metadata: {
//         name: "My Compressed NFT",
//         uri: "https://example.com/my-cnft.json",
//         sellerFeeBasisPoints: 500, // 5%
//         collection: { key: collectionMint, verified: false },
//         creators: [
//           { address: umi.identity.publicKey, verified: false, share: 100 },
//         ],
//       },
//     }).sendAndConfirm(umi);
//     console.log("Land Mint Successfull!!");

//     let mintTxInfo = await validateTx(umi, sx.signature);
//     // [leafIndex] = findLeafIndexFromAnchorTx(mintTxInfo);
//   }
// });

// it("should mint rental token for testing", async () => {
//   let collectionMint = publicKey(
//     "GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh"
//   );
//   for (let i = 1; i <= 1; i++) {
//     // Your loop body here
//     // const tester = new anchor.web3.PublicKey(
//     //   "31CrX4MeibEHjrZpCz341HxqcMRdyaYTtTL9iSxHF2Kn"
//     // );
//     const assetOwner = owner.publicKey;
//     console.log("Owner", assetOwner);

//     let sx = await mintV1(umi, {
//       leafOwner: fromWeb3JsPublicKey(assetOwner),
//       merkleTree: publicKey(merkleTree),
//       metadata: {
//         name: "My Compressed NFT",
//         uri: "https://example.com/my-cnft.json",
//         sellerFeeBasisPoints: 500, // 5%
//         collection: { key: collectionMint, verified: false },
//         creators: [
//           { address: umi.identity.publicKey, verified: false, share: 100 },
//         ],
//       },
//     }).sendAndConfirm(umi);
//     console.log("Rental Mint Successfull!!");

//     let mintTxInfo = await validateTx(umi, sx.signature);
//     [leafIndex] = await findLeafIndexFromAnchorTx(mintTxInfo);
//     console.log("leaf_Index:", leafIndex);
//     // let [assetId] = await findLeafAssetIdPda(umi, {
//     //   merkleTree: publicKey(merkleTree),
//     //   leafIndex,
//     // });
//     // console.log("Asset_Id:", assetId);
//   }
// });
// it("Execute an Auction sale to the successful bidder", async () => {
//   console.log("Asset_Id....1:", asset_id);
//   console.log("Place a bid...");
//   console.log("Leaf---Index", leafIndex);
//   // let bidder_acc_balanceB4 = await provider.connection.getTokenAccountBalance(
//   //   bidderAta.address
//   // );
//   let bidderAccountInfo = await getAccount(
//     provider.connection,
//     bidderAta.address
//   );

//   // let initialAmtBidder = bidder_acc_balanceB4.value.uiAmount;
//   console.log("Bidder usdc before sale:", bidderAccountInfo.amount);
//   let ownerAccountInfo = await getAccount(
//     provider.connection,
//     ownerAta.address
//   );
//   // let owner_acc_balanceB4 = await provider.connection.getTokenAccountBalance(
//   //   ownerAta.address
//   // );

//   // let initialAmtOwner = owner_acc_balanceB4.value.uiAmount;
//   console.log("owner usdc before sale:", ownerAccountInfo.amount);

//   let rpcAsset = await umi.rpc.getAsset(publicKey(asset_id));
//   console.log("Asset Owner before sale", rpcAsset.ownership.owner);
//   // let feeAccountAta = await getAssociatedTokenAddressSync(
//   //   auctionHouseSdk.mintAccount,
//   //   auctionHouseSdk.feeAccount
//   // );
//   // let feeAccountAta_Info = await getAccount(
//   //   provider.connection,
//   //   auctionHouseSdk.feeAccount
//   // );
//   // const balanceAfter = feeAccountAta_Info.amount;
//   // console.log("fee usdc balance before sale", +balanceAfter.toString());
//   try {
//     const Bidtx = await auctionHouseSdk.buy(
//       bidder.publicKey,
//       new anchor.web3.PublicKey(asset_id),
//       new anchor.web3.PublicKey(merkleTree),
//       1,
//       leafIndex,
//       SaleType.Auction
//     );
//     // const transaction = new Transaction().add(Bidtx);
//     Bidtx.sign([bidder]);
//     let BidtxSig = await auctionHouseSdk.sendTx(Bidtx);
//     // const BidtxSig = await sendAndConfirmTransaction(
//     //   provider.connection,
//     //   transaction,
//     //   [bidder]
//     // );
//     console.log("Bid TRANSACTION", BidtxSig);
//     let ix;

//     // const executeSaleIx = await auctionHouseSdk.sendTx(ix);
//     // console.log("TRANSACTION:", ix);
//     // await sendAndConfirmTransaction(provider.connection, ix, [owner]);
//     try {
//       // create execute Sale Instruction
//       ix = await auctionHouseSdk.createExecuteSaleIx(
//         bidder.publicKey,
//         new anchor.web3.PublicKey(asset_id),
//         merkleTree,
//         owner.publicKey,
//         auctionHouseAuthority.publicKey
//       );
//       ix.sign([auctionHouseAuthority]);
//       //   const executeSaleTx = await sendAndConfirmTransaction(
//       //     provider.connection,
//       //     ix,
//       //     [auctionHouseAuthority]
//       //   );

//       console.log(" Execute sale submitted successfully");
//     } catch (error) {
//       console.log("Execute sale error", error);
//     }
//     try {
//       const tx = await auctionHouseSdk.sendExecuteSaleTx(
//         ix,
//         new anchor.web3.PublicKey(asset_id),
//         bidder.publicKey
//       );
//       console.log("Execute sale successful...:", tx);
//       await sleep(10000);
//       rpcAsset = await umi.rpc.getAsset(publicKey(asset_id));
//       console.log("Asset Owner after sale", rpcAsset.ownership.owner);
//       const rpcAssetList = await umi.rpc.getAssetsByOwner({
//         owner: publicKey("GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh"),
//       });
//       console.log("Bidder RPC ASSET LIST:", rpcAssetList);
//       // let feeAccountAtaInfo = await getAccount(
//       //   provider.connection,
//       //   auctionHouseSdk.feeAccount
//       // );
//       // const balanceAfter = feeAccountAtaInfo.amount;
//       // console.log("fee usdc balance after sale", +balanceAfter.toString());
//       // let bidder_acc_balanceAfter =
//       //   await provider.connection.getTokenAccountBalance(bidderAta.address);
//       let bidderAccountInfo = await getAccount(
//         provider.connection,
//         bidderAta.address
//       );
//       // let bidder_amt_after = bidder_acc_balanceAfter.value.uiAmount;

//       console.log("Bidder usdc after sale:", bidderAccountInfo.amount);

//       // let owner_acc_balanceafter =
//       //   await provider.connection.getTokenAccountBalance(ownerAta.address);

//       let ownerAccountInfo = await getAccount(
//         provider.connection,
//         ownerAta.address
//       );
//       // let ownerAmtAfter = owner_acc_balanceafter.value.uiAmount;
//       console.log("owner usdc after sale:", ownerAccountInfo.amount);
//     } catch (error) {
//       console.log("Failed to execute sale", error);
//     }
//     // const tx = await auctionHouseSdk.sendTx(ix);
//     // const tx = await provider.connection.simulateTransaction(ix);
//   } catch (error) {
//     console.log("Erroe ....123", error);
//   }
// });

// it("should make an offer on un-listed asset", async () => {
//   let [assetId] = findLeafAssetIdPda(umi, {
//     merkleTree: publicKey(merkleTree),
//     leafIndex,
//   });
//   asset_id = assetId;
//   console.log("Asset_Id:", assetId);

//   let acc_balance = await provider.connection.getTokenAccountBalance(
//     bidderAta.address
//   );

//   let initialAmt = acc_balance.value.uiAmount;
//   console.log("Bidder initial amount:", initialAmt);

//   // USD
//   let cost = 5;
//   const tx = await auctionHouseSdk.buy(
//     bidder.publicKey,
//     toWeb3JsPublicKey(assetId),
//     merkleTree,
//     cost,
//     leafIndex,
//     SaleType.Offer
//   );
//   tx.sign([bidder]);
//   // console.log("TRANSACTION:", tx);

//   // let signature = await auctionHouseSdk.sendTx(tx);

//   // await validateTx(umi, decode(signature));
//   let acc_balance_after = await provider.connection.getTokenAccountBalance(
//     bidderAta.address
//   );

//   console.log(
//     "Bidder usdc balance after bidding:",
//     acc_balance_after.value.uiAmount
//   );

//   // assert.equal(
//   //   initialAmt - 1,
//   //   (await provider.connection.getTokenAccountBalance(bidderAta.address))
//   //     .value.uiAmount
//   // );
// });

// it("should accept and transfer the nft", async () => {
//   console.log("Asset_Id....1:", asset_id);
//   // create execute Sale Instruction
//   const ix = await auctionHouseSdk.createExecuteSaleIx(
//     bidder.publicKey,
//     new anchor.web3.PublicKey(asset_id),
//     merkleTree,
//     owner.publicKey,
//     owner.publicKey
//   );
//   ix.sign([owner]);
//   // console.log("TRANSACTION:", ix);

//   const tx = await auctionHouseSdk.sendExecuteSaleTx(
//     ix,
//     toWeb3JsPublicKey(asset_id),
//     owner.publicKey
//   );

//   console.log("Execute sale successful:", tx);
// });
// it("should make an offer on un-listed asset", async () => {
//   let [assetId] = findLeafAssetIdPda(umi, {
//     merkleTree: publicKey(merkleTree),
//     leafIndex,
//   });
//   asset_id = assetId;
//   console.log("Asset_Id:", assetId);

//   let acc_balance = await provider.connection.getTokenAccountBalance(
//     bidderAta.address
//   );

//   let initialAmt = acc_balance.value.uiAmount;
//   console.log("Bidder initial amount:", initialAmt);

//   // USD
//   let cost = 5;
//   const tx = await auctionHouseSdk.buy(
//     bidder.publicKey,
//     toWeb3JsPublicKey(assetId),
//     merkleTree,
//     cost,
//     leafIndex,
//     SaleType.Offer
//   );
//   tx.sign([bidder]);
//   // console.log("TRANSACTION:", tx);

//   // let signature = await auctionHouseSdk.sendTx(tx);

//   // await validateTx(umi, decode(signature));
//   let acc_balance_after = await provider.connection.getTokenAccountBalance(
//     bidderAta.address
//   );

//   console.log(
//     "Bidder usdc balance after bidding:",
//     acc_balance_after.value.uiAmount
//   );

//   // assert.equal(
//   //   initialAmt - 1,
//   //   (await provider.connection.getTokenAccountBalance(bidderAta.address))
//   //     .value.uiAmount
//   // );
// });

// it("should accept and transfer the nft", async () => {
//   console.log("Asset_Id....1:", asset_id);
//   // create execute Sale Instruction
//   const ix = await auctionHouseSdk.createExecuteSaleIx(
//     bidder.publicKey,
//     new anchor.web3.PublicKey(asset_id),
//     merkleTree,
//     owner.publicKey,
//     owner.publicKey
//   );
//   ix.sign([owner]);
//   // console.log("TRANSACTION:", ix);

//   const tx = await auctionHouseSdk.sendExecuteSaleTx(
//     ix,
//     toWeb3JsPublicKey(asset_id),
//     owner.publicKey
//   );

//   console.log("Execute sale successful:", tx);
// });
// let feeAccountAtaInfo = await getAccount(
//   provider.connection,
//   auctionHouseSdk.feeAccount
// );
// const balanceAfter = feeAccountAtaInfo.amount;
// console.log("fee usdc balance after sale", +balanceAfter.toString());
// let bidder_acc_balanceAfter =
//   await provider.connection.getTokenAccountBalance(bidderAta.address);
// const builder = await createTree(umi, {
//   merkleTree: landTree,
//   maxDepth: 14,
//   maxBufferSize: 64,
// });

// const tx = await builder.sendAndConfirm(umi);
