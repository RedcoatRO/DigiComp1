import React from 'react';

interface EvaluationModalProps {
  score: number;
  feedback: string;
  details: string[];
}

/**
 * Componentă pentru afișarea rezultatului evaluării, optimizată pentru citirea OCR.
 * Pentru a maximiza lizibilitatea de către sisteme automate, s-au aplicat următoarele principii:
 * - Contrast ridicat: Text negru pe fundal alb.
 * - Fonturi clare și mărite: S-au mărit dimensiunile fonturilor.
 * - Spațiere generoasă: S-a adăugat spațiere între litere și rânduri.
 * - Elemente simple: S-a eliminat cercul colorat al scorului și iconițele (✓/✗),
 *   înlocuindu-le cu text simplu, ușor de parsat (ex: "[CORECT]").
 * - Fără efecte vizuale: S-au eliminat umbrele și culorile de fundal complexe.
 */
const EvaluationModal: React.FC<EvaluationModalProps> = ({ score, feedback, details }) => {
  return (
    // Overlay-ul care acoperă întregul ecran.
    <div 
      className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in"
    >
      {/* Containerul modalului a fost simplificat pentru a avea contrast maxim (alb cu text negru). */}
      <div
        className="bg-white text-black rounded-lg p-10 w-[500px] max-w-full font-sans leading-relaxed tracking-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-3xl font-bold text-center mb-6">
          Rezultatul Evaluării
        </h3>
        
        {/* Scorul este afișat ca text mare, clar, pentru citire OCR facilă. */}
        <div className="text-center bg-gray-100 p-4 rounded-md mb-8">
            <p className="text-2xl font-semibold text-gray-600">SCOR FINAL</p>
            <p className="text-7xl font-bold text-black">{score} / 100</p>
        </div>
        
        {/* Lista cu feedback detaliat, optimizată pentru OCR. */}
        <div className="text-left">
            <p className="text-lg font-semibold mb-4">
                {feedback}
            </p>
            <ul className="space-y-3 text-lg">
            {details.map((detail, index) => {
                // Înlocuim iconițele ✓/✗ cu text explicit [CORECT] / [INCORECT]
                const isCorrect = detail.startsWith('✓');
                const cleanDetail = detail.substring(2);
                const prefix = isCorrect ? '[CORECT]' : '[INCORECT]';

                return (
                    <li key={index} className="flex items-start">
                        <span className="font-bold w-32 flex-shrink-0">{prefix}</span>
                        <span className="flex-1">{cleanDetail}</span>
                    </li>
                );
            })}
            </ul>
        </div>
        {/* Butonul "Închide" și iconița "X" au fost eliminate anterior pentru a face fereastra permanentă. */}
      </div>
    </div>
  );
};

export default EvaluationModal;