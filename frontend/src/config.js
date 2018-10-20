const CONFIG_VERSION = '1.0';

const defaultConfig = {
  liveButton: {
    channelName: '',
    displayName: '',
  },
};

export class Config {
  /**
   * @private
   * @type {typeof defaultConfig}
   */
  config;


  /**
   * 
   * @param {() => void} onUpdate
   */
  constructor(onUpdate) {
    if (!Twitch || !Twitch.ext) {
      throw new Error('Twitch ext not present. Config not available.');
    }
    Twitch.ext.configuration.onChanged(() => {
      let notify = false;
      if (!this.config) {
        notify = true;
      }
      this.config = this.getConfiguration();
      if (notify && this.config) {
        onUpdate();
      }
    });
  }

  /**
   * @private
   */
  getConfiguration() {
    try {
      if (Twitch.ext.configuration.broadcaster.version === CONFIG_VERSION) {
        console.log('received valid config');
        return JSON.parse(Twitch.ext.configuration.broadcaster.content);
      }
    } finally {
      return defaultConfig;
    }
  }

  get liveState() {
    return this.config.liveButton;
  }

  setLiveState(channelName, displayName) {
    const newState = {
      channelName,
      displayName,
    };
    const newConfiguration = Object.assign({}, this.config);
    newConfiguration.liveButton = newState;
    // set configuration
    Twitch.ext.configuration.set('broadcaster', newConfiguration, CONFIG_VERSION);
    // broadcast to pubsub
    Twitch.ext.send('broadcast', 'application/json', newState);
  }
}