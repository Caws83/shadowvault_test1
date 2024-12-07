import React from 'react'
import { Modal, Text, Button } from 'uikit'
import useTheme from 'hooks/useTheme'

interface Props {
  onDismiss?: () => void
}


const privacy: React.FC<Props> = ({ onDismiss }) => {
  const { theme } = useTheme()

  return (
    <Modal
      title="Privacy Policy"
      onDismiss={onDismiss}
      headerBackground={theme.colors.secondary}
    >
      <Text color="primary" bold>
        At Marswap, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and protect the information you provide when using our website. 
      </Text>
     
      <Text color="secondary" bold>
        Information We Collect: 
      </Text>
      <Text>
        When you visit Marswap, we may collect certain information automatically, including your IP address, browser type, operating system, and other technical information. We may also collect information about your usage of the site, such as pages visited, time spent on each page, and interactions with the site. 
      </Text>
      <Text>
        If you choose to create an account on Marswap, we may collect additional information such as your name, email address, and other details necessary to provide our services. 
      </Text>

      <Text color="secondary" bold>
        How We Use Your Information: 
      </Text>
      <Text>
        We may share your information with third-party service providers who assist us in operating our website, conducting business, or servicing you. These third parties are obligated to keep your information confidential and are prohibited from using it for any other purpose. 
      </Text>
      <Text>
        We may also disclose your information in response to lawful requests from government authorities, to comply with legal process, or to protect our rights, privacy, safety, or property. 
      </Text>

      <Text color="secondary" bold>
        Data Security: 
      </Text>
        <Text>
            We take reasonable measures to protect the security of your information and to prevent unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security. 
       </Text>

        <Text color="secondary" bold>
            Changes to This Privacy Policy: 
        </Text>
        <Text>
            We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the new Privacy Policy on this page. 
        </Text>

        <Text color="secondary" bold>
            Contact Us: 
        </Text>
        <Text>
            If you have any questions or concerns about this Privacy Policy, please contact us at team@zk.marswap.exchange 
        </Text>

        <Text color="primary" bold>
            By using Marswap, you agree to the terms of this Privacy Policy. If you do not agree with these terms, please do not use our website.
        </Text>

       
     
      <Button variant="text" onClick={onDismiss}>
        Close Window
      </Button>
    </Modal>
  )
}

export default privacy
