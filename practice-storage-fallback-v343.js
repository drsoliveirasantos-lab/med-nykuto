/* v344 — Practice storage stabilizer.
   iOS Safari private mode can make localStorage unavailable, non-persistent or visually unstable during rapid re-render.
   The practice engine stores currentIndex in localStorage; if storage is unreliable, “Siguiente” can flash and return to the same question.
   This shim is loaded before app.bundle.js and mirrors writes in memory for the current tab, while still using native localStorage when possible.
*/
(function(){
  'use strict';
  var KEY = '__med_nykuto_storage_probe__';
  var nativeStorage = null;
  var usable = false;
  var mem = Object.create(null);

  try{
    nativeStorage = window.localStorage;
    nativeStorage.setItem(KEY, '1');
    usable = nativeStorage.getItem(KEY) === '1';
    nativeStorage.removeItem(KEY);
  }catch(e){
    usable = false;
  }

  function hasOwn(k){ return Object.prototype.hasOwnProperty.call(mem, k); }
  function nativeGet(k){
    if(!usable || !nativeStorage) return null;
    try{ return nativeStorage.getItem(k); }catch(e){ return null; }
  }
  function nativeSet(k,v){
    if(!usable || !nativeStorage) return;
    try{ nativeStorage.setItem(k, v); }catch(e){}
  }
  function nativeRemove(k){
    if(!usable || !nativeStorage) return;
    try{ nativeStorage.removeItem(k); }catch(e){}
  }
  function nativeClear(){
    if(!usable || !nativeStorage) return;
    try{ nativeStorage.clear(); }catch(e){}
  }

  var shim = {
    getItem:function(k){
      k = String(k);
      if(hasOwn(k)) return mem[k];
      return nativeGet(k);
    },
    setItem:function(k,v){
      k = String(k);
      v = String(v);
      mem[k] = v;
      nativeSet(k, v);
    },
    removeItem:function(k){
      k = String(k);
      delete mem[k];
      nativeRemove(k);
    },
    clear:function(){
      mem = Object.create(null);
      nativeClear();
    },
    key:function(i){
      var keys = Object.keys(mem);
      if(keys[i]) return keys[i];
      if(usable && nativeStorage){ try{ return nativeStorage.key(i); }catch(e){} }
      return null;
    },
    get length(){
      var nativeLen = 0;
      if(usable && nativeStorage){ try{ nativeLen = nativeStorage.length || 0; }catch(e){} }
      return Math.max(Object.keys(mem).length, nativeLen);
    }
  };

  try{
    Object.defineProperty(window, 'localStorage', {
      value: shim,
      configurable: true,
      enumerable: true
    });
    window.__MED_NYKUTO_STORAGE_FALLBACK__ = usable ? 'hybrid-memory-mirror' : 'memory-shim';
  }catch(e){
    window.__MED_NYKUTO_STORAGE_FALLBACK__ = usable ? 'native-only-override-failed' : 'failed';
  }
})();
