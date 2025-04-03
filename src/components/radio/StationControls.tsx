import Icon from "../../utils/svgUtils";

const StationControls = () => {
  return (
    <div className="col-12 mt-1 mt-md-4">
      <div className="d-flex justify-content-center gap-4">
        <button className="btn btn-primary"><Icon name="previous" size={"6vw"} /></button>
        <button className="btn btn-primary"><Icon name="search" size={"6vw"} /></button>
        <button className="btn btn-primary"><Icon name="next" size={"6vw"} /></button>
      </div>
    </div>
  );
}

export default StationControls;
