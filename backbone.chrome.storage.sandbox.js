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
        define(["backbone", "jquery"], function (Backbone) {
            factory(Backbone || root.Backbone);
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

    var createid = function () {
        var date = new Date();
        return String(Math.round(date.getTime() / 1000));
    };

    root.IsSandbox = window.parent ? false : true;

    if (window.parent) {

        Backbone.PostMessages = {};

        var ChromeStorageTaskFactory = Backbone.ChromeStorageTaskFactory = function (task_opt) {

            var task_fnc;
            var id = createid();

            var task_msg = {
                type: task_opt.type,
                name: task_opt.name,
                method: task_opt.method,
                id: task_opt.id ? task_opt.id : undefined,
                data: task_opt.data,
            }


            task_fnc = function (response) {
                window.parent.postMessage({ id: id, task_msg: task_msg }, '*');
                Backbone.PostMessages[id] = response;
            };

            var task = new root.ChromeStorageTask(task_fnc, task_opt);
            return task;
        }
    }

    window.addEventListener("message", function (event) {
        console.log(event);
        if (event.data.resp) {
            Backbone.PostMessages[event.data.id](event.data.resp);
        } else {
            root.chromeStorageAdapter(event.data.task_msg, function (resp) {
                event.source.postMessage({ id: event.data.id, resp: resp }, '*');
            });
        }
    });
}));