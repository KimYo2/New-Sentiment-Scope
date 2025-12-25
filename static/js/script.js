// --- Auth Logic ---
const Auth = {
    TOKEN_KEY: 'sentiment_jwt_token',
    USER_KEY: 'sentiment_user_info',
    API_LOGIN: '/auth/login',
    API_REGISTER: '/auth/register',
    API_ME: '/auth/me',

    async login(username, password) {
        try {
            const response = await fetch(this.API_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                this.setToken(data.access_token);
                this.setUser(data.user);
                return true;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.reload();
    },

    setToken(token) { localStorage.setItem(this.TOKEN_KEY, token); },
    getToken() { return localStorage.getItem(this.TOKEN_KEY); },
    setUser(user) { localStorage.setItem(this.USER_KEY, JSON.stringify(user)); },
    getUser() { return JSON.parse(localStorage.getItem(this.USER_KEY)); },
    isLoggedIn() { return !!this.getToken(); },

    async fetchAuth(url, options = {}) {
        const token = this.getToken();
        if (!token) return null;
        const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
        return fetch(url, { ...options, headers });
    }
};

// --- DOM Elements ---
const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const resultCard = document.getElementById('resultCard');
const sentimentLabel = document.getElementById('sentimentLabel');
const sentimentIcon = document.getElementById('sentimentIcon');
const sentimentDesc = document.getElementById('sentimentDesc');
const confidenceScore = document.getElementById('confidenceScore');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const authButtons = document.getElementById('auth_buttons');
const confirmLoginBtn = document.getElementById('confirmLoginBtn');

// Views
const analyzeView = document.getElementById('analyze_view');
const dashboardView = document.getElementById('dashboard_view');
const socialView = document.getElementById('social_view');
const batchView = document.getElementById('batch_view');
const guideView = document.getElementById('guide_view');
const aboutView = document.getElementById('about_view');

// Helper function for CTA button
function scrollToAnalysis() {
    const tabNav = document.querySelector('.flex.justify-center.mb-8');
    if (tabNav) {
        tabNav.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Ensure analyze tab is active
        switchTab('analyze');
    }
}

// NEW: Persona Page Navigation
function showPersonaPage(persona) {
    // Hide all persona pages and welcome screen
    document.getElementById('welcome_screen').classList.add('hidden');
    document.getElementById('umkm_page').classList.add('hidden');
    document.getElementById('creator_page').classList.add('hidden');
    document.getElementById('brand_page').classList.add('hidden');

    // Hide original tab navigation (will be replaced by persona-specific tabs)
    const originalTabNav = document.querySelector('.flex.justify-center.mb-8.animate-fade-in');
    if (originalTabNav) originalTabNav.classList.add('hidden');

    // Show selected persona page
    if (persona === 'umkm') {
        document.getElementById('umkm_page').classList.remove('hidden');
        switchTab('analyze'); // Default to single analysis for UMKM
    } else if (persona === 'creator') {
        document.getElementById('creator_page').classList.remove('hidden');
        switchTab('social'); // Default to YouTube for Creator
    } else if (persona === 'brand') {
        document.getElementById('brand_page').classList.remove('hidden');
        switchTab('social'); // Default to YouTube for Brand
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToWelcome() {
    // Hide all persona pages
    document.getElementById('umkm_page').classList.add('hidden');
    document.getElementById('creator_page').classList.add('hidden');
    document.getElementById('brand_page').classList.add('hidden');

    // Hide all content views
    hideAllViews();

    // Show welcome screen
    document.getElementById('welcome_screen').classList.remove('hidden');

    // Hide original tab navigation
    const originalTabNav = document.querySelector('.flex.justify-center.mb-8.animate-fade-in');
    if (originalTabNav) originalTabNav.classList.add('hidden');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAllViews() {
    const views = [analyzeView, dashboardView, socialView, batchView, guideView, aboutView];
    views.forEach(view => view && view.classList.add('hidden'));
}

// Initialize: Hide tab navigation on first load
function initializePersonaPages() {
    // Hide original tab navigation initially
    const originalTabNav = document.querySelector('.flex.justify-center.mb-8.animate-fade-in');
    if (originalTabNav) originalTabNav.classList.add('hidden');

    // Hide all content views initially
    hideAllViews();

    // Make sure welcome screen is visible
    document.getElementById('welcome_screen').classList.remove('hidden');
}

// Page Navigation
function showPage(page) {
    // Hide everything first
    const views = [analyzeView, dashboardView, socialView, batchView, guideView, aboutView];
    views.forEach(v => v && v.classList.add('hidden'));

    // Hide welcome screen and persona pages
    document.getElementById('welcome_screen').classList.add('hidden');
    document.getElementById('umkm_page').classList.add('hidden');
    document.getElementById('creator_page').classList.add('hidden');
    document.getElementById('brand_page').classList.add('hidden');

    // Hide original tab navigation
    const originalTabNav = document.querySelector('.flex.justify-center.mb-8.animate-fade-in');
    if (originalTabNav) originalTabNav.classList.add('hidden');

    if (page === 'home') {
        // Show welcome screen
        document.getElementById('welcome_screen').classList.remove('hidden');
    } else if (page === 'guide') {
        guideView.classList.remove('hidden');
    } else if (page === 'about') {
        aboutView.classList.remove('hidden');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tabs
const tabAnalyze = document.getElementById('tab_analyze');
const tabDashboard = document.getElementById('tab_dashboard');
const tabSocial = document.getElementById('tab_social');
const tabBatch = document.getElementById('tab_batch');

// Social Elements
const socialUrl = document.getElementById('socialUrl');
const analyzeSocialBtn = document.getElementById('analyzeSocialBtn');
const socialResult = document.getElementById('socialResult');
const socialCommentsList = document.getElementById('socialCommentsList');
const socialPos = document.getElementById('socialPos');
const socialNeg = document.getElementById('socialNeg');
const socialNeu = document.getElementById('socialNeu');

// Aspect Elements
const aspectSection = document.getElementById('aspectSection');
const aspectList = document.getElementById('aspectList');

// Stats Elements
const totalCountEl = document.getElementById('totalCount');
const barPos = document.getElementById('barPos');
const barNeg = document.getElementById('barNeg');
const barNeu = document.getElementById('barNeu');
const countPos = document.getElementById('countPos');
const countNeg = document.getElementById('countNeg');
const countNeu = document.getElementById('countNeu');

// Batch Elements
const batchFile = document.getElementById('batchFile');
const dropZone = document.getElementById('dropZone');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFileBtn');
const analyzeBatchBtn = document.getElementById('analyzeBatchBtn');
const batchResult = document.getElementById('batchResult');
const batchTableBody = document.getElementById('batchTableBody');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const batchPos = document.getElementById('batchPos');
const batchNeg = document.getElementById('batchNeg');
const batchNeu = document.getElementById('batchNeu');
let batchData = [];

// Styles
const sentimentStyles = {
    'Positif': { color: '#A6E3C5', icon: '😊', desc: 'Sentimen positif kuat terdeteksi.' },
    'Negatif': { color: '#F5B8C2', icon: '😔', desc: 'Sentimen negatif terdeteksi.' },
    'Netral': { color: '#BFD7EE', icon: '😐', desc: 'Sentimen netral atau objektif.' }
};

// --- Initialization ---
function init() {
    checkAuthState();
    loadHistory();
    initializePersonaPages(); // NEW: Initialize persona page system

    // Event Listeners
    if (inputText) inputText.addEventListener('input', updateCharCount);
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeSentiment);
    if (clearBtn) clearBtn.addEventListener('click', clearInput);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

    if (confirmLoginBtn) confirmLoginBtn.addEventListener('click', handleLogin);
    if (analyzeSocialBtn) analyzeSocialBtn.addEventListener('click', analyzeSocialMedia);

    // Batch Listeners
    if (batchFile) batchFile.addEventListener('change', handleFileSelect);
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-[#6FB8FF]', 'bg-[#F8FBFF]'); });
        dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('border-[#6FB8FF]', 'bg-[#F8FBFF]'); });
        dropZone.addEventListener('drop', handleFileDrop);
    }
    if (removeFileBtn) removeFileBtn.addEventListener('click', removeFile);
    if (analyzeBatchBtn) analyzeBatchBtn.addEventListener('click', analyzeBatch);
    if (downloadCsvBtn) downloadCsvBtn.addEventListener('click', downloadBatchCsv);
}

function checkAuthState() {
    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        authButtons.innerHTML = `
            <span class="text-sm font-medium text-[#1A1F36] mr-2">Hi, ${user ? user.username : 'User'}</span>
            <button onclick="Auth.logout()" class="text-sm font-medium text-[#667085] hover:text-[#F5B8C2] transition-colors">Keluar</button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="/register" class="px-5 py-2 rounded-xl text-[#667085] text-sm font-semibold hover:text-[#1A1F36] transition-colors mr-2">Daftar</a>
            <button onclick="document.getElementById('loginModal').classList.remove('hidden')" class="px-5 py-2 rounded-xl bg-white text-[#1A1F36] text-sm font-semibold shadow-sm border border-[#E2E8F0] hover:bg-[#F8FBFF] transition-all">Masuk</button>
        `;
    }
}

async function handleLogin() {
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    const err = document.getElementById('loginError');

    try {
        await Auth.login(u, p);
        document.getElementById('loginModal').classList.add('hidden');
        checkAuthState();
        loadHistory(); // Reload history from server
        loadDashboardData(); // Reload dashboard if active
    } catch (e) {
        err.textContent = e.message;
        err.classList.remove('hidden');
    }
}

function updateCharCount() {
    const len = inputText.value.length;
    charCount.textContent = `${len} / 500 karakter`;
    if (len > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
}

function clearInput() {
    inputText.value = '';
    updateCharCount();
    resultCard.classList.add('hidden');
}

async function analyzeSentiment() {
    const text = inputText.value.trim();
    if (!text) return;

    // Loading State
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganalisis...';
    analyzeBtn.disabled = true;

    try {
        // Determine API endpoint based on auth
        const url = Auth.isLoggedIn() ? '/api/classify' : '/api/classify';

        const headers = { 'Content-Type': 'application/json' };
        if (Auth.isLoggedIn()) {
            headers['Authorization'] = `Bearer ${Auth.getToken()}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text_input: text })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Analysis failed');
        }

        const result = await response.json();
        showResult(result);
        loadHistory(); // Refresh history

    } catch (error) {
        alert(error.message || 'Terjadi kesalahan saat analisis.');
        console.error(error);
    } finally {
        analyzeBtn.innerHTML = '<span>Analisis Sekarang</span><i class="fas fa-arrow-right text-xs"></i>';
        analyzeBtn.disabled = false;
    }
}

function showResult(data) {
    const style = sentimentStyles[data.sentiment] || sentimentStyles['Netral'];

    sentimentLabel.textContent = data.sentiment;
    sentimentLabel.style.color = style.color.replace('0.2', '1'); // Use solid color
    sentimentIcon.textContent = style.icon;
    sentimentDesc.textContent = style.desc;
    confidenceScore.textContent = `${Math.round(data.confidence * 100)}% Confidence`;

    // Handle Aspects
    if (data.aspects && data.aspects.length > 0) {
        aspectSection.classList.remove('hidden');
        aspectList.innerHTML = data.aspects.map(a => {
            const aStyle = sentimentStyles[a.sentiment] || sentimentStyles['Netral'];
            const bgColor = aStyle.color;
            return `
                <div class="px-3 py-1 rounded-full text-xs font-medium text-[#1A1F36] flex items-center gap-2 border border-black/5" style="background-color: ${bgColor}">
                    <span class="font-bold">${a.aspect}:</span>
                    <span>${a.sentiment}</span>
                </div>
            `;
        }).join('');
    } else {
        aspectSection.classList.add('hidden');
    }

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function loadHistory() {
    let history = [];
    if (Auth.isLoggedIn()) {
        try {
            const res = await Auth.fetchAuth('/api/history');
            if (res && res.ok) {
                const data = await res.json();
                history = data.history;
            }
        } catch (e) { console.error("History fetch error", e); }
    } else {
        history = JSON.parse(sessionStorage.getItem('sentimentHistory') || '[]');
    }

    renderHistory(history);
    updateStats(history);
}

function renderHistory(history) {
    if (history.length === 0) {
        historyList.innerHTML = `<tr><td colspan="2" class="py-8 text-center"><p class="text-[#94A3B8]">Belum ada riwayat</p></td></tr>`;
        clearHistoryBtn.classList.add('hidden');
        return;
    }

    if (!Auth.isLoggedIn()) clearHistoryBtn.classList.remove('hidden');
    else clearHistoryBtn.classList.add('hidden');

    historyList.innerHTML = history.map(item => {
        const style = sentimentStyles[item.sentiment] || sentimentStyles['Netral'];
        const time = new Date(item.created_at || item.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });

        let actionBtn = '';
        if (Auth.isLoggedIn()) {
            actionBtn = `
                <button onclick="openFeedbackModal(${item.id})" class="ml-2 text-[10px] text-[#94A3B8] hover:text-[#6FB8FF] transition-colors" title="Koreksi Sentimen">
                    <i class="fas fa-pen"></i>
                </button>
            `;
        }

        return `
            <tr class="border-b border-[#EEF2F7] last:border-0 hover:bg-[#F8FBFF] transition-colors">
                <td class="py-3 pl-2">
                    <p class="text-[#1A1F36] font-medium line-clamp-2" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</p>
                    <p class="text-[10px] text-[#94A3B8]">${time}</p>
                </td>
                <td class="py-3 pr-2 text-right align-top">
                    <div class="flex flex-col items-end gap-1">
                        <span class="inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#1A1F36]" style="background-color: ${style.color}">${item.sentiment}</span>
                        ${actionBtn}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStats(history) {
    if (!history) history = [];
    const total = history.length;
    totalCountEl.textContent = total;

    if (total === 0) {
        barPos.style.width = '0%'; barNeg.style.width = '0%'; barNeu.style.width = '0%';
        countPos.textContent = '0%'; countNeg.textContent = '0%'; countNeu.textContent = '0%';
        return;
    }

    const pos = history.filter(i => i.sentiment === 'Positif').length;
    const neg = history.filter(i => i.sentiment === 'Negatif').length;
    const neu = history.filter(i => i.sentiment === 'Netral').length;

    const posPct = Math.round((pos / total) * 100);
    const negPct = Math.round((neg / total) * 100);
    const neuPct = Math.round((neu / total) * 100);

    setTimeout(() => {
        barPos.style.width = `${posPct}%`;
        barNeg.style.width = `${negPct}%`;
        barNeu.style.width = `${neuPct}%`;
    }, 100);

    countPos.textContent = `${posPct}%`;
    countNeg.textContent = `${negPct}%`;
    countNeu.textContent = `${neuPct}%`;
}

function clearHistory() {
    sessionStorage.removeItem('sentimentHistory');
    loadHistory();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Dashboard Logic ---
let trendChartInstance = null;

function switchTab(tab) {
    localStorage.setItem('currentTab', tab);

    // Reset all content views
    // Check if battle_view exists before trying to access it
    const battleView = document.getElementById('battle_view');
    [analyzeView, dashboardView, socialView, batchView].forEach(el => el && el.classList.add('hidden'));
    if (battleView) battleView.classList.add('hidden');

    // Get all tab buttons (original + persona-specific)
    const allTabButtons = [
        tabAnalyze, tabDashboard, tabSocial, tabBatch,
        document.getElementById('umkm_tab_single'),
        document.getElementById('umkm_tab_batch'),
        document.getElementById('umkm_tab_dashboard'),
        document.getElementById('creator_tab_youtube'),
        document.getElementById('creator_tab_dashboard'),
        document.getElementById('brand_tab_youtube'),
        document.getElementById('brand_tab_battle'),
        document.getElementById('brand_tab_dashboard')
    ];

    // Reset all tab button styles
    allTabButtons.forEach(el => {
        if (el) {
            el.classList.remove('bg-white', 'text-[#1A1F36]', 'shadow-sm');
            el.classList.add('text-[#667085]');
        }
    });

    // Activate selected tab based on current persona
    if (tab === 'analyze') {
        analyzeView.classList.remove('hidden');
        const activeBtn = document.getElementById('umkm_tab_single') || tabAnalyze;
        if (activeBtn) {
            activeBtn.classList.add('bg-white', 'text-[#1A1F36]', 'shadow-sm');
            activeBtn.classList.remove('text-[#667085]');
        }
    } else if (tab === 'dashboard') {
        dashboardView.classList.remove('hidden');
        // Check which persona page is active
        const umkmBtn = document.getElementById('umkm_tab_dashboard');
        const creatorBtn = document.getElementById('creator_tab_dashboard');
        const brandBtn = document.getElementById('brand_tab_dashboard');

        const activeBtn = (umkmBtn && !document.getElementById('umkm_page').classList.contains('hidden')) ? umkmBtn :
            (creatorBtn && !document.getElementById('creator_page').classList.contains('hidden')) ? creatorBtn :
                (brandBtn && !document.getElementById('brand_page').classList.contains('hidden')) ? brandBtn : tabDashboard;
        if (activeBtn) {
            activeBtn.classList.add('bg-white', 'text-[#1A1F36]', 'shadow-sm');
            activeBtn.classList.remove('text-[#667085]');
        }
        loadDashboardData();
    } else if (tab === 'social') {
        socialView.classList.remove('hidden');
        // Check which persona page is active
        const creatorBtn = document.getElementById('creator_tab_youtube');
        const brandBtn = document.getElementById('brand_tab_youtube');
        const activeBtn = (creatorBtn && !document.getElementById('creator_page').classList.contains('hidden')) ? creatorBtn :
            (brandBtn && !document.getElementById('brand_page').classList.contains('hidden')) ? brandBtn : tabSocial;
        if (activeBtn) {
            activeBtn.classList.add('bg-white', 'text-[#1A1F36]', 'shadow-sm');
            activeBtn.classList.remove('text-[#667085]');
        }
    } else if (tab === 'batch') {
        batchView.classList.remove('hidden');
        const activeBtn = document.getElementById('umkm_tab_batch') || tabBatch;
        if (activeBtn) {
            activeBtn.classList.add('bg-white', 'text-[#1A1F36]', 'shadow-sm');
            activeBtn.classList.remove('text-[#667085]');
        }
    } else if (tab === 'battle') {
        document.getElementById('battle_view').classList.remove('hidden');
        const activeBtn = document.getElementById('brand_tab_battle');
        if (activeBtn) {
            activeBtn.classList.add('bg-white', 'text-[#1A1F36]', 'shadow-sm');
            activeBtn.classList.remove('text-[#667085]');
        }
    }
}

// --- Batch Logic ---
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) showFileInfo(file);
}

function handleFileDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('border-[#6FB8FF]', 'bg-[#F8FBFF]');
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
        batchFile.files = e.dataTransfer.files;
        showFileInfo(file);
    } else {
        alert('Harap upload file CSV atau Excel.');
    }
}

function showFileInfo(file) {
    fileName.textContent = file.name;
    fileInfo.classList.remove('hidden');
    dropZone.classList.add('hidden');
    analyzeBatchBtn.disabled = false;
}

function removeFile() {
    batchFile.value = '';
    fileInfo.classList.add('hidden');
    dropZone.classList.remove('hidden');
    analyzeBatchBtn.disabled = true;
    batchResult.classList.add('hidden');
    batchData = [];
}

async function analyzeBatch() {
    const file = batchFile.files[0];
    if (!file) return;

    analyzeBatchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    analyzeBatchBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const token = Auth.getToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/batch-classify', {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal memproses file');

        batchData = data.results;
        renderBatchResults(data);

    } catch (error) {
        alert(error.message);
    } finally {
        analyzeBatchBtn.innerHTML = 'Mulai Analisis Batch';
        analyzeBatchBtn.disabled = false;
    }
}

function renderBatchResults(data) {
    batchPos.textContent = data.stats.Positif;
    batchNeg.textContent = data.stats.Negatif;
    batchNeu.textContent = data.stats.Netral;

    // Show product stats if available (NEW for UMKM)
    if (data.has_products && data.product_stats) {
        // Create product ranking section
        const productRankingHtml = `
            <div class="glass-card rounded-3xl p-6 shadow-soft border border-white/50 mb-6">
                <h4 class="text-[#1A1F36] font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-trophy text-yellow-500"></i>
                    Performa per Produk
                </h4>
                <div class="space-y-3">
                    ${Object.entries(data.product_stats)
                .sort((a, b) => b[1].positive_pct - a[1].positive_pct)
                .map(([product, stats]) => {
                    const posColor = stats.positive_pct >= 70 ? 'text-green-600' : stats.positive_pct >= 50 ? 'text-yellow-600' : 'text-red-600';
                    return `
                                <div class="flex items-center justify-between p-3 bg-[#F8FBFF] rounded-xl">
                                    <div class="flex-1">
                                        <span class="font-semibold text-[#1A1F36]">${escapeHtml(product)}</span>
                                        <div class="flex gap-2 mt-1 text-xs">
                                            <span class="text-green-600">${stats.Positif} positif</span>
                                            <span class="text-red-600">${stats.Negatif} negatif</span>
                                            <span class="text-gray-600">${stats.Netral} netral</span>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-2xl font-bold ${posColor}">${stats.positive_pct}%</div>
                                        <div class="text-xs text-gray-500">positif</div>
                                    </div>
                                </div>
                            `;
                }).join('')}
                </div>
            </div>
        `;

        // Insert product ranking before table
        const batchTableContainer = document.getElementById('batchResult');
        const firstChild = batchTableContainer.firstElementChild;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = productRankingHtml;
        batchTableContainer.insertBefore(tempDiv.firstElementChild, firstChild.nextSibling);
    }

    // Show smart insights if available (NEW for UMKM)
    if (data.insights && data.insights.length > 0) {
        const insightsHtml = `
            <div class="glass-card rounded-3xl p-6 shadow-soft border border-white/50 mb-6">
                <h4 class="text-[#1A1F36] font-bold mb-4 flex items-center gap-2">
                    <i class="fas fa-lightbulb text-yellow-500"></i>
                    Smart Insights
                </h4>
                <div class="space-y-3">
                    ${data.insights.map(insight => {
            const bgColor = insight.type === 'success' ? 'bg-green-50' :
                insight.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';
            const borderColor = insight.type === 'success' ? 'border-green-200' :
                insight.type === 'warning' ? 'border-yellow-200' : 'border-blue-200';
            return `
                            <div class="${bgColor} ${borderColor} border-l-4 p-4 rounded-lg">
                                <div class="flex items-start gap-3">
                                    <span class="text-2xl">${insight.icon}</span>
                                    <div class="flex-1">
                                        <h5 class="font-bold text-[#1A1F36] text-sm mb-1">${insight.title}</h5>
                                        <p class="text-sm text-[#667085]">${insight.message}</p>
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        // Insert insights before table
        const batchTableContainer = document.getElementById('batchResult');
        const firstChild = batchTableContainer.firstElementChild;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = insightsHtml;
        batchTableContainer.insertBefore(tempDiv.firstElementChild, firstChild.nextSibling);
    }

    // Show top 10 in table
    const previewData = data.results.slice(0, 10);

    batchTableBody.innerHTML = previewData.map(item => {
        const style = sentimentStyles[item.sentiment] || sentimentStyles['Netral'];
        const productCol = item.product ? `<td class="px-4 py-3"><span class="px-2 py-1 bg-gray-100 rounded text-xs">${escapeHtml(item.product)}</span></td>` : '';
        return `
            <tr class="border-b border-[#EEF2F7] hover:bg-[#F8FBFF]">
                ${productCol}
                <td class="px-4 py-3 font-medium text-[#1A1F36] whitespace-normal" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#1A1F36]" style="background-color: ${style.color}">${item.sentiment}</span>
                </td>
                <td class="px-4 py-3 text-[#667085]">${Math.round(item.confidence * 100)}%</td>
            </tr>
        `;
    }).join('');

    // Update table header if product column exists
    if (data.has_products) {
        const tableHeader = document.querySelector('#batchResult table thead tr');
        if (tableHeader && !tableHeader.querySelector('.product-header')) {
            const productHeader = document.createElement('th');
            productHeader.className = 'px-4 py-3 product-header';
            productHeader.textContent = 'Produk';
            tableHeader.insertBefore(productHeader, tableHeader.firstChild);
        }
    }

    batchResult.classList.remove('hidden');
}

function downloadBatchCsv() {
    if (!batchData || batchData.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8,"
        + "Text,Sentiment,Confidence\n"
        + batchData.map(e => `"${e.text.replace(/"/g, '""')}","${e.sentiment}","${e.confidence}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hasil_analisis_sentimen.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.body.removeChild(link);
}

async function analyzeSocialMedia() {
    const url = socialUrl.value.trim();
    if (!url) return;

    analyzeSocialBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    analyzeSocialBtn.disabled = true;
    socialResult.classList.add('hidden');

    try {
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal mengambil data');

        renderSocialResults(data);
    } catch (error) {
        alert(error.message);
    } finally {
        analyzeSocialBtn.innerHTML = 'Analisis';
        analyzeSocialBtn.disabled = false;
    }
}

function renderSocialResults(data) {
    socialPos.textContent = data.stats.Positif;
    socialNeg.textContent = data.stats.Negatif;
    socialNeu.textContent = data.stats.Netral;

    // Store current data for saving (NEW)
    window.currentYoutubeData = {
        url: socialUrl.value.trim(),
        results: data.results,
        stats: data.stats
    };

    socialCommentsList.innerHTML = data.results.map(item => {
        const style = sentimentStyles[item.sentiment] || sentimentStyles['Netral'];
        return `
            <div class="p-3 rounded-xl bg-[#F8FBFF] border border-[#EEF2F7]">
                <div class="flex justify-between items-start mb-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-[#1A1F36]" 
                          style="background-color: ${style.color}">${item.sentiment}</span>
                    <span class="text-[10px] text-[#94A3B8]">${Math.round(item.confidence * 100)}%</span>
                </div>
                <p class="text-sm text-[#3D4458]">${escapeHtml(item.text)}</p>
            </div>
        `;
    }).join('');

    socialResult.classList.remove('hidden');
}

// NEW: Save current YouTube analysis
async function saveCurrentYoutubeAnalysis() {
    if (!window.currentYoutubeData) {
        alert('Tidak ada data untuk disimpan');
        return;
    }

    const labelInput = document.getElementById('saveAnalysisLabel');
    const label = labelInput.value.trim() || 'Untitled Analysis';
    const saveBtn = document.getElementById('saveYoutubeBtn');

    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
    saveBtn.disabled = true;

    try {
        const response = await fetch('/api/youtube/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                label: label,
                video_url: window.currentYoutubeData.url,
                analysis_data: window.currentYoutubeData
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        alert('✅ Analisis berhasil disimpan! Anda bisa compare nanti.');
        labelInput.value = '';
    } catch (error) {
        alert('❌ Gagal menyimpan: ' + error.message);
    } finally {
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Analisis';
        saveBtn.disabled = false;
    }
}


async function loadDashboardData() {
    const loginMsg = document.getElementById('dashboard_login_msg');
    const content = document.getElementById('dashboard_content');

    if (!Auth.isLoggedIn()) {
        loginMsg.classList.remove('hidden');
        content.classList.add('hidden');
        return;
    }

    loginMsg.classList.add('hidden');
    content.classList.remove('hidden');

    try {
        // Fetch Summary Stats (Total, Positive, Negative)
        try {
            const summaryRes = await Auth.fetchAuth('/api/stats/summary');
            if (summaryRes && summaryRes.ok) {
                const summaryData = await summaryRes.json();
                document.getElementById('total_analyses').textContent = summaryData.total;
                document.getElementById('positive_count').textContent = summaryData.positive;
                document.getElementById('negative_count').textContent = summaryData.negative;
            }
        } catch (e) {
            console.error("Summary Stats Error", e);
        }

        // Fetch Trend Data
        const trendRes = await Auth.fetchAuth('/api/stats/trend');
        if (trendRes && trendRes.ok) {
            const trendData = await trendRes.json();
            renderTrendChart(trendData);
        }

        // Fetch Word Cloud Data
        const cloudRes = await Auth.fetchAuth('/api/stats/wordcloud');
        if (cloudRes && cloudRes.ok) {
            const cloudData = await cloudRes.json();
            renderWordCloud(cloudData);
        }
    } catch (e) {
        console.error("Dashboard Load Error", e);
    }
}

function renderTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChartInstance) trendChartInstance.destroy();

    // Data comes pre-formatted from backend
    const labels = data.dates;
    const posData = data.positive;
    const negData = data.negative;
    const neuData = data.neutral;

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Positif', data: posData, borderColor: '#A6E3C5', backgroundColor: 'rgba(166, 227, 197, 0.2)', tension: 0.4, fill: true },
                { label: 'Negatif', data: negData, borderColor: '#F5B8C2', backgroundColor: 'rgba(245, 184, 194, 0.2)', tension: 0.4, fill: true },
                { label: 'Netral', data: neuData, borderColor: '#BFD7EE', backgroundColor: 'rgba(191, 215, 238, 0.2)', tension: 0.4, fill: true }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { font: { family: 'Inter' } } }, tooltip: { callbacks: { label: function (context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.y !== null) { label += context.parsed.y; } return label; } } } },
            scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] }, ticks: { callback: function (value) { if (Number.isInteger(value)) { return value; } } } }, x: { grid: { display: false } } }
        }
    });
}

function renderWordCloud(data) {
    const canvas = document.getElementById('wordCloudCanvas');
    const loading = document.getElementById('wordcloud_loading');
    const container = canvas.parentElement;

    if (!data || data.length === 0) {
        loading.classList.add('hidden');
        // Show empty state
        return;
    }

    loading.classList.remove('hidden');
    const maxWeight = Math.max(...data.map(item => item.weight));
    const list = data.map(item => [item.text, (item.weight / maxWeight) * 50 + 10]);

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Fallback to hide loader
    const loaderTimeout = setTimeout(() => {
        loading.classList.add('hidden');
    }, 2000);

    WordCloud(canvas, {
        list: list,
        gridSize: 8,
        weightFactor: 1,
        fontFamily: 'Inter, sans-serif',
        color: function () {
            const colors = ['#6FB8FF', '#F5B8C2', '#A6E3C5', '#1A1F36', '#667085'];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        rotateRatio: 0.5,
        rotationSteps: 2,
        backgroundColor: 'transparent',
        drawOutOfBound: false,
        shrinkToFit: true,
        onWordCloudStop: function () {
            clearTimeout(loaderTimeout);
            loading.classList.add('hidden');
        }
    });
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('bg-white/40', 'backdrop-blur-xl', 'shadow-soft', 'border-b', 'border-white/30');
        navbar.classList.remove('py-4'); navbar.classList.add('py-3');
    } else {
        navbar.classList.remove('bg-white/40', 'backdrop-blur-xl', 'shadow-soft', 'border-b', 'border-white/30');
        navbar.classList.remove('py-3'); navbar.classList.add('py-4');
    }
});

// Feedback Logic
function openFeedbackModal(id) {
    document.getElementById('feedbackAnalysisId').value = id;
    document.getElementById('feedbackModal').classList.remove('hidden');
}

async function submitFeedback(correction) {
    const id = document.getElementById('feedbackAnalysisId').value;
    const modal = document.getElementById('feedbackModal');

    try {
        const response = await Auth.fetchAuth(`/api/feedback/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correction: correction })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Terima kasih! Masukan Anda telah disimpan.');
            modal.classList.add('hidden');
            loadHistory(); // Reload to show updated data if we were showing corrections
        } else {
            throw new Error(data.message);
        }
    } catch (e) {
        alert('Gagal menyimpan masukan: ' + e.message);
    }
}

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

// Start
document.addEventListener('DOMContentLoaded', init);
