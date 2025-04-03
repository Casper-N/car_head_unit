import { invoke } from "@tauri-apps/api/core";
import Icon from "../../utils/svgUtils";

const Updates = () => {
  const checkUpdates = async () => {
    try {
      await invoke('check_update');
    } catch (err) {
      console.error("Update check failed:", err);
    }
  }

  return (
    <div className="container p-5">

      <div className="row bg-primary p-2 rounded align-items-center mb-3">
        <div className="col-11 row">
          <h3><span>Check for updates</span></h3>
          <span className="fs-6"></span>
        </div>
        <button className="d-flex align-items-center justify-content-center col-1 btn btn-secondary rounded btn-lg" onClick={checkUpdates}><Icon name="restart" size={"100%"} /></button>
      </div>

      <div className="row bg-primary p-2 rounded align-items-center">
        <div className="col-12 row">
          <h3><span>Version</span></h3>
          <span>0.0.1-alpha</span>
        </div>
      </div>

    </div>
  );
}

export default Updates;
