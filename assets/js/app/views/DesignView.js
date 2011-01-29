window.DesignView = Backbone.View.extend({
    tagName:  "div",
    //template: _.template($('#item-template').html()),
    events: {
        "click .check"              : "toggleDone",
        "dblclick div.todo-content" : "edit",
        "click span.todo-destroy"   : "clear",
        "keypress .todo-input"      : "updateOnEnter"
    },
    initialize: function() {
        _.bindAll(this, 'render', 'close');
        this.model.bind('change', this.render);
        this.model.view = this;
    },
    render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        this.setContent();
        return this;
    },
    setContent: function() {
        var content = this.model.get('content');
        this.$('.todo-content').text(content);
        this.input = this.$('.todo-input');
        this.input.bind('blur', this.close);
        this.input.val(content);
    }
  });