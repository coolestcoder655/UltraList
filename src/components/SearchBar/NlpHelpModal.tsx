import React from "react";
import { X, Sparkles } from "lucide-react";

interface NlpHelpModalProps {
  showModal: boolean;
  isDarkMode: boolean;
  onClose: () => void;
}

const NlpHelpModal: React.FC<NlpHelpModalProps> = ({
  showModal,
  isDarkMode,
  onClose,
}) => {
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`max-w-3xl w-full mx-4 p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles size={20} className="text-purple-500" />
            NLP Task Creation Guide
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? "bg-purple-900/30" : "bg-purple-50"
            }`}
          >
            <div
              className={`font-medium text-sm mb-2 ${
                isDarkMode ? "text-purple-300" : "text-purple-800"
              }`}
            >
              ✨ Natural Language Processing
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-purple-200" : "text-purple-700"
              }`}
            >
              Describe your task in plain English and let AI automatically
              extract dates, priorities, tags, and organize everything for you!
            </div>
          </div>

          {/* Basic Examples */}
          <div>
            <h4
              className={`font-medium mb-3 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              📝 Basic Examples
            </h4>
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg border-l-4 border-green-500 ${
                  isDarkMode ? "bg-gray-700" : "bg-green-50"
                }`}
              >
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-green-300" : "text-green-800"
                  }`}
                >
                  "Buy groceries tomorrow"
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  → Creates task with due date set to tomorrow
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 border-green-500 ${
                  isDarkMode ? "bg-gray-700" : "bg-green-50"
                }`}
              >
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-green-300" : "text-green-800"
                  }`}
                >
                  "Call dentist urgent #health"
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  → Creates high priority task with health tag
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4
                className={`font-medium mb-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                📅 Dates & Times
              </h4>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div>• today, tomorrow, monday</div>
                <div>• next week, this weekend</div>
                <div>• at 2pm, morning, evening</div>
              </div>
            </div>

            <div>
              <h4
                className={`font-medium mb-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                ⚡ Priorities
              </h4>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div>• urgent, important, asap</div>
                <div>• high/medium/low priority</div>
                <div>• critical, normal, minor</div>
              </div>
            </div>

            <div>
              <h4
                className={`font-medium mb-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                🏷️ Tags & Projects
              </h4>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div>• #work, #personal, #health</div>
                <div>• for work, work project</div>
                <div>• Auto-detected categories</div>
              </div>
            </div>

            <div>
              <h4
                className={`font-medium mb-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                💡 Pro Tips
              </h4>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div>• Be conversational</div>
                <div>• Mix natural & keywords</div>
                <div>• Preview before submit</div>
              </div>
            </div>
          </div>

          {/* Advanced Example */}
          <div
            className={`p-4 rounded-lg ${
              isDarkMode ? "bg-blue-900/30" : "bg-blue-50"
            }`}
          >
            <div
              className={`font-medium text-sm mb-2 ${
                isDarkMode ? "text-blue-300" : "text-blue-800"
              }`}
            >
              🚀 Advanced Example
            </div>
            <div
              className={`p-2 rounded ${
                isDarkMode ? "bg-gray-700" : "bg-white"
              }`}
            >
              <code
                className={`text-sm ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                "Schedule urgent meeting with team tomorrow at 2pm #work
                #meeting"
              </code>
            </div>
            <div
              className={`text-xs mt-2 ${
                isDarkMode ? "text-blue-200" : "text-blue-700"
              }`}
            >
              → High priority, due tomorrow 2pm, tagged #work #meeting
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NlpHelpModal;
