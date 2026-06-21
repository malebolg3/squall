// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Th1eros

var host = window.location.hostname;
var isDev = host === 'localhost' || host === '127.0.0.1';
var isStaging = host.includes('.dev');
var TOKEN_KEY = isDev ? 'abitat_token' : (isStaging ? 'malebolge_token' : 'abitat_token');
var params = new URLSearchParams(window.location.search);
var modulesParam = params.get('modules');

var defaultModule = 'blue';
if (host.startsWith('blue.')) defaultModule = 'blue';
else if (host.startsWith('red.')) defaultModule = 'red';
else if (host.startsWith('violet.')) defaultModule = 'violet';
else if (host.startsWith('silver.')) defaultModule = 'silver';
else if (host.startsWith('rapsodia.')) defaultModule = '';

if (modulesParam) {
    var requestedModules = modulesParam.split(',').map(function(m) { return m.trim(); });
    if (defaultModule && requestedModules.indexOf(defaultModule) === -1) {
        requestedModules.unshift(defaultModule);
    }
    if (requestedModules.indexOf('blue') === -1) {
        requestedModules.unshift('blue');
    }
    modulesParam = requestedModules.join(',');
} else {
    var parts = ['blue'];
    if (defaultModule && defaultModule !== 'blue') {
        parts.push(defaultModule);
    } else if (!defaultModule) {
        parts = ['blue', 'red', 'violet', 'silver'];
    }
    modulesParam = parts.join(',');
}

var activeModules = modulesParam.split(',');

var API = {
    blue: isDev ? 'http://localhost:5073' : 'https://' + host + '/api',
    red: isDev ? 'http://localhost:5074' : 'https://' + host + '/api',
    violet: isDev ? 'http://localhost:5075' : 'https://' + host + '/api',
    silver: isDev ? 'http://localhost:5076' : 'https://' + host + '/api'
};

function filterModules() {
    var allTabs = ['blue', 'red', 'violet', 'silver'];
    allTabs.forEach(function(mod) {
        var tab = document.querySelector('[data-tab="' + mod + '"]');
        var panel = document.getElementById('panel-' + mod);
        if (activeModules.indexOf(mod) === -1) {
            if (tab) tab.style.display = 'none';
            if (panel) panel.style.display = 'none';
        }
    });

    var agentSelect = document.getElementById('chat-agent');
    if (agentSelect) {
        var options = agentSelect.querySelectorAll('option');
        options.forEach(function(opt) {
            var agentModule = opt.value;
            if (activeModules.indexOf(agentModule) === -1) {
                opt.style.display = 'none';
            } else {
                opt.style.display = '';
            }
        });
        var firstVisible = agentSelect.querySelector('option:not([style*="display: none"])');
        if (firstVisible) {
            agentSelect.value = firstVisible.value;
            changeAgent();
        }
    }

    var quickButtons = document.querySelectorAll('.chat-quick button');
    var agentCommands = {
        scan: 'red',
        exploit: 'red',
        report: 'blue',
        lab: 'violet'
    };
    quickButtons.forEach(function(btn) {
        var cmd = btn.textContent.replace('_', '').toLowerCase();
        var agent = agentCommands[cmd];
        if (agent && activeModules.indexOf(agent) === -1) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    filterModules();

    // Ativa a aba do módulo do domínio (se houver), disparando o clique nativo
    if (defaultModule) {
        var tabToActivate = document.querySelector('[data-tab="' + defaultModule + '"]');
        if (tabToActivate) {
            tabToActivate.click();
        }
    }

    if (!localStorage.getItem(TOKEN_KEY)) {
        document.getElementById('panel-blue').style.display = '';
        setTimeout(function() {
            var scroll = document.getElementById('main-scroll');
            if (scroll) scroll.scrollLeft = 0;
        }, 500);
    }
});

var api = {
    token: function() {
        return localStorage.getItem(TOKEN_KEY);
    },
    headers: function() {
        return {
            'Authorization': 'Bearer ' + (api.token() || ''),
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    },
    save: function(service, type, id, data) {
        return fetch(API[service] + '/api/' + type + (id ? '/' + id : ''), {
            method: id ? 'PUT' : 'POST',
            headers: api.headers(),
            body: JSON.stringify(data)
        }).then(function(r) {
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
            return r.json();
        });
    },
    del: function(service, type, id) {
        return fetch(API[service] + '/api/' + type + '/' + id, {
            method: 'DELETE',
            headers: api.headers()
        }).then(function(r) {
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
        });
    },
    get: function(service, type, id) {
        return fetch(API[service] + '/api/' + type + (id ? '/' + id : ''), {
            headers: api.headers()
        }).then(function(r) {
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
            return r.json();
        });
    }
};

document.body.addEventListener('htmx:configRequest', function(e) {
    if (api.token()) {
        e.detail.headers['Authorization'] = 'Bearer ' + api.token();
    }
    e.detail.headers['X-Requested-With'] = 'XMLHttpRequest';
});

document.body.addEventListener('htmx:afterRequest', function(e) {
    var p = e.detail.pathInfo.requestPath;
    var ct = e.detail.xhr.getResponseHeader('Content-Type') || '';

    if (ct.indexOf('application/json') === -1) {
        return;
    }

    try {
        var d = JSON.parse(e.detail.xhr.responseText);
        if (p.indexOf('/Auth/authorize') !== -1 && d.success && d.data && d.data.requires2FA) {
            if (typeof render2FA === 'function') {
                render2FA(d.data.username || 'admin');
            }
        }
        if (p.indexOf('/Auth/verify-2fa') !== -1 && d.success && d.data && d.data.token) {
            localStorage.setItem(TOKEN_KEY, d.data.token);
            if (typeof showDashboard === 'function') {
                showDashboard();
            }
        }
        if (p.indexOf('/Auth/register') !== -1 && d.success) {
            if (typeof renderLogin === 'function') {
                renderLogin();
            }
        }
    } catch (ex) {
        return;
    }
});

document.body.addEventListener('htmx:responseError', function(e) {
    if (e.detail.xhr.status === 401) {
        logout();
    }
});

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    if (typeof updateHeaderVisibility === 'function') {
        updateHeaderVisibility();
    }
    if (typeof closeChat === 'function') {
        closeChat();
    }
    if (typeof lockScroll === 'function') {
        lockScroll(true);
    }
    if (typeof renderLogin === 'function') {
        renderLogin();
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}