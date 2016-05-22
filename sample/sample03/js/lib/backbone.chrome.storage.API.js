/**
 * Backbone chrome.storage Adapter
 * Version 0.0.1
 *
 * https://github.com/masakazu-k/backbone.chrome.storage
 */
(function (root, factory) {

    // In order to cope with the RequireJS, etc., for the time being implemented.
    // Behavior is unconfirmed.
    if (typeof define === "function" && define.amd) {
        define(["backbone"], function (Backbone) {
            root.Backbone = factory(Backbone || root.Backbone);
            return root.Backbone;
        });
    } else if (typeof exports !== "undefined" && typeof require !== "undefined") {
        module.exports = factory(require("backbone"));
    } else {
        if (typeof Backbone !== "undefined") {
            factory(Backbone);
        } else {
            factory(this);
        }
    }

} (this, function (root) {

    var chromeStorageAdapterIsEnable = root.chromeStorageAdapterIsEnable = chrome.storage ? true : false;

    var chromeStorageApi = root.chromeStorageApi = function (task_opt, storage, response) {
        console.log(task_opt);
        switch (task_opt.method) {
            case "get":
                storage.get(task_opt.id, function (value) { response(value); });
                return true;

            case "set":
                var set = {};
                set[task_opt.id] = task_opt.data;
                storage.set(set, function () { response({}); });
                return true;

            case "create":
                var set = {};
                set[task_opt.id] = task_opt.data;
                storage.get(task_opt.name, function (values) {
                    console.log(values);
                    if (values.length == 0 || !values[task_opt.name]) values[task_opt.name] = [];
                    if (values[task_opt.name].indexOf(task_opt.id) == -1) values[task_opt.name].push(task_opt.id);
                    console.log("after", values);
                    storage.set(values, function () {
                        storage.set(set, function () { response({}); });
                    });
                });
                return true;

            case "remove":
                storage.get(task_opt.name, function (values) {
                    if (values.length == 0 || !values[task_opt.name]) values[task_opt.name] = [];
                    var index = values[task_opt.name].indexOf(task_opt.id);
                    if (index == -1) { response({}); return; }
                    values[task_opt.name].splice(index, 1);
                    storage.set(values, function () {
                        storage.remove(task_opt.id, function () { response({}); });
                    });
                });
                return true;

            case "getall":
                storage.get(task_opt.name, function (value) {
                    if (!value[task_opt.name] || value[task_opt.name].length == 0) { response({}); return; }
                    storage.get(value[task_opt.name], function (value) { response(value); });
                });
                return true;

            case "addlistener":
                chrome.storage.onChanged.addListener(response);
                return;
        }
        console.log(task_opt);
        response({});
    };

    var chromeStorageAdapter = root.chromeStorageAdapter = function (request, response) {
        if (!chromeStorageAdapterIsEnable) {
            return;
        }
        var storage;
        if (request.type == "sync") {
            storage = chrome.storage.sync;
        }
        else if (request.type == "local") {
            storage = chrome.storage.local;
        }
        else if (request.type == "managed") {
            storage = chrome.storage.managed;
        }
        return chromeStorageApi(request, storage, response);
    };
}));