/* v365 — Practice storage stabilizer.
   Fixes iOS/Safari cases where localStorage exists but writes do not survive the practice re-render.
   The practice engine stores currentIndex in localStorage; if storage is unreliable, “Siguiente” changes the question content but returns the counter to 1/20.
   This shim mirrors every practice/session write in memory and patches Storage methods when replacing window.localStorage is not enough.
*/
(function(){
  'use strict';
  var KEY = '__med_nykuto_storage_probe__';
  var FLAG = '__MED_NYKUTO_STORAGE_FALLBACK__';
  var nativeStorage = null;
  var usable = false;
  var mem = Object.create(null);
  var native = {getItem:null,setItem:null,removeItem:null,clear:null,key:null,length:null};

  function hasOwn(k){ return Object.prototype.hasOwnProperty.call(mem, k); }
  function isPracticeKey(k){
    return /(medPractice|practice|qcm|quiz|case|cas|vf|vrai|faux|exam|currentBatch|currentIndex|answers|confidence|med[_-]?nykuto)/i.test(String(k || ''));
  }
  function remember(k,v){
    k = String(k);
    if(isPracticeKey(k)) mem[k] = String(v);
  }
  function forget(k){ delete mem[String(k)]; }

  try{
    nativeStorage = window.localStorage;
    if(nativeStorage){
      native.getItem = nativeStorage.getItem && nativeStorage.getItem.bind(nativeStorage);
      native.setItem = nativeStorage.setItem && nativeStorage.setItem.bind(nativeStorage);
      native.removeItem = nativeStorage.removeItem && nativeStorage.removeItem.bind(nativeStorage);
      native.clear = nativeStorage.clear && nativeStorage.clear.bind(nativeStorage);
      native.key = nativeStorage.key && nativeStorage.key.bind(nativeStorage);
    }
    if(native.setItem && native.getItem){
      native.setItem(KEY, '1');
      usable = native.getItem(KEY) === '1';
      if(native.removeItem) native.removeItem(KEY);
    }
  }catch(e){ usable = false; }

  function nativeGet(k){
    try{ return usable && native.getItem ? native.getItem(k) : null; }catch(e){ return null; }
  }
  function nativeSet(k,v){
    try{ if(usable && native.setItem) native.setItem(k, v); }catch(e){}
  }
  function nativeRemove(k){
    try{ if(usable && native.removeItem) native.removeItem(k); }catch(e){}
  }
  function nativeClear(){
    try{ if(usable && native.clear) native.clear(); }catch(e){}
  }
  function nativeKey(i){
    try{ return usable && native.key ? native.key(i) : null; }catch(e){ return null; }
  }
  function nativeLength(){
    try{ return usable && nativeStorage ? (nativeStorage.length || 0) : 0; }catch(e){ return 0; }
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
      remember(k, v);
      nativeSet(k, v);
    },
    removeItem:function(k){
      k = String(k);
      forget(k);
      nativeRemove(k);
    },
    clear:function(){
      mem = Object.create(null);
      nativeClear();
    },
    key:function(i){
      var keys = Object.keys(mem);
      return keys[i] || nativeKey(i) || null;
    },
    get length(){ return Math.max(Object.keys(mem).length, nativeLength()); }
  };

  var mode = [];
  try{
    Object.defineProperty(window, 'localStorage', {value: shim, configurable:true, enumerable:true});
    mode.push('window-localStorage-shim');
  }catch(e){ mode.push('window-override-failed'); }

  try{
    var proto = window.Storage && window.Storage.prototype;
    if(proto && !proto.__medNykutoPracticePatched){
      var pGet = proto.getItem;
      var pSet = proto.setItem;
      var pRemove = proto.removeItem;
      var pClear = proto.clear;
      var pKey = proto.key;
      proto.getItem = function(k){
        k = String(k);
        if(hasOwn(k)) return mem[k];
        try{ return pGet ? pGet.call(this, k) : null; }catch(e){ return null; }
      };
      proto.setItem = function(k,v){
        k = String(k); v = String(v);
        remember(k, v);
        try{ if(pSet) return pSet.call(this, k, v); }catch(e){}
      };
      proto.removeItem = function(k){
        k = String(k);
        forget(k);
        try{ if(pRemove) return pRemove.call(this, k); }catch(e){}
      };
      proto.clear = function(){
        mem = Object.create(null);
        try{ if(pClear) return pClear.call(this); }catch(e){}
      };
      proto.key = function(i){
        var keys = Object.keys(mem);
        if(keys[i]) return keys[i];
        try{ return pKey ? pKey.call(this, i) : null; }catch(e){ return null; }
      };
      try{ Object.defineProperty(proto, '__medNykutoPracticePatched', {value:true, configurable:true}); }catch(e){}
      mode.push('storage-prototype-patched');
    }
  }catch(e){ mode.push('prototype-patch-failed'); }

  window[FLAG] = {version:'v365', nativeUsable:usable, mode:mode.join('+')};
})();
