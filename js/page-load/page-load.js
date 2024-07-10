document.addEventListener('DOMContentLoaded', function () {
    const buttonSubmit = document.getElementById('submitButton');
    let resultsChart;
    buttonSubmit.addEventListener('click', function (event) {
        event.preventDefault();

        const javascriptType = document.getElementById('formValidationName').value;
        const allSumberKode = document.querySelectorAll('[name="sumber_kode"]');
        const sumberKodeValues = Array.from(allSumberKode).map(textarea => textarea.value);
        const iterations = document.getElementById('jumlah_eksekusi').value;
        const token = localStorage.getItem('token');

        const data = {
            javascriptType: javascriptType,
            testType: "page-load",
            testCodes: sumberKodeValues,
            testConfig: {
                iterations: parseInt(iterations)
            }
        };

        fetch('http://localhost:3000/api/benchmark/start-page-load', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Unauthorized access - please log in again'); 
                }
                throw new Error('Failed to submit test - server responded with an error');
            }
            return response.json();
        })        
        .then(data => {
            updateCharts(data.data.results);                 
            updateProgress(data.data.results);   
            console.log('Success:', data);
            Swal.fire({
                title: 'Success!',
                text: 'Test submitted successfully!',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'OK'
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to submit test.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    });
    function updateCharts(results) {
        const chartsContainer = document.getElementById('chartsContainer');
        chartsContainer.innerHTML = ''; // Clear previous charts if any

        results.forEach((result, index) => {
            const canvasId = `chartCanvas${index}`;
            const canvasElement = document.createElement('canvas');
            canvasElement.id = canvasId;
            canvasElement.style.maxWidth = "48%";
            chartsContainer.appendChild(canvasElement);

            const ctx = canvasElement.getContext('2d');
            const labels = result.iterationsResults.map((_, i) => `Iteration ${i + 1}`);
            const data = result.iterationsResults.map(ir => parseFloat(ir.pageLoadTime));

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Page Load Time for Test Code ${index + 1}`,
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Page Load Time (ms)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        });
    }

    function updateProgress(results) {
        const totalAveragePageLoadTime = results.reduce((acc, r) => acc + parseFloat(r.averagePageLoadTime), 0) / results.length;
        document.getElementById('averageExecutionTime').textContent = `${totalAveragePageLoadTime.toFixed(2)} ms`;

        const executionProgressBar = document.getElementById('executionTimeProgressBar');
        executionProgressBar.style.width = `${Math.min(100, totalAveragePageLoadTime / 0.5 * 100)}%`;  // Assume a reasonable scale factor
        executionProgressBar.textContent = `${totalAveragePageLoadTime.toFixed(2)} ms`;
    }
});
