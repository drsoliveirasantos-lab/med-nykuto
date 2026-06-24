/* v343 — Practice storage fallback.
   iOS Safari private mode can make localStorage unavailable or non-persistent.
   The practice engine stores currentIndex in localStorage; if storage fails, “Siguiente” re-renders the same question.
   This shim is loaded before app.bundle.js and provides an in-memory fallback only when native localStorage is unusable.
*/
(function(){
  'use strict';
  var KEY = '__med_nykuto_storage_probe__';
  var nativeStorage = null;
  var usable = false;

  try{
    nativeStorage = window.localStorage;
    nativeStorage.setItem(KEY, '1');
    usable = nativeStorage.getItem(KEY) === '1';
    nativeStorage.removeItem(KEY);
  }catch(e){
    usable = false;
  }

  if(usable){
    window.__MED_NYKUTO_STORAGE_FALLBACK__ = 'native-ok';
    return;
  }

  var mem = Object.create(null);
  var shim = {
    getItem:function(k){
      k = String(k);
      return Object.prototype.hasOwnProperty.call(mem,k) ? mem[k] : null;
    },
    setItem:function(k,v){
      mem[String(k)] = String(v);
    },
    removeItem:function(k){
      delete mem[String(k)];
    },
    clear:function(){
      mem = Object.create(null);
    },
    key:function(i){
      var keys = Object.keys(mem);
      return keys[i] || null;
    },
    get length(){
      return Object.keys(mem).length;
    }
  };

  try{
    Object.defineProperty(window, 'localStorage', {
      value: shim,
      configurable: true,
      enumerable: true
    });
    window.__MED_NYKUTO_STORAGE_FALLBACK__ = 'memory-shim';
  }catch(e){
    window.__MED_NYKUTO_STORAGE_FALLBACK__ = 'failed';
  }
})();
