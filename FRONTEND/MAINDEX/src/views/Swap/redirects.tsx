import React, { useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

// Redirects to swap but only replaces the pathname
export function RedirectPathToSwapOnly() {
  const navigate = useNavigate();
  navigate('/swap', { replace: true });
  return null;
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToSwap() {
  const navigate = useNavigate()
  const { outputCurrency } = useParams()
  const { search } = useLocation()

  useEffect(() => {
    if (outputCurrency) {
      navigate(
        { pathname: '/swap', search: search ? `${search}&outputCurrency=${outputCurrency}` : `?outputCurrency=${outputCurrency}` },
        { replace: true }
      )
    }
  }, [outputCurrency, search, navigate])

  return null
}
