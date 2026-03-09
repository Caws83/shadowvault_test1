import React from "react";
import styled from "styled-components";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const StyledCard = styled.div`
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(30, 31, 34, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 0 80px rgba(225, 29, 46, 0.04);
`;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <StyledCard className={className} {...props}>
      {children}
    </StyledCard>
  );
}
