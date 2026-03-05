interface AnswerOptionsProps {
  options: string[];
  onSelect: (answer: string) => void;
  disabled: boolean;
  correctAnswer?: string;
  userAnswer?: string;
  showResult: boolean;
  stopAll?: () => void;
}

export function AnswerOptions({
  options,
  onSelect,
  disabled,
  correctAnswer,
  userAnswer,
  showResult,
  stopAll,
}: AnswerOptionsProps) {
  function getButtonStyle(option: string): string {
    const base =
      'w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2';

    if (showResult) {
      if (option === correctAnswer) {
        return `${base} bg-emerald-600/20 border-emerald-500 text-emerald-300`;
      }
      if (option === userAnswer && option !== correctAnswer) {
        return `${base} bg-red-600/20 border-red-500 text-red-300`;
      }
      return `${base} bg-slate-800/50 border-slate-700 text-slate-500`;
    }

    return `${base} bg-slate-800 border-slate-600 text-white hover:bg-violet-700 hover:border-violet-500 active:scale-[0.98] cursor-pointer`;
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-lg mx-auto">
      {options.map(option => (
        <button
          key={option}
          onClick={() => {
            if (!disabled) {
              stopAll?.();
              onSelect(option);
            }
          }}
          disabled={disabled}
          className={getButtonStyle(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
