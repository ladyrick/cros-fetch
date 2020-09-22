(function () {
    const html = document.querySelector('html');
    html.setAttribute('onclick', `window.CrosFetch = (function () {
    document.addEventListener('response', function (e) {
        const response_obj = e.detail;
        document.dispatchEvent(new CustomEvent('cros-fetch-' + response_obj.key, { detail: response_obj }));
    }, false);

    return (input, init = {}) => {
        return new Promise((resolve, reject) => {
            const request = {
                input: input,
                init: init,
                key: Math.random().toString(36).slice(2),
            };
            document.dispatchEvent(new CustomEvent('request', { detail: request }));
            const handler = (e) => {
                document.removeEventListener('cros-fetch-' + request.key, handler);
                const response_obj = e.detail;
                if (response_obj.error) {
                    reject(new window[response_obj.error.name](response_obj.error.message));
                } else {
                    resolve(response_obj.resolve);
                }
            }
            document.addEventListener('cros-fetch-' + request.key, handler);
        });
    };
})();
document.querySelector('html').removeAttribute('onclick');
`);
    html.click();
    document.addEventListener('request', function (e) {
        console.log('%cCrosFetch req ' + e.detail.key, 'color: #e88d67', e.detail);
        chrome.runtime.sendMessage('', e.detail, {}, response => {
            console.log('%cCrosFetch rsp ' + response.key, 'color: #7b8cde', response);
            document.dispatchEvent(new CustomEvent('response', { detail: response }));
        });
    }, false);
})();