import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { secToMusicTime } from "../../utils/utils";

interface SongProgressProps {
  songLength?: number;
}

const SongProgress: React.FC<SongProgressProps> = ({ songLength }) => {
  const [state, setState] = useState({ position: 0, savePosition: 0 });

  const unlistenPosition = useRef<UnlistenFn>();
  const isSeeking = useRef<boolean>(false);
  const shouldSeek = useRef<boolean>(false);

  const startPollingPosition = () => { invoke('start_position_polling'); }
  const stopPollingPosition = () => { invoke('stop_position_polling'); }

  useEffect(() => {
    const startListener = async () => {
      unlistenPosition.current = await listen<number>('music-position-change', (event) => {
        if (!isSeeking.current) setState((prevState) => ({ ...prevState, position: event.payload }));
      });
    }
    startListener();
    startPollingPosition();

    return () => {
      unlistenPosition.current && unlistenPosition.current();
      stopPollingPosition();
    }
  }, []);

  useEffect(() => {
    if (!shouldSeek.current) return;
    const parsedSeek = (state.position - state.savePosition) * -1 * 1_000_000;
    seek(parsedSeek);
    shouldSeek.current = false;
  }, [state.position]);

  const setSongPosition = (event: ChangeEvent<HTMLInputElement>) => {
    const seeked = parseInt(event.target.value, 10);
    setState({ position: seeked, savePosition: seeked });
  }

  const seek = (pos: number) => {
    invoke('set_song_position', { position: pos });
  }

  return (
    <div className="d-flex flex-row align-items-center text-muted gap-3 mb-1 mb-md-4">
      <span>{secToMusicTime(state.position)}</span>
      <input
        type="range"
        className="w-100"
        min={0}
        max={songLength}
        value={state.position}
        onChange={setSongPosition}
        onMouseDown={() => isSeeking.current = true}
        onMouseUp={() => {
          isSeeking.current = false;
          shouldSeek.current = true;
        }}
      />
      <span>{secToMusicTime(songLength)}</span>
    </div>
  );
}

export default SongProgress;
