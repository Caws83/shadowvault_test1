import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AddLiquidity from './index';

export function RedirectToAddLiquidity() {
  const navigate = useNavigate();
  navigate('/add/');
  return null; // or any placeholder if needed
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40}|zkCRO)-(0x[a-fA-F0-9]{40}|zkCRO)$/;

export function RedirectOldAddLiquidityPathStructure() {
  const { currencyIdA } = useParams();
  const match = currencyIdA.match(OLD_PATH_STRUCTURE);

  if (match?.length) {
    const [_, param1, param2] = match;
    const navigate = useNavigate();
    navigate(`/add/${param1}/${param2}`);
    return null; // or any placeholder if needed
  }

  return <AddLiquidity />;
}

export function RedirectDuplicateTokenIds() {
  const { currencyIdA, currencyIdB } = useParams();

  if (currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    const navigate = useNavigate();
    navigate(`/add/${currencyIdA}`);
    return null; // or any placeholder if needed
  }

  return <AddLiquidity />;
}
