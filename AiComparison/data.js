const subscriptionData = {
    categories: [
        {
            id: 'modelle',
            title: 'Aktuell verfügbare Modelle',
            description: 'Benchmarks, Performance und Eigenheiten',
            features: [
                { id: 'mod_logic', label: 'Logisches Denken & Reasoning' },
                { id: 'mod_code', label: 'Programmierfähigkeiten (Coding)' },
                { id: 'mod_speed', label: 'Antwortgeschwindigkeit' },
                { id: 'mod_context', label: 'Umgang mit großem Kontext' }
            ]
        },
        {
            id: 'limits',
            title: 'Limits & Einschränkungen',
            description: 'Tägliche Limits, Ratelimits, Tokenlimits...',
            features: [
                { id: 'lim_msg_daily', label: 'Anzahl Nachrichten (Täglich)' },
                { id: 'lim_msg_burst', label: 'Ratelimit (Kurzzeit / Burst)' },
                { id: 'lim_token_out', label: 'Maximale Output-Token pro Antwort' }
            ]
        },
        {
            id: 'interaktion',
            title: 'Interaktion',
            description: 'WebUI, Terminal, IDEs, Agents...',
            features: [
                { id: 'int_webui', label: 'Qualität & Features der WebUI' },
                { id: 'int_ide', label: 'Offizielle IDE Integration' },
                { id: 'int_cli', label: 'Terminal / CLI Tools (z.B. Claude Code)' }
            ]
        },
        {
            id: 'workflow',
            title: 'Workflow & Alltag',
            description: 'Mobile Nutzung, Voice, Organisation & Sync',
            features: [
                { id: 'wf_mobile', label: 'Mobile Apps & geräteübergreifender Sync' },
                { id: 'wf_voice', label: 'Voice / Realtime Interaktion' },
                { id: 'wf_projects', label: 'Projekt-/Ordner-Organisation & Dateien' }
            ]
        },
        {
            id: 'integrationen',
            title: 'Integrationen & Ökosystem',
            description: 'Workspaces, MCP Optionen, Memory...',
            features: [
                { id: 'ing_workspace', label: 'Workspace Integration (Mail, Docs, Sheets)' },
                { id: 'ing_mcp', label: 'Model Context Protocol (MCP) Unterstützung' },
                { id: 'ing_memory', label: 'Personalisierung / Memory über Chats hinweg' }
            ]
        },
        {
            id: 'besonderheiten',
            title: 'Besonderheiten & Perks',
            description: 'Zusätzliche Dinge wie Speicher, Teilen etc.',
            features: [
                { id: 'sp_sharing', label: 'Account Sharing Praktikabilität (Mehrere Personen auf einem Account)' },
                { id: 'sp_cloud', label: 'Zusätzlicher Cloud-Speicher inklusive' },
                { id: 'sp_image', label: 'Bilderstellung möglich' },
                { id: 'sp_video', label: 'Videoerstellung / Analyse möglich' },
                { id: 'sp_export', label: 'Export zu anderen Formaten (z.B. Excel)' }
            ]
        }
    ],
    plans: [
        {
            id: 'chatgpt_go',
            name: 'ChatGPT Go (ab)',
            costMonthly: 8.00,
            costYearly: 96.00,
            seats: 1,
            baseScores: { 'mod_logic': 3, 'mod_code': 3, 'mod_speed': 5, 'mod_context': 2, 'lim_msg_daily': 3, 'lim_msg_burst': 3, 'lim_token_out': 2, 'int_webui': 5, 'int_ide': -1, 'int_cli': 0, 'wf_mobile': 5, 'wf_voice': 4, 'wf_projects': 3, 'ing_workspace': 0, 'ing_mcp': -4, 'ing_memory': 4, 'sp_sharing': -3, 'sp_cloud': -5, 'sp_image': 3, 'sp_video': -5, 'sp_export': 2 },
            facts: { 'mod_logic': 'GPT-5.5 Instant, begrenzte Nutzung.', 'sp_image': 'Begrenzte Bildgenerierung; kann Werbung enthalten.' }
        },
        {
            id: 'chatgpt_plus',
            name: 'ChatGPT Plus (ab)',
            costMonthly: 23.00,
            costYearly: 276.00,
            seats: 1,
            baseScores: { 'mod_logic': 4, 'mod_code': 4, 'mod_speed': 4, 'mod_context': 4, 'lim_msg_daily': 3, 'lim_msg_burst': 3, 'lim_token_out': 4, 'int_webui': 5, 'int_ide': -1, 'int_cli': 0, 'wf_mobile': 5, 'wf_voice': 5, 'wf_projects': 4, 'ing_workspace': 0, 'ing_mcp': -4, 'ing_memory': 5, 'sp_sharing': -3, 'sp_cloud': -5, 'sp_image': 5, 'sp_video': 4, 'sp_export': 3 },
            facts: { 'mod_logic': 'GPT-5.5 Thinking, Deep Research und Agent Mode (erweitert).', 'wf_projects': 'Projects, Tasks und Custom GPTs enthalten.' }
        },
        {
            id: 'chatgpt_pro',
            name: 'ChatGPT Pro (ab)',
            costMonthly: 103.00,
            costYearly: 1236.00,
            seats: 1,
            baseScores: { 'mod_logic': 5, 'mod_code': 5, 'mod_speed': 4, 'mod_context': 5, 'lim_msg_daily': 5, 'lim_msg_burst': 5, 'lim_token_out': 5, 'int_webui': 5, 'int_ide': -1, 'int_cli': 0, 'wf_mobile': 5, 'wf_voice': 5, 'wf_projects': 4, 'ing_workspace': 0, 'ing_mcp': -4, 'ing_memory': 5, 'sp_sharing': -3, 'sp_cloud': -5, 'sp_image': 5, 'sp_video': 5, 'sp_export': 4 },
            facts: { 'lim_msg_daily': '5x oder 20x Nutzung gegenueber Plus (je nach Pro-Stufe).', 'mod_logic': 'GPT-5.5 Pro; maximale Deep Research und Codex.' }
        },
        {
            id: 'claude_pro',
            name: 'Claude Pro (ab)',
            costMonthly: 18.40,
            costYearly: 184.00,
            seats: 1,
            baseScores: { 'mod_logic': 5, 'mod_code': 5, 'mod_speed': 3, 'mod_context': 5, 'lim_msg_daily': -2, 'lim_msg_burst': -3, 'lim_token_out': 3, 'int_webui': 4, 'int_ide': -1, 'int_cli': 5, 'wf_mobile': 2, 'wf_voice': 1, 'wf_projects': 4, 'ing_workspace': -2, 'ing_mcp': 5, 'ing_memory': -3, 'sp_sharing': -4, 'sp_cloud': -4, 'sp_image': -4, 'sp_video': -4, 'sp_export': -1 },
            facts: { 'int_cli': 'Claude Code enthalten.', 'wf_projects': 'Projects + Research enthalten.' }
        },
        {
            id: 'claude_max_5x',
            name: 'Claude Max 5x (ab)',
            costMonthly: 92.00,
            costYearly: 1104.00,
            seats: 1,
            baseScores: { 'mod_logic': 5, 'mod_code': 5, 'mod_speed': 4, 'mod_context': 5, 'lim_msg_daily': 3, 'lim_msg_burst': 2, 'lim_token_out': 4, 'int_webui': 4, 'int_ide': -1, 'int_cli': 5, 'wf_mobile': 2, 'wf_voice': 1, 'wf_projects': 4, 'ing_workspace': -2, 'ing_mcp': 5, 'ing_memory': -3, 'sp_sharing': -4, 'sp_cloud': -4, 'sp_image': -4, 'sp_video': -4, 'sp_export': -1 },
            facts: { 'lim_msg_daily': '5x mehr Nutzung als Pro.', 'lim_token_out': 'Hoehere Output-Limits.' }
        },
        {
            id: 'claude_max_20x',
            name: 'Claude Max 20x (ab)',
            costMonthly: 184.00,
            costYearly: 2208.00,
            seats: 1,
            baseScores: { 'mod_logic': 5, 'mod_code': 5, 'mod_speed': 5, 'mod_context': 5, 'lim_msg_daily': 5, 'lim_msg_burst': 4, 'lim_token_out': 5, 'int_webui': 4, 'int_ide': -1, 'int_cli': 5, 'wf_mobile': 2, 'wf_voice': 1, 'wf_projects': 4, 'ing_workspace': -2, 'ing_mcp': 5, 'ing_memory': -3, 'sp_sharing': -4, 'sp_cloud': -4, 'sp_image': -4, 'sp_video': -4, 'sp_export': -1 },
            facts: { 'lim_msg_daily': '20x mehr Nutzung als Pro.', 'lim_token_out': 'Hoehere Output-Limits.' }
        },
        {
            id: 'google_ai_plus',
            name: 'Google AI Plus',
            costMonthly: 7.99,
            costYearly: 95.88,
            seats: 5,
            baseScores: { 'mod_logic': 2, 'mod_code': 1, 'mod_speed': 5, 'mod_context': 3, 'lim_msg_daily': 3, 'lim_msg_burst': 3, 'lim_token_out': 2, 'int_webui': 3, 'int_ide': 2, 'int_cli': 0, 'wf_mobile': 5, 'wf_voice': 3, 'wf_projects': 3, 'ing_workspace': 4, 'ing_mcp': -3, 'ing_memory': -2, 'sp_sharing': 5, 'sp_cloud': 2, 'sp_image': 3, 'sp_video': 1, 'sp_export': 4 },
            facts: { 'sp_cloud': '200 GB Speicher.', 'sp_sharing': 'Familienfreigabe bis 5 Personen.' }
        },
        {
            id: 'google_ai_pro',
            name: 'Google AI Pro',
            costMonthly: 21.99,
            costYearly: 263.88,
            seats: 5,
            baseScores: { 'mod_logic': 4, 'mod_code': 3, 'mod_speed': 5, 'mod_context': 5, 'lim_msg_daily': 4, 'lim_msg_burst': 4, 'lim_token_out': 3, 'int_webui': 3, 'int_ide': 3, 'int_cli': 0, 'wf_mobile': 5, 'wf_voice': 4, 'wf_projects': 4, 'ing_workspace': 5, 'ing_mcp': -3, 'ing_memory': -2, 'sp_sharing': 5, 'sp_cloud': 5, 'sp_image': 4, 'sp_video': 3, 'sp_export': 4 },
            facts: { 'sp_cloud': '5 TB Speicher.', 'mod_context': 'Bis 1M Kontextfenster in Gemini.' }
        },
        {
            id: 'google_ai_ultra',
            name: 'Google AI Ultra (ab)',
            costMonthly: 99.99,
            costYearly: 1199.88,
            seats: 5,
            baseScores: { 'mod_logic': 5, 'mod_code': 4, 'mod_speed': 5, 'mod_context': 5, 'lim_msg_daily': 5, 'lim_msg_burst': 5, 'lim_token_out': 4, 'int_webui': 3, 'int_ide': 4, 'int_cli': 0, 'wf_mobile': 5, 'wf_voice': 4, 'wf_projects': 4, 'ing_workspace': 5, 'ing_mcp': -3, 'ing_memory': -2, 'sp_sharing': 5, 'sp_cloud': 5, 'sp_image': 5, 'sp_video': 4, 'sp_export': 4 },
            facts: { 'sp_cloud': 'Ab 20 TB Speicher.', 'lim_msg_daily': 'Bis zu 20x Limits gegenueber Pro (je nach Ultra-Stufe).' }
        }
    ]
};