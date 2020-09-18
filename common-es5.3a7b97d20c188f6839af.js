function _defineProperties(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{PWap:function(e,t,n){var i,r,o;o=function(){var e={".":"point","-":"negative",0:"zero",1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine",10:"ten",11:"eleven",12:"twelve",13:"thirteen",14:"fourteen",15:"fifteen",16:"sixteen",17:"seventeen",18:"eighteen",19:"nineteen",20:"twenty",30:"thirty",40:"forty",50:"fifty",60:"sixty",70:"seventy",80:"eighty",90:"ninety"},t={2:"hundred",3:"thousand",6:"million",9:"billion",12:"trillion",15:"quadrillion",18:"quintillion",21:"sextillion",24:"septillion",27:"octillion",30:"nonillion",33:"decillion",36:"undecillion",39:"duodecillion",42:"tredecillion",45:"quattuordecillion",48:"quindecillion",51:"sexdecillion",54:"septendecillion",57:"octodecillion",60:"novemdecillion",63:"vigintillion",100:"googol",303:"centillion"},n={nil:0,naught:0,period:".",decimal:"."};function i(e){var t=String(e).match(/e\+(\d+)/);return t?t[1]:String(e).length-1}function r(e,t){return e.reduceRight((function(t,n,i){return n>e[i+1]?t*n:t+n}),0)*t}function o(e){if("string"==typeof e)return o.parse(e);if("number"==typeof e)return o.stringify(e);throw new Error("Numbered can only parse strings or stringify numbers")}return Object.keys(e).forEach((function(t){n[e[t]]=isNaN(+t)?t:+t})),Object.keys(t).forEach((function(e){n[t[e]]=isNaN(+e)?e:Math.pow(10,+e)})),o.stringify=function(n){var r=Number(n),a=Math.floor(r);if(e[r])return e[r];if(r<0)return e["-"]+" "+o.stringify(-r);if(a!==r){for(var l=[o.stringify(a),e["."]],s=String(r).split(".").pop(),c=0;c<s.length;c++)l.push(o.stringify(+s[c]));return l.join(" ")}var u=i(r);if(1===u)return e[10*Math.floor(r/10)]+"-"+o.stringify(Math.floor(r%10));for(var f=[];!t[u];)u-=1;if(t[u]){var h=Math.floor(r%Math.pow(10,u));f.push(o.stringify(Math.floor(r/Math.pow(10,u)))),f.push(t[u]+(h>99?",":"")),h&&(h<100&&f.push("and"),f.push(o.stringify(h)))}return f.join(" ")},o.parse=function(e){var t=1,o=0,a=0,l=0,s=[],c=e.split(/\W+/g).map((function(e){var t=e.toLowerCase();return void 0!==n[t]?n[t]:t})).filter((function(e){return"-"===e&&(t=-1),"."===e||"number"==typeof e})).reduceRight((function(e,t){var n=i(t);if("number"==typeof t&&n<a)return s.push(t),1===s.length?e-o:e;if(e+=r(s,o),s=[],"."===t){var c=l+String(e).length;return l=0,o=0,a=0,e*Math.pow(10,-c)}if(0===t)return l+=1,e;if(e>=1&&n===a){for(var u="";l>0;)l-=1,u+="0";return Number(String(t)+u+String(e))}return a=i(o=t),(e+t)*Math.pow(10,l)}),0);return t*(c+r(s,o))},o},e.exports?e.exports=o():void 0===(r="function"==typeof(i=o)?i.call(t,n,t,e):i)||(e.exports=r)},gFbo:function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));var i=n("fXoL"),r=function(){var e=function e(){_classCallCheck(this,e)};return e.\u0275mod=i.Mb({type:e}),e.\u0275inj=i.Lb({factory:function(t){return new(t||e)}}),e}()},qsmv:function(e,t,n){"use strict";n.d(t,"a",(function(){return f}));var i=n("mrSG"),r=n("P3hB"),o=n("XNiG"),a=n("PWap"),l=n("1G5W"),s=n("Kj3r"),c=n("pLZG"),u=n("fXoL"),f=function(){var e=function(){function e(){_classCallCheck(this,e),this.repetitionDelay=500,this.liveText=null,this.shouldBreakSilence=!1,this.silence$=new o.a,this.cancel$=new o.a,this.destroy$=new o.a}return _createClass(e,[{key:"ngOnDestroy",value:function(){this.cancel$.next(),this.cancel$.complete(),this.destroy$.next(),this.destroy$.complete()}},{key:"readOut",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return Object(i.a)(this,void 0,void 0,regeneratorRuntime.mark((function n(){var i;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(this.shouldBreakSilence=!1,this.cancel(),n.t0=this.liveText===e,!n.t0){n.next=8;break}return this.liveText=null,n.next=7,Object(r.g)(this.repetitionDelay,this.cancel$);case 7:n.t0=!n.sent;case 8:if(!n.t0){n.next=10;break}return n.abrupt("return",!1);case 10:return this.liveText=e,n.next=13,Object(r.g)(this.estimateDuration(e),this.cancel$);case 13:return i=n.sent,n.abrupt("return",(i&&(this.shouldBreakSilence=t,this.silence$.next()),i));case 15:case"end":return n.stop()}}),n,this)})))}},{key:"cancel",value:function(){this.cancel$.next()}},{key:"breakSilence",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:5e3;return this.silence$.pipe(Object(l.a)(this.destroy$)).pipe(Object(s.a)(n)).pipe(Object(c.a)((function(){return t.shouldBreakSilence}))).subscribe((function(){t.liveText=e}))}},{key:"estimateDuration",value:function(e){var t=e.replace(/\d+(\.\d+)?/g,(function(e){return a.stringify(+e)})),n=function(e){var n;return(null!==(n=t.match(e))&&void 0!==n?n:[]).length};return 300*n(/[.?!]+/g)+100*n(/\s+/g)+30*t.replace(/\W/g,"").length}}]),e}();return e.\u0275fac=function(t){return new(t||e)},e.\u0275cmp=u.Ib({type:e,selectors:[["app-screen-reader"]],inputs:{repetitionDelay:"repetitionDelay"},decls:1,vars:1,consts:[["aria-live","assertive",1,"live-text",3,"innerText"]],template:function(e,t){1&e&&u.Pb(0,"div",0),2&e&&u.lc("innerText",t.liveText)},styles:['@charset "UTF-8";[_nghost-%COMP%]   .live-text[_ngcontent-%COMP%]{color:#2196f3;font-weight:500}[_nghost-%COMP%]   .live-text[_ngcontent-%COMP%]:before{content:"\ud83d\udd0a "}']}),e}()}}]);