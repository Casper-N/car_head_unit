import { useNavigate } from "react-router-dom";
import ImageButton from "../components/ImageButton";
import { useNotification } from "../components/notifications/Notification";
import { NotificationLevel } from "../Constants";

const Home = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  return (
    <main className="container-fluid mb-5 pb-3">
      <div className="row row-cols-5 g-2 mt-1">
        <ImageButton id="music_button" imgSrc="music" text="Music" onClick={() => navigate('/music')} />
        <ImageButton id="bluetooth_button" imgSrc='bluetooth' text="Bluetooth" onClick={() => navigate('/bluetooth')} />
        <ImageButton id="navigation_button" imgSrc='navigation' text="Navigation" onClick={() => navigate('/navigation')} />
        <ImageButton id="radio_button" imgSrc='radio' text="Radio" onClick={() => navigate('/radio')} />
        <ImageButton id="internet_radio_button" imgSrc='internet_radio' text="Internet Radio" onClick={() => navigate('/internet_radio')} />
        <ImageButton id="boards_button" imgSrc='boards' text="Boards" onClick={() => navigate('/boards')} />
        <ImageButton id="test_btn" imgSrc='test' text="Test button" onClick={() => showNotification({ level: NotificationLevel.Danger, title: "Test", text: "test" })} />
      </div>
    </main>
  );
}

export default Home;
