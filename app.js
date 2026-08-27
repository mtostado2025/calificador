/**
 * ==========================================================
 * ESTOL EQUIPOS MÉDICOS - CSAT TABLET KIOSK CONTROLLER
 * ==========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO Y VARIABLES GLOBALES ---
    let currentRating = null;      // 'excelente', 'regular', 'mala'
    let currentScore = null;       // 3, 2, 1
    let selectedMotivos = [];
    let autoResetTimer = null;
    let countdownInterval = null;
    let currentCountdownSeconds = 0;
    let currentEnteredPin = '';
    let brandTapCount = 0;
    let brandTapTimer = null;



    // --- ELEMENTOS DEL DOM ---
    const viewRating = document.getElementById('viewRating');
    const viewHappy = document.getElementById('viewHappy');
    const viewFeedback = document.getElementById('viewFeedback');
    const viewThanks = document.getElementById('viewThanks');

    const btnHappy = document.getElementById('btnHappy');
    const btnNeutral = document.getElementById('btnNeutral');
    const btnSad = document.getElementById('btnSad');

    const googleQrContainer = document.getElementById('googleQrContainer');
    const btnDirectGoogleReview = document.getElementById('btnDirectGoogleReview');
    const countdownSecondsHappy = document.getElementById('countdownSecondsHappy');
    const countdownFillHappy = document.getElementById('countdownFillHappy');

    const motivosContainer = document.getElementById('motivosContainer');
    const feedbackComment = document.getElementById('feedbackComment');
    const btnSubmitFeedback = document.getElementById('btnSubmitFeedback');
    const btnSkipFeedback = document.getElementById('btnSkipFeedback');
    const feedbackHeaderIcon = document.getElementById('feedbackHeaderIcon');
    const feedbackTitleText = document.getElementById('feedbackTitleText');
    const countdownSecondsFeedback = document.getElementById('countdownSecondsFeedback');
    const countdownFillFeedback = document.getElementById('countdownFillFeedback');

    const countdownSecondsThanks = document.getElementById('countdownSecondsThanks');
    const countdownFillThanks = document.getElementById('countdownFillThanks');

    const btnSoundToggle = document.getElementById('btnSoundToggle');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const brandLogoTrigger = document.getElementById('brandLogoTrigger');
    const footerAdminTrigger = document.getElementById('footerAdminTrigger');

    // Admin Modal Elements
    const adminModal = document.getElementById('adminModal');
    const btnCloseAdminModal = document.getElementById('btnCloseAdminModal');
    const adminPinSection = document.getElementById('adminPinSection');
    const adminDashboardSection = document.getElementById('adminDashboardSection');
    const adminConfigSection = document.getElementById('adminConfigSection');
    const pinDots = document.querySelectorAll('.pin-dot');
    const numButtons = document.querySelectorAll('.num-btn[data-num]');
    const btnPinClear = document.getElementById('btnPinClear');
    const btnPinDelete = document.getElementById('btnPinDelete');

    // Admin Stats Elements
    const metricTotal = document.getElementById('metricTotal');
    const metricCSAT = document.getElementById('metricCSAT');
    const metricHappy = document.getElementById('metricHappy');
    const metricSad = document.getElementById('metricSad');
    const pctHappy = document.getElementById('pctHappy');
    const pctNeutral = document.getElementById('pctNeutral');
    const pctSad = document.getElementById('pctSad');
    const countHappy = document.getElementById('countHappy');
    const countNeutral = document.getElementById('countNeutral');
    const countSad = document.getElementById('countSad');
    const barHappy = document.getElementById('barHappy');
    const barNeutral = document.getElementById('barNeutral');
    const barSad = document.getElementById('barSad');
    const tableVotesBody = document.getElementById('tableVotesBody');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnEditConfig = document.getElementById('btnEditConfig');
    const btnSaveConfig = document.getElementById('btnSaveConfig');
    const btnBackToStats = document.getElementById('btnBackToStats');

    // Cfg Inputs
    const cfgGoogleUrl = document.getElementById('cfgGoogleUrl');
    const cfgAdminPin = document.getElementById('cfgAdminPin');
    const cfgSucursal = document.getElementById('cfgSucursal');
    const footerBranchText = document.getElementById('footerBranchText');

    // --- INICIALIZACIÓN DE LA UI ---
    function initUI() {
        // Garantizar que no haya URL rota de place ID
        if (!APP_CONFIG.googleMapsUrl || APP_CONFIG.googleMapsUrl.includes('ChIJ8_e-82WEn5UR-n56_Lw5Lvg')) {
            APP_CONFIG.googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Estol+Equipos+Medicos+Martin+Garcia+Montevideo';
        }

        if (footerBranchText) footerBranchText.textContent = '📍 ' + (APP_CONFIG.sucursalDefault || 'Casa Central');
        if (btnDirectGoogleReview) btnDirectGoogleReview.href = APP_CONFIG.googleMapsUrl;
        renderMotivosTags();
        generateGoogleQR();
        updateSoundButton();
    }

    // --- SISTEMA DE NAVEGACIÓN ENTRE PANTALLAS ---
    function showView(viewId) {
        clearAllTimers();

        [viewRating, viewHappy, viewFeedback, viewThanks].forEach(view => {
            if (view) {
                view.classList.remove('active');
                view.style.display = 'none';
            }
        });

        const target = document.getElementById(viewId);
        if (target) {
            target.style.display = 'flex';
            setTimeout(() => target.classList.add('active'), 20);
        }

        if (viewId === 'viewHappy') {
            if (btnDirectGoogleReview) btnDirectGoogleReview.href = APP_CONFIG.googleMapsUrl || APP_CONFIG.googleMapsQueryFallback;
            generateGoogleQR();
        }
    }

    function clearAllTimers() {
        if (autoResetTimer) clearTimeout(autoResetTimer);
        if (countdownInterval) clearInterval(countdownInterval);
        autoResetTimer = null;
        countdownInterval = null;
    }

    function resetToHome() {
        clearAllTimers();
        currentRating = null;
        currentScore = null;
        selectedMotivos = [];
        if (feedbackComment) feedbackComment.value = '';
        document.querySelectorAll('.tag-btn.selected').forEach(btn => btn.classList.remove('selected'));
        showView('viewRating');
    }

    // --- TEMPORIZADOR CON BARRA DE CUENTA REGRESIVA ---
    function startCountdown(seconds, secondsElem, barElem, onComplete) {
        currentCountdownSeconds = seconds;
        if (secondsElem) secondsElem.textContent = seconds;
        if (barElem) {
            barElem.style.transition = 'none';
            barElem.style.transform = 'scaleX(1)';
            setTimeout(() => {
                barElem.style.transition = `transform ${seconds}s linear`;
                barElem.style.transform = 'scaleX(0)';
            }, 50);
        }

        countdownInterval = setInterval(() => {
            currentCountdownSeconds--;
            if (secondsElem) secondsElem.textContent = Math.max(0, currentCountdownSeconds);
            if (currentCountdownSeconds <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        autoResetTimer = setTimeout(() => {
            if (typeof onComplete === 'function') onComplete();
            else resetToHome();
        }, seconds * 1000);
    }

    // --- GENERADOR DE QR ---
    function generateGoogleQR() {
        if (!googleQrContainer) return;
        googleQrContainer.innerHTML = '';
        const targetUrl = APP_CONFIG.googleMapsUrl || APP_CONFIG.googleMapsQueryFallback;
        if (window.QRCodeCustom) {
            new window.QRCodeCustom(googleQrContainer, {
                text: targetUrl,
                width: 170,
                height: 170,
                colorDark: '#0f172a',
                colorLight: '#ffffff'
            });
        }
    }

    if (btnDirectGoogleReview) {
        btnDirectGoogleReview.addEventListener('click', (e) => {
            const targetUrl = APP_CONFIG.googleMapsUrl || APP_CONFIG.googleMapsQueryFallback;
            btnDirectGoogleReview.href = targetUrl;
        });
    }

    // --- RENDERIZADO DE MOTIVOS DE MEJORA ---
    function renderMotivosTags() {
        if (!motivosContainer) return;
        motivosContainer.innerHTML = '';

        const items = APP_CONFIG.motivosMejora || [];
        items.forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tag-btn';
            btn.dataset.id = item.id;
            btn.innerHTML = `<span class="tag-icon">${item.icon}</span> <span>${item.label}</span>`;

            btn.addEventListener('click', () => {
                playClickSound();
                btn.classList.toggle('selected');
                const idx = selectedMotivos.indexOf(item.label);
                if (idx > -1) {
                    selectedMotivos.splice(idx, 1);
                } else {
                    selectedMotivos.push(item.label);
                }
            });

            motivosContainer.appendChild(btn);
        });
    }

    // --- EFECTOS DE SONIDO WEB AUDIO API (100% NATIVO) ---
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx && AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Desbloquear audio en el primer toque/clic en móviles y tablets
    const unlockAudio = () => {
        getAudioContext();
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });

    function playSoundTone(freq, type = 'sine', duration = 0.2, delay = 0, gainLevel = 0.15) {
        if (!APP_CONFIG.sonidoHabilitado) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + duration);
            }, delay * 1000);
        } catch (e) {
            console.warn('Audio feedback error:', e);
        }
    }

    function playHappyFanfare() {
        // Melodía triunfal en Do mayor
        playSoundTone(523.25, 'sine', 0.2, 0.0);   // C5
        playSoundTone(659.25, 'sine', 0.2, 0.08);  // E5
        playSoundTone(783.99, 'sine', 0.2, 0.16);  // G5
        playSoundTone(1046.50, 'triangle', 0.4, 0.24); // C6
    }

    function playNeutralSound() {
        playSoundTone(440, 'sine', 0.18, 0.0);
        playSoundTone(554.37, 'sine', 0.25, 0.09);
    }

    function playClickSound() {
        playSoundTone(600, 'sine', 0.08, 0.0, 0.08);
    }

    function updateSoundButton() {
        if (!btnSoundToggle) return;
        btnSoundToggle.textContent = APP_CONFIG.sonidoHabilitado ? '🔊' : '🔇';
    }

    if (btnSoundToggle) {
        btnSoundToggle.addEventListener('click', () => {
            APP_CONFIG.sonidoHabilitado = !APP_CONFIG.sonidoHabilitado;
            updateSoundButton();
            if (APP_CONFIG.sonidoHabilitado) playClickSound();
        });
    }

    // --- ACCIÓN: SELECCIONAR UNA CARA ---
    function handleRatingSelection(ratingType, score) {
        currentRating = ratingType;
        currentScore = score;
        selectedMotivos = [];

        if (ratingType === 'excelente') {
            playHappyFanfare();
            launchConfetti();
            saveVote({ rating: 'excelente', score: 3, motivos: [], comentario: '' });
            showView('viewHappy');
            startCountdown(APP_CONFIG.tiempoEsperaAgradecimiento || 5, countdownSecondsHappy, countdownFillHappy, resetToHome);
        } else {
            playNeutralSound();
            if (feedbackHeaderIcon) feedbackHeaderIcon.textContent = (ratingType === 'regular' ? '😐' : '🙁');
            if (feedbackTitleText) feedbackTitleText.textContent = (ratingType === 'regular' ? '¿Cómo podemos hacer tu experiencia excelente?' : 'Lamentamos tu inconformidad. ¿Qué podemos mejorar?');
            showView('viewFeedback');
            startCountdown(APP_CONFIG.tiempoEsperaFeedback || 12, countdownSecondsFeedback, countdownFillFeedback, () => {
                // Si vence el tiempo y no tocó Enviar, guardamos el voto inicial de todas formas
                saveVote({ rating: currentRating, score: currentScore, motivos: selectedMotivos, comentario: feedbackComment ? feedbackComment.value.trim() : '' });
                resetToHome();
            });
        }
    }

    if (btnHappy) btnHappy.addEventListener('click', () => handleRatingSelection('excelente', 3));
    if (btnNeutral) btnNeutral.addEventListener('click', () => handleRatingSelection('regular', 2));
    if (btnSad) btnSad.addEventListener('click', () => handleRatingSelection('mala', 1));

    // --- ACCIONES FEEDBACK (REGULAR / DISGUSTADO) ---
    function submitFinalFeedback() {
        playClickSound();
        const comentario = feedbackComment ? feedbackComment.value.trim() : '';
        saveVote({
            rating: currentRating,
            score: currentScore,
            motivos: selectedMotivos,
            comentario: comentario
        });

        showView('viewThanks');
        startCountdown(3, countdownSecondsThanks, countdownFillThanks, resetToHome);
    }

    if (btnSubmitFeedback) btnSubmitFeedback.addEventListener('click', submitFinalFeedback);
    if (btnSkipFeedback) btnSkipFeedback.addEventListener('click', submitFinalFeedback);

    // --- GUARDAR CALIFICACIÓN (LOCALSTORAGE + SUPABASE) ---
    function saveVote(voteData) {
        const payload = {
            id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            created_at: new Date().toISOString(),
            rating: voteData.rating,
            score: voteData.score,
            motivos: voteData.motivos || [],
            comentario: voteData.comentario || '',
            sucursal: APP_CONFIG.sucursalDefault || 'Casa Central',
            dispositivo: APP_CONFIG.dispositivoId || 'Tablet Kiosk 1',
            qr_escaneado: false
        };

        // Guardar en LocalStorage
        let localList = [];
        try {
            const raw = localStorage.getItem('estol_calificaciones');
            if (raw) localList = JSON.parse(raw);
        } catch (e) {}

        localList.unshift(payload);
        // Guardar hasta 2000 registros offline
        if (localList.length > 2000) localList = localList.slice(0, 2000);
        localStorage.setItem('estol_calificaciones', JSON.stringify(localList));
    }

    // --- PANTALLA COMPLETA ---
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            const docEl = document.documentElement;
            const isFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

            if (!isFs) {
                const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
                if (requestFs) {
                    requestFs.call(docEl).catch(err => {
                        console.log('Error intentando entrar en fullscreen:', err);
                    });
                }
            } else {
                const exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                if (exitFs) exitFs.call(document);
            }
        });
    }

    // --- EFECTO DE CONFETI EN CANVAS ---
    const confettiCanvas = document.getElementById('confettiCanvas');
    let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
    let confettiParticles = [];
    let confettiAnimId = null;

    function resizeCanvas() {
        if (!confettiCanvas) return;
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function launchConfetti() {
        if (!confettiCanvas || !confettiCtx) return;
        confettiParticles = [];
        const colors = ['#10b981', '#059669', '#34d399', '#facc15', '#0284c7', '#38bdf8', '#fb923c'];

        for (let i = 0; i < 90; i++) {
            confettiParticles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2 + 50,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.8) * 18,
                size: Math.random() * 8 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 10,
                alpha: 1
            });
        }

        if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
        animateConfetti();
    }

    function animateConfetti() {
        if (!confettiCtx) return;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        let activeCount = 0;
        confettiParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4; // Gravedad
            p.rotation += p.vRot;
            p.alpha -= 0.012;

            if (p.alpha > 0 && p.y < window.innerHeight + 50) {
                activeCount++;
                confettiCtx.save();
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate((p.rotation * Math.PI) / 180);
                confettiCtx.fillStyle = p.color;
                confettiCtx.globalAlpha = Math.max(0, p.alpha);
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
                confettiCtx.restore();
            }
        });

        if (activeCount > 0) {
            confettiAnimId = requestAnimationFrame(animateConfetti);
        } else {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    // --- PANEL DE ADMINISTRACIÓN / PIN / STATS ---
    function openAdminModal() {
        currentEnteredPin = '';
        updatePinDisplay();
        if (adminPinSection) adminPinSection.style.display = 'block';
        if (adminDashboardSection) adminDashboardSection.style.display = 'none';
        if (adminConfigSection) adminConfigSection.style.display = 'none';
        if (adminModal) adminModal.classList.add('open');
    }

    function closeAdminModal() {
        if (adminModal) adminModal.classList.remove('open');
    }

    // Doble/Triple toque en el logo de Estol para abrir admin
    if (brandLogoTrigger) {
        brandLogoTrigger.addEventListener('click', () => {
            brandTapCount++;
            if (brandTapTimer) clearTimeout(brandTapTimer);
            if (brandTapCount >= 3) {
                brandTapCount = 0;
                openAdminModal();
            } else {
                brandTapTimer = setTimeout(() => { brandTapCount = 0; }, 800);
            }
        });
    }

    if (footerAdminTrigger) footerAdminTrigger.addEventListener('click', openAdminModal);
    if (btnCloseAdminModal) btnCloseAdminModal.addEventListener('click', closeAdminModal);

    // PIN Numpad logic
    function updatePinDisplay() {
        pinDots.forEach((dot, idx) => {
            if (idx < currentEnteredPin.length) dot.classList.add('filled');
            else dot.classList.remove('filled');
        });
    }

    numButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playClickSound();
            if (currentEnteredPin.length < 6) {
                currentEnteredPin += btn.dataset.num;
                updatePinDisplay();

                if (currentEnteredPin.length === (APP_CONFIG.adminPin || '1234').length) {
                    setTimeout(verifyPin, 150);
                }
            }
        });
    });

    if (btnPinClear) {
        btnPinClear.addEventListener('click', () => {
            playClickSound();
            currentEnteredPin = '';
            updatePinDisplay();
        });
    }

    if (btnPinDelete) {
        btnPinDelete.addEventListener('click', () => {
            playClickSound();
            currentEnteredPin = currentEnteredPin.slice(0, -1);
            updatePinDisplay();
        });
    }

    function verifyPin() {
        const expectedPin = APP_CONFIG.adminPin || '1234';
        if (currentEnteredPin === expectedPin) {
            playHappyFanfare();
            if (adminPinSection) adminPinSection.style.display = 'none';
            if (adminDashboardSection) adminDashboardSection.style.display = 'block';
            loadAdminStats();
        } else {
            playNeutralSound();
            pinDots.forEach(d => {
                d.style.borderColor = '#ef4444';
                d.style.background = '#ef4444';
            });
            setTimeout(() => {
                currentEnteredPin = '';
                pinDots.forEach(d => {
                    d.style.borderColor = '';
                    d.style.background = '';
                });
                updatePinDisplay();
            }, 500);
        }
    }

    // --- CARGAR Y CALCULAR ESTADÍSTICAS ---
    function loadAdminStats() {
        let votes = [];
        try {
            const raw = localStorage.getItem('estol_calificaciones');
            if (raw) votes = JSON.parse(raw);
        } catch (e) {}

        const total = votes.length;
        const happyCount = votes.filter(v => v.rating === 'excelente').length;
        const neutralCount = votes.filter(v => v.rating === 'regular').length;
        const sadCount = votes.filter(v => v.rating === 'mala').length;

        const csatScore = total > 0 ? Math.round((happyCount / total) * 100) : 100;
        const happyPct = total > 0 ? Math.round((happyCount / total) * 100) : 0;
        const neutralPct = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
        const sadPct = total > 0 ? Math.round((sadCount / total) * 100) : 0;

        if (metricTotal) metricTotal.textContent = total;
        if (metricCSAT) metricCSAT.textContent = csatScore + '%';
        if (metricHappy) metricHappy.textContent = happyCount;
        if (metricSad) metricSad.textContent = (neutralCount + sadCount);

        if (pctHappy) pctHappy.textContent = happyPct + '%';
        if (pctNeutral) pctNeutral.textContent = neutralPct + '%';
        if (pctSad) pctSad.textContent = sadPct + '%';

        if (countHappy) countHappy.textContent = happyCount;
        if (countNeutral) countNeutral.textContent = neutralCount;
        if (countSad) countSad.textContent = sadCount;

        if (barHappy) barHappy.style.width = happyPct + '%';
        if (barNeutral) barNeutral.style.width = neutralPct + '%';
        if (barSad) barSad.style.width = sadPct + '%';

        // Renderizar tabla de últimas opiniones
        if (tableVotesBody) {
            tableVotesBody.innerHTML = '';
            if (votes.length === 0) {
                tableVotesBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">No hay calificaciones registradas aún</td></tr>';
            } else {
                const latest = votes.slice(0, 15);
                latest.forEach(v => {
                    const row = document.createElement('tr');
                    const dateFormatted = new Date(v.created_at).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' });
                    const badgeMap = {
                        'excelente': '<span style="color:#059669; font-weight:700;">😃 Excelente</span>',
                        'regular': '<span style="color:#d97706; font-weight:700;">😐 Regular</span>',
                        'mala': '<span style="color:#dc2626; font-weight:700;">😡 Disgustado</span>'
                    };
                    const motivosStr = (v.motivos && v.motivos.length > 0) ? v.motivos.join(', ') : '-';
                    const comStr = v.comentario ? `"${escapeHtml(v.comentario)}"` : '-';

                    row.innerHTML = `
                        <td>${dateFormatted}</td>
                        <td>${badgeMap[v.rating] || v.rating}</td>
                        <td>${escapeHtml(motivosStr)}</td>
                        <td>${comStr}</td>
                    `;
                    tableVotesBody.appendChild(row);
                });
            }
        }
    }

    function escapeHtml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // --- EXPORTAR A CSV (EXCEL) ---
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            let votes = [];
            try {
                const raw = localStorage.getItem('estol_calificaciones');
                if (raw) votes = JSON.parse(raw);
            } catch (e) {}

            if (votes.length === 0) {
                alert('No hay calificaciones para exportar.');
                return;
            }

            let csvContent = '\uFEFF'; // UTF-8 BOM para abrir con tildes en Excel
            csvContent += 'ID;Fecha;Hora;Calificacion;Puntaje;Motivos;Comentario;Sucursal;Dispositivo\n';

            votes.forEach(v => {
                const d = new Date(v.created_at);
                const fecha = d.toLocaleDateString('es-UY');
                const hora = d.toLocaleTimeString('es-UY');
                const motivos = (v.motivos || []).join('|');
                const com = (v.comentario || '').replace(/;/g, ',').replace(/\n/g, ' ');

                csvContent += `"${v.id}";"${fecha}";"${hora}";"${v.rating}";"${v.score}";"${motivos}";"${com}";"${v.sucursal}";"${v.dispositivo}"\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Estol_Calificaciones_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }



    // --- CONFIGURACIÓN ADMIN ---
    if (btnEditConfig) {
        btnEditConfig.addEventListener('click', () => {
            if (cfgGoogleUrl) cfgGoogleUrl.value = APP_CONFIG.googleMapsUrl || '';
            if (cfgAdminPin) cfgAdminPin.value = APP_CONFIG.adminPin || '1234';
            if (cfgSucursal) cfgSucursal.value = APP_CONFIG.sucursalDefault || '';
            if (adminDashboardSection) adminDashboardSection.style.display = 'none';
            if (adminConfigSection) adminConfigSection.style.display = 'block';
        });
    }

    if (btnBackToStats) {
        btnBackToStats.addEventListener('click', () => {
            if (adminConfigSection) adminConfigSection.style.display = 'none';
            if (adminDashboardSection) adminDashboardSection.style.display = 'block';
            loadAdminStats();
        });
    }

    if (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', () => {
            if (cfgGoogleUrl) APP_CONFIG.googleMapsUrl = cfgGoogleUrl.value.trim();
            if (cfgAdminPin && cfgAdminPin.value.trim().length >= 4) APP_CONFIG.adminPin = cfgAdminPin.value.trim();
            if (cfgSucursal) APP_CONFIG.sucursalDefault = cfgSucursal.value.trim();

            localStorage.setItem('estol_calificador_config', JSON.stringify(APP_CONFIG));
            generateGoogleQR();
            if (footerBranchText) footerBranchText.textContent = '📍 ' + APP_CONFIG.sucursalDefault;
            if (btnDirectGoogleReview) btnDirectGoogleReview.href = APP_CONFIG.googleMapsUrl;

            alert('¡Configuración guardada correctamente!');
            if (adminConfigSection) adminConfigSection.style.display = 'none';
            if (adminDashboardSection) adminDashboardSection.style.display = 'block';
            loadAdminStats();
        });
    }

    // Arrancar la app
    initUI();
});
