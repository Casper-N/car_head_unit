import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../../utils/svgUtils";
import PowerMenu from "../modals/PowerMenu";

const Bottombar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navbar fixed-bottom navbar-expand-sm bg-black mt-3" style={{ height: '60px' }}>
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav me-auto">
              {location.pathname !== "/" && (
                <li className="nav-item mt-1 me-1">
                  <a className="" role="button" href="#" onClick={() => navigate(-1)}><Icon name="back" size={55} /></a>
                </li>
              )}
              <li className="nav-item mb-1">
                <a className="" role="button" href="/"><Icon name="home" size={60} /></a>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto gap-1 align-items-center">
              <li className="nav-item me-1">
                <a className="" role="button" href="#" data-bs-toggle="modal" data-bs-target="#powerMenuModal"><Icon name="power" size={50} /></a>
              </li>
              <li className="nav-item">
                <a className="" role="button" href="/settings"><Icon name="settings" size={50} /></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <PowerMenu />
    </div>
  );
}

export default Bottombar;
