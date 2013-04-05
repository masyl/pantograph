

function Sheet(name, onConnection) {
    if ( !(this instanceof Sheet) )
        return new Sheet(onConnection);

    this.name = name;
    this.onConnection = onConnection;
}

Sheet.prototype.listen = function () {
    console.log("LISTEN - NOT IMPLEMENTED!");
    return this;
};

Sheet.prototype.with = function () {
    console.log("WITH - NOT IMPLEMENTED!");

    return this;
};

Sheet.prototype.do = function () {
    console.log("DO -  NOT IMPLEMENTED!");
    return this;
};


module.exports = Sheet;