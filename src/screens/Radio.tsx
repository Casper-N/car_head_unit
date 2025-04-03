import SongInfo from "../components/music/SongInfo";
import AudioSource from "../components/music/Source";
import SavedStations from "../components/radio/SavedStations";
import StationControls from "../components/radio/StationControls";

const Radio = () => {
  return (
    <div className="container">
      <SavedStations />
      <div className="row">
        <div className="mb-4">
          <AudioSource top="PLAYING FROM RADIO" bottom="98.5 FM" />
        </div>
        <SongInfo title="Dogs - Pink Floyd" artist="Yle Vega" col={12} />
        <div className="mt-3">
          <StationControls />
        </div>
      </div>
    </div>
  );
}

export default Radio;
