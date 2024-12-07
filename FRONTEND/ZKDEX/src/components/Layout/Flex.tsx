import styled from 'styled-components'

const FlexLayout = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  & > * {
    min-width: 350px;
    max-width: 31%;
    width: 100%;
    margin: 0 4px;
    margin-bottom: 24px;
  }
`

export default FlexLayout
