const SavedStations = () => {
  return (
    <div className="position-relative">
      <div className="position-absolute top-50 start-0 translate-middle-y" style={{ marginTop: '150px' }}>
        <div className="d-flex flex-column gap-3 justify-content-center">
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
            <button className="btn btn-primary btn-lg"><span className="fs-5">+</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavedStations;
