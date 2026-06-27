  function editorialCleanText(str=''){
    return String(str || '')
      .replace(/\bEl dato clave del caso se relaciona con\s*/gi,'')
      .replace(/\bO dado-chave do caso se relaciona com\s*/gi,'')
      .replace(/\bLa donnée clé du cas se relie à\s*/gi,'')
      .replace(/\bEn formato de examen,\s*/gi,'')
      .replace(/\bA partir del caso,?\s*/gi,'')
      .replace(/\bDesde el punto de vista\s+(fisiológico|clínico),?\s*/gi,'')
      .replace(/\bCon respecto a\s*/gi,'')
      .replace(/\bmarque la alternativa correcta\s*/gi,'seleccione la opción correcta ')
      .replace(/\s+/g,' ')
      .trim();
  }
