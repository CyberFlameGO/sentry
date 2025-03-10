import Reflux from 'reflux';

import AlertActions from 'sentry/actions/alertActions';
import {defined} from 'sentry/utils';
import localStorage from 'sentry/utils/localStorage';
import {Theme} from 'sentry/utils/theme';

import {CommonStoreInterface} from './types';

type Alert = {
  message: React.ReactNode;
  type: keyof Theme['alert'];
  expireAfter?: number;
  key?: number;
  id?: string;
  url?: string;
  neverExpire?: boolean;
  noDuplicates?: boolean;
  onClose?: () => void;
};

type AlertStoreInterface = CommonStoreInterface<Alert[]> & {
  init(): void;
  onAddAlert(alert: Alert): void;
  onCloseAlert(alert: Alert, duration?: number): void;
};

type Internals = {
  alerts: Alert[];
  count: number;
};

const storeConfig: Reflux.StoreDefinition & Internals & AlertStoreInterface = {
  listenables: AlertActions,
  alerts: [],
  count: 0,

  init() {
    this.alerts = [];
    this.count = 0;
  },

  onAddAlert(alert) {
    const alertAlreadyExists = this.alerts.some(a => a.id === alert.id);
    if (alertAlreadyExists && alert.noDuplicates) {
      return;
    }

    if (defined(alert.id)) {
      const mutedData = localStorage.getItem('alerts:muted');
      if (typeof mutedData === 'string' && mutedData.length) {
        const expirations: Record<string, number> = JSON.parse(mutedData);

        // Remove any objects that have passed their mute duration.
        const now = Math.floor(new Date().valueOf() / 1000);
        for (const key in expirations) {
          if (expirations.hasOwnProperty(key) && expirations[key] < now) {
            delete expirations[key];
          }
        }
        localStorage.setItem('alerts:muted', JSON.stringify(expirations));

        if (expirations.hasOwnProperty(alert.id)) {
          return;
        }
      }
    } else {
      if (!defined(alert.expireAfter)) {
        alert.expireAfter = 5000;
      }
    }

    if (alert.expireAfter && !alert.neverExpire) {
      window.setTimeout(() => {
        this.onCloseAlert(alert);
      }, alert.expireAfter);
    }

    alert.key = this.count++;

    // intentionally recreate array via concat because of Reflux
    // "bug" where React components are given same reference to tracked
    // data objects, and don't *see* that values have changed
    this.alerts = this.alerts.concat([alert]);
    this.trigger(this.alerts);
  },

  onCloseAlert(alert, duration = 60 * 60 * 7 * 24) {
    if (defined(alert.id) && defined(duration)) {
      const expiry = Math.floor(new Date().valueOf() / 1000) + duration;
      const mutedData = localStorage.getItem('alerts:muted');

      let expirations: Record<string, number> = {};
      if (typeof mutedData === 'string' && expirations.length) {
        expirations = JSON.parse(mutedData);
      }
      expirations[alert.id] = expiry;
      localStorage.setItem('alerts:muted', JSON.stringify(expirations));
    }

    // TODO(dcramer): we need some animations here for closing alerts
    this.alerts = this.alerts.filter(item => alert !== item);
    this.trigger(this.alerts);
  },

  getState() {
    return this.alerts;
  },
};

const AlertStore = Reflux.createStore(storeConfig) as Reflux.Store & AlertStoreInterface;

export default AlertStore;
