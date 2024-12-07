import { ArrowUpIcon } from 'uikit'
import React from 'react'
import ScrollToTop from 'react-scroll-up'

const ScrollTop: React.FunctionComponent = () => {
  return (
    <ScrollToTop showUnder={0} style={{ zIndex: 1 }}>
      To Top <ArrowUpIcon color="black" />
    </ScrollToTop>
  )
}

export default ScrollTop
