(function() {
  var FilmStrip, filmStrip, swapCards, timerFunction;

  timerFunction = 'cubic-bezier(.45, 0, .59, 1)';

  $.fx.speeds.medium = 280;

  $.fn.translateX = function() {
    var translateMatch;
    translateMatch = (this.css($.fx.cssPrefix + 'transform') || '').match(/\((-?\d+)/);
    if (translateMatch) {
      return Number(translateMatch[1]);
    } else {
      return 0;
    }
  };

  /*
  Description popup show / hide with animation
  */


  $(document).on('click', '.desc h2 a', function(e) {
    var el, oldEl;
    el = $(e.target).closest('.desc');
    if (el.hasClass('popup')) {
      el.animate({
        opacity: 0,
        translate3d: '0,10px,0'
      }, 'medium', 'cubic-bezier(.45, 0, .59, 1)', function() {
        return el.remove();
      });
    } else {
      oldEl = el;
      el = el.clone();
      el.animate({
        'z-index': Number(oldEl.css('z-index')) + 1,
        'position': 'absolute',
        'margin-top': '0px',
        'opacity': 0.2,
        translate3d: '0,-5px,0'
      }, 0, null, function() {
        return el.insertBefore(oldEl).toggleClass('popup').animate({
          opacity: 1,
          translate3d: '0,0,0'
        }, 'medium', 'cubic-bezier(0, 0, .62, .99)');
      });
    }
    return false;
  });

  $(document).on('click', '.desc a[href="#next"]', function(e) {
    e.preventDefault();
    return filmStrip.next();
  });

  /*
  Play video on click
  */


  $(document).on('click', '.video-play', function() {

    var playLink = $(this),
    video;

    playLink.parent().animate({"opacity" : 0}, 100);
    video = filmStrip.currentVideo();

    if (video.size()) {
      video.get(0).play();
      video.addClass("playing");
      video.on('ended', function(e) {
        playLink.text("Replay");
        video.removeClass("playing");
        if (video.parent().hasClass('current')) {
          playLink.parent().animate({"opacity" : 1}, 250);
        } else {
          playLink.parent().hide();
        }
      });
    }

  });

  /*
  FilmStrip - helper class for prev / next transitioning
  */


  filmStrip = null;

  FilmStrip = (function() {

    function FilmStrip(strip) {
      var _this = this,
      video;
      this.strip = $(strip);
      this.currentFigure = this.figures().first().addClass('current');
      this.currentPosition = 0;
      this.showLabels();
      video = this.currentVideo();
      if (video.load()) {
        this.showVideoControls();
      }
      this.strip.on('click', 'figure img, figure video', function(e) {
        var targetFigure;
        targetFigure = $(e.target).closest('figure');
        if (targetFigure.size()) {
          return _this.moveToFigure(targetFigure);
        }
      });
    }

    FilmStrip.prototype.figures = function() {
      return this.strip.find('figure');
    };

    FilmStrip.prototype.index = function() {
      return this.figures().index(this.currentFigure);
    };

    FilmStrip.prototype.moveToIndex = function(index) {
      return this.moveToFigure(this.figures().eq(index));
    };

    FilmStrip.prototype.next = function() {
      return this.moveToFigure(this.nextFigure());
    };

    FilmStrip.prototype.prev = function() {
      return this.moveToFigure(this.prevFigure());
    };

    FilmStrip.prototype.moveToFigure = function(figure) {
      var deltaOffset, previousOffset, tempOffset,
        _this = this;
      if (!figure.size()) {
        return;
      }
      previousOffset = this.currentFigure.offset().left;
      if (figure.offset().left === previousOffset) {
        return;
      }
      tempOffset = figure.translateX();
      if (tempOffset === 1) {
        tempOffset = 0;
      }
      if (this.cardsVisible()) {
        this.hideCards();
      }
      this.hideLabels();
      this.hideVideoControls();
      this.currentFigure.removeClass('current');
      this.currentFigure = figure;
      this.currentFigure.addClass('current');
      deltaOffset = this.currentFigure.offset().left - previousOffset - tempOffset;
      this.slideBy(deltaOffset);
      if (this.isPhone()) {
        this.showCards();
      }
      this.showLabels();
      return setTimeout(function() {
        return _this.showVideoControls();
      }, $.fx.speeds.medium);
    };

    FilmStrip.prototype.slideBy = function(delta) {
      this.strip.trigger('filmstrip:slide');
      this.currentPosition -= delta;
      return this.strip.animate({
        translate3d: "" + this.currentPosition + "px,0,0"
      }, 'medium', timerFunction);
    };

    FilmStrip.prototype.hasPrev = function() {
      return this.index() > 0;
    };

    FilmStrip.prototype.hasNext = function() {
      return this.index() < this.figures().size() - 1;
    };

    FilmStrip.prototype.prevFigure = function() {
      return this.figures().eq(this.index() - 1);
    };

    FilmStrip.prototype.nextFigure = function() {
      return this.figures().eq(this.index() + 1);
    };

    FilmStrip.prototype.leftElements = function() {
      return this.figures().slice(0, this.index()).add(this.currentFigure.find('img, video'));
    };

    FilmStrip.prototype.rightElements = function() {
      return this.figures().slice(this.index() + 1).add(this.currentFigure.find('figcaption > div'));
    };

    FilmStrip.prototype.cardsVisible = function() {
      return this.currentFigure.find('figcaption').css('opacity') > 0;
    };

    FilmStrip.prototype.isPhone = function() {
      return this.currentFigure.hasClass('iPhone');
    };

    FilmStrip.prototype.currentLabels = function() {
      return this.currentFigure.children('.show, .hide').add(this.currentFigure.prev('.desc'));
    };

    FilmStrip.prototype.showLabels = function() {
      return this.currentLabels().css({
        visibility: 'visible',
        opacity: 0
      }).animate({
        opacity: 1
      }, 'medium', timerFunction);
    };

    FilmStrip.prototype.hideLabels = function() {
      return this.currentLabels().animate({
        opacity: 0
      }, 'medium', timerFunction, function() {
        return $(this).css('visibility', 'hidden');
      });
    };

    FilmStrip.prototype.currentVideo = function() {
      return this.currentFigure.children('.desc + figure video');
    };

    FilmStrip.prototype.currentControls = function() {
      return this.currentFigure.children('figcaption.video-controls');
    };

    FilmStrip.prototype.showVideoControls = function() {
      var video = this.currentVideo();
      if (!video.hasClass('playing')) {
        return this.currentControls().css({
          display: 'block',
          opacity: 0
        }).animate({
          opacity: 1
        }, 250, timerFunction);
      } else {
        return false;
      }
    };

    FilmStrip.prototype.hideVideoControls = function() {
      var video = this.currentVideo();
      if (!video.hasClass('playing')) {
        return this.currentControls().animate({
          opacity: 0
        }, 'medium', timerFunction, function() {
          return $(this).hide();
        });
      } else {
        return false;
      }
    };

    FilmStrip.prototype.showCards = function() {
      var figureHeight;
      figureHeight = (this.currentFigure.find('img, video').filter(function() {
        return $(this).css('display') !== 'none';
      })).height();
      this.currentFigure.find('figcaption').css('margin-top', -figureHeight);
      (this.isPhone() ? this.rightElements() : this.leftElements()).animate({
        translate3d: "" + (this.isPhone() ? '' : '-') + "545px,0,0"
      }, 'medium', timerFunction);
      this.currentFigure.find('figcaption').animate({
        opacity: 1
      }, 'medium', timerFunction);
      this.currentFigure.find('.cardwrapper').eq(1).animate({
        translate3d: "-78px,0,0"
      }, (this.isPhone() ? 0 : 'medium'), timerFunction);
      this.currentFigure.find('.show a').animate({
        translate3d: "-220px,0,0",
        opacity: 0
      }, 'medium', timerFunction, function() {
        return $(this).hide();
      });
      return this.currentFigure.find('.hide a').css({
        opacity: 0,
        display: 'inline-block'
      }).animate({
        translate3d: "-220px,0,0",
        opacity: 1
      }, 'medium', timerFunction);
    };

    FilmStrip.prototype.hideCards = function() {
      (this.isPhone() ? this.rightElements() : this.leftElements()).animate({
        translate3d: "0,0,0"
      }, 'medium', timerFunction);
      this.currentFigure.find('figcaption').animate({
        opacity: 0
      }, 'medium', timerFunction);
      if (!this.isPhone()) {
        this.currentFigure.find('.cardwrapper').eq(1).animate({
          translate3d: "0,0,0"
        }, 'medium', timerFunction);
      }
      this.currentFigure.find('.show a').css({
        display: 'inline-block'
      }).animate({
        translate3d: "0,0,0",
        opacity: 1
      }, 'medium', timerFunction);
      return this.currentFigure.find('.hide a').animate({
        translate3d: "0,0,0",
        opacity: 0
      }, 'medium', timerFunction, function() {
        return $(this).hide();
      });
    };

    return FilmStrip;

  })();

  $(function() {
    return window.filmStrip = filmStrip = new FilmStrip('.filmstrip');
  });

  /*
  Prev / Next buttons
  */


  $(document).on('click', '.scene-nav a', function(e) {
    var link, method;
    e.preventDefault();
    link = $(e.target);
    if (!link.hasClass('disabled')) {
      method = link.attr('href').replace('#', '');
      return filmStrip[method]();
    }
  });

  $(document).on('filmstrip:slide', function() {
    $('.desc.popup h2 a').trigger('click');
    $('.scene-nav').find('a[href="#next"]').toggleClass('disabled', !filmStrip.hasNext());
    return $('.scene-nav').find('a[href="#prev"]').toggleClass('disabled', !filmStrip.hasPrev());
  });

  /*
  Keyboard
  */


  $(document).on('keydown', function(e) {
    if (e.keyCode === 16) {
      return $.fx.speeds.medium = 3000;
    }
  });

  $(document).on('keyup', function(e) {
    var index;
    if (e.keyCode === 37) {
      return filmStrip.prev();
    } else if (e.keyCode === 39) {
      return filmStrip.next();
    } else if (e.keyCode >= 49 && e.keyCode <= 57) {
      index = e.keyCode - 49;
      return filmStrip.moveToIndex(index);
    } else if (e.keyCode === 16) {
      return $.fx.speeds.medium = 300;
    }
  });

  /*
  Card swapping
  */


  $(document).on('click', 'figure .card', function(e) {
    var card, link;
    card = $(this);
    link = $(e.target).closest('.switch a', this);
    if (link.size()) {
      e.preventDefault();
    }
    if (!card.parent().hasClass('focus') || link.size()) {
      return swapCards(card.closest('figcaption'));
    }
  });

  swapCards = function(container) {
    var backOpacity, cards, deg, offset, scale;
    offset = 125;
    deg = 50;
    scale = .9;
    cards = $(container).find('.card');
    backOpacity = cards.not('.focus .card').css('opacity');
    return cards.each(function(i) {
      var card, first, losingFocus;
      card = $(this);
      first = i !== 0;
      losingFocus = card.parent().hasClass('focus');
      return card.animate({
        rotateY: "" + (first ? '' : '-') + deg + "deg",
        translate3d: "" + (first ? '-' : '') + offset + "px,0,0",
        scale: scale,
        opacity: .5
      }, 300, 'cubic-bezier(.45, 0, .59, 1)', function() {
        card.parent().toggleClass('focus');
        return setTimeout(function() {
          return card.animate({
            rotateY: '0',
            translate3d: '0,0,0',
            scale: 1,
            opacity: losingFocus ? backOpacity : 1
          }, 300, 'cubic-bezier(.45, 0, .59, 1)');
        }, 20);
      });
    });
  };

  /*
  Show / hide cards
  */


  $(document).on('click', '.show a, .hide a', function(e) {
    var action, link;
    e.preventDefault();
    link = $(e.target);
    action = link.closest('p').attr('class');
    if (action === 'show') {
      return filmStrip.showCards();
    } else {
      return filmStrip.hideCards();
    }
  });

  /*
  Video Use Cases
  */


  $(document).on('click', '.focus .card li', function(e) {
    var li, videos;
    li = $(e.target).closest('li');
    li.closest('ol').children('li').removeClass('active inactive');
    li.addClass('active');
    li.siblings().addClass('inactive');
    videos = $(e.target).closest('figure').children('video');
    return videos.each(function(i) {
      var v, video;
      video = $(this);
      if (i !== li.index()) {
        return video.css('display', 'none');
      } else {
        v = video.css('display', 'block').get(0);
        v.play();
        return video.on('ended', function(e) {
          return li.closest('ol').children('li').removeClass('active inactive');
        });
      }
    });
  });

}).call(this);

/*
Delete hover rules for touch devices
*/


(function() {
  var idx, idxs, ignore, rule, stylesheet, _i, _j, _len, _len2, _len3, _ref, _ref2;

  if ('createTouch' in document) {
    ignore = /:hover\b/;
    try {
      _ref = document.styleSheets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        stylesheet = _ref[_i];
        idxs = [];
        _ref2 = stylesheet.cssRules;
        for (idx = 0, _len2 = _ref2.length; idx < _len2; idx++) {
          rule = _ref2[idx];
          if (rule.type === CSSRule.STYLE_RULE && ignore.test(rule.selectorText)) {
            idxs.unshift(idx);
          }
        }
        for (_j = 0, _len3 = idxs.length; _j < _len3; _j++) {
          idx = idxs[_j];
          stylesheet.deleteRule(idx);
        }
      }
    } catch (_error) {}
  }

}).call(this);
