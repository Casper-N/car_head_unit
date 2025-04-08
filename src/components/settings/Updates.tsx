import { invoke } from "@tauri-apps/api/core";
import Icon from "../../utils/svgUtils";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { NotificationPayload } from "../../Constants";
import { downloadDir } from "@tauri-apps/api/path";
import UpdateModal from "../modals/UpdaterModal";

const Updates = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateUrl, setUpdateUrl] = useState("");

  const [step, setStep] = useState(0);
  const [stepFail, setStepFail] = useState<number | undefined>(undefined);
  const [progressDownload, setProgressDownload] = useState("0");

  useEffect(() => {
    const unlistenUpdateStatus = listen<NotificationPayload>("update-available", (e) => onUpdateAvailable(e.payload));
    const unlistenUpdateProgress = listen<number>("update-step-done", (e) => setStep(e.payload));
    const unlistenUpdateFail = listen<number>("update-step-fail", (e) => setStepFail(e.payload));
    const unlistenUpdateProgressDownload = listen<number>("update-download-progress", (e) => {
      setProgressDownload(e.payload.toFixed());
    });


    return () => {
      unlistenUpdateStatus.then(unlisten => unlisten());
      unlistenUpdateProgress.then(unlisten => unlisten());
      unlistenUpdateFail.then(unlisten => unlisten());
      unlistenUpdateProgressDownload.then(unlisten => unlisten());
    }
  }, []);

  const checkUpdates = async () => {
    try {
      await invoke('check_for_updates');
    } catch (err) {
      console.error("Update check failed:", err);
    }
  }

  const update = async () => {
    const path = await downloadDir();
    await invoke('update_application', { url: updateUrl, savePath: path });
  }

  const onUpdateAvailable = (e: NotificationPayload) => {
    if (!e.context) return;
    setUpdateAvailable(true);
    setUpdateUrl(e.context);
  }

  return (
    <div className="container p-5 mt-3">

      <div className="row bg-primary p-2 rounded align-items-center mb-3">
        <div className="col-11 row">
          <h3><span>Check for updates</span></h3>
          <span className="fs-6"></span>
        </div>
        {updateAvailable ? (
          <button className="d-flex align-items-center justify-content-center col-1 btn btn-success rounded btn-lg p-4" data-bs-toggle="modal" data-bs-target="#updaterModal" onClick={update}>Update</button>
        ) : (
          <button className="d-flex align-items-center justify-content-center col-1 btn btn-secondary rounded btn-lg" onClick={checkUpdates}><Icon name="restart" size={"100%"} /></button>
        )}
      </div>

      <div className="row bg-primary p-2 rounded align-items-center">
        <div className="col-12 row">
          <h3><span>Version</span></h3>
          <span>0.0.1-alpha</span>
        </div>
      </div>

      <UpdateModal progress={progressDownload} step={step} stepFail={stepFail} />
    </div>
  );
}

export default Updates;
