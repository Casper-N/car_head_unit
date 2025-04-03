interface NavTabProps {
  active?: boolean;
  id: string;
  target: string;
  text: string;
}

export const NavTab: React.FC<NavTabProps> = ({ active, id, target, text }) => {
  const classNames = active ? "nav-link active p-3" : "nav-link p-3";
  return (
    <button className={classNames} id={id} data-bs-target={target} type="button" role="tab" data-bs-toggle="tab"><span className="fs-5">{text}</span></button>
  );
}

interface TabContentProps {
  active?: boolean;
  id: string;
  labelledBy: string;
  children: React.JSX.Element;
}

export const TabContent: React.FC<TabContentProps> = ({ active, id, labelledBy, children }) => {
  let classNames = "tab-pane fade";

  if (active) classNames += " show active";

  return (
    <div className={classNames} id={id} role="tabpanel" aria-labelledby={labelledBy}>
      {children}
    </div>
  );
}
