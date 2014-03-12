JQuery ScrollFix
=========

A simple jQuery function that prevents the document from scrolling when the element can no longer scroll such as a modal window.

# Features
- Prevent's document scrolling when another element is being scrolled.
- iOS Browsers (Safari, Chrome, etc) start scrolling the container when a element can no longer scroll up or down. This plugin addresses that by counter acting the scrolltop of the document so nothing happens. 

# How to use
Setup a element that will be scrollable over the document such as a modal window:

	<div id="modal" style="overflow: auto;">  
		<p>Hello World</p>  
		...
	</div>

Then call the following code on the element:

	$("#modal").ScrollFix();  
	
# Options

Optionally you can pass along the following options:

	$("#modal").ScrollFix({  
		conditionCallback: function(event, $element) {  
			return $element.is(":visible");  
		}, // the condition to determine if scrolling is enabled/disabled, returning true enables & returning false disables  
		beforeEnabledCallback: function($element) { }, // called before document scrolling has been disabled  
		afterEnabledCallback: function($element) { }, // called after document scrolling has been disabled  
		beforeDisabledCallback: function($element) { }, // called before document scrolling has been re-enabled  
		afterDisabledCallback: function($element) { } // called after document scrolling has been re-enabled  
	});
	
# Dependencies
[JQuery](http://jquery.com)  
[attrchange](http://meetselva.github.io/attrchange) (Included)  

# License
[MIT License](http://www.opensource.org/licenses/mit-license.php)  

Copyright &copy; 2014 Brock Riemenschneider
