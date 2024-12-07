import { useContext } from 'react'
import { RefreshContext } from 'contexts/RefreshContext'

const useRefresh = () => {
  const { sfast, fast, slow, sslow } = useContext(RefreshContext)
  return { fastRefresh: fast, slowRefresh: slow, sslowRefresh: sslow, sfastRefresh: sfast }
}

export default useRefresh
