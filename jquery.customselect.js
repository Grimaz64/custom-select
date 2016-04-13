/*!
 * jQuery Select Plugin v2.0 - Stylize Select, Drop down list, Combo box
 * @AUTHOR: Clément Caillard
 *
 * Bang bang bang !
 */

//TODO: gestion double lettre tapé rapidement ?? mettre un timer + un array.push (cf code konami)
//TODO: rajouter une animation avec un easing !! (easing, effect et speed en parametres)

//WARNING: plusieurs options avec la même value ??
//WARNING: options sans value ?

(function($, window) {

	/** customSelect Constructor **/
	var CustomSelect = function(element, options) {
		var self = this;

		this.options = $.extend({
			 prefix    : "bang"
			,listClass : ""
			,maxheight : 280
			,fixwidth  : false
			,rescroll  : true
		}, options || {});

		this.$select 	  = $(element);
		this.$wrapper       = null;
		this.$skinnedSelect = null;
		this.$skinnedList   = null;
		this.wrapperClass = this.options.prefix + "-select-wrapper";
		this.selectClass  = this.options.prefix + "-select-input";
		this.listClass    = this.options.prefix + "-select-list " + this.options.listClass;


		this.keytimer = null;
		this.keyPressedDictionnary = "";

		if (!this.$select.is('select')) return;
		this.init();
	}

	/** CustomSelect Prototype **/
	CustomSelect.prototype = {

        init: function() {
            var self = this;

            self.buildDOM();
            self.uiManager();
        },

        /** add all elements to DOM **/
        buildDOM: function() {

        	var self 	= this,
        		$select = self.$select,
        		$selectedOption = this.$select.find('option:selected');

        	// Wrap Select Box
			$select.wrap('<div class="' + self.wrapperClass + '" />');
			self.$wrapper = $select.parent('.' + self.wrapperClass);
			var $wrapper  = self.$wrapper;

			// Create Skinned Select Input
			self.$skinnedSelect = $('<div class="' + self.selectClass + '" data-value="' + $selectedOption.val()+ '">' + $selectedOption.text() + '</div>');
			self.$skinnedSelect.appendTo($wrapper);
	        var $skinnedSelect  = self.$skinnedSelect;

	        // Create Skinned List
	        this.$skinnedList = $('<div class="' + self.listClass + '"></div>');
	        this.$skinnedList.appendTo('body');
	        var $skinnedList  = this.$skinnedList;
	        $skinnedList.css({ maxHeight: '0px', maxWidth: '0px', top: '0px', left: '0px' }).data('opened', false);

	        // Fill Skinned List With Options
	        var $skinnedUl = $('<ul></ul>');
	        $skinnedUl.appendTo($skinnedList);

	        $select.find('optgroup, option').each(function(index) {
	        	var $opt = $(this);

	        	if ($opt.is('optgroup')) {

	        		$('<li class="' + self.options.prefix + '-optgroup">' + $opt.attr('label') + '</li>').appendTo($skinnedUl);

	        	} else if ($opt.is('option')) {

	        		var $skinnedOption = $('<li class="' + self.options.prefix + '-option" data-value="' + $opt.val() + '" data-first="' + $opt.text().toUpperCase().charCodeAt(0) + '">' + $opt.text() + '</li>');

	        		if ($opt.is(':selected')) 		  $skinnedOption.addClass('selected');
	        		if ($opt.parent().is('optgroup')) $skinnedOption.addClass(self.options.prefix + '-option-ingroup');
	        		if (index % 2 == 0) 			  $skinnedOption.addClass(self.options.prefix + '-option-impair');

	        		$skinnedOption.appendTo($skinnedUl);
	        	}
	        });
		},

		/** add Event Listener **/
		uiManager: function() {

			var self 	 = this,
				$select	 = self.$select,
				$skinnedSelect = self.$skinnedSelect,
				$skinnedList   = self.$skinnedList;

			/** Gestion du click sur le select skinné **/
			$skinnedSelect.on('click', function() {

				$(this).toggleClass('active');

				// Si elle est ouverte, on masque la liste déroulante
				if ($skinnedList.data('opened')) {

					$skinnedList.removeClass('opened').css({ maxHeight: '0px', maxWidth: '0px', top: '0px', left: '0px' }).data('opened', false);
					$select.trigger('hideList', [$skinnedList]);
					$(document).off('.bangselect');

				// Sinon, on affiche la liste déroulante
				} else {

					// On réinitialise la liste
					$skinnedList.find('.' + self.options.prefix + '-option').removeClass('active').css('white-space', 'nowrap');
					$skinnedList.find('.selected').addClass('active');

					// On positionne la liste au niveau du select
					$skinnedList.css({ maxHeight: self.options.maxheight + 'px', maxWidth: 'inherit'});

					var docHeight 		 = window.innerHeight || document.documentElement.clientHeight,
						docWidth 		 = window.innerWidth  || document.documentElement.clientWidth,
						offsetTopSelect  = $skinnedSelect.offset().top,
						offsetLeftSelect = $skinnedSelect.offset().left,
						posTopSelect 	 = offsetTopSelect - $(window).scrollTop(),
						posLeftSelect 	 = offsetLeftSelect - $(window).scrollLeft(),
						heightSelect 	 = $skinnedSelect.height(),
						posTopList 		 = offsetTopSelect + heightSelect,
						maxHeight 		 = self.options.maxheight,
						maxWidth		 = docWidth,
						heightList 		 = $skinnedList.outerHeight(),
						widthList 		 = $skinnedList.outerWidth();

					// On recalcul le max-height
					if (posTopList + heightList > docHeight) {

						// ouverture vers le haut
						if (posTopSelect > docHeight / 2) {

							maxHeight  = Math.min(posTopSelect - 10, self.options.maxheight);
							$skinnedList.css('max-height', maxHeight + 'px');
							heightList = $skinnedList.outerHeight();
							posTopList = Math.max(offsetTopSelect - heightList, 10);

						// ouverture vers le bas
						} else {
							maxHeight  = Math.min(docHeight - posTopSelect - heightSelect - 10, self.options.maxheight);
						}
					}

					// On recalcul le max-width
					if (self.options.fixwidth || offsetLeftSelect + widthList > docWidth) {
						maxWidth = $skinnedSelect.outerWidth();
						$skinnedList.find('.' + self.options.prefix + '-option').css('white-space', 'normal');
					}

					$skinnedList.css({
						 maxHeight:  maxHeight + 'px'
						,minWidth:   $skinnedSelect.outerWidth() + 'px'
						,maxWidth:   maxWidth + 'px'
						,top: 		 posTopList + 'px'
						,left: 		 posLeftSelect + 'px'
					}).addClass('opened').data('opened', true);

					$select.trigger('displayList', [$skinnedList, maxHeight]);

					// On scroll la liste jusqu'à l'élément sélectionné
					self.scrollToSelected();

					$(document).on('mousedown.bangselect DOMMouseScroll.bangselect mousewheel.bangselect', {obj: self}, self.closeSkinnedList)
							   .on('keydown.bangselect', {obj: self}, self.keyboardManager);
				}
			});

			/** Gestion des évenements sur la liste déroulante skinné **/
			$skinnedList.delegate('.' + self.options.prefix + '-option', {
				mouseenter: function() {
					var $li = $(this);
					$li.siblings('.active').removeClass('active');
					$li.addClass('active');
				},
				mousedown: function(e) { //TODO verifier utilité
					return false; //TODO e.preventDefault() ?
				},
				click: function() {
					self.selectOption($(this), true, true);
				}
			});

			/** Transfert d'event **/
			$select.on('change.bangselect', function(e, manual) {
				 if (typeof manual == "undefined" || !manual){
				 	self.setVal($(this).val());
				 }
				})
				.on('focus.bangselect', function() { $skinnedSelect.addClass('focus'); })
				.on('keyup.bangselect', function() { self.setVal($(this).val()); })
				.on('blur.bangselect focusout.bangselect', function() { $skinnedSelect.removeClass('focus'); });

			$(window).on('resize', {obj: self}, self.closeSkinnedList);
		},

		/** Scroll List To Selected Option **/
		scrollToSelected: function() {

			var self 	= this,
				$select	= self.$select,
				$skinnedList    = self.$skinnedList,
				$selectedOption = $skinnedList.find('.selected');

			$select.trigger('scrollToSelected', [$skinnedList, $selectedOption]);

			if (self.options.rescroll) {

				// S'il n'y a pas de scrollbar, on remonte en haut par sécurité
				if ($skinnedList.prop("scrollHeight") <= $skinnedList.height()) {
					$skinnedList.scrollTop(0); //pas utile ?

				// Si l'option n'est pas dans la zone visible, on scroll jusqu'à l'option
				} else {
					var posTopSelected = $selectedOption.position().top,
						newScrollPos   = null;

					// Elément au dessus de la zone visible
					if (posTopSelected < 0) {
						newScrollPos = $skinnedList.scrollTop() + posTopSelected;

					// Elément en dessous de la zone visible
					} else if (posTopSelected + $selectedOption.height() > $skinnedList.height()) {
						newScrollPos = $skinnedList.scrollTop() + posTopSelected - $skinnedList.height() + $selectedOption.height();
					}

					if (newScrollPos != null) $skinnedList.scrollTop(newScrollPos);
				}
			}
		},

		/** Keyboard Events Manager **/
		keyboardManager: function(e) {

			var self    = e.data.obj,
				keyCode = e.which,
				$skinnedSelect  = self.$skinnedSelect,
				$skinnedList    = self.$skinnedList,
				$selectedOption = $skinnedList.find('.selected');

			switch(e.which) {
				case 13 : //Enter
					e.preventDefault();
					$skinnedSelect.trigger('click');
					self.$select.trigger('change', ["true"]);
					break;
				case 27 : //Esc
					e.preventDefault();
					// On valide la selection
					$skinnedSelect.trigger('click');
					break;
				case 33 : //Page Up
					e.preventDefault();
					// On selectionne la première option de la zone visible ou alors on remonte au tout début de la liste si c'est déjà le cas
					var $liToSelect = $($skinnedList.find('.' + self.options.prefix + '-option').get(0));

					$skinnedList.find('.' + self.options.prefix + '-option').each(function(index) {
						if ($(this).position().top >= 0) {
							$liToSelect = $(this);
							return false;
						}
					});
					if (!$liToSelect.is($selectedOption)) {
						self.selectOption($liToSelect , false, false);
						break;
					}
				case 36 : //Home
					e.preventDefault();
					//On selectionne la toute première option de la liste
					var $liToSelect = $($skinnedList.find('.' + self.options.prefix + '-option').get(0));
					self.selectOption($liToSelect, false, false);
					break;

				case 34 : //Page Down
					e.preventDefault();
					// On selectionne la dernière option de la zone visible ou alors on descend à la fin de la liste si c'est déjà le cas
					var $liToSelect = $($skinnedList.find('.' + self.options.prefix + '-option').get(-1));

					$skinnedList.find('.' + self.options.prefix + '-option').each(function(index) {
						if ($(this).position().top >= $skinnedList.height()) return false;
						$liToSelect = $(this);
					});

					if (!$liToSelect.is($selectedOption)) {
						self.selectOption($liToSelect , false, false);
						break;
					}
				case 35 : //End
					e.preventDefault();
					// On selectionne la toute dernière option de la liste
					var $liToSelect = $($skinnedList.find('.' + self.options.prefix + '-option').get(-1));
					self.selectOption($liToSelect, false, false);
					break;

				case 37 : //Arrow Left
				case 38 : //Arrow Top
					e.preventDefault();
					// On selectionne l'option précédente
					if ($selectedOption.prev().length) self.selectOption($selectedOption.prev(), false, false);
					break;

				case 39 : //Arrow Right
				case 40 : //Arrow Down
					e.preventDefault();
					// On selectionne l'option suivante
					if ($selectedOption.next().length) self.selectOption($selectedOption.next(), false, false);
					break;

				default :
					// On selectionne l'element suivant celui selectionné (ou le premier element de la liste) commencant par le caractère saisi
					if (e.which >= 96 && e.which <= 105) 		keyCode = e.which - 48; //NUM PAD 0-9
					else if (e.which >= 106 && e.which <= 111) 	keyCode = e.which - 64; //NUM PAD -+/*.
					//var char = String.fromCharCode(keyCode);
					if ((keyCode >= 42 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90)) { //NUMPAD || A-Z
						e.preventDefault();
						/*
						var $liToSelect = $($selectedOption.nextAll('.' + self.options.prefix + '-option[data-first=' + keyCode + ']').get(0));
						if (!$liToSelect.length) $liToSelect = $($skinnedList.find('.' + self.options.prefix + '-option[data-first=' + keyCode + ']').get(0));
						if ($liToSelect.length)  self.selectOption($liToSelect, true, false);
						*/
						self.autoselectOption( e.which );
					}
			}
		},

		autoselectOption: function( keyCode ){

			var self = this;
			var value = String.fromCharCode(keyCode);
			var $skinnedSelect  = self.$skinnedSelect,
				$skinnedList    = self.$skinnedList,
				$selectedOption = $skinnedList.find('.selected'),
				$target = null;

			this.keyPressedDictionnary += value;
			clearTimeout( this.keytimer );
			this.keytimer = setTimeout(function(){
				var reg = new RegExp('^'+self.keyPressedDictionnary, 'gi');
				self.keyPressedDictionnary = "";
				$skinnedList.find('li').each(function( i ){
					var $this = $(this);
					if( reg.test( self.cleanAccents( $this.text() ) ) ){
						$target = $this;
						return false;
					}
				});
				if( $target != null ){
					self.selectOption( $target , false, false );
				}
			}, 300 );
		},

		cleanAccents: function (string) {
		    var accents = {
		        a:new Array('À','à','Á','á','Â','â','Ã','ã','Ä','ä','Å','å','Æ','æ','Ā','ā','Ă','ă','Ą','ą'),
		        e:new Array('È','è','É','é','Ê','ê','Ë','ë','Ē','ē','Ĕ','ĕ','Ė','ė','Ę','ę','Ě','ě'),
		        i:new Array('ì', 'ï', 'î','Ì','Ï','Î'),
		        o:new Array('ò','ö','ô','Ò','Ö','Ô'),
		        u:new Array('ù','û','ü','Ù','Û','Ü'),
		        n:new Array('ñ','Ñ'),
		        c:new Array('ç','Ç')
		    };

		    for(key in accents) {
		        for(letterindex in accents[key]) {
		            letter = new RegExp(accents[key][letterindex],"g");
		            string = string.replace(letter,key);
		        }
		    }
		    return string;
		},

		/** Close List Function **/
		closeSkinnedList: function(e) {

			var self    = e.data.obj,
				$target = $(e.target),
				$skinnedSelect = self.$skinnedSelect,
				$skinnedList   = self.$skinnedList;

			switch (e.type) {
				case "mousedown" : //click outside the list
					if ($target.parents().index(self.$wrapper) == -1 && $target.index($skinnedList) == -1) $skinnedSelect.trigger('click');
					break;
				case "DOMMouseScroll" :
				case "mousewheel" : //scroll other element than the list
					if ($skinnedList.data('opened') && $target.parents().index($skinnedList) == -1) $skinnedSelect.trigger('click');
					break;
				case "resize" : //resize window
					if ($skinnedList.data('opened')) $skinnedSelect.trigger('click');
					break;
			}
		},

		/** Change Selected Option Or Value **/
		selectOption: function($li, change, close) {

			var self    = this,
				$select = self.$select,
				$skinnedSelect = self.$skinnedSelect,
				$skinnedList   = self.$skinnedList;

			if (!$li.is('.' + self.options.prefix + '-optgroup')) {
				// On réinitialise la liste
				$li.siblings('.selected').removeClass('selected');
				$li.siblings().removeClass('active');
				$li.addClass('selected active');

				// On scroll la liste jusqu'à l'élément sélectionné
				if ($skinnedList.data('opened')) self.scrollToSelected();

				// On met à jour la valeur
				$skinnedSelect.text($li.text()).data('value', $li.data('value'));
				$select.val($li.data('value'));

				// Triggers
				if (change) $select.trigger('change', ["true"]);
				if (close && $skinnedList.data('opened')) $skinnedSelect.trigger('click');
			}
		},

		setVal: function(value) {
			var self = this,
				$optionToSelect = $(self.$skinnedList.find('.' + self.options.prefix + '-option[data-value="' + value + '"]')[0]);
			self.selectOption($optionToSelect, false, true);
		},

		refresh: function() {
			var self 	= this,
        		$select = self.$select,
        		$skinnedList = self.$skinnedList;

	        var $skinnedUl = $skinnedList.find('ul');
	        $skinnedUl.html('');

	        $select.find('optgroup, option').each(function(index) {
	        	var $opt = $(this);

	        	if ($opt.is('optgroup')) {

	        		$('<li class="' + self.options.prefix + '-optgroup">' + $opt.attr('label') + '</li>').appendTo($skinnedUl);

	        	} else if ($opt.is('option')) {

	        		var $skinnedOption = $('<li class="' + self.options.prefix + '-option" data-value="' + $opt.val() + '" data-first="' + $opt.text().toUpperCase().charCodeAt(0) + '">' + $opt.text() + '</li>');

	        		if ($opt.is(':selected')) 		  $skinnedOption.addClass('selected');
	        		if ($opt.parent().is('optgroup')) $skinnedOption.addClass(self.options.prefix + '-option-ingroup');
	        		if (index % 2 == 0) 			  $skinnedOption.addClass(self.options.prefix + '-option-impair');

	        		$skinnedOption.appendTo($skinnedUl);
	        	}
	        });

	        self.setVal($select.val());
		}

    }

	/** jQuery plugin: Custom Select instantiation **/
	$.fn.customSelect = function(options) {
		return this.each(function() {
			var $self = $(this);
            if ($self.data('customselect')) return;
            var instance = new CustomSelect(this, options);
            $self.data('customselect', instance);
        });
	};

	window.CustomSelect = CustomSelect;

})(jQuery, window, undefined);
