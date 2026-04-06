import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { API_URL } from 'config'

type Role = 'user' | 'assistant' | 'system'

interface ChatMessage {
  id: string
  role: Role
  content: string
  tradeIntent?: { side: 'long' | 'short'; amount: number; leverage: number }
}

const PanelWrap = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 16px;
  background: radial-gradient(circle at top left, rgba(230, 57, 70, 0.18), rgba(10, 10, 14, 0.96));
  border: 1px solid rgba(230, 57, 70, 0.3);
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 1;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`

const Subtitle = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
`

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`

const Badge = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(230, 57, 70, 0.5);
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.35);
`

const ChatShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 320px;
  max-height: 60vh;
`

const MessagesScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  border-radius: 12px;
  background: rgba(5, 5, 10, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.06);
`

const MessageBubble = styled.div<{ role: Role }>`
  max-width: 100%;
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: ${({ role }) => (role === 'assistant' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)')};
  background: ${({ role }) =>
    role === 'assistant'
      ? 'linear-gradient(135deg, rgba(230, 57, 70, 0.15), rgba(15, 15, 20, 0.95))'
      : 'rgba(255,255,255,0.04)'};
  border: 1px solid
    ${({ role }) => (role === 'assistant' ? 'rgba(230, 57, 70, 0.55)' : 'rgba(255, 255, 255, 0.06)')};
  align-self: ${({ role }) => (role === 'assistant' ? 'flex-start' : 'flex-end')};
`

const ExecuteButton = styled(Link)`
  display: inline-block;
  margin-top: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #e63946 0%, #9d0208 100%);
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(230, 57, 70, 0.6);
  &:hover {
    opacity: 0.95;
  }
`

const MessageMeta = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
  opacity: 0.7;
`

const InputRow = styled.form`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
`

const ChatInput = styled.textarea`
  flex: 1;
  min-height: 48px;
  max-height: 120px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(4, 4, 8, 0.95);
  color: #ffffff;
  font-size: 13px;
  resize: vertical;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`

const SendButton = styled.button<{ disabled?: boolean }>`
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-size: 13px;
  font-weight: 600;
  background: ${({ disabled }) =>
    disabled ? 'rgba(120, 120, 140, 0.7)' : 'linear-gradient(135deg, #e63946 0%, #9d0208 100%)'};
  color: #ffffff;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  white-space: nowrap;
`

const TypingIndicator = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
`

const EmptyState = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  padding: 12px;
`

// Vite exposes only VITE_* on import.meta.env. Default true so the panel shows when backend is available.
const ShadowVaultAIAgentPanel: React.FC = () => {
  const featureEnabled = import.meta.env.VITE_ENABLE_AI_AGENT !== 'false'
  const { address: account } = useAccount()

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'system-welcome',
      role: 'assistant',
      content:
        'Polymarket odds · margin trades (describe size & leverage) · type CONFIRM when you accept the risk. Then tap Execute on ShadowVault to open Swap prefilled so you can sign.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const analytics = useMemo(
    () => ({
      track: (event: 'AI_OPENED' | 'MESSAGE_SENT' | 'RESPONSE_RECEIVED', payload?: Record<string, any>) => {
        // Lightweight analytics stub – replace with your analytics provider if needed
        // eslint-disable-next-line no-console
        console.log(`[AI_ANALYTICS] ${event}`, payload ?? {})
      },
    }),
    [],
  )

  useEffect(() => {
    analytics.track('AI_OPENED')
  }, [analytics])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      analytics.track('MESSAGE_SENT', { length: trimmed.length })

      setIsLoading(true)

      try {
        const apiBase = API_URL || import.meta.env.VITE_AI_AGENT_API_URL || ''
        const url = apiBase ? `${apiBase.replace(/\/$/, '')}/api/response` : '/api/response'
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inp: trimmed,
            userId: account ?? undefined,
            wallet: account ?? undefined,
          }),
        })

        const addAssistantMessage = (content: string, tradeIntent?: ChatMessage['tradeIntent']) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: content || 'No response received.',
              tradeIntent,
            },
          ])
        }

        if (!response.ok) {
          const text = await response.text()
          let errMsg = text
          try {
            const j = JSON.parse(text)
            if (j?.error) errMsg = j.error
          } catch {
            // use text as-is
          }
          addAssistantMessage(`AI backend error (${response.status}): ${errMsg}`)
          analytics.track('RESPONSE_RECEIVED', { length: 0 })
          setIsLoading(false)
          return
        }

        const data = await response.json()
        const reply = data?.message ?? 'No response received.'
        const tradeIntent = data?.tradeIntent ?? undefined
        addAssistantMessage(reply, tradeIntent)
        analytics.track('RESPONSE_RECEIVED', { length: reply.length })
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-error-${Date.now()}`,
            role: 'assistant',
            content:
              'There was an error talking to the ShadowVault AI backend. Please try again, or check your network connection.',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [analytics, input, isLoading, account],
  )

  // Future tool stubs – wired later into the AI agent
  const getPortfolioSummary = () => {
    // eslint-disable-next-line no-console
    console.log('getPortfolioSummary() not implemented yet')
  }
  const explainTransaction = (txHash: string) => {
    // eslint-disable-next-line no-console
    console.log('explainTransaction() not implemented yet', txHash)
  }
  const defiStrategySuggestions = () => {
    // eslint-disable-next-line no-console
    console.log('defiStrategySuggestions() not implemented yet')
  }
  const walletRiskCheck = (address: string) => {
    // eslint-disable-next-line no-console
    console.log('walletRiskCheck() not implemented yet', address)
  }

  // Prevent unused warnings until tools are wired
  void getPortfolioSummary
  void explainTransaction
  void defiStrategySuggestions
  void walletRiskCheck

  if (!featureEnabled) {
    return null
  }

  return (
    <PanelWrap>
      <HeaderRow>
        <div>
          <Title>ShadowVault AI Assistant</Title>
          <Subtitle>Odds, margin, CONFIRM — then Swap to sign.</Subtitle>
        </div>
        <BadgeRow>
          <Badge>AI Agents</Badge>
          <Badge>Trading</Badge>
        </BadgeRow>
      </HeaderRow>

      <ChatShell>
        <MessagesScroll ref={scrollRef}>
          {messages.length === 0 ? (
            <EmptyState>Ask odds or describe a margin trade. Type CONFIRM, then Execute on ShadowVault.</EmptyState>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} role={m.role}>
                <MessageMeta>{m.role === 'assistant' ? 'ShadowVault AI' : 'You'}</MessageMeta>
                {m.content}
                {m.role === 'assistant' && m.tradeIntent && (
                  <ExecuteButton
                    to={`/swap?tradeMode=PERPETUAL&leverage=${m.tradeIntent.leverage}&amount=${m.tradeIntent.amount}&marginSide=${m.tradeIntent.side}`}
                  >
                    Execute on ShadowVault
                  </ExecuteButton>
                )}
              </MessageBubble>
            ))
          )}
        </MessagesScroll>

        <InputRow onSubmit={handleSubmit}>
          <ChatInput
            value={input}
            onChange={handleChange}
            placeholder="/polymarket biden — or Long YES with $200 at 5x"
            rows={2}
          />
          <SendButton type="submit" disabled={!input.trim() || isLoading}>
            {isLoading ? 'Thinking…' : 'Send'}
          </SendButton>
        </InputRow>
        {isLoading && <TypingIndicator>ShadowVault AI is thinking…</TypingIndicator>}
      </ChatShell>
    </PanelWrap>
  )
}

export default ShadowVaultAIAgentPanel

