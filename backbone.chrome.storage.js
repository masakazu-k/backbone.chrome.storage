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
        define(["backbone", "jquery"], function (Backbone, $) {
            root.Backbone = factory(Backbone || root.Backbone, $);
            return root.Backbone;
        });
    } else if (typeof exports !== "undefined" && typeof require !== "undefined") {
        module.exports = factory(require("backbone"), require("jquery"));
    } else {
        root.Backbone = factory(Backbone, $);
    }

} (this, function (Backbone, $) {

    Backbone.defaultSync = Backbone.sync;

    var has = function (map, name) {
        if (!map) return false;
        if (name in map) return true;
        return false;
    }

    var chromeStorage = Backbone.chromeStorage = function (name, options) {
        this.options = $.extend(
            Backbone.chromeStorageDefault,
            { name: name, type: 'local' },
            options
        );
    };

    Backbone.chromeStorageDefault = { sync: false, listen: false, background: chrome.storage ? true : false, extensionId: chrome.runtime.id };

    Backbone.sync = function (method, model, options) {
        if (has(model, 'chromeStorage') || (model.collection && has(model.collection, 'chromeStorage'))) {
            return Backbone.chromeStorageSync(method, model, options);
        }
        else {
            return Backbone.defaultSync(method, model, options);
        }
    };

    var createid = function () {
        var date = new Date();
        return String(Math.round(date.getTime()));
    };

    var modelMap = {
        'create': 'create',
        'update': 'set',
        'patch': 'set',
        'delete': 'remove',
        'read': 'get'
    };

    var collectionMap = {
        'create': 'create',
        'update': 'set',
        'patch': 'set',
        'delete': 'remove',
        'read': 'getall'
    };

    Backbone.chromeStorageSync = function (method, model, options) {

        if (method == "create") {
            if (!model.id) {
                model.id = createid();
                model.set(model.idAttribute, model.id);
            }
        }

        var iscollection = model instanceof Backbone.Collection;

        var task_opt = $.extend(
            {
                type: 'local',
                method: iscollection ? collectionMap[method] : modelMap[method],
                id: model.id ? model.id : undefined,
                //data: JSON.stringify(options.attrs || model.toJSON(options)),
                data: options.attrs || model.toJSON(options),
                success: options.success,
                iscollection: iscollection
            },
            model.chromeStorage ? model.chromeStorage.options : model.collection.chromeStorage.options
        );

        if (iscollection) {
            task_opt.success = function (resp) {
                array = [];
                for (var key in resp) {
                    array.push(resp[key])
                }
                options.success(array);
            }
        } else {
            task_opt.success = function (resp) {
                options.success(resp[task_opt.id]);
            }
        }

        var task = Backbone.ChromeStorageTaskFactory(task_opt);
        Backbone.chromeStorageTaskManager.done(task);

        options.xhr = task.promise;
        model.trigger('request', model, task.promise, options);
        return task.promise;
    };


    var ChromeStorageTaskFactory = Backbone.ChromeStorageTaskFactory = function (task_opt) {
        var task_fnc;

        if (task_opt.background) {

            var task_msg = {
                type: task_opt.type,
                name: task_opt.name,
                method: task_opt.method,
                id: task_opt.id ? task_opt.id : undefined,
                data: task_opt.data,
            }

            if (task_opt.extensionId) {
                task_fnc = function (response) { chrome.runtime.sendMessage(task_opt.extensionId, task_msg, response); };
            } else {
                task_fnc = function (response) { chrome.runtime.sendMessage(task_msg, response); };
            }
        } else {
            task_fnc = function (response) { Backbone.chromeStorageAdapter(task_opt, response) };
        }

        var task = new ChromeStorageTask(task_fnc, task_opt);
        return task;
    }

    var ChromeStorageTask = Backbone.ChromeStorageTask = function (task_fnc, task_opt) {
        var deffer = new $.Deferred();

        this.response = function (resp) {
            try {
                console.log("response", resp)
                if (task_opt.success) {
                    task_opt.success(resp);
                }
                deffer.resolve(resp);
            } catch (e) {
                if (task_opt.fail) {
                    task_opt.fail(resp);
                }
                deffer.reject(resp);
            }
        };
        this.task_fnc = task_fnc;
        this.task_opt = task_opt;
        this.promise = deffer.promise();

        this.isRead = task_opt.method == "get" || task_opt.method == "getall";
    }

    ChromeStorageTask.prototype.done = function () {
        this.task_fnc(this.response);
        console.log("done", this.task_opt)
    }

    var ChromeStorageTaskManager = Backbone.ChromeStorageTaskManager = function () {
        this.tasks = [];
    }

    ChromeStorageTaskManager.prototype.done = function (task) {
        if (task.isRead) {
            task.done();
            return;
        }

        var _this = this;
        // Not work, why?
        // task.promise = task.promise.then(
        //     function (resp) {
        //         console.log("promise", _this.tasks);
        //         _this.tasks.shift();
        //         _this.next();
        //         return resp;
        //     }, function (resp) {
        //         console.log("promise", _this.tasks);
        //         _this.tasks.shift();
        //         _this.next();
        //         return resp;
        //     });

        // Instead of the above code, use the following.
        var _response = task.response;
        task.response = function (resp) {
            _response(resp);
            _this.tasks.shift();
            _this.next();
        }

        this.tasks.push(task);
        if (this.tasks.length == 1) {
            this.next();
        }
    }

    ChromeStorageTaskManager.prototype.next = function () {
        if (this.tasks.length > 0) {
            this.tasks[0].done();
        }
    }

    Backbone.chromeStorageTaskManager = new ChromeStorageTaskManager();

    // Change monitoring is not implemented yet.
    var ChromeStorageListener = Backbone.ChromeStorageListener = function () {
        var _this = this;
        this.listener = function (changes, areaName) {
            // Below, the non-implementation point for change monitoring.
            for (var key in changes) {
                var id = changes[key].oldValue.id + "-" + areaName;
                if (id in _this.onlistten) {
                    var model = _this.onlistten[id];
                    // Provisional code.
                    model.trigger('chrome-storage-change', model, changes[key], {});
                }
            }
        }
        this.onlistten = {};
    }

    ChromeStorageListener.prototype.onlistten = function (options) {
        var task_opt = $.extend(
            Backbone.chromeStorage.default,
            { method: "addlistener", type: "" },
            options ? options : {}
        );

        if (Backbone.chromeStorageAdapterIsEnable) {
            Backbone.chromeStorageAdapter(task_opt, this.listener)
        } else {
            if (task_opt.extensionId) {
                chrome.runtime.sendMessage(task_opt.extensionId, task_opt, this.listener);
            }
            else {
                chrome.runtime.sendMessage(task_opt, this.listener);
            }
        }
    }

    ChromeStorageListener.prototype.addListener = function (model) {
        var chromeStorage = model.chromeStorage ? model.chromeStorage : model.collection.chromeStorage;
        this.onlistten[model.id + "-" + chromeStorage.options.type] = model;
    }

    Backbone.chromeStorageListener = new ChromeStorageListener();

    return Backbone;
}));