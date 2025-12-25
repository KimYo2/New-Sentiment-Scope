// --- Brand Battle Logic ---
async function startBattle() {
    const urlA = document.getElementById('battleUrlA').value;
    const urlB = document.getElementById('battleUrlB').value;
    const btn = document.getElementById('startBattleBtn');

    if (!urlA || !urlB) {
        alert("Harap masukkan kedua URL YouTube (Brand vs Kompetitor)");
        return;
    }

    // Loading State
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bertarung...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/brand/battle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Optional if needed
            },
            body: JSON.stringify({ url_a: urlA, url_b: urlB })
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
            renderBattleResult(data);
        } else {
            alert("Battle Error: " + (data.message || "Unknown error"));
        }
    } catch (e) {
        console.error("Battle Error", e);
        alert("Terjadi kesalahan saat menghubungi server.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function renderBattleResult(data) {
    const resultSection = document.getElementById('battleResult');
    resultSection.classList.remove('hidden');

    // Update Stats A
    document.getElementById('scoreA').textContent = data.brand_a.positive_pct + '%';
    document.getElementById('posA').textContent = data.brand_a.stats.Positif;
    document.getElementById('negA').textContent = data.brand_a.stats.Negatif;

    // Update Stats B
    document.getElementById('scoreB').textContent = data.brand_b.positive_pct + '%';
    document.getElementById('posB').textContent = data.brand_b.stats.Positif;
    document.getElementById('negB').textContent = data.brand_b.stats.Negatif;

    // Update Verdict
    const verdictEl = document.getElementById('battleVerdict');
    const gap = data.verdict.gap;

    // Dynamic Verdict Colors
    let colorClass, icon;
    if (gap > 0) {
        // Winning
        colorClass = "from-green-50 to-emerald-50 border-green-200";
        icon = "fa-trophy text-yellow-500";
    } else {
        // Losing
        colorClass = "from-red-50 to-orange-50 border-red-200";
        icon = "fa-exclamation-triangle text-red-500";
    }

    verdictEl.className = `glass-card rounded-2xl p-6 bg-gradient-to-r ${colorClass} border flex items-center justify-between`;

    verdictEl.innerHTML = `
        <div>
            <h4 class="text-xl font-bold text-[#1A1F36] mb-1">${data.verdict.title}</h4>
            <p class="text-sm text-[#64748B]">${data.verdict.message}</p>
        </div>
        <div class="text-3xl">
            <i class="fas ${icon}"></i>
        </div>
    `;

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
}
