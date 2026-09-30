'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  target: Date;
  label?: string;
}

function getRemaining(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function Countdown({ target, label }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(target));
  // Depend on the time value so a new Date for the same moment doesn't restart the timer
  const targetMs = target.getTime();

  useEffect(() => {
    const end = new Date(targetMs);
    setRemaining(getRemaining(end));
    const interval = setInterval(() => {
      const next = getRemaining(end);
      setRemaining(next);
      if (next.done) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  const units = [
    { value: remaining.days, name: remaining.days === 1 ? 'Day' : 'Days' },
    { value: remaining.hours, name: remaining.hours === 1 ? 'Hour' : 'Hours' },
    { value: remaining.minutes, name: remaining.minutes === 1 ? 'Minute' : 'Minutes' },
    { value: remaining.seconds, name: remaining.seconds === 1 ? 'Second' : 'Seconds' },
  ];

  return (
    <div className="text-center">
      {label && (
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          {label}
        </p>
      )}
      <div className="flex justify-center gap-2 sm:gap-4" role="timer" aria-live="off">
        {units.map((unit) => (
          <div
            key={unit.name}
            className="w-16 sm:w-20 py-3 bg-primary text-white rounded-lg shadow"
          >
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wide opacity-90">
              {unit.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
