import React, { useState, useRef } from "react";
import { X, Delete, RotateCcw } from "lucide-react";

/**
 * Tamil Keyboard Component
 * Provides a virtual Tamil keyboard for text input
 * Supports Tamil Unicode characters and common combinations
 */

const TAMIL_KEYBOARD_LAYOUT = {
  row1: ["ஆ", "ஈ", "ஊ", "எ", "ஐ", "ஒ", "ஓ", "ஔ", "ங", "ஞ"],
  row2: ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம"],
  row3: ["ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன", "ஜ", "ஸ"],
  row4: ["ஷ", "ஹ", "ஃ", "்", "ு", "ூ", "ெ", "ே", "ை", "ொ"],
  row5: ["ோ", "ௌ", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை"],
};

const TAMIL_VOWELS = {
  "ு": "ு",
  "ூ": "ூ",
  "ெ": "ெ",
  "ே": "ே",
  "ை": "ை",
  "ொ": "ொ",
  "ோ": "ோ",
  "ௌ": "ௌ",
  "ா": "ா",
  "ி": "ி",
  "ீ": "ீ",
};

interface TamilKeyboardProps {
  onInput: (text: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TamilKeyboard: React.FC<TamilKeyboardProps> = ({
  onInput,
  onClose,
  isOpen,
}) => {
  const [currentText, setCurrentText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCharacterClick = (char: string) => {
    const newText = currentText + char;
    setCurrentText(newText);
    onInput(newText);
  };

  const handleBackspace = () => {
    const newText = currentText.slice(0, -1);
    setCurrentText(newText);
    onInput(newText);
  };

  const handleClear = () => {
    setCurrentText("");
    onInput("");
  };

  const handleClose = () => {
    setCurrentText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-slate-900 border-t border-slate-700 rounded-t-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Tamil Keyboard</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 bg-slate-800">
          <input
            ref={inputRef}
            type="text"
            value={currentText}
            readOnly
            className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 text-lg font-tamil"
            placeholder="Tamil text will appear here..."
          />
        </div>

        {/* Keyboard Layout */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {/* Row 1 */}
          <div className="grid grid-cols-10 gap-1">
            {TAMIL_KEYBOARD_LAYOUT.row1.map((char, idx) => (
              <button
                key={`row1-${idx}`}
                onClick={() => handleCharacterClick(char)}
                className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded font-tamil text-sm font-semibold transition active:bg-slate-500"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-10 gap-1">
            {TAMIL_KEYBOARD_LAYOUT.row2.map((char, idx) => (
              <button
                key={`row2-${idx}`}
                onClick={() => handleCharacterClick(char)}
                className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded font-tamil text-sm font-semibold transition active:bg-slate-500"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-10 gap-1">
            {TAMIL_KEYBOARD_LAYOUT.row3.map((char, idx) => (
              <button
                key={`row3-${idx}`}
                onClick={() => handleCharacterClick(char)}
                className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded font-tamil text-sm font-semibold transition active:bg-slate-500"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Row 4 - Vowel Modifiers */}
          <div className="grid grid-cols-10 gap-1">
            {TAMIL_KEYBOARD_LAYOUT.row4.map((char, idx) => (
              <button
                key={`row4-${idx}`}
                onClick={() => handleCharacterClick(char)}
                className="p-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded font-tamil text-sm font-semibold transition active:bg-indigo-500"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Row 5 - Additional Characters */}
          <div className="grid grid-cols-10 gap-1">
            {TAMIL_KEYBOARD_LAYOUT.row5.map((char, idx) => (
              <button
                key={`row5-${idx}`}
                onClick={() => handleCharacterClick(char)}
                className="p-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded font-tamil text-sm font-semibold transition active:bg-indigo-500"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={handleBackspace}
              className="p-3 bg-red-700 hover:bg-red-600 text-white rounded font-semibold transition active:bg-red-500 flex items-center justify-center gap-2"
            >
              <Delete className="w-4 h-4" />
              <span className="text-xs">Backspace</span>
            </button>
            <button
              onClick={handleClear}
              className="p-3 bg-orange-700 hover:bg-orange-600 text-white rounded font-semibold transition active:bg-orange-500 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs">Clear</span>
            </button>
            <button
              onClick={handleClose}
              className="p-3 bg-green-700 hover:bg-green-600 text-white rounded font-semibold transition active:bg-green-500"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TamilKeyboard;
