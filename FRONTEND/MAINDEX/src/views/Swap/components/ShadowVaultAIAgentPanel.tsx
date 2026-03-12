import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

type Role = 'user' | 'assistant' | 'system'

interface ChatMessage {
  id: string
  role: Role
  content: string
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
  min-height: 44px;
  max-height: 96px;
  padding: 8px 10px;
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

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'system-welcome',
      role: 'assistant',
      content:
        'I am the ShadowVault AI assistant.\nAsk me about DeFi strategies, your wallet activity, or how to interpret a specific transaction.',
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
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
      if (!trimmed || isStreaming) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      analytics.track('MESSAGE_SENT', { length: trimmed.length })

      const controller = new AbortController()
      setIsStreaming(true)

      try {
        const apiBase = import.meta.env.VITE_AI_AGENT_API_URL ?? ''
        const response = await fetch(apiBase ? `${apiBase.replace(/\/$/, '')}/api/ai-agent` : '/api/ai-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content:
                  'You are the ShadowVault AI assistant. Help users understand DeFi strategies, wallet activity, and portfolio insights. Explain transactions clearly and provide educational guidance.',
              },
              ...messages.map(({ role, content }) => ({ role, content })),
              { role: 'user', content: trimmed },
            ],
          }),
          signal: controller.signal,
        })

        if (!response.body) {
          const text = await response.text()
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: text || 'No response received from AI agent.',
            },
          ])
          analytics.track('RESPONSE_RECEIVED', { length: text.length || 0 })
          setIsStreaming(false)
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '',
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Stream text chunks from the backend
        // Backend should send plain text chunks (no SSE framing)
        // to keep this simple.
        // If you switch to SSE, adapt the parsing here.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (!chunk) continue

          assistantMessage = {
            ...assistantMessage,
            content: assistantMessage.content + chunk,
          }
          setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? assistantMessage : m)))
        }

        analytics.track('RESPONSE_RECEIVED', { length: assistantMessage.content.length })
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
        setIsStreaming(false)
      }
    },
    [analytics, input, isStreaming, messages],
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
          <Subtitle>Ask about DeFi, your wallet, or a specific transaction hash.</Subtitle>
        </div>
        <BadgeRow>
          <Badge>AI Agents</Badge>
          <Badge>Streaming</Badge>
        </BadgeRow>
      </HeaderRow>

      <ChatShell>
        <MessagesScroll ref={scrollRef}>
          {messages.length === 0 ? (
            <EmptyState>Ask anything about your ShadowVault trading, LP positions, or risk profile.</EmptyState>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} role={m.role}>
                <MessageMeta>{m.role === 'assistant' ? 'ShadowVault AI' : 'You'}</MessageMeta>
                {m.content}
              </MessageBubble>
            ))
          )}
        </MessagesScroll>

        <InputRow onSubmit={handleSubmit}>
          <ChatInput
            value={input}
            onChange={handleChange}
            placeholder="e.g. Explain my last margin liquidation on BSC, or suggest a safer SVP/BNB strategy."
          />
          <SendButton type="submit" disabled={!input.trim() || isStreaming}>
            {isStreaming ? 'Thinking…' : 'Send'}
          </SendButton>
        </InputRow>
        {isStreaming && <TypingIndicator>ShadowVault AI is generating a response…</TypingIndicator>}
      </ChatShell>
    </PanelWrap>
  )
}

export default ShadowVaultAIAgentPanel

