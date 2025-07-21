import React from "react";
import { X } from "lucide-react";

interface SearchHelpModalProps {
  showModal: boolean;
  isDarkMode: boolean;
  onClose: () => void;
}

const SearchHelpModal: React.FC<SearchHelpModalProps> = ({
  showModal,
  isDarkMode,
  onClose,
}) => {
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`max-w-2xl w-full mx-4 p-6 rounded-lg shadow-xl ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Search Help</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4
              className={`font-medium mb-2 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              🔍 Filter Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Priority Filter
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <code>priority:high</code>, <code>priority:medium</code>,{" "}
                  <code>priority:low</code>
                </div>
              </div>
              <div>
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Status Filter
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <code>status:completed</code>, <code>status:incomplete</code>
                </div>
              </div>
              <div>
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Due Date Filter
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <code>due:today</code>, <code>due:overdue</code>
                </div>
              </div>
              <div>
                <div
                  className={`font-medium text-sm ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Tag Filter
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <code>#work</code>, <code>#personal</code>,{" "}
                  <code>#urgent</code>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div
              className={`font-medium text-sm ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Text Search
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Just type any text to search in task titles and descriptions
            </div>
          </div>

          <div
            className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? "bg-gray-700" : "bg-blue-50"
            }`}
          >
            <div
              className={`font-medium text-sm ${
                isDarkMode ? "text-blue-400" : "text-blue-800"
              }`}
            >
              💡 Pro Tip
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-blue-700"
              }`}
            >
              Combine multiple filters! Try:{" "}
              <code
                className={`px-1 rounded ${
                  isDarkMode
                    ? "bg-gray-600 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                priority:high #urgent project:work
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHelpModal;
