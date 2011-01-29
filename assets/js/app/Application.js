$(function() {
    window.AppView = Backbone.View.extend({
        el: $("#application"),
        //tileTemplate: _.template($('#stats-template').html()),
        templateContent: "<img src='<% img_src %>'/>",
        tileTemplate: _template(this.templateContent),
        events: {
            //"keypress #new-todo":  "createOnEnter",
            //"keyup #new-todo":     "showTooltip",
            //"click .todo-clear a": "clearCompleted"
        },
        initialize: function() {
            _.bindAll(this, 'renderTiles');
            Tiles.fetch();
        },
        renderTiles: function() {
            _.each(Tiles, function(t) {
                this.$('#tiles').html(this.tileTemplate({
                    img:        t.img,
                    label:       t.label
                }));
            });
        }
    });
  });
});