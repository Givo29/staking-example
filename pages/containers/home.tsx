import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import {
  claimFemaleNft,
  claimNft,
  fetchFarm,
  fetchFemaleFarm,
  // fetchFarmer,
  getNFTsByOwner,
  populateFemaleVaultNFTs,
  populateVaultNFTs,
  stakeFemaleNft,
  stakeNft,
  unstakeFemaleNft,
  unstakeNft,
} from "../helpers/functions";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import styled from "styled-components";
import Loader from "react-loader-spinner";
// import 'react-loading-spinkit/dist/react-datepicker.css'
// import Loading from "react-loading-spinkit";
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
// import VaultItem from "components/VaultItem";
import HodlIntro from "../components/HodlIntro";
import VaultItemAdvanced from "../components/VaultItemAdvanced";
// import dayjs from "dayjs";

import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// import Krill from "../images/krill.png";

const Home = ({ loading, setLoading }) => {
  const { connection } = useConnection();
  const { wallet, publicKey, sendTransaction } = useWallet();

  const [farm, setFarm] = useState(null);
  const [femaleFarm, setFemaleFarm] = useState(null);
  // const [farmer, setFarmer] = useState(null);

  const [stakedNfts, setStakedNfts] = useState(null);
  const [stakedMaleNfts, setStakedMaleNfts] = useState(null);
  const [stakedFemaleNfts, setStakedFemaleNfts] = useState(null);
  const [unstakedNfts, setUnstakedNfts] = useState(null);
  // const [lastUpdatedTs, setLastUpdatedTs] = useState(null);
  // const [rewardValue, setRewardValue] = useState(0);

  // reset farmer on wallet change
  // useEffect(() => {
  //   if (wallet && !publicKey) {
  //     setFarmer(null);
  //   }
  // }, [publicKey, wallet]);

  useEffect(() => {
    async function fetchFarmFunc() {
      // grab farm on load
      const farm = await fetchFarm(connection, null);
      setFarm(farm);

      const femaleFarm = await fetchFemaleFarm(connection, null);
      setFemaleFarm(femaleFarm);

      // if (publicKey!) {
      //   // if wallet is connected grab farmer on load
      //   const farmer = await fetchFarmer(
      //     connection,
      //     wallet.adapter as SignerWalletAdapter,
      //     publicKey
      //   );
      //   setFarmer(farmer);
      // }
    }

    fetchFarmFunc();
  }, [connection, publicKey, wallet]);

  useEffect(() => {
    if (publicKey!) {
      refreshAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  async function refreshAll() {
    await getUnstakedNfts();
    await getStakedNfts();
    setLoading(false);
  }

  async function getStakedNfts() {
    let nfts = [];
    const vaultNfts = await populateVaultNFTs(
      connection,
      wallet.adapter as SignerWalletAdapter,
      publicKey
    );
    if (vaultNfts?.length > 0) {
      nfts = vaultNfts;
    }
    setStakedMaleNfts(vaultNfts);
    setStakedNfts(nfts);

    const femaleVaultNfts = await populateFemaleVaultNFTs(
      connection,
      wallet.adapter as SignerWalletAdapter,
      publicKey
    );
    if (femaleVaultNfts?.length > 0) {
      nfts = femaleVaultNfts;
    }
    setStakedFemaleNfts(femaleVaultNfts);
    setStakedNfts(nfts);

    if (vaultNfts?.length > 0 && femaleVaultNfts?.length > 0) {
      nfts = vaultNfts.concat(femaleVaultNfts);
    }
    setStakedNfts(nfts);
  }

  async function getUnstakedNfts() {
    const walletNfts = await getNFTsByOwner(connection, publicKey);
    setUnstakedNfts(walletNfts);
  }

  const claimAction = async () => {
    setLoading(true);
    await claimNft(connection, wallet, publicKey, sendTransaction);
    await refreshAll();
    setLoading(false);
  };

  const claimFemaleAction = async () => {
    setLoading(true);
    await claimFemaleNft(connection, wallet, publicKey, sendTransaction);
    await refreshAll();
    setLoading(false);
  };

  const stakeAction = async (nft) => {
    setLoading(true);
    const creator = new PublicKey(nft.data.creators[0].address);

    const associatedAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nft.mint,
      publicKey
    );

    if (
      nft.data.creators[0].address ===
      process.env.NEXT_PUBLIC_REACT_APP_CREATOR_ID
    ) {
      await stakeNft(
        connection,
        wallet,
        nft.mint,
        associatedAddress,
        creator,
        publicKey,
        sendTransaction
      );
    } else {
      await stakeFemaleNft(
        connection,
        wallet,
        nft.mint,
        associatedAddress,
        creator,
        publicKey,
        sendTransaction
      );
    }

    await refreshAll();
    refreshAll();
  };

  const unstakeAction = async (nft) => {
    setLoading(true);

    if (
      nft.onchainMetadata.data.creators[0].address ===
      process.env.NEXT_PUBLIC_REACT_APP_CREATOR_ID
    ) {
      await unstakeNft(
        connection,
        wallet,
        nft.mint,
        publicKey,
        sendTransaction,
        stakedMaleNfts
      );
    } else {
      await unstakeFemaleNft(
        connection,
        wallet,
        nft.mint,
        publicKey,
        sendTransaction,
        stakedFemaleNfts
      );
    }

    await refreshAll();
    refreshAll();
  };

  // staked percentage
  const percCalc = (farm?.gemsStaked?.toString() / 3000) * 100;
  const perc = percCalc.toFixed(2);

  // staked percentage
  const percFemaleCalc = (femaleFarm?.gemsStaked?.toString() / 1500) * 100;
  const percFemale = percFemaleCalc.toFixed(2);

  // useEffect(() => {
  //   if (farmer) {
  //     const interval = setInterval(() => getEstReward(), 1000);

  //     return () => {
  //       clearInterval(interval);
  //     };
  //   }
  // });

  // const getEstReward = () => {
  //   // last time farmer refreshed - timestamp
  //   setLastUpdatedTs(
  //     dayjs(
  //       new Date(
  //         farmer.farmerAcc.rewardA.fixedRate.lastUpdatedTs.toNumber() * 1000
  //       )
  //     )
  //   );

  //   // earning per day
  //   const now = dayjs();
  //   const diffInSec = now.diff(lastUpdatedTs, "seconds");

  //   // without decimal
  //   const earningsPerDay = 10;
  //   const diffInCoins = diffInSec * (earningsPerDay / 86400);
  //   const rewards =
  //     (farmer?.farmerAcc.rewardA.accruedReward.toNumber() -
  //       farmer?.farmerAcc.rewardA.paidOutReward.toNumber()) /
  //       Math.pow(10, 10) +
  //       diffInCoins ?? 0;
  //   // setRewardValue(rewards * Number(stakedNfts?.length));
  // };

  if (!publicKey) {
    return (
      <PageWrapper>
        <PageContainer>
          <IntroContainer>
            <HodlIntro
              staked={farm?.gemsStaked?.toString() ?? 0}
              stakedFemale={femaleFarm?.gemsStaked?.toString() ?? 0}
              perc={Number(perc)}
              percFemale={Number(percFemale)}
            />
            <WalletMultiButton
              children={"Connect"}
              style={{
                color: "#000",
                padding: "0 58px",
                height: 64,
              }}
              className="connect-button"
            />
          </IntroContainer>
        </PageContainer>
      </PageWrapper>
    );
  } else {
    return (
      <>
        {loading && (
          <div
            style={{
              background: "rgba(2,11,28,0.75)",
              height: "100vh",
              position: "fixed",
              width: "100vw",
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              zIndex: 10,
              textAlign: "center",
            }}
          >
            <img
              src={"spinner.gif"}
              style={{ marginTop: "25%", height: "150px" }}
            />
          </div>
        )}
        <PageWrapper>
          <PageContainer>
            <IntroContainer>
              <HodlIntro
                staked={farm?.gemsStaked?.toString() ?? 0}
                stakedFemale={femaleFarm?.gemsStaked?.toString() ?? 0}
                perc={Number(perc)}
                percFemale={Number(percFemale)}
              />
            </IntroContainer>
            {/* <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <ClaimableKrill>
                <img src={Krill} alt={"Krill"} /> Est. Claimable Krill:{" "}
                {rewardValue?.toFixed(2)}
              </ClaimableKrill>
            </div> */}
            <StakingButtonsContainer>
              {
                <button
                  onClick={() => claimAction()}
                  // disabled={!farmer}
                  style={{
                    color: "#000",
                    padding: "0 58px",
                    height: 64,
                    border: 0,
                  }}
                  className="connect-button"
                >
                  Claim Male
                </button>
              }
              {
                <button
                  onClick={() => claimFemaleAction()}
                  // disabled={!farmer}
                  style={{
                    background: "red",
                    color: "#000",
                    padding: "0 58px",
                    height: 64,
                    border: 0,
                  }}
                  className="connect-button"
                >
                  Claim Female
                </button>
              }
            </StakingButtonsContainer>
            <VaultsContainer>
              {stakedNfts?.length > 0 && (
                <VaultWrapper>
                  <h2>Your Staked Whales</h2>
                  <VaultContainer>
                    {stakedNfts?.map((nft) => (
                      <VaultItemAdvanced
                        conn={connection}
                        key={nft?.mint?.toString()}
                        nft={nft}
                        type={"staked"}
                        action={() => unstakeAction(nft)}
                      />
                    ))}
                  </VaultContainer>
                </VaultWrapper>
              )}
              {unstakedNfts?.length > 0 && (
                <VaultWrapper>
                  <h2>Your Unstaked Whales</h2>
                  <VaultContainer>
                    {unstakedNfts?.map((nft) => (
                      <VaultItemAdvanced
                        conn={connection}
                        key={nft?.mint?.toString()}
                        nft={nft}
                        type={"unstaked"}
                        action={() => stakeAction(nft)}
                      />
                    ))}
                  </VaultContainer>
                </VaultWrapper>
              )}
            </VaultsContainer>
          </PageContainer>
        </PageWrapper>
      </>
    );
  }
};

export default Home;

const PageWrapper = styled.div`
  margin-bottom: auto;
  position: relative;
  z-index: 1;
`;

const PageContainer = styled.div`
  padding: 40px;

  @media only screen and (max-width: 768px) {
    padding: 20px;
  }
`;

const IntroContainer = styled.div`
  text-align: center;
  width: 100%;

  button {
    display: inline-flex;
  }
`;

const VaultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* flex-flow: row wrap; */
  /* min-height: 1000px; */
  /* justify-content: center; */
  /* margin: 0 auto; */

  @media only screen and (min-width: 768px) {
    /* display: grid; */
    /* grid-gap: 8px; */
    /* grid-template-columns: repeat(2, 1fr); */
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const VaultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  @media only screen and (max-width: 768px) {
    &:first-child {
      order: 1;
    }

    &:last-child {
      order: 0;
    }
  }
`;

// const ClaimableKrill = styled.div`
//   align-items: center;
//   border: 4px solid #fcff00;
//   display: inline-flex;
//   justify-content: center;
//   justify-self: center;
//   font-family: "Furore", sans-serif;
//   font-size: 20px;
//   margin: 0 auto;
//   /* max-width: 400px; */
//   padding: 10px 12px;

//   img {
//     height: 40px;
//     margin-right: 12px;
//   }
// `;

const VaultContainer = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(1, 270px);
  margin-bottom: 40px;
  justify-content: center;

  @media only screen and (min-width: 768px) {
    grid-template-columns: repeat(2, 270px);
  }

  @media only screen and (min-width: 1024px) {
    grid-template-columns: repeat(3, 270px);
  }

  @media only screen and (min-width: 1200px) {
    grid-template-columns: repeat(4, 270px);
  }
  /* flex-direction: column; */
`;

const StakingButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 40px auto;

  button {
    margin-left: 8px;
    margin-right: 8px;

    @media only screen and (max-width: 768px) {
      font-size: 14px;
    }
  }
`;
