import {
    WalletAdapterNetwork
} from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import {
    WalletModalProvider
} from "@solana/wallet-adapter-react-ui";
import {
    GlowWalletAdapter,
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
// console.log(getPhantomWallet)
import React, {
    useCallback,
    useMemo,
    useState
} from "react";
import toast, {
    Toaster
} from "react-hot-toast";
import Home from "./containers/home";
import styled from "styled-components";
import Container from 'react-bootstrap/Container'

var Logo = 'logo.png'
var Background = "footer-background.png"
import Discord from './images/discord.png'
import Twitter from './images/twitter.png'
import Instagram from './images/ig.png'

import Coming from './images/soon.png'
// import DropdownBG from './images/dropdown-bg.png'

const App = () => {
    const [loading, setLoading] = useState(false)
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint
    const endpoint = process.env.NEXT_PUBLIC_REACT_APP_RPC_ID

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({
                network
            }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({
                network
            }),
            new SolletExtensionWalletAdapter({
                network
            }),
        ], [network]
    );

    const onError = useCallback(
        (error) => {
            toast.error(
                error.message ? `${error.name}: ${error.message}` : error.name, {
                    duration: 3000
                }
            );
            setLoading(false);
        }, []
    );
    console.log('hj')
    return ( <
        ConnectionProvider endpoint ={endpoint} >
        <
        WalletProvider wallets = {
            wallets
        }
        onError = {
            onError
        }
        autoConnect >
        <
        WalletModalProvider >
        <
        HeaderWrapper >
        <
        Container >
        <
        HeaderContainer >
        <
        div >
        <
        img src = {
            Logo
        }
        alt = {
            "Solano HODL Whales"
        }
        /> <
        /div> <
        div >
        <
        ul >
        <
        li >
        <
        a href = "https://solanahodlwhales.io/" > Home < /a> <
        /li> <
        li >
        <
        a href = "https://stake.solanahodlwhales.io/" > Stake < /a> <
        /li> <
        li >
        <
        a href = "https://solanahodlwhales.io/story" > Story < /a> <
        /li> <
        li >
        <
        a href = "https://solanahodlwhales.gitbook.io/whitepaper/"
        target = "_blank"
        rel = "noreferrer" > Whitepaper < /a> <
        /li> <
        li >
        <
        a href = "https://solanahodlwhales.io/traits" > Traits < /a> <
        /li> <
        li >
        <
        img src = {
            Coming
        }
        alt = "Coming Soon" / >
        <
        span className = "disabled" > Breed < /span> <
        /li> <
        /ul> <
        /div> <
        div / >
        <
        /HeaderContainer> <
        /Container> <
        /HeaderWrapper> <
        div className = "background-container" >
        <
        Home loading = {
            loading
        }
        setLoading = {
            setLoading
        }
        /> <
        img src = {
            Background
        }
        alt = "footer-background"
        className = "footer-background" / >
        <
        /div> <
        Footer >
        <
        Container >
        <
        FooterTop >
        <
        div >
        <
        img src = {
            Logo
        }
        alt = {
            "Solano HODL Whales"
        }
        className = "footer-logo" / >
        <
        /div> <
        div >
        <
        ul >
        <
        li >
        <
        a href = "https://twitter.com/SolanaWhalesNFT"
        target = {
            "_blank"
        }
        rel = "noreferrer" >
        <
        img src = {
            Twitter
        }
        alt = "Twitter" / >
        <
        /a> <
        /li> <
        li >
        <
        a href = "https://discord.gg/solanahodlwhales"
        target = {
            "_blank"
        }
        rel = "noreferrer" >
        <
        img src = {
            Discord
        }
        alt = "Discord" / >
        <
        /a> <
        /li> <
        li >
        <
        a href = "https://www.instagram.com/solanahodlwhales/"
        target = {
            "_blank"
        }
        rel = "noreferrer" >
        <
        img src = {
            Instagram
        }
        alt = "Instagram" / >
        <
        /a> <
        /li> <
        /ul> <
        /div> <
        /FooterTop> <
        FooterBottom >
        <
        p > ©2021 SOLANA HODL WHALES, ALL RIGHTS RESERVED. < /p> <
        /FooterBottom> <
        /Container> <
        /Footer> <
        /WalletModalProvider> <
        Toaster position = "top-center"
        reverseOrder = {
            false
        }
        /> <
        /WalletProvider> <
        /ConnectionProvider>
    );
};

export default App

const FooterTop = styled.div `
  align-items: center;
  border-bottom: 2px solid rgba(255,255,255,0.2);
  display: flex;
  justify-content: space-between;
  padding: 34px 0px;

  .footer-logo {
    height: 90px;
  } 

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      margin-left: 24px;
    }
  }
`

const FooterBottom = styled.div `
  padding: 30px 0;

  p {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
`

const HeaderWrapper = styled.div `
  background: #2a2f34;
  width: 100%;
`

const HeaderContainer = styled.div `
  align-items: center;
  display: flex;
  height: 90px;
  justify-content: space-between;

  img {
    width: 125px;
  }

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;

    @media only screen and (max-width: 768px) {
      display: none;
    }

    li {
      margin-left: 25px;
      margin-right: 25px;
      position: relative;

      img {
        position: absolute;
        right: -1px;
        top: -11px;
        width: 35px;
      }

      a, span {
        color: #fff;
        font-family: "Furore", sans-serif;
        font-weight: 700;
        text-align: center;

        &:hover {
          color: #66e80b;
          text-decoration: none;
        }

        &.disabled {
          opacity: 0.5;

        &:hover {
          color: #fff;
          }
        }
      }
    }
  } 
`

const Footer = styled.div `
  background: #2a2f34;
  width: 100%; 
`