

var Todo = Backbone.Model.extend({

});

var TodoCollection = Backbone.Collection.extend({
    model: Todo,
    chromeStorage: new Backbone.chromeStorage("todo-list", { background: true, extensionId: "hejjndckonfmigdjccgjkhopejpmjlhg", type: "local" }),
});