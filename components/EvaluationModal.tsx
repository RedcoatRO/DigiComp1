import React from 'react';

interface EvaluationModalProps {
  score: number;
  feedback: string;
  details: string[];
  // Prop-ul `onClose` este eliminat intenționat pentru a preveni închiderea ferestrei.
}

/**
 * Componentă pentru afișarea rezultatului evaluării într-o fereastră modală.
 * Oferă un feedback vizual imediat și detaliat utilizatorului.
 * NOTĂ: Funcționalitatea de închidere a fost eliminată pentru a permite
 * platformelor externe (ex: OCR) să citească rezultatul afișat permanent.
 */
const EvaluationModal: React.FC<EvaluationModalProps> = ({ score, feedback, details }) => {
  // Determină culoarea cercului în funcție de scor pentru un impact vizual mai bun.
  const getScoreColor = () => {
    if (score >= 8) return 'text-green-500 bg-green-100 dark:bg-green-900';
    if (score >= 5) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
    return 'text-red-500 bg-red-100 dark:bg-red-900';
  };

  return (
    // Overlay-ul care acoperă întregul ecran. Funcționalitatea onClick a fost eliminată.
    <div 
      className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
    >
      <div
        className="bg-slate-100 dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-[420px] max-w-full text-center transform animate-zoom-in-fast"
        onClick={(e) => e.stopPropagation()} // Previne propagarea evenimentelor, o bună practică.
      >
        {/* Butonul de închidere (X) a fost eliminat. Padding-ul a fost ajustat. */}

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

        {/* Butonul "Închide" a fost eliminat pentru a face fereastra permanentă. */}
      </div>
    </div>
  );
};

export default EvaluationModal;
