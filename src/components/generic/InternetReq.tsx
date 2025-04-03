import React, { useEffect, useState } from "react";
import Icon from "../../utils/svgUtils";

interface InternetReqProps {
  children?: React.JSX.Element;
}

const InternetReq: React.FC<InternetReqProps> = ({ children }) => {
  const [connection, _setConnection] = useState<boolean>(false);

  useEffect(() => {
    //TODO: check for internet connectivity
  }, []);

  return (
    <div>{connection
      ? children
      : (
        <div className="container text-center mt-0 pt-0 pt-sm-5 mt-sm-5">
          <h4 className="fw-bold"><span>Sorry, an internet connection is required to use this feature</span></h4>
          <a className="btn btn-primary d-inline-flex align-items-center gap-2 mt-2" href="/settings/wifi">
            <Icon name="wifi_on" />
            Wifi-settings
          </a>
        </div>
      )}
    </div>
  );
}

export default InternetReq;
