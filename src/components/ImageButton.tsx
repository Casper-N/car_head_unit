import React from "react";
import Icon from "../utils/svgUtils";

interface ImageButtonProps {
  id: string;
  imgSrc: string;
  text: string;
  onClick: () => void;
}

const ImageButton: React.FC<ImageButtonProps> = ({ id, imgSrc, text, onClick }) => {
  return (
    <div className="col">
      <button className="btn btn-primary btn-sm w-100 h-100 d-flex flex-column justify-content-between align-items-center" id={id} onClick={onClick}>
        <Icon name={imgSrc} size={"10vw"} />
        <span className="mt-2 fs-5">{text && text}</span>
      </button>
    </div>
  );
}

export default ImageButton;
