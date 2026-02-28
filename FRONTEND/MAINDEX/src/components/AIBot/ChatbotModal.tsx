import React, { useState, useEffect, useRef } from 'react'
import FloatingActionButton from './FloatingActionButton'
import useChatStyles from './Ai_style'
import SearchInput from './SearchInput'
import { Link } from 'react-router-dom'
import { Button, Text } from 'uikit'
import { defaultChainId } from 'config/constants/chains'
import { TransactionReceipt } from 'zksync-ethers/build/types'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useAccount, useReadContracts } from 'wagmi'
import { BigNumber } from 'bignumber.js'
import { simulateContract, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { config } from 'wagmiConfig'
import { lanchManagerAbi } from 'config/abi/launchManager'
import useToast from 'hooks/useToast'
import { API_URL, BASE_URL } from 'config'
import { getTokenPriceString } from 'state/pools'
import { Dex } from 'config/constants/types'
import { dexs } from 'config/constants/dex'
import { useUserDex } from 'state/user/hooks'
import { ERC20_ABI } from 'config/abi/erc20'
import { isMobile } from 'components/isMobile'




interface Message {
  text: string
  sender: 'user' | 'bot'
  command: string
  url: string
  call?: any[]
}

interface FetchResponse {
  message: string
}

const ChatbotModal: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { chain, address: account } = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const { toastSuccess, toastError } = useToast()
  const [fee, setFee] = useState('0')
  const [sFee, setSFee] = useState('0')
  const [dex, setDex] = useUserDex()
  const baseUrl = BASE_URL

  const getDex = () => {
    for (const key in dexs) {
      if (dexs[key].chainId === chain?.id) {
        return dexs[key]
      }
    }
    return dex
  }
  const [localDex, setLocalDex] = useState<Dex>(getDex())

  useEffect(() => {
    setLocalDex(getDex())
  }, [chain])
    

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'creationFee',
        chainId: chainId,
      },
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'sponsorshipFee',
        chainId: chainId,
      },
    ],
  })

  useEffect(() => {
    refetch()
  },[chain])

  useEffect(() => {
    if (data) {
      setFee(data[0]?.result?.toString() || '0')
      setSFee(data[1]?.result?.toString() || '0')
    }
  }, [data])

  const totalFee = (isSponsored: boolean) => {
    let total = new BigNumber(fee);
    if (isSponsored) {
      total = total.plus(sFee);
    }
    return total;
  };

  function formatNumber(num?: number): string {
    if (num === undefined) {
      return '$0'; // or any other default value you'd prefer
    }
  
    if (num >= 1_000_000_000) {
      return '$' + (num / 1_000_000_000).toFixed(0) + 'B';
    } else if (num >= 1_000_000) {
      return '$' + (num / 1_000_000).toFixed(0) + 'M';
    } else if (num >= 1_000) {
      return '$' + (num / 1_000).toFixed(0) + 'K';
    } else {
      return '$' + num.toFixed(0);
    }
  }


  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Welcome! I'm your AI Agent for ShadowVault Protocol. \n\n
            You can ask me anything about trading, leverage positions, privacy features, or the platform.  \n 
            Start your sentence with the following commands:\n
            TRADE: Execute a swap or trade. ex: trade 100 USDC for ETH\n
            LEVERAGE: Open a leveraged position. ex: leverage 10x long ETH\n
            PRIVACY: Enable privacy mode for your trades\n
            AI SIGNAL: Get AI trading signals for a token pair\n
            PRESALE: Create or participate in a presale\n
            ex: presale and token named Pizza Pop with 3% tax\n\n
            More documentation to follow\n
            If you would like further information, just ask, or let us know in telegram what you would like me to be able to do for you.`,
      sender: 'bot',
      command: '',
      url: '',
    },
  ])
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const styles = useChatStyles()

  const headerStyle = {
    ...styles.modalHeaderStyle,
    background: 'rgba(20, 20, 22, 0.95)',
    borderBottom: '1px solid #3c3f44',
  }

  const headerTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }

  const handleSendMessage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    const inputValue = value
    if (inputValue.trim() === '') return

    const newMessage: Message = { text: inputValue, sender: 'user', command: '', url: '' }
    setMessages(prevMessages => [...prevMessages, newMessage])

    try {
      const loadingMessage: Message = { text: 'Thinking...', sender: 'bot', command: '', url: '' }
      setMessages(prevMessages => [...prevMessages, loadingMessage])

      const response = await fetch(`${API_URL}/api/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inp: inputValue }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText)
      }

      const res: FetchResponse = await response.json()
      console.log(res)
      const botMessage = await handleAICmds(res.message)
      const botResponse: Message = {
        text: botMessage.message,
        sender: 'bot',
        command: botMessage.command,
        url: botMessage.url,
        call: botMessage.call,
      }

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1] = botResponse
        return updatedMessages
      })
    } catch (error) {
      console.error('Error occurred:', error)
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1] = {
          text: 'AI Agent is processing. Please try asking another question.',
          sender: 'bot',
          command: '',
          url: '',
        }
        return updatedMessages
      })
    }
  }

  interface CommandResponse {
    message: string
    command: string
    url: string
    call?: any[]
  }


  const handleAICmds = async (inputString: string): Promise<CommandResponse> => {
    console.log(inputString);
    
  
    try {
      const inputCommand = JSON.parse(inputString.replace(/'/g, '"'));
      console.log(inputCommand);
  
      if (inputCommand.command === 'create_token') {
        console.log("detected create token")
        const { name, symbol } = inputCommand;
  
        if (name && symbol) {
          const tokenUrl = `${baseUrl}marscreate?token=${encodeURIComponent(name)}&symbol=${encodeURIComponent(symbol)}&auto=true`;
          const text = `You are about to create a token\n
                        name: ${name}\n
                        symbol: ${symbol}\n
                        Please make sure your wallet is already connected and that wallet has at least 1 CRO. \n\n`;
          return { message: text, command: inputCommand.command, url: tokenUrl };
        } else {
          return {
            message: "I could not find the token's name or symbol. Please try again and provide me the name of the token and the symbol.\n Goto MarsCreate Page\n",
            command: inputCommand.command,
            url: `${baseUrl}marscreate`,
          };
        }
      }
  
      if (inputCommand.command === 'create_token_presale') {
        console.log("detected create token presale")
        const { name, symbol, wallet, tax, renounced, presale_percentage, softcap } = inputCommand;
        let walletToUse = wallet
        if (wallet === 'Not specified' && tax !== 0) {
          walletToUse = account
        }
      
        if (name && symbol) {
          const tokenUrl = `${baseUrl}marscreate?token=${encodeURIComponent(name)}&symbol=${encodeURIComponent(symbol)}&auto=true&tax=${encodeURIComponent(tax)}&wallet=${encodeURIComponent(walletToUse)}&presale=true&presale_percentage=${encodeURIComponent(presale_percentage)}&softcap=${encodeURIComponent(softcap)}&renounced=${encodeURIComponent(renounced)}`;
          const text = `You are about to create a token and a presale\n
                        name: ${name}\n
                        symbol: ${symbol}\n
                        taxes: ${tax}\n
                        devWallet: ${walletToUse}\n
                        renounced: ${renounced}\n
                        presale%: ${presale_percentage}\n
                        softCap: ${new BigNumber(softcap).shiftedBy(-18).toFixed(2)}\n
                        Please make sure your wallet is already connected and that wallet has at least 1 CRO. \n\n`;
          return { message: text, command: inputCommand.command, url: tokenUrl };
        } else {
          return {
            message: "I could not find one of the following: token's name, token's symbol, tax percentage, or the tax wallet. These are all required to create a tax token. Please try again.",
            command: inputCommand.command,
            url: '',
          };
        }
      }

      if (inputCommand.command === 'presale_token') {
        console.log("detected create presale")
        const {  address, softcap, amount } = inputCommand;
       
        if (address) {
          const tokenUrl = `${baseUrl}marsale?token=${encodeURIComponent(address)}&amount=${encodeURIComponent(amount)}&softcap=${encodeURIComponent(softcap)}&auto=true`;
          const text = `You are about to create a presale\n
                        token: ${address}\n
                        QTY ( RAW ): ${amount}\n
                        softCap: ${new BigNumber(softcap).shiftedBy(-18).toFixed(2)}\n
                        Please make sure your wallet is already connected and that wallet has at least 1 CRO. \n\n`;
          return { message: text, command: inputCommand.command, url: tokenUrl };
        } else {
          return {
            message: "I could not find one of the following: token's name, token's symbol, tax percentage, or the tax wallet. These are all required to create a tax token. Please try again.\n Goto MarSale Page\n",
            command: inputCommand.command,
            url: `${baseUrl}marsale`,
          };
        }
      }
  
      if (inputCommand.command === 'create_tax_token') {
        console.log("detected create tax token")
        const { name, symbol, wallet, tax, renounced } = inputCommand;
        let walletToUse = wallet
        if (wallet === 'Not specified') {
          walletToUse = account
        }
        if (name && symbol) {
          const tokenUrl = `${baseUrl}marscreate?token=${encodeURIComponent(name)}&symbol=${encodeURIComponent(symbol)}&auto=true&tax=${encodeURIComponent(tax)}&wallet=${encodeURIComponent(walletToUse)}&renounced=${encodeURIComponent(renounced)}`;
          const text = `You are about to create a token\n
                        name: ${name}\n
                        symbol: ${symbol}\n
                        taxes: ${tax}\n
                        devWallet: ${walletToUse}\n
                        renounced: ${renounced}\n
                        Please make sure your wallet is already connected and that wallet has at least 1 CRO. \n\n`;
          return { message: text, command: inputCommand.command, url: tokenUrl };
        } else {
          return {
            message: "I could not find one of the following: token's name, token's symbol, tax percentage, or the tax wallet. These are all required to create a tax token. Please try again.\nGoto Create Token Page\n",
            command: inputCommand.command,
            url: `${baseUrl}marscreate`,
          };
        }
      }
  
      if (inputCommand.command === 'create_rocket') {
        console.log("create rocket")
        const { name, symbol, website, logo, telegram, isSponsored } = inputCommand;
        if (name && symbol) {
          const isSpon = isSponsored === 'true'
          return {
            message: `Click to create your Marshot Rocket using name: ${name} and symbol: ${symbol}\n
                      Web: ${website}\n
                      TG: ${telegram}\n
                      Logo: ${logo}\n
                      If you did not include website, or telegram links they will be blank\n
                      If you did not include a logo link, it will use default \n
                      Description will be generated by AI\n
                      Please ensure you have enough CRO for gas and fees. \n 
                      Fee required: ${new BigNumber(totalFee(isSpon)).shiftedBy(-18).toFixed(2)}\n\n`,
            command: inputCommand.command,
            url: '',
            call: inputCommand,
          };
        

         
        } else {
          return {
            message: "I could not find the necessary details to create a rocket. Please ensure all required fields are filled.",
            command: inputCommand.command,
            url: '',
          };
        }
      }

      if (inputCommand.command === 'swap_token') {
        console.log("detected swap")
      const { address, amount } = inputCommand

      if (address !== "Not specified" && amount !== 'Not Specified') {
        
          const text = `Click button to to Swap this token!\n\n`
          const tokenUrl = `${baseUrl}swap?outputCurrency=${encodeURIComponent(address)}&amount=${encodeURIComponent(amount)}&auto=true`

          return { message: text, url: tokenUrl, command: inputCommand.command }
       
      } else {
        return {
          message:
            "I could not find one the following: token's address or the amount you wish to swap. Please try again.\n Link Below to swap page\n",
          command: inputCommand.command,
          url: `${baseUrl}swap`,
        }
      }
    }

    if (inputCommand.command === 'zap_token') {
      console.log("detected zap")
      const { amount, tokenAddress } = inputCommand
      console.log(inputCommand)
      if (amount && tokenAddress !== 'Not specified' ) {
        const tokenUrl = `${baseUrl}add/zkTCRO/${encodeURIComponent(tokenAddress)}?zap=1&amount=${encodeURIComponent(amount)}`

        console.log(tokenUrl)
        const text = `Please make sure your wallet is already connected and that wallet has at least 1 CRO. \n
                      Click below to Add/ZAP liquidity for your chosen token.\n\n`
        return { message: text, url: tokenUrl, command: inputCommand.command }
      } else {
        return {
          message:
            'I could not find one the following: the token address, or the amount you wish to zap. These are all required to add zap liquidity. Please try again.\n',
          command: inputCommand.command,
          url: `${baseUrl}add?zap=1`,
        }
      }
    }

    if (inputCommand.command === 'check_price') {
      console.log("check price")
      const { address } = inputCommand

      if (address !== 'Not specified') {
        const price = await getTokenPriceString(localDex, address)
        const name = await readContract(config, {
          address: address,
          abi: ERC20_ABI,
          functionName: 'name',
          chainId: dex.chainId
        }) 
        const text = `Below is the price on connected chain.
                      Name: ${name} \n
                      Price: ${formatNumber(price)} \n`
                    
        return { message: text, command: inputCommand.command, url: '' }
      } else {
        return {
          message: 'I cannot find the requested token. Please try a different token.\n',
          command: inputCommand.command,
          url: '',
        }
      }
    }
  
      // Handle other commands...
      return { message: inputString, command: '', url: '' };
    } catch (e) {
      console.log(e);
      return { message: inputString, command: '', url: '' };
    }
  };

const onCreateRocket = async (inputCommand) => {
  
  const loadingMessage: Message = { text: 'Creating your Rocket...', sender: 'bot', command: '', url: '' }
  setMessages(prevMessages => [...prevMessages, loadingMessage])

  const { name, symbol, website, logo, telegram, isSponsored } = inputCommand;
        const isSpon = isSponsored === 'true'
        const lengthInSeconds = 3600; // Length in seconds
        const now = Date.now() / 1000; // Current timestamp in seconds
        const endEpoch = (now + lengthInSeconds).toFixed(0); // Adding 3600 seconds
        const initialSupply = '100000000';
        const descriptionToUse = await handleAIDesc(name);
        const total = totalFee(isSpon)
  try {
    const { request } = await simulateContract(config, {
      abi: lanchManagerAbi,
      address: getAddress(contracts.launchManager, chainId),
      functionName: 'startRound',
      args: [
        name,
        symbol,
        new BigNumber(initialSupply).shiftedBy(18),
        endEpoch,
        website,
        telegram,
        logo,
        descriptionToUse,
        isSpon,
      ],
      value: total,
      chainId,
    });

    const hash = await writeContract(config, request);
    const receipt = await waitForTransactionReceipt(config, { hash }) as TransactionReceipt;

    if (receipt.status) {
      toastSuccess(
        'Rocket set to launch.',
        <ToastDescriptionWithTx txHash={receipt.hash}>
          Start fueling your rocket.
        </ToastDescriptionWithTx>,
      );
      const url = `${baseUrl}marshot`
      const botResponse: Message = {
        text: `Successfully created your Rocket! Visit MARSHOT page to view, share and Fuel!`,
        sender: 'bot',
        command: inputCommand.command,
        url: url,
      }

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1] = botResponse
        return updatedMessages
      })
      
    } else {
      toastError('Rejected', 'Please try again. Confirm the transaction and make sure you are paying enough gas!');
      const url = `${baseUrl}marshot`
      const botResponse: Message = {
        text: `Error Creating your Marshot Rocket. Visit MARSHOT page to manually create. Or try again!`,
        sender: 'bot',
        command: inputCommand.command,
        url: url,
      }

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1] = botResponse
        return updatedMessages
      })
    }
  } catch (e) {
    console.error(e);
    toastError('Error', 'Please try again. Confirm the transaction and make sure you are paying enough gas!');
    const url = `${baseUrl}marshot`
      const botResponse: Message = {
        text: `Error Creating your Marshot Rocket. Visit MARSHOT page to manually create. Or try again!`,
        sender: 'bot',
        command: inputCommand.command,
        url: url,
      }

      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1] = botResponse
        return updatedMessages
      })
  }
}

const createRocket = async (inputCommand) => {
  onCreateRocket(inputCommand)
}

  const handleAIDesc = async (name) => {
   
    const inputValue = "ADD DESC: The name of the token is:" + name
    const response = await fetch(`${API_URL}/api/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inp: inputValue }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText)
    }
    const res: FetchResponse = await response.json()
    console.log(res)
    return res.message
  }

  const handleOpenModal = () => {
    setModalOpen(prevState => !prevState)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const getButtonText = (command) => {
    switch (command) {
      case 'create_token':
        return 'CREATE';
      case 'swap_token':
        return 'SWAP';
      case 'create_rocket':
        return 'MARSHOT';
      case 'presale_token':
        return 'CREATE';
      case 'create_tax_token':
        return 'CREATE';
      case 'create_token_presale':
        return 'CREATE';
      case 'zap_token':
        return 'ZAP';
      default:
        return '';
    }
  };

  return (
    <div>
      <FloatingActionButton onClick={handleOpenModal} />
  
      <div
        style={{
          ...styles.modalContainerStyle,
          display: modalOpen ? 'block' : 'none',
          maxWidth: isMobile ? '300px' : '600px', // Set max width based on isMobile
        }}
      >
        <div style={styles.modalContentStyle}>
          <div style={headerStyle}>
            <div style={headerTitleStyle}>
              <img 
                src="/images/home/toly.png" 
                alt="AI Agent" 
                style={{ 
                  width: '40px', 
                  height: '40px',
                  objectFit: 'contain'
                }} 
              />
              <h2 style={{ margin: 0 }} className="farm-gradient-heading">AI Agent - ShadowVault Protocol</h2>
            </div>
            <button style={styles.closeButtonStyle} onClick={handleCloseModal}>
              X
            </button>
          </div>
  
          <div style={styles.modalBodyStyle} ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div key={index} style={styles.messageStyle}>
                <div style={message.sender === 'user' ? styles.userBubbleStyle : styles.botBubbleStyle}>
                  {message.sender === 'bot' ? (
                    <>
                      {message.text}
                      {message.url && (
                        <Link to={message.url}>
                          <Button style={{ background: 'white' }}>
                            {getButtonText(message.command)}
                          </Button>
                        </Link>
                      )}
                      {message.call && (
                        <Button style={{ background: 'white' }} onClick={() => createRocket(message.call)}>
                          CREATE
                        </Button>
                      )}
                    </>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
  
            <div style={styles.inputContainerStyle}>
              {isActive ? (
                <SearchInput onChange={handleSendMessage} placeholder='Type your message...' />
              ) : (
                <Text>AI Offline...</Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotModal
