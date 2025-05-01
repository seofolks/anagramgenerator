// Dictionary of common English words for anagrams
const dictionary = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", 
    "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", 
    "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", 
    "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", 
    "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", 
    "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", 
    "new", "want", "because", "any", "these", "give", "day", "most", "us", "is", "am", "are", "was", "were", "been",
    // Words related to common input examples
    "planet", "plane", "panel", "pant", "plan", "tale", "neat", "late", "ate", "tea", "eat", "help", "hello", "hole", "hell",
    "pale", "leap", "peal", "plea", "pal", "lap", "nap", "planet", "tale", "pelt", "peal", "pleat", "plate", "plea", "pale", 
    "pane", "panel", "steal", "stale", "slate", "least", "pelt", "pet", "tap", "pat", "apt", "net", "ten", "tan", "ant", 
    "ate", "eat", "tea", "pea", "ape", "nap", "pan", "pal", "lap", "let", "lent", "lean"
];

// Create dictionary lookup set for efficient word checking
const dictionarySet = new Set(dictionary);

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const inputElement = document.getElementById('anagram-input');
    const generateButton = document.getElementById('generate-anagram-btn');
    const clearButton = document.getElementById('clear-anagram-btn');
    const minLengthSelect = document.getElementById('anagram-min-length');
    const maxResultsSelect = document.getElementById('anagram-max-results');
    const resultsContainer = document.getElementById('anagram-results');
    const infoContainer = document.getElementById('anagram-info');
    const loadingIndicator = document.getElementById('anagram-loading');
    
    // Event listeners
    generateButton.addEventListener('click', generateAnagrams);
    clearButton.addEventListener('click', clearResults);
    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateAnagrams();
        }
    });
    
    /**
     * Generate anagrams from the input text
     */
    function generateAnagrams() {
        const inputText = inputElement.value.trim().toLowerCase();
        const minLength = parseInt(minLengthSelect.value, 10);
        const maxResults = parseInt(maxResultsSelect.value, 10);
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        infoContainer.style.display = 'none';
        
        // Validate input
        if (!inputText) {
            showError('Please enter a word or phrase.');
            return;
        }
        
        // Remove non-alphabetic characters
        const cleanInput = inputText.replace(/[^a-z]/gi, '');
        
        if (cleanInput.length === 0) {
            showError('Please enter at least one letter.');
            return;
        }
        
        if (cleanInput.length > 10) {
            showError('For performance reasons, please limit your input to 10 letters or less.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        // Generate anagrams asynchronously to avoid blocking the UI
        setTimeout(() => {
            try {
                const anagrams = findAnagrams(cleanInput, minLength, maxResults);
                displayResults(anagrams, cleanInput);
            } catch (error) {
                showError('An error occurred while generating anagrams: ' + error.message);
            } finally {
                loadingIndicator.style.display = 'none';
            }
        }, 50);
    }
    
    /**
     * Find all possible anagrams of the input text
     */
    function findAnagrams(input, minLength, maxResults) {
        const results = new Set();
        
        // Convert input to character frequency map
        const chars = input.split('').sort();
        
        function generateCombinations(prefix, remainingChars, startIndex) {
            // If the current prefix is a valid word, add it to results
            if (prefix.length >= minLength && dictionarySet.has(prefix)) {
                results.add(prefix);
                
                // Stop if we've reached the maximum number of results
                if (results.size >= maxResults) {
                    return;
                }
            }
            
            // Stop if we've used all characters or reached the limit
            if (startIndex >= remainingChars.length || prefix.length >= input.length) {
                return;
            }
            
            // Try adding each remaining character
            for (let i = 0; i < remainingChars.length; i++) {
                // Skip used characters or duplicates
                if (remainingChars[i] === null) continue;
                if (i > 0 && remainingChars[i] === remainingChars[i-1] && remainingChars[i-1] !== null) continue;
                
                // Use this character
                const char = remainingChars[i];
                remainingChars[i] = null;
                
                // Recurse with the new prefix
                generateCombinations(prefix + char, remainingChars, 0);
                
                // Restore the character for backtracking
                remainingChars[i] = char;
            }
        }
        
        // Start with an empty prefix
        generateCombinations('', chars, 0);
        
        return Array.from(results).slice(0, maxResults);
    }
    
    /**
     * Display anagram results in the UI
     */
    function displayResults(anagrams, originalInput) {
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Show info about results
        infoContainer.textContent = `Found ${anagrams.length} anagrams for "${originalInput}"`;
        infoContainer.style.display = 'block';
        
        if (anagrams.length === 0) {
            resultsContainer.innerHTML = '<div class="anagram-empty-state">No anagrams found. Try a different word or adjust the minimum length.</div>';
            return;
        }
        
        // Sort anagrams by length (descending) and then alphabetically
        anagrams.sort((a, b) => {
            if (a.length !== b.length) return b.length - a.length;
            return a.localeCompare(b);
        });
        
        // Add each anagram to the results container
        anagrams.forEach(anagram => {
            const anagramElement = document.createElement('span');
            anagramElement.className = 'anagram-word';
            anagramElement.textContent = anagram;
            resultsContainer.appendChild(anagramElement);
        });
    }
    
    /**
     * Show an error message in the results container
     */
    function showError(message) {
        resultsContainer.innerHTML = `<div class="anagram-error">${message}</div>`;
    }
    
    /**
     * Clear all results and reset the form
     */
    function clearResults() {
        inputElement.value = '';
        resultsContainer.innerHTML = '';
        infoContainer.style.display = 'none';
        inputElement.focus();
    }
    
    // Initialize with an empty state
    resultsContainer.innerHTML = '<div class="anagram-empty-state">Enter a word or phrase and click "Generate Anagrams" to begin.</div>';
});
