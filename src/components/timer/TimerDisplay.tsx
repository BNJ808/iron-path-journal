
interface TimerDisplayProps {
  timeLeft: number;
  duration: number;
}

export const TimerDisplay = ({ timeLeft, duration }: TimerDisplayProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (timeLeft / duration) : 0;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center mb-8">
      <svg className="absolute w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-700"
          stroke="currentColor"
          strokeWidth="4"
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
        />
        <circle
          className="text-accent-green"
          stroke="currentColor"
          strokeWidth="4"
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          strokeDasharray={2 * Math.PI * 45}
          strokeDashoffset={2 * Math.PI * 45 * (1 - progress)}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className="text-6xl font-mono font-bold">{formatTime(timeLeft)}</span>
    </div>
  );
};
