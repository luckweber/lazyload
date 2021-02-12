const ignoreReplace = [
    /\.js(\?.*)?$/,
    /\.css(\?.*)?$/,
    /\.svg(\?.*)?$/,
    /\.ico(\?.*)?$/,
    /\.woff(\?.*)?$/,
    /\.png(\?.*)?$/,
    /\.jpg(\?.*)?$/,
    /\.jpeg(\?.*)?$/,
    /\.gif(\?.*)?$/,
    /\.pdf(\?.*)?$/
];

export const replaceHtmlBody =  (environment, accountName) => (req, res, next) => {
    let data;
    let end;
    let proxiedHeaders; 
    let proxiedStatusCode; 
    let write;
    let writeHead;
    let currentURL = req.url
    
    if (ignoreReplace.some((ignore) => ignore.test(currentURL))) {
        return next();
    }

    data = "";
    write = res.write;
    end = res.end;
    writeHead = res.writeHead;
    proxiedStatusCode = null;
    proxiedHeaders = null;

    res.writeHead = function(statusCode, headers) {
        proxiedStatusCode = statusCode;
        return (proxiedHeaders = headers);
    };

    res.write = function(chunk) {
        return (data += chunk);
    };

    res.end = function(chunk) {

        if (chunk) { data += chunk }

        data = data.replace(new RegExp("vteximg", "g"), "vtexlocal");
        data = data.replace(new RegExp("https://" + accountName, "g"),"http://" + accountName);

        res.write = write;
        res.end = end;
        res.writeHead = writeHead;

        if (proxiedStatusCode && proxiedHeaders) {
            proxiedHeaders["content-length"] = Buffer.byteLength(data);
            if (secureUrl) {
              delete proxiedHeaders["content-security-policy"];
            }
            res.writeHead(proxiedStatusCode, proxiedHeaders);
        }

        return res.end(data);
    }
    
    return next()
}

