import { useNavigate } from "react-router-dom";
import ImageButton from "../components/ImageButton";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid">
      <div className="row row-cols-5 g-2 mt-1">
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => navigate('updates')} />
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => { }} />
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => { }} />
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => { }} />
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => { }} />
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => { }} />
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => { }} />
        <ImageButton id="updateButton" imgSrc="test" text="Updates" onClick={() => { }} />
      </div>
    </div>
  );
}

export default Settings;
