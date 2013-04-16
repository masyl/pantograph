function getFunexSource(input) {
    var source;
    var linefeed = String.fromCharCode(10);
    if (typeof input === "function") {
        var fnString = input.toString();
        fnString = fnString.split(linefeed);
        fnString.pop();
        fnString.shift();
        fnString.forEach(function(val, i, obj) {
            var newVal = val.trim();
            if (newVal.substr(newVal.length-1) === ";") newVal = newVal.substr("-", newVal.length-1);
            obj[i] = newVal;
        })
        source = fnString;
    } else if (typeof input === "string") {
        source = [input];
    } else if (Array.isArray(input)) {
        source = input;
    } else {
        source = null;
    }
    return source;
}

module.exports = getFunexSource;