import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

/**
 * O componentă pentru a afișa scorul curent al utilizatorului în Taskbar.
 * Culoarea scorului se schimbă în funcție de valoarea sa pentru a oferi feedback vizual imediat.
 * @param score - Scorul curent de afișat (0-100).
 */
const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  
  // Determină culoarea textului scorului în funcție de valoare (pe o scară de 100).
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-300/50 dark:bg-slate-800/50" title={`Scorul tău curent este ${score}/100`}>
      <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Scor:</span>
      <span className={`font-bold text-lg w-8 text-center ${getScoreColor()}`}>{score}</span>
    </div>
  );
};

export default ScoreDisplay;