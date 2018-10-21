// @ts-check
import * as iassign from 'immutable-assign';
import '../../models';

const CONFIG_VERSION = '1.0';

/** @type {ChannelData} */
const defaultConfig = {
  liveButton: {},
  liveState: {},
  settings: {
    queue: [],
    configuredLayouts: [],
  },
};

export class Config {
  /**
   * @private
   * @type {ChannelData}
   */
  config;

  /**
   * 
   * @param {() => void} onFirstUpdate
   */
  constructor(onFirstUpdate) {
    if (typeof Twitch === 'undefined' || !Twitch.ext) {
      console.error('Twitch ext not present. Config not available.');
      return;
    }
    Twitch.ext.configuration.onChanged(() => {
      let notify = false;
      if (!this.config) {
        notify = true;
      }
      this.config = this.getConfiguration();
      if (notify && this.config) {
        onFirstUpdate();
      }
    });
  }

  /**
   * @private
   */
  getConfiguration() {
    let ret = defaultConfig;
    try {
      if (Twitch.ext.configuration.broadcaster.version === CONFIG_VERSION) {
        ret = JSON.parse(Twitch.ext.configuration.broadcaster.content);
      }
    } finally {
      return ret;
    }
  }

  /**
   * @return {LiveState}
   */
  get liveState() {
    return this.config.liveState || this.config.liveButton;
  }

  get settings() {
    return this.config.settings;
  }

  /**
   * 
   * @param {LiveItems} liveItems
   */
  setLiveState(liveItems) {
    const newState = { liveItems };
    this.config = iassign(this.config, (config) => {
      config.liveState = newState;
      return config;
    });
    // set configuration
    Twitch.ext.configuration.set('broadcaster', CONFIG_VERSION, JSON.stringify(this.config));
    // broadcast to pubsub
    Twitch.ext.send('broadcast', 'application/json', newState);
  }
}
