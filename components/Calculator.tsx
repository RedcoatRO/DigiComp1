import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleDigitClick = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (currentValue === null) {
      setCurrentValue(inputValue);
    } else if (operator) {
      const result = calculate(currentValue, inputValue, operator);
      setCurrentValue(result);
      setDisplay(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (left: number, right: number, op: string): number => {
    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      default: return right;
    }
  };

  const handleEqualsClick = () => {
    if (operator && currentValue !== null) {
      const inputValue = parseFloat(display);
      const result = calculate(currentValue, inputValue, operator);
      setCurrentValue(result);
      setDisplay(String(result));
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClearClick = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', 'C', '=', '+',
  ];

  const handleButtonClick = (btn: string) => {
    if (/\d/.test(btn)) {
      handleDigitClick(btn);
    } else if (['+', '-', '*', '/'].includes(btn)) {
      handleOperatorClick(btn);
    } else if (btn === '=') {
      handleEqualsClick();
    } else if (btn === 'C') {
      handleClearClick();
    }
  };

  return (
    <div className="h-full w-full bg-slate-200 dark:bg-gray-800 flex flex-col p-2 gap-2">
      <div className="bg-white dark:bg-gray-700 rounded p-4 text-right text-3xl font-mono text-gray-800 dark:text-gray-100">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2 flex-grow">
        {buttons.map(btn => (
          <button
            key={btn}
            onClick={() => handleButtonClick(btn)}
            className={`
              rounded-lg text-xl font-semibold transition-colors
              ${'/*-+='.includes(btn) 
                ? 'bg-orange-400 hover:bg-orange-500 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100'}
              active:scale-95
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
