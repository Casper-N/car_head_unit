import React from "react";

interface UpdateModalProps {
  progress: string;
  step: number;
  stepFail?: number;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ progress, step, stepFail }) => {
  return (
    <div className="modal" id="updaterModal" data-bs-backdrop="static" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Updating</h5>
            {step > 2 || stepFail && <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>}
          </div>
          <div className="modal-body">
            <ol className="list-group list-group-numbered">
              <ListItem step={step} progress={progress} index={0} stepFail={stepFail} title="Download .zip file" />
              <ListItem step={step} progress={progress} index={1} stepFail={stepFail} title="Extract .deb file" />
              <ListItem step={step} progress={progress} index={2} stepFail={stepFail} title="Install update" />
            </ol>
          </div>
        </div>
      </div>
    </div >
  );
}

interface ListItemProps {
  step: number;
  stepFail?: number;
  progress: string;
  index: number;
  title: string
}

const ListItem: React.FC<ListItemProps> = ({ step, stepFail, progress, index, title }) => {
  const isFinished = index === 1 ? step >= index : step > index;
  const isQueued = step < index;
  const hasFailed = stepFail === index;

  const progressText = isFinished ? "100" : isQueued ? "0" : progress;

  const badgeClass = hasFailed
    ? "bg-danger"
    : isFinished
      ? "bg-success"
      : "bg-secondary";

  const badgeSymbol = hasFailed ? "✗" : "✓";

  return (
    <li className={`list-group-item d-flex justify-content-between align-items-start ${isFinished ? 'disabled' : ''}`}>
      <div className="ms-2 me-auto">
        <div className="fw-bold">{title}</div>
        <span className="text-muted">{progressText}%</span>
      </div>
      <span className={`badge ${badgeClass} rounded-pill`}>{badgeSymbol}</span>
    </li>
  );
}

export default UpdateModal;
