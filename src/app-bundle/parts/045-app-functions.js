  function applyEditorialPhrases(out, l){
    const list = EDITORIAL_PHRASE_MAP[l] || [];
    list.forEach(pair => { try { out = out.split(pair[0]).join(pair[1]); } catch(e){} });
    return out;
  }
