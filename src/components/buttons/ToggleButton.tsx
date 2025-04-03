import React from "react";

interface ToggleButtonProps {
  toggled: boolean;
  onClick: () => void;
  children: React.JSX.Element;
}
const ToggleButton: React.FC<ToggleButtonProps> = ({ toggled, onClick, children }) => {
  return (
    <button className={toggled ? "btn btn-success" : "btn btn-primary"} onClick={onClick}>
      {children}
    </button>
  );
}

export default ToggleButton;
