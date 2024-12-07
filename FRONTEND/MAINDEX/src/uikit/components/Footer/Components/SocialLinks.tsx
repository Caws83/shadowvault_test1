import React from 'react'
import { FlexProps } from '../../Box'
import Flex from '../../Box/Flex'
import Link from '../../Link/Link'
import { socials } from '../config'

const SocialLinks: React.FC<FlexProps> = ({ ...props }) => (
  <Flex {...props}>
    {socials.map((social, index) => {
     
      const mr = index < socials.length - 1 ? '24px' : 0
     
      return (
        <Link external key={social.label} href={social.href} aria-label={social.label} mr={mr}>
          <img src={`images/home/icons/${social.icon}.png`} alt={`${social.icon}`} className="desktop-icon" style={{ width: `32px` }} />
        </Link>
      )
    })}
  </Flex>
)

export default React.memo(SocialLinks, () => true)
