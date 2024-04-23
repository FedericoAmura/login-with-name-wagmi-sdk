import "./spinner.css";

interface SpinnerProps {
  height?: number;
}

export function Spinner({ height = 36 }: SpinnerProps) {
  return (
    <div className="spinner-container">
      <div className="spinner" style={{ width: `${height}px`, height: `${height}px` }}></div>
    </div>
  );
}
