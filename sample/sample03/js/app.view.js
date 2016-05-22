
var TodoView = Backbone.View.extend({
    model: Todo,
    template: _.template($("#todo").html(), { sandbox: $("#sandbox") }),

    events: {
        "click #del": "del",
        "click #chk": "chk",
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
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
