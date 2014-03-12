/*
 * ScrollFix v1.0
 *
 * A simple jQuery function that prevents the document from scrolling when
 * the element can no longer scroll such as a modal window
 *
 * Copyright 2014 Brock Riemenschneider
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function( $ ) {

    // global variables
    var pluginName      = "ScrollFix", // plugin name
        // default settings
        defaults        = {
            // callbacks
            conditionCallback: function(event, $element) {
                return $element.is(":visible");
            }, // the condition to determine if scrolling is enabled/disabled, returning true enables & returning false disables
            beforeEnabledCallback: function() { }, // called before document scrolling has been disabled
            afterEnabledCallback: function() { }, // called after document scrolling has been disabled
            beforeDisabledCallback: function() { }, // called before document scrolling has been re-enabled
            afterDisabledCallback: function() { } // called after document scrolling has been re-enabled
        };

    // here we go!
    $[ pluginName ] = function(element, options) {

        // current instance of the object
        var plugin = this;

        plugin.settings = {};
        plugin.scrolling = false;

        var $element = $(element), // reference to the jQuery version of DOM element
            element  = element;    // reference to the actual DOM element

        var $document       = $(document),
            $body           = $("body");

        /*
         * PUBLIC API
         */

        // the "constructor" method that gets called when the object is created
        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            // bind the ui actions
            bindUIActions();
        };

        // disables scrolling on the document
        plugin.enable = function() {
            // before enabled callback
            plugin.settings.beforeEnabledCallback();

            // disable scrolling
            $body.css({ "overflow": "hidden" });
            $document.on("touchmove", function(event) {
                event.preventDefault();
            });

            // after enabled callback
            plugin.settings.afterEnabledCallback();
        };

        // re-enables scrolling on the document
        plugin.disable = function() {
            // before disabled callback
            plugin.settings.beforeDisabledCallback();

            // re-enable scrolling
            $body.css({ "overflow": "" });
            $document.unbind("touchmove");

            // after disabled callback
            plugin.settings.afterDisabledCallback();
        };

        /*
         * PRIVATE API
         */

        // binds javascript events to functions
        var bindUIActions = function() {
            var selector = (typeof($element.attr('id')) !== 'undefined' || $element.attr('id') !== null) ? '#' + $element.attr('id') :  '.' + $element.attr('class');

            // prevents preventDefault from being called on document if it sees a scrollable element
            $body.on("touchmove", selector, function(event) {
                event.stopPropagation();
            });

            // prevents document scrolling if element can't scroll anymore
            $body.on('touchstart', selector, function(event) {

                // only execute the below code once at a time
                if (! plugin.settings.scrolling) {
                    plugin.settings.scrolling = true;

                    if (event.currentTarget.scrollTop === 0) {
                        event.currentTarget.scrollTop = 1;
                    } else if (event.currentTarget.scrollHeight === event.currentTarget.scrollTop + event.currentTarget.offsetHeight) {
                        event.currentTarget.scrollTop -= 1;
                    }

                    plugin.settings.scrolling = false;
                }
            });

            // detect when the elem
            $element.attrchange({
                callback: function (event) {
                    var $this   = $(this);

                    if ( plugin.settings.conditionCallback(event, $this) ) {
                        plugin.enable();
                    } else {
                        plugin.disable();
                    }
                }
            });
        };

        // call the "constructor" method
        plugin.init();
    }

    // add the plugin to the jQuery.fn object
    $.fn[ pluginName ] = function(options) {

        // iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {

            // if plugin has not already been attached to the element
            if (undefined == $(this).data(pluginName)) {

                // create a new instance of the plugin
                // pass the DOM element and the user-provided options as arguments
                var plugin = new $[ pluginName ](this, options);

                // store a reference to the plugin object
                $(this).data(pluginName, plugin);
            }

        });
    }

})(jQuery);

/*
A simple jQuery function that can add listeners on attribute change.
http://meetselva.github.io/attrchange/

About License:
Copyright (C) 2013 Selvakumar Arumugam
You may use attrchange plugin under the terms of the MIT Licese.
https://github.com/meetselva/attrchange/blob/master/MIT-License.txt
*/
(function($) {
   function isDOMAttrModifiedSupported() {
        var p = document.createElement('p');
        var flag = false;

        if (p.addEventListener) p.addEventListener('DOMAttrModified', function() {
            flag = true
        }, false);
        else if (p.attachEvent) p.attachEvent('onDOMAttrModified', function() {
            flag = true
        });
        else return false;

        p.setAttribute('id', 'target');

        return flag;
   }

   function checkAttributes(chkAttr, e) {
        if (chkAttr) {
            var attributes = this.data('attr-old-value');

            if (e.attributeName.indexOf('style') >= 0) {
                if (!attributes['style']) attributes['style'] = {}; //initialize
                var keys = e.attributeName.split('.');
                e.attributeName = keys[0];
                e.oldValue = attributes['style'][keys[1]]; //old value
                e.newValue = keys[1] + ':' + this.prop("style")[$.camelCase(keys[1])]; //new value
                attributes['style'][keys[1]] = e.newValue;
            } else {
                e.oldValue = attributes[e.attributeName];
                e.newValue = this.attr(e.attributeName);
                attributes[e.attributeName] = e.newValue;
            }

            this.data('attr-old-value', attributes); //update the old value object
        }
   }

   //initialize Mutation Observer
   var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

   $.fn.attrchange = function(o) {

        var cfg = {
            trackValues: false,
            callback: $.noop
        };

        //for backward compatibility
        if (typeof o === "function" ) {
            cfg.callback = o;
        } else {
            $.extend(cfg, o);
        }

        if (cfg.trackValues) { //get attributes old value
            $(this).each(function (i, el) {
                var attributes = {};
                for (var attr, i=0, attrs=el.attributes, l=attrs.length; i<l; i++){
                    attr = attrs.item(i);
                    attributes[attr.nodeName] = attr.value;
                }

                $(this).data('attr-old-value', attributes);
            });
        }

        if (MutationObserver) { //Modern Browsers supporting MutationObserver
            /*
               Mutation Observer is still new and not supported by all browsers.
               http://lists.w3.org/Archives/Public/public-webapps/2011JulSep/1622.html
            */
            var mOptions = {
                subtree: false,
                attributes: true,
                attributeOldValue: cfg.trackValues
            };

            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(e) {
                    var _this = e.target;

                    //get new value if trackValues is true
                    if (cfg.trackValues) {
                        /**
                         * @KNOWN_ISSUE: The new value is buggy for STYLE attribute as we don't have
                         * any additional information on which style is getting updated.
                         * */
                        e.newValue = $(_this).attr(e.attributeName);
                    }

                    cfg.callback.call(_this, e);
                });
            });

            return this.each(function() {
                observer.observe(this, mOptions);
            });
        } else if (isDOMAttrModifiedSupported()) { //Opera
            //Good old Mutation Events but the performance is no good
            //http://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/
            return this.on('DOMAttrModified', function(event) {
                if (event.originalEvent) event = event.originalEvent; //jQuery normalization is not required for us
                event.attributeName = event.attrName; //property names to be consistent with MutationObserver
                event.oldValue = event.prevValue; //property names to be consistent with MutationObserver
                cfg.callback.call(this, event);
            });
        } else if ('onpropertychange' in document.body) { //works only in IE
            return this.on('propertychange', function(e) {
                e.attributeName = window.event.propertyName;
                //to set the attr old value
                checkAttributes.call($(this), cfg.trackValues , e);
                cfg.callback.call(this, e);
            });
        }

        return this;
    }
})(jQuery);