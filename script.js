// Inicializa a matriz de Gauss quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    createMatrixInputs();
});

// --- LÓGICA PARA ELIMINAÇÃO DE GAUSS (COM PASSO A PASSO) ---

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

// Função auxiliar para formatar a matriz para exibição
function formatMatrix(matrix) {
    let text = "";
    matrix.forEach(row => {
        row.forEach(val => {
            text += `${val.toFixed(2).padStart(8)} `;
        });
        text += '\n';
    });
    return text;
}

function solveGaussianElimination() {
    const size = parseInt(document.getElementById('matrix-size').value);
    const matrix = [];
    let resultText = "--- Início da Eliminação de Gauss ---\n\n";

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

    resultText += "Matriz Aumentada Inicial (Etapa k=0):\n";
    resultText += formatMatrix(matrix) + "\n";
    
    // --- Fase de Eliminação (Triangularização) ---
    resultText += "--- Fase de Eliminação (Triangularização) ---\n\n";
    for (let k = 0; k < size - 1; k++) {
        resultText += `Etapa k=${k+1} (zerando a coluna ${k+1}):\n`;
        
        // Pivoteamento parcial para estabilidade
        let maxRow = k;
        for (let i = k + 1; i < size; i++) {
            if (Math.abs(matrix[i][k]) > Math.abs(matrix[maxRow][k])) {
                maxRow = i;
            }
        }
        if (maxRow !== k) {
            [matrix[k], matrix[maxRow]] = [matrix[maxRow], matrix[k]];
            resultText += `   -> Pivoteamento: Trocando linha ${k+1} com a linha ${maxRow+1}.\n`;
            resultText += formatMatrix(matrix) + "\n";
        }

        // Zera os elementos abaixo do pivô
        for (let i = k + 1; i < size; i++) {
            const factor = matrix[i][k] / matrix[k][k];
            resultText += `   -> Operação: L${i+1} <- L${i+1} - (${factor.toFixed(4)}) * L${k+1}\n`;
            for (let j = k; j <= size; j++) {
                matrix[i][j] -= factor * matrix[k][j];
            }
        }
        resultText += "   Matriz após a etapa:\n";
        resultText += formatMatrix(matrix) + "\n";
    }

    // --- Fase de Retro-substituição ---
    resultText += "--- Fase de Retro-substituição ---\n\n";
    resultText += "Matriz Triangular Superior Final:\n";
    resultText += formatMatrix(matrix) + "\n";
    
    const solution = new Array(size);
    for (let i = size - 1; i >= 0; i--) {
        let sum = 0;
        let equation = `${matrix[i][i].toFixed(2)}*x${i+1}`;
        
        for (let j = i + 1; j < size; j++) {
            sum += matrix[i][j] * solution[j];
            equation += ` + ${matrix[i][j].toFixed(2)}*(${solution[j].toFixed(2)})`;
        }
        solution[i] = (matrix[i][size] - sum) / matrix[i][i];
        
        resultText += `Cálculo de x${i+1}:\n`;
        resultText += `   ${equation} = ${matrix[i][size].toFixed(2)}\n`;
        resultText += `   -> x${i+1} = ${solution[i].toFixed(4)}\n\n`;
    }
    
    // Apresenta o resultado final
    resultText += "--- Solução Final ---\n";
    solution.forEach((val, i) => {
        resultText += `x${i+1} = ${val.toFixed(4)}\n`;
    });
    
    document.getElementById('gauss-result').innerText = resultText;
}


// --- LÓGICA PARA O MÉTODO DA BISSECÇÃO (COM PASSO A PASSO) ---

function solveBisectionMethod() {
    const funcStr = document.getElementById('bisection-function').value;
    const a = parseFloat(document.getElementById('bisection-a').value);
    const b = parseFloat(document.getElementById('bisection-b').value);
    const tolerance = parseFloat(document.getElementById('bisection-tolerance').value);
    const maxIterations = parseInt(document.getElementById('max-iterations').value);
    const resultContainer = document.getElementById('bisection-result');
    let resultText = "";

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
    
    resultText += "--- Início do Método da Bissecção ---\n\n";
    resultText += `Fase I: Localização da Raiz\n`;
    resultText += `Intervalo inicial: [${a}, ${b}]\n`;
    resultText += `f(a) = f(${a}) = ${fa.toFixed(6)}\n`;
    resultText += `f(b) = f(${b}) = ${fb.toFixed(6)}\n`;

    // Verifica o Teorema de Bolzano
    if (fa * fb >= 0) {
        resultText += `\nErro: f(a) e f(b) devem ter sinais opostos para garantir uma raiz no intervalo (Teorema de Bolzano).\n`;
        resultText += `f(a) * f(b) = ${ (fa * fb).toFixed(6) } >= 0`;
        resultContainer.innerText = resultText;
        return;
    }
    resultText += `Condição satisfeita: f(a) * f(b) < 0. Existe pelo menos uma raiz no intervalo.\n\n`;
    
    let current_a = a;
    let current_b = b;
    let iteration = 0;
    resultText += "Fase II: Refinamento da Raiz\n";
    resultText += "--------------------------------------------------------------------------------\n";
    resultText += "Iter |     a     |     b     |     p     |    f(p)    |     Novo Intervalo     \n";
    resultText += "--------------------------------------------------------------------------------\n";

    while (iteration < maxIterations) {
        const p = (current_a + current_b) / 2;
        const fp = f(p);
        let nextInterval;

        // Critério de parada pelo tamanho do intervalo
        if ((current_b - current_a) < tolerance) {
            resultText += "\nCritério de parada atingido: (b - a) < tolerância.\n";
            break;
        }

        // Lógica de atualização do intervalo
        if (f(current_a) * fp < 0) {
            nextInterval = `[${current_a.toFixed(4)}, ${p.toFixed(4)}]`;
            current_b = p;
        } else {
            nextInterval = `[${p.toFixed(4)}, ${current_b.toFixed(4)}]`;
            current_a = p;
        }
        
        resultText += `${String(iteration+1).padStart(4)} | ${current_a.toFixed(6).padStart(9)} | ${current_b.toFixed(6).padStart(9)} | ${p.toFixed(6).padStart(9)} | ${fp.toFixed(6).padStart(10)} | ${nextInterval.padStart(22)}\n`;

        iteration++;
    }

    if (iteration >= maxIterations) {
        resultText += "\nCritério de parada atingido: Número máximo de iterações.\n";
    }

    const root = (current_a + current_b) / 2;
    resultText += "--------------------------------------------------------------------------------\n";
    resultText += "\n--- Conclusão ---\n";
    resultText += `A raiz aproximada é: ${root.toFixed(6)}\n`;
    resultText += `Número de iterações: ${iteration}`;
    
    resultContainer.innerText = resultText;
}