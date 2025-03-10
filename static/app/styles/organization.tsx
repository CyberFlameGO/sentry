// Shared styles for the new org level pages with global project/env/time selection
import styled from '@emotion/styled';

import space from 'sentry/styles/space';

export const PageContent = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${space(2)} ${space(4)} ${space(3)};
  margin-bottom: -20px; /* <footer> has margin-top: 20px; */

  /* No footer at smallest breakpoint */
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    margin-bottom: 0;
  }
`;

export const PageHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${space(2)};
  min-height: 32px;
`;

export const HeaderTitle = styled('h4')`
  flex: 1;
  font-size: ${p => p.theme.headerFontSize};
  line-height: ${p => p.theme.headerFontSize};
  font-weight: normal;
  color: ${p => p.theme.textColor};
  margin: 0;
`;
