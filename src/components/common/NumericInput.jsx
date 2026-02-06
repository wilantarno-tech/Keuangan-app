import { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { formatInputNumber, getPlainNumber } from '../../utils/formatters';

const NumericInput = ({ value, onChange, placeholder = "0", label, required = false, className = "" }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcOperation, setCalcOperation] = useState(null);
  const [prevValue, setPrevValue] = useState(null);

  const handleCalcNumber = (num) => {
    setCalcDisplay(calcDisplay === '0' ? num.toString() : calcDisplay + num);
  };

  const handleCalcOperation = (op) => {
    setPrevValue(parseFloat(calcDisplay));
    setCalcOperation(op);
    setCalcDisplay('0');
  };

  const handleCalcEquals = () => {
    if (prevValue !== null && calcOperation) {
      const current = parseFloat(calcDisplay);
      let result = 0;
      
      switch (calcOperation) {
        case '+':
          result = prevValue + current;
          break;
        case '-':
          result = prevValue - current;
          break;
        case '*':
          result = prevValue * current;
          break;
        case '/':
          result = prevValue / current;
          break;
        default:
          result = 0;
      }
      
      setCalcDisplay(result.toString());
      setPrevValue(null);
      setCalcOperation(null);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setPrevValue(null);
    setCalcOperation(null);
  };

  const handleUseCalcResult = () => {
    const plainValue = calcDisplay.replace(/[^0-9]/g, '');
    onChange({ target: { value: formatInputNumber(plainValue) } });
    setShowCalculator(false);
    handleCalcClear();
  };

  return (
    <div className="relative">
      {label && (
        <label className="label">{label}</label>
      )}
      
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const formatted = formatInputNumber(e.target.value);
            onChange({ target: { value: formatted } });
          }}
          className={`input-field flex-1 ${className}`}
          placeholder={placeholder}
          required={required}
        />
        
        <button
          type="button"
          onClick={() => setShowCalculator(!showCalculator)}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Kalkulator"
        >
          <Calculator size={20} />
        </button>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Kalkulator</h3>
              <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Display */}
            <div className="bg-dark-bg p-4 rounded-lg mb-4">
              <div className="text-xs text-gray-400 mb-1">
                {prevValue !== null && `${prevValue} ${calcOperation || ''}`}
              </div>
              <div className="text-2xl font-mono text-right">{calcDisplay}</div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <button onClick={handleCalcClear} className="calc-btn bg-red-600 hover:bg-red-700 col-span-2">C</button>
              <button onClick={() => setCalcDisplay(calcDisplay.slice(0, -1) || '0')} className="calc-btn bg-gray-600 hover:bg-gray-700">←</button>
              <button onClick={() => handleCalcOperation('/')} className="calc-btn bg-blue-600 hover:bg-blue-700">÷</button>

              {/* Row 2 */}
              <button onClick={() => handleCalcNumber(7)} className="calc-btn">7</button>
              <button onClick={() => handleCalcNumber(8)} className="calc-btn">8</button>
              <button onClick={() => handleCalcNumber(9)} className="calc-btn">9</button>
              <button onClick={() => handleCalcOperation('*')} className="calc-btn bg-blue-600 hover:bg-blue-700">×</button>

              {/* Row 3 */}
              <button onClick={() => handleCalcNumber(4)} className="calc-btn">4</button>
              <button onClick={() => handleCalcNumber(5)} className="calc-btn">5</button>
              <button onClick={() => handleCalcNumber(6)} className="calc-btn">6</button>
              <button onClick={() => handleCalcOperation('-')} className="calc-btn bg-blue-600 hover:bg-blue-700">−</button>

              {/* Row 4 */}
              <button onClick={() => handleCalcNumber(1)} className="calc-btn">1</button>
              <button onClick={() => handleCalcNumber(2)} className="calc-btn">2</button>
              <button onClick={() => handleCalcNumber(3)} className="calc-btn">3</button>
              <button onClick={() => handleCalcOperation('+')} className="calc-btn bg-blue-600 hover:bg-blue-700">+</button>

              {/* Row 5 */}
              <button onClick={() => handleCalcNumber(0)} className="calc-btn col-span-2">0</button>
              <button onClick={() => setCalcDisplay(calcDisplay + '00')} className="calc-btn">00</button>
              <button onClick={handleCalcEquals} className="calc-btn bg-green-600 hover:bg-green-700">=</button>
            </div>

            {/* Use Result Button */}
            <button
              onClick={handleUseCalcResult}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Gunakan Hasil: {formatInputNumber(calcDisplay)}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .calc-btn {
          padding: 1rem;
          background-color: #374151;
          border-radius: 0.5rem;
          font-size: 1.125rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .calc-btn:hover {
          background-color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default NumericInput;
