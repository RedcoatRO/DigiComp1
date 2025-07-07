import React from 'react';
import { CloseIcon } from './Icons';

interface EvaluationModalProps {
  score: number;
  feedback: string;
  details: string[]; // Array-ul cu feedback detaliat
  onClose: () => void;
}

/**
 * Componentă pentru afișarea rezultatului evaluării într-o fereastră modală.
 * Oferă un feedback vizual imediat și detaliat utilizatorului.
 */
const EvaluationModal: React.FC<EvaluationModalProps> = ({ score, feedback, details, onClose }) => {
  // Determină culoarea cercului în funcție de scor pentru un impact vizual mai bun.
  const getScoreColor = () => {
    if (score >= 8) return 'text-green-500 bg-green-100 dark:bg-green-900';
    if (score >= 5) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
    return 'text-red-500 bg-red-100 dark:bg-red-900';
  };

  return (
    // Overlay-ul care acoperă întregul ecran pentru a focaliza atenția pe modal.
    <div 
      className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose} // Permite închiderea modalului la click în afara lui.
    >
      <div
        className="bg-slate-100 dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[420px] max-w-full text-center transform animate-zoom-in-fast"
        onClick={(e) => e.stopPropagation()} // Previne închiderea la click în interior.
      >
        <div className="flex justify-end -mr-2 -mt-2">
             <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <CloseIcon className="w-5 h-5 text-gray-500"/>
            </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Rezultatul Evaluării</h3>
        
        {/* Cercul care afișează scorul */}
        <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center ${getScoreColor()} border-4 border-white dark:border-gray-700 mb-4`}>
          <span className="text-5xl font-bold">{score}</span>
          <span className="text-2xl font-semibold mt-2">/10</span>
        </div>
        
        {/* Lista cu feedback detaliat */}
        <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 text-left">
                {feedback}
            </p>
            <ul className="space-y-2 text-left text-sm">
            {details.map((detail, index) => (
                <li key={index} className={`flex items-start gap-2.5 ${detail.startsWith('✓') ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                <span className="font-bold text-lg leading-tight mt-px">{detail.startsWith('✓') ? '✓' : '✗'}</span>
                <span className="flex-1">{detail.substring(2)}</span>
                </li>
            ))}
            </ul>
        </div>


        <button 
          onClick={onClose} 
          className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all font-semibold"
        >
          Închide
        </button>
      </div>
    </div>
  );
};

export default EvaluationModal;