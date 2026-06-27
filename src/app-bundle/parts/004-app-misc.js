  const allModules = courses.flatMap(course => (course.modules || []).map(module => ({...module, courseId:course.id, courseTitle:course.title, courseFolder:course.folder})));
