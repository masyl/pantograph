
var getFunexSource = require("./getFunexSource");

function Macro(id, source, callback) {
    this.id = id;

    this.source = getFunexSource(source);
    this.callback = callback || null;
}

Macro.prototype.onCallback = function (data) {
    if (this.callback) {
        this.callback(data)
    }
}

function Macros(selection, parent) {

    this.all = (parent && parent.all) || {};
    this.p = (parent && parent.p) || null;
    this.selection = selection || null;
}


Macros.prototype.get = function (id) {
    var newSelection = new Macros(this.all[id], this)
    return newSelection;
}

Macros.prototype.attach = function (p) {
    this.p = p;
    return this;
};

Macros.prototype.new = function (id, source, callback) {
    var selection = new Macro(id, source, callback);
    this.all[id] = selection;
    this.selection = selection;
    this.teach();
    // Return a new selection
    return new Macros(selection, this);
};

Macros.prototype.run = function (model, runtimeContext) {
    var macro = this.selection;
    var data = {
        macro: macro.id,
        model: model
    };
    var _onCallback = null;
    if (macro.callback) _onCallback = macro.callback;
    this.p.socket.emit("run", data, _onCallback);
    return this;
};

Macros.prototype.teach = function () {
    this.p.socket.emit("teach", {
        "id": this.selection.id,
        "source": this.selection.source,
    });

    return this;
};


module.exports = Macros;

