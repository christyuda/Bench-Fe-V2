document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/api/count-js')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateChart(data.data);
            updatePercentageStats(data.data);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Failed to load data');
    });

    function updateChart(data) {
        const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#fd7e14", "#6f42c1"]; // Daftar warna
        const sortedData = data.sort((a, b) => b.count - a.count); // Urutkan data berdasarkan 'count'
    
        const ctx = document.getElementById('horizontalBarChart').getContext('2d');
        if (window.resultsChart) window.resultsChart.destroy();
    
        window.resultsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedData.map(item => item.javascriptType),
                datasets: [{
                    data: sortedData.map(item => item.count),
                    backgroundColor: sortedData.map((_, index) => colors[index % colors.length]) // Gunakan warna berdasarkan index
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    

    function updatePercentageStats(data) {
        const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#fd7e14", "#6f42c1"]; // Same color order as chart
        const sortedData = data.sort((a, b) => b.count - a.count); // Ensure order matches chart
        const totalCount = sortedData.reduce((acc, item) => acc + item.count, 0);
    
        const container = document.querySelector('.col-md-6.d-flex');
        container.innerHTML = ''; // Clear existing content
    
        sortedData.forEach((item, index) => {
            const percent = ((item.count / totalCount) * 100).toFixed(2);
            const div = document.createElement('div');
            div.className = 'd-flex align-items-center my-1'; // Margin for spacing, adjust as needed
            div.style.flexBasis = '50%'; // Set each item to take half of the container's width
            div.innerHTML = `
                <span class="text-primary me-2"><i class="bx bxs-circle" style="color: ${colors[index % colors.length]};"></i></span>
                <div>
                    <p class="mb-2">${item.javascriptType}</p>
                    <h5>${percent}%</h5>
                </div>
            `;
            container.appendChild(div);
        });
    }
    

});
