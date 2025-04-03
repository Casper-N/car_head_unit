import { useNavigate } from "react-router-dom";
import { MicroController } from "../../Constants";
import Icon from "../../utils/svgUtils";

interface BoardProps {
  board: MicroController;
}

const Board: React.FC<BoardProps> = ({ board }) => {
  const navigate = useNavigate();

  return (
    <li
      className="list-group-item list-group-item-action pe-auto p-3"
      onClick={() => navigate(`/board/${board.id}`, { state: { board } })}
    >
      <div className="row align-items-center">
        <div className="col-1"><Icon name="" /></div>
        <div className="col-8">
          <div className="fw-bold">
            <span>{board.name}</span>
          </div>
          <small><span className="text-muted">{board.fqbn}</span></small>
        </div>
      </div>
    </li>
  );
}

export default Board;
