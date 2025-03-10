import * as React from 'react';
import styled from '@emotion/styled';

import space from 'sentry/styles/space';
import {Theme} from 'sentry/utils/theme';

type PillType = 'positive' | 'negative' | 'error';

type Props = {
  type?: PillType;
  name?: React.ReactNode;
  value?: number | string | boolean | null;
  children?: React.ReactNode;
  className?: string;
};

const Pill = React.memo(({name, value, children, type, className}: Props) => {
  const getTypeAndValue = (): Partial<{valueType: PillType; renderValue: string}> => {
    if (value === undefined) {
      return {};
    }

    switch (value) {
      case 'true':
      case true:
        return {
          valueType: 'positive',
          renderValue: 'true',
        };
      case 'false':
      case false:
        return {
          valueType: 'negative',
          renderValue: 'false',
        };
      case null:
      case undefined:
        return {
          valueType: 'error',
          renderValue: 'n/a',
        };
      default:
        return {
          valueType: undefined,
          renderValue: String(value),
        };
    }
  };

  const {valueType, renderValue} = getTypeAndValue();

  return (
    <StyledPill type={type ?? valueType} className={className}>
      <PillName>{name}</PillName>
      <PillValue>{children ?? renderValue}</PillValue>
    </StyledPill>
  );
});

const getPillStyle = ({type, theme}: {type?: PillType; theme: Theme}) => {
  switch (type) {
    case 'error':
      return `
        background: ${theme.red100};
        border: 1px solid ${theme.red300};
      `;
    default:
      return `
        border: 1px solid ${theme.border};
      `;
  }
};

const getPillValueStyle = ({type, theme}: {type?: PillType; theme: Theme}) => {
  switch (type) {
    case 'positive':
      return `
        background: ${theme.green100};
        border: 1px solid ${theme.green300};
        border-left-color: ${theme.green300};
        font-family: ${theme.text.familyMono};
        margin: -1px;
      `;
    case 'error':
      return `
        border-left-color: ${theme.red300};
        background: ${theme.red100};
        border: 1px solid ${theme.red300};
        margin: -1px;
      `;
    case 'negative':
      return `
        border-left-color: ${theme.red300};
        background: ${theme.red100};
        border: 1px solid ${theme.red300};
        font-family: ${theme.text.familyMono};
        margin: -1px;
      `;
    default:
      return `
        background: ${theme.backgroundSecondary};
        font-family: ${theme.text.familyMono};
      `;
  }
};

const PillName = styled('span')`
  padding: ${space(0.5)} ${space(1)};
  min-width: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
`;

const PillValue = styled(PillName)`
  border-left: 1px solid ${p => p.theme.border};
  border-radius: ${p =>
    `0 ${p.theme.button.borderRadius} ${p.theme.button.borderRadius} 0`};
  max-width: 100%;
  display: flex;
  align-items: center;

  > a {
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    vertical-align: text-bottom;
  }

  .pill-icon,
  .external-icon {
    display: inline;
    margin: 0 0 0 ${space(1)};
    color: ${p => p.theme.gray300};
    &:hover {
      color: ${p => p.theme.textColor};
    }
  }
`;

const StyledPill = styled('li')<{type?: PillType}>`
  white-space: nowrap;
  margin: 0 ${space(1)} ${space(1)} 0;
  display: flex;
  border-radius: ${p => p.theme.button.borderRadius};
  box-shadow: ${p => p.theme.dropShadowLightest};
  line-height: 1.2;
  max-width: 100%;
  :last-child {
    margin-right: 0;
  }

  ${getPillStyle};

  ${PillValue} {
    ${getPillValueStyle};
  }
`;

export default Pill;
