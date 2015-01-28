
angular.module('test.modal3', ['ui.bootstrap']);
angular.module('test.modal3').controller('ModalCtrl', function ($scope, $modal, $log) {


  $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: '../share.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        shareURL: function () {
          return "abcde";
        }
      }
    });

    // modalInstance.result.then(function (selectedItem) {
    //   $scope.selected = selectedItem;
    // }, function () {
    //   $log.info('Modal dismissed at: ' + new Date());
    // });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('test.modal3').controller('ModalInstanceCtrl', function ($scope, $modalInstance, shareURL) {

  $scope.shareURL = shareURL;
 

  // $scope.ok = function () {
  //   $modalInstance.close($scope.selected.item);
  // };

  // $scope.cancel = function () {
  //   $modalInstance.dismiss('cancel');
  // };
});