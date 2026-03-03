// QuickJava - REAL Online Java Compiler
// Uses JDoodle API for actual Java compilation

let codeEditor;
let isCompiling = false;
let dailyUsageCount = 0;
const DAILY_LIMIT = 20; // JDoodle free tier limit

// DOM Elements
const outputDiv = document.getElementById('output');
const lineCountSpan = document.getElementById('lineCount');
const fileInput = document.getElementById('fileInput');

// Initialize CodeMirror Editor
function initializeCodeMirror() {
    codeEditor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
        mode: 'text/x-java',
        theme: 'dracula',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true,
        gutters: ["CodeMirror-lint-markers"],
        extraKeys: {
            "Ctrl-Enter": function() { runCode(); },
            "Ctrl-S": function() { saveCode(); },
            "Ctrl-O": function() { openFile(); },
            "Tab": function(cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection('add');
                } else {
                    cm.replaceSelection('    ', 'end');
                }
            }
        }
    });

    // Set initial content
    setDefaultCode();
    
    // Update line count
    updateLineCount();
    
    // Load saved code
    loadSavedCode();
    
    // Load daily usage from localStorage
    loadDailyUsage();
    
    // Add input section
    addInputSection();
    
    console.log('🚀 Real Java Compiler Initialized with JDoodle API');
    updateUsageDisplay();
    showStatus('Ready - Connected to JDoodle (20 compilations/day)', 'info');
}

// Load daily usage from localStorage
function loadDailyUsage() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('quickjava_usage');
    
    if (saved) {
        const usage = JSON.parse(saved);
        if (usage.date === today) {
            dailyUsageCount = usage.count;
        } else {
            // Reset for new day
            dailyUsageCount = 0;
            localStorage.setItem('quickjava_usage', JSON.stringify({
                date: today,
                count: 0
            }));
        }
    }
}

// Update usage display
function updateUsageDisplay() {
    const remaining = DAILY_LIMIT - dailyUsageCount;
    const usageElement = document.getElementById('dailyUsage');
    if (usageElement) {
        usageElement.textContent = `${remaining}/${DAILY_LIMIT}`;
        
        if (remaining <= 5) {
            usageElement.style.color = '#f87171';
        } else if (remaining <= 10) {
            usageElement.style.color = '#fbbf24';
        } else {
            usageElement.style.color = '#34d399';
        }
    }
}

// Increment usage count
function incrementUsage() {
    dailyUsageCount++;
    const today = new Date().toDateString();
    localStorage.setItem('quickjava_usage', JSON.stringify({
        date: today,
        count: dailyUsageCount
    }));
    updateUsageDisplay();
}

// Add input section for STDIN
function addInputSection() {
    const outputContainer = document.querySelector('.output-container');
    const inputSection = document.createElement('div');
    inputSection.className = 'input-section';
    inputSection.innerHTML = `
        <div class="input-label">
            <i class="fas fa-keyboard"></i>
            <span>Program Input (stdin):</span>
            <span style="margin-left: auto; font-size: 12px;" id="dailyUsage"></span>
        </div>
        <textarea id="programInput" placeholder="Enter input for your program here..."></textarea>
    `;
    outputContainer.appendChild(inputSection);
}

// Set default code
function setDefaultCode() {
    const defaultCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 QuickJava - Real Online Compiler");
        System.out.println("====================================");
        System.out.println("Using JDoodle API for compilation");
        System.out.println("Daily limit: 20 compilations");
        
        // Get user input
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("\\nEnter your name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        
        System.out.println("\\n📋 Program Output:");
        System.out.println("Hello, " + name + "!");
        System.out.println("You are " + age + " years old.");
        
        // Calculate birth year
        int currentYear = java.time.Year.now().getValue();
        int birthYear = currentYear - age;
        System.out.println("You were born in approximately " + birthYear);
        
        // Loop example
        System.out.println("\\n🔁 Counting to 5:");
        for(int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
        
        scanner.close();
    }
}`;
    
    codeEditor.setValue(defaultCode);
    updateLineCount();
}

// REAL Java Execution using JDoodle API
async function runCode() {
    if (isCompiling) {
        showOutput('🔄 Please wait, compilation in progress...', 'warning');
        return;
    }
    
    // Check daily limit
    if (dailyUsageCount >= DAILY_LIMIT) {
        showOutput(`❌ Daily compilation limit (${DAILY_LIMIT}) reached!\n\nPlease try again tomorrow.`, 'error');
        showStatus('Daily limit reached', 'error');
        return;
    }
    
    const code = codeEditor.getValue().trim();
    
    if (!code) {
        showOutput('❌ Error: No code to execute!', 'error');
        return;
    }
    
    // Validate class name
    if (!code.includes('public class Main')) {
        showOutput('⚠️ Warning: Class name should be "Main" for proper compilation.\nUsing "Main" as class name.', 'warning');
    }
    
    isCompiling = true;
    showCompilingStatus();
    
    // Clear previous output
    showOutput('⏳ Connecting to JDoodle compilation service...\n', 'info');
    
    // Get program input
    const programInput = document.getElementById('programInput')?.value || '';
    
    try {
        // Call our serverless API
        const response = await fetch('/api/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                stdin: programInput
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Increment usage count on successful API call
            incrementUsage();
            
            if (result.success === false || result.error) {
                // Compilation error
                const errorOutput = result.output || result.error || 'Compilation failed';
                showOutput(formatErrorOutput(errorOutput, result), 'error');
                showStatus('Compilation failed', 'error');
            } else {
                // Successful execution
                const output = result.output || 'Program executed successfully (no output)';
                const memoryInfo = result.memory ? `\n📊 Memory used: ${result.memory} KB` : '';
                const timeInfo = result.cpuTime ? `\n⏱️ CPU Time: ${result.cpuTime} sec` : '';
                
                showOutput(formatOutput(output, memoryInfo + timeInfo), 'success');
                showStatus('Execution completed', 'success');
                saveCode();
            }
        } else {
            // API error
            showOutput(`❌ Server Error:\n${result.error || 'Unknown error'}`, 'error');
            showStatus('Compilation service error', 'error');
        }
    } catch (error) {
        console.error('Compilation error:', error);
        showOutput(`❌ Network Error:\n${error.message}\n\nPlease check your internet connection and try again.`, 'error');
        showStatus('Connection failed', 'error');
    } finally {
        isCompiling = false;
    }
}

// Format output with nice headers
function formatOutput(output, extraInfo = '') {
    const timestamp = new Date().toLocaleTimeString();
    const remaining = DAILY_LIMIT - dailyUsageCount;
    
    return `════════════════════════════════════════\n` +
           `📤 PROGRAM OUTPUT (${timestamp})\n` +
           `════════════════════════════════════════\n\n` +
           output +
           `\n\n════════════════════════════════════════\n` +
           `✅ EXECUTION COMPLETED SUCCESSFULLY\n` +
           `📊 Remaining compilations today: ${remaining}/${DAILY_LIMIT}${extraInfo}\n` +
           `════════════════════════════════════════`;
}

// Format error output
function formatErrorOutput(error, result) {
    const timestamp = new Date().toLocaleTimeString();
    const remaining = DAILY_LIMIT - dailyUsageCount;
    
    // Try to extract meaningful error message
    let errorMessage = error;
    if (error.includes('error:')) {
        // Extract Java compilation error
        const lines = error.split('\n');
        const errorLines = lines.filter(line => 
            line.includes('error:') || 
            line.includes('Main.java:') ||
            line.includes('^')
        );
        if (errorLines.length > 0) {
            errorMessage = errorLines.join('\n');
        }
    }
    
    return `════════════════════════════════════════\n` +
           `❌ COMPILATION ERROR (${timestamp})\n` +
           `════════════════════════════════════════\n\n` +
           errorMessage +
           `\n\n════════════════════════════════════════\n` +
           `⚠️ COMPILATION FAILED\n` +
           `📊 Remaining compilations today: ${remaining}/${DAILY_LIMIT}\n` +
           `════════════════════════════════════════`;
}

// Show compiling status with spinner
function showCompilingStatus() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status span:last-child');
    
    statusDot.style.animation = 'none';
    statusDot.style.backgroundColor = '#f59e0b';
    
    // Add spinner if not exists
    let spinner = document.querySelector('.spinner');
    if (!spinner) {
        spinner = document.createElement('span');
        spinner.className = 'spinner';
        statusText.parentElement.insertBefore(spinner, statusText);
    }
    
    statusText.textContent = `Compiling... (${dailyUsageCount + 1}/${DAILY_LIMIT})`;
}

// Show output in panel
function showOutput(message, type = 'info') {
    const placeholder = outputDiv.querySelector('.output-placeholder');
    if (placeholder) {
        outputDiv.innerHTML = '';
    }
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    const header = `⏰ ${timeStr} | ${type.toUpperCase()}\n`;
    const fullMessage = header + message;
    
    outputDiv.style.color = {
        'error': '#f87171',
        'warning': '#fbbf24',
        'success': '#34d399',
        'info': '#60a5fa'
    }[type] || '#d1d5db';
    
    outputDiv.textContent = fullMessage;
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Show status
function showStatus(message, type = 'info') {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status span:last-child');
    const spinner = document.querySelector('.spinner');
    
    if (spinner) {
        spinner.remove();
    }
    
    const colors = {
        'error': '#ef4444',
        'warning': '#f59e0b',
        'success': '#10b981',
        'info': '#3b82f6'
    };
    
    statusDot.style.animation = 'pulse 2s infinite';
    statusDot.style.backgroundColor = colors[type] || colors.info;
    statusText.textContent = message;
    
    if (type === 'info') {
        setTimeout(() => {
            if (statusText.textContent === message && !isCompiling) {
                statusDot.style.backgroundColor = '#10b981';
                statusText.textContent = 'Ready';
            }
        }, 3000);
    }
}

// Update line count
function updateLineCount() {
    const lineCount = codeEditor.lineCount();
    lineCountSpan.textContent = lineCount;
    
    if (lineCount > 100) {
        lineCountSpan.style.color = '#f87171';
    } else if (lineCount > 50) {
        lineCountSpan.style.color = '#fbbf24';
    } else {
        lineCountSpan.style.color = '#34d399';
    }
}

// Load examples
function loadExample(type) {
    const examples = {
        'basic': `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java Programming!");
        
        // Variables
        int x = 10;
        int y = 20;
        int sum = x + y;
        System.out.println("Sum of " + x + " and " + y + " = " + sum);
    }
}`,
        
        'loops': `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Loop Examples ===\\n");
        
        // For loop
        System.out.println("For Loop (1 to 10):");
        for(int i = 1; i <= 10; i++) {
            System.out.print(i + " ");
        }
        
        System.out.println("\\n\\nWhile Loop (10 to 1):");
        int j = 10;
        while(j > 0) {
            System.out.print(j + " ");
            j--;
        }
        
        System.out.println("\\n\\nDo-While Loop (1 to 5):");
        int k = 1;
        do {
            System.out.print(k + " ");
            k++;
        } while(k <= 5);
        
        System.out.println();
    }
}`,
        
        'calculator': `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=== Simple Calculator ===\\n");
        
        System.out.print("Enter first number: ");
        double num1 = scanner.nextDouble();
        
        System.out.print("Enter second number: ");
        double num2 = scanner.nextDouble();
        
        System.out.println("\\nResults:");
        System.out.println(num1 + " + " + num2 + " = " + (num1 + num2));
        System.out.println(num1 + " - " + num2 + " = " + (num1 - num2));
        System.out.println(num1 + " * " + num2 + " = " + (num1 * num2));
        
        if(num2 != 0) {
            System.out.println(num1 + " / " + num2 + " = " + (num1 / num2));
            System.out.println(num1 + " % " + num2 + " = " + (num1 % num2));
        } else {
            System.out.println("Division by zero is not allowed");
        }
        
        scanner.close();
    }
}`,
        
        'patterns': `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Star Patterns ===\\n");
        
        // Pattern 1: Right Triangle
        System.out.println("Pattern 1: Right Triangle");
        for(int i = 1; i <= 5; i++) {
            for(int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        
        // Pattern 2: Inverted Triangle
        System.out.println("\\nPattern 2: Inverted Triangle");
        for(int i = 5; i >= 1; i--) {
            for(int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        
        // Pattern 3: Pyramid
        System.out.println("\\nPattern 3: Pyramid");
        int rows = 5;
        for(int i = 1; i <= rows; i++) {
            // Print spaces
            for(int j = rows; j > i; j--) {
                System.out.print(" ");
            }
            // Print stars
            for(int k = 1; k <= (2*i - 1); k++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`,
        
        'arrays': `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Array Operations ===\\n");
        
        // Create and initialize array
        int[] numbers = {45, 23, 67, 89, 12, 34, 78, 56};
        
        System.out.println("Original array: " + Arrays.toString(numbers));
        
        // Find maximum
        int max = numbers[0];
        for(int i = 1; i < numbers.length; i++) {
            if(numbers[i] > max) {
                max = numbers[i];
            }
        }
        System.out.println("Maximum value: " + max);
        
        // Find minimum
        int min = numbers[0];
        for(int i = 1; i < numbers.length; i++) {
            if(numbers[i] < min) {
                min = numbers[i];
            }
        }
        System.out.println("Minimum value: " + min);
        
        // Calculate sum and average
        int sum = 0;
        for(int num : numbers) {
            sum += num;
        }
        double average = (double) sum / numbers.length;
        
        System.out.println("Sum: " + sum);
        System.out.println("Average: " + String.format("%.2f", average));
        
        // Sort array
        Arrays.sort(numbers);
        System.out.println("Sorted array: " + Arrays.toString(numbers));
    }
}`,
        
        'fibonacci': `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=== Fibonacci Series ===\\n");
        
        System.out.print("Enter the number of terms: ");
        int n = scanner.nextInt();
        
        System.out.println("\\nFibonacci Series up to " + n + " terms:");
        
        int first = 0, second = 1;
        
        for(int i = 1; i <= n; i++) {
            System.out.print(first + " ");
            
            int next = first + second;
            first = second;
            second = next;
        }
        
        System.out.println("\\n\\n=== Using Recursion ===");
        System.out.println("Fibonacci of " + n + " = " + fibonacci(n));
        
        scanner.close();
    }
    
    public static int fibonacci(int n) {
        if(n <= 1) {
            return n;
        }
        return fibonacci(n-1) + fibonacci(n-2);
    }
}`,
        
        'factorial': `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=== Factorial Calculator ===\\n");
        
        System.out.print("Enter a number: ");
        int num = scanner.nextInt();
        
        if(num < 0) {
            System.out.println("Factorial is not defined for negative numbers.");
        } else {
            // Using loop
            long factorial = 1;
            for(int i = 1; i <= num; i++) {
                factorial *= i;
            }
            System.out.println("Factorial of " + num + " (using loop): " + factorial);
            
            // Using recursion
            System.out.println("Factorial of " + num + " (using recursion): " + factorialRecursive(num));
        }
        
        scanner.close();
    }
    
    public static long factorialRecursive(int n) {
        if(n <= 1) {
            return 1;
        }
        return n * factorialRecursive(n - 1);
    }
}`,
        
        'sorting': `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Sorting Algorithms ===\\n");
        
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        
        System.out.println("Original array: " + Arrays.toString(arr));
        
        // Bubble Sort
        int[] bubbleArr = arr.clone();
        bubbleSort(bubbleArr);
        System.out.println("Bubble Sort: " + Arrays.toString(bubbleArr));
        
        // Selection Sort
        int[] selectionArr = arr.clone();
        selectionSort(selectionArr);
        System.out.println("Selection Sort: " + Arrays.toString(selectionArr));
        
        // Insertion Sort
        int[] insertionArr = arr.clone();
        insertionSort(insertionArr);
        System.out.println("Insertion Sort: " + Arrays.toString(insertionArr));
    }
    
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for(int i = 0; i < n-1; i++) {
            for(int j = 0; j < n-i-1; j++) {
                if(arr[j] > arr[j+1]) {
                    // Swap
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
    }
    
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for(int i = 0; i < n-1; i++) {
            int minIdx = i;
            for(int j = i+1; j < n; j++) {
                if(arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }
    
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for(int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i-1;
            while(j >= 0 && arr[j] > key) {
                arr[j+1] = arr[j];
                j--;
            }
            arr[j+1] = key;
        }
    }
}`,
        
        'college': `import java.util.*;

class Student {
    String name;
    int rollNo;
    double[] marks;
    
    Student(String name, int rollNo, double[] marks) {
        this.name = name;
        this.rollNo = rollNo;
        this.marks = marks;
    }
    
    double calculatePercentage() {
        double total = 0;
        for(double mark : marks) {
            total += mark;
        }
        return (total / marks.length);
    }
    
    char calculateGrade() {
        double percentage = calculatePercentage();
        if(percentage >= 90) return 'A';
        else if(percentage >= 80) return 'B';
        else if(percentage >= 70) return 'C';
        else if(percentage >= 60) return 'D';
        else return 'F';
    }
    
    void displayResult() {
        System.out.println("\\n=== Student Result ===");
        System.out.println("Name: " + name);
        System.out.println("Roll No: " + rollNo);
        System.out.println("Marks: " + Arrays.toString(marks));
        System.out.println("Percentage: " + String.format("%.2f", calculatePercentage()) + "%");
        System.out.println("Grade: " + calculateGrade());
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("=== College Management System ===\\n");
        
        // Create students
        List<Student> students = new ArrayList<>();
        
        students.add(new Student("Alice", 101, new double[]{85, 90, 88, 92, 86}));
        students.add(new Student("Bob", 102, new double[]{75, 80, 78, 82, 79}));
        students.add(new Student("Charlie", 103, new double[]{95, 92, 94, 96, 93}));
        
        // Display all results
        for(Student s : students) {
            s.displayResult();
        }
        
        // Find topper
        Student topper = students.get(0);
        for(Student s : students) {
            if(s.calculatePercentage() > topper.calculatePercentage()) {
                topper = s;
            }
        }
        
        System.out.println("\\n=== Class Statistics ===");
        System.out.println("🎓 Class Topper: " + topper.name + " with " + 
                          String.format("%.2f", topper.calculatePercentage()) + "%");
        
        // Calculate class average
        double totalPercentage = 0;
        for(Student s : students) {
            totalPercentage += s.calculatePercentage();
        }
        double classAverage = totalPercentage / students.size();
        System.out.println("📊 Class Average: " + String.format("%.2f", classAverage) + "%");
    }
}`
    };
    
    if (examples[type]) {
        codeEditor.setValue(examples[type]);
        updateLineCount();
        showOutput(`📋 Loaded example: ${type.charAt(0).toUpperCase() + type.slice(1)}\nClick "Run Code" to execute.`, 'success');
        showStatus('Example loaded', 'success');
    }
}

// Clear code
function clearCode() {
    if (codeEditor.getValue().trim() === '') return;
    
    if (confirm('🗑️ Clear all code?\nThis action cannot be undone.')) {
        codeEditor.setValue('');
        updateLineCount();
        showOutput('📝 Editor cleared successfully\nReady for new code...', 'info');
        showStatus('Editor cleared', 'info');
        localStorage.removeItem('quickjava_code');
    }
}

// Clear output
function clearOutput() {
    outputDiv.innerHTML = `<div class="output-placeholder">
// 🚀 Welcome to QuickJava - Real Online Java Compiler!
// ===================================================
//
// Using JDoodle API with 20 compilations/day
//
// Features:
// • Real Java compilation
// • Full JDK support
// • Input handling (stdin)
// • Multiple examples
// • Daily usage tracking
//
// Click "Run Code" or press Ctrl+Enter to start
</div>`;
    outputDiv.style.color = '#64748b';
    
    // Clear input as well
    const inputArea = document.getElementById('programInput');
    if (inputArea) {
        inputArea.value = '';
    }
    
    showStatus('Output cleared', 'info');
}

// Save code
function saveCode() {
    try {
        const code = codeEditor.getValue();
        localStorage.setItem('quickjava_code', code);
        showStatus('Code saved', 'success');
        setTimeout(() => showStatus('Ready', 'info'), 2000);
        return true;
    } catch (e) {
        console.warn('Save failed:', e);
        return false;
    }
}

// Load saved code
function loadSavedCode() {
    try {
        const savedCode = localStorage.getItem('quickjava_code');
        if (savedCode && savedCode.trim() !== '') {
            codeEditor.setValue(savedCode);
            updateLineCount();
            showStatus('Previous code loaded', 'success');
        }
    } catch (e) {
        console.warn('Load failed:', e);
    }
}

// Export code
function exportCode() {
    const code = codeEditor.getValue();
    if (!code.trim()) {
        showOutput('❌ No code to export!', 'error');
        return;
    }
    
    const blob = new Blob([code], { type: 'text/x-java' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Main.java';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showOutput('📁 Code exported as Main.java', 'success');
    showStatus('Code exported', 'success');
}

// Open file
function openFile() {
    fileInput.click();
}

// Handle file import
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        codeEditor.setValue(e.target.result);
        updateLineCount();
        showOutput(`📂 File "${file.name}" imported`, 'success');
        showStatus('File imported', 'success');
    };
    reader.readAsText(file);
    
    fileInput.value = '';
});

// Initialize
document.addEventListener('DOMContentLoaded', initializeCodeMirror);

// Global functions
window.runCode = runCode;
window.clearCode = clearCode;
window.clearOutput = clearOutput;
window.loadExample = loadExample;
window.exportCode = exportCode;
window.openFile = openFile;

console.log('🚀 QuickJava Real Compiler v4.0 Loaded with JDoodle API');