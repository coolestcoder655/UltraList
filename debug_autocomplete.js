// Quick test script to debug the autocomplete logic

// Simulate the logic
const categories = {
  dateKeywords: [
    "today",
    "tomorrow",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "next week",
    "this weekend",
    "next weekend",
  ],
};

function applyNlpSuggestionLogic(searchQuery, suggestion) {
  const trimmedQuery = searchQuery.trim();
  const words = trimmedQuery.split(/\s+/).filter((word) => word.length > 0);
  const lastWord = words.length > 0 ? words[words.length - 1] : "";

  console.log("Input:", { searchQuery, suggestion, words, lastWord });

  // Check if this suggestion is a completion of the last word
  const isCompletion =
    lastWord &&
    suggestion.toLowerCase().startsWith(lastWord.toLowerCase()) &&
    suggestion.toLowerCase() !== lastWord.toLowerCase();

  console.log("Is completion:", isCompletion);

  // Check if it's a date keyword
  const isDateKeyword = categories.dateKeywords.some(
    (k) => k.toLowerCase() === suggestion.toLowerCase()
  );

  console.log("Is date keyword:", isDateKeyword);

  if (isDateKeyword) {
    let currentWords = [...words];

    // If it's a completion of the last word, replace the last word
    if (isCompletion) {
      currentWords[currentWords.length - 1] = suggestion;
      const result = currentWords.join(" ") + " ";
      console.log("Result (completion):", result);
      return result;
    }
  }

  return "fallback logic would apply here";
}

// Test the problematic case
console.log("=== Testing 'toda' + 'today' ===");
const result = applyNlpSuggestionLogic("toda", "today");
console.log("Final result:", result);

console.log("\n=== Testing 'buy eggs toda' + 'today' ===");
const result2 = applyNlpSuggestionLogic("buy eggs toda", "today");
console.log("Final result:", result2);
