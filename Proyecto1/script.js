// VARIABLES GLOBALES 
let matrixA = [];
let matrixB = [];
let isProcessing = false;

const generateAButton = document.getElementById('generateA');
const generateBButton = document.getElementById('generateB');
const randomExampleButton = document.getElementById('randomExample');
const runTestsButton = document.getElementById('runTests');
const statusMessage = document.getElementById('statusMessage');
const resultsContainer = document.getElementById('resultsContainer');
const testResults = document.getElementById('testResults');
const verificationMessage = document.getElementById('verificationMessage');

const operationButtons = document.querySelectorAll('.operation-btn');

document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
});

function initializeCalculator() {
    updateStatus('Calculadora lista - Configura las matrices para comenzar', 'success');
    setupEventListeners();
    generateMatrix('A');
    generateMatrix('B');
}

function setupEventListeners() {
    generateAButton.addEventListener('click', () => generateMatrix('A'));
    generateBButton.addEventListener('click', () => generateMatrix('B'));
    
    randomExampleButton.addEventListener('click', generateRandomExample);

    runTestsButton.addEventListener('click', runAutomatedTests);

    operationButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isProcessing) return;
            const operation = this.getAttribute('data-operation');
            performOperation(operation);
        });
    });
}

function updateStatus(message, type = 'info') {
    if (!statusMessage) return;
    
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}-message`;
}

function generateMatrix(matrix) {
    if (isProcessing) return;
    
    const sizeInput = document.getElementById(`size${matrix}`);
    const size = parseInt(sizeInput.value);
    const container = document.getElementById(`matrix${matrix}Container`);

    if (size < 2 || size > 10) {
        showError(`El tamaño de la matriz debe estar entre 2 y 10. Valor ingresado: ${size}`);
        return;
    }
    
    showLoading(true);

    setTimeout(() => {
        let html = `<table class="matrix-table" id="table${matrix}">`;
        for (let i = 0; i < size; i++) {
            html += '<tr>';
            for (let j = 0; j < size; j++) {
                const value = i === j ? 1 : 0;
                html += `
                    <td>
                        <input type="number" 
                               id="cell${matrix}${i}${j}" 
                               value="${value}"
                               data-row="${i}"
                               data-col="${j}"
                               placeholder="0">
                    </td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        
        container.innerHTML = html;
        updateMatrixFromInputs(matrix);
        showLoading(false);
        
        updateStatus(`Matriz ${matrix} generada (${size}×${size})`, 'success');
    }, 300);
}

function updateMatrixFromInputs(matrix) {
    const sizeInput = document.getElementById(`size${matrix}`);
    const size = parseInt(sizeInput.value);
    const matrixData = [];
    let hasError = false;
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            const input = document.getElementById(`cell${matrix}${i}${j}`);
            const value = parseFloat(input.value);
            
            if (isNaN(value)) {
                input.style.borderColor = 'var(--error-color)';
                hasError = true;
                row.push(0);
            } else {
                input.style.borderColor = '';
                row.push(value);
            }
        }
        matrixData.push(row);
    }
    
    if (matrix === 'A') {
        matrixA = matrixData;
    } else {
        matrixB = matrixData;
    }
    
    return !hasError;
}

function generateRandomExample() {
    if (!updateMatrixFromInputs('A') || !updateMatrixFromInputs('B')) {
        showError('Por favor, corrige los valores inválidos (en rojo) antes de generar ejemplos');
        return;
    }
    
    const sizeA = parseInt(document.getElementById('sizeA').value);
    const sizeB = parseInt(document.getElementById('sizeB').value);
    
    for (let i = 0; i < sizeA; i++) {
        for (let j = 0; j < sizeA; j++) {
            const input = document.getElementById(`cellA${i}${j}`);
            input.value = (Math.random() * 18 - 9).toFixed(1); // -9 a 9 con 1 decimal
        }
    }
    
    for (let i = 0; i < sizeB; i++) {
        for (let j = 0; j < sizeB; j++) {
            const input = document.getElementById(`cellB${i}${j}`);
            input.value = (Math.random() * 18 - 9).toFixed(1);
        }
    }
    
    updateMatrixFromInputs('A');
    updateMatrixFromInputs('B');
    updateStatus('Ejemplo aleatorio generado', 'success');
}

function performOperation(operation) {
    if (isProcessing) return;
    
    // Validar inputs antes de operar
    if (!updateMatrixFromInputs('A') || !updateMatrixFromInputs('B')) {
        showError('Por favor, corrige todos los valores inválidos (en rojo) antes de continuar');
        return;
    }
    
    isProcessing = true;
    showLoading(true);
    
    setTimeout(() => {
        try {
            let result;
            const operationNames = {
                'add': 'Suma (A + B)',
                'subtractAB': 'Resta (A - B)',
                'subtractBA': 'Resta (B - A)',
                'multiply': 'Multiplicación (A × B)',
                'scalarA': 'Multiplicación escalar (k × A)',
                'transposeA': 'Transposición Aᵀ',
                'determinantA': 'Determinante det(A)',
                'inverseA': 'Inversa A⁻¹',
                'identity': 'Matriz identidad Iₙ'
            };
            
            updateStatus(`Calculando: ${operationNames[operation]}...`, 'info');
            
            // Ejecutar operación
            switch(operation) {
                case 'add':
                    validateMatricesForOperation();
                    result = addMatrices(matrixA, matrixB);
                    break;
                    
                case 'subtractAB':
                    validateMatricesForOperation();
                    result = subtractMatrices(matrixA, matrixB);
                    break;
                    
                case 'subtractBA':
                    validateMatricesForOperation();
                    result = subtractMatrices(matrixB, matrixA);
                    break;
                    
                case 'multiply':
                    validateMatricesForMultiplication();
                    result = multiplyMatrices(matrixA, matrixB);
                    break;
                    
                case 'scalarA':
                    validateMatrixA();
                    const scalar = parseFloat(document.getElementById('scalarValue').value);
                    if (isNaN(scalar)) throw new Error('El valor escalar debe ser un número válido');
                    result = scalarMultiply(matrixA, scalar);
                    break;
                    
                case 'transposeA':
                    validateMatrixA();
                    result = transposeMatrix(matrixA);
                    break;
                    
                case 'determinantA':
                    validateMatrixA();
                    result = calculateDeterminant(matrixA);
                    break;
                    
                case 'inverseA':
                    validateMatrixA();
                    result = invertMatrix(matrixA);
                    break;
                    
                case 'identity':
                    validateMatrixA();
                    result = generateIdentityMatrix(matrixA.length);
                    break;
                    
                default:
                    throw new Error('Operación no reconocida');
            }
            
            displayResult(operation, result, null);
            updateStatus(`${operationNames[operation]} completada exitosamente`, 'success');
            
        } catch (error) {
            displayResult(operation, null, error.message);
            updateStatus(`Error en la operación: ${error.message}`, 'error');
        } finally {
            isProcessing = false;
            showLoading(false);
        }
    }, 500);
}

// === FUNCIONES MATEMÁTICAS  ===

function addMatrices(a, b) {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error("Las matrices deben tener las mismas dimensiones para la suma");
    }
    
    const result = [];
    for (let i = 0; i < a.length; i++) {
        const row = [];
        for (let j = 0; j < a[0].length; j++) {
            row.push(a[i][j] + b[i][j]);
        }
        result.push(row);
    }
    return result;
}

function subtractMatrices(a, b) {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error("Las matrices deben tener las mismas dimensiones para la resta");
    }
    
    const result = [];
    for (let i = 0; i < a.length; i++) {
        const row = [];
        for (let j = 0; j < a[0].length; j++) {
            row.push(a[i][j] - b[i][j]);
        }
        result.push(row);
    }
    return result;
}

function multiplyMatrices(a, b) {
    if (a[0].length !== b.length) {
        throw new Error("El número de columnas de A debe ser igual al número de filas de B");
    }
    
    const result = [];
    for (let i = 0; i < a.length; i++) {
        const row = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            row.push(sum);
        }
        result.push(row);
    }
    return result;
}

function scalarMultiply(matrix, scalar) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
        const row = [];
        for (let j = 0; j < matrix[0].length; j++) {
            row.push(matrix[i][j] * scalar);
        }
        result.push(row);
    }
    return result;
}

function transposeMatrix(matrix) {
    const result = [];
    for (let j = 0; j < matrix[0].length; j++) {
        const row = [];
        for (let i = 0; i < matrix.length; i++) {
            row.push(matrix[i][j]);
        }
        result.push(row);
    }
    return result;
}

function calculateDeterminant(matrix) {
    if (matrix.length !== matrix[0].length) {
        throw new Error("La matriz debe ser cuadrada para calcular el determinante");
    }
    
    const n = matrix.length;
    
    // Casos base para matrices pequeñas
    if (n === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    
    // Para matrices 3x3 y mayores: ELIMINACIÓN GAUSSIANA
    return gaussianDeterminant(matrix);
}

function gaussianDeterminant(matrix) {
    const n = matrix.length;
    let det = 1;
    const mat = JSON.parse(JSON.stringify(matrix)); 
    
    for (let i = 0; i < n; i++) {
        // Encontrar pivote máximo en la columna actual
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(mat[k][i]) > Math.abs(mat[maxRow][i])) {
                maxRow = k;
            }
        }
        
        if (maxRow !== i) {
            [mat[i], mat[maxRow]] = [mat[maxRow], mat[i]];
            det *= -1;
        }
        
        // Si el pivote es cero, el determinante es cero
        if (Math.abs(mat[i][i]) < 1e-10) {
            return 0;
        }
        
        // Eliminación gaussiana
        for (let k = i + 1; k < n; k++) {
            const factor = mat[k][i] / mat[i][i];
            for (let j = i + 1; j < n; j++) {
                mat[k][j] -= factor * mat[i][j];
            }
        }
        
        det *= mat[i][i];
    }
    
    return det;
}

function invertMatrix(matrix) {
    if (matrix.length !== matrix[0].length) {
        throw new Error("La matriz debe ser cuadrada para calcular la inversa");
    }
    
    const n = matrix.length;
    
    // Verificar si la matriz es invertible
    const det = calculateDeterminant(matrix);
    if (Math.abs(det) < 1e-10) {
        throw new Error("La matriz no es invertible (determinante ≈ 0)");
    }
    
    // Caso especial para matrices 2x2
    if (n === 2) {
        const a = matrix[0][0], b = matrix[0][1];
        const c = matrix[1][0], d = matrix[1][1];
        const determinant = a * d - b * c;
        
        return [
            [d / determinant, -b / determinant],
            [-c / determinant, a / determinant]
        ];
    }
    
    // Para matrices 3x3 y mayores: GAUSS-JORDAN
    return gaussJordanInversion(matrix);
}

function gaussJordanInversion(matrix) {
    const n = matrix.length;
    
    // Crear matriz aumentada [A | I]
    const augmented = [];
    for (let i = 0; i < n; i++) {
        augmented.push([...matrix[i]]);
        // Añadir matriz identidad
        for (let j = 0; j < n; j++) {
            augmented[i].push(i === j ? 1 : 0);
        }
    }

    for (let i = 0; i < n; i++) {
        // Pivoteo parcial
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Intercambiar filas si es necesario
        if (maxRow !== i) {
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        }
        
        const pivot = augmented[i][i];
        
        // Verificar que el pivote no sea cero
        if (Math.abs(pivot) < 1e-12) {
            throw new Error("Matriz singular - no se puede invertir");
        }
        
        // Normalizar la fila del pivote
        for (let j = 0; j < 2 * n; j++) {
            augmented[i][j] /= pivot;
        }
        
        // Eliminación: hacer ceros en la columna i
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
    }
    
    // Extraer la matriz inversa
    const inverse = [];
    for (let i = 0; i < n; i++) {
        inverse.push(augmented[i].slice(n, 2 * n));
    }
    
    return inverse;
}

function generateIdentityMatrix(n) {
    const identity = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(i === j ? 1 : 0);
        }
        identity.push(row);
    }
    return identity;
}

function verifyInverse(A, Ainv) {
    const n = A.length;
    const product = multiplyMatrices(A, Ainv);
    const identity = generateIdentityMatrix(n);

    let maxError = 0;
    let isCorrect = true;
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const error = Math.abs(product[i][j] - identity[i][j]);
            maxError = Math.max(maxError, error);
            if (error > 1e-8) {
                isCorrect = false;
            }
        }
    }
    
    const message = isCorrect ? 
        `✅ Verificación exitosa: A × A⁻¹ ≈ I (error: ${maxError.toExponential(2)})` :
        `⚠️ Verificación con error: A × A⁻¹ ≠ I (error máximo: ${maxError.toExponential(2)})`;
    
    if (verificationMessage) {
        verificationMessage.innerHTML = message;
        verificationMessage.className = `verification-message ${isCorrect ? 'success-message' : 'warning-message'}`;
    }
    
    return isCorrect;
}

// === FUNCIONES DE VISUALIZACIÓN ===

function displayResult(operation, result, error) {
    if (!resultsContainer) return;
    
    if (error) {
        resultsContainer.innerHTML = `<div class="error-message">${error}</div>`;
        return;
    }
    
    let html = '';
    const operationNames = {
        'add': 'Suma de matrices (A + B)',
        'subtractAB': 'Resta de matrices (A - B)',
        'subtractBA': 'Resta de matrices (B - A)',
        'multiply': 'Multiplicación de matrices (A × B)',
        'scalarA': 'Multiplicación escalar (k × A)',
        'transposeA': 'Transposición de matriz A',
        'determinantA': 'Determinante de matriz A',
        'inverseA': 'Matriz inversa de A',
        'identity': 'Matriz identidad'
    };
    
    html += `<h3>${operationNames[operation]}</h3>`;
    
    // Mostrar matrices originales si es necesario
    if (operation.includes('A') && !operation.includes('scalar') && operation !== 'identity') {
        html += `<div class="matrix-display">
            <h4>Matriz A:</h4>
            ${matrixToHTML(matrixA)}
        </div>`;
    }
    
    if ((operation.includes('B') || operation === 'add' || operation === 'subtractAB' || 
         operation === 'subtractBA' || operation === 'multiply') && 
        !operation.includes('scalar') && operation !== 'identity') {
        html += `<div class="matrix-display">
            <h4>Matriz B:</h4>
            ${matrixToHTML(matrixB)}
        </div>`;
    }
    
    if (operation.includes('scalarA')) {
        const scalar = parseFloat(document.getElementById('scalarValue').value);
        html += `<p>Escalar: ${scalar}</p>`;
    }
    
    // Mostrar resultado
    if (operation.includes('determinant')) {
        html += `<div class="result-container">
            <h4>Resultado:</h4>
            <div class="determinante-resultado">
                <div class="det-value">${result.toFixed(4)}</div>
                <p class="det-info">Matriz ${result === 0 ? 'singular' : 'no singular'}</p>
            </div>
        </div>`;
    } else {
        html += `<div class="matrix-display">
            <h4>Resultado:</h4>
            ${matrixToHTML(result)}
        </div>`;
    }
    
    // Verificación para matriz inversa
    if (operation.includes('inverse')) {
        const originalMatrix = operation === 'inverseA' ? matrixA : matrixB;
        verifyInverse(originalMatrix, result);
    } else if (verificationMessage) {
        verificationMessage.innerHTML = '';
    }
    
    resultsContainer.innerHTML = html;
}

// Convertir matriz a HTML
function matrixToHTML(matrix) {
    if (typeof matrix === 'number') {
        return `<p>${matrix.toFixed(4)}</p>`;
    }
    
    let html = '<table class="matrix-table">';
    for (let i = 0; i < matrix.length; i++) {
        html += '<tr>';
        for (let j = 0; j < matrix[i].length; j++) {
            html += `<td>${typeof matrix[i][j] === 'number' ? matrix[i][j].toFixed(4) : matrix[i][j]}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

// === PRUEBAS AUTOMÁTICAS ===
function runAutomatedTests() {
    if (!testResults) return;
    
    testResults.innerHTML = '<h4>🧪 Ejecutando Pruebas Automáticas...</h4>';
    
    const tests = [
        { name: 'Suma de matrices 2x2', test: testSuma },
        { name: 'Multiplicación de matrices', test: testMultiplicacion },
        { name: 'Determinante 2x2', test: testDeterminante2x2 },
        { name: 'Transposición', test: testTransposicion },
        { name: 'Matriz Identidad', test: testIdentidad },
        { name: 'Matriz Inversa', test: testInversa }
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach((testObj, index) => {
        setTimeout(() => {
            try {
                const result = testObj.test();
                if (result.passed) {
                    passed++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }

            // Cuando es la última prueba, mostrar el resumen
            if (index === tests.length - 1) {
                const message = `Pruebas automáticas completadas: ${passed} éxitos, ${failed} fallos`;
                updateStatus(message, failed === 0 ? 'success' : 'warning');
            }
        }, index * 500);
    });
}

// Funciones de prueba específicas
function testSuma() {
    const A = [[1, 2], [3, 4]];
    const B = [[5, 6], [7, 8]];
    const resultado = addMatrices(A, B);
    const esperado = [[6, 8], [10, 12]];
    const passed = JSON.stringify(resultado) === JSON.stringify(esperado);
    return {
        passed,
        message: passed ? 'Correcto' : `Esperado ${JSON.stringify(esperado)}, Obtenido ${JSON.stringify(resultado)}`
    };
}

function testMultiplicacion() {
    const A = [[1, 2], [3, 4]];
    const B = [[2, 0], [1, 2]];
    const resultado = multiplyMatrices(A, B);
    const esperado = [[4, 4], [10, 8]];
    const passed = JSON.stringify(resultado) === JSON.stringify(esperado);
    return {
        passed,
        message: passed ? 'Correcto' : `Esperado ${JSON.stringify(esperado)}, Obtenido ${JSON.stringify(resultado)}`
    };
}

function testDeterminante2x2() {
    const A = [[4, 3], [6, 3]];
    const resultado = calculateDeterminant(A);
    const esperado = -6;
    const passed = Math.abs(resultado - esperado) < 0.0001;
    return {
        passed,
        message: passed ? 'Correcto' : `Esperado ${esperado}, Obtenido ${resultado}`
    };
}

function testTransposicion() {
    const A = [[1, 2, 3], [4, 5, 6]];
    const resultado = transposeMatrix(A);
    const esperado = [[1, 4], [2, 5], [3, 6]];
    const passed = JSON.stringify(resultado) === JSON.stringify(esperado);
    return {
        passed,
        message: passed ? 'Correcto' : `Esperado ${JSON.stringify(esperado)}, Obtenido ${JSON.stringify(resultado)}`
    };
}

function testIdentidad() {
    const resultado = generateIdentityMatrix(3);
    const esperado = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const passed = JSON.stringify(resultado) === JSON.stringify(esperado);
    return {
        passed,
        message: passed ? 'Correcto' : 'Matriz identidad incorrecta'
    };
}

function testInversa() {
    const A = [[4, 7], [2, 6]];
    const Ainv = invertMatrix(A);
    const producto = multiplyMatrices(A, Ainv);
    const identidad = generateIdentityMatrix(2);
    
    let passed = true;
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (Math.abs(producto[i][j] - identidad[i][j]) > 0.0001) {
                passed = false;
                break;
            }
        }
    }
    
    return {
        passed,
        message: passed ? 'A × A⁻¹ = I verificada' : 'A × A⁻¹ ≠ I'
    };
}

// === FUNCIONES DE UTILIDAD ===

function showLoading(show) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (show) {
            btn.classList.add('loading');
        } else {
            btn.classList.remove('loading');
        }
    });
    isProcessing = show;
}

function showError(message) {
    updateStatus(`Error: ${message}`, 'error');
    
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <h4>Error</h4>
                <p>${message}</p>
            </div>
        `;
    }
}

// === VALIDACIONES MEJORADAS ===

function validateMatrixA() {
    if (!matrixA || matrixA.length === 0) {
        throw new Error("Debe crear la matriz A primero");
    }
}

function validateMatrixB() {
    if (!matrixB || matrixB.length === 0) {
        throw new Error("Debe crear la matriz B primero");
    }
}

function validateMatricesForOperation() {
    validateMatrixA();
    validateMatrixB();
    
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
        throw new Error("Las matrices deben tener las mismas dimensiones");
    }
}

function validateMatricesForMultiplication() {
    validateMatrixA();
    validateMatrixB();
    
    if (matrixA[0].length !== matrixB.length) {
        throw new Error("El número de columnas de A debe ser igual al número de filas de B");
    }
}

// Inicializar la calculadora cuando se carga la página
window.addEventListener('load', initializeCalculator);