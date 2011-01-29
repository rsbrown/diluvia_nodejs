window.Account = Backbone.Model.extend({
   initialize: function() {
       if (!this.get("accountName")) {
           this.set({"accountName": this.EMPTY});
       }
       if (!this.get("zones")) {
           this.set({"zones": []});
       }
   }
});