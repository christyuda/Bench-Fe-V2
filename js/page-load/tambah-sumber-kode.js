document.addEventListener('DOMContentLoaded', function() {
    const addMoreCodeBtn = document.getElementById('addMoreCode');
    const sumberKodeContainer = document.getElementById('sumberKodeContainer');
    let codeFieldCount = 1;

    addMoreCodeBtn.addEventListener('click', () => {
        codeFieldCount++;
        
        const newFieldContainer = document.createElement('div');
        newFieldContainer.classList.add('mb-3');

        const newLabel = document.createElement('label');
        newLabel.setAttribute('for', `sumber_kode_${codeFieldCount}`);
        newLabel.classList.add('form-label');
        newLabel.textContent = `Sumber Kode ${codeFieldCount}`;

        const newTextArea = document.createElement('textarea');
        newTextArea.setAttribute('class', 'form-control');
        newTextArea.setAttribute('id', `sumber_kode_${codeFieldCount}`);
        newTextArea.setAttribute('name', 'sumber_kode');
        newTextArea.setAttribute('rows', '3');

        newFieldContainer.appendChild(newLabel);
        newFieldContainer.appendChild(newTextArea);

        sumberKodeContainer.appendChild(newFieldContainer);
    });
});
