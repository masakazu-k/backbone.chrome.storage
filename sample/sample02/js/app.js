
var mainApp = function () {
    this.localstorage = new TodoCollection();
    this.inputview = new InputView({ collection: this.localstorage });
    this.localView = new TodoCollectionView({ collection: this.localstorage });
    this.localstorage.fetch();
    this.localView.render();
}

$(function () {
    app = new mainApp();
});