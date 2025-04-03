import { useEffect, useRef, useState } from "react";
import { SongInfoType } from "../../Constants";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import SongProgress from "./SongProgress";

interface SongInfoProps {
  col?: number;
}

const SongInfo: React.FC<SongInfoProps> = ({ col = 8 }) => {
  const [songInfo, setSongInfo] = useState<SongInfoType | undefined>(undefined);

  const unlistenSongInfo = useRef<UnlistenFn>();

  useEffect(() => {
    const startListener = async () => {
      unlistenSongInfo.current = await listen<SongInfoType>('music-song-change', (event) => {
        setSongInfo(event.payload);
      })
    }
    startListener();

    return () => {
      unlistenSongInfo.current ? unlistenSongInfo.current() : {};
    }
  }, []);

  return (
    <div className={`col-12 col-md-${col}`}>
      {/*TODO: Add network req for image / default image*/}
      <div className="row mb-3">
        {songInfo?.album_url &&
          <div className="col-2">
            <img src={songInfo.album_url} alt="Album logo" className="rounded" style={{ height: '34vh', width: 'auto' }} />
          </div>
        }
        <div className="col-10 d-flex flex-column mt-1 mb-3 gap-1 fs-5 overflow-hidden justify-content-center align-items-center">
          {songInfo?.title
            ? (<span className="fs-4">{songInfo.title}</span>)
            : (<span className="fs-4"><em>Unkown title</em></span>)}
          {songInfo?.artist
            ? (<span className="text-muted">{songInfo.artist}</span>)
            : (<span className="text-muted"><em>Unkown artist</em></span>)}
        </div>

      </div>
      <SongProgress songLength={songInfo?.length} />
    </div>
  );
}

export default SongInfo;
