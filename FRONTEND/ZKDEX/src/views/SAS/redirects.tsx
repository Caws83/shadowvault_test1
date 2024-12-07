import React from 'react';
import { useNavigate } from 'react-router-dom';

// Redirects to swap but only replaces the pathname
export function RedirectPathToSwapOnly() {
  const navigate = useNavigate();
  navigate('/swap', { replace: true });
  return null;
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToSwap(props) {
  const {
    location,
    location: { search },
    params: { outputCurrency },
  } = props;

  const navigate = useNavigate();

  navigate({
    pathname: '/swap',
    search:
      search && search.length > 1
        ? `${search}&outputCurrency=${outputCurrency}`
        : `?outputCurrency=${outputCurrency}`,
  });

  return null;
}
