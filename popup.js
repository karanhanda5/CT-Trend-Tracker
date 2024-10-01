
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");

    // Event listener for filter buttons
    filterButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const filter = e.target.dataset.filter;
            chrome.storage.local.get(["trendingData"], (result) => {
                const trendsContainer = document.getElementById("trends");
                trendsContainer.innerHTML = '';

                const now = new Date().getTime();
                const filteredData = result.trendingData.filter(trend => {
                    const timeDiff = now - trend.timestamp;
                    if (filter === "current") {
                        return timeDiff < 3600000; // Last 1 hour
                    } else if (filter === "24hours") {
                        return timeDiff < 86400000; // Last 24 hours
                    } else if (filter === "week") {
                        return timeDiff < 604800000; // Last 7 days
                    }
                });

                // Render the trends
                renderTrends(filteredData);
            });
        });
    });

    // Visualization for trending data
    function renderTrends(trends) {
        const trendsContainer = document.getElementById("trends");
        trendsContainer.innerHTML = '';

        if (trends.length > 0) {
            trends.forEach(trend => {
                const trendElement = document.createElement("div");
                trendElement.className = "trend";
                trendElement.innerHTML = `
                    <h3>${trend.keyword}</h3>
                    <p>Total Mentions: ${trend.totalMentions}</p>
                    <p>Engagement: ${trend.engagement}</p>
                    <p>Sentiment: ${trend.sentiment}</p>
                `;
                trendsContainer.appendChild(trendElement);
            });

            // Display visual chart
            displayChart(trends);
        } else {
            trendsContainer.innerHTML = '<p>No trends available for the selected time range.</p>';
        }
    }

    // Visualization using a simple chart
    function displayChart(trends) {
        const labels = trends.map(trend => trend.keyword);
        const data = trends.map(trend => trend.engagement);

        const ctx = document.getElementById('trendChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Engagement',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
});

