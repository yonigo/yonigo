jQuery(document).ready(function () {
    'use strict';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $("a[data-rel=tooltip]").tooltip('destroy');
        jQuery('#intro-section').css("background-attachment", "scroll");
    }
    else
        jQuery('#intro-section').parallax("50%", -0.4);
});

jQuery(window).scroll(function () {
    'use strict';
    if (jQuery(document).scrollTop() >= 130) {
        jQuery('#nav-wrapper').addClass('tinyheader');
    } else {
        jQuery('#nav-wrapper').removeClass('tinyheader');
    }
    if (jQuery(document).scrollTop() >= 35) {
        jQuery('#nav-wrapper').addClass('tiny');
        jQuery('#top-header').addClass('hide-top-header');
    } else {
        jQuery('#nav-wrapper').removeClass('tiny');
        jQuery('#top-header').removeClass('hide-top-header');
    }
});