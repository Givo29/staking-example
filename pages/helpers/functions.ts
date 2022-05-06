import { programs } from "@metaplex/js";
import { BN, Wallet } from "@project-serum/anchor";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction , TransactionInstruction} from "@solana/web3.js";
import {
  findFarmerPDA,
  findWhitelistProofPDA,
  GemBankClient,
  GemFarmClient,
} from "@gemworks/gem-farm-ts"
import axios from "axios";

import { IDL as GemBank } from "@gemworks/gem-farm-ts/dist/types/gem_bank"
import { IDL as GemFarm } from "@gemworks/gem-farm-ts/dist/types/gem_farm"

const GEM_BANK_PROGRAM_ID = new PublicKey(
  "bankHHdqMuaaST4qQk6mkzxGeKPHWmqdgor6Gs8r88m"
);
const GEM_FARM_PROGRAM_ID = new PublicKey(
  "farmL4xeBFVXJqtfxCzU9b28QACM7E2W2ctT6epAjvE"
);
console.log("HAHA")
const creatorId = process.env.NEXT_PUBLIC_REACT_APP_CREATOR_ID;
const creatorIdFemale = process.env.NEXT_PUBLIC_REACT_APP_CREATOR_ID_FEMALE;
const farmId = new PublicKey(process.env.NEXT_PUBLIC_REACT_APP_FARM_ID);
const farmIdFemale = new PublicKey(process.env.NEXT_PUBLIC_REACT_APP_FARM_ID_FEMALE);

const {
  metadata: { Metadata },
} = programs;

// TODO This represents an array with the NFTs currently staked
// const currentStakedNFTs = [];
// TODO require the correct bank idl (explained in documentation)
const bankIdl = GemBank;
// TODO require the correct farm idl (explained in documentation)
const farmIdl = GemFarm;

export const initGemBank = (conn: Connection, wallet: SignerWalletAdapter) => {
  return new GemBankClient(
    conn,
    wallet as unknown as Wallet,
    bankIdl as any,
    GEM_BANK_PROGRAM_ID
  );
};

export const initGemFarm = (conn: Connection, wallet: SignerWalletAdapter) => {
  return new GemFarmClient(
    conn,
    wallet as unknown as Wallet,
    farmIdl as any,
    GEM_FARM_PROGRAM_ID,
    bankIdl as any,
    GEM_BANK_PROGRAM_ID
  );
};

export const stakeFemaleNft = async (
  connection,
  wallet,
  mint: PublicKey,
  source: PublicKey,
  creator: PublicKey,
  publicKey,
  sendTransaction
) => {
  const gf = await initGemFarm(
    connection,
    wallet!.adapter as SignerWalletAdapter
  );

  const gb = await initGemBank(
    connection,
    wallet!.adapter as SignerWalletAdapter
  );

  const txs = new Transaction();
  const farmer = await fetchFemaleFarmer(
    connection,
    wallet!.adapter as SignerWalletAdapter,
    publicKey!
  );

  const farm = await fetchFemaleFarm(
    connection,
    wallet!.adapter as SignerWalletAdapter
  );

  let farmerVault: PublicKey;
  if (farmer === null) {
    // Initializes the farmer if it doesn't exist
    const { txSig: txCreateFarmer, vault } = await gf!.initFarmer(
      farmIdFemale,
      publicKey!,
      publicKey!
    );
    // txs.add(txCreateFarmer);
    await connection.confirmTransaction(txCreateFarmer)
    farmerVault = vault;
  } else {
    farmerVault = farmer.farmerAcc.vault;
  }

  const [mintProof] = await findWhitelistProofPDA(farm.bank, mint);

  const [creatorProof] = await findWhitelistProofPDA(farm.bank, creator);

  const metadata = await programs.metadata.Metadata.getPDA(mint);

  if (publicKey) {
    if (farmer !== null && farmer.farmerState === "staked") {
      // const { tx: txDepositAndStake } = await gf!.flashDeposit(
      //   farmId,
      //   publicKey!,
      //   new BN(1),
      //   mint,
      //   source,
      //   mintProof,
      //   metadata,
      //   creatorProof
      // );

      // txs.add(txDepositAndStake);

      // There's two calls to unstake, the first "unstakes" it
      const { txSig: txUnstake } = await gf!.unstake(farmIdFemale, publicKey!);
      // Then, the second ends the cooldown period
      await connection.confirmTransaction(txUnstake)
      const { txSig: txCooldown } = await gf!.unstake(farmIdFemale, publicKey!);
      await connection.confirmTransaction(txCooldown)

      const { txSig: txDeposit } = await gb.depositGem(
        farm.bank,
        farmerVault,
        publicKey!,
        new BN(1),
        mint,
        source,
        mintProof,
        metadata,
        creatorProof
      );

      // txs.add(txDeposit);
      await connection.confirmTransaction(txDeposit)
      const { txSig: txStake } = await gf!.stake(farmIdFemale, publicKey!);
      // txs.add(txStake);
      await connection.confirmTransaction(txStake)
    } else {
      const { txSig: txDeposit } = await gb.depositGem(
        farm.bank,
        farmerVault,
        publicKey!,
        new BN(1),
        mint,
        source,
        mintProof,
        metadata,
        creatorProof
      );

      await connection.confirmTransaction(txDeposit)

      const { txSig: txStake } = await gf!.stake(farmIdFemale, publicKey!);
      await connection.confirmTransaction(txStake)
    }
  }

  try {
    let blockhashObj = await connection.getRecentBlockhash();
    console.log("GOT BLOCK")
    console.log(blockhashObj)
    txs.recentBlockhash = blockhashObj.blockhash;
    txs.feePayer = publicKey!;

    const txid = await sendTransaction(txs, connection);

    await connection.confirmTransaction(txid);
  } catch (e) {
    console.log(e);
  }
};

export const stakeNft = async (
  connection,
  wallet,
  mint: PublicKey,
  source: PublicKey,
  creator: PublicKey,
  publicKey,
  sendTransaction
) => {
  try {

    const gf = await initGemFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );

    const gb = await initGemBank(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );

    const txs = new Transaction();
    const farmer = await fetchFarmer(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      publicKey!
    );

    const farm = await fetchFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );

    let farmerVault: PublicKey;
    if (farmer === null) {
      // Initializes the farmer if it doesn't exist
      const { txSig: txCreateFarmer, vault } = await gf!.initFarmer(
        farmId,
        publicKey!,
        publicKey!
      );
      // txs.add(txCreateFarmer);
      await connection.confirmTransaction(txCreateFarmer)
      farmerVault = vault;
    } else {
      farmerVault = farmer.farmerAcc.vault;
    }

    const [mintProof] = await findWhitelistProofPDA(farm.bank, mint);

    const [creatorProof] = await findWhitelistProofPDA(farm.bank, creator);

    const metadata = await programs.metadata.Metadata.getPDA(mint);

    if (publicKey) {
      if (farmer !== null && farmer.farmerState === "staked") {
        // const { tx: txDepositAndStake } = await gf!.flashDeposit(
        //   farmId,
        //   publicKey!,
        //   new BN(1),
        //   mint,
        //   source,
        //   mintProof,
        //   metadata,
        //   creatorProof
        // );

        // txs.add(txDepositAndStake);

        // There's two calls to unstake, the first "unstakes" it
        const { txSig: txUnstake } = await gf!.unstake(farmId, publicKey!);
        // Then, the second ends the cooldown period
        await connection.confirmTransaction(txUnstake)
        const { txSig: txCooldown } = await gf!.unstake(farmId, publicKey!);
        await connection.confirmTransaction(txCooldown)
        // txs.add(txUnstake);
        // txs.add(txCooldown);

        const { txSig: txDeposit } = await gb.depositGem(
          farm.bank,
          farmerVault,
          publicKey!,
          new BN(1),
          mint,
          source,
          mintProof,
          metadata,
          creatorProof
        );
        await connection.confirmTransaction(txDeposit)
        // txs.add(txDeposit);


        const { txSig: txStake } = await gf!.stake(farmId, publicKey!);
        // txs.add(txStake);
        await connection.confirmTransaction(txStake)
      } else {
        const { txSig: txDeposit } = await gb.depositGem(
          farm.bank,
          farmerVault,
          publicKey!,
          new BN(1),
          mint,
          source,
          mintProof,
          metadata,
          creatorProof
        );
        console.log(txDeposit)
        // txs.add(txDeposit);
        await connection.confirmTransaction(txDeposit)

        const { txSig: txStake } = await gf!.stake(farmId, publicKey!);
        // txs.add(txStake);
        await connection.confirmTransaction(txStake)
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export const unstakeFemaleNft = async (
  connection: Connection,
  wallet: any,
  mint: PublicKey,
  publicKey: PublicKey,
  sendTransaction: any,
  currentStakedNFTs
) => {
  try {
    const gf = await initGemFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );
    const gb = await initGemBank(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );

    const farmAcc = await fetchFemaleFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );
    const { farmerAcc } = await fetchFemaleFarmer(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      publicKey
    );

    // There's two calls to unstake, the first "unstakes" it
    const { txSig: txUnstake } = await gf!.unstake(farmIdFemale, publicKey!);
    // Then, the second ends the cooldown period
    await connection.confirmTransaction(txUnstake);
    const { txSig: txCooldown } = await gf!.unstake(farmIdFemale, publicKey!);
    // Then and only then we can withdraw the gem
    await connection.confirmTransaction(txCooldown);
    const { txSig: txWithdraw } = await gb!.withdrawGem(
      farmAcc.bank,
      farmerAcc.vault,
      publicKey!,
      new BN(1),
      mint,
      publicKey!
    );
    await connection.confirmTransaction(txWithdraw);
    // const txs = new Transaction().add(txUnstake).add(txCooldown).add(txWithdraw);

    // Then, if there was more than this NFT staking, we need to restart
    // staking for the other ones
    if (currentStakedNFTs !== null && currentStakedNFTs.length > 1) {
      const { txSig } = await gf!.stake(farmIdFemale, publicKey!);
      // txs.add(txSig);
    }

    // let blockhashObj = await connection.getRecentBlockhash();
    // txs.recentBlockhash = blockhashObj.blockhash;
    // txs.feePayer = publicKey!;


    // const txid = await sendTransaction(txs, connection);
    // await connection.confirmTransaction(txid);
  } catch (e) {
    console.log(e);
  }
};

/**
 * Unstakes a NFT
 * @param farmId - the public key of the farm
 * @param mint   - the mint public key of the nft
 */
export const unstakeNft = async (
  connection: Connection,
  wallet: any,
  mint: PublicKey,
  publicKey: PublicKey,
  sendTransaction: any,
  currentStakedNFTs
) => {
  try {
    const gf = await initGemFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );
    const gb = await initGemBank(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );

    const farmAcc = await fetchFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );
    const { farmerAcc } = await fetchFarmer(
      connection,
      wallet!.adapter as SignerWalletAdapter,
      publicKey
    );

    // There's two calls to unstake, the first "unstakes" it
    const { txSig: txUnstake } = await gf!.unstake(farmId, publicKey!);
    // Then, the second ends the cooldown period
    await connection.confirmTransaction(txUnstake);
    const { txSig: txCooldown } = await gf!.unstake(farmId, publicKey!);
    // Then and only then we can withdraw the gem
    await connection.confirmTransaction(txCooldown);
    const { txSig: txWithdraw } = await gb!.withdrawGem(
      farmAcc.bank,
      farmerAcc.vault,
      publicKey!,
      new BN(1),
      mint,
      publicKey!
    );
    await connection.confirmTransaction(txWithdraw);

    // const txs = new Transaction().add(txUnstake).add(txCooldown).add(txWithdraw);

    // Then, if there was more than this NFT staking, we need to restart
    // staking for the other ones
    if (currentStakedNFTs !== null && currentStakedNFTs.length > 1) {
      const { txSig } = await gf!.stake(farmId, publicKey!);
      // txs.add(txSig);
      await connection.confirmTransaction(txSig);
    }

  // let blockhashObj = await connection.getRecentBlockhash();
  // txs.recentBlockhash = blockhashObj.blockhash;
  // txs.feePayer = publicKey!;


    // const txid = await sendTransaction(txs, connection);
    // await connection.confirmTransaction(txid);
  } catch (e) {
    console.log(e);
  }
};

export const claimNft = async (
  connection: Connection,
  wallet: any,
  publicKey: PublicKey,
  sendTransaction: any
) => {
  try {
    const gf = await initGemFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );

    const txs = new Transaction();

    const farmAcc = await fetchFarm(
      connection,
      wallet!.adapter as SignerWalletAdapter
    );
    if (farmAcc === null) {
      return;
    } else {
      const txClaim = await gf.claim(
        farmId,
        publicKey!,
        new PublicKey(farmAcc.rewardA.rewardMint!),
        new PublicKey(farmAcc.rewardB.rewardMint!)
      );
      console.log(txClaim)
      // await connection.confirmTransaction(txClaim)
      // txs.add(txClaim);
    }

    // let blockhashObj = await connection.getRecentBlockhash();
    // txs.recentBlockhash = blockhashObj.blockhash;
    // txs.feePayer = publicKey!;


    //   const txid = await sendTransaction(txs, connection);
      await connection.confirmTransaction(txid);
  } catch (e) {
    console.error(e);
  }
};

export const claimFemaleNft = async (
  connection: Connection,
  wallet: any,
  publicKey: PublicKey,
  sendTransaction: any
) => {
  const gf = await initGemFarm(
    connection,
    wallet!.adapter as SignerWalletAdapter
  );

  const txs = new Transaction();

  const farmFemaleAcc = await fetchFemaleFarm(
    connection,
    wallet!.adapter as SignerWalletAdapter
  );
  if (farmFemaleAcc === null) {
    return;
  } else {
    const txClaim = await gf.claim(
      farmIdFemale,
      publicKey!,
      new PublicKey(farmFemaleAcc.rewardA.rewardMint!),
      new PublicKey(farmFemaleAcc.rewardB.rewardMint!)
    );
    // txs.add(txClaim);
    // console.log(txClaim)
    await connection.confirmTransaction(txClaim)
  }

  let blockhashObj = await connection.getRecentBlockhash();
  txs.recentBlockhash = blockhashObj.blockhash;
  txs.feePayer = publicKey!;

  try {
    const txid = await sendTransaction(txs, connection);
    // await connection.confirmTransaction(txid);
  } catch (e) {
    console.error(e);
  }
};

export const fetchFarmer = async (
  connection: Connection,
  walletAdapter: SignerWalletAdapter,
  farmer: PublicKey
): Promise<any> => {
  const gf = await initGemFarm(connection, walletAdapter);

  const [farmerPDA] = await findFarmerPDA(farmId, farmer);

  try {
    const farmerIdentity = farmer.toBase58();
    const farmerAcc = await gf!.fetchFarmerAcc(farmerPDA);
    const farmerState = gf!.parseFarmerState(farmerAcc);

    return { farmerIdentity, farmerAcc, farmerState };
  } catch (e) {
    console.log({ e });
    return null;
  }
};

export const fetchFemaleFarmer = async (
  connection: Connection,
  walletAdapter: SignerWalletAdapter,
  farmer: PublicKey
): Promise<any> => {
  const gf = await initGemFarm(connection, walletAdapter);

  const [farmerPDA] = await findFarmerPDA(farmIdFemale, farmer);

  try {
    const farmerIdentity = farmer.toBase58();
    const farmerAcc = await gf!.fetchFarmerAcc(farmerPDA);
    const farmerState = gf!.parseFarmerState(farmerAcc);

    return { farmerIdentity, farmerAcc, farmerState };
  } catch (e) {
    console.log({ e });
    return null;
  }
};

export const fetchFemaleFarm = async (
  connection: Connection,
  walletAdapter: SignerWalletAdapter
): Promise<any> => {
  const gf = await initGemFarm(connection, walletAdapter);
  return await gf!.fetchFarmAcc(farmIdFemale);
};

export const fetchFarm = async (
  connection: Connection,
  walletAdapter: SignerWalletAdapter
): Promise<any> => {
  const gf = await initGemFarm(connection, walletAdapter);
  return await gf!.fetchFarmAcc(farmId);
};

export async function populateVaultNFTs(
  connection: Connection,
  walletAdapter: SignerWalletAdapter,
  publicKey: PublicKey
) {
  let currentVaultNFTs = [];

  let gb = await initGemBank(connection, walletAdapter);

  const farmerAcc = await fetchFarmer(connection, walletAdapter, publicKey);

  if (farmerAcc !== null) {
    const vault = farmerAcc.farmerAcc.vault;

    let foundGDRs = await gb.fetchAllGdrPDAs(vault);

    if (foundGDRs && foundGDRs.length) {
      let mints = foundGDRs.map((gdr) => {
        return { mint: gdr.account.gemMint };
      });
      currentVaultNFTs = await getNFTMetadataForMany(mints, connection);

      let collator = new Intl.Collator(undefined, { numeric: true });
      currentVaultNFTs.sort((a, b) =>
        collator.compare(a.externalMetadata.name, b.externalMetadata.name)
      );

      return currentVaultNFTs;
    }
  } else {
    return [];
  }
}

export async function populateFemaleVaultNFTs(
  connection: Connection,
  walletAdapter: SignerWalletAdapter,
  publicKey: PublicKey
) {
  let currentVaultNFTs = [];

  let gb = await initGemBank(connection, walletAdapter);

  const farmerAcc = await fetchFemaleFarmer(
    connection,
    walletAdapter,
    publicKey
  );

  if (farmerAcc !== null) {
    const vault = farmerAcc.farmerAcc.vault;

    let foundGDRs = await gb.fetchAllGdrPDAs(vault);

    if (foundGDRs && foundGDRs.length) {
      let mints = foundGDRs.map((gdr) => {
        return { mint: gdr.account.gemMint };
      });
      currentVaultNFTs = await getNFTMetadataForMany(mints, connection);

      let collator = new Intl.Collator(undefined, { numeric: true });
      currentVaultNFTs.sort((a, b) =>
        collator.compare(a.externalMetadata.name, b.externalMetadata.name)
      );

      return currentVaultNFTs;
    }
  } else {
    return [];
  }
}

export async function getNFTMetadataForMany(tokens, conn) {
  const promises = [];
  // let returnedNfts = []
  tokens.forEach((t) => promises.push(getNFTMetadata(t.mint, conn, t.pubkey)));
  const nfts = (await Promise.all(promises)).filter((n) => !!n);

  const filteredNfts = nfts?.filter((nft) => {
    if (
      (nft?.onchainMetadata?.data?.creators &&
        nft?.onchainMetadata?.data?.creators[0]?.verified &&
        nft?.onchainMetadata?.data?.creators[0]?.address === creatorId) ||
      (nft?.onchainMetadata?.data?.creators &&
        nft?.onchainMetadata?.data?.creators[0]?.verified &&
        nft?.onchainMetadata?.data?.creators[0]?.address === creatorIdFemale)
    ) {
      return nft;
    } else {
      return false;
    }
  });

  return filteredNfts;
}

async function getNFTMetadata(mint, conn, pubkey) {
  try {
    const metadataPDA = await Metadata.getPDA(mint);
    const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data;
    const externalMetadata = (await axios.get(onchainMetadata.data.uri)).data;
    return {
      pubkey: pubkey ? new PublicKey(pubkey) : undefined,
      mint: new PublicKey(mint),
      onchainMetadata,
      externalMetadata,
    };
  } catch (e) {
    // console.log(`failed to pull metadata for token ${mint}`);
  }
}

async function getTokensByOwner(conn, owner) {
  const walletNfts = await Metadata.findDataByOwner(conn, owner);
  console.log(walletNfts)
  const nfts = [];
  for (let nft of walletNfts)
    if (
      (nft?.data?.creators &&
        nft?.data?.creators[0]?.verified &&
        nft?.data?.creators[0]?.address === creatorId) ||
      (nft?.data?.creators &&
        nft?.data?.creators[0]?.verified &&
        nft?.data?.creators[0]?.address === creatorIdFemale)
    )
      nfts.push({
        mint: new PublicKey(nft.mint),
        data: nft.data,
        json: await fetch(nft.data.uri).then((e) => e.json()),
      });

  let collator = new Intl.Collator(undefined, { numeric: true });
  nfts.sort((a, b) => collator.compare(a.data.name, b.data.name));

  return nfts;
}

export async function getNFTsByOwner(conn, owner) {
  const tokens = await getTokensByOwner(conn, owner);

  return tokens;
}
