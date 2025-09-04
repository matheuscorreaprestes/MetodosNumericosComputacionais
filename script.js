// Inicializa a matriz de Gauss quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    createMatrixInputs();
});

// --- LÓGICA PARA ELIMINAÇÃO DE GAUSS ---

function createMatrixInputs() {
    const size = parseInt(document.getElementById('matrix-size').value);
    const container = document.getElementById('gauss-matrix-container');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${size + 1}, auto) 1fr`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `matrix_${i}_${j}`;
            input.placeholder = `a${i+1}${j+1}`;
            container.appendChild(input);
        }
        // Adiciona a barra vertical e o input para o vetor b
        const separator = document.createElement('span');
        separator.innerText = '|';
        container.appendChild(separator);

        const b_input = document.createElement('input');
        b_input.type = 'number';
        b_input.id = `matrix_${i}_${size}`;
        b_input.placeholder = `b${i+1}`;
        container.appendChild(b_input);
    }
}

function solveGaussianElimination() {
    const size = parseInt(document.getElementById('matrix-size').value);
    const matrix = [];

    // Lê os valores da matriz e do vetor b a partir dos inputs
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j <= size; j++) {
            const val = parseFloat(document.getElementById(`matrix_${i}_${j}`).value);
            if (isNaN(val)) {
                document.getElementById('gauss-result').innerText = `Erro: Por favor, preencha todos os campos da matriz.`;
                return;
            }
            matrix[i][j] = val;
        }
    }

    // --- Início do Algoritmo de Eliminação de Gauss ---
    
    // Etapa de Triangularização (com pivoteamento parcial)
    for (let k = 0; k < size; k++) {
        // Pivoteamento: troca de linhas para estabilidade numérica
        // Conforme sugerido no material sobre matriz de permutação [cite: 32]
        let maxRow = k;
        for (let i = k + 1; i < size; i++) {
            if (Math.abs(matrix[i][k]) > Math.abs(matrix[maxRow][k])) {
                maxRow = i;
            }
        }
        [matrix[k], matrix[maxRow]] = [matrix[maxRow], matrix[k]]; // Troca as linhas

        // Zera os elementos abaixo do pivô
        for (let i = k + 1; i < size; i++) {
            const factor = matrix[i][k] / matrix[k][k];
            for (let j = k; j <= size; j++) {
                matrix[i][j] -= factor * matrix[k][j];
            }
        }
    }

    // Etapa de Retro-substituição
    const solution = new Array(size);
    for (let i = size - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < size; j++) {
            sum += matrix[i][j] * solution[j];
        }
        solution[i] = (matrix[i][size] - sum) / matrix[i][i];
    }
    
    // Apresenta o resultado
    let resultText = "O sistema foi resolvido.\n\nSolução (vetor x):\n";
    solution.forEach((val, i) => {
        resultText += `x${i+1} = ${val.toFixed(4)}\n`;
    });
    
    document.getElementById('gauss-result').innerText = resultText;
}


// --- LÓGICA PARA O MÉTODO DA BISSECÇÃO ---

function solveBisectionMethod() {
    const funcStr = document.getElementById('bisection-function').value;
    const a = parseFloat(document.getElementById('bisection-a').value);
    const b = parseFloat(document.getElementById('bisection-b').value);
    const tolerance = parseFloat(document.getElementById('bisection-tolerance').value);
    const maxIterations = parseInt(document.getElementById('max-iterations').value);
    const resultContainer = document.getElementById('bisection-result');

    if (!funcStr || isNaN(a) || isNaN(b) || isNaN(tolerance)) {
        resultContainer.innerText = "Erro: Preencha todos os campos.";
        return;
    }

    const parser = math.parser();
    const f = (x) => {
        parser.set('x', x);
        return parser.evaluate(funcStr);
    };

    let fa, fb;
    try {
        fa = f(a);
        fb = f(b);
    } catch (e) {
        resultContainer.innerText = `Erro na função: ${e.message}`;
        return;
    }
    
    // Verifica o Teorema de Bolzano [cite: 109, 110, 111]
    if (fa * fb >= 0) {
        resultContainer.innerText = "Erro: f(a) e f(b) devem ter sinais opostos para garantir uma raiz no intervalo.";
        return;
    }
    
    let current_a = a;
    let current_b = b;
    let iteration = 0;
    let resultText = "Iterações (Fase de Refinamento):\n\n";
    resultText += "Iteração |    a    |    b    |    p    |   f(p)   | b-a \n";
    resultText += "---------------------------------------------------------\n";

    while ((current_b - current_a) / 2 > tolerance && iteration < maxIterations) {
        const p = (current_a + current_b) / 2;
        const fp = f(p);

        resultText += `${String(iteration+1).padStart(8)} | ${current_a.toFixed(4).padStart(7)} | ${current_b.toFixed(4).padStart(7)} | ${p.toFixed(4).padStart(7)} | ${fp.toFixed(4).padStart(8)} | ${(current_b - current_a).toFixed(4)}\n`;

        if (fp === 0) { // Encontrou a raiz exata
            current_a = p;
            current_b = p;
            break;
        }

        if (f(current_a) * fp < 0) {
            current_b = p;
        } else {
            current_a = p;
        }
        iteration++;
    }

    const root = (current_a + current_b) / 2;
    resultText += "\n--- Conclusão ---\n";
    resultText += `A raiz aproximada é: ${root.toFixed(6)}\n`;
    resultText += `Número de iterações: ${iteration + 1}`;
    
    resultContainer.innerText = resultText;
}