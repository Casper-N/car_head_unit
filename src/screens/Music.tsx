import { invoke } from "@tauri-apps/api/core";
import SongControls from "../components/music/SongControls";
import SongInfo from "../components/music/SongInfo";
import AudioSource from "../components/music/Source";
import { useEffect, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { NotificationPayload } from "../Constants";
import { useNotification } from "../components/notifications/Notification";

const Music = () => {
  const { showNotification } = useNotification();

  const unlistenError = useRef<UnlistenFn>();

  useEffect(() => {
    setTimeout(() => invoke('emit_music_status'), 5);
  }, []);

  useEffect(() => {
    if (unlistenError.current !== undefined) return;

    const startListener = async () => {
      unlistenError.current = await listen<NotificationPayload>('warning-notification-Music', (e) => {
        showNotification(e.payload);
      });
    }
    startListener();

    return () => {
      unlistenError.current && unlistenError.current();
    }
  }, [])

  return (
    <div className="container">
      <div className="row">
        <AudioSource top="TODO" bottom="TODO" />
        <SongInfo col={12} />
        <SongControls />
      </div>
    </div>
  );
}

export default Music;
