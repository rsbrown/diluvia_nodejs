window.AccountView = Backbone.View.extend({
   tagName: "div",
   className: "account-view",
   template: _.template("<div id='account-viewer'><span><%= accountName %></span></div>"),
   events: {
       "click .icon": "open",
       "click .button.edit": "openEditDialog",
       "click .button.save": "save"
   },
   initialize: function() {
       _.bindAll(this, "render");
   },
   render: function() {
       $(this.el).html(this.template(this.model.toJSON()));
       return this;
   }
});