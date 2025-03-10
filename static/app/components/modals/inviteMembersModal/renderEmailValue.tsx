import {components as selectComponents, MultiValueProps} from 'react-select';
import styled from '@emotion/styled';

import LoadingIndicator from 'sentry/components/loadingIndicator';
import Tooltip from 'sentry/components/tooltip';
import {IconCheckmark, IconWarning} from 'sentry/icons';
import space from 'sentry/styles/space';

import {InviteStatus} from './types';

function renderEmailValue<Option>(
  status: InviteStatus[string],
  valueProps: MultiValueProps<Option>
) {
  const {children, ...props} = valueProps;
  const error = status && status.error;

  const emailLabel =
    status === undefined ? (
      children
    ) : (
      <Tooltip disabled={!error} title={error}>
        <EmailLabel>
          {children}
          {!status.sent && !status.error && <SendingIndicator />}
          {status.error && <IconWarning size="10px" />}
          {status.sent && <IconCheckmark size="10px" color="success" />}
        </EmailLabel>
      </Tooltip>
    );

  return (
    <selectComponents.MultiValue {...props}>{emailLabel}</selectComponents.MultiValue>
  );
}

const EmailLabel = styled('div')`
  display: inline-grid;
  grid-auto-flow: column;
  grid-gap: ${space(0.5)};
  align-items: center;
`;

const SendingIndicator = styled(LoadingIndicator)`
  margin: 0;
  .loading-indicator {
    border-width: 2px;
  }
`;

SendingIndicator.defaultProps = {
  hideMessage: true,
  size: 14,
};

export default renderEmailValue;
