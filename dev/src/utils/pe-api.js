const $ = require('jquery');
const API_ENDPOINT_IP = '149.91.81.151';
const API_ENDPOINT_PORT = '3000';
const API_ENDPOINT = 'https://'+API_ENDPOINT_IP+":"+API_ENDPOINT_PORT+"/api/"

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
