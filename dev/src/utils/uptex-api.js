const $ = require('jquery');
const API_ENDPOINT = 'https://uptextv.com:3000/'

function request(method, path) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: API_ENDPOINT+path,
            method,
            timeout: 30000,
            success: function(res){
                resolve(res)
            },
            error: ({status, responseJSON}) => reject({
                status,
                data: responseJSON
            })
        });
    });
}

module.exports = {
    get(path) {
        return request('GET', path);
    },

    post(path) {
        return request('POST', path);
    },

    put(path) {
        return request('PUT', path);
    },

    patch(path) {
        return request('PATCH', path);
    },

    delete(path) {
        return request('DELETE', path);
    }
};
