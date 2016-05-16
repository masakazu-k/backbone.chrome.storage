
var TodoView = Backbone.View.extend({
    model: Todo,
    tagName: "li",

    events: {
        "click #del": "del",
        "click #chk": "chk",
    },

    render: function () {
        var html = "<input type='checkbox' id='chk' " +
            (this.model.get("done") ? "checked" : "") + "/>" +
            this.model.get("text") +
            "<button id='del'>del</button>";
        this.$el.html(html);
        return this;
    },

    del: function (e) {
        this.model.destroy();
    },

    chk: function (e) {
        this.model.set("done", e.currentTarget.checked);
        this.model.save();
    }
});

var TodoCollectionView = Backbone.View.extend({
    el: "#todo-list",
    collection: TodoCollection,

    initialize: function () {
        this.collection.bind("change reset add remove", this.render, this);
    },

    render: function () {
        this.$el.empty();
        this.collection.each(function (tab) {
            this.addTodoView(tab);
        }, this);
        return this;
    },

    addTodoView: function (tab) {
        this.$el.append(new TodoView({ model: tab }).render().el);
        return;
    }
});

var InputView = Backbone.View.extend({
    el: "#input",
    collection: TodoCollection,

    events: {
        "click #add": "add"
    },

    add: function (e) {
        this.collection.create({ text: $("#text").val(), done: false });
        return false;
    }
});
