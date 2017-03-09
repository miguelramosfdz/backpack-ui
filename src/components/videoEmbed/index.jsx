import React, { Component, PropTypes } from "react";
import radium, { Style } from "radium";
import get from "lodash/get";
import kebabCase from "lodash/kebabCase";
import { color, media } from "../../../settings.json";

const _ = { get, kebabCase };

const styles = {
  container: {
    width: "100%",
    height: "100%",
    paddingBottom: `${(9 / 16) * 100}%`,
    position: "relative",
    overflow: "hidden",

    /*
     * Any shorter than 228px and Brightcove's
     * share controls won't fit
     */
    minHeight: "228px",
  },

  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
};

const scopedStyles = {
  ".vjs-menu-item.vjs-selected": {
    color: color.white,
  },

  mediaQueries: {
    [`(max-width: ${media.max["480"]})`]: {
      ".vjs-big-play-button": {
        transform: "scale(.7)",
      },
    },
  },
};

class VideoEmbed extends Component {
  constructor(props) {
    super(props);

    this.accountId = "5104226627001";
    this.playerId = "default";
    this.playerId = "S1lzq9E5Ol";
    this.embedId = "default";

    this.player = null;
  }

  componentDidMount() {
    this.setupPlayer();
  }

  componentWillReceiveProps(nextProps) {
    const nextVideoId = _.get(nextProps, "videoId", this.props.videoId);

    if (nextVideoId !== this.props.videoId) {
      this.loadVideo(nextVideoId);
    }
  }

  shouldComponentUpdate() { // eslint-disable-line class-methods-use-this
    // Video.js restructures our video element in ways that it relies on so
    // we bypass all re-rendering through React and put all control on video.js.
    return false;
  }

  componentWillUnmount() {
    this.tearDownPlayer();
  }

  onLoadSetupScript() {
    const videoElement = document.getElementsByClassName(this.getPlayerVideoClassName())[0];
    this.player = window.videojs(videoElement);

    // We don't show the controls until the player is instantiated
    // or else the controls show briefly without the brightcove theme applied.
    this.player.controls(true);

    this.player.ready(this.onPlayerReady.bind(this));

    this.player.on("timeupdate", this.onPlayerTimeUpdate.bind(this));
  }

  onPlayerReady() {
    this.loadVideo(this.props.videoId);
  }

  onPlayerTimeUpdate() {
    if ((this.player.duration() - this.player.currentTime()) < 0.2) {
      this.onPlayerEnded();
    }
  }

  onPlayerEnded() {
    if (this.props.onEnded) {
      this.props.onEnded();
    }
  }

  getPlayerVideoClassName() {
    return `${_.kebabCase(this.props.id)}-VideoEmbed-video`;
  }

  getPlayerScriptId() {
    return `${_.kebabCase(this.props.id)}-VideoEmbed-initialize`;
  }

  setupPlayer() {
    const scriptId = this.getPlayerScriptId();
    const scriptSrc = `https://players.brightcove.net/${this.accountId}/${this.playerId}_${this.embedId}/index.min.js`;
    const script = document.createElement("script");

    script.id = scriptId;
    script.src = scriptSrc;
    script.onload = this.onLoadSetupScript.bind(this);

    document.body.appendChild(script);
  }

  tearDownPlayer() {
    const scriptId = this.getPlayerScriptId();
    const script = document.getElementById(scriptId);

    if (script) {
      script.remove();
    }

    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  }

  isReady() {
    return this.player && this.player.isReady_;
  }

  loadVideo(videoId) {
    if (!this.isReady()) {
      return;
    }

    this.player.catalog.getVideo(videoId, (error, video) => {
      if (!error) {
        this.player.catalog.load(video);
        if (this.props.autoplay) {
          this.player.play();
        }
      }
    });
  }

  render() {
    const { override } = this.props;

    return (
      <div
        className="VideoEmbed"
        style={[styles.container, override]}
      >
        <Style
          scopeSelector=".VideoEmbed"
          rules={scopedStyles}
        />

        <video
          style={styles.video}
          data-account={this.accountId}
          data-player={this.playerId}
          data-embed={this.embedId}
          className={`video-js ${this.getPlayerVideoClassName()}`}
        />
      </div>
    );
  }
}

VideoEmbed.propTypes = {
  id: PropTypes.string.isRequired,
  videoId: PropTypes.string.isRequired,
  autoplay: PropTypes.bool,
  onEnded: PropTypes.func,
  override: PropTypes.oneOfType([
    PropTypes.object,
  ]),
};

export default radium(VideoEmbed);
