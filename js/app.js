// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Th1eros

(function() {
    var host = window.location.hostname;
    var isDev = host === 'localhost' || host === '127.0.0.1';
    var TOKEN_KEY = 'malebolge_token';

    window.API = {
        blue: isDev ? 'http://localhost:10001/api' : '/api',
        red: isDev ? 'http://localhost:10002/api' : '/api',
        violet: isDev ? 'http://localhost:10003/api' : '/api',
        silver: isDev ? 'http://localhost:10004/api' : '/api'
    };

    window.api = {
        token: function() {
            return localStorage.getItem(TOKEN_KEY);
        },
        headers: function() {
            return {
                'Authorization': 'Bearer ' + (this.token() || ''),
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };
        },
        save: function(service, type, id, data) {
            return fetch(window.API[service] + '/' + type + (id ? '/' + id : ''), {
                method: id ? 'PUT' : 'POST',
                headers: this.headers(),
                body: JSON.stringify(data)
            }).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            });
        },
        del: function(service, type, id) {
            return fetch(window.API[service] + '/' + type + '/' + id, {
                method: 'DELETE',
                headers: this.headers()
            }).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
            });
        },
        get: function(service, type, id) {
            return fetch(window.API[service] + '/' + type + (id ? '/' + id : ''), {
                headers: this.headers()
            }).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            });
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        if (!localStorage.getItem(TOKEN_KEY)) {
            document.getElementById('panel-blue').style.display = '';
            setTimeout(function() {
                var scroll = document.getElementById('main-scroll');
                if (scroll) scroll.scrollLeft = 0;
            }, 500);
        }
    });

    document.body.addEventListener('htmx:configRequest', function(e) {
        var token = window.api.token();
        if (token) {
            e.detail.headers['Authorization'] = 'Bearer ' + token;
        }
        e.detail.headers['X-Requested-With'] = 'XMLHttpRequest';
    });

    document.body.addEventListener('htmx:afterRequest', function(e) {
        var p = e.detail.pathInfo.requestPath;
        var ct = e.detail.xhr.getResponseHeader('Content-Type') || '';
        if (ct.indexOf('application/json') === -1) return;

        try {
            var d = JSON.parse(e.detail.xhr.responseText);
            if (p.indexOf('/Auth/authorize') !== -1 && d.success && d.data && d.data.requires2FA) {
                if (typeof render2FA === 'function') {
                    render2FA(d.data.username || 'admin');
                }
            }
            if (p.indexOf('/Auth/verify-2fa') !== -1 && d.success && d.data && d.data.token) {
                localStorage.setItem(TOKEN_KEY, d.data.token);
                if (typeof showDashboard === 'function') showDashboard();
            }
            if (p.indexOf('/Auth/register') !== -1 && d.success) {
                if (typeof renderLogin === 'function') renderLogin();
            }
        } catch (ex) {}
    });

    document.body.addEventListener('htmx:responseError', function(e) {
        if (e.detail.xhr.status === 401 && typeof logout === 'function') {
            logout();
        }
    });

    window.logout = function() {
        localStorage.removeItem(TOKEN_KEY);
        if (typeof updateHeaderVisibility === 'function') updateHeaderVisibility();
        if (typeof closeChat === 'function') closeChat();
        if (typeof renderLogin === 'function') renderLogin();
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
})();