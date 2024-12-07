import { Card, Flex } from 'uikit'
import { BOTTOM_AD_ID, TOP_AD_ID } from 'config'
import React from 'react'
import { isMobile } from 'components/isMobile'
import styled from 'styled-components'

const AdCard = styled(Card)``

const Ads: React.FC = () => {
  return (
    <>
      {isMobile && (
        <AdCard style={{ width: '350px', height: '135px', margin: 'auto' }}>
          <div
            style={{
              width: '320px',
              height: '100px',
              padding: '15px',
            }}
          >
            <iframe
              title={TOP_AD_ID}
              data-aa={TOP_AD_ID}
              src={`//ad.a-ads.com/${TOP_AD_ID}?size=320x100`}
              style={{
                width: '320px',
                height: '100px',
                border: '0px',
                padding: '0',
                margin: '0 auto',
                display: 'block',
                overflow: 'hidden',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        </AdCard>
      )}
      {!isMobile && (
        <Flex justifyContent="center">
          <AdCard
            style={{
              width: '350px',
              height: '135px',
              margin: 'auto',
              float: 'left',
              clear: 'left',
            }}
          >
            <div
              style={{
                width: '320px',
                height: '100px',
                padding: '15px',
              }}
            >
              <iframe
                title={TOP_AD_ID}
                data-aa={TOP_AD_ID}
                src={`//ad.a-ads.com/${TOP_AD_ID}?size=320x100`}
                style={{
                  width: '320px',
                  height: '100px',
                  border: '0px',
                  padding: '0',
                  margin: '0 auto',
                  display: 'block',
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </AdCard>
          <AdCard style={{ width: '350px', height: '135px', margin: 'auto' }}>
            <div
              style={{
                width: '320px',
                height: '100px',
                padding: '15px',
              }}
            >
              <iframe
                title={BOTTOM_AD_ID}
                data-aa={BOTTOM_AD_ID}
                src={`//ad.a-ads.com/${BOTTOM_AD_ID}?size=320x100`}
                style={{
                  width: '320px',
                  height: '100px',
                  border: '0px',
                  padding: '0',
                  margin: '0 auto',
                  display: 'block',
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </AdCard>
        </Flex>
      )}
    </>
  )
}

export default Ads
