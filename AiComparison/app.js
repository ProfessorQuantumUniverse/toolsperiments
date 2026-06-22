const { createApp, ref, computed, reactive, onMounted, watch } = Vue;

const app = createApp({
    setup() {
        const data = reactive(subscriptionData); // From data.js
        const currentTab = ref('weights');
        const allowCombos = ref(false);
        const billingCycle = ref('monthly'); // 'monthly' or 'yearly'
        const priceCap = ref(null);
        const priceCapCycle = ref('monthly');

        const SCORE_MIN = -5;
        const SCORE_MAX = 5;
        const SCORE_SCALE = 100;
        const SOFTMAX_TEMP = 1.75;

        const tabs = [
            { id: 'weights', name: '1. Gewichtung', icon: 'fas fa-sliders-h' },
            { id: 'raw', name: '2. Fakten & Daten', icon: 'fas fa-database' },
            { id: 'results', name: '3. Auswertung', icon: 'fas fa-trophy' },
            { id: 'costs', name: '4. Kostenrechner', icon: 'fas fa-calculator' }
        ];

        // Initialize with one user
        const users = ref([
            { id: 1, name: 'Person 1', weights: {}, planScores: {} }
        ]);

        const activeUserIdInfoTab = ref(1);
        const activeUser = computed(() => users.value.find(u => u.id === activeUserIdInfoTab.value));
        const nextUserId = ref(2);

        // Pre-defined profiles for quick setup
        const profiles = {
            'Entwickler (Coder)': {
                'mod_logic': 4, 'mod_code': 5, 'mod_speed': 2, 'mod_context': 4,
                'lim_msg_daily': 3, 'lim_msg_burst': 3, 'lim_token_out': 4,
                'int_webui': 0, 'int_ide': 5, 'int_cli': 4,
                'wf_mobile': -1, 'wf_voice': -3, 'wf_projects': 2,
                'ing_workspace': -2, 'ing_mcp': 5, 'ing_memory': 0,
                'sp_sharing': -3, 'sp_cloud': -3, 'sp_image': -2, 'sp_video': -2, 'sp_export': 0
            },
            'Power-User (Allrounder)': {
                'mod_logic': 5, 'mod_code': 2, 'mod_speed': 3, 'mod_context': 5,
                'lim_msg_daily': 4, 'lim_msg_burst': 4, 'lim_token_out': 4,
                'int_webui': 5, 'int_ide': 0, 'int_cli': 0,
                'wf_mobile': 3, 'wf_voice': 2, 'wf_projects': 4,
                'ing_workspace': 3, 'ing_mcp': 2, 'ing_memory': 4,
                'sp_sharing': 0, 'sp_cloud': 2, 'sp_image': 4, 'sp_video': 2, 'sp_export': 3
            },
            'Familien / Sparfuchs': {
                'mod_logic': 2, 'mod_code': 0, 'mod_speed': 4, 'mod_context': 2,
                'lim_msg_daily': 2, 'lim_msg_burst': 2, 'lim_token_out': 2,
                'int_webui': 4, 'int_ide': -5, 'int_cli': -5,
                'wf_mobile': 5, 'wf_voice': 2, 'wf_projects': 1,
                'ing_workspace': 4, 'ing_mcp': -5, 'ing_memory': 2,
                'sp_sharing': 5, 'sp_cloud': 5, 'sp_image': 3, 'sp_video': 0, 'sp_export': 0            },
            'Student / Researcher': {
                'mod_logic': 5, 'mod_code': 0, 'mod_speed': 2, 'mod_context': 4,
                'lim_msg_daily': 4, 'lim_msg_burst': 3, 'lim_token_out': 2,
                'int_webui': 5, 'int_ide': -2, 'int_cli': -2,
                'wf_mobile': 2, 'wf_voice': 0, 'wf_projects': 5,
                'ing_workspace': 3, 'ing_mcp': -1, 'ing_memory': 2,
                'sp_sharing': 0, 'sp_cloud': 3, 'sp_image': 1, 'sp_video': 0, 'sp_export': 4
            },
            'Kreativ-Profi (Marketing / Design)': {
                'mod_logic': 3, 'mod_code': 1, 'mod_speed': 4, 'mod_context': 3,
                'lim_msg_daily': 4, 'lim_msg_burst': 4, 'lim_token_out': 3,
                'int_webui': 5, 'int_ide': -5, 'int_cli': -5,
                'wf_mobile': 3, 'wf_voice': 4, 'wf_projects': 3,
                'ing_workspace': 2, 'ing_mcp': -2, 'ing_memory': 3,
                'sp_sharing': -2, 'sp_cloud': 0, 'sp_image': 5, 'sp_video': 5, 'sp_export': 2
            },
            'Hardcore-Entwickler (Agentic)': {
                'mod_logic': 5, 'mod_code': 5, 'mod_speed': 3, 'mod_context': 5,
                'lim_msg_daily': 5, 'lim_msg_burst': 5, 'lim_token_out': 5,
                'int_webui': -5, 'int_ide': 5, 'int_cli': 5,
                'wf_mobile': -5, 'wf_voice': -5, 'wf_projects': 5,
                'ing_workspace': 0, 'ing_mcp': 5, 'ing_memory': 0,
                'sp_sharing': -5, 'sp_cloud': -5, 'sp_image': 0, 'sp_video': -5, 'sp_export': 0            }
        };

        const applyProfile = (userId, profileName) => {
            const user = users.value.find(u => u.id === userId);
            if (user && profiles[profileName]) {
                const profile = profiles[profileName];
                Object.keys(profile).forEach(key => {
                    user.weights[key] = profile[key];
                });
            }
        };

        // Populate initial weights to 0 for the first user based on all features
        const initWeights = (userObj) => {
            if(!userObj.weights) userObj.weights = {};
            if(!userObj.planScores) userObj.planScores = {};

            data.categories.forEach(cat => {
                cat.features.forEach(feat => {
                    if (userObj.weights[feat.id] === undefined) {
                        userObj.weights[feat.id] = 0;
                    }
                });
            });

            data.plans.forEach(plan => {
                if(!userObj.planScores[plan.id]) userObj.planScores[plan.id] = {};
                data.categories.forEach(cat => {
                    cat.features.forEach(feat => {
                        if (userObj.planScores[plan.id][feat.id] === undefined) {
                            userObj.planScores[plan.id][feat.id] = plan.baseScores[feat.id] || 0;
                        }
                    });
                });
            });
        };
        initWeights(users.value[0]);

        const addUser = () => {
            const newUser = { id: nextUserId.value++, name: `Person ${users.value.length + 1}`, weights: {} };
            initWeights(newUser);
            users.value.push(newUser);
        };

        const removeUser = (index) => {
            if (users.value.length > 1) {
                users.value.splice(index, 1);
            }
        };

        const getFeatureLabel = (id) => {
            for (const cat of data.categories) {
                const f = cat.features.find(x => x.id === id);
                if (f) return f.label;
            }
            return id;
        };

        const getWeightColorClass = (val) => {
            if (val > 2) return 'text-green-600';
            if (val > 0) return 'text-green-400';
            if (val === 0) return 'text-gray-400';
            if (val > -3) return 'text-red-400';
            return 'text-red-600';
        };

        const getScoreBadge = (sc) => {
            let base = 'px-2 py-1 rounded text-xs font-bold text-white ';
            if (typeof sc !== 'number') return base + 'bg-gray-400';
            if (sc >= 4) return base + 'bg-green-500';
            if (sc >= 2) return base + 'bg-green-400';
            if (sc >= 0) return base + 'bg-yellow-400';
            if (sc >= -2) return base + 'bg-red-400';
            return base + 'bg-red-600';
        };

        const formatCurrency = (val) => {
            return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
        };

        const clampScore = (val) => {
            if (typeof val !== 'number') return 0;
            return Math.max(SCORE_MIN, Math.min(SCORE_MAX, val));
        };

        const getUserPlanScore = (user, plan, featureId) => {
            const userScore = user?.planScores?.[plan.id]?.[featureId];
            if (typeof userScore === 'number') return userScore;
            const baseScore = plan.baseScores?.[featureId];
            if (typeof baseScore === 'number') return baseScore;
            return 0;
        };

        const computeUserOptionScore = (user, option) => {
            let weightedSum = 0;
            let maxPossibleWeightedSum = 0;
            const contribByFeature = {};

            data.categories.forEach(cat => {
                cat.features.forEach(feat => {
                    const fid = feat.id;
                    const weight = user.weights?.[fid] ?? 0;
                    if (weight === 0) return;

                    const scores = option.plans.map(plan => clampScore(getUserPlanScore(user, plan, fid)));
                    
                    // The best score for the user depends on their preference direction.
                    // If they want it (> 0), finding the max score among the bundle gives the highest benefit.
                    // If they want to avoid it (< 0), finding the min score among the bundle gives the lowest penalty.
                    let bestScore = 0;
                    if (weight > 0) {
                        bestScore = Math.max(...scores);
                    } else {
                        bestScore = Math.min(...scores);
                    }

                    // A positive weight * positive score = positive contribution
                    // A negative weight * negative score = positive contribution (successfully avoided)
                    // A negative weight * positive score = negative contribution (forced to have it)
                    const contrib = weight * bestScore;
                    weightedSum += contrib;
                    
                    // The theoretical maximum contribution for this feature is its absolute weight * max possible score (5)
                    const maxContrib = Math.abs(weight) * SCORE_MAX;
                    maxPossibleWeightedSum += maxContrib;
                    
                    contribByFeature[fid] = contrib;
                });
            });

            let score = 0;
            if (maxPossibleWeightedSum > 0) {
                // Return a clear percentage representation (-100 to +100)
                score = (weightedSum / maxPossibleWeightedSum) * 100;
                
                // Scale feature contributions down to percentages of the total max as well
                Object.keys(contribByFeature).forEach(fid => {
                    contribByFeature[fid] = (contribByFeature[fid] / maxPossibleWeightedSum) * 100;
                });
            }

            return { score, contribByFeature };
        };

        const formatContribution = (val) => {
            if (typeof val !== 'number' || Number.isNaN(val)) return '0%';
            const rounded = Math.round(val * 10) / 10;
            if (rounded > 0) return `+${rounded}%`;
            return `${rounded}%`;
        };

        // Combines base plans into pair combinations if needed
        const allOptions = computed(() => {
            const options = [...data.plans.map(p => ({
                id: p.id,
                name: p.name,
                plans: [p]
            }))];

            if (allowCombos.value) {
                // Generate pairs
                for (let i = 0; i < data.plans.length; i++) {
                    for (let j = i + 1; j < data.plans.length; j++) {
                        const p1 = data.plans[i];
                        const p2 = data.plans[j];
                        options.push({
                            id: `${p1.id}_plus_${p2.id}`,
                            name: `${p1.name} + ${p2.name}`,
                            plans: [p1, p2]
                        });
                    }
                }
            }
            return options;
        });

        const rankedResults = computed(() => {
            let results = allOptions.value.map(opt => {
                let teamScoreSum = 0;
                const teamContrib = {};
                const userCount = users.value.length || 1;

                // Calculate cost for this option to apply price cap
                let costPerCycle = 0;
                opt.plans.forEach(p => {
                    costPerCycle += priceCapCycle.value === 'monthly' ? (p.costMonthly || 0) : (p.costYearly || (p.costMonthly * 12) || 0);
                });

                users.value.forEach(u => {
                    const { score, contribByFeature } = computeUserOptionScore(u, opt);
                    teamScoreSum += score;
                    Object.keys(contribByFeature).forEach(fid => {
                        teamContrib[fid] = (teamContrib[fid] || 0) + contribByFeature[fid];
                    });
                });

                const teamScoreAvg = teamScoreSum / userCount;
                Object.keys(teamContrib).forEach(fid => {
                    teamContrib[fid] = teamContrib[fid] / userCount;
                });

                const pros = [];
                const cons = [];

                Object.keys(teamContrib).forEach(fid => {
                    const contrib = teamContrib[fid];
                    // Only list significant contributions (e.g. at least 1% impact)
                    if (contrib > 1.0) pros.push({ featureId: fid, contrib });
                    else if (contrib < -1.0) cons.push({ featureId: fid, contrib });
                });

                pros.sort((a, b) => b.contrib - a.contrib);
                cons.sort((a, b) => a.contrib - b.contrib);

                return {
                    ...opt,
                    totalScore: Math.round(teamScoreAvg),
                    costPerCycle,
                    pros,
                    cons
                };
            });

            // Filter by price cap if set
            if (priceCap.value !== null && priceCap.value !== '' && priceCap.value >= 0) {
                results = results.filter(r => r.costPerCycle <= priceCap.value);
            }

            // sort descending by total score
            results.sort((a, b) => b.totalScore - a.totalScore);
            return results;
        });

        const calculatedCosts = computed(() => {
            return allOptions.value.map(opt => {
                let monthlyCost = 0;
                let yearlyCost = 0;
                let combinedSeats = 0;
                
                let seatsArr = [];

                opt.plans.forEach(p => {
                    monthlyCost += p.costMonthly || 0;
                    yearlyCost += (p.costYearly || (p.costMonthly * 12));
                    combinedSeats += p.seats || 1;
                    seatsArr.push(p.seats || 1);
                });

                const totalCost = billingCycle.value === 'monthly' ? monthlyCost : yearlyCost;
                const costPerPerson = totalCost / users.value.length;
                
                let seatsDisplay = seatsArr.join(' / ');
                if (opt.plans.length > 1) seatsDisplay = `${seatsDisplay} (Mix)`;

                return {
                    id: opt.id,
                    name: opt.name,
                    seatsDisplay,
                    totalCost,
                    costPerPerson
                };
            });
        });

        // LocalStorage Persistenz
        onMounted(() => {
            const savedUsers = localStorage.getItem('ai_comparison_users');
            if (savedUsers) {
                try {
                    const parsed = JSON.parse(savedUsers);
                    if (parsed && parsed.length > 0) {
                        users.value = parsed;
                        nextUserId.value = Math.max(...parsed.map(u => u.id)) + 1;
                        activeUserIdInfoTab.value = parsed[0].id;
                        
                        // Check for new features / new plans that aren't in the saved payload
                        users.value.forEach(u => initWeights(u));
                    }
                } catch(e) {}
            }
            
            const combos = localStorage.getItem('ai_comparison_combos');
            if (combos !== null) allowCombos.value = JSON.parse(combos);
        });

        watch(users, (newVal) => {
            localStorage.setItem('ai_comparison_users', JSON.stringify(newVal));
        }, { deep: true });
        
        watch(allowCombos, (newVal) => {
            localStorage.setItem('ai_comparison_combos', JSON.stringify(newVal));
        });

        const resetData = () => {
            if(confirm('Wirklich alle Daten, Gewichtungen und Personen zurücksetzen? Dies kann nicht rückgängig gemacht werden.')) {
                localStorage.clear();
                location.reload();
            }
        };

        return {
            activeUserIdInfoTab,
            activeUser,
            data,
            tabs,
            currentTab,
            allowCombos,
            billingCycle,
            priceCap,
            priceCapCycle,
            users,
            addUser,
            removeUser,
            getFeatureLabel,
            getWeightColorClass,
            getScoreBadge,
            formatCurrency,
            formatContribution,
            rankedResults,
            calculatedCosts,
            profiles,
            applyProfile,
            resetData
        };
    }
});

app.mount('#app');