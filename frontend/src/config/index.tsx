import "../common-styles.css";
import { applyThemeClass } from "../common-styles";
import { Component } from "react";
import { render } from "react-dom";
import { getAnchorMode } from "../utils";
import { ConfigProvider } from "../config";
import { SettingsPage } from "./settings-page";

class App extends Component {
  render() {
    switch (getAnchorMode()) {
      case "video_overlay":
        return (
          <SettingsPage
            title="Overlay Mode"
            description={`You have this extension activated as an overlay, so you can
        configure a custom layout below. Think of the buttons and zones as
        "slots" that can be filled or left unused and invisible during a
        stream. Don't forget to save when you're done editing!`}
          />
        );
      case "component":
      case "panel":
        return (
          <SettingsPage
            title="List Mode"
            description="You have this extension activated as a component or panel. In this
        mode, this extension will display a list of channels a viewer can
        follow."
          />
        );
      default:
        return (
          <SettingsPage
            title="Activate me first!"
            description="You have yet to activate this extension anywhere. Activate it as a
        component for a list of channels to follow, or as an overlay to
        build a custom layout with buttons or transparent zones in specific
        locations over the video."
          />
        );
    }
  }
}

const appNode = document.createElement("div");
document.body.appendChild(appNode);
render(
  <ConfigProvider>
    <App />
  </ConfigProvider>,
  appNode
);
applyThemeClass();
