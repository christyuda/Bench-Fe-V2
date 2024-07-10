import { endpointJavascriptTypes } from './url.js';

document.addEventListener('DOMContentLoaded', function () {
    const inputField = document.getElementById('formValidationName');
    const suggestions = document.getElementById('suggestionsDropdown');

    let javascriptLibraries = [];

    fetch(endpointJavascriptTypes)
        .then(response => response.json())
        .then(data => {
            javascriptLibraries = data.allJavaScriptTypes.map(lib => ({
                name: lib.name,
                description: lib.description,
                version: lib.version || '', 
                category: lib.category || '' 
            }));
        })
        .catch(error => console.error('Error fetching library data:', error));

    inputField.addEventListener('input', function () {
        const input = inputField.value;
        suggestions.innerHTML = '';
        if (input) {
            suggestions.style.display = 'block';
            const filteredLibraries = javascriptLibraries.filter(item => item.name.toLowerCase().includes(input.toLowerCase()));
            filteredLibraries.forEach(filteredLibrary => {
                let displayText = `${filteredLibrary.name} - ${filteredLibrary.description}`;
                if (filteredLibrary.version) {
                    displayText += ` (v${filteredLibrary.version})`; 
                }
                if (filteredLibrary.category) {
                    displayText += ` [${filteredLibrary.category}]`; 
                }

                const div = document.createElement('div');
                div.textContent = displayText;
                div.addEventListener('click', function () {
                    inputField.value = filteredLibrary.name; 
                    suggestions.style.display = 'none'; 
                });
                suggestions.appendChild(div);
            });
            if (suggestions.innerHTML === '') {
                suggestions.style.display = 'none'; 
            }
        } else {
            suggestions.style.display = 'none';
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function (event) {
        if (event.target !== inputField) {
            suggestions.style.display = 'none';
        }
    });
});
