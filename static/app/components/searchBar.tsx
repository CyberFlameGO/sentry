import * as React from 'react';
import styled from '@emotion/styled';
import classNames from 'classnames';

import Button from 'sentry/components/button';
import {IconSearch} from 'sentry/icons';
import {IconClose} from 'sentry/icons/iconClose';
import {t} from 'sentry/locale';
import {callIfFunction} from 'sentry/utils/callIfFunction';
import Input from 'sentry/views/settings/components/forms/controls/input';

type DefaultProps = {
  query: string;
  defaultQuery: string;
  onSearch: (query: string) => void;
};

type Props = DefaultProps & {
  width?: string;
  onChange?: (query: string) => void;
} & Omit<React.ComponentProps<typeof Input>, 'onChange'>;

type State = {
  query: string;
  dropdownVisible: boolean;
};

class SearchBar extends React.PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    query: '',
    defaultQuery: '',
    onSearch: function () {},
  };

  state: State = {
    query: this.props.query || this.props.defaultQuery,
    dropdownVisible: false,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.query !== this.props.query) {
      this.setState({
        query: nextProps.query,
      });
    }
  }

  searchInputRef = React.createRef<HTMLInputElement>();

  blur = () => {
    if (this.searchInputRef.current) {
      this.searchInputRef.current.blur();
    }
  };

  onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    this.blur();
    this.props.onSearch(this.state.query);
  };

  clearSearch = () => {
    this.setState({query: this.props.defaultQuery}, () => {
      this.props.onSearch(this.state.query);
      callIfFunction(this.props.onChange, this.state.query);
    });
  };

  onQueryFocus = () => {
    this.setState({
      dropdownVisible: true,
    });
  };

  onQueryBlur = () => {
    this.setState({dropdownVisible: false});
  };

  onQueryChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = evt.target;

    this.setState({query: value});
    callIfFunction(this.props.onChange, value);
  };

  render() {
    // Remove keys that should not be passed into Input
    const {
      className,
      width,
      query: _q,
      defaultQuery,
      onChange: _oC,
      onSearch: _oS,
      ...inputProps
    } = this.props;

    return (
      <div className={classNames('search', className)}>
        <form className="form-horizontal" onSubmit={this.onSubmit}>
          <div>
            <StyledInput
              {...inputProps}
              type="text"
              className="search-input"
              name="query"
              ref={this.searchInputRef}
              autoComplete="off"
              value={this.state.query}
              onBlur={this.onQueryBlur}
              onChange={this.onQueryChange}
              width={width}
            />
            <StyledIconSearch className="search-input-icon" size="sm" color="gray300" />
            {this.state.query !== defaultQuery && (
              <SearchClearButton
                type="button"
                className="search-clear-form"
                priority="link"
                onClick={this.clearSearch}
                size="xsmall"
                icon={<IconClose />}
                label={t('Clear')}
              />
            )}
          </div>
        </form>
      </div>
    );
  }
}

const StyledInput = styled(Input)`
  width: ${p => (p.width ? p.width : undefined)};
  &.focus-visible {
    box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.04), 0 0 6px rgba(177, 171, 225, 0.3);
    border-color: #a598b2;
    outline: none;
  }
`;

const StyledIconSearch = styled(IconSearch)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 14px;
`;

const SearchClearButton = styled(Button)`
  position: absolute;
  top: 50%;
  height: 16px;
  transform: translateY(-50%);
  right: 10px;
  font-size: ${p => p.theme.fontSizeLarge};
  color: ${p => p.theme.gray200};

  &:hover {
    color: ${p => p.theme.gray300};
  }
`;

export default SearchBar;
