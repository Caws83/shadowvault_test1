import React from 'react'
import { Modal, Text, Button, Heading } from 'uikit'
import useTheme from 'hooks/useTheme'

interface Props {
  onDismiss?: () => void
}

const Legal: React.FC<Props> = ({ onDismiss }) => {
  const { theme } = useTheme()

  return (
    <Modal style={{ maxHeight: 800, maxWidth: 1080, padding: '0px', background: "trasparent", border: 0 }} title='Legal' onDismiss={onDismiss} headerBackground={theme.colors.secondary}>
      <Heading mb='40px' mt='40px' color='secondary' >
        Disclaimer:
      </Heading>

      <Text>
        Investing in cryptocurrencies carries inherent risks, including the potential loss of your entire investment due
        to their volatile nature and potential liquidity issues. Historical performance, simulations, and predictions
        should not be solely relied upon to gauge future outcomes. Before engaging in cryptocurrency trading or
        ownership, carefully assess whether it aligns with your financial circumstances and risk tolerance.
      </Text>
      <Text>Copyright c 2024 Marswap</Text>

      <Heading mb='40px' mt='40px' color='secondary' >
        Privacy
      </Heading>

      <Text color='primary'>
        At Marswap, we are committed to protecting your privacy and ensuring the security of your personal information.
        This Privacy Policy outlines how we collect, use, disclose, and protect the information you provide when using
        our website.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        Information We Collect:
      </Text>
      <Text>
        When you visit Marswap, we may collect certain information automatically, including your IP address, browser
        type, operating system, and other technical information. We may also collect information about your usage of the
        site, such as pages visited, time spent on each page, and interactions with the site.
      </Text>
      <Text>
        If you choose to create an account on Marswap, we may collect additional information such as your name, email
        address, and other details necessary to provide our services.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        How We Use Your Information:
      </Text>
      <Text>
        We may share your information with third-party service providers who assist us in operating our website,
        conducting business, or servicing you. These third parties are obligated to keep your information confidential
        and are prohibited from using it for any other purpose.
      </Text>
      <Text>
        We may also disclose your information in response to lawful requests from government authorities, to comply with
        legal process, or to protect our rights, privacy, safety, or property.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        Data Security:
      </Text>
      <Text>
        We take reasonable measures to protect the security of your information and to prevent unauthorized access,
        disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic
        storage is 100% secure, and we cannot guarantee absolute security.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        Changes to This Privacy Policy:
      </Text>
      <Text>
        We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We
        will notify you of any material changes by posting the new Privacy Policy on this page.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        Contact Us:
      </Text>
      <Text>
        If you have any questions or concerns about this Privacy Policy, please contact us at team@zk.marswap.exchange
      </Text>

      <Text color='primary'>
        By using Marswap, you agree to the terms of this Privacy Policy. If you do not agree with these terms, please do
        not use our website.
      </Text>

      <Heading mb='40px' mt='40px' color='secondary' >
        Terms and Conditions:
      </Heading>

      <Text color='primary'>
        Welcome to Marswap! By accessing or using our website, you agree to be bound by these Terms of Use. Please read
        them carefully before using our services.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        1. Use of Our Services
      </Text>
      <Text>
        You must be at least 18 years old to use Marswap. By using our services, you represent and warrant that you are
        of legal age to form a binding contract with us and that you are not prohibited by law from accessing or using
        our website.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        2. Account Registration
      </Text>
      <Text>
        In order to access certain features of Marswap, you may be required to create an account. You agree to provide
        accurate, current, and complete information during the registration process and to update such information as
        necessary to keep it accurate, current, and complete.
      </Text>
      <Text>
        You are responsible for maintaining the confidentiality of your account credentials and for any activities that
        occur under your account. You agree to notify us immediately of any unauthorized use of your account or any
        other breach of security.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        3. Prohibited Activities
      </Text>
      <Text>
        When using Marswap, you agree not to: Use our services for any unlawful purpose or in violation of any
        applicable laws or regulations. Impersonate any person or entity or falsely state or otherwise misrepresent your
        affiliation with a person or entity. Attempt to gain unauthorized access to any portion or feature of Marswap or
        any other systems or networks connected to our website. Interfere with or disrupt the operation of our website
        or servers or the networks connected to our website. Engage in any conduct that could damage, disable,
        overburden, or impair our website or interfere with any other party's use and enjoyment of our services.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        4. Intellectual Property Rights
      </Text>
      <Text>
        All content on Marswap, including text, graphics, logos, images, and software, is the property of Marswap or its
        licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce,
        modify, distribute, or otherwise use any content from our website without our prior written consent.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        5. Disclaimer of Warranties
      </Text>
      <Text>
        Marswap is provided on an "as is" and "as available" basis, without any warranties of any kind, either express
        or implied. We do not warrant that our services will be uninterrupted or error-free, that defects will be
        corrected, or that our website or the servers that make it available are free of viruses or other harmful
        components.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        6. Limitation of Liability
      </Text>
      <Text>
        In no event shall Marswap or its affiliates be liable for any indirect, incidental, special, consequential, or
        punitive damages, including without limitation, loss of profits, data, or goodwill, arising out of or in
        connection with your use of our services, whether based on warranty, contract, tort (including negligence), or
        any other legal theory.
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        7. Governing Law and Dispute Resolution
      </Text>
      <Text>
        These Terms of Use shall be governed by and construed in accordance with the laws of [Jurisdiction], without
        regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms of Use or your
        use of Marswap shall be resolved exclusively in the courts located in [Jurisdiction].
      </Text>

      <Text color='secondary'  mb="10px" mt="10px">
        8. Changes to These Terms
      </Text>
      <Text>
        We reserve the right to modify or replace these Terms of Use at any time. If we make any material changes, we
        will notify you by posting the updated Terms of Use on our website or by sending you an email notification. Your
        continued use of Marswap after any such changes constitutes your acceptance of the revised Terms of Use.
      </Text>

      <Button variant='primary' mb="40px" mt="40px" padding="20px" onClick={onDismiss}>
        Close Window
      </Button>
    </Modal>
  )
}

export default Legal
