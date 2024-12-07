import React from 'react'
import { Modal, Text, Button } from 'uikit'
import useTheme from 'hooks/useTheme'


interface Props {
  onDismiss?: () => void
}


const terms: React.FC<Props> = ({ onDismiss }) => {
  const { theme } = useTheme()

  return (
    <Modal
      title="Terms of Use"
      onDismiss={onDismiss}
      headerBackground={theme.colors.secondary}
    >
      <Text color="primary" bold>
        Welcome to Marswap! By accessing or using our website, you agree to be bound by these Terms of Use. Please read them carefully before using our services. 
      </Text>
     
      <Text color="secondary" bold>
        1. Use of Our Services 
      </Text>
      <Text>
      You must be at least 18 years old to use Marswap. By using our services, you represent and warrant that you are of legal age to form a binding contract with us and that you are not prohibited by law from accessing or using our website. 
      </Text>

      <Text color="secondary" bold>
        2. Account Registration 
      </Text>
      <Text>
        In order to access certain features of Marswap, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information as necessary to keep it accurate, current, and complete.       
      </Text>
      <Text>
        You are responsible for maintaining the confidentiality of your account credentials and for any activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. 
      </Text>

      <Text color="secondary" bold>
        3. Prohibited Activities 
      </Text>
      <Text>
        When using Marswap, you agree not to: 
 
        Use our services for any unlawful purpose or in violation of any applicable laws or regulations. 
        Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity. 
        Attempt to gain unauthorized access to any portion or feature of Marswap or any other systems or networks connected to our website. 
        Interfere with or disrupt the operation of our website or servers or the networks connected to our website. 
        Engage in any conduct that could damage, disable, overburden, or impair our website or interfere with any other party's use and enjoyment of our services. 
       </Text>

        <Text color="secondary" bold>
            4. Intellectual Property Rights 
        </Text>
        <Text>
            All content on Marswap, including text, graphics, logos, images, and software, is the property of Marswap or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, modify, distribute, or otherwise use any content from our website without our prior written consent.       
        </Text>

        <Text color="secondary" bold>
            5. Disclaimer of Warranties 
        </Text>
        <Text>
            Marswap is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted or error-free, that defects will be corrected, or that our website or the servers that make it available are free of viruses or other harmful components.         
        </Text>

        <Text color="secondary" bold>
            6. Limitation of Liability 
        </Text>
        <Text>
            In no event shall Marswap or its affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, arising out of or in connection with your use of our services, whether based on warranty, contract, tort (including negligence), or any other legal theory. 
        </Text>

        <Text color="secondary" bold>
            7. Governing Law and Dispute Resolution 
        </Text>
        <Text>
            These Terms of Use shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms of Use or your use of Marswap shall be resolved exclusively in the courts located in [Jurisdiction]. 
        </Text>

        <Text color="secondary" bold>
            8. Changes to These Terms 
        </Text>
        <Text>
            We reserve the right to modify or replace these Terms of Use at any time. If we make any material changes, we will notify you by posting the updated Terms of Use on our website or by sending you an email notification. Your continued use of Marswap after any such changes constitutes your acceptance of the revised Terms of Use. 
        </Text>
     
     
      <Button variant="text" onClick={onDismiss}>
        Close Window
      </Button>
    </Modal>
  )
}

export default terms
