import Icon from "../../utils/svgUtils";

const PowerMenu = () => {
  return (
    <div className="modal" id="powerMenuModal" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Choose an option</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            <div className="row row-cols-4 g-5">
              <div className="d-flex flex-column">
                <button className="btn btn-primary btn-lg">
                  <Icon name="power" size={40} />
                </button>
                <small><span className="text-muted text-center">Power off</span></small>
              </div>
              <div className="d-flex flex-column">
                <button className="btn btn-primary btn-lg"><Icon name="restart" size={40} /></button>
                <small><span className="text-muted text-center">Restart</span></small>
              </div>
              <div className="d-flex flex-column">
                <button className="btn btn-primary btn-lg"><Icon name="screen_off" size={40} /></button>
                <small><span className="text-muted text-center">Screen off</span></small>
              </div>
              <div className="d-flex flex-column">
                <button className="btn btn-primary btn-lg"><Icon name="exit" size={40} /></button>
                <small><span className="text-muted text-center">Exit</span></small>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PowerMenu;
