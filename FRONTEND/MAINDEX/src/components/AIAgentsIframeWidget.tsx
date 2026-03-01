/**
 * AI Agents iframe widget - click "AI Agents" to toggle the chat iframe
 * Iframe added exactly as provided
 */
import React, { useState } from 'react'
import styled from 'styled-components'

const TriggerBtn = styled.button`
  position: fixed;
  top: 20px;
  right: 100px;
  z-index: 1000;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);

  &:hover {
    opacity: 0.9;
  }
`

const CloseBtn = styled.button`
  position: fixed;
  bottom: 624px;
  right: 20px;
  z-index: 1002;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #333;
  }
`

export default function AIAgentsIframeWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TriggerBtn type="button" onClick={() => setOpen(!open)}>
        AI Agents
      </TriggerBtn>

      {open && (
        <>
          <CloseBtn type="button" onClick={() => setOpen(false)} aria-label="Close">
            ×
          </CloseBtn>
          <iframe
            src="https://your-agent-url.com/chat"
            width="400"
            height="600"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(139,92,246,0.25)',
            }}
            title="AI Agent Chat"
          />
        </>
      )}
    </>
  )
}
