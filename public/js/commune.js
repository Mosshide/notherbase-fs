const commune = async (action, data = null, options) => {
    try {
        let body = {
            action,
            data,
            ...options
        };
    
        let response = null;
    
        let onResponse = (res) => {
            response = res;
            if (res.status != "success") console.log(`${res.status}: ${res.message}`, res.data);
        };
    
        await $.post("/s", JSON.stringify(body), onResponse);
    
        return response;
    } catch (error) {
        return error;
    }
}