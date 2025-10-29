// Variables globales
let matrixA = [];
let matrixB = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    generateMatrix('A');
    generateMatrix('B');
    
    // Event listeners para botones de generación
    document.getElementById('generateA').addEventListener('click', () => generateMatrix('A'));
    document.getElementById('generateB').addEventListener('click', () => generateMatrix('B'));
    
    // Event listeners para operaciones
    const operationButtons = document.querySelectorAll('.operation-btn');
    operationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const operation = this.getAttribute('data-operation');
            performOperation(operation);
        });
    });
});

// Generar matriz con inputs
function generateMatrix(matrix) {
    const rows = parseInt(document.getElementById(`rows${matrix}`).value);
    const cols = parseInt(document.getElementById(`cols${matrix}`).value);
    const container = document.getElementById(`matrix${matrix}Container`);
    
    // Validar dimensiones
    if (rows < 1 || rows > 10 || cols < 1 || cols > 10) {
        showError(`Las dimensiones de la matriz ${matrix} deben estar entre 1×1 y 10×10`);
        return;
    }
    
    // Generar tabla
    let html = '<table class="matrix-table">';
    for (let i = 0; i < rows; i++) {
        html += '<tr>';
        for (let j = 0; j < cols; j++) {
            html += `<td><input type="number" id="cell${matrix}${i}${j}" value="${i === j ? 1 : 0}"></td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    
    container.innerHTML = html;
    
    // Actualizar matriz en memoria
    updateMatrixFromInputs(matrix);
}

// Actualizar matriz desde inputs
function updateMatrixFromInputs(matrix) {
    const rows = parseInt(document.getElementById(`rows${matrix}`).value);
    const cols = parseInt(document.getElementById(`cols${matrix}`).value);
    const matrixData = [];
    
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const value = parseFloat(document.getElementById(`cell${matrix}${i}${j}`).value) || 0;
            row.push(value);
        }
        matrixData.push(row);
    }
    
    if (matrix === 'A') {
        matrixA = matrixData;
    } else {
        matrixB = matrixData;
    }
}

// Realizar operación seleccionada
function performOperation(operation) {
    // Actualizar matrices desde inputs
    updateMatrixFromInputs('A');
    updateMatrixFromInputs('B');
    
    let result;
    let error = null;
    
    try {
        switch(operation) {
            case 'add':
                result = addMatrices(matrixA, matrixB);
                break;
            case 'subtractAB':
                result = subtractMatrices(matrixA, matrixB);
                break;
            case 'subtractBA':
                result = subtractMatrices(matrixB, matrixA);
                break;
            case 'multiply':
                result = multiplyMatrices(matrixA, matrixB);
                break;
            case 'scalarA':
                const scalarA = parseFloat(document.getElementById('scalarValue').value);
                result = scalarMultiply(matrixA, scalarA);
                break;
            case 'scalarB':
                const scalarB = parseFloat(document.getElementById('scalarValue').value);
                result = scalarMultiply(matrixB, scalarB);
                break;
            case 'transposeA':
                result = transposeMatrix(matrixA);
                break;
            case 'transposeB':
                result = transposeMatrix(matrixB);
                break;
            case 'determinantA':
                result = calculateDeterminant(matrixA);
                break;
            case 'determinantB':
                result = calculateDeterminant(matrixB);
                break;
            case 'inverseA':
                result = invertMatrix(matrixA);
                break;
            case 'inverseB':
                result = invertMatrix(matrixB);
                break;
            case 'identity':
                const size = parseInt(document.getElementById('identitySize').value);
                result = generateIdentityMatrix(size);
                break;
            default:
                error = "Operación no reconocida";
        }
    } catch (e) {
        error = e.message;
    }
    
    // Mostrar resultados
    displayResult(operation, result, error);
}

// Operaciones con matrices

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
    
    if (matrix.length === 1) {
        return matrix[0][0];
    }
    
    if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    
    // Para matrices más grandes, usar eliminación gaussiana
    return gaussianDeterminant(matrix);
}

function gaussianDeterminant(matrix) {
    const n = matrix.length;
    let det = 1;
    const mat = JSON.parse(JSON.stringify(matrix)); // Copia profunda
    
    for (let i = 0; i < n; i++) {
        // Encontrar el pivote
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(mat[j][i]) > Math.abs(mat[maxRow][i])) {
                maxRow = j;
            }
        }
        
        // Intercambiar filas si es necesario
        if (maxRow !== i) {
            [mat[i], mat[maxRow]] = [mat[maxRow], mat[i]];
            det *= -1;
        }
        
        // Si el pivote es cero, el determinante es cero
        if (Math.abs(mat[i][i]) < 1e-10) {
            return 0;
        }
        
        // Eliminación gaussiana
        for (let j = i + 1; j < n; j++) {
            const factor = mat[j][i] / mat[i][i];
            for (let k = i; k < n; k++) {
                mat[j][k] -= factor * mat[i][k];
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
    
    const det = calculateDeterminant(matrix);
    if (Math.abs(det) < 1e-10) {
        throw new Error("La matriz no es invertible (determinante ≈ 0)");
    }
    
    // Método de Gauss-Jordan
    const n = matrix.length;
    const augmented = [];
    
    // Crear matriz aumentada [A|I]
    for (let i = 0; i < n; i++) {
        augmented.push([...matrix[i]]);
        for (let j = 0; j < n; j++) {
            augmented[i].push(i === j ? 1 : 0);
        }
    }
    
    // Eliminación gaussiana
    for (let i = 0; i < n; i++) {
        // Hacer el pivote 1
        const pivot = augmented[i][i];
        for (let j = 0; j < 2 * n; j++) {
            augmented[i][j] /= pivot;
        }
        
        // Hacer ceros en la columna
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
    }
    
    // Extraer la inversa
    const inverse = [];
    for (let i = 0; i < n; i++) {
        inverse.push(augmented[i].slice(n));
    }
    
    return inverse;
}

function generateIdentityMatrix(size) {
    const identity = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(i === j ? 1 : 0);
        }
        identity.push(row);
    }
    return identity;
}

// Mostrar resultados
function displayResult(operation, result, error) {
    const container = document.getElementById('resultsContainer');
    
    if (error) {
        container.innerHTML = `<div class="error-message">Error: ${error}</div>`;
        return;
    }
    
    let html = '';
    const operationNames = {
        'add': 'Suma de matrices (A + B)',
        'subtractAB': 'Resta de matrices (A - B)',
        'subtractBA': 'Resta de matrices (B - A)',
        'multiply': 'Multiplicación de matrices (A × B)',
        'scalarA': 'Multiplicación escalar (k × A)',
        'scalarB': 'Multiplicación escalar (k × B)',
        'transposeA': 'Transposición de matriz A',
        'transposeB': 'Transposición de matriz B',
        'determinantA': 'Determinante de matriz A',
        'determinantB': 'Determinante de matriz B',
        'inverseA': 'Matriz inversa de A',
        'inverseB': 'Matriz inversa de B',
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
    
    if (operation.includes('scalarA') || operation.includes('scalarB')) {
        const scalar = parseFloat(document.getElementById('scalarValue').value);
        html += `<p>Escalar: ${scalar}</p>`;
    }
    
    // Mostrar resultado
    if (operation.includes('determinant')) {
        html += `<div class="result-container">
            <h4>Resultado:</h4>
            <p>det = ${result.toFixed(4)}</p>
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
        const product = multiplyMatrices(originalMatrix, result);
        const identity = generateIdentityMatrix(originalMatrix.length);
        
        html += `<div class="verification">
            <h4>Verificación (A × A⁻¹):</h4>
            ${matrixToHTML(product)}
            <p>La matriz resultante debería ser aproximadamente la matriz identidad.</p>
        </div>`;
    }
    
    container.innerHTML = html;
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

// Mostrar error
function showError(message) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}