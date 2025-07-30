const codeInput = document.getElementById("codeInput");
const highlightedCode = document.getElementById("highlightedCode");
const outputDiv = document.getElementById("output");

function syncHighlight() {
  const code = codeInput.innerText;
  highlightedCode.innerHTML = Prism.highlight(code, Prism.languages.c, "c");
}

// Sync scrolling
codeInput.addEventListener("scroll", () => {
  highlightedCode.scrollTop = codeInput.scrollTop;
  highlightedCode.scrollLeft = codeInput.scrollLeft;
});

// Sync typing
codeInput.addEventListener("input", syncHighlight);

// Initial load
window.onload = () => {
  const sampleCode = `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap arr[j] and arr[j+1]
        int temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`;
  codeInput.innerText = sampleCode;
  syncHighlight();
};

function analyzeCode() {
  const code = codeInput.innerText;
  outputDiv.textContent = "";

  if (!code.trim()) {
    outputDiv.textContent = "Please enter C code.";
    Prism.highlightElement(outputDiv);
    return;
  }

  const lines = code.split("\n");
  const steps = [];
  let loopCount = 0;
  let loopDepth = 0;
  let recursionDetected = false;
  let recursiveFuncName = "";
  let recursiveCalls = 0;
  let currentDepth = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("for") || trimmed.startsWith("while")) {
      loopCount++;
      currentDepth++;
      if (currentDepth > loopDepth) loopDepth = currentDepth;
    }
    if (trimmed === "}") currentDepth = Math.max(0, currentDepth - 1);
  });

  // Recursion detection
  const funcMatch = code.match(/(\w+)\s*\([^)]*\)\s*{([\s\S]*)}/);
  if (funcMatch) {
    recursiveFuncName = funcMatch[1];
    const recursiveMatches = (code.match(new RegExp(`${recursiveFuncName}\\s*\\(`, "g")) || []).length;
    if (recursiveMatches >= 2) {
      recursionDetected = true;
      recursiveCalls = recursiveMatches;
    }
  }

  // Detect binary search pattern
  const isBinarySearch =
    /while\s*\([^)]*<=?[^)]*\)/.test(code) &&
    /mid\s*=\s*\(?[^)]*low\s*\+\s*high[^)]*\)?/.test(code) &&
    /if\s*\([^)]*==[^)]*\)/.test(code) &&
    /else\s+if\s*\([^)]*</.test(code);

  // Detect linear search pattern
  const isLinearSearch =
    /for\s*\([^)]*i[^)]*<[^)]*n[^)]*\)/.test(code) &&
    /if\s*\([^)]*==[^)]*\)/.test(code);

  steps.push(`🔍 Code Analysis Started`);

  if (loopCount > 0) {
    steps.push(`\n➡️ Detected ${loopCount} loop(s)`);
    steps.push(`➡️ Loop nesting level: ${loopDepth}`);

    if (isBinarySearch) {
      steps.push(`\n🔎 Detected pattern of Binary Search`);
      steps.push(`➡️ Time Complexity: O(log n)`);
      steps.push(`\nT(n) = C1 + C2·log₂(n)`);
    } else if (isLinearSearch) {
      steps.push(`\n🔎 Detected pattern of Linear Search`);
      steps.push(`➡️ Time Complexity: O(n)`);
      steps.push(`\nT(n) = C1 + C2·n`);
    } else {
      if (loopDepth === 1) {
        steps.push(`➡️ Time Complexity: O(n)`);
        steps.push(`\nT(n) = C1 + C2·n`);
      } else if (loopDepth === 2) {
        steps.push(`➡️ Time Complexity: O(n²)`);
        steps.push(`\nT(n) = C1 + C2·n + C3·n²`);
      } else {
        steps.push(`➡️ Time Complexity: O(n^${loopDepth})`);
        steps.push(`\nT(n) = C1 + C2·n + ... + C${loopDepth + 1}·n^${loopDepth}`);
      }
    }
  } else {
    steps.push(`\n❌ No loops detected`);
  }

  if (recursionDetected) {
    steps.push(`\n🔁 Recursive function detected: ${recursiveFuncName}`);
    steps.push(`➡️ Recursive calls: ${recursiveCalls}`);
    steps.push(`➡️ Assuming divide-and-conquer form: T(n) = a·T(n/b) + f(n)`);

    const a = recursiveCalls;
    const b = 2;
    const f = "n";
    steps.push(`\nStep 1: T(n) = ${a}·T(n/${b}) + C·${f}`);
    const logba = Math.log(a) / Math.log(b);
    steps.push(`Step 2: log_b(a) = log_${b}(${a}) = ${logba.toFixed(2)}`);
    steps.push(`Step 3: Compare f(n) = Θ(${f}) to n^log_b(a) = Θ(n^${logba.toFixed(2)})`);

    if (Math.abs(logba - 1) < 0.01) {
      steps.push(`→ Case 2: f(n) = Θ(n^log_b(a)) ⇒ T(n) = Θ(n log n)`);
      steps.push(`\n🟢 Final Time Complexity: O(n log n)`);
    } else if (logba > 1) {
      steps.push(`→ Case 1: T(n) = Θ(n^${logba.toFixed(2)})`);
    } else {
      steps.push(`→ Case 3: T(n) = Θ(n)`);
    }
  }

  // Linear Search Detection (redundant with above but kept as extra)
  if (isLinearSearch) {
    steps.push(`\n🔎 Detected pattern of Linear Search`);
    steps.push(`➡️ Time Complexity: O(n)`);
    steps.push(`\nT(n) = C1 + C2·n`);
  }

  // Binary Search Detection (redundant but kept for safety)
  if (isBinarySearch) {
    steps.push(`\n🔎 Detected pattern of Binary Search`);
    steps.push(`➡️ Time Complexity: O(log n)`);
    steps.push(`\nT(n) = C1 + C2·log₂(n)`);
  }

  if (loopCount === 0 && !recursionDetected) {
    steps.push(`\n📦 No loops or recursion detected → O(1)`);
    steps.push(`T(n) = C1`);
  }

  outputDiv.textContent = steps.join("\n");
  Prism.highlightElement(outputDiv);
}
