import React, { useState } from 'react';
import { Input } from 'uikit';
import styled from 'styled-components';
import { useTranslation } from 'contexts/Localization';

const StyledInput = styled(Input)`
  border-radius: 4px;
  margin-left: auto;
`;

const InputWrapper = styled.div`
  position: relative;
  ${({ theme }) => theme.mediaQueries.sm} {
    display: block;
  }
`;

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  starting?: string;
}

const SearchInput: React.FC<Props> = ({ onChange: onChangeCallback, placeholder = 'Search', starting = '' }) => {
  const [searchText, setSearchText] = useState(starting);

  const { t } = useTranslation();

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChangeCallback(e as unknown as React.ChangeEvent<HTMLInputElement>);
      setSearchText(''); // Clear the input text
    }
  };

  return (
    <InputWrapper>
      <StyledInput
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t(placeholder)}
      />
    </InputWrapper>
  );
};

export default SearchInput;
