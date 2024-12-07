import React from 'react'
import styled from 'styled-components'
import { Text, Heading, Card, CardHeader, CardBody, Flex } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import FoldableText from 'components/FoldableText'
import config from './config'




const IfoQuestions = () => {
  const { t } = useTranslation()

  return (
    <Flex alignItems='center' justifyContent='center'>
      
        <Card>
          <CardHeader>
            <Heading scale="lg" color="secondary">
              {t('Details')}
            </Heading>
          </CardHeader>
          <CardBody>
            {config.map(({ title, description }, i, { length }) => (
              <FoldableText key={title} id={title} mb={i + 1 === length ? '' : '24px'} title={t(title)}>
                {description.map((desc) => {
                  return (
                    <Text key={desc} color="textSubtle" as="p">
                      {t(desc)}
                    </Text>
                  )
                })}
              </FoldableText>
            ))}
          </CardBody>
        </Card>

    </Flex>
  )
}

export default IfoQuestions
