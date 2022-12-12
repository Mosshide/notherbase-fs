const commune = async (action, data = null, options) => {
    let body = {
        action,
        data,
        ...options
    };

    let response = null;

    let onResponse = (res) => {
        console.log(res);
        response = res;
        if (res.status != "success") console.log(`${res.status}: ${res.message}`, res.data);
    };

    await $.post("/s", JSON.stringify(body), onResponse);

    return response;
}