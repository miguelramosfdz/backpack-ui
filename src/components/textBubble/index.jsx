import React, { PropTypes } from "react";
import radium from "radium";
import { color } from "../../../settings.json";
import { rgba } from "../../utils/color";

const styles = {
  backgroundColor: rgba(color.black, 0.24),
  borderRadius: "30px",
  color: color.white,
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: 1,
  paddingBottom: "7px",
  paddingLeft: "12px",
  paddingRight: "12px",
  paddingTop: "9px",
  textAlign: "center",
  verticalAlign: "top",
};

const TextBubble = ({ children, style }) => (
  <span style={[styles, style]}>
    {children}
  </span>
);

TextBubble.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
  ),
};

export default radium(TextBubble);
