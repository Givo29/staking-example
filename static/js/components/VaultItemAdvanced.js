import React, {
    useEffect,
    useState
} from 'react'
import {
    PublicKey
} from "@solana/web3.js";
import styled from 'styled-components'
import dayjs from "dayjs";

const VaultItemAdvanced = ({
    nft,
    type,
    action,
    conn
}) => {
    const [dateStaked, setDateStaked] = useState(new Date())
    const [estEarn, setEstEarn] = useState(0)

    const image = nft ? .json ? nft ? .json ? .image : nft ? .externalMetadata ? .image
    const name = nft ? .json ? nft ? .json ? .name : nft ? .externalMetadata ? .name
    const whale = nft ? .onchainMetadata ? .data ? .creators[0] ? .address ===
        process.env.REACT_APP_CREATOR_ID ? "male" : "female"

    useEffect(() => {
        async function fetchTransactionDate() {
            try {
                if (type === 'staked') {
                    const sigs = await conn.getSignaturesForAddress(new PublicKey(nft ? .mint ? .toString()), {
                        limit: 1,
                    });

                    setDateStaked(dayjs.unix(sigs[0] ? .blockTime));
                }
            } catch (e) {
                console.log(e)
            }
        }
        fetchTransactionDate();
    }, [conn, nft ? .mint, type])

    useEffect(() => {
        async function fetchTransaction() {
            try {
                if (type === 'staked') {
                    if (whale === 'male') {
                        if (dateStaked) {
                            let diffInCoinsBase = 0
                            let diffInCoinsTier1 = 0
                            let diffInCoinsTier2 = 0

                            const earningsBase = 10;
                            const diffInSecBase = dayjs(new Date()).diff(dateStaked, 'seconds');
                            if (diffInSecBase > 604800) {
                                diffInCoinsBase = 604800 * (earningsBase / 86400);
                            } else {
                                diffInCoinsBase = diffInSecBase * (earningsBase / 86400);
                            }

                            // pre 5 mins calc 
                            if (dayjs(new Date()).diff(dateStaked, 'seconds') > 604800) {
                                const earningsTier1 = 11;
                                const diffInSecTier1 = dayjs(new Date()).subtract(1, 'week').diff(dateStaked, 'seconds');

                                if (diffInSecTier1 > 1209600) {
                                    diffInCoinsTier1 = 1209600 * (earningsTier1 / 86400);
                                } else {
                                    diffInCoinsTier1 = diffInSecTier1 * (earningsTier1 / 86400);
                                }
                            }

                            // pre 10 mins calc
                            if (dayjs(new Date()).diff(dateStaked, 'seconds') > 1209600) {
                                const earningsTier2 = 12;
                                const diffInSecTier2 = dayjs(new Date()).subtract(2, 'week').diff(dateStaked, 'seconds');
                                diffInCoinsTier2 = diffInSecTier2 * (earningsTier2 / 86400);
                            }

                            const diffInCoins = diffInCoinsBase + diffInCoinsTier1 + diffInCoinsTier2
                            setEstEarn(diffInCoins);
                        }
                    } else {
                        if (dateStaked) {
                            let diffInCoinsBase = 0
                            let diffInCoinsTier1 = 0
                            let diffInCoinsTier2 = 0

                            const earningsBase = 15;
                            const diffInSecBase = dayjs(new Date()).diff(dateStaked, 'seconds');
                            if (diffInSecBase > 604800) {
                                diffInCoinsBase = 604800 * (earningsBase / 86400);
                            } else {
                                diffInCoinsBase = diffInSecBase * (earningsBase / 86400);
                            }

                            // pre 5 mins calc 
                            if (dayjs(new Date()).diff(dateStaked, 'seconds') > 604800) {
                                const earningsTier1 = 16.5;
                                const diffInSecTier1 = dayjs(new Date()).subtract(1, 'week').diff(dateStaked, 'seconds');

                                if (diffInSecTier1 > 1209600) {
                                    diffInCoinsTier1 = 1209600 * (earningsTier1 / 86400);
                                } else {
                                    diffInCoinsTier1 = diffInSecTier1 * (earningsTier1 / 86400);
                                }
                            }

                            // pre 10 mins calc
                            if (dayjs(new Date()).diff(dateStaked, 'seconds') > 1209600) {
                                const earningsTier2 = 18;
                                const diffInSecTier2 = dayjs(new Date()).subtract(2, 'week').diff(dateStaked, 'seconds');
                                diffInCoinsTier2 = diffInSecTier2 * (earningsTier2 / 86400);
                            }

                            const diffInCoins = diffInCoinsBase + diffInCoinsTier1 + diffInCoinsTier2
                            setEstEarn(diffInCoins);
                        }
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }

        const interval = setInterval(() => fetchTransaction(), 1000);

        return () => {
            clearInterval(interval);
        };
    }, [conn, dateStaked, nft.mint, type, whale]);


    return ( <
        VaultItemContainer >
        <
        img src = {
            image
        }
        alt = {
            name
        }
        /> <
        VaultItemDetailsContainer >
        <
        div >
        <
        p style = {
            {
                fontFamily: `"Furore", sans-serif`,
                marginBottom: 4
            }
        } > {
            name
        } < /p> <
        p style = {
            {
                fontFamily: `"Furore", sans-serif`,
                fontSize: 12,
                fontWeight: 500
            }
        } > Total $KRILL Earned: {
            estEarn.toFixed(3)
        } < /p> <
        /div> <
        div > < button onClick = {
            () => action(nft)
        } > {
            type === 'staked' ? 'Unstake' : 'Stake'
        } < /button></div >
        <
        /VaultItemDetailsContainer> <
        /VaultItemContainer>
    )
}

export default VaultItemAdvanced

const VaultItemContainer = styled.div `
  background: #fff;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
  display: flex;
  flex-direction: column;
  max-width: 270px;
  overflow: hidden;

  img {
    height: 270px; 
  }
`

const VaultItemDetailsContainer = styled.div `
display: flex;
flex-direction: column;
  height: 137px;
justify-content: space-between;
padding: 12px;

  p {
    color: #222;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    margin: 0;
    margin-bottom: 4px;
  }

  button {
    background: #0a255b;
    border: 0;
    border-radius: 4px;
    box-shadow: none;
    color: #fff;
    justify-content: center;
    margin-top: 8px;
    width: 100%;

    &:hover {
      background: #020b1c;
    }
  }
`