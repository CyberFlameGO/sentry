import {mountWithTheme} from 'sentry-test/enzyme';

import {Client} from 'sentry/api';
import AsyncComponent from 'sentry/components/asyncComponent';

describe('AsyncComponent', function () {
  class TestAsyncComponent extends AsyncComponent {
    shouldRenderBadRequests = true;

    constructor(props) {
      super(props);
      this.state = {};
    }

    getEndpoints() {
      return [['data', '/some/path/to/something/']];
    }

    renderBody() {
      return <div>{this.state.data.message}</div>;
    }
  }

  it('renders on successful request', function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: '/some/path/to/something/',
      method: 'GET',
      body: {
        message: 'hi',
      },
    });
    const wrapper = mountWithTheme(<TestAsyncComponent />);
    expect(wrapper.find('div')).toHaveLength(1);
    expect(wrapper.find('div').text()).toEqual('hi');
  });

  it('renders error message', function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: '/some/path/to/something/',
      method: 'GET',
      body: {
        detail: 'oops there was a problem',
      },
      statusCode: 400,
    });
    const wrapper = mountWithTheme(<TestAsyncComponent />);
    expect(wrapper.find('LoadingError')).toHaveLength(1);
    expect(wrapper.find('LoadingError').text()).toEqual('oops there was a problem');
  });

  it('renders only unique error message', async function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: '/first/path/',
      method: 'GET',
      body: {
        detail: 'oops there was a problem',
      },
      statusCode: 400,
    });
    Client.addMockResponse({
      url: '/second/path/',
      method: 'GET',
      body: {
        detail: 'oops there was a problem',
      },
      statusCode: 400,
    });
    Client.addMockResponse({
      url: '/third/path/',
      method: 'GET',
      body: {
        detail: 'oops there was a different problem',
      },
      statusCode: 400,
    });

    class UniqueErrorsAsyncComponent extends AsyncComponent {
      shouldRenderBadRequests = true;

      getEndpoints() {
        return [
          ['first', '/first/path/'],
          ['second', '/second/path/'],
          ['third', '/third/path/'],
        ];
      }

      renderBody() {
        return <div>{this.state.data.message}</div>;
      }
    }

    const wrapper = mountWithTheme(<UniqueErrorsAsyncComponent />);

    expect(wrapper.find('LoadingError').text()).toEqual(
      'oops there was a problem\noops there was a different problem'
    );
  });

  describe('multi-route component', () => {
    class MultiRouteComponent extends TestAsyncComponent {
      getEndpoints() {
        return [
          ['data', '/some/path/to/something/'],
          ['project', '/another/path/here'],
        ];
      }
    }

    it('calls onLoadAllEndpointsSuccess when all endpoints have been loaded', () => {
      jest.useFakeTimers();
      jest.spyOn(Client.prototype, 'request').mockImplementation((url, options) => {
        const timeout = url.includes('something') ? 100 : 50;
        setTimeout(
          () =>
            options.success({
              message: 'good',
            }),
          timeout
        );
      });
      const mockOnAllEndpointsSuccess = jest.spyOn(
        MultiRouteComponent.prototype,
        'onLoadAllEndpointsSuccess'
      );

      const wrapper = mountWithTheme(<MultiRouteComponent />);

      expect(wrapper.state('loading')).toEqual(true);
      expect(wrapper.state('remainingRequests')).toEqual(2);

      jest.advanceTimersByTime(40);
      expect(wrapper.state('loading')).toEqual(true);
      expect(wrapper.state('remainingRequests')).toEqual(2);

      jest.advanceTimersByTime(40);
      expect(wrapper.state('loading')).toEqual(true);
      expect(wrapper.state('remainingRequests')).toEqual(1);
      expect(mockOnAllEndpointsSuccess).not.toHaveBeenCalled();

      jest.advanceTimersByTime(40);
      expect(wrapper.state('loading')).toEqual(false);
      expect(wrapper.state('remainingRequests')).toEqual(0);
      expect(mockOnAllEndpointsSuccess).toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });
});
