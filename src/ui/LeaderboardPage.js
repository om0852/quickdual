const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});

async function loadLeaderboard() {
    const listElement = document.getElementById('leaderboardList');

    try {
        const response = await fetch(`${API_URL}/scores/leaderboard`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            renderScores(data.data);
        } else {
            listElement.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No scores yet. Be the first!</p>';
        }
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);

        // Fallback to local
        const localScores = JSON.parse(localStorage.getItem('quickqual_scores') || '[]');
        if (localScores.length > 0) {
            renderScores(localScores.map(s => ({ playerName: s.name, score: s.score })));

            const banner = document.createElement('div');
            banner.style.textAlign = 'center';
            banner.style.color = '#ff9800';
            banner.style.marginBottom = '20px';
            banner.innerText = 'Showing local scores (Network Error)';
            listElement.prepend(banner);
        } else {
            listElement.innerHTML = '<p style="text-align: center; color: #ff4757; padding: 20px;">Failed to load leaderboard.</p>';
        }
    }
}

function renderScores(scores) {
    const listElement = document.getElementById('leaderboardList');
    listElement.innerHTML = scores.map((score, index) => `
    <div class="leaderboard-entry">
      <span class="leaderboard-rank">#${index + 1}</span>
      <span class="leaderboard-name">${escapeHtml(score.playerName || score.name)}</span>
      <span class="leaderboard-score">${score.score}</span>
    </div>
  `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
