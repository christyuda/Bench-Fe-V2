document.addEventListener('DOMContentLoaded', function () {
    const buttonSubmit = document.getElementById('submitButton');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const token = localStorage.getItem('token');

    buttonSubmit.addEventListener('click', function (event) {
        event.preventDefault();

        const javascriptType = document.getElementById('formValidationName').value;
        const allSumberKode = document.querySelectorAll('[name="sumber_kode"]');
        const sumberKodeValues = Array.from(allSumberKode).map(textarea => textarea.value);
        const iterations = document.getElementById('jumlah_eksekusi').value;

        const data = {
            testType: "Execution Time Test",
            testCodes: sumberKodeValues,
            testConfig: {
                iterations: parseInt(iterations)
            },
            javascriptType: javascriptType
        };

        // Show loading spinner
        loadingSpinner.style.display = 'block';

        fetch('http://localhost:3000/api/execution-time/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`            
        },
            body: JSON.stringify(data)
        })
        .then(response => {
            // Hide loading spinner
            loadingSpinner.style.display = 'none';
            
            if (response.status === 201) {
                return response.json();
            } else {
                if (response.status === 403) {
                    throw new Error('Unauthorized access - please log in again'); 
                }
                throw new Error('Failed to submit test - server responded with an error');
            }
        })        
        .then(data => {
            if (data.success) {
                updateCharts(data.data.results);                 
                updateProgress(data.data.results);   
                updateHardwareInfo(data.hardware);
                updateComplexityInfo(data.data.results);
                console.log('Success:', data);
                Swal.fire({
                    title: 'Success!',
                    text: `Average execution time from ${data.data.testConfig.iterations} iterations: ${data.data.overallAverage}`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to submit test.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    });

    function updateCharts(results) {
        const chartsContainer = document.getElementById('chartsContainer');
        chartsContainer.innerHTML = '';

        results.forEach((result, index) => {
            const canvasId = `chartCanvas${index}`;
            const canvasElement = document.createElement('canvas');
            canvasElement.id = canvasId;
            canvasElement.style.maxWidth = "48%";
            chartsContainer.appendChild(canvasElement);

            const ctx = canvasElement.getContext('2d');
            const labels = result.iterationsResults.map((_, i) => `Iteration ${i + 1}`);
            const data = result.iterationsResults.map(ir => parseFloat(ir.executionTime));

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
        const totalAverage = results.reduce((acc, r) => acc + parseFloat(r.averageExecutionTime), 0) / results.length;
        document.getElementById('averageExecutionTime').textContent = `${totalAverage.toFixed(2)} ms`;

        const executionProgressBar = document.getElementById('executionTimeProgressBar');
        executionProgressBar.style.width = `${Math.min(100, totalAverage / 10 * 100)}%`;
        executionProgressBar.textContent = `${totalAverage.toFixed(2)} ms`;
    }

    function updateHardwareInfo(hardware) {
        const hardwareInfoContainer = document.getElementById('hardwareInfoContainer');
        hardwareInfoContainer.innerHTML = `
            <h5>Hardware Information</h5>
            <table class="table table-bordered">
                <tbody>
                    <tr>
                        <th>OS</th>
                        <td>${hardware.os.type} ${hardware.os.platform} ${hardware.os.release} ${hardware.os.arch}</td>
                    </tr>
                    <tr>
                        <th>CPU</th>
                        <td>${hardware.cpu.model} ${hardware.cpu.speed}</td>
                    </tr>
                    <tr>
                        <th>Total Memory</th>
                        <td>${hardware.totalMemory}</td>
                    </tr>
                    <tr>
                        <th>Free Memory</th>
                        <td>${hardware.freeMemory}</td>
                    </tr>
                    <tr>
                        <th>GPUs</th>
                        <td>${hardware.gpu.map(gpu => `${gpu.model} (${gpu.vram})`).join('<br>')}</td>
                    </tr>
                    <tr>
                        <th>System</th>
                        <td>${hardware.system.manufacturer} ${hardware.system.model} ${hardware.system.version}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    function getDifficultyBadge(difficulty) {
        let badgeClass = 'badge-secondary';
        let difficultyText = 'Unknown';

        if (difficulty >= 0 && difficulty <= 4) {
            badgeClass = 'badge-success';
            difficultyText = 'Low';
        } else if (difficulty >= 5 && difficulty <= 7) {
            badgeClass = 'badge-warning';
            difficultyText = 'Medium';
        } else if (difficulty >= 8) {
            badgeClass = 'badge-danger';
            difficultyText = 'High';
        }

        return `<span class="badge ${badgeClass}">${difficultyText}</span>`;
    }

    function getDifficultyMeter(difficulty) {
        let difficultyLevel = '';
        let meterClass = '';

        if (difficulty >= 0 && difficulty <= 4) {
            difficultyLevel = 'Low';
            meterClass = 'bg-success';
        } else if (difficulty >= 5 && difficulty <= 7) {
            difficultyLevel = 'Medium';
            meterClass = 'bg-warning';
        } else if (difficulty >= 8) {
            difficultyLevel = 'High';
            meterClass = 'bg-danger';
        }

        return `
            <div class="progress">
                <div class="progress-bar ${meterClass}" role="progressbar" style="width: ${difficultyLevel === 'Low' ? 33 : difficultyLevel === 'Medium' ? 66 : 100}%;">
                    ${difficultyLevel}
                </div>
            </div>
        `;
    }

    function updateComplexityInfo(results) {
        const complexityInfoContainer = document.getElementById('complexityInfoContainer');
        complexityInfoContainer.innerHTML = `
            <h5>Complexity Information</h5>
            ${results.map((result, index) => `
                <div class="complexity-info mb-4">
                    <h6>Test Code ${index + 1}</h6>
                    <div class="card">
                        <div class="card-body">
                            <table class="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Total Execution Time</th>
                                        <td>${result.totalExecutionTime}</td>
                                    </tr>
                                    <tr>
                                        <th>Cyclomatic Complexity</th>
                                        <td>${result.complexity.cyclomatic}</td>
                                    </tr>
                                    <tr>
                                        <th>SLOC</th>
                                        <td>Logical: ${result.complexity.sloc.logical}, Physical: ${result.complexity.sloc.physical}</td>
                                    </tr>
                                    <tr>
                                        <th>Difficulty</th>
                                        <td>
                                            ${result.complexity.halstead.difficulty} ${getDifficultyBadge(result.complexity.halstead.difficulty)}
                                            ${getDifficultyMeter(result.complexity.halstead.difficulty)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <h6>Halstead Complexity</h6>
                            <table class="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Operators</th>
                                        <td>Distinct: ${result.complexity.halstead.operators.distinct}, Total: ${result.complexity.halstead.operators.total}</td>
                                    </tr>
                                    <tr>
                                        <th>Operands</th>
                                        <td>Distinct: ${result.complexity.halstead.operands.distinct}, Total: ${result.complexity.halstead.operands.total}</td>
                                    </tr>
                                    <tr>
                                        <th>Vocabulary</th>
                                        <td>${result.complexity.halstead.vocabulary}</td>
                                    </tr>
                                    <tr>
                                        <th>Volume</th>
                                        <td>${result.complexity.halstead.volume}</td>
                                    </tr>
                                    <tr>
                                        <th>Effort</th>
                                        <td>${result.complexity.halstead.effort}</td>
                                    </tr>
                                    <tr>
                                        <th>Bugs</th>
                                        <td>${result.complexity.halstead.bugs}</td>
                                    </tr>
                                    <tr>
                                        <th>Time</th>
                                        <td>${result.complexity.halstead.time}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <h6>Identifiers and Operands</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            Operators
                                        </div>
                                        <div class="card-body identifier-table">
                                            <textarea class="form-control" readonly>${result.complexity.halstead.operators.identifiers.join(', ')}</textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            Operands
                                        </div>
                                        <div class="card-body identifier-table">
                                            <textarea class="form-control" readonly>${result.complexity.halstead.operands.identifiers.join(', ')}</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    }
});
