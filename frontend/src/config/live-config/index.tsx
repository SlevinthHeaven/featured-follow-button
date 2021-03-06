import styles from "./style.css";
import { Component, ChangeEvent } from "react";
import { ConfigState } from "../../config";
import { defaultLayout, getAnchorMode } from "../../utils";
import { Status } from "./status";
import { ChannelQueue } from "./channel-queue";
import { LiveLayoutItem, LiveButton } from "../../models";
import { FollowList } from "../../viewer/follow-list";

const anchorType = getAnchorMode();
const startingCharCode = "A".charCodeAt(0);

interface Props {
  config: ConfigState;
}

interface State {
  editingPosition: number;
}

export class LiveConfig extends Component<Props, State> {
  state: State = {
    editingPosition: 0,
  };

  componentDidUpdate() {
    const layout = this.props.config.config.settings.configuredLayouts[0];
    if (this.state.editingPosition >= layout.positions.length) {
      this.setState({
        editingPosition: layout.positions.length - 1,
      });
    }
  }

  render() {
    if (anchorType !== "video_overlay") {
      return <FollowList />;
    }

    return (
      <div>
        <label
          className={styles.hideAll}
          title="Hides buttons from viewers (but not you, the broadcaster)"
        >
          <input
            type="checkbox"
            checked={!!this.props.config.config.liveState.hideAll}
            onChange={this.toggleHide}
          />{" "}
          Hide Overlay
        </label>
        {this.renderStatus()}
        <ChannelQueue
          config={this.props.config}
          onChange={this.updateChannel}
        />
      </div>
    );
  }

  private getLayout() {
    return this.props.config.config.settings.configuredLayouts[0];
  }

  private getLiveItems() {
    return this.props.config.config.liveState.liveItems;
  }

  private renderStatus() {
    const layoutItem = this.getLayoutItem();
    const liveItem: Partial<LiveLayoutItem> =
      (layoutItem &&
        this.getLiveItems().find((item) => item.id === layoutItem.id)) ||
      {};
    const layout = this.getLayout();

    if (layout.positions.length > 1) {
      return (
        <div className={styles.slotSelect}>
          Editing position: <br />
          <select
            size={layout.positions.length}
            value={this.state.editingPosition}
            onChange={this.updateEditingPosition}
          >
            {layout.positions.map((layoutPosition, i) => {
              const label = String.fromCharCode(startingCharCode + i);
              const channel = this.getLiveItems().find(
                (liveItem) => layoutPosition.id === liveItem.id
              );
              return (
                <option key={layoutPosition.id} value={i}>
                  {layoutPosition.type + " " + label} -{" "}
                  {channel ? channel.channelName : "(inactive)"}
                </option>
              );
            })}
          </select>
          <br />
          {liveItem.channelName && (
            <button onClick={this.clearChannel}>Deactivate</button>
          )}
        </div>
      );
    }

    return (
      <Status
        channelName={liveItem.channelName}
        displayName={liveItem.displayName}
        onClear={this.clearChannel}
      />
    );
  }

  updateEditingPosition = (e: ChangeEvent<HTMLSelectElement>) => {
    const newPosition = +e.currentTarget.value;
    if (Number.isInteger(newPosition)) {
      this.setState({
        editingPosition: newPosition,
      });
    }
  };

  toggleHide = () => {
    this.props.config.toggleHideAll();
  };

  getLayoutItem = () => {
    const layout = this.getLayout();
    return layout.positions.length
      ? layout.positions[this.state.editingPosition]
      : defaultLayout.positions[0];
  };

  updateChannel = (liveInfo: LiveButton) => {
    const layoutItem = this.getLayoutItem();
    const liveItem = {
      ...layoutItem,
      ...liveInfo,
    };

    const liveItems = this.getLiveItems().slice();
    const editIndex = liveItems.findIndex(
      (existingItem) => existingItem.id === liveItem.id
    );
    if (editIndex >= 0) {
      liveItems[editIndex] = liveItem;
    } else {
      liveItems.push(liveItem);
    }

    this.props.config.setLiveItems(liveItems);
  };

  clearChannel = () => {
    const layoutItem = this.getLayout().positions[this.state.editingPosition];
    const liveItems = this.getLiveItems().filter(
      (item) => item.id !== layoutItem.id
    );
    this.props.config.setLiveItems(liveItems);
  };
}
