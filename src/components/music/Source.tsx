interface AudioSourceProps {
  top: string;
  bottom: string;
}

const AudioSource: React.FC<AudioSourceProps> = ({ top, bottom }) => {
  return (
    <div className="d-flex flex-column align-items-center col-12">
      <small><span className="text-secondary">{top}</span></small>
      <small><span className="text-muted">{bottom}</span></small>
    </div>
  );
}

export default AudioSource;
