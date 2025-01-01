import React, { useEffect, useMemo, useState } from 'react';
import Select, { OptionProps } from 'components/Select/Select';
import { dexs } from 'config/constants/dex';
import { chains } from 'wagmiConfig';
import { Dex } from 'config/constants/types';
import { useAccount } from 'wagmi';

interface DexSelectorProps {
  newDex?: Dex;
  UpdateDex: (dex: Dex) => void;
  hideDex?: boolean;
  hideChain?: boolean;
  color?: string;
}

const DexSelector: React.FunctionComponent<DexSelectorProps> = (props) => {
  const { newDex, UpdateDex, hideDex, hideChain, color } = props;
  const [dex, setDex] = useState<Dex>(newDex);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedChainId, setSelectedChainId] = useState(0);
  const { chain } = useAccount();

  // Set chain to match chain.id when it changes
  useEffect(() => {
    if (chain) {
      const chainIndex = Object.values(chains).findIndex(c => c.id === chain.id);
      if (chainIndex !== -1) {
        setSelectedChainId(chainIndex);
        const firstDexOfNewChain = getFirstOfNewChain(chain.id);
        if (firstDexOfNewChain.length > 0) {
          onChangeDex({ value: firstDexOfNewChain[0], label: "test" });
        }
      }
    }
  }, [chain]);

  useEffect(() => {
    if (newDex !== undefined && dex !== undefined && dex !== newDex) {
      let dexIndex = selectedId;
      let chainIndex = selectedChainId;

      // Find the index of the newDex in dexs array
      Object.values<Dex>(dexs).forEach((d, i) => {
        if (d.info.name === newDex.info.name) {
          dexIndex = i;
        }
      });

      // Find the index of the chain based on chainId
      Object.values(chains).forEach((c, i) => {
        if (c.id === newDex.chainId) {
          chainIndex = i;
        }
      });

      // Set the state values
      setDex(newDex);
      setSelectedId(dexIndex);
      setSelectedChainId(chainIndex);
    }
  }, [dex, newDex]);

  const dexOptions = useMemo(() => {
    let count = 0;

    return Object.values(dexs)
      .filter(
        (dexFilter) =>
          dexFilter.allowTrade === true &&
          dexFilter.chainId === dex?.chainId &&
          (chain?.id !== 245022926 ? dexFilter.chainId !== 245022926 : true)
      )
      .map((dexInfo) => {
        if (dexInfo.id === dex?.id && count !== selectedId) {
          setSelectedId(count);
        }
        count++;

        return { label: `${dexInfo.info.name}`, value: dexInfo };
      });
  }, [dex, newDex]);

  const onChangeDex = (option: OptionProps) => {
    let index = selectedId;
    Object.values<Dex>(dexs).forEach((d, i) => {
      if (d.info.name === option.value.name) {
        index = i;
      }
    });

    setSelectedId(index);
    setDex(option.value);
    UpdateDex(option.value);
  };

  const chainOptions = useMemo(() => {
    return Object.values(chains)
      .filter((chainFilter) => (chainFilter.id === 245022926 ? chainFilter.id === chain?.id : true))
      .map((chainFilter, index) => {
        // Check if the current chain is the selected chain and update the selectedChainId
        if (chainFilter.id === dex.chainId) {
          setSelectedChainId(index);
        }

        return {
          label: chainFilter.name,
          value: chainFilter,
        };
      });
  }, [dex, newDex]);

  const getFirstOfNewChain = (chainId: number) => {
    return Object.values(dexs)
      .filter(
        (dexFilter) =>
          dexFilter.allowTrade === true &&
          dexFilter.chainId === chainId
      );
  };

  const onChangeChain = (option: OptionProps) => {
    const selectedChainIndex = chainOptions.findIndex(
      (chainOption) => chainOption.value.id === option.value.id
    );

    if (selectedChainIndex !== -1) {
      setSelectedChainId(selectedChainIndex);
    }

    const firstDexOfNewChain = getFirstOfNewChain(option.value.id);
    if (firstDexOfNewChain.length > 0) {
      onChangeDex({ value: firstDexOfNewChain[0], label: "test" });
    }
  };

  return (
    <div>
      {!hideChain &&
        <div style={{ marginBottom: '5px' }}>
          <Select options={chainOptions} selectedId={selectedChainId} color={color} onChange={onChangeChain} />
        </div>
      }
      {!hideDex &&
        <div style={{ marginBottom: '5px' }}>
          <Select options={dexOptions} selectedId={selectedId} color={color} onChange={onChangeDex} />
        </div>
      }
    </div>
  );
};

export default DexSelector;
