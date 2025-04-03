import { useState } from "react";
import { BtState, WifiState } from "../../Constants";
import Clock from "../generic/Clock";
import Icon from "../../utils/svgUtils";
import { useLocation } from "react-router-dom";
import { parsePathname } from "../../utils/utils";

const Topbar = () => {
  const [wifiState, setWifiState] = useState<WifiState>(WifiState.On);
  const [btState, setBtState] = useState<BtState>(BtState.On);

  const location = useLocation();

  // TODO: add event listeners

  return (
    <nav className="navbar sticky-top navbar-expand-sm bg-black" style={{ height: '35px' }}>
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto">
            <li className="nav-item fs-5 mb-1">
              <span className="fw-bold">{parsePathname(location.pathname)}</span>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto gap-1 align-items-center">
            <li className="nav-item fs-5 mb-1">
              <Icon name={`wifi_${wifiState}`} size={30} />
            </li>
            <li className="nav-item fs-5 mb-1">
              <Icon name={`bt_${btState}`} size={28} />
            </li>
            <li className="nav-item fs-4">
              <Clock />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Topbar;
