document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dice-form');
    const diceArea = document.getElementById('dice-area');
    const facesInput = document.getElementById('faces');
    const colorInput = document.getElementById('color');
    const qtyInput = document.getElementById('qty');
    const colorPickersDiv = document.getElementById('color-pickers');
    const modifierInput = document.getElementById('modifier');
    let resultDiv = document.getElementById('result');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'result';
        diceArea.parentNode.appendChild(resultDiv);
    }
    const minSuccessInput = document.getElementById('min-success');

    function updateColorPickers() {
        const qty = Math.max(1, Math.min(10, parseInt(qtyInput.value, 10)));
        colorPickersDiv.innerHTML = '';
        for (let i = 0; i < qty; i++) {
            const label = document.createElement('label');
            label.textContent = `Color for Die ${i + 1}:`;
            label.setAttribute('for', `color${i}`);
            const input = document.createElement('input');
            input.type = 'color';
            input.id = `color${i}`;
            input.value = '#ff0000';
            colorPickersDiv.appendChild(label);
            colorPickersDiv.appendChild(input);
        }
    }

    qtyInput.addEventListener('input', updateColorPickers);
    document.addEventListener('DOMContentLoaded', updateColorPickers);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        rollDice();
    });

    function rollDice() {
        const qty = Math.max(1, Math.min(10, parseInt(qtyInput.value, 10)));
        const faces = Math.max(2, Math.min(20, parseInt(facesInput.value, 10)));
        const modifier = parseInt(modifierInput.value, 10) || 0;
        const minSuccess = parseInt(minSuccessInput.value, 10) || 0;
        const colors = [];
        let diceValues = [];
        for (let i = 0; i < qty; i++) {
            const colorInput = document.getElementById(`color${i}`);
            colors.push(colorInput ? colorInput.value : '#ff0000');
        }
        diceArea.innerHTML = '';
        for (let i = 0; i < qty; i++) {
            const die = document.createElement('div');
            die.className = 'dice rolling';
            die.style.setProperty('--dice-color', colors[i]);
            setTimeout(() => {
                die.classList.remove('rolling');
                const value = randomFace(faces);
                die.textContent = value;
                diceValues[i] = value;
                if (diceValues.filter(Boolean).length === qty) {
                    const sum = diceValues.reduce((a, b) => a + b, 0);
                    const total = sum + modifier;
                    let resultText = `Value: ${sum}<br>Modifier: ${modifier}<br>Total: ${total}<br>`;
                    if (total >= minSuccess) {
                        resultText += '<span style="color:green;font-weight:bold">¡Success!</span>';
                        resultDiv.style.color = '';
                    } else {
                        resultText += '<span style="color:red;font-weight:bold">Failure.</span>';
                        resultDiv.style.color = '';
                    }
                    resultDiv.innerHTML = resultText;
                }
            }, 600);
            diceArea.appendChild(die);
        }
        resultDiv.textContent = '';
        resultDiv.style.color = '';
    }

    function randomFace(faces) {
        return Math.floor(Math.random() * faces) + 1;
    }

    // Tab navigation logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tc => tc.style.display = 'none');
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).style.display = '';
        });
    });

    // Esperanza y Miedo logic
    const emForm = document.getElementById('em-form');
    const emDiceArea = document.getElementById('em-dice-area');
    if (emForm) {
        emForm.addEventListener('submit', function(e) {
            e.preventDefault();
            emDiceArea.innerHTML = '';
            const esperanzaFaces = 12;
            const miedoFaces = 12;
            const esperanzaColor = '#628141';
            const miedoColor = '#FA6868';
            const modifier = parseInt(document.getElementById('em-modifier').value, 10) || 0;
            const minSuccess = parseInt(document.getElementById('em-min-success').value, 10) || 0;
            const emResultDiv = document.getElementById('em-result');
            // Esperanza die
            const esperanzaDie = document.createElement('div');
            esperanzaDie.className = 'dice rolling';
            esperanzaDie.style.setProperty('--dice-color', esperanzaColor);
            esperanzaDie.style.marginRight = '1em';
            // Miedo die
            const miedoDie = document.createElement('div');
            miedoDie.className = 'dice rolling';
            miedoDie.style.setProperty('--dice-color', miedoColor);
            // Labels
            const esperanzaLabel = document.createElement('div');
            esperanzaLabel.textContent = 'Hope';
            esperanzaLabel.style.textAlign = 'center';
            const miedoLabel = document.createElement('div');
            miedoLabel.textContent = 'Fear';
            miedoLabel.style.textAlign = 'center';
            // Animate roll
            setTimeout(() => {
                esperanzaDie.classList.remove('rolling');
                const valEsperanza = randomFace(esperanzaFaces);
                esperanzaDie.textContent = valEsperanza;
                miedoDie.classList.remove('rolling');
                const valMiedo = randomFace(miedoFaces);
                miedoDie.textContent = valMiedo;
                const sum = valEsperanza + valMiedo;
                const total = sum + modifier;
                let resultText = `Esperanza: ${valEsperanza}<br>Miedo: ${valMiedo}<br>Modificador: ${modifier}<br>Total: ${total}<br>`;
                if (total >= minSuccess) {
                    resultText += '<span style="color:green;font-weight:bold">¡Success!</span>';
                    emResultDiv.style.color = '';
                } else {
                    resultText += '<span style="color:red;font-weight:bold">Failure.</span>';
                    emResultDiv.style.color = '';
                }
                emResultDiv.innerHTML = resultText;
            }, 600);
            const esperanzaCol = document.createElement('div');
            esperanzaCol.style.display = 'flex';
            esperanzaCol.style.flexDirection = 'column';
            esperanzaCol.style.alignItems = 'center';
            esperanzaCol.appendChild(esperanzaDie);
            esperanzaCol.appendChild(esperanzaLabel);
            const miedoCol = document.createElement('div');
            miedoCol.style.display = 'flex';
            miedoCol.style.flexDirection = 'column';
            miedoCol.style.alignItems = 'center';
            miedoCol.appendChild(miedoDie);
            miedoCol.appendChild(miedoLabel);
            emDiceArea.style.display = 'flex';
            emDiceArea.style.justifyContent = 'center';
            emDiceArea.appendChild(esperanzaCol);
            emDiceArea.appendChild(miedoCol);
            emResultDiv.textContent = '';
            emResultDiv.style.color = '';
        });
    }
});
