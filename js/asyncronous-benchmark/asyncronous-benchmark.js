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
            testType: "async_performance",
            testCodes: sumberKodeValues,
            testConfig: {
                iterations: parseInt(iterations)
            }
        };

        fetch('http://localhost:3000/api/benchmark/async-performance-benchmark', {
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
            const data = result.iterationsResults.map(ir => ir.executionTime);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Execution Time for Test Code ${index + 1}`,
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
                                text: 'Execution Time (ms)'
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
        const totalAverageExecutionTime = results.reduce((acc, r) => acc + r.averageAsyncExecution, 0) / results.length;
        document.getElementById('averageExecutionTime').textContent = `${totalAverageExecutionTime.toFixed(0)} ms`;

        const executionProgressBar = document.getElementById('executionTimeProgressBar');
        executionProgressBar.style.width = `${Math.min(100, totalAverageExecutionTime / 10 * 100)}%`;
        executionProgressBar.textContent = `${totalAverageExecutionTime.toFixed(0)} ms`;
    }
});
