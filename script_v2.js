/**
 * Advanced Calculator with History
 *
 * @author Ishan Verma
 * @version 3.2.0
 * @license MIT
 */

'use strict';

// Define helper functions globally for use in calculations
const factorial = (n) => {
    if (!Number.isInteger(n) || n < 0 || n > 170) return NaN;
    if (n <= 1) return 1;
    return n * factorial(n - 1);
};

// Define mathematical functions globally
const ln = Math.log;
const log = Math.log10;
const sin = (x) => Math.sin(x * Math.PI / 180);  // Convert degrees to radians
const cos = (x) => Math.cos(x * Math.PI / 180);  // Convert degrees to radians
const tan = (x) => Math.tan(x * Math.PI / 180);  // Convert degrees to radians
const sqrt = Math.sqrt;
const pow = Math.pow;

const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'calcTheme',
        HISTORY: 'calcHistory'
    },
    THEMES: {
        DARK: 'dark',
        LIGHT: 'light'
    },
    MAX_HISTORY_ITEMS: 50,
    DECIMAL_PRECISION: 10
};

class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.previousDisplay = document.getElementById('previousDisplay');
        this.historyContainer = document.getElementById('history');
        this.scientificButtons = document.getElementById('scientificButtons');
        this.themeToggle = document.getElementById('themeToggle');
        this.modeToggle = document.getElementById('modeToggle');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.helpBtn = document.getElementById('helpBtn');
        this.helpModal = document.getElementById('helpModal');
        this.closeModal = document.getElementById('closeModal');
        this.historyToggle = document.getElementById('historyToggle');
        this.historySection = document.getElementById('historySection');
        this.historyArrow = document.getElementById('historyArrow');

        this.currentInput = '';
        this.previousResult = '';
        this.isScientificMode = false;
        this.isDarkTheme = true;
        this.history = [];

        this.init();
    }

    init() {
        this.loadTheme();
        this.loadHistory();
        this.setupEventListeners();
        this.setupKeyboardSupport();
        this.updateDisplay();
    }

    setupEventListeners() {
        document.querySelectorAll('.btn-number').forEach(btn => {
            btn.addEventListener('click', () => this.handleNumber(btn.dataset.key));
        });

        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.addEventListener('click', () => this.handleOperator(btn.dataset.key));
        });

        document.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', () => this.handleAction(btn.dataset.key));
        });

        document.querySelectorAll('.btn-scientific').forEach(btn => {
            btn.addEventListener('click', () => this.handleScientific(btn.dataset.key));
        });

        document.querySelector('.btn-equals').addEventListener('click', () => this.calculate());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.modeToggle.addEventListener('click', () => this.toggleMode());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.helpBtn.addEventListener('click', () => this.showModal());
        this.closeModal.addEventListener('click', () => this.hideModal());
        this.historyToggle.addEventListener('click', () => this.toggleHistory());

        this.helpModal.addEventListener('click', e => {
            if (e.target === this.helpModal) this.hideModal();
        });

        // Handle manual input in the display field
        this.display.addEventListener('input', () => {
            this.currentInput = this.display.value;
        });

        this.display.addEventListener('focus', () => {
            // When focusing, if the display shows a result, clear it for new input
            if (this.previousResult && this.display.value === this.previousResult) {
                this.display.value = '';
                this.currentInput = '';
            }
        });

        this.display.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.calculate();
            }
        });
    }

    setupKeyboardSupport() {
        document.addEventListener('keydown', e => {
            // Check if display is focused
            const isDisplayFocused = document.activeElement === this.display;

            if (this.helpModal.classList.contains('flex')) {
                if (e.key === 'Escape') this.hideModal();
                return;
            }

            if (e.ctrlKey) {
                const key = e.key.toLowerCase();
                if (key === 't') {
                    e.preventDefault();
                    this.toggleTheme();
                } else if (key === 'm') {
                    e.preventDefault();
                    this.toggleMode();
                } else if (key === 'l') {
                    e.preventDefault();
                    this.clearHistory();
                }
                return;
            }

            // Handle Enter key always (for both focused and unfocused display)
            if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                this.calculate();
                return;
            }

            // When display is focused, allow normal editing (only handle Enter)
            if (isDisplayFocused) {
                return;
            }

            // When display is not focused, handle calculator shortcuts
            if (/^[0-9]$/.test(e.key)) {
                e.preventDefault();
                this.handleNumber(e.key);
            } else if (['+', '-', '*', '/', '%'].includes(e.key)) {
                e.preventDefault();
                this.handleOperator(e.key);
            } else if (['(', ')', '[', ']', '{', '}'].includes(e.key)) {
                e.preventDefault();
                this.handleBracket(e.key);
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                this.handleAction('backspace');
            } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
                e.preventDefault();
                this.handleAction('clear');
            } else if (e.key === '.') {
                e.preventDefault();
                this.handleNumber('.');
            }
        });
    }

    getCurrentNumber() {
        const tokenMatch = this.currentInput.match(/(?:^|[+\-*/%(])([0-9]*\.?[0-9]*)$/);
        return tokenMatch ? tokenMatch[1] : '';
    }

    handleNumber(key) {
        if (key === '.') {
            const currentNumber = this.getCurrentNumber();
            if (currentNumber.includes('.')) return;

            if (this.currentInput === '' || /[+\-*/%(\[{]$/.test(this.currentInput)) {
                this.currentInput += '0.';
                this.updateDisplay();
                return;
            }
        }

        // Implicit multiplication after a closing bracket, e.g. (2+3)5 -> (2+3)*5
        if (/[\)\]\}]$/.test(this.currentInput) && /[0-9.]/.test(key)) {
            this.currentInput += '*';
        }

        if (this.currentInput === '0' && key !== '.') {
            this.currentInput = key;
        } else {
            this.currentInput += key;
        }

        this.updateDisplay();
    }

    handleOperator(operator) {
        if (this.currentInput === '') {
            if (operator === '-') {
                this.currentInput = '-';
                this.updateDisplay();
            }
            return;
        }

        if (/[\+\-\*\/\%]$/.test(this.currentInput)) {
            this.currentInput = this.currentInput.slice(0, -1) + operator;
            this.updateDisplay();
            return;
        }

        // Do not leave an operator immediately after an opening bracket.
        if (/[\(\[\{]$/.test(this.currentInput)) {
            if (operator === '-') {
                this.currentInput += operator;
                this.updateDisplay();
            }
            return;
        }

        // Implicit multiplication: 2(3) and 2[3].
        if (/[\)\]\}]$/.test(this.currentInput)) {
            this.currentInput += operator;
        } else {
            this.currentInput += operator;
        }

        this.updateDisplay();
    }

    handleBracket(bracket) {
        const opening = ['(', '[', '{'];
        const closing = [')', ']', '}'];
        const pairs = { ')': '(', ']': '[', '}': '{' };

        if (opening.includes(bracket)) {
            // 2(3) and )(
            if (/[\d\)\]\}πe]$/.test(this.currentInput)) {
                this.currentInput += '*';
            }
            this.currentInput += bracket;
            this.updateDisplay();
            return;
        }

        if (closing.includes(bracket)) {
            if (!this.canCloseBracket(pairs[bracket])) return;

            // Prevent empty groups such as () or ( + ).
            if (/[\(\[\{+\-*/%]$/.test(this.currentInput)) return;

            this.currentInput += bracket;
            this.updateDisplay();
        }
    }

    canCloseBracket(openingBracket) {
        const stack = [];
        const pairs = { ')': '(', ']': '[', '}': '{' };

        for (const char of this.currentInput) {
            if (['(', '[', '{'].includes(char)) {
                stack.push(char);
            } else if ([')', ']', '}'].includes(char)) {
                if (!stack.length || stack.pop() !== pairs[char]) return false;
            }
        }

        return stack.includes(openingBracket);
    }

    handleAction(action) {
        if (action === 'clear') {
            this.currentInput = '';
            this.previousResult = '';
            this.previousDisplay.textContent = '';
            this.updateDisplay();
        } else if (action === 'backspace') {
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateDisplay();
        }
    }

    handleScientific(func) {
        const functionAppend = {
            sqrt: 'sqrt(',
            ln: 'ln(',
            log: 'log(',
            sin: 'sin(',
            cos: 'cos(',
            tan: 'tan(',
            square: '^2',
            cube: '^3',
            power: '^',
            '(': '(',
            ')': ')'
        };

        if (func === 'pi') {
            this.appendImplicitMultiplicationIfNeeded();
            this.currentInput += 'pi';
        } else if (func === 'e') {
            this.appendImplicitMultiplicationIfNeeded();
            this.currentInput += 'e';
        } else if (func === 'factorial') {
            this.currentInput += '!';
        } else if (func === '(' || func === ')') {
            this.handleBracket(func);
        } else if (functionAppend[func]) {
            // For power functions, remove trailing operator and add power
            if (func === 'square' || func === 'cube' || func === 'power') {
                if (/[\+\-\*\/\%]$/.test(this.currentInput)) {
                    this.currentInput = this.currentInput.slice(0, -1);
                }
                this.currentInput += functionAppend[func];
            } else {
                this.appendImplicitMultiplicationIfNeeded();
                this.currentInput += functionAppend[func];
            }
        }

        this.updateDisplay();
    }

    appendImplicitMultiplicationIfNeeded() {
        if (/[\d\)\]\}πe]$/.test(this.currentInput)) {
            this.currentInput += '*';
        }
    }

    calculate() {
        if (this.currentInput === '') return;

        try {
            console.log('Input:', this.currentInput);

            let expression = this.currentInput
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/\^/g, '**');

            console.log('After symbol replacement:', expression);

            if (/[\+\-\*\/\%]$/.test(expression)) {
                expression = expression.slice(0, -1);
            }

            // Normalize square/curly brackets to parentheses for JavaScript evaluation.
            expression = expression
                .replace(/\[/g, '(')
                .replace(/\]/g, ')')
                .replace(/\{/g, '(')
                .replace(/\}/g, ')');

            console.log('After bracket normalization:', expression);

            // Balance only missing closing brackets. Mismatched brackets are rejected.
            if (!this.bracketsAreBalanced(this.currentInput)) {
                throw new Error('Unbalanced brackets');
            }

            // Replace constants
            expression = expression
                .replace(/\bpi\b/gi, 'Math.PI')
                .replace(/\be\b/g, 'Math.E')
                .replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)');

            console.log('Final expression to eval:', expression);

            const result = eval(expression);

            console.log('Result:', result);

            if (!Number.isFinite(result)) throw new Error('Math error');

            const formattedResult = this.formatResult(result);
            this.previousDisplay.textContent = `${this.currentInput} =`;
            this.display.value = formattedResult;
            this.addToHistory(this.currentInput, formattedResult);

            this.previousResult = formattedResult;
            this.currentInput = formattedResult.toString();
        } catch (error) {
            console.error('Error:', error);
            this.showError();
        }
    }

    bracketsAreBalanced(input) {
        const stack = [];
        const pairs = { ')': '(', ']': '[', '}': '{' };

        for (const char of input) {
            if (['(', '[', '{'].includes(char)) {
                stack.push(char);
            } else if ([')', ']', '}'].includes(char)) {
                if (!stack.length || stack.pop() !== pairs[char]) return false;
            }
        }

        return stack.length === 0;
    }

    formatResult(num) {
        if (!Number.isFinite(num)) return 'Error';

        if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }

        return Math.round(num * 10 ** CONFIG.DECIMAL_PRECISION) / 10 ** CONFIG.DECIMAL_PRECISION;
    }

    updateDisplay() {
        // Only update display if it's not currently focused (to allow manual editing)
        if (document.activeElement !== this.display) {
            this.display.value = this.currentInput || '0';
        }
    }

    showError() {
        this.display.value = 'Error';
        this.currentInput = '';
        setTimeout(() => this.updateDisplay(), 1500);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        this.isDarkTheme = savedTheme === null || savedTheme === CONFIG.THEMES.DARK;
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
        localStorage.setItem(
            CONFIG.STORAGE_KEYS.THEME,
            this.isDarkTheme ? CONFIG.THEMES.DARK : CONFIG.THEMES.LIGHT
        );
    }

    applyTheme() {
        const html = document.documentElement;
        const body = document.body;

        if (this.isDarkTheme) {
            html.classList.add(CONFIG.THEMES.DARK);
            body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
            body.style.color = '#f1f5f9';
            this.themeToggle.textContent = '🌙 Dark';
            this.themeToggle.classList.remove('bg-yellow-600', 'hover:bg-yellow-700');
            this.themeToggle.classList.add('bg-blue-600', 'hover:bg-blue-700');
        } else {
            html.classList.remove(CONFIG.THEMES.DARK);
            body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)';
            body.style.color = '#1e293b';
            this.themeToggle.textContent = '☀️ Light';
            this.themeToggle.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            this.themeToggle.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
        }
    }

    toggleMode() {
        this.isScientificMode = !this.isScientificMode;
        this.scientificButtons.classList.toggle('hidden');
        this.modeToggle.textContent = this.isScientificMode ? 'Scientific' : 'Basic';
        this.modeToggle.classList.toggle('bg-green-600');
        this.modeToggle.classList.toggle('bg-blue-600');
    }

    loadHistory() {
        try {
            const savedHistory = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY);
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                this.renderHistory();
            }
        } catch {
            this.history = [];
        }
    }

    addToHistory(expression, result) {
        this.history.unshift({
            id: Date.now(),
            expression,
            result,
            timestamp: new Date().toLocaleTimeString()
        });

        if (this.history.length > CONFIG.MAX_HISTORY_ITEMS) {
            this.history = this.history.slice(0, CONFIG.MAX_HISTORY_ITEMS);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyContainer.innerHTML =
                '<p class="text-blue-300 text-center py-4">No calculations yet</p>';
            return;
        }

        this.historyContainer.innerHTML = '';

        this.history.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className =
                'bg-slate-600 hover:bg-slate-500 p-3 rounded-lg transition-colors cursor-pointer group flex justify-between items-center';

            historyElement.innerHTML = `
                <div class="flex-1">
                    <div class="font-mono text-sm font-semibold text-cyan-300"></div>
                    <div class="text-xs text-gray-400 mt-1"></div>
                </div>
                <button class="delete-btn opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-lg px-2" type="button" aria-label="Delete calculation">✕</button>
            `;

            historyElement.querySelector('.font-mono').textContent =
                `${item.expression} = ${item.result}`;
            historyElement.querySelector('.text-xs').textContent = item.timestamp;

            historyElement.addEventListener('click', e => {
                if (!e.target.classList.contains('delete-btn')) {
                    this.currentInput = item.expression;
                    this.updateDisplay();
                }
            });

            historyElement.querySelector('.delete-btn').addEventListener('click', e => {
                e.stopPropagation();
                this.deleteHistoryItem(item.id);
            });

            this.historyContainer.appendChild(historyElement);
        });
    }

    deleteHistoryItem(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveHistory();
        this.renderHistory();
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all calculation history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    saveHistory() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(this.history));
    }

    showModal() {
        this.helpModal.classList.remove('hidden');
        this.helpModal.classList.add('flex');
    }

    hideModal() {
        this.helpModal.classList.add('hidden');
        this.helpModal.classList.remove('flex');
    }

    toggleHistory() {
        this.historySection.classList.toggle('hidden');
        this.historyArrow.style.transform = this.historySection.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
}

document.addEventListener('DOMContentLoaded', () => new Calculator());
