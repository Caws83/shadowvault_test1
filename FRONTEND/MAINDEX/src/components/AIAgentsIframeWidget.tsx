/**
 * ShadowVault AI Agent - chatbot in bottom right corner
 */
import React, { useState } from 'react'
import styled from 'styled-components'

const Wrap = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`

const TriggerBtn = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);

  &:hover {
    opacity: 0.9;
  }
`

const ChatPanel = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 380px;
  height: 520px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const ChatIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
`

export default function AIAgentsIframeWidget() {
  const [open, setOpen] = useState(false)

  return (
    <Wrap>
      {open && (
        <ChatPanel>
          <ChatIframe
            src="https://venerable-cupcake-ec1bc0.netlify.app/shadowvault-agent.html"
            title="ShadowVault AI Agent"
          />
        </ChatPanel>
      )}
      <TriggerBtn type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Close chat' : 'Open AI Agent'}>
        {open ? '×' : '💬'}
      </TriggerBtn>
    </Wrap>
  )
}
