import { useEffect, useRef, useState } from "react";
import Icon from "../../utils/svgUtils";
import ToggleButton from "../buttons/ToggleButton";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

const SongControls = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const unlistenIsPlaying = useRef<UnlistenFn>();
  const unlistenIsShuffling = useRef<UnlistenFn>();

  useEffect(() => {
    const startListeners = async () => {
      unlistenIsPlaying.current = await listen<string>('music-is-playing', (event) => {
        setIsPlaying(event.payload === "Playing");
      });
      unlistenIsShuffling.current = await listen<boolean>('music-is-shuffling', (event) => {
        setIsShuffling(event.payload);
      });
    }
    startListeners();

    return () => {
      unlistenIsPlaying.current ? unlistenIsPlaying.current() : {};
      unlistenIsShuffling.current ? unlistenIsShuffling.current() : {};
    }
  }, []);

  const next_song = () => { invoke('next_song'); }
  const previous_song = () => { invoke('previous_song'); }
  const play_pause = () => { invoke('play_pause_song'); }
  const toggle_shuffle = () => { invoke('toggle_shuffle'); }

  return (
    <div className="col-12 mt-1 mt-md-4">
      <div className="d-flex justify-content-between">
        <ToggleButton toggled={isShuffling} onClick={() => toggle_shuffle()}><Icon name="shuffle" size={"6vw"} /></ToggleButton>
        <button className="btn btn-primary" onClick={() => previous_song()}><Icon name="previous" size={"6vw"} /></button>
        <ToggleButton toggled={isPlaying} onClick={() => play_pause()}><Icon name={isPlaying ? "pause" : "play"} size={"6vw"} /></ToggleButton>
        <button className="btn btn-primary" onClick={() => next_song()}><Icon name="next" size={"6vw"} /></button>
        {// TODO: implement this maybe
          <button className="btn btn-primary" onClick={() => { invoke('emit_music_status'); }}><Icon name="loop" /></button>
        }
      </div>
    </div>
  );
}

export default SongControls;
