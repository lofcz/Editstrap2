/* ===========================================================
 * Lofotrap (Editstrap2) - v.3.3.1
 * ===========================================================
 * 2018 LofCZ / In honor of Ben Ayed, the original author
 * ========================================================== */
 ! function($) {
	var Editstrap = function(element, options) {

		this.$element = $(element);
		this.options = $.extend({}, $.fn.editstrap.defaults, this.$element.data(), typeof options == 'object' && options);
		this.init();
	};

	Editstrap.prototype = {

		constructor : Editstrap,

		init : function(e) {
			this.checkEmpty(this.$element);
			this.$element.wrap($('<span class="edit-parent-span"></span>'));
			this.$element.parent().attr("title", this.options.title);
			this.$element.addClass("editable-field");
			this.$element.parent().wrap($('<span></span>'));
			this.$element.parent().parent().append('<div><small class="result-message"></small></div>');

			//init Pk
			if (this.options.pk === undefined) {
				this.options.pk = this.$element.attr('data-edit-pk');
			}
			//init name
			if (this.options.name == undefined) {
				if (this.$element.attr('name') != undefined) {
					this.options.name = this.$element.attr('name');
				} else {
					this.options.name = this.$element.attr('id');
				}
			}
			if (this.options.displayEditIcon) {
				var editButton = $('<span class="edit-icon-container"></span>');
				var editIcon = $('<i></i>');
				editIcon.addClass(this.options.editClasses);
				editButton.append(editIcon);
				this.$element.parent().append(editButton);

			}
			var textValue;
			//if we have a value in options
			if (this.options.value != undefined) {
				textValue = this.options.value;
			}
			//if we have an edit-value attribute
			else if (this.$element.attr('data-edit-value') != undefined) {
				textValue = this.$element.attr('data-edit-value');
			} else {
				textValue = this.$element.text() != this.options.emptyText ? this.$element.text() : '';
			}
			this.options.value = textValue;
			var _this = this;

			this.$element.parent().hover(function() {
				$(this).removeClass('edit-parent-span');
				$(this).addClass('edit-parent-span-hover');
				if (_this.options.hoverClass != undefined && _this.options.hoverClass != '') {
					$(this).addClass(_this.options.hoverClass);
				}

				$(this).parent().find(".edit-icon-container").css("opacity", 100);
			}).mouseleave(function() {
				$(this).addClass('edit-parent-span');
				$(this).removeClass('edit-parent-span-hover');

				if (_this.options.hoverClass != undefined && _this.options.hoverClass != '') {
					$(this).removeClass(_this.options.hoverClass);
				}

				$(this).find(".edit-icon-container").css("opacity", 0);
			});

			this.$element.parent().click(function(e) {

				$(this).attr('data-editable-active', true);
				if(_this.options.type!='image'){
					$(this).hide();
				}
				//
				var span = $(this);

				// FIXME : find the span directly from html
				$(this).parent().prepend(_this.getHtml(_this.options.value, span));
				// $(this).parent().find("input").focus();
			});

			$('body').on('click', function(e) {
				var $target = $(e.target),
				    i,

				    exclude_classes = $.merge(_this.options.excludeClasses, ['.edit-parent-span', '.edit-pointer', '.edit-form', '.select2-body-container', '.datepicker-dropdown']);
				
				// check if element is detached. It occurs when
				// clicking in bootstrap datepicker
				if($target.attr('onclick')=='edit()'){
					return;
				}
				if (!$.contains(document.documentElement, e.target)) {
					return;
				}

				if ($target.is(document)) {
					return;
				}

				// if click inside one of exclude classes --> no
				// nothing
				for ( i = 0; i < exclude_classes.length; i++) {
					if ($target.is(exclude_classes[i]) || $target.parents(exclude_classes[i]).length) {
						return;
					}
				}

				// close all open containers (except one -
				// target)
				$('.edit-parent-span').each(function(i, el) {
					_this.closeEditable($(el), undefined);
				});
				//Close select2 container
				$('.select2-body-container').html("");
				//Hide message container
				$(".result-message").hide();
				// Popup.prototype.closeOthers(e.target);
			});
		},
		closeEditable : function closeEditable(element, text) {
			//alert("else");
			var _this=this;
			if (element.attr('data-editable-active') == 'true') {
				// on active le span suite a une annulation
				if(this.options.type != 'image'){
					element.find(".editable-field").html(text);
					element.show();
					this.checkEmpty(element);
					
				}
				else{
					 if (text.files && text.files[0]) {
					        var reader = new FileReader();
					        reader.addEventListener("load", function () {
					        	  _this.$element.attr('src', reader.result);
					        	  //alert("");
					          }, false);
					       

					        reader.readAsDataURL(text.files[0]);
					    }
				}
				
				// on supprime le dernier noeud
				element.attr('data-editable-active', false);
				element.parent().find(".edit-form").remove();
				// element.append('<span class="edit-icon-container"><i
				// class="fa fa-pencil"></i></span>');
			}
			// delete all select2 containers
			// $(".select2-container").remove();
		},
		openNextEditable : function openNextEditable(){
			var _this = this;
			var allEditable = $('.editable-field');
			allEditable.each(function(i,editable){
				if(allEditable.eq(i).parent().attr('data-editable-active') == 'true'){
					if(i !== allEditable.length - 1) {
						allEditable.eq(i+1).editstrap('edit');
						
						return false;
					}
					
				}
			});
		},
		submitEditable : function submitEditable(element, textToDisplay, valueToSubmit) {
			// on affecte la nouvelle valeur et on active le span
			var validationResult = this.options.validateValue(valueToSubmit);
			if (validationResult.success) {
				if (this.options.url == undefined) {
					this.options.value = valueToSubmit;
					if(this.options.type != 'image'){
						textToDisplay = this.options.prependText + textToDisplay + this.options.appendText;
					}
					

					if(this.options.openNext){
						var nextEditable = this.openNextEditable();
					}
					this.closeEditable(element, textToDisplay);

					this.options.displaySuccess(this.$element, valueToSubmit, textToDisplay);

					if (this.options.afterChangeValue != undefined) {

						this.options.afterChangeValue(this.$element, valueToSubmit);
					}
					
					
				} else {
					var dataToSend = this.options.data;
					var _this = this;
					if (this.options.type == 'complex') {
						$.extend(dataToSend, valueToSubmit);
					} else if(this.options.type == 'image'){
						var formData = new FormData();
						formData.append('file', $('input[type=file]')[0].files[0]);
						$.extend(dataToSend, formData);
					}else {
						dataToSend.value = valueToSubmit;
					}

					//if pk is defined, we add it to dataToSend
					if (this.options.pk != undefined) {
						dataToSend.pk = this.options.pk;
					}
					if (this.options.name != undefined) {
						dataToSend.name = this.options.name;
					}

					this.$element.parent().parent().find(".result-message").html(this.options.ajaxLoaderIcon + this.options.ajaxLoaderText);
					this.$element.parent().parent().find(".result-message").show();

					if (this.options.beforeSendUpdate != undefined) {
						this.options.beforeSendUpdate(this.$element, dataToSend);
					}

					$.ajax({
						method : "POST",
						url : _this.options.url,
						data : dataToSend,
						dataType : _this.options.dataType,
						
					     // processData: false,
					     // contentType: false,
						success : function(response) {

							_this.$element.parent().parent().find(".result-message").html('');
							_this.options.value = valueToSubmit;
							if(_this.options.type != 'image'){
								textToDisplay = _this.options.prependText + textToDisplay + _this.options.appendText;
							}
							

							if(_this.options.openNext){
								var nextEditable = _this.openNextEditable();
							}
							
							
							_this.closeEditable(element, textToDisplay);

							_this.options.displaySuccess(_this.$element, valueToSubmit, textToDisplay);

							if (_this.options.afterChangeValue != undefined) {

								_this.options.afterChangeValue(_this.$element, valueToSubmit);
							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							_this.$element.parent().parent().find(".result-message").html('');
							_this.options.onUpdateError(_this.$element, jqXHR, textStatus, errorThrown);
						}
					});

				}

			} else {
				this.options.displayError(this.$element, validationResult.message);
			}

		},

		checkEmpty : function checkEmpty(element) {
			// If text is empty
			if (element.text() == '') {
				element.text(this.options.emptyText);
			}

		},
		/**
		 * Validate the date when the type is date
		 * @param value
		 * @param format
		 * @param allowEmpty {boolean} : return true or false if empty
		 * @returns
		 */
		validateDate : function validateDate(value, format, allowEmpty) {
			if (value === '') {
				return allowEmpty;
			}

			var formats = format,
			    dateFormat = formats,
			    sections = value,
			    date =
			    sections;

			if (formats.length > sections.length) {
				return false;
			}

			var separator = (date.indexOf('/') !== -1) ? '/' : ((date.indexOf('-') !== -1) ? '-' : ' ');

			if (separator === null || date.indexOf(separator) === -1) {
				return false;
			}

			// Determine the date
			date = date.split(separator);
			dateFormat = dateFormat.split(separator);

			var yearFormat = $.inArray('yyyy', dateFormat) != -1 ? 'yyyy' : 'yy',
			    monthFormat = $.inArray('mm', dateFormat) > -1 ? 'mm' : 'MM',
			    dayFormat = $.inArray('dd', dateFormat) > -1 ? 'dd' : 'd';

			var year = date[$.inArray(yearFormat, dateFormat)],
			    month = date[$.inArray(monthFormat, dateFormat)],
			    day = date[$.inArray(dayFormat, dateFormat)];

			month = month.length > 2 ? $.inArray(month, $.fn.datepicker.dates[this.options.language].months) + 1 : month;
			if (!year || !month || !day || year.length !== 4) {
				return false;
			}
			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				return false;
			}
			if (day.length > 2 || month.length > 2 || year.length > 4) {
				return false;
			}

			day = parseInt(day, 10);
			month = parseInt(month, 10);
			year = parseInt(year, 10);

			if (year < 1000 || year > 9999 || month <= 0 || month > 12) {
				return false;
			}
			var numDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			// Update the number of days in Feb of leap year
			if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
				numDays[1] = 29;
			}

			// Check the day
			if (day <= 0 || day > numDays[month - 1]) {
				return false;
			}
			return true;
		},
		getValueAndText : function getValueAndText(type, element, prepend, append) {

			var value = element.val();
			if (prepend == undefined) {
				prepend = '';
				if(this.options.type=='complex'){
					prepend = ' ';
				}
				
			}
			var text = prepend;
			switch (type) {
			case 'text': {
				text += element.val();
				break;
			}
			case 'select': {
				text += element.find("option:selected").text();
				break;
			}
			case 'date': {
				text += element.val();
				break;
			}

			}
			if (append == undefined) {
				append = '';
			}
			text = text + append;
			return {
				value : value,
				text : text
			};
		},
		getValue : function getValue() {
			return this.options.value;
		},
		getType : function getType() {
			return this.options.type;
		},
		edit : function edit() {
			this.$element.parent().trigger('click');
		},
		destroy : function destroy() {
			if (!this.$element.hasClass("editable-field")) {
				return;
			}
			this.$element.parent().find(".edit-icon-container").remove();
			this.$element.parent().parent().find(".result-message").parent().remove();
			this.$element.parent().parent().find(".edit-form").remove();
			this.$element.parent().off();
			this.$element.removeClass("editable-field");
			this.$element.unwrap().unwrap();
			$(".select2-body-container").html('');
		},
		getHtml : function getHtml(value, span) {
			var buttonValidate = '<span class="validate input-group-addon  edit-validate-' + this.options.validateClass + '"><i class="glyphicon glyphicon-ok"></span>'; 
			if(this.options.saveOptions == 'block'){
				buttonValidate = '<div class="save-options"><button class="validate edit-validate-' + this.options.validateClass + '"><i class="glyphicon glyphicon-ok"></i></button><button class="edit-cancel-default"><i class="glyphicon glyphicon-remove"></button></div>';
			}
			
			var html = $('<div class="input-group input-group-sm select2-bootstrap-append select2-bootstrap-prepend edit-form" ></div>');
			if (this.options.prependText != '' && this.options.prependText != undefined) {
				var toAppend = $('<span class="input-group-addon">' + this.options.prependText + '</span>');
				if (this.options.prependClass != undefined) {
					toAppend.addClass(this.options.prependClass);
				}

				html.prepend(toAppend);

			}
			var _this = this;
			switch (this.options.type) {
			case 'text': {
				var input = $('<input class="form-control"  />');
				input.val(value);
				input.attr('placeholder', _this.options.placeholder);
				html.append(input);
				html.append(buttonValidate);
				//html.append();
				html.find(".validate").click(function() {
					var newValue = $(this).parent().find("input").val();
					if(_this.options.saveOptions == 'block'){
						newValue = $(this).parent().parent().find("input").val();
					}
					_this.submitEditable(span, newValue, newValue);
				});
				if (_this.options.validateOnEnter) {
					html.find("input").keypress(function(e) {
						var key = e.which;
						if (key == 13)// the enter key code
						{
							var newValue = $(this).val();
							_this.submitEditable(span, newValue, newValue);
						}
					});
				}

				break;
			}
			case 'textArea': {
				var textArea = $('<textarea class="form-control"></textarea>');
				textArea.css('height', 'auto');
				textArea.val(value);
				textArea.attr('placeholder', _this.options.placeholder);
				textArea.attr('rows', _this.options.textAreaRows);
				html.append(textArea);
				html.append(buttonValidate);
				

				html.find(".validate").click(function() {
					var newValue = $(this).parent().find("textarea").val();
					if(_this.options.saveOptions == 'block'){
						newValue = $(this).parent().parent().find("textarea").val();
					}
					_this.submitEditable(span, newValue, newValue);
				});
				break;
			}
			case 'select': {
				var select = $('<select class="form-control"></select>');
				if (value == _this.options.emptyText) {
					select.append('<option value="null">' + value + '</option>');
				}
				$.each(_this.options.dataSelect, function(i, el) {
					select.append('<option value="' + el.value + '">' + el.text + '</option>');
				});
				html.append(select);
				// html.append('<i class="form-control-feedback fa fa-check"
				// style="display: block;"></i>');
				html.find("select").val(_this.options.value);
				html.find("select").change(function() {
					_this.submitEditable(span, $(this).find("option:selected").text(), $(this).find("option:selected").val());
				});

				break;
			}
			case 'select2': {
				var select = $('<select class="form-control"></select>');
				if (value == _this.options.emptyText) {
					select.append('<option value="null">' + value + '</option>');
				}
				var optionsToAppend = [];
				if ($.isFunction(_this.options.dataSelect)) {
					optionsToAppend = _this.options.dataSelect();
				} else {
					optionsToAppend = _this.options.dataSelect;
				}
				$.each(optionsToAppend, function(i, el) {
					select.append('<option value="' + el.value + '">' + el.text + '</option>');
				});

				html.append(select);
				html.find("select").val(_this.options.value);
				html.find("select").change(function() {
					_this.submitEditable(span, $(this).find("option:selected").text(), $(this).find("option:selected").val());
				});
				html.find("select").select2({
					width : '100%'
				});
				// Problem with this class input for select2 single
				html.removeClass("input-group-sm");
				break;
			}
			case 'multiple': {
				var div = $('<div class="input-group input-group-sm select2-bootstrap-append"></div>');
				var select = $('<select class="form-control" multiple="multiple"></select>');

				var optionsToAppend = [];
				if ($.isFunction(_this.options.dataSelect)) {
					optionsToAppend = _this.options.dataSelect();
				} else {
					optionsToAppend = _this.options.dataSelect;
				}
				$.each(optionsToAppend, function(i, el) {
					select.append('<option value="' + el.value + '">' + el.text + '</option>');
				});
				select.val(_this.options.value);
				div.append(select);
				div.append(buttonValidate);
				html.append(div);

				var data = html.find("select").select2({
					closeOnSelect : false,
					width : '100%',
					dropdownParent : $("body").find(".select2-body-container")
				});

				// validate button
				html.find(".validate").click(function() {
					var textSelected = [];
					$(this).parent().find("select option:selected").each(function(i, el) {

						textSelected.push($(el).text());

					});
					_this.submitEditable(span, textSelected.join(_this.options.multipleSeparator), $(this).parent().find("select").val());
				});
				break;
			}
			case 'date': {
				var input = $('<input  class="form-control input-group-sm" />');
				input.val(value);
				input.attr('placeholder', _this.options.placeholder);
				input.datepicker({
					format : _this.options.dateFormat,
					language : _this.options.language
				}).on('changeDate', function(e) {
					if (_this.validateDate($(this).val(), _this.options.dateFormat, false)) {
						input.datepicker('hide');

						_this.submitEditable(span, $(this).val(), $(this).val());
					}

				});
				html.append(input);

				break;
			}
			case 'typeahead': {
				var input = $('<input class="form-control"  />');
				input.val(value);
				input.attr('placeholder', _this.options.placeholder);

				html.append(input);
				html.find('input').typeahead(_this.options.typeahead.options, _this.options.typeahead.dataset).bind('typeahead:select', function(ev, suggestion) {
					_this.submitEditable(span, $(this).val(), $(this).val());
				});
				//
				html.find('.tt-hint').remove();
				break;
			}
			case 'spinner': {

				var input = $('<input class="form-control" />');
				input.val(value);

				input.attr('min', _this.options.minValue);
				input.attr('max', _this.options.maxValue);
				var divButtons = $('<div class="input-group-btn-vertical"></div>');
				divButtons.append('<button class="btn btn-default btn-up" type="button"><i class="fa fa-caret-up"></i></button>');
				divButtons.append('<button class="btn btn-default btn-down" type="button"><i class="fa fa-caret-down"></i></button>');

				html.append(input);
				html.append(divButtons);
				html.append(buttonValidate);
				html.find('.btn-up').on('click', function() {
					var btn = $(this);
					var input = btn.closest('.edit-form').find('input');
					if (input.attr('max') == undefined || parseInt(input.val()) < parseInt(input.attr('max'))) {
						input.val(parseInt(input.val(), 10) + 1);
					} else {
						btn.next("disabled", true);
					}
				});
				html.find('.btn-down').on('click', function() {
					var btn = $(this);
					var input = btn.closest('.edit-form').find('input');
					if (input.attr('min') == undefined || parseInt(input.val()) > parseInt(input.attr('min'))) {
						input.val(parseInt(input.val(), 10) - 1);
					} else {
						btn.prev("disabled", true);
					}
				});
				html.find(".validate").click(function() {
					var newValue = $(this).parent().find("input").val();
					_this.submitEditable(span, newValue, newValue);
				});

				break;
			}
			case 'tags': {

				var input = $('<input  class="form-control input-group-sm" data-role="tagsinput" />');
				input.val(value);
				input.attr('placeholder', _this.options.placeholder);

				html.append(input);
				html.append(buttonValidate);
				var tagsInput = html.find("input");
				tagsInput.tagsinput({
					tagClass : function(item) {
						return 'label label-info';
					}
				});
				html.removeClass("input-group-sm");
				html.find(".bootstrap-tagsinput").addClass("form-control");
				html.find(".validate").click(function() {
					var allTags = tagsInput.tagsinput('items');
					_this.submitEditable(span, allTags.join(_this.options.multipleSeparator), allTags);
				});
				break;
			}
			/*case 'image': {
				var form = $('<form></form>')
				var input = $('<input type="file"  class="form-control input-group-sm" data-role="tagsinput" />');
				input.trigger('click'); 
				input.change(function() {
					_this.submitEditable(span, this, '');
					
				});
				form.append(input);
				html.append(form);
				html.css("display","none");
				break;
			}*/
			case 'complex': {
				$.each(this.options.complexEdit, function(i, editType) {
					var span = $('<span class="multiple-edit-span"></span>');
					if (editType.width != undefined) {
						span.css('width', editType.width);
					}

					switch (editType.type) {
					case 'select': {
						var select = $('<select class="form-control "></select>');

						$.each(editType.dataSelect, function(i, el) {
							select.append('<option value="' + el.value + '">' + el.text + '</option>');
						});
						select.val(editType.value);

						span.append(select);
						html.append(span);

						break;
					}
					case 'text': {
						var input = $('<input class="form-control" />');
						
						input.val(editType.value);
						if (editType.placeholder != undefined) {
							input.attr('placeholder', editType.placeholder);
						}
						span.append(input);
						html.append(span);

						break;
					}
					case 'date': {
						var input = $('<input class="form-control input-group-sm" />');
						input.val(editType.value);
						if (editType.plaholder != undefined) {
							input.attr('placeholder', editType.plaholder);
						}
						var dateFormat = editType.dateFormat || _this.options.dateFormat;
						input.datepicker({
							format : editType.dateFormat,
							language : _this.options.language
						}).on('changeDate', function(e) {
							input.datepicker('hide');

						});
						span.append(input);
						html.append(span);

						break;
					}
					default: {
						break;
					}
					}
				});
				html.append(buttonValidate);
				html.find(".validate").click(function() {
					var textToDisplay = '';
					var dataToSend = {};
					$(this).parent().parent().find('input,select').each(function(i, element) {
						var valueAndText = _this.getValueAndText(_this.options.complexEdit[i].type, $(element), _this.options.complexEdit[i].prepend, _this.options.complexEdit[i].append);
						if (_this.options.complexEdit[i].name != undefined) {
							dataToSend[_this.options.complexEdit[i].name] = valueAndText.value;
						}
						textToDisplay = textToDisplay + valueAndText.text;
						_this.options.complexEdit[i].value = valueAndText.value;
					});
					_this.submitEditable(_this.$element.parent(), textToDisplay, dataToSend);
				});

				break;
			}
			default: {
				break;
			}

			}
			html.find(".edit-cancel-default").click(function() {
				
					_this.closeEditable(_this.$element.parent(), undefined);
								//Close select2 container
				$('.select2-body-container').html("");
				//Hide message container
				$(".result-message").hide();
			});
			if (this.options.appendText != '' && this.options.appendText != undefined) {
				var toAppend = $('<span class="input-group-addon">' + this.options.appendText + '</span>');
				if (this.options.appendClass != undefined) {
					toAppend.addClass(this.options.appendClass);
				}
				if (html.find('.validate').length) {
					toAppend.insertBefore(html.find(".validate"));
				} else {
					html.append(toAppend);
				}
			}
			return html;
		}
	};

	$.fn.editstrap = function(arg1, arg2) {
		var results = [];
		this.each(function() {
			var editstrap = $(this).data('editstrap');
			// Initialize a new tags input
			if (!editstrap) {
				editstrap = new Editstrap(this, arg1);
				$(this).data('editstrap', editstrap);
				results.push(editstrap);

			} else if (!arg1 && !arg2) {
				// tagsinput already exists
				// no function, trying to init
				results.push(editstrap);
			} else if (editstrap[arg1] !== undefined) {
				// Invoke function on existing tags input
				var retVal = editstrap[arg1](arg2);
				if (retVal !== undefined)
					results.push(retVal);
			}
		});
		if(arg1 == 'destroy'){
			this.removeData('editstrap');
		}
		if ( typeof arg1 == 'string') {
			// Return the results from the invoked function calls
			return results.length > 1 ? results : results[0];
		} else {
			return results;
		}
		//return new Editstrap(this, option)
	};

	$.fn.editstrap.defaults = {
		title : 'Click to edit',
		emptyText : 'None',
		type : 'text',
		language : 'en',
		dateFormat : 'mm/dd/yyyy',
		validateClass : 'default',
		
		appendText : '',
		prependText : '',
		multipleSeparator : ' ',
		value : undefined,
		dataSelect : [],
		data : {},
		displayEditIcon : true,
		editClasses : 'glyphicon glyphicon-pencil',
		delayToHide : 3000,
		successMessage : 'Value changed successfully',
		errorMessage : 'Error has occured',
		successClass : 'edit-has-success',
		errorClass : 'edit-has-error',

		displaySuccess : function(editable, value, text) {
			
			var element = editable.parent().parent().find(".result-message");
			element.removeClass('edit-has-success edit-has-error');
			element.html(this.successMessage);
			element.addClass(this.successClass);
			element.show().delay(this.delayToHide).fadeOut();

		},
		displayError : function(editable, errorMessage) {
			var element = editable.parent().parent().find(".result-message");
			element.removeClass(this.errorClass + ' ' + this.successClass);
			element.html(errorMessage);
			element.addClass(this.errorClass);
			element.show();

		},
		validateValue : function(value) {
			return {
				success : true,
				message : ''
			};
		},
		validateOnEnter : true,
		textAreaRows : 10,
		excludeClasses : [],

		//since 3.0.0
		placeholder : '',
		//hoverClass
		//afterChangeValue: function(editable, newValue){}
		//appendClass
		//prependClass
		onUpdateError : function(editable, jqXHR, textStatus, errorThrown) {
			this.displayError(editable, 'Error on submit : ' + jqXHR.status + ' ' + errorThrown);
		},
		ajaxLoaderIcon : '<i class="glyphicon glyphicon-refresh gly-spin"></i>',
		ajaxLoaderText : ' '

		//beforeSendUpdate(editable, dataToSend)
		/*attr for spinner*/
		//minvalue
		//maxvalue
		,
		openNext:false,
		saveOptions:'inline',
		dataType:'JSON'
	};
	$(function() {
		$("body").append('<div class="select2-body-container"></div>');
	});
}(window.jQuery);
