// THE ORIGINAL OF THIS FILE IS IN frontend/javascript
(function () {
  'use strict';
  function disableParticipationSubmitButton() {
    $('#participationinfoform :submit').prop('disabled', ($('[name=nightsOption]:checked').length === 0) || ($('[name=roomsOptions]:checked').length === 0));
  }

  $(function () {
    $('[name|=nightsOption]').on('change', disableParticipationSubmitButton);
    $('[name|=roomsOptions]').on('change', disableParticipationSubmitButton);
  });
}());
