$('.ny-wrap').mousemove(function(e){
    var width = $(this).width() / 2;
    var height = $(this).height() / 2;

    var snow1MovedX = ((width - e.pageX) / 16);
    var snow1MovedY = ((height - e.pageY) / 26);

    var snow2MovedX = ((width - e.pageX) / 40);
    var snow2MovedY = ((height - e.pageY) / 30);

    var tape1MovedX = ((width - e.pageX) / 50);
    var tape1MovedY = ((height - e.pageY) / 60);

    var tape2MovedX = ((width - e.pageX) / 30);
    var tape2MovedY = ((height - e.pageY) / 80);

    var tape3MovedX = ((width - e.pageX) / 60);
    var tape3MovedY = ((height - e.pageY) / 70);

    var tape4MovedX = ((width - e.pageX) / 90);
    var tape4MovedY = ((height - e.pageY) / 70);

    var moonMovedX = ((width - e.pageX) / 100);
    var moonMovedY = ((height - e.pageY) / 150);

    var deerMovedX = ((width - e.pageX) / 30);
    var deerMovedY = ((height - e.pageY) / 10);

    var transparantMovedX = ((width - e.pageX)  / 45);
    var transparantMovedY = ((height - e.pageY)  / 45);

    $('.snow1').css({'marginLeft': snow1MovedX, 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.snow1').css({'marginTop': snow1MovedY, 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

    $('.snow2').css({'marginLeft': snow2MovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.snow2').css({'marginTop': snow2MovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

    $('.moon').css({'marginLeft': moonMovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.moon').css({'marginTop': moonMovedY , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

    $('.deers').css({'marginLeft': deerMovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.deers').css({'marginTop': deerMovedY , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

    $('.transparant').css({'marginLeft': transparantMovedX, 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.transparant').css({'marginTop': transparantMovedY, 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});


    $('.tape1').css({'marginLeft': tape1MovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.tape1').css({'marginTop': tape1MovedY , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

    $('.tape2').css({'marginLeft': tape2MovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.tape2').css({'marginTop': tape2MovedY , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

    $('.tape3').css({'marginLeft': tape3MovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.tape3').css({'marginTop': tape3MovedY , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

    $('.tape4').css({'marginLeft': tape4MovedX , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});
    $('.tape4').css({'marginTop': tape4MovedY , 'transition-property': 'all', 'transition-duration': '.01s', 'transition-timing-function': 'ease-in'});

});